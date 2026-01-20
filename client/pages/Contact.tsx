import { Mail, Phone, MapPin, Send, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have questions about TradeX? Our team is here to help. Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <p className="text-muted-foreground mb-4">Send us an email and we'll respond within 24 hours</p>
            <a href="mailto:support@tradex.ai" className="text-primary font-medium hover:underline">
              support@tradex.ai
            </a>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition">
            <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Phone</h3>
            <p className="text-muted-foreground mb-4">Call us Monday to Friday, 9am to 6pm EST</p>
            <a href="tel:+18885555555" className="text-secondary font-medium hover:underline">
              +1 (888) 555-5555
            </a>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition">
            <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Office</h3>
            <p className="text-muted-foreground mb-4">Visit us at our headquarters</p>
            <address className="text-accent font-medium not-italic">
              123 Trading Lane<br />
              New York, NY 10001
            </address>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-2">Send us a Message</h2>
          <p className="text-muted-foreground mb-8">Fill out the form below and we'll get back to you as soon as possible</p>

          {submitted ? (
            <div className="bg-success/10 border border-success/30 rounded-lg p-6 text-center">
              <p className="text-lg font-medium text-success mb-2">✓ Message Sent Successfully!</p>
              <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What is the minimum investment to start trading with TradeX?",
              a: "You can start with as little as $1,000. We recommend starting with paper trading first to test your strategy.",
            },
            {
              q: "Is my data and capital secure?",
              a: "Yes. We use enterprise-grade encryption, comply with all financial regulations, and never have direct access to your funds.",
            },
            {
              q: "Can I test strategies before trading live?",
              a: "Absolutely. Our paper trading feature allows you to test any strategy with real market data without risking capital.",
            },
            {
              q: "How accurate are the trading signals?",
              a: "Our ML models achieve 85-92% accuracy depending on market conditions. All signals come with confidence scores.",
            },
            {
              q: "What assets can I trade?",
              a: "We currently support stocks and ETFs, with crypto and futures coming soon.",
            },
          ].map((faq, idx) => (
            <details key={idx} className="bg-card border border-border rounded-lg p-6 cursor-pointer group">
              <summary className="font-medium text-lg flex items-center justify-between">
                {faq.q}
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="mt-4 text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-r from-primary via-secondary to-primary/80 rounded-3xl p-12 md:p-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-96 h-96 -bottom-40 -left-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of traders using TradeX to automate their strategies
            </p>
            <Link 
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-bold hover:shadow-2xl transition transform hover:scale-105"
            >
              Launch Dashboard
              <TrendingUp className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              © 2024 TradeX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
