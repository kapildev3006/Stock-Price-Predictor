import React, { useState } from "react";
import { BacktestConfig } from "@/components/backtest/BacktestConfig";
import { BacktestResults } from "@/components/backtest/BacktestResults";
import { BotStrategyConfig } from "../../shared/bot";
import { useToast } from "@/components/ui/use-toast";

export default function BacktestPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const handleRunBacktest = async (
        config: BotStrategyConfig,
        dateRange: { start: string; end: string },
        initialCapital: number
    ) => {
        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/backtest/run", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    config,
                    dateRange,
                    initialCapital,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to run backtest");
            }

            setResult(data.result);
            toast({
                title: "Backtest Complete",
                description: `Processed ${data.result.metrics.totalTrades} trades.`,
            });
        } catch (error: any) {
            console.error("Backtest error:", error);
            toast({
                title: "Backtest Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Strategy Backtesting</h1>
                <p className="text-muted-foreground">
                    Simulate trading strategies against historical data to verify performance before risking real capital.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-1">
                    <BacktestConfig onRunBacktest={handleRunBacktest} isLoading={isLoading} />
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-2">
                    {result ? (
                        <BacktestResults result={result} />
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-12 text-muted-foreground bg-muted/10">
                            <div className="text-center">
                                <p className="text-lg font-medium">No Backtest Results</p>
                                <p className="text-sm">Configure and run a backtest to see performance metrics.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
