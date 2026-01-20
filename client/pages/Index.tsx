import { ArrowRight, BarChart3, Zap, Shield, TrendingUp, Brain, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-primary">AI-Powered Trading</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Automate Your
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Trading Strategy</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              TradeX combines advanced machine learning with real-time market analysis to execute trades automatically. Let AI handle the analysis while you focus on strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/25 transition transform hover:scale-105"
              >
                Launch Platform
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary/30 text-primary rounded-lg font-medium hover:bg-primary/5 transition">
                Watch Demo
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-card to-muted/30 border border-border rounded-3xl p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Portfolio Value</p>
                    <p className="text-2xl font-bold">$245,320.50</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-background rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Active Trades</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                  <div className="p-4 bg-background rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Win Rate</p>
                    <p className="text-xl font-bold text-success">76%</p>
                  </div>
                </div>
                <div className="p-4 bg-background rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground mb-3">Today's P&L</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-success">+$3,240.89</p>
                    <p className="text-sm text-success">+4.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for intelligent, automated trading
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">ML-Powered Signals</h3>
            <p className="text-muted-foreground">
              Advanced machine learning models analyze market patterns and generate intelligent buy/sell signals
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-secondary/50 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Auto-Trading Execution</h3>
            <p className="text-muted-foreground">
              Automated order placement based on ML signals with real-time position tracking
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-accent/50 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Live Dashboard</h3>
            <p className="text-muted-foreground">
              Real-time charts, metrics, and portfolio performance visualization with interactive analytics
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/50 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Risk Management</h3>
            <p className="text-muted-foreground">
              Intelligent stop-loss and take-profit controls to protect your capital automatically
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-secondary/50 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Gauge className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Bot Control Panel</h3>
            <p className="text-muted-foreground">
              Start/stop trading, monitor status in real-time, and configure strategies with ease
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-accent/50 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Portfolio Tracking</h3>
            <p className="text-muted-foreground">
              Detailed position management, P&L tracking, and comprehensive trade history analytics
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-r from-primary via-secondary to-primary/80 rounded-3xl p-12 md:p-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-96 h-96 -top-40 -right-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute w-96 h-96 -bottom-40 -left-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Automate Your Trading?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join traders worldwide who use TradeX to automate their strategies and increase profitability
            </p>
            <Link 
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-bold hover:shadow-2xl transition transform hover:scale-105"
            >
              Start Trading Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">TradeX</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered automated trading platform</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition">Features</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link></li>
                <li><Link to="/" className="hover:text-primary transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition">About</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition">Contact</Link></li>
                <li><Link to="/" className="hover:text-primary transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition">Privacy</Link></li>
                <li><Link to="/" className="hover:text-primary transition">Terms</Link></li>
                <li><Link to="/" className="hover:text-primary transition">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 TradeX. All rights reserved. Trading involves risk. See disclosures.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
