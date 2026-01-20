import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotStrategyConfig, StrategyType } from "../../../shared/bot";
import { Loader2 } from "lucide-react";

interface BacktestConfigProps {
    onRunBacktest: (config: BotStrategyConfig, dateRange: { start: string; end: string }, initialCapital: number) => void;
    isLoading: boolean;
}

export function BacktestConfig({ onRunBacktest, isLoading }: BacktestConfigProps) {
    const [strategyType, setStrategyType] = useState<StrategyType>("RSI");
    const [coinPair, setCoinPair] = useState("BTCUSDT");
    const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
    const [startDate, setStartDate] = useState("2023-01-01");
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [initialCapital, setInitialCapital] = useState(10000);

    const handleRun = () => {
        const config: BotStrategyConfig = {
            coinPair,
            strategyType,
            riskLevel,
            investmentAmount: initialCapital, // Not used for backtest logic but required by type
            mode: "PAPER"
        };

        onRunBacktest(config, { start: startDate, end: endDate }, initialCapital);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Backtest Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strategy Selection */}
                    <div className="space-y-2">
                        <Label>Strategy</Label>
                        <Select
                            value={strategyType}
                            onValueChange={(value) => setStrategyType(value as StrategyType)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Strategy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RSI">RSI (Relative Strength Index)</SelectItem>
                                <SelectItem value="MACD">MACD (Moving Average Convergence Divergence)</SelectItem>
                                <SelectItem value="BOLLINGER_BANDS">Bollinger Bands</SelectItem>
                                <SelectItem value="EMA_CROSSOVER">EMA Crossover</SelectItem>
                                <SelectItem value="MOVING_AVERAGE">Simple Moving Average</SelectItem>
                                <SelectItem value="VOLUME_SPIKE">Volume Spike</SelectItem>
                                <SelectItem value="ICHIMOKU">Ichimoku Cloud</SelectItem>
                                <SelectItem value="FIBONACCI">Fibonacci Retracement</SelectItem>
                                <SelectItem value="STOCHASTIC">Stochastic Oscillator</SelectItem>
                                <SelectItem value="ADX">ADX Trend Strength</SelectItem>
                                <SelectItem value="PRICE_ACTION">Price Action Patterns</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Coin Pair */}
                    <div className="space-y-2">
                        <Label>Coin Pair</Label>
                        <Select value={coinPair} onValueChange={setCoinPair}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Coin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BTCUSDT">Bitcoin (BTC/USDT)</SelectItem>
                                <SelectItem value="ETHUSDT">Ethereum (ETH/USDT)</SelectItem>
                                <SelectItem value="SOLUSDT">Solana (SOL/USDT)</SelectItem>
                                <SelectItem value="BNBUSDT">Binance Coin (BNB/USDT)</SelectItem>
                                <SelectItem value="ADAUSDT">Cardano (ADA/USDT)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range - Start */}
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    {/* Date Range - End */}
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {/* Initial Capital */}
                    <div className="space-y-2">
                        <Label>Initial Capital (USDT)</Label>
                        <Input
                            type="number"
                            value={initialCapital}
                            onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
                        />
                    </div>

                    {/* Risk Level */}
                    <div className="space-y-2">
                        <Label>Risk Level</Label>
                        <Select
                            value={riskLevel}
                            onValueChange={(value) => setRiskLevel(value as "LOW" | "MEDIUM" | "HIGH")}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low (Conservative)</SelectItem>
                                <SelectItem value="MEDIUM">Medium (Balanced)</SelectItem>
                                <SelectItem value="HIGH">High (Aggressive)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    className="w-full mt-4"
                    onClick={handleRun}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Backtest...
                        </>
                    ) : (
                        "Run Backtest"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
