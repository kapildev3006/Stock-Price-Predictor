import { Power, Settings, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  BotScreeningResponse,
  BotSuggestion,
  StrategyType,
  RiskLevel,
  TradingMode,
} from "@shared/bot";

interface BotStatus {
  isActive: boolean;
  investmentAmount: number;
  strategy: string;
  confidence: number;
  activeTrades: number;
  riskLevel: RiskLevel;
  mode: TradingMode;
}

export function BotControlPanel() {
  const [status, setStatus] = useState<BotStatus>({
    isActive: false,
    investmentAmount: 10000,
    strategy: "momentum-swing",
    confidence: 85,
    activeTrades: 12,
    riskLevel: "MEDIUM",
    mode: "PAPER",
  });

  const [showSettings, setShowSettings] = useState(false);
  const [investmentInput, setInvestmentInput] = useState(status.investmentAmount);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<BotSuggestion[]>([]);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [showStartForm, setShowStartForm] = useState(false);
  const [startRiskLevel, setStartRiskLevel] = useState<RiskLevel>(status.riskLevel);
  const [startMode, setStartMode] = useState<TradingMode>(status.mode);
  const [startInvestment, setStartInvestment] = useState<number>(status.investmentAmount);

  const mapUiStrategyToBackend = (strategy: string): StrategyType => {
    switch (strategy) {
      case "momentum-swing":
        return "MACD";
      case "mean-reversion":
        return "RSI";
      case "trend-follow":
        return "MOVING_AVERAGE";
      case "breakout":
        return "BOLLINGER_BANDS";
      default:
        return "RSI";
    }
  };

  const getWatchlistSymbols = (): string[] => {
    try {
      const stored = localStorage.getItem("binance_watchlist");
      if (!stored) return [];
      const items = JSON.parse(stored) as { symbol: string }[];
      return items
        .map((item) => item.symbol)
        .filter(Boolean)
        .map((symbol) => symbol.toUpperCase());
    } catch {
      return [];
    }
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      setSuggestionsError(null);

      const symbols = getWatchlistSymbols();

      const body = {
        strategyType: mapUiStrategyToBackend(status.strategy),
        riskLevel: status.riskLevel,
        mode: status.mode,
        investmentAmount: status.investmentAmount,
        ...(symbols.length > 0 ? { symbols } : {}),
      };

      const response = await fetch("/api/bot/screener", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bot suggestions");
      }

      const data: BotScreeningResponse = await response.json();

      if (!data.success || !data.suggestions || data.suggestions.length === 0) {
        setSuggestions([]);
        setSuggestionsError("No strong BUY signals found for the selected strategy.");
        return;
      }

      setSuggestions(data.suggestions);
    } catch (error) {
      setSuggestions([]);
      setSuggestionsError(
        error instanceof Error ? error.message : "Unexpected error while fetching suggestions"
      );
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const toggleBot = () => {
    if (!status.isActive) {
      setStartRiskLevel(status.riskLevel);
      setStartMode(status.mode);
      setStartInvestment(status.investmentAmount);
      setShowStartForm(true);
      return;
    }

    setStatus({ ...status, isActive: false });
  };

  const saveSettings = () => {
    setStatus({ ...status, investmentAmount: investmentInput });
    setShowSettings(false);
  };

  const strategyOptions = [
    { id: "momentum-swing", label: "Momentum Swing Trading", description: "Swing trading based on momentum indicators" },
    { id: "mean-reversion", label: "Mean Reversion", description: "Buy oversold, sell overbought stocks" },
    { id: "trend-follow", label: "Trend Following", description: "Follow established market trends" },
    { id: "breakout", label: "Breakout Strategy", description: "Trade on key resistance/support breaks" },
  ];

  return (
    <div className="space-y-6">
      {/* Bot Status Card */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Trading Bot</h2>
            <p className="text-muted-foreground">Control and monitor your automated trading bot</p>
          </div>
          <div className={`w-4 h-4 rounded-full animate-pulse ${status.isActive ? 'bg-success' : 'bg-muted'}`}></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Bot Status</p>
            <p className="text-2xl font-bold">
              <span className={status.isActive ? 'text-success' : 'text-muted-foreground'}>
                {status.isActive ? 'RUNNING' : 'STOPPED'}
              </span>
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Active Trades</p>
            <p className="text-2xl font-bold">{status.activeTrades}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Investment Amount</p>
            <p className="text-2xl font-bold">${status.investmentAmount.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
            <p className="text-2xl font-bold text-primary">{status.confidence}%</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleBot}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              status.isActive
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : 'bg-success text-white hover:bg-success/90'
            }`}
          >
            <Power className="w-4 h-4" />
            {status.isActive ? 'Stop Bot' : 'Start Bot'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-primary/30 text-primary rounded-lg font-medium hover:bg-primary/5 transition"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-4">Trading Strategy</h3>
        <p className="text-sm text-muted-foreground mb-6">Select a predefined strategy or customize your own</p>
        
        <div className="space-y-3">
          {strategyOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition ${
                status.strategy === option.id
                  ? 'bg-primary/5 border-primary/50'
                  : 'border-border hover:border-border/75'
              }`}
            >
              <input
                type="radio"
                name="strategy"
                value={option.id}
                checked={status.strategy === option.id}
                onChange={(e) => setStatus({ ...status, strategy: e.target.value })}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleGetSuggestions}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoadingSuggestions}
          >
            {isLoadingSuggestions ? "Analyzing market..." : "Get Strategy Suggestions"}
          </button>

          {suggestionsError && (
            <p className="text-sm text-destructive">{suggestionsError}</p>
          )}

          {suggestions.length > 0 && (
            <div className="mt-4 space-y-3">
              {suggestions.map((item) => (
                <div
                  key={item.symbol}
                  className="p-4 border border-border rounded-lg bg-muted/40 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{item.symbol}</span>
                    <span className="text-sm font-medium text-primary">
                      {item.action} · {item.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.reasoning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showStartForm && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">Start Bot Configuration</h3>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Risk Level</label>
              <select
                value={startRiskLevel}
                onChange={(e) => setStartRiskLevel(e.target.value as RiskLevel)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <select
                value={startMode}
                onChange={(e) => setStartMode(e.target.value as TradingMode)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="PAPER">Paper</option>
                <option value="LIVE">Live</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Investment Amount ($)</label>
              <input
                type="number"
                value={startInvestment}
                onChange={(e) => setStartInvestment(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                min={100}
                step={100}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  setIsLoadingSuggestions(true);
                  setSuggestionsError(null);

                  const symbols = getWatchlistSymbols();

                  const body = {
                    strategyType: mapUiStrategyToBackend(status.strategy),
                    riskLevel: startRiskLevel,
                    mode: startMode,
                    investmentAmount: startInvestment,
                    ...(symbols.length > 0 ? { symbols } : {}),
                  };

                  const response = await fetch("/api/bot/screener", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to analyze strategy");
                  }

                  const data: BotScreeningResponse = await response.json();

                  if (!data.success || !data.suggestions || data.suggestions.length === 0) {
                    setSuggestions([]);
                    setSuggestionsError("No strong BUY signals found for the selected configuration.");
                    setStatus((prev) => ({ ...prev, isActive: false }));
                    return;
                  }

                  setSuggestions(data.suggestions);
                  setStatus((prev) => ({
                    ...prev,
                    isActive: true,
                    riskLevel: startRiskLevel,
                    mode: startMode,
                    investmentAmount: startInvestment,
                  }));
                  setShowStartForm(false);
                } catch (error) {
                  setSuggestions([]);
                  setSuggestionsError(
                    error instanceof Error ? error.message : "Unexpected error while starting bot"
                  );
                  setStatus((prev) => ({ ...prev, isActive: false }));
                } finally {
                  setIsLoadingSuggestions(false);
                }
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoadingSuggestions}
            >
              {isLoadingSuggestions ? "Analyzing and starting..." : "Analyze & Start Bot"}
            </button>
            <button
              onClick={() => setShowStartForm(false)}
              className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted/50 transition"
              disabled={isLoadingSuggestions}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">Bot Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Investment Amount Per Trade ($)</label>
              <input
                type="number"
                value={investmentInput}
                onChange={(e) => setInvestmentInput(Number(e.target.value))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                min="100"
                step="100"
              />
              <p className="text-xs text-muted-foreground mt-2">Recommended: $1,000 - $50,000</p>
            </div>

            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-accent">
                Adjust investment carefully. Larger amounts increase potential profits but also risks.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={saveSettings}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Save Settings
            </button>
            <button
              onClick={() => {
                setShowSettings(false);
                setInvestmentInput(status.investmentAmount);
              }}
              className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted/50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
