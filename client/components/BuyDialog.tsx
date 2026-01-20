import { useState } from "react";
import { ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTrading } from "@/contexts/TradingContext";
import { TradeOrder } from "@shared/trading";

interface BuyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  name: string;
  currentPrice: number;
}

export function BuyDialog({
  open,
  onOpenChange,
  symbol,
  name,
  currentPrice,
}: BuyDialogProps) {
  const { addPosition } = useTrading();
  const [quantity, setQuantity] = useState<string>("1");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");

  const quantityNum = parseFloat(quantity) || 0;
  const totalCost = quantityNum * currentPrice;
  const stopLossNum = parseFloat(stopLoss) || undefined;
  const takeProfitNum = parseFloat(takeProfit) || undefined;

  const handleBuy = () => {
    if (quantityNum <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const order: TradeOrder = {
      symbol,
      name,
      quantity: quantityNum,
      price: currentPrice,
      type: orderType,
      stopLoss: stopLossNum,
      takeProfit: takeProfitNum,
    };

    addPosition(order);
    
    // Reset form
    setQuantity("1");
    setStopLoss("");
    setTakeProfit("");
    
    // Close dialog
    onOpenChange(false);
    
    // Show success message
    alert(`Successfully ${orderType === "buy" ? "bought" : "sold"} ${quantityNum} ${name}!`);
  };

  const potentialProfit = takeProfitNum
    ? (takeProfitNum - currentPrice) * quantityNum
    : 0;
  const potentialLoss = stopLossNum
    ? (currentPrice - stopLossNum) * quantityNum
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Trade {name}
          </DialogTitle>
          <DialogDescription>
            Place a {orderType} order for {symbol}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={orderType === "buy" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setOrderType("buy")}
            >
              Buy
            </Button>
            <Button
              type="button"
              variant={orderType === "sell" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setOrderType("sell")}
            >
              Sell
            </Button>
          </div>

          {/* Current Price */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Stop Loss (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="stopLoss">
              Stop Loss (Optional)
              <span className="text-xs text-muted-foreground ml-2">
                Exit if price drops to this level
              </span>
            </Label>
            <Input
              id="stopLoss"
              type="number"
              min="0"
              step="0.01"
              placeholder={`e.g., ${(currentPrice * 0.95).toFixed(2)}`}
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
          </div>

          {/* Take Profit (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="takeProfit">
              Take Profit (Optional)
              <span className="text-xs text-muted-foreground ml-2">
                Exit if price rises to this level
              </span>
            </Label>
            <Input
              id="takeProfit"
              type="number"
              min="0"
              step="0.01"
              placeholder={`e.g., ${(currentPrice * 1.1).toFixed(2)}`}
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
            />
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="font-bold">${totalCost.toFixed(2)}</span>
            </div>
            {potentialProfit > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Profit</span>
                <span className="font-bold text-green-500">
                  +${potentialProfit.toFixed(2)}
                </span>
              </div>
            )}
            {potentialLoss > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Loss</span>
                <span className="font-bold text-red-500">
                  -${potentialLoss.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              This is a simulated trading environment. No real money is involved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleBuy}
              disabled={quantityNum <= 0}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {orderType === "buy" ? "Buy" : "Sell"} {name}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
