import { RequestHandler } from "express";
import { BotRecommendation } from "../db/models/BotRecommendation";
import { connectToDatabase } from "../db/connection";
import { analyzeStrategy, calculateIndicators } from "../utils/strategyAnalyzer";
import { combineStrategies } from "../utils/strategyCombo";
import {
  BotStrategyConfig,
  BotScreeningRequest,
  BotScreeningResponse,
  BotSuggestion,
} from "../../shared/bot";
import { Watchlist } from "../db/models/Watchlist";

/**
 * Get market data from Binance
 */
async function fetchMarketData(symbol: string) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      volume: parseFloat(data.volume),
      priceChange24h: parseFloat(data.priceChange),
      priceChangePercent24h: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

async function getUniverseSymbols(userId: string, fallbackLimit: number = 10): Promise<string[]> {
  await connectToDatabase();

  const watchlist = await Watchlist.findOne({ userId });

  if (watchlist && watchlist.symbols.length > 0) {
    return watchlist.symbols.map((item) => item.symbol.toUpperCase());
  }

  const defaultSymbols = [
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "AVAXUSDT",
    "LINKUSDT",
    "MATICUSDT",
  ];

  return defaultSymbols.slice(0, fallbackLimit);
}

/**
 * Get historical klines data for indicator calculation
 */
async function fetchHistoricalPrices(symbol: string, limit: number = 50) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Extract closing prices
    return data.map((kline: any[]) => parseFloat(kline[4]));
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    throw error;
  }
}

/**
 * Generate bot recommendation
 */
export const generateRecommendation: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();

    const config: BotStrategyConfig = req.body;
    const userId = req.body.userId || "default_user";

    // Validate required fields
    if (!config.coinPair || !config.strategyType || !config.riskLevel || !config.investmentAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Fetch market data
    const marketData = await fetchMarketData(config.coinPair);

    // Fetch historical prices for indicators
    const historicalPrices = await fetchHistoricalPrices(config.coinPair);

    // Calculate technical indicators
    const indicators = calculateIndicators(historicalPrices, marketData.price);

    // Analyze strategy
    const analysis = analyzeStrategy(config, marketData, indicators);

    // Create recommendation document
    const recommendation = new BotRecommendation({
      userId,
      strategyConfig: config,
      marketData,
      indicators,
      recommendation: analysis.recommendation,
      confidence: Math.round(analysis.confidence),
      reasoning: analysis.reasoning,
      signalStrength: analysis.signalStrength,
      positionSize: analysis.positionSize,
      stopLoss: analysis.stopLoss,
      takeProfitTargets: analysis.takeProfitTargets,
      riskRewardRatio: analysis.riskRewardRatio,
      divergence: analysis.divergence,
      timestamp: new Date(),
      executed: false,
    });

    await recommendation.save();

    res.json(recommendation);
  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(500).json({ message: "Failed to generate recommendation" });
  }
};

// NEW: Combined Strategy Recommendation Endpoint
export const comboRecommendation: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase(); // Ensure DB connection for BotRecommendation

    const { coinPair, comboConfig, candleInterval = "4h" } = req.body;

    if (!coinPair || !comboConfig || !comboConfig.strategies || comboConfig.strategies.length === 0) {
      return res.status(400).json({ message: "Invalid combination configuration" });
    }

    // Fetch market data once
    const candles = await binanceClient.candles({
      symbol: coinPair,
      interval: candleInterval,
      limit: 100,
    });

    const prices = candles.map((c) => parseFloat(c.close));
    const high = candles.map((c) => parseFloat(c.high));
    const low = candles.map((c) => parseFloat(c.low));
    const close = prices;
    const volume = candles.map((c) => parseFloat(c.volume));

    const marketDataForCombo = { prices, high, low, close, volume }; // Renamed to avoid conflict

    const results: Record<string, any> = {};

    // Run analysis for each selected strategy
    for (const strategy of comboConfig.strategies) {
      // analyzeStrategy expects BotStrategyConfig, marketData, indicators
      // For combo, we pass raw candle data and let it calculate indicators internally
      // The `strategy.type` here is the strategy name (e.g., "RSI", "MACD")
      // We need to construct a BotStrategyConfig for each sub-strategy
      const subStrategyConfig: BotStrategyConfig = {
        coinPair: coinPair,
        strategyType: strategy.type, // Use the strategy type from comboConfig
        riskLevel: comboConfig.riskLevel || "medium", // Default or from comboConfig
        investmentAmount: comboConfig.investmentAmount || 100, // Default or from comboConfig
        mode: comboConfig.mode || "live", // Default or from comboConfig
        // Any other specific parameters for the sub-strategy can be added here
      };
      const result = analyzeStrategy(subStrategyConfig, marketDataForCombo, {}); // Pass empty indicators, analyzeStrategy will calculate
      results[strategy.type] = result;
    }

    // Combine results
    const combinedResult = combineStrategies(results, comboConfig);

    // Create recommendation object
    const recommendation = new BotRecommendation({
      userId: req.body.userId || "default_user", // Use actual user ID if available
      strategyType: "COMBO",
      signalStrength: combinedResult.confidence,
      recommendation: combinedResult.action,
      reasoning: combinedResult.reasoning.join(". "),
      price: prices[prices.length - 1],
      timestamp: new Date(),
      strategyConfig: {
        coinPair,
        strategyType: "COMBO",
        riskLevel: comboConfig.riskLevel,
        investmentAmount: comboConfig.investmentAmount,
        mode: comboConfig.mode,
        // Store the combo config details in a way that fits or extend schema
        // For now, we might need to extend schema or just store basic info
        comboDetails: comboConfig, // Storing the full combo config
      },
      // We can populate risk management fields based on the combined confidence
      // using a default or average approach
      positionSize: combinedResult.positionSize,
      stopLoss: combinedResult.stopLoss,
      takeProfitTargets: combinedResult.takeProfitTargets,
      riskRewardRatio: combinedResult.riskRewardRatio,
      confidence: Math.round(combinedResult.confidence),
    });

    await recommendation.save();

    res.json({
      ...recommendation.toObject(),
      individualResults: combinedResult.individualResults
    });

  } catch (error) {
    console.error("Error generating combo recommendation:", error);
    res.status(500).json({ message: "Failed to generate combo recommendation" });
  }
};

export const screenStrategies: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();

    const body: BotScreeningRequest = req.body;
    const userId = (req.body && req.body.userId) || "default_user";

    if (!body.strategyType || !body.riskLevel || !body.mode || !body.investmentAmount) {
      const response: BotScreeningResponse = {
        success: false,
        suggestions: [],
      };
      return res.status(400).json(response);
    }

    const universeSymbols = body.symbols && body.symbols.length > 0
      ? body.symbols
      : await getUniverseSymbols(userId);

    const limit = body.limit && body.limit > 0 ? body.limit : 10;

    const suggestions: BotSuggestion[] = [];
    const analyses: {
      symbol: string;
      marketData: any;
      indicators: any;
      analysis: any;
    }[] = [];
    const featureRows: {
      symbol: string;
      features: {
        rsi: number;
        macd: number;
        macd_signal: number;
        macd_hist: number;
        ema12: number;
        ema26: number;
        sma20: number;
        sma50: number;
        bb_upper: number;
        bb_middle: number;
        bb_lower: number;
        price_change_24h: number;
        price_change_pct_24h: number;
        volume: number;
      };
    }[] = [];

    for (const symbol of universeSymbols) {
      try {
        const marketData = await fetchMarketData(symbol);
        const historicalPrices = await fetchHistoricalPrices(symbol);
        const indicators = calculateIndicators(historicalPrices, marketData.price);

        const config: BotStrategyConfig = {
          coinPair: symbol,
          strategyType: body.strategyType,
          riskLevel: body.riskLevel,
          investmentAmount: body.investmentAmount,
          mode: body.mode,
        };

        const analysis = analyzeStrategy(config, marketData, indicators);

        analyses.push({
          symbol,
          marketData,
          indicators,
          analysis,
        });

        const macdValue = indicators.macd?.macd ?? 0;
        const macdSignal = indicators.macd?.signal ?? 0;
        const macdHist = indicators.macd?.histogram ?? 0;
        const ema12 = indicators.ema?.ema12 ?? marketData.price;
        const ema26 = indicators.ema?.ema26 ?? marketData.price;
        const sma20 = indicators.sma?.sma20 ?? marketData.price;
        const sma50 = indicators.sma?.sma50 ?? marketData.price;
        const bbUpper = indicators.bollingerBands?.upper ?? marketData.price;
        const bbMiddle = indicators.bollingerBands?.middle ?? marketData.price;
        const bbLower = indicators.bollingerBands?.lower ?? marketData.price;

        featureRows.push({
          symbol,
          features: {
            rsi: indicators.rsi ?? 50,
            macd: macdValue,
            macd_signal: macdSignal,
            macd_hist: macdHist,
            ema12,
            ema26,
            sma20,
            sma50,
            bb_upper: bbUpper,
            bb_middle: bbMiddle,
            bb_lower: bbLower,
            price_change_24h: marketData.priceChange24h,
            price_change_pct_24h: marketData.priceChangePercent24h,
            volume: marketData.volume,
          },
        });
      } catch (error) {
        console.error("Error screening symbol", symbol, error);
      }
    }

    let usedPythonModel = false;

    try {
      if (featureRows.length > 0) {
        const pythonApiUrl = process.env.STRATEGY_AI_URL || "http://127.0.0.1:8000";
        const pythonResponse = await fetch(`${pythonApiUrl}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rows: featureRows.map((row) => row.features),
          }),
        });

        if (pythonResponse.ok) {
          const data = await pythonResponse.json();

          if (
            data &&
            data.success &&
            Array.isArray(data.results) &&
            data.results.length === featureRows.length
          ) {
            usedPythonModel = true;

            data.results.forEach((result: any, index: number) => {
              const row = featureRows[index];
              const analysisEntry = analyses.find((a) => a.symbol === row.symbol);

              if (!analysisEntry) return;

              if (result.action === "BUY") {
                const confidence =
                  typeof result.confidence === "number"
                    ? Math.round(result.confidence)
                    : Math.round(analysisEntry.analysis.confidence);

                const reasoning = `${analysisEntry.analysis.reasoning} (AI model confidence: ${confidence}%)`;

                suggestions.push({
                  symbol: row.symbol,
                  action: "BUY",
                  confidence,
                  reasoning,
                  marketData: analysisEntry.marketData,
                  indicators: analysisEntry.indicators,
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error calling strategy AI model:", error);
    }

    if (!usedPythonModel) {
      for (const entry of analyses) {
        if (entry.analysis.recommendation === "BUY") {
          suggestions.push({
            symbol: entry.symbol,
            action: entry.analysis.recommendation,
            confidence: Math.round(entry.analysis.confidence),
            reasoning: entry.analysis.reasoning,
            marketData: entry.marketData,
            indicators: entry.indicators,
          });
        }
      }
    }

    suggestions.sort((a, b) => b.confidence - a.confidence);

    const response: BotScreeningResponse = {
      success: true,
      suggestions: suggestions.slice(0, limit),
    };

    res.json(response);
  } catch (error) {
    console.error("Error screening strategies:", error);
    const response: BotScreeningResponse = {
      success: false,
      suggestions: [],
    };
    res.status(500).json(response);
  }
};

/**
 * Execute recommendation (real trade)
 */
export const executeRecommendation: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    const { recommendationId } = req.params;
    const { executionPrice } = req.body;
    const recommendation = await BotRecommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ success: false, error: "Recommendation not found" });
    }
    if (recommendation.executed) {
      return res.status(400).json({ success: false, error: "Recommendation already executed" });
    }
    // Real trade execution placeholder (e.g., Binance API)
    recommendation.executed = true;
    recommendation.executionPrice = executionPrice || recommendation.marketData.price;
    recommendation.executionTime = new Date();
    await recommendation.save();
    res.json({
      success: true,
      message: `${recommendation.strategyConfig.mode} trade executed successfully`,
      recommendation: recommendation.toObject(),
    });
  } catch (error) {
    console.error("Error executing recommendation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to execute recommendation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Execute recommendation in paper (simulation) mode
 */
export const paperExecuteRecommendation: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    const { recommendationId } = req.params;
    const { executionPrice } = req.body;
    const recommendation = await BotRecommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ success: false, error: "Recommendation not found" });
    }
    if (recommendation.executed) {
      return res.status(400).json({ success: false, error: "Recommendation already executed" });
    }
    // Paper trade: mark as executed without external calls
    recommendation.executed = true;
    recommendation.executionPrice = executionPrice || recommendation.marketData.price;
    recommendation.executionTime = new Date();
    await recommendation.save();
    res.json({
      success: true,
      message: `${recommendation.strategyConfig.mode} paper trade executed successfully`,
      recommendation: recommendation.toObject(),
    });
  } catch (error) {
    console.error("Error executing paper recommendation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to execute paper recommendation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get recommendation history
 */
export const getRecommendationHistory: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.query.userId as string || "default_user";
    const limit = parseInt(req.query.limit as string) || 20;

    const recommendations = await BotRecommendation.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    // Calculate statistics
    const totalRecommendations = recommendations.length;
    const buySignals = recommendations.filter(r => r.recommendation === "BUY").length;
    const sellSignals = recommendations.filter(r => r.recommendation === "SELL").length;
    const holdSignals = recommendations.filter(r => r.recommendation === "HOLD").length;
    const executed = recommendations.filter(r => r.executed).length;
    const avgConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / totalRecommendations || 0;

    res.json({
      success: true,
      count: totalRecommendations,
      data: recommendations,
      statistics: {
        total: totalRecommendations,
        buySignals,
        sellSignals,
        holdSignals,
        executed,
        avgConfidence: Math.round(avgConfidence),
      },
    });
  } catch (error) {
    console.error("Error fetching recommendation history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendation history",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get single recommendation by ID
 */
export const getRecommendationById: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();

    const { id } = req.params;
    const recommendation = await BotRecommendation.findById(id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        error: "Recommendation not found",
      });
    }

    res.json({
      success: true,
      recommendation: recommendation.toObject(),
    });
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete recommendation
 */
export const deleteRecommendation: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();

    const { id } = req.params;
    const recommendation = await BotRecommendation.findByIdAndDelete(id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        error: "Recommendation not found",
      });
    }

    res.json({
      success: true,
      message: "Recommendation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete recommendation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
