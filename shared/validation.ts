import { z } from "zod";

// Position validation schema
export const PositionSchema = z.object({
  id: z.string().optional(),
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  entryPrice: z.number().positive("Entry price must be positive"),
  currentPrice: z.number().positive("Current price must be positive"),
  pnl: z.number(),
  pnlPercent: z.number(),
  status: z.enum(["open", "closed"]),
  entryTime: z.string(),
  exitTime: z.string().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  type: z.enum(["buy", "sell"]),
});

// Trade order validation schema
export const TradeOrderSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"),
  type: z.enum(["buy", "sell"]),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
}).refine(
  (data) => {
    // Stop loss should be less than entry price for buy orders
    if (data.type === "buy" && data.stopLoss) {
      return data.stopLoss < data.price;
    }
    // Stop loss should be greater than entry price for sell orders
    if (data.type === "sell" && data.stopLoss) {
      return data.stopLoss > data.price;
    }
    return true;
  },
  {
    message: "Stop loss must be appropriate for order type",
    path: ["stopLoss"],
  }
).refine(
  (data) => {
    // Take profit should be greater than entry price for buy orders
    if (data.type === "buy" && data.takeProfit) {
      return data.takeProfit > data.price;
    }
    // Take profit should be less than entry price for sell orders
    if (data.type === "sell" && data.takeProfit) {
      return data.takeProfit < data.price;
    }
    return true;
  },
  {
    message: "Take profit must be appropriate for order type",
    path: ["takeProfit"],
  }
);

// Binance API configuration validation
export const BinanceApiConfigSchema = z.object({
  apiKey: z.string().min(10, "API key must be at least 10 characters"),
  secretKey: z.string().min(10, "Secret key must be at least 10 characters"),
});

// Kline query parameters validation
export const KlineQuerySchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  interval: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]),
  limit: z.number().int().min(1).max(1000).optional().default(100),
});

// Price update validation
export const PriceUpdateSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  price: z.number().positive("Price must be positive"),
});

export const BulkPriceUpdateSchema = z.object({
  prices: z.array(PriceUpdateSchema).min(1, "At least one price update required"),
  userId: z.string().optional(),
});

// Export types inferred from schemas
export type PositionInput = z.infer<typeof PositionSchema>;
export type TradeOrderInput = z.infer<typeof TradeOrderSchema>;
export type BinanceApiConfigInput = z.infer<typeof BinanceApiConfigSchema>;
export type KlineQueryInput = z.infer<typeof KlineQuerySchema>;
export type PriceUpdateInput = z.infer<typeof PriceUpdateSchema>;
export type BulkPriceUpdateInput = z.infer<typeof BulkPriceUpdateSchema>;
