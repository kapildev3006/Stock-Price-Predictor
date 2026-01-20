import { Watchlist } from "@/components/Watchlist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Watchlist</h1>
        </div>
        <p className="text-muted-foreground">
          Track your favorite cryptocurrencies in real-time
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Update Frequency</p>
                <p className="text-lg font-bold">2 seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <div className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500"></span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data Status</p>
                <p className="text-lg font-bold text-green-500">Live</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Star className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data Source</p>
                <p className="text-lg font-bold">Binance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Component */}
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
          <CardDescription>
            Click any cryptocurrency to trade. Click the + button to add new symbols.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Watchlist />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold">How to use Watchlist:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Add symbols:</strong> Click the + button and enter a crypto symbol (e.g., BTC, ETH, SOL)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Remove symbols:</strong> Hover over any item and click the X button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Trade:</strong> Click any cryptocurrency in the list to open the buy dialog</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Live updates:</strong> All prices update automatically every 2 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>From Recommendations:</strong> You can add cryptos directly from the Recommendations page</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
