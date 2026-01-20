import { RequestHandler } from "express";
import https from "https";

const BINANCE_API_BASE = "https://api.binance.com";

// Helper function to make HTTPS requests
function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Failed to parse JSON'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

interface RecommendationCriteria {
  minVolume?: number;
  minPriceChange?: number;
  maxPriceChange?: number;
  sortBy?: 'volume' | 'priceChange' | 'gainers' | 'losers';
}

interface CryptoRecommendation {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  trades24h: number;
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  score: number;
  reason: string;
  signals: string[];
}

// Calculate recommendation based on technical indicators
function analyzeAndRecommend(ticker: any): CryptoRecommendation {
  const priceChange = parseFloat(ticker.priceChangePercent);
  const volume = parseFloat(ticker.volume);
  const currentPrice = parseFloat(ticker.lastPrice);
  const high24h = parseFloat(ticker.highPrice);
  const low24h = parseFloat(ticker.lowPrice);
  const trades = parseInt(ticker.count);
  
  let score = 0;
  const signals: string[] = [];
  
  // Volume analysis (higher volume = more reliable)
  const volumeUSDT = volume * currentPrice;
  if (volumeUSDT > 100000000) { // > 100M USDT
    score += 2;
    signals.push("High trading volume");
  } else if (volumeUSDT > 50000000) {
    score += 1;
    signals.push("Good trading volume");
  }
  
  // Price momentum analysis
  if (priceChange > 10) {
    score += 3;
    signals.push("Strong upward momentum (+10%+)");
  } else if (priceChange > 5) {
    score += 2;
    signals.push("Positive momentum (+5%+)");
  } else if (priceChange > 2) {
    score += 1;
    signals.push("Moderate gains (+2%+)");
  } else if (priceChange < -10) {
    score -= 3;
    signals.push("Sharp decline (-10%+)");
  } else if (priceChange < -5) {
    score -= 2;
    signals.push("Negative momentum (-5%+)");
  }
  
  // Volatility check (price range)
  const volatility = ((high24h - low24h) / low24h) * 100;
  if (volatility > 15) {
    signals.push(`High volatility (${volatility.toFixed(1)}%)`);
  } else if (volatility > 8) {
    signals.push(`Moderate volatility (${volatility.toFixed(1)}%)`);
  } else {
    score += 1;
    signals.push(`Low volatility (${volatility.toFixed(1)}%)`);
  }
  
  // Trading activity
  if (trades > 100000) {
    score += 1;
    signals.push("High trading activity");
  }
  
  // Determine recommendation
  let recommendation: CryptoRecommendation['recommendation'];
  let reason: string;
  
  if (score >= 5) {
    recommendation = 'strong_buy';
    reason = 'Strong bullish signals with high volume and positive momentum';
  } else if (score >= 3) {
    recommendation = 'buy';
    reason = 'Positive indicators suggest buying opportunity';
  } else if (score <= -3) {
    recommendation = 'sell';
    reason = 'Negative indicators suggest caution';
  } else if (score <= -5) {
    recommendation = 'strong_sell';
    reason = 'Strong bearish signals, consider exiting';
  } else {
    recommendation = 'neutral';
    reason = 'Mixed signals, wait for clearer trend';
  }
  
  return {
    symbol: ticker.symbol,
    currentPrice: parseFloat(ticker.lastPrice),
    priceChange24h: parseFloat(ticker.priceChange),
    priceChangePercent24h: priceChange,
    volume24h: volume,
    high24h,
    low24h,
    trades24h: trades,
    recommendation,
    score,
    reason,
    signals,
  };
}

// Get crypto recommendations
export const getRecommendations: RequestHandler = async (req, res) => {
  try {
    const {
      limit = 20,
      sortBy = 'gainers',
      minVolume = 1000000,
    } = req.query;

    // Fetch all USDT pairs from Binance
    const url = `${BINANCE_API_BASE}/api/v3/ticker/24hr`;
    console.log('Fetching market data for recommendations...');
    
    const tickers = await httpsGet(url);
    
    // Filter for USDT pairs only
    const usdtPairs = tickers.filter((ticker: any) => 
      ticker.symbol.endsWith('USDT') && 
      !ticker.symbol.includes('DOWN') && 
      !ticker.symbol.includes('UP') &&
      !ticker.symbol.includes('BEAR') &&
      !ticker.symbol.includes('BULL')
    );
    
    // Analyze each pair
    const recommendations = usdtPairs
      .map((ticker: any) => analyzeAndRecommend(ticker))
      .filter((rec: CryptoRecommendation) => {
        const volumeUSDT = rec.volume24h * rec.currentPrice;
        return volumeUSDT >= parseFloat(minVolume as string);
      });
    
    // Sort based on criteria
    let sorted = [...recommendations];
    
    switch (sortBy) {
      case 'gainers':
        sorted.sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h);
        break;
      case 'losers':
        sorted.sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h);
        break;
      case 'volume':
        sorted.sort((a, b) => (b.volume24h * b.currentPrice) - (a.volume24h * a.currentPrice));
        break;
      case 'priceChange':
        sorted.sort((a, b) => Math.abs(b.priceChangePercent24h) - Math.abs(a.priceChangePercent24h));
        break;
      default:
        // Sort by recommendation score
        sorted.sort((a, b) => b.score - a.score);
    }
    
    // Limit results
    const limitedResults = sorted.slice(0, parseInt(limit as string));
    
    // Categorize recommendations
    const categorized = {
      strongBuy: sorted.filter(r => r.recommendation === 'strong_buy').slice(0, 5),
      buy: sorted.filter(r => r.recommendation === 'buy').slice(0, 5),
      topGainers: sorted
        .filter(r => r.priceChangePercent24h > 0)
        .sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h)
        .slice(0, 10),
      topLosers: sorted
        .filter(r => r.priceChangePercent24h < 0)
        .sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h)
        .slice(0, 10),
      highVolume: sorted
        .sort((a, b) => (b.volume24h * b.currentPrice) - (a.volume24h * a.currentPrice))
        .slice(0, 10),
    };
    
    res.json({
      success: true,
      data: limitedResults,
      categorized,
      metadata: {
        totalAnalyzed: recommendations.length,
        timestamp: new Date().toISOString(),
        criteria: { limit, sortBy, minVolume },
      },
    });
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get detailed analysis for a specific symbol
export const getSymbolAnalysis: RequestHandler = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const url = `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`;
    const ticker = await httpsGet(url);
    
    const analysis = analyzeAndRecommend(ticker);
    
    res.json({
      success: true,
      data: analysis,
    });
    
  } catch (error) {
    console.error('Error analyzing symbol:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze symbol',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
