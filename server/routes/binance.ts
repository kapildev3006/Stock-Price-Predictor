import { RequestHandler } from "express";
import crypto from "crypto";
import https from "https";
import { BinanceTickerData, BinanceAccountBalance } from "../../shared/binance";
import { BinanceKlineRaw, KlineData, KlineResponse, KlineInterval } from "../../shared/klines";
import { KlineQuerySchema, BinanceApiConfigSchema } from "../../shared/validation";

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
          console.log(`Successfully fetched: ${url.split('=')[1]}`);
          resolve(parsed);
        } catch (error) {
          console.error(`Failed to parse JSON from ${url}:`, data.substring(0, 100));
          reject(new Error('Failed to parse JSON'));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Request error for ${url}:`, error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`Request timeout for ${url}`);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Helper function to create signature
function createSignature(queryString: string, secretKey: string): string {
  return crypto
    .createHmac("sha256", secretKey)
    .update(queryString)
    .digest("hex");
}

// Get ticker price for specific symbols
export const getTickerPrices: RequestHandler = async (req, res) => {
  try {
    const symbols = req.query.symbols as string;

    if (!symbols) {
      return res.status(400).json({ error: "Symbols parameter is required" });
    }

    const symbolArray = symbols.split(",");
    const tickerPromises = symbolArray.map(async (symbol) => {
      try {
        const url = `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${symbol.trim()}`;
        const data = await httpsGet(url);
        return data;
      } catch (error) {
        console.warn(`Error fetching ${symbol}:`, error instanceof Error ? error.message : "Unknown error");
        return null;
      }
    });

    const results = await Promise.all(tickerPromises);
    const tickerData: BinanceTickerData[] = results.filter((data): data is BinanceTickerData => data !== null);

    res.json(tickerData);
  } catch (error) {
    console.error("Error fetching ticker prices:", error);
    res.status(500).json({
      error: "Failed to fetch ticker prices",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get account balances (requires API key and secret)
export const getAccountBalances: RequestHandler = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    const secretKey = req.headers["x-secret-key"] as string;

    // Validate API credentials
    const validationResult = BinanceApiConfigSchema.safeParse({ apiKey, secretKey });

    if (!validationResult.success) {
      return res.status(401).json({
        error: "Invalid API credentials",
        details: validationResult.error.errors,
      });
    }

    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString, secretKey);

    const response = await fetch(
      `${BINANCE_API_BASE}/api/v3/account?${queryString}&signature=${signature}`,
      {
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Binance API error:", errorData);
      return res.status(response.status).json({
        error: "Binance API error",
        details: errorData,
        message: errorData.msg || "Authentication failed. Please check your API keys."
      });
    }

    const accountData = await response.json();
    const balances: BinanceAccountBalance[] = accountData.balances
      .filter((balance: BinanceAccountBalance) =>
        parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
      );

    res.json({ balances });
  } catch (error) {
    console.error("Error fetching account balances:", error);
    res.status(500).json({
      error: "Failed to fetch account balances",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get all trading pairs
export const getAllSymbols: RequestHandler = async (_req, res) => {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/exchangeInfo`);

    if (!response.ok) {
      throw new Error("Failed to fetch exchange info");
    }

    const data = await response.json();
    const symbols = data.symbols
      .filter((s: any) => s.status === "TRADING" && s.quoteAsset === "USDT")
      .map((s: any) => ({
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        quoteAsset: s.quoteAsset,
      }));

    res.json({ symbols });
  } catch (error) {
    console.error("Error fetching symbols:", error);
    res.status(500).json({
      error: "Failed to fetch symbols",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get candlestick/kline data
export const getKlines: RequestHandler = async (req, res) => {
  try {
    // Validate query parameters using Zod schema
    const validationResult = KlineQuerySchema.safeParse({
      symbol: req.query.symbol || "BTCUSDT",
      interval: req.query.interval || "1m",
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const { symbol, interval, limit } = validationResult.data;

    const url = `${BINANCE_API_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    console.log(`Fetching klines: ${symbol} ${interval} (${limit} candles)`);

    const rawData: BinanceKlineRaw[] = await httpsGet(url);

    // Parse Binance raw kline data into our format
    const klineData: KlineData[] = rawData.map((kline) => ({
      time: kline[0],                    // Open time
      open: parseFloat(kline[1]),        // Open price
      high: parseFloat(kline[2]),        // High price
      low: parseFloat(kline[3]),         // Low price
      close: parseFloat(kline[4]),       // Close price
      volume: parseFloat(kline[5])       // Volume
    }));

    const response: KlineResponse = {
      symbol,
      interval,
      data: klineData
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching klines:", error);
    res.status(500).json({
      error: "Failed to fetch klines",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Export a client object for internal use (e.g. backtester)
export const binanceClient = {
  candles: async (params: { symbol: string; interval: string; startTime?: number; endTime?: number; limit?: number }) => {
    const { symbol, interval, startTime, endTime, limit } = params;
    let url = `${BINANCE_API_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}`;
    if (startTime) url += `&startTime=${startTime}`;
    if (endTime) url += `&endTime=${endTime}`;
    if (limit) url += `&limit=${limit}`;

    const rawData: BinanceKlineRaw[] = await httpsGet(url);

    return rawData.map((kline) => ({
      openTime: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: kline[6]
    }));
  }
};
