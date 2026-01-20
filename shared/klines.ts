// Candlestick/Kline data types for Binance API

export type KlineInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface KlineData {
  time: number;           // Open time (timestamp in milliseconds)
  open: number;           // Open price
  high: number;           // High price
  low: number;            // Low price
  close: number;          // Close price
  volume: number;         // Volume
}

export interface KlineResponse {
  symbol: string;
  interval: KlineInterval;
  data: KlineData[];
}

// Binance raw kline array format
// [
//   [
//     1499040000000,      // 0: Open time
//     "0.01634000",       // 1: Open
//     "0.80000000",       // 2: High
//     "0.01575800",       // 3: Low
//     "0.01577100",       // 4: Close
//     "148976.11427815",  // 5: Volume
//     1499644799999,      // 6: Close time
//     "2434.19055334",    // 7: Quote asset volume
//     308,                // 8: Number of trades
//     "1756.87402397",    // 9: Taker buy base asset volume
//     "28.46694368",      // 10: Taker buy quote asset volume
//     "0"                 // 11: Ignore
//   ]
// ]
export type BinanceKlineRaw = [
  number,  // Open time
  string,  // Open
  string,  // High
  string,  // Low
  string,  // Close
  string,  // Volume
  number,  // Close time
  string,  // Quote asset volume
  number,  // Number of trades
  string,  // Taker buy base asset volume
  string,  // Taker buy quote asset volume
  string   // Ignore
];
