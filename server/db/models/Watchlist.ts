import mongoose, { Schema, Document } from "mongoose";

export interface IWatchlistItem {
  symbol: string;
  name: string;
  addedAt: Date;
}

export interface IWatchlist extends Document {
  userId: string;
  symbols: IWatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistItemSchema = new Schema<IWatchlistItem>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: "default_user",
    },
    symbols: {
      type: [WatchlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
WatchlistSchema.index({ userId: 1 });

export const Watchlist = mongoose.model<IWatchlist>("Watchlist", WatchlistSchema);
