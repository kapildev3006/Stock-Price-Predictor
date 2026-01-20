import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    AlertCircle,
    Loader2,
    ShoppingCart,
    DollarSign,
} from "lucide-react";
import { CandlestickChart } from "./SimpleCandlestickChart";
import type { ShareDetails } from "@shared/bot";

interface ShareDetailsDialogProps {
    symbol: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTrade?: (symbol: string, action: "BUY" | "SELL") => void;
}

export function ShareDetailsDialog({
    symbol,
    open,
    onOpenChange,
    onTrade,
}: ShareDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shareDetails, setShareDetails] = useState<ShareDetails | null>(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1d");

    useEffect(() => {
        if (open && symbol) {
            fetchShareDetails();
        }
    }, [open, symbol]);

    const fetchShareDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/bot/share-details/${symbol}`);
            const data = await response.json();

            if (data.success) {
                setShareDetails(data.data);
            } else {
                setError(data.error || "Failed to load share details");
            }
        } catch (err) {
            setError("Network error. Please try again.");
            console.error("Error fetching share details:", err);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend: string) => {
        if (trend === "BULLISH")
            return <TrendingUp className="h-5 w-5 text-green-500" />;
        if (trend === "BEARISH")
            return <TrendingDown className="h-5 w-5 text-red-500" />;
        return <Activity className="h-5 w-5 text-gray-500" />;
    };

    const getTrendColor = (trend: string) => {
        if (trend === "BULLISH") return "text-green-600 bg-green-100";
        if (trend === "BEARISH") return "text-red-600 bg-red-100";
        return "text-gray-600 bg-gray-100";
    };

    const getRecommendationColor = (action: string) => {
        if (action === "BUY") return "bg-green-600 hover:bg-green-700";
        if (action === "SELL") return "bg-red-600 hover:bg-red-700";
        return "bg-gray-600 hover:bg-gray-700";
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(price);
    };

    const formatPercent = (percent: number) => {
        const sign = percent >= 0 ? "+" : "";
        return `${sign}${percent.toFixed(2)}%`;
    };

    const currentTimeframeData = shareDetails?.historicalData.find(
        (hd) => hd.timeframe === selectedTimeframe
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] !flex !flex-col !gap-0 p-0 overflow-hidden">
                <div className="px-6 py-4 border-b flex-shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            {symbol}
                            {shareDetails && (
                                <Badge className={getTrendColor(shareDetails.analysis.trend)}>
                                    {shareDetails.analysis.trend}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Comprehensive technical analysis and market data
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Loading share details...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {!loading && !error && shareDetails && (
                        <div className="space-y-6">
                            {/* Price Header */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">
                                            Current Price
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {formatPrice(shareDetails.marketData.price)}
                                        </div>
                                        <div
                                            className={`text-sm ${shareDetails.marketData.priceChangePercent24h >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {formatPercent(
                                                shareDetails.marketData.priceChangePercent24h
                                            )}{" "}
                                            (24h)
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">
                                            24h Range
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm">
                                            <div>Low: {formatPrice(shareDetails.marketData.low24h)}</div>
                                            <div>
                                                High: {formatPrice(shareDetails.marketData.high24h)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">
                                            24h Volume
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-lg font-semibold">
                                            {shareDetails.marketData.volume.toLocaleString()}
                                        </div>
                                        <Badge variant="outline" className="mt-1">
                                            {shareDetails.analysis.volatility} Volatility
                                        </Badge>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Chart Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Price Chart
                                    </h3>
                                    <div className="flex gap-2">
                                        {["1h", "4h", "1d", "1w"].map((tf) => (
                                            <Button
                                                key={tf}
                                                size="sm"
                                                variant={selectedTimeframe === tf ? "default" : "outline"}
                                                onClick={() => setSelectedTimeframe(tf)}
                                            >
                                                {tf.toUpperCase()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {currentTimeframeData && (
                                    <div className="border rounded-lg p-4 bg-card">
                                        <CandlestickChart
                                            data={currentTimeframeData.prices}
                                            symbol={symbol}
                                            supportLevels={shareDetails.analysis.supportLevels}
                                            resistanceLevels={shareDetails.analysis.resistanceLevels}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Technical Analysis */}
                            <Tabs defaultValue="indicators" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
                                    <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                                </TabsList>

                                <TabsContent value="indicators" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* RSI */}
                                        {shareDetails.indicators.rsi && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">
                                                        RSI (Relative Strength Index)
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">
                                                        {shareDetails.indicators.rsi.toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {shareDetails.indicators.rsi < 30
                                                            ? "Oversold"
                                                            : shareDetails.indicators.rsi > 70
                                                                ? "Overbought"
                                                                : "Neutral"}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* MACD */}
                                        {shareDetails.indicators.macd && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">MACD</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-1 text-sm">
                                                        <div>
                                                            MACD: {shareDetails.indicators.macd.macd.toFixed(4)}
                                                        </div>
                                                        <div>
                                                            Signal:{" "}
                                                            {shareDetails.indicators.macd.signal.toFixed(4)}
                                                        </div>
                                                        <div
                                                            className={
                                                                shareDetails.indicators.macd.histogram >= 0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }
                                                        >
                                                            Histogram:{" "}
                                                            {shareDetails.indicators.macd.histogram.toFixed(4)}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* EMA */}
                                        {shareDetails.indicators.ema && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">EMA</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-1 text-sm">
                                                        <div>
                                                            EMA 12: {formatPrice(shareDetails.indicators.ema.ema12)}
                                                        </div>
                                                        <div>
                                                            EMA 26: {formatPrice(shareDetails.indicators.ema.ema26)}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {shareDetails.indicators.ema.ema12 >
                                                                shareDetails.indicators.ema.ema26
                                                                ? "Golden Cross (Bullish)"
                                                                : "Death Cross (Bearish)"}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Bollinger Bands */}
                                        {shareDetails.indicators.bollingerBands && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">Bollinger Bands</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-1 text-sm">
                                                        <div>
                                                            Upper:{" "}
                                                            {formatPrice(
                                                                shareDetails.indicators.bollingerBands.upper
                                                            )}
                                                        </div>
                                                        <div>
                                                            Middle:{" "}
                                                            {formatPrice(
                                                                shareDetails.indicators.bollingerBands.middle
                                                            )}
                                                        </div>
                                                        <div>
                                                            Lower:{" "}
                                                            {formatPrice(
                                                                shareDetails.indicators.bollingerBands.lower
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Support & Resistance */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm text-green-600">
                                                    Support Levels
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {shareDetails.analysis.supportLevels.length > 0 ? (
                                                    <ul className="space-y-1">
                                                        {shareDetails.analysis.supportLevels.map((level, i) => (
                                                            <li key={i} className="text-sm">
                                                                {formatPrice(level)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No significant support levels detected
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm text-red-600">
                                                    Resistance Levels
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {shareDetails.analysis.resistanceLevels.length > 0 ? (
                                                    <ul className="space-y-1">
                                                        {shareDetails.analysis.resistanceLevels.map(
                                                            (level, i) => (
                                                                <li key={i} className="text-sm">
                                                                    {formatPrice(level)}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No significant resistance levels detected
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="analysis" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                {getTrendIcon(shareDetails.analysis.trend)}
                                                AI Recommendation
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Recommendation
                                                    </div>
                                                    <div className="text-2xl font-bold">
                                                        {shareDetails.analysis.recommendation}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Confidence
                                                    </div>
                                                    <div className="text-2xl font-bold">
                                                        {shareDetails.analysis.confidence}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Trend Strength
                                                    </div>
                                                    <div className="text-2xl font-bold">
                                                        {shareDetails.analysis.trendStrength.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div>
                                                <div className="text-sm font-semibold mb-2">
                                                    Analysis Summary
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {shareDetails.analysis.reasoning}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>

                {/* Action Buttons - Fixed at bottom */}
                {!loading && !error && shareDetails && onTrade && (
                    <div className="px-6 py-4 border-t bg-background flex-shrink-0">
                        <div className="flex gap-3 justify-end">
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                            <Button
                                size="lg"
                                className={getRecommendationColor(
                                    shareDetails.analysis.recommendation
                                )}
                                onClick={() => {
                                    onTrade(symbol, shareDetails.analysis.recommendation as "BUY" | "SELL");
                                    onOpenChange(false);
                                }}
                            >
                                {shareDetails.analysis.recommendation === "BUY" ? (
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                ) : (
                                    <DollarSign className="mr-2 h-4 w-4" />
                                )}
                                {shareDetails.analysis.recommendation} {symbol}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
