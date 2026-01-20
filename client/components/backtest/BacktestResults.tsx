import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";

interface Trade {
    entryTime: string;
    exitTime?: string;
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
}

interface BacktestResultsProps {
    result: {
        metrics: BacktestMetrics;
        trades: Trade[];
        equityCurve: { time: string; balance: number }[];
    };
}

export function BacktestResults({ result }: BacktestResultsProps) {
    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (chartContainerRef.current && result.equityCurve.length > 0) {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" },
                    textColor: "#d1d5db",
                },
                width: chartContainerRef.current.clientWidth,
                height: 300,
                grid: {
                    vertLines: { color: "rgba(42, 46, 57, 0.5)" },
                    horzLines: { color: "rgba(42, 46, 57, 0.5)" },
                },
            });

            const areaSeries = chart.addSeries(AreaSeries, {
                lineColor: "#22c55e",
                topColor: "#22c55e",
                bottomColor: "rgba(34, 197, 94, 0.1)",
            });

            const data = result.equityCurve.map((point) => ({
                time: point.time.split("T")[0],
                value: point.balance,
            }));

            areaSeries.setData(data);
            chart.timeScale().fitContent();

            const handleResize = () => {
                if (chartContainerRef.current) {
                    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            };

            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
                chart.remove();
            };
        }
    }, [result]);

    return (
        <div className="space-y-6">
            {/* Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Net Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${result.metrics.netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                            ${result.metrics.netProfit.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Win Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {result.metrics.winRate.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {result.metrics.winningTrades}W / {result.metrics.losingTrades}L
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Max Drawdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {result.metrics.maxDrawdown.toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Profit Factor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {result.metrics.profitFactor.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Equity Curve Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                    <div ref={chartContainerRef} className="w-full h-[300px]" />
                </CardContent>
            </Card>

            {/* Trade List */}
            <Card>
                <CardHeader>
                    <CardTitle>Trade History ({result.trades.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Entry Time</TableHead>
                                    <TableHead>Entry Price</TableHead>
                                    <TableHead>Exit Time</TableHead>
                                    <TableHead>Exit Price</TableHead>
                                    <TableHead>Profit</TableHead>
                                    <TableHead>Reason</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.trades.map((trade, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <span className={`font-bold ${trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                                {trade.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(trade.entryTime).toLocaleString()}</TableCell>
                                        <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                                        <TableCell>{trade.exitTime ? new Date(trade.exitTime).toLocaleString() : '-'}</TableCell>
                                        <TableCell>{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}</TableCell>
                                        <TableCell>
                                            {trade.profit ? (
                                                <span className={trade.profit >= 0 ? "text-green-500" : "text-red-500"}>
                                                    ${trade.profit.toFixed(2)} ({trade.profitPercent?.toFixed(2)}%)
                                                </span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={trade.reason}>
                                            {trade.reason}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
