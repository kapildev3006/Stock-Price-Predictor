# Binance Watchlist Integration

## Features

### 1. **Real-time Watchlist**
- Located in the dashboard sidebar
- Displays live cryptocurrency prices from Binance
- Shows 24-hour price changes with visual indicators
- Auto-updates every 10 seconds
- Add/remove symbols dynamically

### 2. **API Configuration**
- Secure API key management (stored locally in browser)
- Test connection to verify API keys
- View account balances
- Read-only access recommended for security

## How to Use

### Viewing the Watchlist

1. Navigate to the Dashboard page at `/dashboard`
2. The watchlist appears in the left sidebar
3. Default symbols include: BTC, ETH, BNB, SOL, ADA

### Adding Symbols

1. Click the **+** button in the watchlist header
2. Enter a cryptocurrency symbol (e.g., `BTC`, `ETH`, `DOGE`)
3. Click "Add" - the system automatically appends "USDT"
4. The new symbol will appear in your watchlist

### Removing Symbols

1. Hover over any symbol in the watchlist
2. Click the **X** button that appears
3. The symbol will be removed from your watchlist

### Configuring API Keys (Optional)

For advanced features like viewing account balances:

1. Go to Dashboard → **API Settings** tab
2. Enter your Binance API Key and Secret Key
3. Click "Save Keys" (stored locally in your browser)
4. Click "Test Connection" to verify

**Security Note:** Your API keys are stored only in your browser's localStorage and are never sent to our servers. We recommend using API keys with **read-only** permissions.

## API Endpoints

### Public Endpoints (No API Key Required)

- `GET /api/binance/ticker?symbols=BTCUSDT,ETHUSDT`
  - Get 24-hour ticker data for specified symbols
  
- `GET /api/binance/symbols`
  - Get all available trading pairs on Binance

### Private Endpoints (API Key Required)

- `GET /api/binance/account`
  - Headers: `x-api-key`, `x-secret-key`
  - Get account balances

## Technical Details

### Components

- **`Watchlist.tsx`** - Main watchlist component with real-time updates
- **`BinanceApiConfig.tsx`** - API key configuration and testing
- **`server/routes/binance.ts`** - Backend API handlers
- **`shared/binance.ts`** - TypeScript interfaces

### Data Flow

1. Frontend requests ticker data from `/api/binance/ticker`
2. Backend fetches data from Binance public API
3. Data is returned to frontend and displayed
4. Updates automatically every 10 seconds

### Default Watchlist

The following symbols are included by default:
- BTCUSDT (Bitcoin)
- ETHUSDT (Ethereum)
- BNBUSDT (Binance Coin)
- SOLUSDT (Solana)
- ADAUSDT (Cardano)

## Getting Binance API Keys

1. Go to [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create a new API key
3. **Important:** Enable only "Read" permissions for security
4. Save your API Key and Secret Key securely
5. Add them in the Dashboard → API Settings

## Troubleshooting

### "Failed to fetch ticker data"
- Check your internet connection
- Verify the symbol exists on Binance (must be paired with USDT)
- Try refreshing the page

### "Binance API error" (when testing connection)
- Verify your API keys are correct
- Ensure API key has proper permissions
- Check if your IP is whitelisted (if required)

### Watchlist not updating
- Check browser console for errors
- Verify the dev server is running
- Try manually refreshing with the refresh button

## Future Enhancements

Potential features to add:
- Price alerts and notifications
- Historical price charts
- Multiple watchlist tabs
- Export/import watchlist
- WebSocket integration for real-time updates
- Trading functionality (with proper API permissions)
