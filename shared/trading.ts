export interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  status: "open" | "closed";
  entryTime: string;
  exitTime?: string;
  stopLoss?: number;
  takeProfit?: number;
  type: "buy" | "sell";
}

export interface TradeOrder {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  type: "buy" | "sell";
  stopLoss?: number;
  takeProfit?: number;
}
