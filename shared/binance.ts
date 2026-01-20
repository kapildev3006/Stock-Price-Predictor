export interface BinanceTickerData {
  symbol: string;
  lastPrice?: string;  // Binance uses lastPrice
  price?: string;      // Fallback
  priceChange?: string;
  priceChangePercent?: string;
  highPrice?: string;
  lowPrice?: string;
  volume?: string;
  quoteVolume?: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
}

export interface BinanceAccountBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface BinanceApiConfig {
  apiKey: string;
  secretKey: string;
}
