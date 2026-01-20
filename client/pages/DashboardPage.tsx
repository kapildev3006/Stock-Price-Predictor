import { useState, useEffect } from "react";
import { TrendingUp, Menu, X, Lightbulb, Star, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { BotControlPanel } from "@/components/BotControlPanel";
import { PositionsManagement } from "@/components/PositionsManagement";
import { Watchlist } from "@/components/Watchlist";
import { BinanceApiConfig } from "@/components/BinanceApiConfig";
import Recommendations from "./Recommendations";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "bot" | "positions" | "watchlist" | "recommendations" | "settings">("overview");
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const navItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "bot", label: "Bot Control", icon: "🤖" },
    { id: "positions", label: "Positions", icon: "📈" },
    { id: "watchlist", label: "Watchlist", icon: "⭐" },
    { id: "recommendations", label: "Recommendations", icon: "💡" },
    { id: "settings", label: "API Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">TradeX</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-muted rounded-lg transition"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition hidden sm:block">Back to Home</Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Tabs Navigation */}
        <div className={`${sidebarOpen ? 'fixed' : 'hidden'} md:relative md:block w-80 bg-card border-r border-border p-6 h-[calc(100vh-72px)] overflow-y-auto z-40`}>
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as typeof activeTab);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-lg">
              <p className="text-xs font-medium text-primary mb-2">Quick Access</p>
              <p className="text-xs text-muted-foreground">
                Click Watchlist above to track your favorite cryptocurrencies with live prices.
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {activeTab === "overview" && "Trading Dashboard"}
              {activeTab === "bot" && "Bot Control Panel"}
              {activeTab === "positions" && "Positions Management"}
              {activeTab === "watchlist" && "Watchlist"}
              {activeTab === "recommendations" && "Crypto Recommendations"}
              {activeTab === "settings" && "API Settings"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "overview" && "Real-time trading metrics and performance analytics"}
              {activeTab === "bot" && "Control and monitor your automated trading bot"}
              {activeTab === "positions" && "View and manage your open and closed positions"}
              {activeTab === "watchlist" && "Track your favorite cryptocurrencies with live prices and updates"}
              {activeTab === "recommendations" && "AI-powered analysis of top cryptocurrency trading opportunities"}
              {activeTab === "settings" && "Configure your Binance API keys and connection"}
            </p>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "overview" && <Dashboard />}
            {activeTab === "bot" && <BotControlPanel />}
            {activeTab === "positions" && <PositionsManagement />}
            {activeTab === "watchlist" && <Watchlist />}
            {activeTab === "recommendations" && <Recommendations />}
            {activeTab === "settings" && <BinanceApiConfig />}
          </div>
        </div>
      </div>
    </div>
  );
}
