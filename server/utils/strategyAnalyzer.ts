import {
  BotStrategyConfig,
  MarketData,
  TechnicalIndicators,
  RecommendationAction,
} from "../../shared/bot";

interface AnalysisResult {
  recommendation: RecommendationAction;
  confidence: number;
  reasoning: string;
  signalStrength?: number; // 0-100, indicates signal quality
  positionSize?: number; // Recommended position size in USDT
  stopLoss?: number; // Recommended stop-loss price
  takeProfitTargets?: number[]; // Multiple take-profit levels
  riskRewardRatio?: number; // Risk/reward ratio for the trade
  divergence?: {
    detected: boolean;
    type?: 'bullish' | 'bearish';
    strength?: number;
  };
}

/**
 * Calculate RSI (Relative Strength Index)
 * Simplified calculation using price changes
 */
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Analyze RSI strategy
 */
function analyzeRSI(
  indicators: TechnicalIndicators,
  riskLevel: string,
  marketData: MarketData
): AnalysisResult {
  const rsi = indicators.rsi || 50;

  // Risk-adjusted thresholds
  const thresholds = {
    LOW: { oversold: 25, overbought: 75 },
    MEDIUM: { oversold: 30, overbought: 70 },
    HIGH: { oversold: 35, overbought: 65 },
  };

  let { oversold, overbought } = thresholds[riskLevel as keyof typeof thresholds];

  // Dynamic adjustment based on volatility
  const volatility = Math.abs(marketData.priceChangePercent24h);
  if (volatility > 5) {
    // In high volatility, widen the bands to avoid false signals
    oversold -= 5;
    overbought += 5;
  } else if (volatility < 1) {
    // In very low volatility, tighten the bands
    oversold += 2;
    overbought -= 2;
  }

  let divergenceInfo: { detected: boolean; type?: 'bullish' | 'bearish'; strength?: number } | undefined;
  if (indicators.rsiDivergence?.detected) {
    divergenceInfo = indicators.rsiDivergence;
  }

  if (rsi < oversold) {
    const confidence = Math.min(95, 60 + (oversold - rsi) * 2);
    let reasoning = `Strong RSI buy signal detected. RSI at ${rsi.toFixed(2)} (oversold below ${oversold}). Price: $${marketData.price.toFixed(2)}`;

    if (divergenceInfo?.type === 'bullish') {
      reasoning += ` 🚀 Bullish divergence detected!`;
    }

    return {
      recommendation: "BUY",
      confidence,
      reasoning,
      divergence: divergenceInfo
    };
  } else if (rsi > overbought) {
    const confidence = Math.min(95, 60 + (rsi - overbought) * 2);
    let reasoning = `Strong RSI sell signal. RSI at ${rsi.toFixed(2)} (overbought above ${overbought}). Consider taking profits.`;

    if (divergenceInfo?.type === 'bearish') {
      reasoning += ` 📉 Bearish divergence detected!`;
    }

    return {
      recommendation: "SELL",
      confidence,
      reasoning,
      divergence: divergenceInfo
    };
  }

  // Check for divergence even if not in extreme zones
  if (divergenceInfo?.detected) {
    if (divergenceInfo.type === 'bullish') {
      return {
        recommendation: "BUY",
        confidence: 65,
        reasoning: `Bullish RSI divergence detected. Potential trend reversal. RSI: ${rsi.toFixed(2)}`,
        divergence: divergenceInfo
      };
    } else if (divergenceInfo.type === 'bearish') {
      return {
        recommendation: "SELL",
        confidence: 65,
        reasoning: `Bearish RSI divergence detected. Potential trend reversal. RSI: ${rsi.toFixed(2)}`,
        divergence: divergenceInfo
      };
    }
  } else {
    const confidence = 50 + Math.abs(50 - rsi) * 0.5;
    return {
      recommendation: "HOLD",
      confidence,
      reasoning: `RSI at ${rsi.toFixed(2)} is neutral. No clear signal. Wait for better entry/exit point.`,
    };
  }
}

/**
 * Analyze MACD strategy
 */
function analyzeMacd(
  indicators: TechnicalIndicators,
  riskLevel: string,
  marketData: MarketData
): AnalysisResult {
  if (!indicators.macd) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient MACD data for analysis.",
    };
  }

  const { macd, signal, histogram } = indicators.macd;

  // Get previous histogram from series if available, otherwise simulate
  let prevHistogram = histogram - 0.5;
  if (indicators.macdSeries && indicators.macdSeries.histogram.length >= 2) {
    prevHistogram = indicators.macdSeries.histogram[indicators.macdSeries.histogram.length - 2];
  }

  // Check for divergence
  let divergenceInfo: { detected: boolean; type?: 'bullish' | 'bearish'; strength?: number } | undefined;
  if (indicators.macdDivergence?.detected) {
    divergenceInfo = indicators.macdDivergence;
  }

  // Bullish crossover
  if (histogram > 0 && prevHistogram <= 0) {
    const confidence = Math.min(90, 65 + Math.abs(histogram) * 10);
    let reasoning = `Bullish MACD crossover detected. Momentum shifting positive. MACD: ${macd.toFixed(2)}, Signal: ${signal.toFixed(2)}`;

    if (divergenceInfo?.type === 'bullish') {
      reasoning += ` 🚀 Bullish divergence confirms trend reversal!`;
    }

    return {
      recommendation: "BUY",
      confidence,
      reasoning,
      divergence: divergenceInfo
    };
  }
  // Bearish crossover
  else if (histogram < 0 && prevHistogram >= 0) {
    const confidence = Math.min(90, 65 + Math.abs(histogram) * 10);
    let reasoning = `Bearish MACD crossover detected. Momentum shifting negative. MACD: ${macd.toFixed(2)}, Signal: ${signal.toFixed(2)}`;

    if (divergenceInfo?.type === 'bearish') {
      reasoning += ` 📉 Bearish divergence confirms trend reversal!`;
    }

    return {
      recommendation: "SELL",
      confidence,
      reasoning,
      divergence: divergenceInfo
    };
  }

  // Check for strong divergence signals even without crossover
  if (divergenceInfo?.detected) {
    if (divergenceInfo.type === 'bullish' && histogram < 0 && histogram > prevHistogram) {
      // Bullish divergence while histogram is rising (but still negative)
      return {
        recommendation: "BUY",
        confidence: 60,
        reasoning: `Bullish MACD divergence detected with rising momentum. Potential early entry.`,
        divergence: divergenceInfo
      };
    } else if (divergenceInfo.type === 'bearish' && histogram > 0 && histogram < prevHistogram) {
      // Bearish divergence while histogram is falling (but still positive)
      return {
        recommendation: "SELL",
        confidence: 60,
        reasoning: `Bearish MACD divergence detected with falling momentum. Potential early exit.`,
        divergence: divergenceInfo
      };
    }
  }
  // Continuing trend
  else if (histogram > 0) {
    return {
      recommendation: "HOLD",
      confidence: 55 + Math.abs(histogram) * 5,
      reasoning: `MACD shows bullish momentum but no fresh crossover. Current position looks favorable. MACD: ${macd.toFixed(2)}`,
    };
  } else {
    return {
      recommendation: "HOLD",
      confidence: 50,
      reasoning: `MACD shows bearish momentum. No clear entry signal. Wait for reversal. MACD: ${macd.toFixed(2)}`,
    };
  }
}

/**
 * Analyze EMA Crossover strategy
 */
function analyzeEmaCrossover(
  indicators: TechnicalIndicators,
  marketData: MarketData
): AnalysisResult {
  if (!indicators.ema) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient EMA data for analysis.",
    };
  }

  const { ema12, ema26 } = indicators.ema;
  const price = marketData.price;

  // Golden cross (bullish)
  if (ema12 > ema26 && price > ema12) {
    const spread = ((ema12 - ema26) / ema26) * 100;
    const confidence = Math.min(92, 65 + spread * 20);
    return {
      recommendation: "BUY",
      confidence,
      reasoning: `Golden cross detected! EMA12 (${ema12.toFixed(2)}) above EMA26 (${ema26.toFixed(2)}). Price trending up at $${price.toFixed(2)}.`,
    };
  }
  // Death cross (bearish)
  else if (ema12 < ema26 && price < ema12) {
    const spread = ((ema26 - ema12) / ema26) * 100;
    const confidence = Math.min(92, 65 + spread * 20);
    return {
      recommendation: "SELL",
      confidence,
      reasoning: `Death cross detected. EMA12 (${ema12.toFixed(2)}) below EMA26 (${ema26.toFixed(2)}). Bearish trend confirmed.`,
    };
  } else {
    return {
      recommendation: "HOLD",
      confidence: 55,
      reasoning: `EMAs are converging. EMA12: ${ema12.toFixed(2)}, EMA26: ${ema26.toFixed(2)}. Wait for clear crossover.`,
    };
  }
}

/**
 * Analyze Moving Average strategy
 */
function analyzeMovingAverage(
  indicators: TechnicalIndicators,
  marketData: MarketData
): AnalysisResult {
  if (!indicators.sma) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient SMA data for analysis.",
    };
  }

  const { sma20, sma50 } = indicators.sma;
  const price = marketData.price;

  // Price above both MAs (bullish)
  if (price > sma20 && sma20 > sma50) {
    const momentum = ((price - sma20) / sma20) * 100;
    const confidence = Math.min(88, 62 + momentum * 15);
    return {
      recommendation: "BUY",
      confidence,
      reasoning: `Strong uptrend: Price ($${price.toFixed(2)}) > SMA20 ($${sma20.toFixed(2)}) > SMA50 ($${sma50.toFixed(2)}). Bullish alignment.`,
    };
  }
  // Price below both MAs (bearish)
  else if (price < sma20 && sma20 < sma50) {
    const momentum = ((sma20 - price) / sma20) * 100;
    const confidence = Math.min(88, 62 + momentum * 15);
    return {
      recommendation: "SELL",
      confidence,
      reasoning: `Strong downtrend: Price ($${price.toFixed(2)}) < SMA20 ($${sma20.toFixed(2)}) < SMA50 ($${sma50.toFixed(2)}). Bearish alignment.`,
    };
  }
  // Mixed signals
  else if (price > sma20 && price > sma50) {
    return {
      recommendation: "HOLD",
      confidence: 58,
      reasoning: `Price above moving averages but trend unclear. SMA20: $${sma20.toFixed(2)}, SMA50: $${sma50.toFixed(2)}.`,
    };
  } else {
    return {
      recommendation: "HOLD",
      confidence: 52,
      reasoning: `Mixed moving average signals. No clear trend. Wait for confirmation.`,
    };
  }
}

/**
 * Analyze Bollinger Bands strategy
 */
function analyzeBollingerBands(
  indicators: TechnicalIndicators,
  marketData: MarketData,
  riskLevel: string
): AnalysisResult {
  if (!indicators.bollingerBands) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient Bollinger Bands data for analysis.",
    };
  }

  const { upper, middle, lower } = indicators.bollingerBands;
  const price = marketData.price;
  const volatility = Math.abs(marketData.priceChangePercent24h);

  // Adjust confidence based on volatility
  // High volatility means price can easily punch through bands, so we want to be more careful
  const volatilityAdjustment = volatility > 5 ? 0.85 : 1.0;

  // Price touching or below lower band (oversold)
  if (price <= lower * 1.01) {
    const distance = ((lower - price) / lower) * 100;
    const confidence = Math.min(87, 63 + distance * 25) * volatilityAdjustment;
    return {
      recommendation: "BUY",
      confidence,
      reasoning: `Price at lower Bollinger Band ($${lower.toFixed(2)}). Potential mean reversion bounce. Volatility: ${volatility.toFixed(2)}%`,
    };
  }
  // Price touching or above upper band (overbought)
  else if (price >= upper * 0.99) {
    const distance = ((price - upper) / upper) * 100;
    const confidence = Math.min(87, 63 + distance * 25) * volatilityAdjustment;
    return {
      recommendation: "SELL",
      confidence,
      reasoning: `Price at upper Bollinger Band ($${upper.toFixed(2)}). Potential mean reversion pullback. Volatility: ${volatility.toFixed(2)}%`,
    };
  } else {
    // Middle band trend following
    if (price > middle && price < upper) {
      return {
        recommendation: "BUY",
        confidence: 55 * volatilityAdjustment,
        reasoning: `Price in upper channel (Bullish). Above middle band ($${middle.toFixed(2)}).`,
      };
    } else if (price < middle && price > lower) {
      return {
        recommendation: "SELL",
        confidence: 55 * volatilityAdjustment,
        reasoning: `Price in lower channel (Bearish). Below middle band ($${middle.toFixed(2)}).`,
      };
    }
  }

  return {
    recommendation: "HOLD",
    confidence: 50,
    reasoning: `Price near middle band ($${middle.toFixed(2)}). No clear signal.`,
  };
}

/**
 * Analyze Volume Spike strategy
 */
function analyzeVolumeSpike(
  marketData: MarketData,
  riskLevel: string,
  volumeAverage?: number
): AnalysisResult {
  const currentVolume = marketData.volume;
  const avgVolume = volumeAverage || currentVolume; // Fallback if no average provided
  const volumeRatio = currentVolume / avgVolume;
  const priceChange = marketData.priceChangePercent24h;

  // Volume spike detected (3x+ average volume)
  if (volumeRatio >= 3 && Math.abs(priceChange) > 2) {
    if (priceChange > 0) {
      const confidence = Math.min(95, 65 + volumeRatio * 5);
      return {
        recommendation: "BUY",
        confidence,
        reasoning: `Strong volume spike detected (${volumeRatio.toFixed(1)}x average) with ${priceChange.toFixed(2)}% price increase. Potential breakout in progress.`,
      };
    } else {
      const confidence = Math.min(90, 60 + volumeRatio * 4);
      return {
        recommendation: "SELL",
        confidence,
        reasoning: `High volume sell-off detected (${volumeRatio.toFixed(1)}x average) with ${priceChange.toFixed(2)}% price drop. Consider reducing position.`,
      };
    }
  } else if (volumeRatio >= 2 && Math.abs(priceChange) > 3) {
    // Moderate volume spike
    if (priceChange > 0) {
      return {
        recommendation: "BUY",
        confidence: 65,
        reasoning: `Moderate volume increase (${volumeRatio.toFixed(1)}x) with positive price action. Watch for confirmation.`,
      };
    } else {
      return {
        recommendation: "HOLD",
        confidence: 55,
        reasoning: `Increased selling volume detected. Wait for price stabilization before entering.`,
      };
    }
  }

  return {
    recommendation: "HOLD",
    confidence: 50,
    reasoning: `Normal volume levels (${volumeRatio.toFixed(1)}x average). No significant volume signal detected.`,
  };
}

/**
 * Analyze Stochastic Oscillator strategy
 */
function analyzeStochastic(
  indicators: TechnicalIndicators,
  riskLevel: string
): AnalysisResult {
  if (!indicators.stochastic) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient stochastic data for analysis.",
    };
  }

  const { k, d } = indicators.stochastic;

  // Oversold crossover (k crosses above d in oversold zone)
  if (k < 20 && d < 20 && k > d) {
    const confidence = Math.min(90, 70 + (20 - k) * 2);
    return {
      recommendation: "BUY",
      confidence,
      reasoning: `Stochastic bullish crossover in oversold zone (%K: ${k.toFixed(2)}, %D: ${d.toFixed(2)}). Strong buy signal.`,
    };
  }

  // Overbought crossover (k crosses below d in overbought zone)
  if (k > 80 && d > 80 && k < d) {
    const confidence = Math.min(90, 70 + (k - 80) * 2);
    return {
      recommendation: "SELL",
      confidence,
      reasoning: `Stochastic bearish crossover in overbought zone (%K: ${k.toFixed(2)}, %D: ${d.toFixed(2)}). Take profits.`,
    };
  }

  // Oversold without crossover
  if (k < 20 || d < 20) {
    return {
      recommendation: "BUY",
      confidence: 60,
      reasoning: `Stochastic in oversold territory (%K: ${k.toFixed(2)}). Wait for crossover confirmation.`,
    };
  }

  // Overbought without crossover
  if (k > 80 || d > 80) {
    return {
      recommendation: "SELL",
      confidence: 60,
      reasoning: `Stochastic in overbought territory (%K: ${k.toFixed(2)}). Consider taking profits.`,
    };
  }

  return {
    recommendation: "HOLD",
    confidence: 55,
    reasoning: `Stochastic in neutral range (%K: ${k.toFixed(2)}, %D: ${d.toFixed(2)}). No clear signal.`,
  };
}

/**
 * Analyze ADX Trend Strength strategy
 */
function analyzeADX(
  indicators: TechnicalIndicators,
  marketData: MarketData
): AnalysisResult {
  if (!indicators.adx) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient ADX data for analysis.",
    };
  }

  const { adx, plusDI, minusDI } = indicators.adx;

  // Strong uptrend
  if (adx > 25 && plusDI > minusDI && plusDI > 25) {
    const confidence = Math.min(95, 60 + adx * 0.8);
    return {
      recommendation: "BUY",
      confidence,
      reasoning: `Strong uptrend detected (ADX: ${adx.toFixed(2)}, +DI: ${plusDI.toFixed(2)} > -DI: ${minusDI.toFixed(2)}). Trend is strong and bullish.`,
    };
  }

  // Strong downtrend
  if (adx > 25 && minusDI > plusDI && minusDI > 25) {
    const confidence = Math.min(95, 60 + adx * 0.8);
    return {
      recommendation: "SELL",
      confidence,
      reasoning: `Strong downtrend detected (ADX: ${adx.toFixed(2)}, -DI: ${minusDI.toFixed(2)} > +DI: ${plusDI.toFixed(2)}). Exit positions.`,
    };
  }

  // Weak trend or ranging market
  if (adx < 20) {
    return {
      recommendation: "HOLD",
      confidence: 50,
      reasoning: `Weak trend (ADX: ${adx.toFixed(2)} < 20). Market is ranging. Avoid trend-following strategies.`,
    };
  }

  // Developing trend
  if (plusDI > minusDI) {
    return {
      recommendation: "BUY",
      confidence: 60,
      reasoning: `Developing uptrend (ADX: ${adx.toFixed(2)}, +DI > -DI). Consider entry on pullbacks.`,
    };
  } else {
    return {
      recommendation: "SELL",
      confidence: 60,
      reasoning: `Developing downtrend (ADX: ${adx.toFixed(2)}, -DI > +DI). Consider reducing exposure.`,
    };
  }
}

/**
 * Analyze Ichimoku Cloud strategy
 */
function analyzeIchimoku(
  indicators: TechnicalIndicators,
  marketData: MarketData
): AnalysisResult {
  if (!indicators.ichimoku) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient Ichimoku data for analysis.",
    };
  }

  const { tenkan, kijun, senkouA, senkouB, chikou } = indicators.ichimoku;
  const price = marketData.price;
  const cloudTop = Math.max(senkouA, senkouB);
  const cloudBottom = Math.min(senkouA, senkouB);

  // Price above cloud with bullish TK cross
  if (price > cloudTop && tenkan > kijun && chikou > price) {
    return {
      recommendation: "BUY",
      confidence: 90,
      reasoning: `Strong bullish signal: Price above cloud, Tenkan-sen (${tenkan.toFixed(2)}) above Kijun-sen (${kijun.toFixed(2)}), Chikou span confirms.`,
    };
  }

  // Price below cloud with bearish TK cross
  if (price < cloudBottom && tenkan < kijun && chikou < price) {
    return {
      recommendation: "SELL",
      confidence: 90,
      reasoning: `Strong bearish signal: Price below cloud, Tenkan-sen (${tenkan.toFixed(2)}) below Kijun-sen (${kijun.toFixed(2)}), Chikou span confirms.`,
    };
  }

  // Price above cloud
  if (price > cloudTop) {
    return {
      recommendation: "BUY",
      confidence: 75,
      reasoning: `Price above Ichimoku cloud. Bullish trend in place. Watch for Tenkan/Kijun crossover.`,
    };
  }

  // Price below cloud
  if (price < cloudBottom) {
    return {
      recommendation: "SELL",
      confidence: 75,
      reasoning: `Price below Ichimoku cloud. Bearish trend in place. Avoid long positions.`,
    };
  }

  // Price in cloud (neutral/choppy)
  return {
    recommendation: "HOLD",
    confidence: 50,
    reasoning: `Price inside Ichimoku cloud ($${cloudBottom.toFixed(2)} - $${cloudTop.toFixed(2)}). Wait for breakout direction.`,
  };
}

/**
 * Analyze Fibonacci Retracement strategy
 */
function analyzeFibonacci(
  indicators: TechnicalIndicators,
  marketData: MarketData
): AnalysisResult {
  if (!indicators.fibonacci) {
    return {
      recommendation: "HOLD",
      confidence: 40,
      reasoning: "Insufficient Fibonacci data for analysis.",
    };
  }

  const { levels, direction } = indicators.fibonacci;
  const price = marketData.price;

  // Find closest Fibonacci level
  let closestLevel = levels[0];
  let minDistance = Math.abs(price - levels[0].price);

  for (const level of levels) {
    const distance = Math.abs(price - level.price);
    if (distance < minDistance) {
      minDistance = distance;
      closestLevel = level;
    }
  }

  const tolerance = price * 0.005; // 0.5% tolerance

  if (direction === "UPTREND") {
    // Price at Fibonacci support level in uptrend
    if (
      minDistance < tolerance &&
      (closestLevel.level === 0.382 ||
        closestLevel.level === 0.5 ||
        closestLevel.level === 0.618)
    ) {
      return {
        recommendation: "BUY",
        confidence: 85,
        reasoning: `Price ($${price.toFixed(2)}) at key Fibonacci ${(closestLevel.level * 100).toFixed(1)}% retracement level ($${closestLevel.price.toFixed(2)}) in uptrend. Good entry point.`,
      };
    }

    // Price approaching support
    if (
      price > closestLevel.price &&
      (price - closestLevel.price) / price < 0.02
    ) {
      return {
        recommendation: "BUY",
        confidence: 70,
        reasoning: `Price approaching Fibonacci ${(closestLevel.level * 100).toFixed(1)}% support at $${closestLevel.price.toFixed(2)} in uptrend. Prepare for entry.`,
      };
    }
  } else {
    // DOWNTREND
    // Price at Fibonacci resistance level in downtrend
    if (
      minDistance < tolerance &&
      (closestLevel.level === 0.382 ||
        closestLevel.level === 0.5 ||
        closestLevel.level === 0.618)
    ) {
      return {
        recommendation: "SELL",
        confidence: 85,
        reasoning: `Price ($${price.toFixed(2)}) at key Fibonacci ${(closestLevel.level * 100).toFixed(1)}% resistance level ($${closestLevel.price.toFixed(2)}) in downtrend. Consider selling.`,
      };
    }

    // Price approaching resistance
    if (
      price < closestLevel.price &&
      (closestLevel.price - price) / price < 0.02
    ) {
      return {
        recommendation: "SELL",
        confidence: 70,
        reasoning: `Price approaching Fibonacci ${(closestLevel.level * 100).toFixed(1)}% resistance at $${closestLevel.price.toFixed(2)} in downtrend. Prepare for exit.`,
      };
    }
  }

  return {
    recommendation: "HOLD",
    confidence: 55,
    reasoning: `Price between Fibonacci levels. Closest level: ${(closestLevel.level * 100).toFixed(1)}% at $${closestLevel.price.toFixed(2)}. Wait for level test.`,
  };
}

/**
 * Analyze Price Action Pattern strategy
 */
function analyzePriceAction(
  marketData: MarketData,
  indicators: TechnicalIndicators
): AnalysisResult {
  const priceChange = marketData.priceChangePercent24h;
  const volume = marketData.volume;
  const price = marketData.price;

  // Bullish patterns: Strong price increase with volume
  if (priceChange > 5 && volume > 0) {
    return {
      recommendation: "BUY",
      confidence: 75,
      reasoning: `Strong bullish price action: ${priceChange.toFixed(2)}% gain with high volume. Momentum is positive.`,
    };
  }

  // Bearish patterns: Strong price decrease with volume
  if (priceChange < -5 && volume > 0) {
    return {
      recommendation: "SELL",
      confidence: 75,
      reasoning: `Strong bearish price action: ${priceChange.toFixed(2)}% decline with high volume. Negative momentum.`,
    };
  }

  // Moderate bullish move
  if (priceChange > 2 && priceChange <= 5) {
    return {
      recommendation: "BUY",
      confidence: 65,
      reasoning: `Moderate bullish price action: ${priceChange.toFixed(2)}% gain. Upward trend developing.`,
    };
  }

  // Moderate bearish move
  if (priceChange < -2 && priceChange >= -5) {
    return {
      recommendation: "SELL",
      confidence: 65,
      reasoning: `Moderate bearish price action: ${priceChange.toFixed(2)}% decline. Caution advised.`,
    };
  }

  // Consolidation/neutral
  return {
    recommendation: "HOLD",
    confidence: 50,
    reasoning: `Price consolidating with ${priceChange.toFixed(2)}% change. No clear directional bias. Wait for breakout.`,
  };
}

/**
 * Main strategy analyzer
 */
export function analyzeStrategy(
  config: BotStrategyConfig,
  marketData: MarketData,
  indicators: TechnicalIndicators
): AnalysisResult {
  let result: AnalysisResult;

  switch (config.strategyType) {
    case "RSI":
      result = analyzeRSI(indicators, config.riskLevel, marketData);
      break;
    case "MACD":
      result = analyzeMacd(indicators, config.riskLevel, marketData);
      break;
    case "EMA_CROSSOVER":
      result = analyzeEmaCrossover(indicators, marketData);
      break;
    case "MOVING_AVERAGE":
      result = analyzeMovingAverage(indicators, marketData);
      break;
    case "BOLLINGER_BANDS":
      result = analyzeBollingerBands(indicators, marketData, config.riskLevel);
      break;
    case "VOLUME_SPIKE":
      result = analyzeVolumeSpike(marketData, config.riskLevel);
      break;
    case "STOCHASTIC":
      result = analyzeStochastic(indicators, config.riskLevel);
      break;
    case "ADX":
      result = analyzeADX(indicators, marketData);
      break;
    case "ICHIMOKU":
      result = analyzeIchimoku(indicators, marketData);
      break;
    case "FIBONACCI":
      result = analyzeFibonacci(indicators, marketData);
      break;
    case "PRICE_ACTION":
      result = analyzePriceAction(marketData, indicators);
      break;
    default:
      result = {
        recommendation: "HOLD",
        confidence: 40,
        reasoning: "Unknown strategy type.",
      };
  }

  // Adjust confidence based on risk level
  if (config.riskLevel === "LOW" && result.recommendation !== "HOLD") {
    result.confidence *= 0.85; // More conservative
  } else if (config.riskLevel === "HIGH") {
    result.confidence = Math.min(95, result.confidence * 1.1); // More aggressive
  }

  // Add market volatility adjustment
  if (Math.abs(marketData.priceChangePercent24h) > 10) {
    result.reasoning += ` ⚠️ High volatility detected (${marketData.priceChangePercent24h.toFixed(2)}% 24h change).`;
  }

  // --- Phase 2: Risk Management Integration ---

  // 1. Calculate Volatility Proxy (using 24h change absolute value)
  const volatility = Math.abs(marketData.priceChangePercent24h);

  // 2. Check Volume Confirmation
  // We assume average volume is roughly current volume / volume ratio if we don't have history here
  // For now, we'll use a simplified check or skip if we don't have avg volume
  // Ideally we'd pass avg volume to analyzeStrategy. 
  // Let's assume volume confirmed if not explicitly flagged otherwise by strategy
  const volumeConfirmed = true;

  // 3. Calculate Signal Strength
  result.signalStrength = calculateSignalStrength(
    result.confidence,
    volumeConfirmed,
    result.divergence
  );

  // 4. Calculate Position Size
  result.positionSize = calculatePositionSize(
    config.investmentAmount,
    config.riskLevel === 'HIGH' ? 10 : config.riskLevel === 'MEDIUM' ? 5 : 2, // Risk % per trade
    volatility,
    result.confidence
  );

  // 5. Calculate Stop Loss & Take Profit
  const riskManagement = calculateStopLossAndTakeProfit(
    marketData.price,
    result.recommendation,
    volatility,
    config.strategyType
  );

  result.stopLoss = riskManagement.stopLoss;
  result.takeProfitTargets = riskManagement.takeProfitTargets;
  result.riskRewardRatio = riskManagement.riskRewardRatio;

  return result;
}

/**
 * Calculate technical indicators from price history
 */
export function calculateIndicators(
  prices: number[],
  currentPrice: number
): TechnicalIndicators {
  const indicators: TechnicalIndicators = {};

  if (prices.length >= 14) {
    indicators.rsi = calculateRSI(prices);
    indicators.rsiSeries = calculateRSISeries(prices);
  }

  if (prices.length >= 26) {
    // Calculate EMA
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    indicators.ema = { ema12, ema26 };

    // Calculate MACD
    const macd = ema12 - ema26;
    const signalPrices = prices.slice(-9);
    const signal = calculateEMA(signalPrices, 9);
    indicators.macd = {
      macd,
      signal,
      histogram: macd - signal,
    };

    // Calculate MACD Series for divergence
    const ema12Series = calculateEMASeries(prices, 12);
    const ema26Series = calculateEMASeries(prices, 26);

    // Align series
    const minLength = Math.min(ema12Series.length, ema26Series.length);
    const alignedEma12 = ema12Series.slice(-minLength);
    const alignedEma26 = ema26Series.slice(-minLength);

    const macdLineSeries = alignedEma12.map((val, i) => val - alignedEma26[i]);
    const signalLineSeries = calculateEMASeries(macdLineSeries, 9);

    // Align MACD and Signal
    const minMacdLen = Math.min(macdLineSeries.length, signalLineSeries.length);
    const finalMacd = macdLineSeries.slice(-minMacdLen);
    const finalSignal = signalLineSeries.slice(-minMacdLen);
    const histogramSeries = finalMacd.map((val, i) => val - finalSignal[i]);

    indicators.macdSeries = {
      macd: finalMacd,
      signal: finalSignal,
      histogram: histogramSeries
    };

    // Calculate MACD Divergence
    const bullishMacdDiv = detectDivergence(prices, finalMacd, 'bullish');
    const bearishMacdDiv = detectDivergence(prices, finalMacd, 'bearish');

    if (bullishMacdDiv.detected) {
      indicators.macdDivergence = { detected: true, type: 'bullish', strength: bullishMacdDiv.strength };
    } else if (bearishMacdDiv.detected) {
      indicators.macdDivergence = { detected: true, type: 'bearish', strength: bearishMacdDiv.strength };
    }
  }

  if (indicators.rsiSeries) {
    // Calculate RSI Divergence
    const bullishRsiDiv = detectDivergence(prices, indicators.rsiSeries, 'bullish');
    const bearishRsiDiv = detectDivergence(prices, indicators.rsiSeries, 'bearish');

    if (bullishRsiDiv.detected) {
      indicators.rsiDivergence = { detected: true, type: 'bullish', strength: bullishRsiDiv.strength };
    } else if (bearishRsiDiv.detected) {
      indicators.rsiDivergence = { detected: true, type: 'bearish', strength: bearishRsiDiv.strength };
    }
  }

  if (prices.length >= 50) {
    indicators.sma = {
      sma20: calculateSMA(prices.slice(-20)),
      sma50: calculateSMA(prices.slice(-50)),
    };
  }

  if (prices.length >= 20) {
    const sma20 = calculateSMA(prices.slice(-20));
    const stdDev = calculateStdDev(prices.slice(-20), sma20);
    indicators.bollingerBands = {
      upper: sma20 + 2 * stdDev,
      middle: sma20,
      lower: sma20 - 2 * stdDev,
    };
  }

  // Calculate Stochastic Oscillator
  if (prices.length >= 14) {
    indicators.stochastic = calculateStochastic(prices, 14, 3);
  }

  // Calculate ADX
  if (prices.length >= 28) {
    indicators.adx = calculateADX(prices, 14);
  }

  // Calculate Ichimoku
  if (prices.length >= 52) {
    indicators.ichimoku = calculateIchimoku(prices);
  }

  // Calculate Fibonacci
  if (prices.length >= 30) {
    indicators.fibonacci = calculateFibonacci(prices);
  }

  return indicators;
}

function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateSMA(prices: number[]): number {
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

function calculateStdDev(prices: number[], mean: number): number {
  const squaredDiffs = prices.map((price) => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  return Math.sqrt(variance);
}

/**
 * Calculate Stochastic Oscillator
 */
function calculateStochastic(
  prices: number[],
  period: number,
  smoothK: number
): { k: number; d: number } {
  if (prices.length < period) {
    return { k: 50, d: 50 }; // Default neutral
  }

  const recentPrices = prices.slice(-period);
  const currentPrice = prices[prices.length - 1];
  const highest = Math.max(...recentPrices);
  const lowest = Math.min(...recentPrices);

  const k =
    highest !== lowest ? ((currentPrice - lowest) / (highest - lowest)) * 100 : 50;

  // Simplified %D as 3-period SMA of %K
  const d = k; // In a full implementation, you'd track %K values and smooth them

  return { k, d };
}

/**
 * Calculate ADX (Average Directional Index)
 */
function calculateADX(
  prices: number[],
  period: number
): { adx: number; plusDI: number; minusDI: number } {
  if (prices.length < period * 2) {
    return { adx: 25, plusDI: 25, minusDI: 25 }; // Default neutral
  }

  // Simplified ADX calculation
  // In production, you'd calculate true +DM, -DM, and smooth them properly
  let sumPlusDM = 0;
  let sumMinusDM = 0;
  let sumTR = 0;

  for (let i = prices.length - period; i < prices.length - 1; i++) {
    const high = prices[i];
    const low = prices[i];
    const prevClose = prices[i - 1];

    const plusDM = Math.max(high - prices[i - 1], 0);
    const minusDM = Math.max(prices[i - 1] - low, 0);
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    sumPlusDM += plusDM;
    sumMinusDM += minusDM;
    sumTR += tr;
  }

  const plusDI = sumTR > 0 ? (sumPlusDM / sumTR) * 100 : 25;
  const minusDI = sumTR > 0 ? (sumMinusDM / sumTR) * 100 : 25;
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100 || 25;
  const adx = dx; // Simplified; should be smoothed average of DX

  return { adx, plusDI, minusDI };
}

/**
 * Calculate Ichimoku Cloud components
 */
function calculateIchimoku(prices: number[]): {
  tenkan: number;
  kijun: number;
  senkouA: number;
  senkouB: number;
  chikou: number;
} {
  if (prices.length < 52) {
    const currentPrice = prices[prices.length - 1];
    return {
      tenkan: currentPrice,
      kijun: currentPrice,
      senkouA: currentPrice,
      senkouB: currentPrice,
      chikou: currentPrice,
    };
  }

  // Tenkan-sen (Conversion Line): (9-period high + 9-period low)/2
  const tenkanPeriod = prices.slice(-9);
  const tenkan = (Math.max(...tenkanPeriod) + Math.min(...tenkanPeriod)) / 2;

  // Kijun-sen (Base Line): (26-period high + 26-period low)/2
  const kijunPeriod = prices.slice(-26);
  const kijun = (Math.max(...kijunPeriod) + Math.min(...kijunPeriod)) / 2;

  // Senkou Span A (Leading Span A): (Tenkan-sen + Kijun-sen)/2, plotted 26 periods ahead
  const senkouA = (tenkan + kijun) / 2;

  // Senkou Span B (Leading Span B): (52-period high + 52-period low)/2, plotted 26 periods ahead
  const senkouBPeriod = prices.slice(-52);
  const senkouB = (Math.max(...senkouBPeriod) + Math.min(...senkouBPeriod)) / 2;

  // Chikou Span (Lagging Span): Current closing price plotted 26 periods behind
  const chikou = prices[prices.length - 27] || prices[prices.length - 1];

  return { tenkan, kijun, senkouA, senkouB, chikou };
}

/**
 * Calculate Fibonacci Retracement Levels
 */
function calculateFibonacci(prices: number[]): {
  levels: { level: number; price: number }[];
  direction: "UPTREND" | "DOWNTREND";
} {
  if (prices.length < 30) {
    const currentPrice = prices[prices.length - 1];
    return {
      levels: [
        { level: 0.236, price: currentPrice },
        { level: 0.382, price: currentPrice },
        { level: 0.5, price: currentPrice },
        { level: 0.618, price: currentPrice },
        { level: 0.786, price: currentPrice },
      ],
      direction: "UPTREND",
    };
  }

  const recentPrices = prices.slice(-30);
  const highest = Math.max(...recentPrices);
  const lowest = Math.min(...recentPrices);
  const highIndex = recentPrices.indexOf(highest);
  const lowIndex = recentPrices.indexOf(lowest);

  const direction: "UPTREND" | "DOWNTREND" =
    lowIndex < highIndex ? "UPTREND" : "DOWNTREND";
  const range = highest - lowest;

  const fibLevels = [0.236, 0.382, 0.5, 0.618, 0.786];
  const levels =
    direction === "UPTREND"
      ? fibLevels.map((level) => ({
        level,
        price: highest - range * level,
      }))
      : fibLevels.map((level) => ({
        level,
        price: lowest + range * level,
      }));

  return { levels, direction };
}

/**
 * Calculate RSI Series for divergence detection
 */
function calculateRSISeries(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];

  const rsiSeries: number[] = [];

  // Calculate RSI for each window
  // We'll calculate for the last 20 periods to save computation
  const startIndex = Math.max(period, prices.length - 20);

  for (let i = startIndex; i < prices.length; i++) {
    // Simple RSI calculation for the window ending at i
    let gains = 0;
    let losses = 0;

    // Look back 'period' candles from i
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) {
      rsiSeries.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsiSeries.push(100 - 100 / (1 + rs));
    }
  }

  return rsiSeries;
}

/**
 * Calculate EMA Series
 */
function calculateEMASeries(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaSeries: number[] = [];

  // Start with SMA
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaSeries.push(ema);

  // Calculate subsequent EMAs
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    emaSeries.push(ema);
  }

  return emaSeries;
}

/**
 * Detect divergence between price and indicator
 */
function detectDivergence(
  prices: number[],
  indicatorValues: number[],
  type: 'bullish' | 'bearish'
): { detected: boolean; strength: number } {
  if (prices.length < 10 || indicatorValues.length < 10) {
    return { detected: false, strength: 0 };
  }

  const recentPrices = prices.slice(-10);
  const recentIndicator = indicatorValues.slice(-10);

  // Simple divergence detection
  const priceSlope =
    (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices.length;
  const indicatorSlope =
    (recentIndicator[recentIndicator.length - 1] - recentIndicator[0]) /
    recentIndicator.length;

  if (type === 'bullish') {
    // Bullish divergence: price making lower lows, indicator making higher lows
    const detected = priceSlope < 0 && indicatorSlope > 0;
    const strength = detected ? Math.abs(priceSlope - indicatorSlope) * 50 : 0;
    return { detected, strength: Math.min(100, strength) };
  } else {
    // Bearish divergence: price making higher highs, indicator making lower highs
    const detected = priceSlope > 0 && indicatorSlope < 0;
    const strength = detected ? Math.abs(priceSlope - indicatorSlope) * 50 : 0;
    return { detected, strength: Math.min(100, strength) };
  }
}

/**
 * Calculate signal strength based on multiple factors
 */
function calculateSignalStrength(
  confidence: number,
  volumeConfirmed: boolean,
  divergence?: { detected: boolean; strength?: number }
): number {
  let strength = confidence;

  // Boost for volume confirmation
  if (volumeConfirmed) {
    strength = Math.min(100, strength * 1.1);
  }

  // Boost for divergence
  if (divergence?.detected && divergence.strength) {
    strength = Math.min(100, strength + divergence.strength * 0.2);
  }

  return Math.round(strength);
}

/**
 * Check if volume confirms the signal
 */
function isVolumeConfirmed(
  currentVolume: number,
  averageVolume: number,
  priceChange: number
): boolean {
  const volumeRatio = currentVolume / averageVolume;

  // Strong price movement should have above-average volume
  if (Math.abs(priceChange) > 3) {
    return volumeRatio > 1.2; // 20% above average
  }

  // Moderate price movement
  if (Math.abs(priceChange) > 1.5) {
    return volumeRatio > 1.0;
  }

  // Small movements don't need volume confirmation
  return true;
}

/**
 * Calculate recommended position size based on risk and volatility
 */
function calculatePositionSize(
  investmentAmount: number,
  riskPercent: number,
  volatility: number,
  confidence: number
): number {
  // Base position size on risk appetite
  let positionPercent = riskPercent;

  // Adjust for volatility (reduce size in high volatility)
  if (volatility > 5) {
    positionPercent *= 0.7; // Reduce by 30%
  } else if (volatility > 3) {
    positionPercent *= 0.85; // Reduce by 15%
  }

  // Adjust for confidence
  positionPercent *= confidence / 100;

  const positionSize = (investmentAmount * positionPercent) / 100;

  // Ensure position size is within reasonable bounds
  return Math.max(10, Math.min(positionSize, investmentAmount * 0.5)); // Max 50% of capital
}

/**
 * Calculate stop-loss and take-profit levels
 */
function calculateStopLossAndTakeProfit(
  entryPrice: number,
  action: RecommendationAction,
  volatility: number,
  strategyType: string
): {
  stopLoss: number;
  takeProfitTargets: number[];
  riskRewardRatio: number;
} {
  if (action === 'HOLD') {
    return {
      stopLoss: entryPrice,
      takeProfitTargets: [entryPrice],
      riskRewardRatio: 0,
    };
  }

  // Calculate ATR-based distance (using volatility as proxy)
  const atrPercent = Math.max(1, volatility);
  const stopLossDistance = entryPrice * (atrPercent / 100) * 1.5; // 1.5x ATR

  let stopLoss: number;
  let takeProfitTargets: number[];

  if (action === 'BUY') {
    stopLoss = entryPrice - stopLossDistance;

    // Multiple take-profit targets (1:1.5, 1:2, 1:3 risk/reward)
    takeProfitTargets = [
      entryPrice + stopLossDistance * 1.5, // TP1: 1.5R
      entryPrice + stopLossDistance * 2, // TP2: 2R
      entryPrice + stopLossDistance * 3, // TP3: 3R
    ];
  } else {
    // SELL
    stopLoss = entryPrice + stopLossDistance;

    takeProfitTargets = [
      entryPrice - stopLossDistance * 1.5,
      entryPrice - stopLossDistance * 2,
      entryPrice - stopLossDistance * 3,
    ];
  }

  // Calculate risk/reward ratio (using first TP target)
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfitTargets[0] - entryPrice);
  const riskRewardRatio = reward / risk;

  return {
    stopLoss: Math.max(0, stopLoss),
    takeProfitTargets: takeProfitTargets.map((tp) => Math.max(0, tp)),
    riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
  };
}

/**
 * Calculate volume profile to identify high-volume price levels
 */
export function calculateVolumeProfile(prices: number[], volumes: number[]): {
  highVolumePrice: number;
  valueArea: { high: number; low: number };
} {
  if (prices.length !== volumes.length || prices.length === 0) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    return {
      highVolumePrice: avgPrice,
      valueArea: { high: avgPrice * 1.05, low: avgPrice * 0.95 },
    };
  }

  // Create price-volume pairs
  const priceVolumePairs = prices.map((price, i) => ({
    price,
    volume: volumes[i],
  }));

  // Find price with highest volume (Point of Control)
  let maxVolume = 0;
  let highVolumePrice = prices[prices.length - 1];

  priceVolumePairs.forEach((pv) => {
    if (pv.volume > maxVolume) {
      maxVolume = pv.volume;
      highVolumePrice = pv.price;
    }
  });

  // Calculate value area (70% of volume)
  const totalVolume = volumes.reduce((a, b) => a + b, 0);
  const targetVolume = totalVolume * 0.7;

  // Sort by price to find value area
  const sorted = [...priceVolumePairs].sort((a, b) => a.price - b.price);
  let cumulativeVolume = 0;
  let lowIdx = 0;
  let highIdx = sorted.length - 1;

  for (let i = 0; i < sorted.length && cumulativeVolume < targetVolume; i++) {
    cumulativeVolume += sorted[i].volume;
    if (sorted[i].price < highVolumePrice) lowIdx = i;
    if (sorted[i].price > highVolumePrice && highIdx === sorted.length - 1)
      highIdx = i;
  }

  return {
    highVolumePrice,
    valueArea: {
      high: sorted[Math.min(highIdx, sorted.length - 1)].price,
      low: sorted[lowIdx].price,
    },
  };
}

/**
 * Detect support and resistance levels using pivot points
 */
export function detectSupportResistance(
  prices: number[],
  period: number = 10
): {
  support: number[];
  resistance: number[];
} {
  if (prices.length < period * 2) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    return {
      support: [avgPrice * 0.95, avgPrice * 0.90],
      resistance: [avgPrice * 1.05, avgPrice * 1.10],
    };
  }

  const support: number[] = [];
  const resistance: number[] = [];

  // Find local minima (support) and maxima (resistance)
  for (let i = period; i < prices.length - period; i++) {
    const currentPrice = prices[i];
    const leftPrices = prices.slice(i - period, i);
    const rightPrices = prices.slice(i + 1, i + period + 1);

    const isLocalMin =
      leftPrices.every((p) => currentPrice <= p) &&
      rightPrices.every((p) => currentPrice <= p);
    const isLocalMax =
      leftPrices.every((p) => currentPrice >= p) &&
      rightPrices.every((p) => currentPrice >= p);

    if (isLocalMin) support.push(currentPrice);
    if (isLocalMax) resistance.push(currentPrice);
  }

  // Return most significant levels (closest to current price)
  const currentPrice = prices[prices.length - 1];
  support.sort((a, b) => Math.abs(currentPrice - b) - Math.abs(currentPrice - a));
  resistance.sort(
    (a, b) => Math.abs(currentPrice - a) - Math.abs(currentPrice - b)
  );

  return {
    support: support.slice(0, 3),
    resistance: resistance.slice(0, 3),
  };
}

/**
 * Calculate trend strength using ADX-like calculation
 */
export function calculateTrendStrength(prices: number[]): {
  strength: number;
  trend: "STRONG" | "WEAK" | "NONE";
} {
  if (prices.length < 14) {
    return { strength: 0, trend: "NONE" };
  }

  // Simplified directional movement calculation
  let positiveMove = 0;
  let negativeMove = 0;

  for (let i = 1; i < prices.length; i++) {
    const move = prices[i] - prices[i - 1];
    if (move > 0) positiveMove += move;
    else negativeMove += Math.abs(move);
  }

  const totalMove = positiveMove + negativeMove;
  if (totalMove === 0) return { strength: 0, trend: "NONE" };

  // Calculate directional strength (0-100)
  const strength = (Math.abs(positiveMove - negativeMove) / totalMove) * 100;

  let trend: "STRONG" | "WEAK" | "NONE";
  if (strength > 40) trend = "STRONG";
  else if (strength > 20) trend = "WEAK";
  else trend = "NONE";

  return { strength, trend };
}

/**
 * Classify market volatility
 */
export function classifyVolatility(
  priceChangePercent: number,
  volume: number
): "LOW" | "MEDIUM" | "HIGH" {
  const absChange = Math.abs(priceChangePercent);

  if (absChange > 10 || volume > 1000000000) return "HIGH";
  if (absChange > 5 || volume > 100000000) return "MEDIUM";
  return "LOW";
}
