import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
// import CandlestickChart from "./CandlestickChart";

const portfolioData = [
  { date: "Jan 1", value: 100000 },
  { date: "Jan 5", value: 102500 },
  { date: "Jan 10", value: 101800 },
  { date: "Jan 15", value: 108300 },
  { date: "Jan 20", value: 112400 },
  { date: "Jan 25", value: 115200 },
  { date: "Jan 30", value: 118500 },
  { date: "Feb 4", value: 121300 },
  { date: "Feb 9", value: 125600 },
  { date: "Feb 14", value: 129400 },
  { date: "Feb 19", value: 132800 },
  { date: "Feb 24", value: 135200 },
];

const dailyTradesData = [
  { date: "Mon", wins: 8, losses: 2 },
  { date: "Tue", wins: 10, losses: 3 },
  { date: "Wed", wins: 7, losses: 2 },
  { date: "Thu", wins: 12, losses: 4 },
  { date: "Fri", wins: 9, losses: 1 },
  { date: "Sat", wins: 6, losses: 2 },
  { date: "Sun", wins: 8, losses: 3 },
];

const winLossData = [
  { name: "Wins", value: 76, fill: "hsl(var(--success))" },
  { name: "Losses", value: 24, fill: "hsl(var(--destructive))" },
];

export function Dashboard() {
  const currentBalance = 245320.50;
  const todayPnL = 3240.89;
  const totalReturn = 35200.50;
  const winRate = 76;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
              <p className="text-3xl font-bold">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-success mt-2">↑ 0.8% today</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Today's P&L</p>
              <p className="text-3xl font-bold text-success">+${todayPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-success mt-2">↑ 4.2% return</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Return</p>
              <p className="text-3xl font-bold">${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-success mt-2">+35.2% lifetime</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent opacity-20" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
              <p className="text-3xl font-bold text-primary">{winRate}%</p>
              <p className="text-xs text-primary mt-2">60 wins / 20 losses</p>
            </div>
            <Percent className="w-8 h-8 text-primary opacity-20" />
          </div>
        </div>
      </div>

      {/* Real-Time Candlestick Chart */}
      {/* <div className="w-full">
        <CandlestickChart symbol="BTCUSDT" defaultInterval="5m" height={450} />
      </div> */}

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Portfolio Growth Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Portfolio Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trades Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Daily Trades (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyTradesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="wins" stackId="a" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="losses" stackId="a" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Win/Loss Distribution */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Win/Loss Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={winLossData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {winLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {winLossData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Recent Signals</h3>
          <div className="space-y-3">
            {[
              { symbol: 'NVDA', signal: 'BUY', price: 892.50, confidence: 92, time: '2 min ago' },
              { symbol: 'TSLA', signal: 'SELL', price: 238.50, confidence: 78, time: '15 min ago' },
              { symbol: 'SPY', signal: 'BUY', price: 485.20, confidence: 85, time: '34 min ago' },
              { symbol: 'QQQ', signal: 'HOLD', price: 368.45, confidence: 71, time: '1 hour ago' },
              { symbol: 'AAPL', signal: 'BUY', price: 185.20, confidence: 88, time: '2 hours ago' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex-1">
                  <p className="font-medium">{item.symbol}</p>
                  <p className="text-xs text-muted-foreground">${item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.signal === 'BUY' ? 'bg-success/10 text-success' :
                    item.signal === 'SELL' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {item.signal}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{item.confidence}%</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
