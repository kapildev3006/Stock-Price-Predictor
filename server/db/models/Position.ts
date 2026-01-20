import mongoose, { Schema, Document } from "mongoose";

export interface IPosition extends Document {
  userId?: string; // Optional: for multi-user support
  symbol: string;
  name: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  status: "open" | "closed";
  entryTime: Date;
  exitTime?: Date;
  stopLoss?: number;
  takeProfit?: number;
  type: "buy" | "sell";
  createdAt: Date;
  updatedAt: Date;
}

const PositionSchema = new Schema<IPosition>(
  {
    userId: {
      type: String,
      default: "default_user",
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    pnl: {
      type: Number,
      default: 0,
    },
    pnlPercent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },
    entryTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    exitTime: {
      type: Date,
    },
    stopLoss: {
      type: Number,
      min: 0,
    },
    takeProfit: {
      type: Number,
      min: 0,
    },
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PositionSchema.index({ userId: 1, status: 1 });
PositionSchema.index({ userId: 1, entryTime: -1 });
PositionSchema.index({ symbol: 1, status: 1 });

// Calculate P&L before saving
PositionSchema.pre("save", function (next) {
  if (this.type === "buy") {
    this.pnl = (this.currentPrice - this.entryPrice) * this.quantity;
  } else {
    this.pnl = (this.entryPrice - this.currentPrice) * this.quantity;
  }
  this.pnlPercent = (this.pnl / (this.entryPrice * this.quantity)) * 100;
  next();
});

export const Position = mongoose.model<IPosition>("Position", PositionSchema);
