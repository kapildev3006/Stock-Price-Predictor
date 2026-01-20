# TradeX - AI-Powered Cryptocurrency Trading Platform

<div align="center">

![TradeX Logo](https://img.shields.io/badge/TradeX-Trading%20Platform-blue?style=for-the-badge)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A production-ready cryptocurrency trading platform with real-time market data, simulated trading, and comprehensive portfolio management.**

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Core Features](#-core-features)
- [API Integration](#-api-integration)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**TradeX** is a modern, full-stack cryptocurrency trading platform that combines real-time market data from Binance with an intuitive trading interface. Built with React 18, TypeScript, and Express, it offers a complete trading simulation environment perfect for learning, testing strategies, or building upon for production use.

### Key Highlights

- 🔴 **Real-time Market Data** - Live cryptocurrency prices updated every second
- 📊 **Candlestick Charts** - Professional trading charts with multiple timeframes
- 💹 **Simulated Trading** - Practice trading without risking real money
- 📈 **Portfolio Management** - Track positions, P&L, and trading history
- 🔐 **Secure API Integration** - Optional Binance API key support
- 🎨 **Modern UI/UX** - Beautiful, responsive design with TailwindCSS
- ⚡ **Fast & Reliable** - Built on Vite for lightning-fast development

---

## ✨ Features

### 🎯 Real-Time Cryptocurrency Watchlist

- **Live Price Updates** - Prices refresh every 1 second with visual indicators
- **24-Hour Statistics** - View price changes, highs, lows, and trends
- **Custom Symbols** - Add/remove any cryptocurrency trading pair
- **Persistent Storage** - Your watchlist is saved locally
- **Smart Validation** - Automatic USDT pairing and error handling

### 📊 Professional Candlestick Charts

- **Real-Time OHLC Data** - Live candlestick charts from Binance
- **Multiple Timeframes** - Switch between 1m, 5m, 15m, 1h, 4h, 1d intervals
- **Interactive Charts** - Zoom, pan, and crosshair for precise analysis
- **Auto-Refresh** - Charts update automatically every 30 seconds
- **TradingView Technology** - Powered by Lightweight Charts library
- **Professional Styling** - Green/red candles with smooth animations

### 💹 Simulated Trading System

- **One-Click Trading** - Click any symbol in the watchlist to trade
- **Buy/Sell Orders** - Execute market orders instantly
- **Stop-Loss & Take-Profit** - Set risk management parameters
- **Real-Time P&L** - Track profit/loss as prices change
- **Position Management** - View, monitor, and close positions

### 📊 Portfolio Analytics

- **Today's Positions** - Focus on active trades opened today
- **Trading History** - Complete record of all closed positions
- **Performance Metrics** - Win rate, average win/loss, total P&L
- **Duration Tracking** - See how long each trade lasted
- **Expandable Details** - Full trade information at your fingertips

### 🔐 API Configuration (Optional)

- **Secure Key Storage** - API keys stored locally in browser only
- **Account Balances** - View your Binance account balances
- **Connection Testing** - Verify API keys before use
- **Read-Only Recommended** - Best practices for security

### 🎨 Modern User Interface

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme** - Comfortable viewing in any environment
- **Smooth Animations** - Polished transitions and interactions
- **Intuitive Navigation** - Easy-to-use interface for all skill levels
- **Loading States** - Skeleton loaders for better UX

---

## 🛠 Tech Stack

### Frontend

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Next-generation frontend tooling
- **React Router 6** - SPA routing with data loading
- **TailwindCSS 3** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Smooth animations
- **React Query** - Powerful data fetching and caching
- **Recharts** - Composable charting library

### Backend

- **Express 5** - Fast, minimalist web framework
- **TypeScript** - Type-safe server code
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - ODM for MongoDB with schemas
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools

- **pnpm** - Fast, disk space efficient package manager
- **Vitest** - Blazing fast unit test framework
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **SWC** - Super-fast TypeScript/JavaScript compiler

### UI Components

- **shadcn/ui** - Re-usable component library
- **Radix UI Primitives** - Unstyled, accessible components
- **Tailwind Animate** - Animation utilities
- **Sonner** - Toast notifications
- **React Hook Form** - Performant form handling

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** 8+ (or npm/yarn)
- **Git** (for cloning)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nova-landing.git
   cd nova-landing
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   ```
   http://localhost:8080
   ```

### First Steps

1. **Explore the Landing Page** - Learn about TradeX features
2. **Navigate to Dashboard** - Click "Launch Platform" or "Dashboard" in nav
3. **View the Watchlist** - See real-time cryptocurrency prices
4. **Try Trading** - Click any symbol to open the trading dialog
5. **Monitor Positions** - Switch to the "Positions" tab to track trades

---

## 📁 Project Structure

```
nova-landing/
├── client/                      # Frontend React application
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui component library
│   │   ├── Watchlist.tsx        # Real-time crypto watchlist
│   │   ├── BuyDialog.tsx        # Trading order dialog
│   │   ├── PositionsManagement.tsx  # Position tracking
│   │   ├── TradingHistory.tsx   # Historical trades
│   │   ├── BinanceApiConfig.tsx # API key configuration
│   │   ├── Dashboard.tsx        # Main dashboard layout
│   │   └── BotControlPanel.tsx  # Trading bot controls
│   ├── contexts/                # React context providers
│   │   └── TradingContext.tsx   # Global trading state
│   ├── pages/                   # Route components
│   │   ├── Index.tsx            # Landing page (home)
│   │   ├── DashboardPage.tsx    # Trading dashboard
│   │   ├── About.tsx            # About page
│   │   ├── Contact.tsx          # Contact page
│   │   └── NotFound.tsx         # 404 page
│   ├── App.tsx                  # App entry point & routing
│   └── global.css               # Global styles & Tailwind config
│
├── server/                      # Backend Express server
│   ├── routes/                  # API route handlers
│   │   └── binance.ts           # Binance API integration
│   └── index.ts                 # Server setup & configuration
│
├── shared/                      # Shared TypeScript types
│   ├── api.ts                   # API interfaces
│   ├── binance.ts               # Binance data types
│   └── trading.ts               # Trading system types
│
├── public/                      # Static assets
│   └── favicon.ico              # Site favicon
│
├── netlify/                     # Netlify deployment config
│   └── functions/               # Serverless functions
│
├── .env                         # Environment variables (gitignored)
├── package.json                 # Dependencies & scripts
├── pnpm-lock.yaml               # Lockfile
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── vite.config.ts               # Vite configuration (client)
├── vite.config.server.ts        # Vite configuration (server)
├── postcss.config.js            # PostCSS configuration
├── components.json              # shadcn/ui configuration
└── README.md                    # This file
```

### Key Directories

- **`client/`** - All frontend code (React, components, pages)
- **`server/`** - Backend API server (Express routes)
- **`shared/`** - TypeScript types shared between client and server
- **`client/components/ui/`** - Pre-built UI component library (shadcn/ui)
- **`client/pages/`** - Route-level components (Index.tsx = home page)

---

## 🎯 Core Features

### 1. Real-Time Watchlist

**Location:** Dashboard Sidebar (Left Panel)

The watchlist displays live cryptocurrency prices with automatic updates:

- **Default Symbols:** BTC, ETH, BNB (customizable)
- **Update Frequency:** Every 1 second
- **Data Source:** Binance Public API
- **Features:**
  - Live price with pulsing indicator
  - 24-hour price change percentage
  - Trending up/down icons (green/red)
  - 24-hour high/low prices
  - Add custom symbols dynamically
  - Remove symbols with one click
  - Persistent storage (localStorage)

**How to Use:**
1. View real-time prices in the sidebar
2. Click the **+** button to add symbols
3. Enter symbol (e.g., "SOL", "ADA", "DOGE")
4. Hover over symbols to remove them
5. Click refresh icon for manual update

### 2. Simulated Trading

**Location:** Click any symbol in watchlist → Trading Dialog

Execute simulated trades without risking real money:

- **Order Types:** Market orders (instant execution)
- **Trade Directions:** Buy or Sell
- **Risk Management:**
  - Optional stop-loss levels
  - Optional take-profit targets
- **Order Preview:**
  - Total cost calculation
  - Potential profit/loss preview
  - Current market price display

**Trading Flow:**
```
Watchlist → Click Symbol → Trading Dialog → Enter Details → Place Order → Position Created
```

**How to Trade:**
1. Click any cryptocurrency in the watchlist
2. Choose Buy or Sell
3. Enter quantity (e.g., 0.5 BTC)
4. Set stop-loss (optional, e.g., $60,000)
5. Set take-profit (optional, e.g., $75,000)
6. Review order summary
7. Click "Buy [Symbol]" or "Sell [Symbol]"
8. Position appears in Positions tab

### 3. Position Management

**Location:** Dashboard → Positions Tab

Track all your open positions with real-time updates:

- **Today's Positions:** Shows only positions opened today
- **Real-Time P&L:** Profit/loss updates as prices change
- **Summary Cards:**
  - Today's Positions count
  - Today's P&L total
  - Average Position Size
- **Position Details:**
  - Symbol and name
  - Quantity held
  - Entry price
  - Current price
  - P&L ($ and %)
  - Entry time
  - Stop-loss level
  - Take-profit target
- **Actions:**
  - Expand for full details
  - Close position manually

**How to Monitor:**
1. Go to Dashboard → Positions tab
2. View summary cards at the top
3. See all open positions in the table
4. Click expand arrow for details
5. Click "Close Position" to exit trade

### 4. Trading History

**Location:** Positions Tab → "View History" Button

Review all your closed positions and performance:

- **All Closed Trades:** Complete historical record
- **Performance Metrics:**
  - Total Trades count
  - Win Rate percentage
  - Total P&L
  - Average Win vs Average Loss
- **Trade Details:**
  - Entry and exit prices
  - Duration of trade
  - Final P&L
  - Stop-loss and take-profit levels
- **Sorting & Filtering:** Easy navigation through history

**How to Use:**
1. Click "View History" button (top-right of Positions tab)
2. Review performance statistics
3. Expand trades for full details
4. Click "Back to Positions" to return

### 5. API Configuration

**Location:** Dashboard → API Settings Tab

Configure Binance API keys for advanced features:

- **Secure Storage:** Keys stored locally in browser only
- **Features:**
  - View account balances
  - Test connection
  - Update or clear keys
- **Security:**
  - Masked secret key input
  - Read-only permissions recommended
  - Never sent to application servers
  - Security warnings and best practices

**How to Configure:**
1. Go to Dashboard → API Settings tab
2. Enter your Binance API Key
3. Enter your Binance Secret Key
4. Click "Save Keys"
5. Click "Test Connection" to verify
6. View account balances

**Getting API Keys:**
1. Visit [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create a new API key
3. Enable **only "Read" permissions** for security
4. Save your API Key and Secret Key securely
5. Add them in the Dashboard → API Settings

---

## 🔌 API Integration

### Public Endpoints (No API Key Required)

#### Get Ticker Data
```http
GET /api/binance/ticker?symbols=BTCUSDT,ETHUSDT
```

Fetches 24-hour ticker data for specified symbols.

**Query Parameters:**
- `symbols` - Comma-separated list of trading pairs (e.g., "BTCUSDT,ETHUSDT")

**Response:**
```json
[
  {
    "symbol": "BTCUSDT",
    "lastPrice": "67890.50",
    "priceChange": "1234.50",
    "priceChangePercent": "1.85",
    "highPrice": "68500.00",
    "lowPrice": "66000.00"
  }
]
```

#### Get Available Symbols
```http
GET /api/binance/symbols
```

Returns all available USDT trading pairs on Binance.

**Response:**
```json
[
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  ...
]
```

### Private Endpoints (API Key Required)

#### Get Account Information
```http
GET /api/binance/account
```

Returns account balances and information.

**Headers:**
- `x-api-key` - Your Binance API key
- `x-secret-key` - Your Binance secret key

**Response:**
```json
{
  "balances": [
    {
      "asset": "BTC",
      "free": "0.12345678",
      "locked": "0.00000000"
    }
  ]
}
```

### Data Flow

```
Frontend (Watchlist.tsx)
    ↓ fetch('/api/binance/ticker?symbols=...')
Backend (server/routes/binance.ts)
    ↓ fetch('https://api.binance.com/api/v3/ticker/24hr')
Binance API
    ↓ JSON response
Backend processes & returns
    ↓ JSON response
Frontend displays & updates UI
```

### Error Handling

- Individual symbol failures don't break entire watchlist
- 5-second timeout prevents hanging requests
- User-friendly error messages
- Console warnings for debugging
- Graceful degradation (shows loading state)

---

## 💻 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (client + server) at http://localhost:8080
pnpm typecheck        # Run TypeScript type checking

# Building
pnpm build            # Build both client and server for production
pnpm build:client     # Build only the client
pnpm build:server     # Build only the server

# Production
pnpm start            # Start production server

# Testing
pnpm test             # Run Vitest tests

# Code Quality
pnpm format.fix       # Format code with Prettier
```

### Development Server

The development server runs on a single port (8080) with:
- **Frontend:** Vite dev server with HMR (Hot Module Replacement)
- **Backend:** Express server with hot reload
- **API Proxy:** `/api/*` routes proxied to backend

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Binance API (Optional - for server-side operations)
BINANCE_API_KEY=your_api_key_here
BINANCE_SECRET_KEY=your_secret_key_here

# Other Configuration
VITE_API_URL=http://localhost:8080
```

**Note:** User API keys are stored in browser localStorage, not in environment variables.

### Adding New Features

#### Add a New Page Route

1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
   ```typescript
   <Route path="/my-page" element={<MyPage />} />
   ```

#### Add a New API Endpoint

1. **(Optional)** Create shared interface in `shared/api.ts`:
   ```typescript
   export interface MyRouteResponse {
     message: string;
   }
   ```

2. Create route handler in `server/routes/my-route.ts`:
   ```typescript
   import { RequestHandler } from "express";
   import { MyRouteResponse } from "@shared/api";

   export const handleMyRoute: RequestHandler = (req, res) => {
     const response: MyRouteResponse = {
       message: 'Hello from my endpoint!'
     };
     res.json(response);
   };
   ```

3. Register route in `server/index.ts`:
   ```typescript
   import { handleMyRoute } from "./routes/my-route";
   app.get("/api/my-endpoint", handleMyRoute);
   ```

4. Use in React components:
   ```typescript
   import { MyRouteResponse } from '@shared/api';
   
   const response = await fetch('/api/my-endpoint');
   const data: MyRouteResponse = await response.json();
   ```

#### Add a New UI Component

The project uses **shadcn/ui** components. To add a new component:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add card
```

Components are added to `client/components/ui/`.

### Styling

The project uses **TailwindCSS 3** with a custom theme:

- **Theme Configuration:** `tailwind.config.ts`
- **Global Styles:** `client/global.css`
- **Design Tokens:** CSS variables in `client/global.css`

**Utility Function:**
```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)} />
```

### Type Safety

The project uses **TypeScript** throughout:

- **Shared Types:** `shared/` directory for types used by both client and server
- **Path Aliases:**
  - `@/*` - Client folder
  - `@shared/*` - Shared folder
- **Strict Mode:** Enabled for maximum type safety

---

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

This creates:
- `dist/spa/` - Static frontend files
- `dist/server/` - Compiled server code

### Start Production Server

```bash
pnpm start
```

Server runs on port 8080 (or PORT environment variable).

### Deployment Options

#### 1. Netlify (Recommended for Frontend)

The project includes Netlify configuration:

```bash
# Deploy using Netlify CLI
netlify deploy --prod
```

**Configuration:** `netlify.toml`

#### 2. Vercel

```bash
# Deploy using Vercel CLI
vercel --prod
```

#### 3. Docker

```dockerfile
# Dockerfile example
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

#### 4. Traditional Hosting

1. Build the project: `pnpm build`
2. Upload `dist/` folder to your server
3. Run `node dist/server/node-build.mjs`
4. Configure reverse proxy (nginx, Apache)

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8080
# Add other production variables
```

---

## 📚 Documentation

Detailed feature documentation is available in the following files:

- **[AGENTS.md](./AGENTS.md)** - Project architecture and development guide
- **[MONGODB_INTEGRATION.md](./MONGODB_INTEGRATION.md)** - MongoDB database setup and usage
- **[WATCHLIST_FEATURES.md](./WATCHLIST_FEATURES.md)** - Complete watchlist documentation
- **[CANDLESTICK_CHART_FEATURE.md](./CANDLESTICK_CHART_FEATURE.md)** - Real-time candlestick charts
- **[BINANCE_INTEGRATION.md](./BINANCE_INTEGRATION.md)** - Binance API integration guide
- **[TRADING_FEATURE.md](./TRADING_FEATURE.md)** - Trading system implementation
- **[POSITIONS_HISTORY_UPDATE.md](./POSITIONS_HISTORY_UPDATE.md)** - Position tracking and history

---

## 🎨 Screenshots

### Landing Page
Beautiful, modern landing page with feature highlights and call-to-action.

### Dashboard
Real-time cryptocurrency watchlist with live price updates and trading capabilities.

### Trading Dialog
Intuitive order placement with stop-loss and take-profit configuration.

### Positions Management
Track all open positions with real-time P&L updates and performance metrics.

### Trading History
Comprehensive view of all closed positions with detailed analytics.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write TypeScript with strict types
- Add tests for new features
- Update documentation as needed
- Use conventional commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Binance** - For providing free public API access
- **shadcn/ui** - For the beautiful component library
- **Radix UI** - For accessible component primitives
- **Vite** - For the amazing build tool
- **React** - For the powerful UI framework

---

## 📞 Support

- **Documentation:** See the `/docs` folder for detailed guides
- **Issues:** Report bugs via [GitHub Issues](https://github.com/yourusername/nova-landing/issues)
- **Discussions:** Join the conversation in [GitHub Discussions](https://github.com/yourusername/nova-landing/discussions)

---

## 🗺 Roadmap

### Upcoming Features

- [ ] WebSocket integration for real-time updates
- [ ] Price alerts and notifications
- [ ] Historical price charts with technical indicators
- [ ] Multiple watchlist tabs
- [ ] Import/export watchlist and positions
- [ ] Advanced order types (limit, stop-limit)
- [ ] Auto-close at stop-loss/take-profit
- [ ] Trade history export (CSV, JSON)
- [ ] Performance analytics dashboard
- [ ] Mobile app version
- [ ] Dark/light theme toggle
- [ ] Multi-language support

### Future Enhancements

- [ ] Paper trading competition
- [ ] Social trading features
- [ ] Trade notes and journal
- [ ] Risk management tools
- [ ] Position size calculator
- [ ] Backtesting capabilities
- [ ] Strategy builder
- [ ] API for third-party integrations

---

<div align="center">

**Built with ❤️ using React, TypeScript, and TailwindCSS**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/yourusername/nova-landing/issues) • [Request Feature](https://github.com/yourusername/nova-landing/issues)

</div>
#   T r a d i n g - B o t  
 #   S t o c k - P r i c e - P r e d i c t o r  
 #   S t o c k - P r i c e - P r e d i c t o r  
 #   S t o c k - P r i c e - P r e d i c t o r  
 #   S t o c k - P r i c e - P r e d i c t o r  
 