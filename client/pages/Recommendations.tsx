import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Star, RefreshCw, ArrowUpRight, ArrowDownRight, Activity, Info, TrendingUpIcon, BarChart3, Clock, DollarSign, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CryptoRecommendation {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  trades24h: number;
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  score: number;
  reason: string;
  signals: string[];
}

interface RecommendationsData {
  strongBuy: CryptoRecommendation[];
  buy: CryptoRecommendation[];
  topGainers: CryptoRecommendation[];
  topLosers: CryptoRecommendation[];
  highVolume: CryptoRecommendation[];
}

interface LivePriceData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export default function Recommendations() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('gainers');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [priceUpdateTime, setPriceUpdateTime] = useState<Date | null>(null);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoRecommendation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/recommendations?sortBy=${sortBy}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.categorized);
        setLastUpdate(new Date());
        setCountdown(60); // Reset countdown
      } else {
        throw new Error(data.error || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchRecommendations, 60000);
    return () => clearInterval(interval);
  }, [sortBy]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update prices in real-time
  const updateLivePrices = async () => {
    if (!recommendations) return;

    try {
      setUpdatingPrices(true);
      
      // Collect all unique symbols
      const allSymbols = new Set<string>();
      Object.values(recommendations).forEach(category => {
        category.forEach(crypto => allSymbols.add(crypto.symbol));
      });

      if (allSymbols.size === 0) return;

      // Fetch live prices
      const symbols = Array.from(allSymbols).join(',');
      const response = await fetch(`/api/live-prices?symbols=${symbols}`);
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Create a map of symbol to new price data
        const priceMap = new Map<string, LivePriceData>(
          (data.data as LivePriceData[]).map((item) => [item.symbol, item])
        );

        // Update recommendations with new prices
        setRecommendations(prev => {
          if (!prev) return prev;

          const updateCategory = (cryptos: CryptoRecommendation[]) => 
            cryptos.map(crypto => {
              const newPriceData = priceMap.get(crypto.symbol);
              if (!newPriceData) return crypto;

              return {
                ...crypto,
                currentPrice: newPriceData.price,
                priceChange24h: newPriceData.priceChange,
                priceChangePercent24h: newPriceData.priceChangePercent,
                high24h: newPriceData.high24h,
                low24h: newPriceData.low24h,
                volume24h: newPriceData.volume24h,
              };
            });

          return {
            strongBuy: updateCategory(prev.strongBuy),
            buy: updateCategory(prev.buy),
            topGainers: updateCategory(prev.topGainers),
            topLosers: updateCategory(prev.topLosers),
            highVolume: updateCategory(prev.highVolume),
          };
        });

        setPriceUpdateTime(new Date());
      }
    } catch (err) {
      console.error('Error updating live prices:', err);
    } finally {
      setUpdatingPrices(false);
    }
  };

  // Live price updates every 10 seconds
  useEffect(() => {
    if (!recommendations) return;

    // Initial price update
    updateLivePrices();

    // Update prices every 10 seconds
    const priceInterval = setInterval(updateLivePrices, 10000);
    
    return () => clearInterval(priceInterval);
  }, [recommendations?.strongBuy.length]); // Re-run when data changes

  const getRecommendationBadge = (rec: CryptoRecommendation['recommendation']) => {
    const badges = {
      strong_buy: 'bg-green-500/20 text-green-500 border-green-500/30',
      buy: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      neutral: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
      sell: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      strong_sell: 'bg-red-500/20 text-red-500 border-red-500/30',
    };
    
    const labels = {
      strong_buy: 'Strong Buy',
      buy: 'Buy',
      neutral: 'Neutral',
      sell: 'Sell',
      strong_sell: 'Strong Sell',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[rec]}`}>
        {labels[rec]}
      </span>
    );
  };

  const formatVolume = (volume: number, price: number) => {
    const volumeUSD = volume * price;
    if (volumeUSD >= 1e9) return `$${(volumeUSD / 1e9).toFixed(2)}B`;
    if (volumeUSD >= 1e6) return `$${(volumeUSD / 1e6).toFixed(2)}M`;
    if (volumeUSD >= 1e3) return `$${(volumeUSD / 1e3).toFixed(2)}K`;
    return `$${volumeUSD.toFixed(2)}`;
  };

  const handleCardClick = (crypto: CryptoRecommendation) => {
    setSelectedCrypto(crypto);
    setDialogOpen(true);
    checkIfInWatchlist(crypto.symbol);
  };

  const checkIfInWatchlist = (symbol: string) => {
    const watchlist = localStorage.getItem("binance_watchlist");
    if (!watchlist) {
      setIsInWatchlist(false);
      return;
    }
    
    try {
      const parsedWatchlist = JSON.parse(watchlist);
      const exists = parsedWatchlist.some((item: any) => item.symbol === symbol);
      setIsInWatchlist(exists);
    } catch {
      setIsInWatchlist(false);
    }
  };

  const addToWatchlist = () => {
    if (!selectedCrypto) return;

    const symbol = selectedCrypto.symbol;
    const name = symbol.replace('USDT', '');

    // Get existing watchlist
    const watchlistData = localStorage.getItem("binance_watchlist");
    let watchlist = watchlistData ? JSON.parse(watchlistData) : [];

    // Check if already in watchlist
    if (watchlist.some((item: any) => item.symbol === symbol)) {
      toast({
        title: "Already in Watchlist",
        description: `${name} is already in your watchlist.`,
        variant: "default",
      });
      return;
    }

    // Add to watchlist
    watchlist.push({ symbol, name });
    localStorage.setItem("binance_watchlist", JSON.stringify(watchlist));
    setIsInWatchlist(true);

    // Show success toast
    toast({
      title: "Added to Watchlist",
      description: `${name} has been added to your watchlist.`,
      variant: "default",
    });

    // Dispatch event so watchlist component updates
    window.dispatchEvent(new Event('storage'));
  };

  const removeFromWatchlist = () => {
    if (!selectedCrypto) return;

    const symbol = selectedCrypto.symbol;
    const name = symbol.replace('USDT', '');

    // Get existing watchlist
    const watchlistData = localStorage.getItem("binance_watchlist");
    let watchlist = watchlistData ? JSON.parse(watchlistData) : [];

    // Remove from watchlist
    watchlist = watchlist.filter((item: any) => item.symbol !== symbol);
    localStorage.setItem("binance_watchlist", JSON.stringify(watchlist));
    setIsInWatchlist(false);

    // Show success toast
    toast({
      title: "Removed from Watchlist",
      description: `${name} has been removed from your watchlist.`,
      variant: "default",
    });

    // Dispatch event so watchlist component updates
    window.dispatchEvent(new Event('storage'));
  };

  const RecommendationCard = ({ crypto }: { crypto: CryptoRecommendation }) => (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/20 hover:scale-[1.02]"
      onClick={() => handleCardClick(crypto)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-bold">
                {crypto.symbol.replace('USDT', '')}
                <span className="text-sm text-muted-foreground ml-2">/ USDT</span>
              </CardTitle>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded">
                BINANCE
              </span>
            </div>
            <CardDescription className="mt-1 font-mono text-base">
              ${crypto.currentPrice < 1 
                ? crypto.currentPrice.toFixed(6) 
                : crypto.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardDescription>
          </div>
          {getRecommendationBadge(crypto.recommendation)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Price Change */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">24h Change</span>
          <div className={`flex items-center gap-1 font-semibold ${
            crypto.priceChangePercent24h >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {crypto.priceChangePercent24h >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {crypto.priceChangePercent24h.toFixed(2)}%
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">24h Volume</span>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <span className="font-semibold">
            {formatVolume(crypto.volume24h, crypto.currentPrice)}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Analysis Score</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.min(5, Math.max(0, crypto.score)) 
                      ? 'fill-yellow-500 text-yellow-500' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{crypto.score}/5</span>
          </div>
        </div>

        {/* Reason */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-2">Analysis</p>
          <p className="text-sm font-medium">{crypto.reason}</p>
        </div>

        {/* Signals */}
        {crypto.signals.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Key Signals</p>
            <div className="flex flex-wrap gap-1">
              {crypto.signals.slice(0, 3).map((signal, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-muted text-xs rounded-md"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 24h Range */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">24h Range</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-destructive">${crypto.low24h.toFixed(2)}</span>
            <span className="text-success">${crypto.high24h.toFixed(2)}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-destructive via-yellow-500 to-success"
              style={{
                width: `${((crypto.currentPrice - crypto.low24h) / (crypto.high24h - crypto.low24h)) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Click hint */}
        <div className="pt-2 mt-2 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors">
            <Info className="w-3 h-3" />
            <span className="font-medium">Click for full details</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Live Status and Refresh */}
      <div className="flex items-center justify-between">
        {/* Live Indicator */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs font-semibold text-green-500">LIVE PRICES</span>
          </div>

          {updatingPrices && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-xs font-medium text-blue-500">Updating...</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {priceUpdateTime && (
              <span className="font-medium">Prices: {priceUpdateTime.toLocaleTimeString()}</span>
            )}
            {lastUpdate && (
              <span className="ml-2">• Analysis: {lastUpdate.toLocaleTimeString()} • Next: {countdown}s</span>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={fetchRecommendations}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Now
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchRecommendations} className="mt-4" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !recommendations && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/3 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-12 bg-muted rounded"></div>
                  <div className="h-12 bg-muted rounded"></div>
                  <div className="h-12 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!loading && recommendations && (
        <Tabs defaultValue="strong-buy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="strong-buy" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Strong Buy</span>
              <span className="sm:hidden">Buy</span>
            </TabsTrigger>
            <TabsTrigger value="gainers" className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              <span className="hidden sm:inline">Top Gainers</span>
              <span className="sm:hidden">Gain</span>
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4" />
              <span className="hidden sm:inline">Top Losers</span>
              <span className="sm:hidden">Loss</span>
            </TabsTrigger>
            <TabsTrigger value="volume" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">High Volume</span>
              <span className="sm:hidden">Vol</span>
            </TabsTrigger>
            <TabsTrigger value="buy">Buy</TabsTrigger>
          </TabsList>

          <TabsContent value="strong-buy" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-xl font-semibold">
                Strong Buy Recommendations ({recommendations.strongBuy.length})
              </h2>
            </div>
            {recommendations.strongBuy.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No strong buy signals at the moment
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.strongBuy.map((crypto) => (
                  <RecommendationCard key={crypto.symbol} crypto={crypto} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gainers" className="space-y-4">
            <h2 className="text-xl font-semibold">
              Top Gainers ({recommendations.topGainers.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.topGainers.map((crypto) => (
                <RecommendationCard key={crypto.symbol} crypto={crypto} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="losers" className="space-y-4">
            <h2 className="text-xl font-semibold">
              Top Losers ({recommendations.topLosers.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.topLosers.map((crypto) => (
                <RecommendationCard key={crypto.symbol} crypto={crypto} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="volume" className="space-y-4">
            <h2 className="text-xl font-semibold">
              High Volume Cryptos ({recommendations.highVolume.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.highVolume.map((crypto) => (
                <RecommendationCard key={crypto.symbol} crypto={crypto} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buy" className="space-y-4">
            <h2 className="text-xl font-semibold">
              Buy Recommendations ({recommendations.buy.length})
            </h2>
            {recommendations.buy.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No buy signals at the moment
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.buy.map((crypto) => (
                  <RecommendationCard key={crypto.symbol} crypto={crypto} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Data Source Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-500">LIVE</span>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Real-Time Data from Binance</p>
              <p className="text-sm text-muted-foreground">
                All prices, volumes, and market data are fetched directly from Binance API in real-time. 
                Data automatically refreshes every 60 seconds to provide you with the latest market insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>⚠️ Disclaimer:</strong> These recommendations are generated based on technical analysis 
            and market data. They should not be considered financial advice. Always do your own research 
            and never invest more than you can afford to lose. Cryptocurrency trading carries significant risk.
          </p>
        </CardContent>
      </Card>

      {/* Detailed Crypto Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCrypto && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-2xl font-bold">
                      {selectedCrypto.symbol.replace('USDT', '')}
                      <span className="text-lg text-muted-foreground ml-2">/ USDT</span>
                    </DialogTitle>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                      BINANCE
                    </span>
                  </div>
                  {getRecommendationBadge(selectedCrypto.recommendation)}
                </div>
                <DialogDescription>
                  Real-time market data and AI-powered analysis
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Current Price Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-4xl font-bold font-mono">
                          ${selectedCrypto.currentPrice < 1 
                            ? selectedCrypto.currentPrice.toFixed(6) 
                            : selectedCrypto.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className={`flex items-center gap-2 mt-2 ${
                          selectedCrypto.priceChangePercent24h >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {selectedCrypto.priceChangePercent24h >= 0 ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                          <span className="text-2xl font-semibold">
                            {selectedCrypto.priceChangePercent24h.toFixed(2)}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({selectedCrypto.priceChangePercent24h >= 0 ? '+' : ''}{selectedCrypto.priceChange24h.toFixed(2)} USDT)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                        <p className="text-sm font-medium">{priceUpdateTime?.toLocaleTimeString() || 'Just now'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 24h Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">24h High</p>
                          <p className="text-lg font-bold">${selectedCrypto.high24h.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">24h Low</p>
                          <p className="text-lg font-bold">${selectedCrypto.low24h.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">24h Volume</p>
                          <p className="text-lg font-bold">{formatVolume(selectedCrypto.volume24h, selectedCrypto.currentPrice)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">24h Trades</p>
                          <p className="text-lg font-bold">{selectedCrypto.trades24h.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Price Range Visualization */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">24h Price Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-destructive via-yellow-500 to-success"
                          style={{
                            width: `${((selectedCrypto.currentPrice - selectedCrypto.low24h) / (selectedCrypto.high24h - selectedCrypto.low24h)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-destructive font-medium">${selectedCrypto.low24h.toFixed(2)}</span>
                        <span className="text-muted-foreground">Current Position</span>
                        <span className="text-success font-medium">${selectedCrypto.high24h.toFixed(2)}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Price Volatility: {(((selectedCrypto.high24h - selectedCrypto.low24h) / selectedCrypto.low24h) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.min(5, Math.max(0, selectedCrypto.score)) 
                                ? 'fill-yellow-500 text-yellow-500' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-semibold">{selectedCrypto.score}/5</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm font-medium mb-2">Recommendation Reasoning:</p>
                      <p className="text-sm text-muted-foreground">{selectedCrypto.reason}</p>
                    </div>

                    {selectedCrypto.signals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Technical Signals:</p>
                        <div className="space-y-2">
                          {selectedCrypto.signals.map((signal, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-background rounded">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                              <p className="text-sm text-muted-foreground flex-1">{signal}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Market Metrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Market Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Market Cap Rank</p>
                        <p className="text-sm font-medium">—</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Circulating Supply</p>
                        <p className="text-sm font-medium">—</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Average Trade Size</p>
                        <p className="text-sm font-medium">
                          ${((selectedCrypto.volume24h * selectedCrypto.currentPrice) / selectedCrypto.trades24h).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Trading Pair</p>
                        <p className="text-sm font-medium">{selectedCrypto.symbol}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  {isInWatchlist ? (
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={removeFromWatchlist}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      In Watchlist
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1" 
                      variant="default"
                      onClick={addToWatchlist}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  )}
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => {
                      window.open(`https://www.binance.com/en/trade/${selectedCrypto.symbol}`, '_blank');
                    }}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    View on Binance
                  </Button>
                </div>

                {/* Disclaimer */}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> This analysis is based on current market data and technical indicators. 
                    Always conduct your own research before making investment decisions.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
