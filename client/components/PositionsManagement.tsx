import { ChevronDown, TrendingUp, TrendingDown, X, History } from "lucide-react";
import { useState } from "react";
import { useTrading } from "@/contexts/TradingContext";
import { Position } from "@shared/trading";
import { Button } from "@/components/ui/button";
import { TradingHistory } from "@/components/TradingHistory";

export function PositionsManagement() {
  const { positions, closePosition } = useTrading();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // If showing history, render the history component
  if (showHistory) {
    return <TradingHistory onBack={() => setShowHistory(false)} />;
  }

  // Helper function to check if a date is today
  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Filter to show only today's open positions
  const todayOpenPositions = positions.filter(
    (p) => p.status === "open" && isToday(p.entryTime)
  );

  const totalPnL = todayOpenPositions.reduce((sum, p) => sum + p.pnl, 0);

  const handleClosePosition = (position: Position) => {
    if (confirm(`Close position for ${position.name}?`)) {
      closePosition(position.id, position.currentPrice);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with History Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Today's Open Positions</h2>
          <p className="text-sm text-muted-foreground">
            Showing positions opened today • Closed positions appear in History
          </p>
        </div>
        <Button
          onClick={() => setShowHistory(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          View History
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Today's Positions</p>
          <p className="text-2xl font-bold">{todayOpenPositions.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Today's P&L</p>
          <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            ${totalPnL.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Position Size</p>
          <p className="text-2xl font-bold text-primary">
            {todayOpenPositions.length > 0
              ? (todayOpenPositions.reduce((sum, p) => sum + p.quantity * p.entryPrice, 0) / todayOpenPositions.length).toFixed(2)
              : "0.00"}
          </p>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {todayOpenPositions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Positions Today</h3>
            <p className="text-muted-foreground mb-4">
              Start trading by clicking on any cryptocurrency in the watchlist
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
                  <th className="px-6 py-4 text-left font-semibold">Current</th>
                  <th className="px-6 py-4 text-left font-semibold">P&L</th>
                  <th className="px-6 py-4 text-left font-semibold">Entry Time</th>
                  <th className="px-6 py-4 text-left font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {todayOpenPositions.map((position) => (
                  <>
                    <tr key={`${position.id}-row`} className="border-b border-border hover:bg-muted/30 transition">
                      <td className="px-6 py-4 font-medium">{position.symbol}</td>
                      <td className="px-6 py-4">{position.quantity}</td>
                      <td className="px-6 py-4">${position.entryPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">${position.currentPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-medium ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {position.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          ${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {new Date(position.entryTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
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
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                                <p className="font-medium">${position.stopLoss?.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Take Profit</p>
                                <p className="font-medium">${position.takeProfit?.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Entry Time</p>
                                <p className="font-medium">
                                  {new Date(position.entryTime).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {position.exitTime && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Exit Time</p>
                                <p className="font-medium">
                                  {new Date(position.exitTime).toLocaleString()}
                                </p>
                              </div>
                            )}
                            {position.status === 'open' && (
                              <button 
                                onClick={() => handleClosePosition(position)}
                                className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-lg font-medium hover:bg-destructive/90 transition"
                              >
                                <X className="w-4 h-4" />
                                Close Position
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
