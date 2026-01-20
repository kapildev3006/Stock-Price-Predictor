import mongoose, { Schema, Document } from "mongoose";
import { BotRecommendation as IBotRecommendation } from "../../../shared/bot";

export interface IBotRecommendationDoc extends Omit<IBotRecommendation, '_id'>, Document { }

const BotRecommendationSchema = new Schema<IBotRecommendationDoc>(
  {
    userId: {
      type: String,
      default: "default_user",
      index: true,
    },
    strategyConfig: {
      coinPair: {
        type: String,
        required: true,
        uppercase: true,
      },
      strategyType: {
        type: String,
        enum: [
          "RSI",
          "MACD",
          "EMA_CROSSOVER",
          "MOVING_AVERAGE",
          "BOLLINGER_BANDS",
          "VOLUME_SPIKE",
          "ICHIMOKU",
          "FIBONACCI",
          "STOCHASTIC",
          "ADX",
          "PRICE_ACTION"
        ],
        required: true,
      },
      riskLevel: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        required: true,
      },
      investmentAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      mode: {
        type: String,
        enum: ["PAPER", "LIVE"],
        required: true,
      },
    },
    marketData: {
      symbol: String,
      price: Number,
      volume: Number,
      priceChange24h: Number,
      priceChangePercent24h: Number,
      high24h: Number,
      low24h: Number,
    },
    indicators: {
      rsi: Number,
      rsiDivergence: {
        detected: Boolean,
        type: { type: String, enum: ['bullish', 'bearish'] },
        strength: Number
      },
      macd: {
        macd: Number,
        signal: Number,
        histogram: Number,
      },
      macdDivergence: {
        detected: Boolean,
        type: { type: String, enum: ['bullish', 'bearish'] },
        strength: Number
      },
      ema: {
        ema12: Number,
        ema26: Number,
      },
      sma: {
        sma20: Number,
        sma50: Number,
      },
      bollingerBands: {
        upper: Number,
        middle: Number,
        lower: Number,
      },
      stochastic: {
        k: Number,
        d: Number
      },
      adx: {
        adx: Number,
        plusDI: Number,
        minusDI: Number
      },
      ichimoku: {
        tenkan: Number,
        kijun: Number,
        senkouA: Number,
        senkouB: Number,
        chikou: Number
      },
      fibonacci: {
        levels: [{
          level: Number,
          price: Number
        }],
        direction: { type: String, enum: ['UPTREND', 'DOWNTREND'] }
      }
    },
    recommendation: {
      type: String,
      enum: ["BUY", "SELL", "HOLD"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reasoning: {
      type: String,
      required: true,
    },
    signalStrength: Number,
    positionSize: Number,
    stopLoss: Number,
    takeProfitTargets: [Number],
    riskRewardRatio: Number,
    divergence: {
      detected: Boolean,
      type: { type: String, enum: ['bullish', 'bearish'] },
      strength: Number
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    executed: {
      type: Boolean,
      default: false,
    },
    executionPrice: Number,
    executionTime: Date,
    outcome: {
      profit: Number,
      profitPercent: Number,
      exitPrice: Number,
      exitTime: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
BotRecommendationSchema.index({ userId: 1, timestamp: -1 });
BotRecommendationSchema.index({ "strategyConfig.coinPair": 1 });
BotRecommendationSchema.index({ recommendation: 1 });

export const BotRecommendation = mongoose.model<IBotRecommendationDoc>(
  "BotRecommendation",
  BotRecommendationSchema
);
