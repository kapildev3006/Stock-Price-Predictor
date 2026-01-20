import { useState, useEffect } from "react";
import { Bot, TrendingUp, AlertCircle, CheckCircle, X, Play, Clock, BarChart3, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShareDetailsDialog } from "@/components/ShareDetailsDialog";
import { ShareSuggestionCard } from "@/components/ShareSuggestionCard";
import type {
  BotStrategyConfig,
  BotRecommendation,
  BotSuggestion,
  BotScreeningRequest,
  StrategyType,
  RiskLevel,
  TradingMode
} from "@shared/bot";
import BacktestPage from "./Backtest";
import StrategyComboBuilder from "@/components/strategy/StrategyComboBuilder";

export default function TradingBot() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState<BotRecommendation | null>(null);
  const [history, setHistory] = useState<BotRecommendation[]>([]);
  const [historyStats, setHistoryStats] = useState<any>(null);

  // Strategy screening states
  const [suggestions, setSuggestions] = useState<BotSuggestion[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [showShareDetails, setShowShareDetails] = useState(false);

  const [config, setConfig] = useState<BotStrategyConfig>({
    coinPair: "BTCUSDT",
    strategyType: "RSI" as StrategyType,
    riskLevel: "MEDIUM" as RiskLevel,
    investmentAmount: 1000,
    mode: "PAPER" as TradingMode,
  });

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/bot/history?limit=10");
      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
        setHistoryStats(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleGenerateRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bot/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      let recommendationData: BotRecommendation | null = null;
      if (data && data.recommendation) {
        recommendationData = data.recommendation;
      } else if (data && data.success && data.data) { // Assuming data.data might hold the recommendation if success is true
        recommendationData = data.data;
      } else if (data && !data.success && data.error) { // Handle explicit error from server
        toast({
          title: "Error",
          description: data.error || "Failed to generate recommendation",
          variant: "destructive",
        });
        return; // Exit if there's an error
      } else {
        // fallback if server returns recommendation directly without wrapper or other known structure
        recommendationData = data;
      }

      if (recommendationData) {
        setCurrentRecommendation(recommendationData);
        setShowRecommendation(true);

        toast({
          title: "Recommendation Generated",
          description: `${recommendationData?.recommendation} signal with ${recommendationData?.confidence}% confidence`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate recommendation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTrade = async () => {
    if (!currentRecommendation) return;

    try {
      const endpoint =
        config.mode === "PAPER"
          ? `/api/bot/paper-execute/${currentRecommendation._id}`
          : `/api/bot/execute/${currentRecommendation._id}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          executionPrice: currentRecommendation.marketData.price,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Trade Executed",
          description: `${config.mode} trade executed successfully`,
        });
        setShowRecommendation(false);
        fetchHistory(); // Refresh history
      } else {
        toast({
          title: "Execution Failed",
          description: data.error || "Failed to execute trade",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to execute trade",
        variant: "destructive",
      });
    }
  };

  const handleScreenStrategies = async () => {
    setScreeningLoading(true);
    try {
      const screeningRequest: BotScreeningRequest = {
        strategyType: config.strategyType,
        riskLevel: config.riskLevel,
        mode: config.mode,
        investmentAmount: config.investmentAmount,
        symbols: ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"],
        limit: 10,
      };

      const response = await fetch("/api/bot/screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(screeningRequest),
      });

      const data = await response.json();

      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
        toast({
          title: "Screening Complete",
          description: `Found ${data.suggestions.length} opportunities`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to screen strategies",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setScreeningLoading(false);
    }
  };

  const handleViewDetails = (symbol: string) => {
    setSelectedSymbol(symbol);
    setShowShareDetails(true);
  };

  const handleExecuteFromSuggestion = async (symbol: string, action: "BUY" | "SELL" | "HOLD") => {
    if (action === "HOLD") {
      toast({
        title: "No Action",
        description: "HOLD recommendation - no trade executed",
      });
      return;
    }

    toast({
      title: "Trade Submitted",
      description: `${config.mode} ${action} order for ${symbol} submitted`,
    });
  };

  const getRecommendationIcon = (action: string) => {
    switch (action) {
      case "BUY":
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case "SELL":
        return <TrendingUp className="w-6 h-6 text-red-500 rotate-180" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "bg-green-500/10 border-green-500/30 text-green-600";
      case "SELL":
        return "bg-red-500/10 border-red-500/30 text-red-600";
      default:
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return "text-green-600";
    if (confidence >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Trading Bot</h1>
            <p className="text-muted-foreground">
              AI-powered strategy recommendations and automated execution
            </p>
          </div>
        </div>

        <Tabs defaultValue="configure" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="configure">Configure Strategy</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
            <TabsTrigger value="combo">Strategy Combo</TabsTrigger>
            <TabsTrigger value="suggestions">
              <Sparkles className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="history">History & Analytics</TabsTrigger>
          </TabsList>

          {/* Configure Tab */}
          <TabsContent value="configure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Configuration</CardTitle>
                <CardDescription>
                  Set your trading parameters and let AI analyze the market
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Coin Pair */}
                  <div className="space-y-2">
                    <Label htmlFor="coinPair">Coin Pair</Label>
                    <Input
                      id="coinPair"
                      value={config.coinPair}
                      onChange={(e) =>
                        setConfig({ ...config, coinPair: e.target.value.toUpperCase() })
                      }
                      placeholder="BTCUSDT"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the trading pair (e.g., BTCUSDT, ETHUSDT)
                    </p>
                  </div>

                  {/* Strategy Type */}
                  <div className="space-y-2">
                    <Label htmlFor="strategy">Strategy Type</Label>
                    <Select
                      value={config.strategyType}
                      onValueChange={(value: StrategyType) =>
                        setConfig({ ...config, strategyType: value })
                      }
                    >
                      <SelectTrigger id="strategy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RSI">RSI (Relative Strength Index)</SelectItem>
                        <SelectItem value="MACD">MACD (Moving Average Convergence)</SelectItem>
                        <SelectItem value="EMA_CROSSOVER">EMA Crossover</SelectItem>
                        <SelectItem value="MOVING_AVERAGE">Moving Average</SelectItem>
                        <SelectItem value="BOLLINGER_BANDS">Bollinger Bands</SelectItem>
                        <SelectItem value="VOLUME_SPIKE">Volume Spike 📊</SelectItem>
                        <SelectItem value="STOCHASTIC">Stochastic Oscillator</SelectItem>
                        <SelectItem value="ADX">ADX Trend Strength</SelectItem>
                        <SelectItem value="ICHIMOKU">Ichimoku Cloud ☁️</SelectItem>
                        <SelectItem value="FIBONACCI">Fibonacci Retracement</SelectItem>
                        <SelectItem value="PRICE_ACTION">Price Action Patterns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Risk Level */}
                  <div className="space-y-2">
                    <Label htmlFor="risk">Risk Level</Label>
                    <Select
                      value={config.riskLevel}
                      onValueChange={(value: RiskLevel) =>
                        setConfig({ ...config, riskLevel: value })
                      }
                    >
                      <SelectTrigger id="risk">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low (Conservative)</SelectItem>
                        <SelectItem value="MEDIUM">Medium (Balanced)</SelectItem>
                        <SelectItem value="HIGH">High (Aggressive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Investment Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Investment Amount (USDT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={config.investmentAmount}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          investmentAmount: parseFloat(e.target.value),
                        })
                      }
                      min="10"
                    />
                  </div>

                  {/* Trading Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="mode">Trading Mode</Label>
                    <Select
                      value={config.mode}
                      onValueChange={(value: TradingMode) =>
                        setConfig({ ...config, mode: value })
                      }
                    >
                      <SelectTrigger id="mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAPER">Paper Trading (Simulation)</SelectItem>
                        <SelectItem value="LIVE">Live Trading</SelectItem>
                      </SelectContent>
                    </Select>
                    {config.mode === "LIVE" && (
                      <p className="text-xs text-yellow-600">
                        ⚠️ Live mode will execute real trades with real funds
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateRecommendation}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Market...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 mr-2" />
                      Generate AI Recommendation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Strategy Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strategy Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Selected Strategy:</span>{" "}
                    {config.strategyType.replace(/_/g, " ")}
                  </div>
                  <div className="text-muted-foreground">
                    {config.strategyType === "RSI" &&
                      "RSI measures overbought/oversold conditions. Values below 30 suggest buying, above 70 suggest selling."}
                    {config.strategyType === "MACD" &&
                      "MACD shows momentum and trend direction through crossovers between MACD and signal lines."}
                    {config.strategyType === "EMA_CROSSOVER" &&
                      "EMA crossover signals trend changes when short-term EMA crosses long-term EMA."}
                    {config.strategyType === "MOVING_AVERAGE" &&
                      "Moving averages identify trends by comparing price to historical averages."}
                    {config.strategyType === "BOLLINGER_BANDS" &&
                      "Bollinger Bands show volatility and potential reversals at band extremes."}
                    {config.strategyType === "VOLUME_SPIKE" &&
                      "Volume Spike detects unusual trading activity (3x+ average volume) combined with significant price movements to identify breakouts."}
                    {config.strategyType === "STOCHASTIC" &&
                      "Stochastic Oscillator compares closing price to price range over time. Signals at oversold (<20) and overbought (>80) levels."}
                    {config.strategyType === "ADX" &&
                      "ADX measures trend strength regardless of direction. Values above 25 indicate strong trends, below 20 suggest ranging markets."}
                    {config.strategyType === "ICHIMOKU" &&
                      "Ichimoku Cloud provides comprehensive trend analysis using multiple components. Price above cloud signals bullish, below signals bearish."}
                    {config.strategyType === "FIBONACCI" &&
                      "Fibonacci Retracement identifies support and resistance at key levels (38.2%, 50%, 61.8%) during price pullbacks in trends."}
                    {config.strategyType === "PRICE_ACTION" &&
                      "Price Action analyzes raw price movements and patterns without indicators. Focuses on momentum, volume, and price behavior."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backtest Tab */}
          <TabsContent value="backtest">
            <BacktestPage />
          </TabsContent>

          {/* Strategy Combo Tab */}
          <TabsContent value="combo">
            <StrategyComboBuilder />
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Strategy Screening
                </CardTitle>
                <CardDescription>
                  Screen multiple cryptocurrencies using your configured strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Strategy:</span>{" "}
                      {config.strategyType.replace(/_/g, " ")}
                    </div>
                    <div>
                      <span className="font-semibold">Risk Level:</span>{" "}
                      {config.riskLevel}
                    </div>
                    <div>
                      <span className="font-semibold">Investment:</span>{" "}
                      ${config.investmentAmount} USDT
                    </div>
                    <div>
                      <span className="font-semibold">Mode:</span>{" "}
                      <Badge variant={config.mode === "LIVE" ? "destructive" : "secondary"}>
                        {config.mode}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleScreenStrategies}
                  disabled={screeningLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  {screeningLoading ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Screening Markets...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Screen Strategies
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Suggestions Grid */}
            {suggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  AI Recommendations ({suggestions.length})
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((suggestion) => (
                    <ShareSuggestionCard
                      key={suggestion.symbol}
                      suggestion={suggestion}
                      onViewDetails={handleViewDetails}
                      onExecute={handleExecuteFromSuggestion}
                    />
                  ))}
                </div>
              </div>
            )}

            {!screeningLoading && suggestions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No suggestions yet</p>
                  <p className="text-sm">Click "Screen Strategies" to find trading opportunities</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Statistics */}
            {historyStats && (
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{historyStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Signals</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {historyStats.buySignals}
                    </div>
                    <div className="text-sm text-muted-foreground">Buy Signals</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {historyStats.sellSignals}
                    </div>
                    <div className="text-sm text-muted-foreground">Sell Signals</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{historyStats.avgConfidence}%</div>
                    <div className="text-sm text-muted-foreground">Avg Confidence</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* History List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recommendation History
                </CardTitle>
                <CardDescription>Previous AI recommendations and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recommendations yet</p>
                    <p className="text-sm">Generate your first AI recommendation to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((rec) => (
                      <div
                        key={rec._id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              {getRecommendationIcon(rec.recommendation)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {rec.strategyConfig.coinPair}
                                  </span>
                                  <Badge
                                    className={getRecommendationColor(rec.recommendation)}
                                  >
                                    {rec.recommendation}
                                  </Badge>
                                  {rec.executed && (
                                    <Badge variant="outline">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Executed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {rec.strategyConfig.strategyType} • {rec.strategyConfig.riskLevel} Risk •{" "}
                                  {rec.strategyConfig.mode}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm">{rec.reasoning}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Price: ${rec.marketData.price.toFixed(2)}
                              </span>
                              <span className={getConfidenceColor(rec.confidence)}>
                                Confidence: {rec.confidence}%
                              </span>
                              <span>
                                {new Date(rec.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recommendation Dialog */}
      <Dialog open={showRecommendation} onOpenChange={setShowRecommendation}>
        <DialogContent className="max-w-2xl">
          {currentRecommendation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {getRecommendationIcon(currentRecommendation.recommendation)}
                  AI Recommendation: {currentRecommendation.recommendation}{" "}
                  {currentRecommendation.strategyConfig.coinPair}
                </DialogTitle>
                <DialogDescription>
                  Based on {currentRecommendation.strategyConfig.strategyType} strategy analysis
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Confidence Score */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span
                      className={`text-2xl font-bold ${getConfidenceColor(
                        currentRecommendation.confidence
                      )}`}
                    >
                      {currentRecommendation.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                      style={{ width: `${currentRecommendation.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <div className="font-medium mb-2">Analysis</div>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    {currentRecommendation.reasoning}
                  </div>
                </div>

                {/* Market Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                    <div className="text-xl font-bold">
                      ${currentRecommendation.marketData.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">24h Change</div>
                    <div
                      className={`text-xl font-bold ${currentRecommendation.marketData.priceChangePercent24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      {currentRecommendation.marketData.priceChangePercent24h.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Technical Indicators */}
                <div>
                  <div className="font-medium mb-2">Technical Indicators</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {currentRecommendation.indicators.rsi && (
                      <div className="bg-muted rounded p-3">
                        <span className="text-muted-foreground">RSI:</span>{" "}
                        <span className="font-semibold">
                          {currentRecommendation.indicators.rsi.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {currentRecommendation.indicators.macd && (
                      <div className="bg-muted rounded p-3">
                        <span className="text-muted-foreground">MACD:</span>{" "}
                        <span className="font-semibold">
                          {currentRecommendation.indicators.macd.macd.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {currentRecommendation.indicators.ema && (
                      <div className="bg-muted rounded p-3">
                        <span className="text-muted-foreground">EMA12:</span>{" "}
                        <span className="font-semibold">
                          ${currentRecommendation.indicators.ema.ema12.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {currentRecommendation.indicators.sma && (
                      <div className="bg-muted rounded p-3">
                        <span className="text-muted-foreground">SMA20:</span>{" "}
                        <span className="font-semibold">
                          ${currentRecommendation.indicators.sma.sma20.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk Management & Trade Setup */}
                <div>
                  <div className="font-medium mb-2">Trade Setup & Risk Management</div>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    {/* Signal Strength */}
                    {currentRecommendation.signalStrength && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Signal Strength</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className={`h-full ${currentRecommendation.signalStrength > 70 ? 'bg-green-500' : currentRecommendation.signalStrength > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${currentRecommendation.signalStrength}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{currentRecommendation.signalStrength}%</span>
                        </div>
                      </div>
                    )}

                    {/* Stop Loss & Take Profit */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                        <div className="font-mono font-bold text-red-500">
                          ${currentRecommendation.stopLoss?.toFixed(2) || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Take Profit Targets</div>
                        <div className="font-mono font-bold text-green-500 text-sm">
                          {currentRecommendation.takeProfitTargets?.map(tp => `$${tp.toFixed(2)}`).join(', ') || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Risk/Reward & Position Size */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Risk/Reward Ratio</div>
                        <div className="font-bold">
                          {currentRecommendation.riskRewardRatio ? `1:${currentRecommendation.riskRewardRatio.toFixed(2)}` : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Rec. Position Size</div>
                        <div className="font-bold">
                          {currentRecommendation.positionSize ? `$${currentRecommendation.positionSize.toFixed(2)}` : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Divergence Alert */}
                    {currentRecommendation.divergence?.detected && (
                      <div className={`mt-2 p-2 rounded text-xs font-medium flex items-center gap-2 ${currentRecommendation.divergence.type === 'bullish' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                        {currentRecommendation.divergence.type === 'bullish' ? '🚀' : '📉'}
                        {currentRecommendation.divergence.type === 'bullish' ? 'Bullish' : 'Bearish'} Divergence Detected!
                      </div>
                    )}
                  </div>
                </div>

                {/* Investment Details */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Investment Amount:</span>
                    <span className="font-bold">
                      ${currentRecommendation.strategyConfig.investmentAmount.toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">Trading Mode:</span>
                    <Badge variant={currentRecommendation.strategyConfig.mode === "LIVE" ? "destructive" : "secondary"}>
                      {currentRecommendation.strategyConfig.mode}
                    </Badge>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRecommendation(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedSymbol(currentRecommendation.marketData.symbol);
                    setShowShareDetails(true);
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  onClick={handleExecuteTrade}
                  className="bg-gradient-to-r from-primary to-secondary"
                  disabled={currentRecommendation.recommendation === "HOLD"}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Execute Trade
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Details Dialog */}
      <ShareDetailsDialog
        symbol={selectedSymbol}
        open={showShareDetails}
        onOpenChange={setShowShareDetails}
        onTrade={handleExecuteFromSuggestion}
      />
    </div>
  );
}
