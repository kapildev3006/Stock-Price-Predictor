import { RequestHandler } from "express";
import https from "https";

const BINANCE_API_BASE = "https://api.binance.com";

// Helper function to make HTTPS requests
function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
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

// Get live prices for multiple symbols
export const getLivePrices: RequestHandler = async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols || typeof symbols !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Symbols parameter required (comma-separated)',
      });
    }

    const symbolArray = symbols.split(',').map(s => s.trim()).filter(Boolean);
    
    if (symbolArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one symbol required',
      });
    }

    // Fetch prices for all symbols in parallel
    const pricePromises = symbolArray.map(async (symbol) => {
      try {
        const url = `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${symbol}`;
        const data = await httpsGet(url);
        return {
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          priceChange: parseFloat(data.priceChange),
          priceChangePercent: parseFloat(data.priceChangePercent),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          volume24h: parseFloat(data.volume),
        };
      } catch (error) {
        console.warn(`Error fetching price for ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(pricePromises);
    const prices = results.filter((p): p is NonNullable<typeof p> => p !== null);

    res.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching live prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live prices',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
