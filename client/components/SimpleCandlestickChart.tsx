import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import type { IChartApi, CandlestickData, Time } from "lightweight-charts";

interface SimpleCandlestickChartProps {
    data: Array<{
        timestamp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }>;
    symbol: string;
    supportLevels?: number[];
    resistanceLevels?: number[];
    height?: number;
}

export function CandlestickChart({
    data,
    symbol,
    supportLevels = [],
    resistanceLevels = [],
    height = 400,
}: SimpleCandlestickChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: height,
            layout: {
                background: { color: "transparent" },
                textColor: "#9CA3AF",
            },
            grid: {
                vertLines: { color: "#1F2937" },
                horzLines: { color: "#1F2937" },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: "#374151",
            },
            timeScale: {
                borderColor: "#374151",
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Create candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: "#10B981",
            downColor: "#EF4444",
            borderUpColor: "#10B981",
            borderDownColor: "#EF4444",
            wickUpColor: "#10B981",
            wickDownColor: "#EF4444",
        });

        // Convert data to candlestick format
        const candlestickData: CandlestickData[] = data.map((d) => ({
            time: (d.timestamp / 1000) as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));

        candlestickSeries.setData(candlestickData);

        // Add support levels as price lines
        supportLevels.forEach((level, index) => {
            candlestickSeries.createPriceLine({
                price: level,
                color: "#10B981",
                lineWidth: 2,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: `S${index + 1}`,
            });
        });

        // Add resistance levels as price lines
        resistanceLevels.forEach((level, index) => {
            candlestickSeries.createPriceLine({
                price: level,
                color: "#EF4444",
                lineWidth: 2,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: `R${index + 1}`,
            });
        });

        // Fit content
        chart.timeScale().fitContent();

        chartRef.current = chart;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [data, symbol, supportLevels, resistanceLevels, height]);

    return (
        <div className="w-full">
            <div ref={chartContainerRef} className="rounded-lg" />
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm" />
                    <span>Bullish / Support</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm" />
                    <span>Bearish / Resistance</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-green-500 border-dashed border-b-2" />
                    <span>Support Levels</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-500 border-dashed border-b-2" />
                    <span>Resistance Levels</span>
                </div>
            </div>
        </div>
    );
}
