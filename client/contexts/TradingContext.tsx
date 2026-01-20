import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Position, TradeOrder } from "@shared/trading";

interface TradingContextType {
  positions: Position[];
  loading: boolean;
  error: string | null;
  addPosition: (order: TradeOrder) => Promise<void>;
  closePosition: (id: string, exitPrice: number) => Promise<void>;
  updatePositionPrices: (symbol: string, currentPrice: number) => void;
  refreshPositions: () => Promise<void>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch positions from MongoDB
  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/positions');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Map MongoDB _id to id for compatibility
        const mappedPositions = data.data.map((pos: any) => ({
          ...pos,
          id: pos._id || pos.id,
        }));
        setPositions(mappedPositions);
      } else {
        throw new Error(data.error || 'Failed to fetch positions');
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load positions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch positions on mount
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const addPosition = useCallback(async (order: TradeOrder) => {
    try {
      setError(null);
      
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: order.symbol,
          name: order.name,
          quantity: order.quantity,
          price: order.price,
          stopLoss: order.stopLoss,
          takeProfit: order.takeProfit,
          type: order.type,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add position: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh positions from server
        await fetchPositions();
      } else {
        throw new Error(data.error || 'Failed to add position');
      }
    } catch (error) {
      console.error('Error adding position:', error);
      setError(error instanceof Error ? error.message : 'Failed to add position');
      throw error; // Re-throw to allow caller to handle
    }
  }, [fetchPositions]);

  const closePosition = useCallback(async (id: string, exitPrice: number) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/positions/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPrice: exitPrice }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to close position: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh positions from server
        await fetchPositions();
      } else {
        throw new Error(data.error || 'Failed to close position');
      }
    } catch (error) {
      console.error('Error closing position:', error);
      setError(error instanceof Error ? error.message : 'Failed to close position');
      throw error; // Re-throw to allow caller to handle
    }
  }, [fetchPositions]);

  const updatePositionPrices = async (symbol: string, currentPrice: number) => {
    try {
      // Update locally first for immediate UI feedback
      setPositions((prev) =>
        prev.map((pos) => {
          if (pos.symbol === symbol && pos.status === "open") {
            const pnl = (currentPrice - pos.entryPrice) * pos.quantity;
            const pnlPercent = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
            
            return {
              ...pos,
              currentPrice,
              pnl,
              pnlPercent,
            };
          }
          return pos;
        })
      );
      
      // Update in database
      await fetch('/api/positions/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prices: [{ symbol, price: currentPrice }],
        }),
      });
    } catch (error) {
      console.error('Error updating position prices:', error);
    }
  };

  return (
    <TradingContext.Provider
      value={{ 
        positions, 
        loading, 
        error, 
        addPosition, 
        closePosition, 
        updatePositionPrices,
        refreshPositions: fetchPositions,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error("useTrading must be used within a TradingProvider");
  }
  return context;
}
