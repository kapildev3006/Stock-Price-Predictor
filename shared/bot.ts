export type StrategyType =
  | "RSI"
  | "MACD"
  | "EMA_CROSSOVER"
  | "MOVING_AVERAGE"
  | "BOLLINGER_BANDS"
  | "VOLUME_SPIKE"
  | "ICHIMOKU"
  | "FIBONACCI"
  | "STOCHASTIC"
  | "ADX"
  | "PRICE_ACTION"
  | "COMBO";

export interface StrategyComboConfig {
  strategies: Array<{
    type: StrategyType;
    weight: number; // 0-100
  }>;
  mode: 'UNANIMOUS' | 'MAJORITY' | 'WEIGHTED';
  minConfidence: number; // Minimum confidence for the combined signal
}
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type TradingMode = "PAPER" | "LIVE";
export type RecommendationAction = "BUY" | "SELL" | "HOLD";

export interface BotStrategyConfig {
  coinPair: string;
  strategyType: StrategyType;
  riskLevel: RiskLevel;
  investmentAmount: number;
  mode: TradingMode;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
}

export interface TechnicalIndicators {
  rsi?: number;
  rsiSeries?: number[]; // For divergence detection
  rsiDivergence?: {
    detected: boolean;
    type?: 'bullish' | 'bearish';
    strength?: number;
  };
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  macdSeries?: { // For divergence detection
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  macdDivergence?: {
    detected: boolean;
    type?: 'bullish' | 'bearish';
    strength?: number;
  };
  ema?: {
    ema12: number;
    ema26: number;
  };
  sma?: {
    sma20: number;
    sma50: number;
  };
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
  stochastic?: {
    k: number;
    d: number;
  };
  adx?: {
    adx: number;
    plusDI: number;
    minusDI: number;
  };
  ichimoku?: {
    tenkan: number;
    kijun: number;
    senkouA: number;
    senkouB: number;
    chikou: number;
  };
  fibonacci?: {
    levels: {
      level: number; // 0.236, 0.382, 0.5, 0.618, 0.786
      price: number;
    }[];
    direction: 'UPTREND' | 'DOWNTREND';
  };
}

export interface BotRecommendation {
  _id?: string;
  userId: string;
  strategyConfig: BotStrategyConfig;
  marketData: MarketData;
  indicators: TechnicalIndicators;
  recommendation: RecommendationAction;
  confidence: number;
  reasoning: string;
  signalStrength?: number;
  positionSize?: number;
  stopLoss?: number;
  takeProfitTargets?: number[];
  riskRewardRatio?: number;
  divergence?: {
    detected: boolean;
    type?: 'bullish' | 'bearish';
    strength?: number;
  };
  timestamp: Date;
  executed: boolean;
  executionPrice?: number;
  executionTime?: Date;
  outcome?: {
    profit: number;
    profitPercent: number;
    exitPrice?: number;
    exitTime?: Date;
  };
}

export interface BotRecommendationResponse {
  success: boolean;
  recommendation?: BotRecommendation;
  error?: string;
}

export interface BotHistoryResponse {
  success: boolean;
  data: BotRecommendation[];
  count: number;
}

export interface BotScreeningRequest {
  strategyType: StrategyType;
  riskLevel: RiskLevel;
  mode: TradingMode;
  investmentAmount: number;
  symbols?: string[];
  limit?: number;
}

export interface ShareDetailsResponse {
  success: boolean;
  data?: ShareDetails;
  error?: string;
}

export interface BotSuggestion {
  symbol: string;
  action: RecommendationAction;
  confidence: number;
  reasoning: string;
  marketData: MarketData;
  indicators: TechnicalIndicators;
}

export interface BotScreeningResponse {
  success: boolean;
  suggestions: BotSuggestion[];
}

export interface ShareDetails {
  symbol: string;
  marketData: MarketData;
  indicators: TechnicalIndicators;
  analysis: {
    trend: "BULLISH" | "BEARISH" | "NEUTRAL";
    trendStrength: number; // 0-100
    volatility: "LOW" | "MEDIUM" | "HIGH";
    supportLevels: number[];
    resistanceLevels: number[];
    recommendation: RecommendationAction;
    confidence: number;
    reasoning: string;
  };
  historicalData: {
    timeframe: string;
    prices: Array<{
      timestamp: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  }[];
}

export interface EnhancedTechnicalIndicators extends TechnicalIndicators {
  volumeProfile?: {
    highVolumePrice: number;
    valueArea: { high: number; low: number };
  };
  supportResistance?: {
    support: number[];
    resistance: number[];
  };
  trendStrength?: {
    strength: number;
    trend: "STRONG" | "WEAK" | "NONE";
  };
}

