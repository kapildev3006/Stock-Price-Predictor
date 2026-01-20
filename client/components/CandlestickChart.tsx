import { useEffect, useRef, useState, useCallback } from "react";
import { createChart } from "lightweight-charts";
import type { IChartApi, CandlestickData, Time } from "lightweight-charts";
import { KlineResponse, KlineInterval } from "@shared/klines";
import { RefreshCw, TrendingUp, AlertCircle } from "lucide-react";

interface CandlestickChartProps {
  symbol?: string;
  defaultInterval?: KlineInterval;
  height?: number;
}

const INTERVALS: { value: KlineInterval; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1d" },
];

export default function CandlestickChart({ 
  symbol = "BTCUSDT", 
  defaultInterval = "5m",
  height = 400 
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  
  const [interval, setInterval] = useState<KlineInterval>(defaultInterval);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch kline data from API
  const fetchKlineData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const response = await fetch(
        `/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch kline data: ${response.statusText}`);
      }
      
      const data: KlineResponse = await response.json();
      
      // Convert to lightweight-charts format
      const candlestickData: CandlestickData[] = data.data.map((kline) => ({
        time: (kline.time / 1000) as Time,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
      }));
      
      // Update chart
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(candlestickData);
      }
      
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching kline data:", err);
      setError(err instanceof Error ? err.message : "Failed to load chart data");
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [symbol, interval]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Fetch initial data
    fetchKlineData();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, interval, height, fetchKlineData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!loading && !error) {
        fetchKlineData();
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [loading, error, fetchKlineData]);

  // Handle interval change
  const handleIntervalChange = (newInterval: KlineInterval) => {
    setInterval(newInterval);
    setLoading(true);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchKlineData();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {symbol.replace("USDT", "")} / USDT
            </h3>
          </div>
          {lastUpdate && !loading && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Interval Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {INTERVALS.map((int) => (
              <button
                key={int.value}
                onClick={() => handleIntervalChange(int.value)}
                className={`h-7 px-3 text-xs rounded transition ${
                  interval === int.value
                    ? "bg-background shadow-sm font-medium"
                    : "hover:bg-background/50"
                }`}
              >
                {int.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 border border-border rounded-lg hover:bg-muted transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-lg animate-pulse">
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-[400px] gap-3 bg-muted/20 rounded-lg">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div className="text-center">
              <p className="font-medium text-destructive">Failed to load chart</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div
          ref={chartContainerRef}
          className={`rounded-lg ${(loading || error) ? "hidden" : ""}`}
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Interval: {interval}</span>
          <span>•</span>
          <span>Auto-refresh: 30s</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span>Up</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <span>Down</span>
          </div>
        </div>
      </div>
    </div>
  );
}
