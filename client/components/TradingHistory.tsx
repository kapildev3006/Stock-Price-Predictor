import { ChevronDown, TrendingUp, TrendingDown, ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Position } from "@shared/trading";

interface TradingHistoryProps {
  onBack: () => void;
}

interface HistoryStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  avgPnL: number;
  winRate: number;
}

export function TradingHistory({ onBack }: TradingHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  const [statistics, setStatistics] = useState<HistoryStatistics>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnL: 0,
    avgPnL: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch history from API
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/positions/history');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Map MongoDB _id to id for compatibility
        const mappedPositions = data.data.map((pos: any) => ({
          ...pos,
          id: pos._id || pos.id,
        }));
        setClosedPositions(mappedPositions);
        setStatistics(data.statistics);
      } else {
        throw new Error(data.error || 'Failed to fetch history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load trading history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Memoize expensive calculations
  const { winRate, avgWin, avgLoss } = useMemo(() => {
    const winRate = statistics.winRate.toFixed(0);
    const avgWin = statistics.winningTrades > 0 
      ? (closedPositions.filter(p => p.pnl > 0).reduce((sum, p) => sum + p.pnl, 0) / statistics.winningTrades).toFixed(2)
      : "0.00";
    const avgLoss = statistics.losingTrades > 0
      ? (closedPositions.filter(p => p.pnl < 0).reduce((sum, p) => sum + p.pnl, 0) / statistics.losingTrades).toFixed(2)
      : "0.00";
    
    return { winRate, avgWin, avgLoss };
  }, [closedPositions, statistics]);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Positions
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Trading History</h2>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
          <p className="text-2xl font-bold">{statistics.totalTrades}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-primary">{winRate}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
          <p className={`text-2xl font-bold ${statistics.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            ${statistics.totalPnL.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Win / Loss</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-success">${avgWin}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-lg font-bold text-destructive">${avgLoss}</span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive mb-1">Failed to Load History</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-2 text-xs text-destructive hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      )}

      {/* History Table */}
      {!loading && !error && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {closedPositions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Trading History</h3>
            <p className="text-muted-foreground mb-4">
              Your closed positions will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Symbol</th>
                  <th className="px-6 py-4 text-left font-semibold">Qty</th>
                  <th className="px-6 py-4 text-left font-semibold">Entry</th>
                  <th className="px-6 py-4 text-left font-semibold">Exit</th>
                  <th className="px-6 py-4 text-left font-semibold">P&L</th>
                  <th className="px-6 py-4 text-left font-semibold">Duration</th>
                  <th className="px-6 py-4 text-left font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {closedPositions.map((position) => {
                  const duration = position.exitTime && position.entryTime
                    ? calculateDuration(position.entryTime, position.exitTime)
                    : "N/A";

                  return (
                    <>
                      <tr key={`${position.id}-row`} className="border-b border-border hover:bg-muted/30 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{position.symbol}</p>
                            <p className="text-xs text-muted-foreground">{position.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{position.quantity}</td>
                        <td className="px-6 py-4">${position.entryPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">${position.currentPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 font-medium ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {position.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            ${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{duration}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedId(expandedId === position.id ? null : position.id)}
                            className="p-2 hover:bg-muted rounded-lg transition"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition ${expandedId === position.id ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedId === position.id && (
                        <tr key={`${position.id}-details`} className="bg-muted/30 border-b border-border">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Entry Time</p>
                                  <p className="font-medium">
                                    {new Date(position.entryTime).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Exit Time</p>
                                  <p className="font-medium">
                                    {position.exitTime ? new Date(position.exitTime).toLocaleString() : "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                                  <p className="font-medium">${position.stopLoss?.toFixed(2) || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Take Profit</p>
                                  <p className="font-medium">${position.takeProfit?.toFixed(2) || "N/A"}</p>
                                </div>
                              </div>
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground">
                                  Trade Type: <span className="font-medium text-foreground">{position.type.toUpperCase()}</span>
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}
    </div>
  );
}

// Helper function to calculate duration between two dates
function calculateDuration(entryTime: string, exitTime: string): string {
  try {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit.getTime() - entry.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  } catch {
    return "N/A";
  }
}
