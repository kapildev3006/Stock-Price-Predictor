import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TradingProvider } from "@/contexts/TradingContext";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Recommendations from "./pages/Recommendations";
import WatchlistPage from "./pages/WatchlistPage";
import TradingBot from "./pages/TradingBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TradingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trading-bot" element={<TradingBot />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TradingProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
