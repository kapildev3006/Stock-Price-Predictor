# Quick Start Guide

Get your improved trading application up and running in minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB (local or Atlas account)
- Binance account with API keys (optional for testing)
- pnpm package manager

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy the example environment file and update with your settings:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and update:

```env
# Required: Your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/tradex
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tradex

# Required: Generate a secure key
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-generated-key-here
```

### 3. Start Development Server

```bash
pnpm dev
```

Your application will be available at: `http://localhost:8080`

## 🔧 Configuration Guide

### MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. Use connection string: `mongodb://localhost:27017/tradex`

#### Option B: MongoDB Atlas (Cloud)

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string from "Connect" button
6. Update `.env` with your connection string

### Binance API Keys (Optional)

For live trading features:

1. Go to [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create new API key
3. **Important:** Enable only "Enable Reading" permission (for safety)
4. Copy API Key and Secret Key
5. Configure in the application UI (not in .env)

## ✅ Verification

### Test Your Setup

1. **Check MongoDB Connection:**
   - Start the app with `pnpm dev`
   - Look for "✅ Connected to MongoDB successfully" in console
   - If you see errors, verify your `MONGODB_URI`

2. **Test API Endpoints:**
   ```bash
   # Ping endpoint
   curl http://localhost:8080/api/ping
   
   # Should return: {"message":"ping pong"}
   ```

3. **Test UI:**
   - Open `http://localhost:8080` in browser
   - You should see the trading interface
   - Open browser console (F12) - no errors should appear

## 🎯 First Steps After Setup

1. **Configure Binance API (Optional):**
   - Click on "API Configuration" in the UI
   - Enter your API keys
   - Click "Test Connection" to verify

2. **Add Symbols to Watchlist:**
   - Use the symbol search to add trading pairs
   - Popular options: BTCUSDT, ETHUSDT, BNBUSDT

3. **Create Test Position:**
   - Enter position details
   - Use small quantities for testing
   - Verify position appears in list

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Problem:** Can't connect to MongoDB

**Solutions:**
- Verify MongoDB is running: `mongosh` (should connect)
- Check `MONGODB_URI` in `.env` is correct
- For Atlas: Verify IP whitelist and credentials
- Check firewall isn't blocking port 27017

### Port Already in Use

**Problem:** Port 8080 is already in use

**Solution:**
```bash
# Find process using port
# Windows
netstat -ano | findstr :8080

# macOS/Linux
lsof -i :8080

# Kill the process or change port in vite.config.ts
```

### Module Not Found Errors

**Problem:** Import errors or missing modules

**Solutions:**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear cache
pnpm store prune
```

### TypeScript Errors

**Problem:** Type checking errors

**Solution:**
```bash
# Run type check
pnpm typecheck

# Most issues should be auto-resolved by the improvements
```

## 📚 Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Building
pnpm build            # Build for production
pnpm build:client     # Build client only
pnpm build:server     # Build server only

# Production
pnpm start            # Run production build

# Testing
pnpm test             # Run tests
pnpm typecheck        # Check types

# Code Quality
pnpm format.fix       # Format code with Prettier
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `ENCRYPTION_KEY` to a secure random value
- [ ] Use production MongoDB instance (not local)
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific `.env` files
- [ ] Never commit `.env` to git (already in .gitignore)
- [ ] Use read-only Binance API keys
- [ ] Enable HTTPS for production
- [ ] Set up proper CORS settings
- [ ] Review and update rate limiting
- [ ] Enable MongoDB connection string encryption

## 📖 Next Steps

1. **Read the Improvements Documentation:**
   - See `IMPROVEMENTS.md` for all enhancements made

2. **Explore the Features:**
   - Trading positions management
   - Position history and statistics
   - Live price updates
   - Candlestick charts
   - Watchlist management

3. **Customize:**
   - Modify `client/global.css` for theming
   - Add new API routes in `server/routes/`
   - Create new pages in `client/pages/`

## 🆘 Need Help?

Common issues and their solutions:

| Issue | Solution |
|-------|----------|
| White screen | Check browser console for errors |
| API calls failing | Verify `.env` is configured |
| Data not persisting | Check MongoDB connection |
| Binance API errors | Verify API keys and permissions |
| Build errors | Run `pnpm install` again |

## 🎉 Success!

If you see the trading interface and can:
- ✅ View the dashboard
- ✅ Add symbols to watchlist
- ✅ Create positions
- ✅ View trading history

Your setup is complete! Start trading (or paper trading for safety)!

---

**Pro Tips:**

💡 Use read-only API keys for safety  
💡 Start with paper trading to test  
💡 Keep your `.env` file secret  
💡 Regularly backup your MongoDB data  
💡 Monitor API rate limits  

---

For detailed information about improvements, see `IMPROVEMENTS.md`
