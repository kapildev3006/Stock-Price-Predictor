import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Settings, Plus, X } from "lucide-react";
import { BinanceTickerData, WatchlistItem } from "@shared/binance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BuyDialog } from "@/components/BuyDialog";
import { useTrading } from "@/contexts/TradingContext";

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: "BTCUSDT", name: "Bitcoin" },
  { symbol: "ETHUSDT", name: "Ethereum" },
  { symbol: "BNBUSDT", name: "BNB" },
];

export function Watchlist() {
  const { updatePositionPrices } = useTrading();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    // Load watchlist from localStorage or use default
    const saved = localStorage.getItem("binance_watchlist");
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
  });
  const [tickerData, setTickerData] = useState<BinanceTickerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<{
    symbol: string;
    name: string;
    price: number;
  } | null>(null);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("binance_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const fetchTickerData = async () => {
    if (watchlist.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const symbols = watchlist.map((item) => item.symbol).join(",");
      const response = await fetch(`/api/binance/ticker?symbols=${symbols}`);

      if (!response.ok) {
        throw new Error("Failed to fetch ticker data");
      }

      const data: BinanceTickerData[] = await response.json();
      setTickerData(data);
      
      // Update position prices for open positions
      data.forEach((ticker) => {
        const price = ticker.lastPrice || ticker.price || "0";
        updatePositionPrices(ticker.symbol, parseFloat(price));
      });
      
      // Check if any symbols failed to load
      const loadedSymbols = data.map(d => d.symbol);
      const failedSymbols = watchlist
        .map(w => w.symbol)
        .filter(s => !loadedSymbols.includes(s));
      
      if (failedSymbols.length > 0 && data.length > 0) {
        console.warn("Failed to load symbols:", failedSymbols);
      } else if (data.length === 0) {
        setError("Unable to fetch data. Please check your internet connection.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching ticker data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 2000); // Update every 2 seconds for real-time data
    return () => clearInterval(interval);
  }, [watchlist]);

  // Listen for storage changes (when items are added from other components)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("binance_watchlist");
      if (saved) {
        setWatchlist(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToWatchlist = () => {
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol) return;

    // Ensure symbol ends with USDT if not already
    const formattedSymbol = symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;

    if (watchlist.some((item) => item.symbol === formattedSymbol)) {
      alert("Symbol already in watchlist");
      return;
    }

    setWatchlist([...watchlist, { symbol: formattedSymbol, name: symbol.replace("USDT", "") }]);
    setNewSymbol("");
    setDialogOpen(false);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
  };

  const handleSymbolClick = (item: WatchlistItem, ticker: BinanceTickerData) => {
    const price = ticker.lastPrice || ticker.price || "0";
    setSelectedSymbol({
      symbol: item.symbol,
      name: item.name,
      price: parseFloat(price),
    });
    setBuyDialogOpen(true);
  };

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return "0.00";
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return "0.00";
    if (num >= 1000) return num.toFixed(2);
    if (num >= 1) return num.toFixed(4);
    return num.toFixed(6);
  };

  const formatPercent = (percent: string | number | undefined) => {
    if (!percent) return "0.00";
    const num = typeof percent === 'string' ? parseFloat(percent) : percent;
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Watchlist</h3>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-red-500">LIVE</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTickerData}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Symbol to Watchlist</DialogTitle>
                <DialogDescription>
                  Enter a cryptocurrency symbol (e.g., BTC, ETH, SOL)
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter symbol..."
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
                />
                <Button onClick={addToWatchlist}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Watchlist Items */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {loading && tickerData.length === 0 ? (
            // Loading skeleton
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-card border border-border rounded-lg animate-pulse"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            watchlist.map((item) => {
              const ticker = tickerData.find((t) => t.symbol === item.symbol);
              const priceChange = ticker ? parseFloat(ticker.priceChangePercent) : 0;
              const isPositive = priceChange >= 0;

              return (
                <div
                  key={item.symbol}
                  className="p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition group cursor-pointer"
                  onClick={() => ticker && handleSymbolClick(item, ticker)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(item.symbol);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.symbol}</p>
                    </div>
                    {ticker ? (
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end mb-0.5">
                          <p className="font-bold text-base">
                            ${formatPrice(ticker.lastPrice || ticker.price)}
                          </p>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            isPositive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{formatPercent(ticker.priceChangePercent)}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="h-4 bg-muted rounded w-16 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {ticker && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">24h High</p>
                        <p className="font-medium text-green-600">${formatPrice(ticker.highPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">24h Low</p>
                        <p className="font-medium text-red-600">${formatPrice(ticker.lowPrice)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Info Text */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          🔴 Live data from Binance. Updates every 2 seconds. Click on any symbol to trade.
        </p>
      </div>

      {/* Buy Dialog */}
      {selectedSymbol && (
        <BuyDialog
          open={buyDialogOpen}
          onOpenChange={setBuyDialogOpen}
          symbol={selectedSymbol.symbol}
          name={selectedSymbol.name}
          currentPrice={selectedSymbol.price}
        />
      )}
    </div>
  );
}
