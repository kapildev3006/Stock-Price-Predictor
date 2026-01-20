import mongoose, { Schema, Document } from "mongoose";
import { BotStrategyConfig, StrategyType } from "../../../shared/bot";

export interface IBacktestResult extends Document {
    userId: string;
    strategyConfig: BotStrategyConfig;
    dateRange: {
        start: Date;
        end: Date;
    };
    initialCapital: number;
    metrics: {
        totalTrades: number;
        winningTrades: number;
        losingTrades: number;
        winRate: number;
        netProfit: number;
        profitFactor: number;
        maxDrawdown: number;
        sharpeRatio: number;
        averageWin: number;
        averageLoss: number;
    };
    trades: {
        entryTime: Date;
        exitTime: Date;
        entryPrice: number;
        exitPrice: number;
        type: 'BUY' | 'SELL';
        quantity: number;
        profit: number;
        profitPercent: number;
        reason: string;
    }[];
    equityCurve: {
        time: Date;
        balance: number;
    }[];
    createdAt: Date;
}

const BacktestResultSchema = new Schema<IBacktestResult>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        strategyConfig: {
            coinPair: { type: String, required: true },
            strategyType: { type: String, required: true },
            riskLevel: { type: String, required: true },
            investmentAmount: { type: Number, required: true },
            mode: { type: String, required: true },
        },
        dateRange: {
            start: { type: Date, required: true },
            end: { type: Date, required: true },
        },
        initialCapital: {
            type: Number,
            required: true,
        },
        metrics: {
            totalTrades: Number,
            winningTrades: Number,
            losingTrades: Number,
            winRate: Number,
            netProfit: Number,
            profitFactor: Number,
            maxDrawdown: Number,
            sharpeRatio: Number,
            averageWin: Number,
            averageLoss: Number,
        },
        trades: [
            {
                entryTime: Date,
                exitTime: Date,
                entryPrice: Number,
                exitPrice: Number,
                type: { type: String, enum: ['BUY', 'SELL'] },
                quantity: Number,
                profit: Number,
                profitPercent: Number,
                reason: String,
            },
        ],
        equityCurve: [
            {
                time: Date,
                balance: Number,
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
BacktestResultSchema.index({ userId: 1, createdAt: -1 });
BacktestResultSchema.index({ "strategyConfig.strategyType": 1 });

export const BacktestResult = mongoose.model<IBacktestResult>(
    "BacktestResult",
    BacktestResultSchema
);
