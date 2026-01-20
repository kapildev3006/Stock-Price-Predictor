import { RequestHandler } from "express";
import { connectToDatabase } from "../db/connection";
import {
    calculateIndicators,
    detectSupportResistance,
    calculateTrendStrength,
    classifyVolatility,
} from "../utils/strategyAnalyzer";

/**
 * Fetch market data from Binance
 */
async function fetchMarketData(symbol: string) {
    const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );

    if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        volume: parseFloat(data.volume),
        priceChange24h: parseFloat(data.priceChange),
        priceChangePercent24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
    };
}

/**
 * Fetch historical klines (candlestick) data
 */
async function fetchKlines(
    symbol: string,
    interval: string,
    limit: number = 100
) {
    const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );

    if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((kline: any[]) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
    }));
}

/**
 * Get detailed share analysis
 */
export const getShareDetails: RequestHandler = async (req, res) => {
    try {
        await connectToDatabase();

        const { symbol } = req.params;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: "Symbol is required",
            });
        }

        // Fetch current market data
        const marketData = await fetchMarketData(symbol.toUpperCase());

        // Fetch historical data for multiple timeframes
        const [
            data1h,
            data4h,
            data1d,
            data1w,
        ] = await Promise.all([
            fetchKlines(symbol.toUpperCase(), "1h", 100),
            fetchKlines(symbol.toUpperCase(), "4h", 100),
            fetchKlines(symbol.toUpperCase(), "1d", 90),
            fetchKlines(symbol.toUpperCase(), "1w", 52),
        ]);

        // Calculate closing prices for indicators (using 1h data)
        const closingPrices = data1h.map((d) => d.close);

        // Calculate technical indicators
        const indicators = calculateIndicators(closingPrices, marketData.price);

        // Detect support and resistance
        const supportResistance = detectSupportResistance(closingPrices);

        // Calculate trend strength
        const trendStrength = calculateTrendStrength(closingPrices);

        // Classify volatility
        const volatility = classifyVolatility(
            marketData.priceChangePercent24h,
            marketData.volume
        );

        // Determine overall trend
        let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
        if (indicators.ema && indicators.ema.ema12 > indicators.ema.ema26) {
            trend = "BULLISH";
        } else if (indicators.ema && indicators.ema.ema12 < indicators.ema.ema26) {
            trend = "BEARISH";
        }

        // Generate recommendation
        let recommendation: "BUY" | "SELL" | "HOLD" = "HOLD";
        let confidence = 50;
        let reasoning = "";

        // Multi-factor analysis
        const signals: string[] = [];

        // RSI analysis
        if (indicators.rsi) {
            if (indicators.rsi < 30) {
                signals.push("RSI oversold");
                recommendation = "BUY";
                confidence += 15;
            } else if (indicators.rsi > 70) {
                signals.push("RSI overbought");
                recommendation = "SELL";
                confidence += 15;
            }
        }

        // Trend analysis
        if (trend === "BULLISH" && trendStrength.trend === "STRONG") {
            signals.push("Strong bullish trend");
            if (recommendation !== "SELL") {
                recommendation = "BUY";
                confidence += 20;
            }
        } else if (trend === "BEARISH" && trendStrength.trend === "STRONG") {
            signals.push("Strong bearish trend");
            if (recommendation !== "BUY") {
                recommendation = "SELL";
                confidence += 20;
            }
        }

        // Support/Resistance analysis
        if (supportResistance.support.length > 0) {
            const nearSupport = supportResistance.support.some(
                (s) => Math.abs(marketData.price - s) / marketData.price < 0.02
            );
            if (nearSupport) {
                signals.push("Near support level");
                if (recommendation !== "SELL") {
                    recommendation = "BUY";
                    confidence += 10;
                }
            }
        }

        if (supportResistance.resistance.length > 0) {
            const nearResistance = supportResistance.resistance.some(
                (r) => Math.abs(marketData.price - r) / marketData.price < 0.02
            );
            if (nearResistance) {
                signals.push("Near resistance level");
                if (recommendation !== "BUY") {
                    recommendation = "SELL";
                    confidence += 10;
                }
            }
        }

        // Build reasoning
        reasoning = `${trend} trend detected with ${trendStrength.trend.toLowerCase()} strength. ${signals.join(". ")}. Current price: $${marketData.price.toFixed(2)}. Volatility: ${volatility}.`;

        // Cap confidence
        confidence = Math.min(95, confidence);

        // Build response
        const response = {
            success: true,
            data: {
                symbol: marketData.symbol,
                marketData,
                indicators,
                analysis: {
                    trend,
                    trendStrength: trendStrength.strength,
                    volatility,
                    supportLevels: supportResistance.support,
                    resistanceLevels: supportResistance.resistance,
                    recommendation,
                    confidence,
                    reasoning,
                },
                historicalData: [
                    { timeframe: "1h", prices: data1h },
                    { timeframe: "4h", prices: data4h },
                    { timeframe: "1d", prices: data1d },
                    { timeframe: "1w", prices: data1w },
                ],
            },
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching share details:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch share details",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
