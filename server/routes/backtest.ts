import express from "express";
import { Backtester } from "../utils/backtester";
import { BacktestResult } from "../db/models/BacktestResult";
import { BotStrategyConfig } from "../../shared/bot";

const router = express.Router();

// Run a new backtest
router.post("/run", async (req, res) => {
    try {
        const { config, dateRange, initialCapital } = req.body;

        // Validate request
        if (!config || !dateRange || !initialCapital) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        // Initialize backtester
        const backtester = new Backtester(config as BotStrategyConfig, initialCapital);

        // Run simulation
        const resultData = await backtester.run(startDate, endDate);

        // Save result to database
        const backtestResult = new BacktestResult({
            userId: "default_user", // TODO: Get from auth
            strategyConfig: config,
            dateRange: { start: startDate, end: endDate },
            initialCapital,
            metrics: resultData.metrics,
            trades: resultData.trades,
            equityCurve: resultData.equityCurve
        });

        await backtestResult.save();

        res.json({ success: true, result: backtestResult });
    } catch (error: any) {
        console.error("Backtest error:", error);
        res.status(500).json({ error: error.message || "Failed to run backtest" });
    }
});

// Get backtest history
router.get("/history", async (req, res) => {
    try {
        const history = await BacktestResult.find({ userId: "default_user" })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('strategyConfig metrics createdAt'); // Select only summary fields

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch backtest history" });
    }
});

// Get specific backtest result
router.get("/:id", async (req, res) => {
    try {
        const result = await BacktestResult.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ error: "Backtest result not found" });
        }
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch backtest result" });
    }
});

export default router;
