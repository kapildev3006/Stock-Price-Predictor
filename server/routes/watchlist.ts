import { RequestHandler } from "express";
import { Watchlist } from "../db/models/Watchlist";
import { connectToDatabase } from "../db/connection";

// Get user's watchlist
export const getWatchlist: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = req.query.userId as string || "default_user";
    
    let watchlist = await Watchlist.findOne({ userId });
    
    // Create default watchlist if doesn't exist
    if (!watchlist) {
      watchlist = new Watchlist({
        userId,
        symbols: [
          { symbol: "BTCUSDT", name: "Bitcoin", addedAt: new Date() },
          { symbol: "ETHUSDT", name: "Ethereum", addedAt: new Date() },
          { symbol: "BNBUSDT", name: "Binance Coin", addedAt: new Date() },
        ],
      });
      await watchlist.save();
    }
    
    res.json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch watchlist",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add symbol to watchlist
export const addToWatchlist: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = req.body.userId || "default_user";
    const { symbol, name } = req.body;
    
    if (!symbol || !name) {
      return res.status(400).json({
        success: false,
        error: "Symbol and name are required",
      });
    }
    
    let watchlist = await Watchlist.findOne({ userId });
    
    if (!watchlist) {
      watchlist = new Watchlist({ userId, symbols: [] });
    }
    
    // Check if symbol already exists
    const exists = watchlist.symbols.some((item) => item.symbol === symbol);
    
    if (exists) {
      return res.status(400).json({
        success: false,
        error: "Symbol already in watchlist",
      });
    }
    
    // Add symbol
    watchlist.symbols.push({
      symbol: symbol.toUpperCase(),
      name,
      addedAt: new Date(),
    });
    
    await watchlist.save();
    
    res.json({
      success: true,
      message: "Symbol added to watchlist",
      data: watchlist,
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add to watchlist",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Remove symbol from watchlist
export const removeFromWatchlist: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = req.body.userId || req.query.userId as string || "default_user";
    const { symbol } = req.params;
    
    const watchlist = await Watchlist.findOne({ userId });
    
    if (!watchlist) {
      return res.status(404).json({
        success: false,
        error: "Watchlist not found",
      });
    }
    
    // Remove symbol
    watchlist.symbols = watchlist.symbols.filter(
      (item) => item.symbol !== symbol.toUpperCase()
    );
    
    await watchlist.save();
    
    res.json({
      success: true,
      message: "Symbol removed from watchlist",
      data: watchlist,
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove from watchlist",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update entire watchlist
export const updateWatchlist: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = req.body.userId || "default_user";
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: "Symbols must be an array",
      });
    }
    
    let watchlist = await Watchlist.findOne({ userId });
    
    if (!watchlist) {
      watchlist = new Watchlist({ userId, symbols: [] });
    }
    
    watchlist.symbols = symbols.map((item: any) => ({
      symbol: item.symbol.toUpperCase(),
      name: item.name,
      addedAt: item.addedAt || new Date(),
    }));
    
    await watchlist.save();
    
    res.json({
      success: true,
      message: "Watchlist updated successfully",
      data: watchlist,
    });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update watchlist",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
