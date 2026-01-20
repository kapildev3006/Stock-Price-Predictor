import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./db/connection";
import { handleDemo } from "./routes/demo";
import { getTickerPrices, getAccountBalances, getAllSymbols, getKlines } from "./routes/binance";
import {
  getAllPositions,
  getPositionHistory,
  getPositionById,
  createPosition,
  updatePosition,
  closePosition,
  deletePosition,
  updatePositionPrices,
} from "./routes/positions";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlist,
} from "./routes/watchlist";
import { getRecommendations, getSymbolAnalysis } from "./routes/recommendations";
import { getLivePrices } from "./routes/live-prices";
import {
  generateRecommendation,
  executeRecommendation,
  getRecommendationHistory,
  getRecommendationById,
  deleteRecommendation,
  screenStrategies,
} from "./routes/bot";
import { getShareDetails } from "./routes/shareDetails";
import backtestRouter from "./routes/backtest";


export function createServer() {
  const app = express();
  const apiRouter = express.Router();

  // Middleware for API routes only
  apiRouter.use(cors());
  apiRouter.use(express.json());
  apiRouter.use(express.urlencoded({ extended: true }));

  // Initialize MongoDB connection
  connectToDatabase().catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

  // Example API routes (without /api prefix as router is mounted at /api)
  apiRouter.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  apiRouter.get("/demo", handleDemo);

  // Binance API routes
  apiRouter.get("/binance/ticker", getTickerPrices);
  apiRouter.get("/binance/account", getAccountBalances);
  apiRouter.get("/binance/symbols", getAllSymbols);
  apiRouter.get("/binance/klines", getKlines);

  // Position routes
  apiRouter.get("/positions", getAllPositions);
  apiRouter.get("/positions/history", getPositionHistory);
  apiRouter.get("/positions/:id", getPositionById);
  apiRouter.post("/positions", createPosition);
  apiRouter.put("/positions/:id", updatePosition);
  apiRouter.post("/positions/:id/close", closePosition);
  apiRouter.delete("/positions/:id", deletePosition);
  apiRouter.post("/positions/update-prices", updatePositionPrices);

  // Watchlist routes
  apiRouter.get("/watchlist", getWatchlist);
  apiRouter.post("/watchlist", addToWatchlist);
  apiRouter.delete("/watchlist/:symbol", removeFromWatchlist);
  apiRouter.put("/watchlist", updateWatchlist);

  // Recommendations routes
  apiRouter.get("/recommendations", getRecommendations);
  apiRouter.get("/recommendations/:symbol", getSymbolAnalysis);

  // Live prices route
  apiRouter.get("/live-prices", getLivePrices);

  // Bot routes
  apiRouter.post("/bot/recommendation", generateRecommendation);
  apiRouter.post("/bot/execute", executeRecommendation);
  apiRouter.get("/bot/history", getRecommendationHistory);
  apiRouter.get("/bot/recommendation/:id", getRecommendationById);
  apiRouter.delete("/bot/recommendation/:id", deleteRecommendation);
  apiRouter.get("/bot/screen", screenStrategies);

  // Backtest routes
  apiRouter.use("/backtest", backtestRouter);

  // Share details route
  apiRouter.get("/bot/share-details/:symbol", getShareDetails);


  // Mount API router at /api
  app.use("/api", apiRouter);

  return app;
}
