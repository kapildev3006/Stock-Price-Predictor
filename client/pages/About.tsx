import { TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About TradeX</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            TradeX is revolutionizing automated trading by combining cutting-edge machine learning with real-time market analysis. Our mission is to democratize intelligent trading for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-4">
              We believe that sophisticated trading algorithms should be accessible to everyone, not just institutional investors. TradeX empowers retail traders with institutional-grade tools and AI-driven insights.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              By automating the analysis and execution of trades, we free traders to focus on strategy while our algorithms handle the heavy lifting.
            </p>
            <Link 
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-card to-muted/30 border border-border rounded-3xl p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border border-border/50">
                  <p className="text-sm font-medium mb-2">Founded</p>
                  <p className="text-2xl font-bold">2024</p>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border/50">
                  <p className="text-sm font-medium mb-2">Active Users</p>
                  <p className="text-2xl font-bold">10,000+</p>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border/50">
                  <p className="text-sm font-medium mb-2">Trading Volume</p>
                  <p className="text-2xl font-bold">$500M+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Innovation</h3>
            <p className="text-muted-foreground">
              We continuously push the boundaries of what's possible in algorithmic trading, leveraging the latest in AI and machine learning.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Security</h3>
            <p className="text-muted-foreground">
              Your capital and data are protected with enterprise-grade security, encryption, and compliance standards.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Transparency</h3>
            <p className="text-muted-foreground">
              Full visibility into all trading signals, decisions, and performance metrics. No hidden algorithms or black boxes.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose TradeX?</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            "Advanced ML models trained on millions of historical trades",
            "Real-time signal generation with 90%+ accuracy rates",
            "Automated risk management with customizable parameters",
            "Paper trading to test strategies before live trading",
            "Professional-grade charting and analytics",
            "24/7 market monitoring and execution",
            "Multi-asset support (stocks, crypto, futures)",
            "Community-driven strategy sharing and optimization",
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
              <p className="text-lg text-foreground">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Our Team</h2>
        <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          Founded by experienced traders and AI engineers, TradeX combines deep market knowledge with cutting-edge technology.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Alex Chen", role: "Founder & CEO", bio: "15+ years in algorithmic trading" },
            { name: "Sarah Martinez", role: "CTO", bio: "ML expert, Stanford PhD" },
            { name: "James Wilson", role: "Head of Strategy", bio: "Former hedge fund manager" },
          ].map((member, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-primary font-medium mb-3">{member.role}</p>
              <p className="text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-r from-primary via-secondary to-primary/80 rounded-3xl p-12 md:p-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-96 h-96 -top-40 -right-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Join the Trading Revolution</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Start automating your trading strategy today
            </p>
            <Link 
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-bold hover:shadow-2xl transition transform hover:scale-105"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              © 2024 TradeX. All rights reserved. Trading involves risk. See disclosures.
            </p>
            <p className="text-sm text-muted-foreground">
              Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
