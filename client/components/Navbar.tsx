import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TradeX
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-foreground hover:text-primary transition hidden sm:block"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-foreground hover:text-primary transition hidden sm:block"
          >
            Dashboard
          </Link>
          <Link
            to="/trading-bot"
            className="text-sm font-medium text-foreground hover:text-primary transition hidden lg:block"
          >
            Trading Bot
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-foreground hover:text-primary transition hidden md:block"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-foreground hover:text-primary transition hidden md:block"
          >
            Contact
          </Link>
          <DarkModeToggle />
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
