import { RequestHandler } from "express";
import { Position } from "../db/models/Position";
import { connectToDatabase } from "../db/connection";
import { TradeOrderSchema, BulkPriceUpdateSchema } from "../../shared/validation";

// Helper function to get start of today
function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// Get all positions (only today's positions)
export const getAllPositions: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = req.query.userId as string || "default_user";
    const status = req.query.status as string;
    
    const filter: any = { userId };
  
  // If status is explicitly set to "closed", show only today's closed positions
  if (status === "closed") {
    const startOfToday = getStartOfToday();
    filter.status = "closed";
    filter.exitTime = { $gte: startOfToday };
  } 
  // If status is "open", show only open positions
  else if (status === "open") {
    filter.status = "open";
  }
  // If no status filter, show all open positions + today's closed positions
  else {
    const startOfToday = getStartOfToday();
    filter.$or = [
      { status: "open" },
      { status: "closed", exitTime: { $gte: startOfToday } }
    ];
  }  
    
    const positions = await Position.find(filter).sort({ entryTime: -1 });
    
    res.json({
      success: true,
      count: positions.length,
      data: positions,
    });
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch positions",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get position history (closed positions from before today)
export const getPositionHistory: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = req.query.userId as string || "default_user";
    const startOfToday = getStartOfToday();
    
    // Get all closed positions from before today
    const filter: any = {
      userId,
      status: "closed",
      exitTime: { $lt: startOfToday }
    };
    
    const positions = await Position.find(filter).sort({ exitTime: -1 });
    
    // Calculate statistics
    const totalTrades = positions.length;
    const winningTrades = positions.filter(p => p.pnl > 0).length;
    const losingTrades = positions.filter(p => p.pnl < 0).length;
    const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    res.json({
      success: true,
      count: positions.length,
      data: positions,
      statistics: {
        totalTrades,
        winningTrades,
        losingTrades,
        totalPnL,
        avgPnL,
        winRate: Math.round(winRate * 100) / 100,
      }
    });
  } catch (error) {
    console.error("Error fetching position history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch position history",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get single position by ID
export const getPositionById: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { id } = req.params;
    const position = await Position.findById(id);
    
    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Position not found",
      });
    }
    
    res.json({
      success: true,
      data: position,
    });
  } catch (error) {
    console.error("Error fetching position:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch position",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create new position
export const createPosition: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    // Validate input using Zod schema
    const validationResult = TradeOrderSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }
    
    const validatedData = validationResult.data;
    
    // Calculate initial PnL (will be 0 at entry)
    const pnl = (validatedData.price - validatedData.price) * validatedData.quantity;
    const pnlPercent = 0;
    
    const positionData = {
      symbol: validatedData.symbol,
      name: validatedData.name,
      quantity: validatedData.quantity,
      entryPrice: validatedData.price,
      currentPrice: validatedData.price,
      pnl,
      pnlPercent,
      status: "open" as const,
      type: validatedData.type,
      stopLoss: validatedData.stopLoss,
      takeProfit: validatedData.takeProfit,
      userId: req.body.userId || "default_user",
      entryTime: new Date(),
    };
    
    const position = new Position(positionData);
    await position.save();
    
    res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: position,
    });
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create position",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update position (e.g., update current price, P&L)
export const updatePosition: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { id } = req.params;
    const updates = req.body;
    
    const position = await Position.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Position not found",
      });
    }
    
    res.json({
      success: true,
      message: "Position updated successfully",
      data: position,
    });
  } catch (error) {
    console.error("Error updating position:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update position",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Close position
export const closePosition: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { id } = req.params;
    const { currentPrice } = req.body;
    
    const position = await Position.findById(id);
    
    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Position not found",
      });
    }
    
    if (position.status === "closed") {
      return res.status(400).json({
        success: false,
        error: "Position is already closed",
      });
    }
    
    // Update position
    position.status = "closed";
    position.exitTime = new Date();
    if (currentPrice) {
      position.currentPrice = currentPrice;
    }
    
    await position.save();
    
    res.json({
      success: true,
      message: "Position closed successfully",
      data: position,
    });
  } catch (error) {
    console.error("Error closing position:", error);
    res.status(500).json({
      success: false,
      error: "Failed to close position",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete position
export const deletePosition: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { id } = req.params;
    const position = await Position.findByIdAndDelete(id);
    
    if (!position) {
      return res.status(404).json({
        success: false,
        error: "Position not found",
      });
    }
    
    res.json({
      success: true,
      message: "Position deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting position:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete position",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update multiple positions' current prices
export const updatePositionPrices: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    // Validate input using Zod schema
    const validationResult = BulkPriceUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }
    
    const { prices } = validationResult.data;
    const userId = req.body.userId || "default_user";
    
    const updates = await Promise.all(
      prices.map(async ({ symbol, price }) => {
        const positions = await Position.find({
          userId,
          symbol,
          status: "open",
        });
        
        return Promise.all(
          positions.map(async (position) => {
            position.currentPrice = price;
            return position.save();
          })
        );
      })
    );
    
    res.json({
      success: true,
      message: "Positions updated successfully",
      updatedCount: updates.flat().length,
    });
  } catch (error) {
    console.error("Error updating position prices:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update position prices",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
