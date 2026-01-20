import { BotStrategyConfig, StrategyType } from "../../shared/bot";
import { MarketData, TechnicalIndicators } from "../../shared/bot";
import { analyzeStrategy, calculateIndicators } from "./strategyAnalyzer";
import { binanceClient } from "../routes/binance";

interface Trade {
    entryTime: Date;
    exitTime?: Date;
    entryPrice: number;
    exitPrice?: number;
    type: 'BUY' | 'SELL';
    quantity: number;
    profit?: number;
    profitPercent?: number;
    reason: string;
    status: 'OPEN' | 'CLOSED';
}

interface BacktestMetrics {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    netProfit: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
    averageWin: number;
    averageLoss: number;
}

export interface BacktestResultData {
    metrics: BacktestMetrics;
    trades: Trade[];
    equityCurve: { time: Date; balance: number }[];
}

export class Backtester {
    private config: BotStrategyConfig;
    private initialCapital: number;
    private balance: number;
    private positions: Trade[] = [];
    private tradeHistory: Trade[] = [];
    private equityCurve: { time: Date; balance: number }[] = [];
    private commissionRate = 0.001; // 0.1% commission
    private slippage = 0.001; // 0.1% slippage

    constructor(config: BotStrategyConfig, initialCapital: number) {
        this.config = config;
        this.initialCapital = initialCapital;
        this.balance = initialCapital;
    }

    /**
     * Run the backtest simulation
     */
    public async run(startDate: Date, endDate: Date): Promise<BacktestResultData> {
        // 1. Fetch historical data
        const candles = await this.fetchHistoricalData(startDate, endDate);

        if (candles.length < 50) {
            throw new Error("Insufficient historical data for backtesting");
        }

        // 2. Simulate trading
        // We need enough initial data for indicators (e.g. 200 periods for EMA200)
        const warmupPeriod = 50;

        for (let i = warmupPeriod; i < candles.length; i++) {
            const currentCandle = candles[i];
            const historicalSlice = candles.slice(0, i + 1);

            // Construct MarketData object
            const marketData: MarketData = {
                symbol: this.config.coinPair,
                price: currentCandle.close,
                volume: currentCandle.volume,
                priceChange24h: 0, // Approximate or calculate if needed
                priceChangePercent24h: ((currentCandle.close - candles[i - 1].close) / candles[i - 1].close) * 100,
                high24h: currentCandle.high,
                low24h: currentCandle.low,
            };

            // Calculate indicators
            // Note: In a real optimized backtester, we would calculate all indicators at once for the whole series
            // But for re-using existing logic, we calculate per step or pass the series
            // Optimization: calculateIndicators now accepts arrays, so we pass the slice
            // To make it faster, we should probably pre-calculate indicators for the whole range if possible
            // For now, we'll stick to the robust method of passing the slice to ensure it matches live bot logic
            const indicators = calculateIndicators(historicalSlice.map(c => c.close), currentCandle.close);

            // Analyze strategy
            const analysis = analyzeStrategy(this.config, marketData, indicators);

            // Execute trades based on analysis
            this.processSignal(analysis, currentCandle.close, currentCandle.closeTime);

            // Update equity curve
            this.updateEquityCurve(currentCandle.closeTime);
        }

        // Close any open positions at the end
        this.closeAllPositions(candles[candles.length - 1].close, candles[candles.length - 1].closeTime);

        // 3. Calculate metrics
        const metrics = this.calculateMetrics();

        return {
            metrics,
            trades: this.tradeHistory,
            equityCurve: this.equityCurve
        };
    }

    private async fetchHistoricalData(start: Date, end: Date): Promise<any[]> {
        // Binance API limit is usually 1000 candles per request
        // We need to implement pagination for longer timeframes
        // For MVP, we'll fetch the max allowed or implement simple pagination

        // Convert dates to timestamps
        const startTime = start.getTime();
        const endTime = end.getTime();

        // Determine interval based on duration to avoid too many requests
        // < 1 day: 1m or 5m
        // < 1 week: 15m or 1h
        // > 1 week: 4h or 1d
        // For now, hardcode to 1h for speed, or make it configurable
        const interval = '1h';

        try {
            // This is a simplified fetch. In production, we'd loop to get all data between start and end
            const candles = await binanceClient.candles({
                symbol: this.config.coinPair,
                interval: interval,
                startTime: startTime,
                endTime: endTime,
                limit: 1000 // Max limit
            });

            return candles.map(c => ({
                openTime: c.openTime,
                open: parseFloat(c.open),
                high: parseFloat(c.high),
                low: parseFloat(c.low),
                close: parseFloat(c.close),
                volume: parseFloat(c.volume),
                closeTime: c.closeTime
            }));
        } catch (error) {
            console.error("Error fetching historical data:", error);
            throw error;
        }
    }

    private processSignal(analysis: any, price: number, time: number) {
        const timestamp = new Date(time);

        // Check for exit signals on open positions
        for (let i = this.positions.length - 1; i >= 0; i--) {
            const position = this.positions[i];

            // Logic to close position
            // 1. Strategy says SELL (and we are long)
            // 2. Stop Loss hit
            // 3. Take Profit hit

            let shouldClose = false;
            let closeReason = "";

            if (position.type === 'BUY') {
                if (analysis.recommendation === 'SELL') {
                    shouldClose = true;
                    closeReason = "Strategy Signal";
                }
                // Check Stop Loss (if we had one stored, for now simple fixed %)
                // In Phase 2 we added stopLoss to analysis, we could store it in the trade
                else if (analysis.stopLoss && price <= analysis.stopLoss) {
                    shouldClose = true;
                    closeReason = "Stop Loss";
                }
            }

            if (shouldClose) {
                this.closePosition(position, price, timestamp, closeReason);
                this.positions.splice(i, 1);
            }
        }

        // Check for entry signals
        if (this.positions.length === 0 && analysis.recommendation === 'BUY' && analysis.confidence > 60) {
            // Apply slippage
            const entryPrice = price * (1 + this.slippage);

            // Calculate position size
            // Use the recommended position size from analysis if available, or default to % of balance
            let positionSize = analysis.positionSize || this.balance * 0.1; // Default 10%
            positionSize = Math.min(positionSize, this.balance); // Can't spend more than we have

            if (positionSize > 10) { // Minimum trade size
                const quantity = positionSize / entryPrice;
                const cost = positionSize; // quantity * entryPrice

                // Deduct cost and commission
                this.balance -= cost * (1 + this.commissionRate);

                const trade: Trade = {
                    entryTime: timestamp,
                    entryPrice: entryPrice,
                    type: 'BUY',
                    quantity: quantity,
                    reason: analysis.reasoning,
                    status: 'OPEN'
                };

                this.positions.push(trade);
            }
        }
    }

    private closePosition(position: Trade, price: number, time: Date, reason: string) {
        // Apply slippage
        const exitPrice = price * (1 - this.slippage);
        const revenue = position.quantity * exitPrice;

        // Deduct commission
        const netRevenue = revenue * (1 - this.commissionRate);

        // Update balance
        this.balance += netRevenue;

        // Update trade details
        position.exitTime = time;
        position.exitPrice = exitPrice;
        position.status = 'CLOSED';
        position.profit = netRevenue - (position.quantity * position.entryPrice * (1 + this.commissionRate));
        position.profitPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;
        position.reason = `${position.reason} -> Closed: ${reason}`;

        this.tradeHistory.push(position);
    }

    private closeAllPositions(price: number, time: number) {
        const timestamp = new Date(time);
        for (const position of this.positions) {
            this.closePosition(position, price, timestamp, "End of Backtest");
        }
        this.positions = [];
    }

    private updateEquityCurve(time: number) {
        // Equity = Cash + Unrealized Value of Positions
        let equity = this.balance;
        // Note: To be perfectly accurate we need current price for open positions
        // For simplicity in this loop, we update equity after processing signals (so we use current candle close)
        // But we don't have easy access to current price here without passing it or storing it
        // For now, we'll just track realized balance + approximate open position value
        // This is a slight approximation

        this.equityCurve.push({
            time: new Date(time),
            balance: equity // TODO: Add unrealized PnL for better accuracy
        });
    }

    private calculateMetrics(): BacktestMetrics {
        const closedTrades = this.tradeHistory.filter(t => t.status === 'CLOSED');
        const winningTrades = closedTrades.filter(t => (t.profit || 0) > 0);
        const losingTrades = closedTrades.filter(t => (t.profit || 0) <= 0);

        const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
        const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0));

        const netProfit = totalProfit - totalLoss;
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;

        // Max Drawdown
        let maxDrawdown = 0;
        let peak = -Infinity;

        for (const point of this.equityCurve) {
            if (point.balance > peak) {
                peak = point.balance;
            }
            const drawdown = (peak - point.balance) / peak * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        // Sharpe Ratio (simplified annualized)
        // Calculate daily returns
        // ... (Simplified implementation for now)
        const sharpeRatio = 0; // Placeholder

        return {
            totalTrades: closedTrades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate,
            netProfit,
            profitFactor,
            maxDrawdown,
            sharpeRatio,
            averageWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
            averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0
        };
    }
}
