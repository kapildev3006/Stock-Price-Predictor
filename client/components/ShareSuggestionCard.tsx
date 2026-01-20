import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Eye,
    Play,
    BarChart2,
} from "lucide-react";
import type { BotSuggestion } from "@shared/bot";

interface ShareSuggestionCardProps {
    suggestion: BotSuggestion;
    onViewDetails: (symbol: string) => void;
    onExecute: (symbol: string, action: "BUY" | "SELL" | "HOLD") => void;
}

export function ShareSuggestionCard({
    suggestion,
    onViewDetails,
    onExecute,
}: ShareSuggestionCardProps) {
    const { symbol, action, confidence, reasoning, marketData, indicators } =
        suggestion;

    const getActionBadge = () => {
        const colors = {
            BUY: "bg-green-100 text-green-800 border-green-300",
            SELL: "bg-red-100 text-red-800 border-red-300",
            HOLD: "bg-gray-100 text-gray-800 border-gray-300",
        };

        const icons = {
            BUY: <TrendingUp className="h-3 w-3 mr-1" />,
            SELL: <TrendingDown className="h-3 w-3 mr-1" />,
            HOLD: <Minus className="h-3 w-3 mr-1" />,
        };

        return (
            <Badge
                className={`${colors[action]} flex items-center font-semibold`}
                variant="outline"
            >
                {icons[action]}
                {action}
            </Badge>
        );
    };

    const getConfidenceColor = (conf: number) => {
        if (conf >= 80) return "text-green-600";
        if (conf >= 60) return "text-blue-600";
        if (conf >= 40) return "text-yellow-600";
        return "text-gray-600";
    };

    const getPriceChange = () => {
        const change = marketData.priceChangePercent24h;
        const isPositive = change >= 0;

        return (
            <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                ) : (
                    <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)}%
                </span>
            </div>
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(price);
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 border-2">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">{symbol}</CardTitle>
                        <div className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(marketData.price)}
                        </div>
                    </div>
                    {getActionBadge()}
                </div>
                <div className="flex items-center justify-between mt-2">
                    {getPriceChange()}
                    <span className="text-xs text-muted-foreground">24h</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Confidence Score */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className={`text-sm font-bold ${getConfidenceColor(confidence)}`}>
                            {confidence}%
                        </span>
                    </div>
                    <Progress
                        value={confidence}
                        className="h-2"
                    />
                </div>

                {/* Key Indicators */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {indicators.rsi && (
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-muted-foreground">RSI</span>
                            <span className="font-semibold">{indicators.rsi.toFixed(1)}</span>
                        </div>
                    )}
                    {indicators.ema && (
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-muted-foreground">EMA Trend</span>
                            <span className="font-semibold">
                                {indicators.ema.ema12 > indicators.ema.ema26 ? "📈" : "📉"}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-muted-foreground">Volume</span>
                        <span className="font-semibold">
                            {marketData.volume > 1000000
                                ? `${(marketData.volume / 1000000).toFixed(1)}M`
                                : `${(marketData.volume / 1000).toFixed(1)}K`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-muted-foreground">24h High</span>
                        <span className="font-semibold">
                            ${marketData.high24h.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Reasoning Snippet */}
                <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {reasoning}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewDetails(symbol)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                    </Button>
                    {action !== "HOLD" && (
                        <Button
                            size="sm"
                            className={`flex-1 ${action === "BUY"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                            onClick={() => onExecute(symbol, action)}
                        >
                            <Play className="h-4 w-4 mr-1" />
                            Execute
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
