# 🗄️ MongoDB Database Integration

## ✅ Overview

TradeX now uses **MongoDB** as the primary database for persisting trading positions, watchlists, and API configurations. This replaces the previous localStorage-only approach with a robust, scalable database solution.

---

## 🎯 What's Stored in MongoDB

### **1. Trading Positions**
- All buy/sell positions (open and closed)
- Entry/exit prices and times
- Profit/Loss calculations
- Stop-loss and take-profit levels
- Position status and metadata

### **2. Watchlist**
- User's custom cryptocurrency watchlist
- Symbol names and metadata
- Addition timestamps

### **3. API Configurations** *(Future)*
- Binance API keys (encrypted)
- User preferences
- Trading bot settings

---

## 📦 Dependencies Installed

```json
{
  "mongodb": "^7.0.0",
  "mongoose": "^8.19.3"
}
```

- **mongodb** - Official MongoDB driver
- **mongoose** - ODM (Object Data Modeling) library for MongoDB

---

## 📁 Project Structure

```
server/
├── db/
│   ├── connection.ts          # MongoDB connection handler
│   └── models/
│       ├── Position.ts        # Position schema & model
│       ├── Watchlist.ts       # Watchlist schema & model
│       └── ApiConfig.ts       # API config schema & model
├── routes/
│   ├── positions.ts           # Position CRUD operations
│   └── watchlist.ts           # Watchlist CRUD operations
└── index.ts                   # Updated with DB routes
```

---

## 🔌 MongoDB Connection

### **Connection Module**
**File:** `server/db/connection.ts`

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tradex";

export async function connectToDatabase() {
  if (isConnected) {
    return; // Reuse existing connection
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
}
```

### **Features:**
- ✅ Connection pooling and reuse
- ✅ Automatic reconnection
- ✅ Graceful shutdown handling
- ✅ Error logging and monitoring

---

## 📊 Database Models

### **1. Position Model**

**Schema:**
```typescript
{
  userId: String,           // User identifier (default: "default_user")
  symbol: String,           // Trading pair (e.g., "BTCUSDT")
  name: String,             // Display name (e.g., "Bitcoin")
  quantity: Number,         // Amount traded
  entryPrice: Number,       // Entry price
  currentPrice: Number,     // Current/exit price
  pnl: Number,              // Profit/Loss in USD
  pnlPercent: Number,       // P&L percentage
  status: "open" | "closed",
  entryTime: Date,
  exitTime: Date,           // Optional
  stopLoss: Number,         // Optional
  takeProfit: Number,       // Optional
  type: "buy" | "sell",
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId + status` - Fast filtering by user and status
- `userId + entryTime` - Chronological sorting
- `symbol + status` - Symbol-based queries

**Auto-calculated Fields:**
- `pnl` - Calculated on save based on type
- `pnlPercent` - Percentage return

### **2. Watchlist Model**

**Schema:**
```typescript
{
  userId: String,           // User identifier
  symbols: [
    {
      symbol: String,       // Trading pair
      name: String,         // Display name
      addedAt: Date        // When added
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Default Symbols:**
- BTCUSDT (Bitcoin)
- ETHUSDT (Ethereum)
- BNBUSDT (Binance Coin)

### **3. ApiConfig Model**

**Schema:**
```typescript
{
  userId: String,
  apiKey: String,
  secretKey: String,        // Encrypted with AES-256
  isActive: Boolean,
  lastUsed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Security:**
- Secret keys encrypted with AES-256-CBC
- Encryption key from environment variable
- Decryption method available on model

---

## 🔌 API Endpoints

### **Position Endpoints**

#### **GET /api/positions**
Get all positions for a user.

**Query Parameters:**
- `userId` (optional) - User ID (default: "default_user")
- `status` (optional) - Filter by "open" or "closed"

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "symbol": "BTCUSDT",
      "name": "Bitcoin",
      "quantity": 0.5,
      "entryPrice": 67890.50,
      "currentPrice": 68050.25,
      "pnl": 79.88,
      "pnlPercent": 0.24,
      "status": "open",
      "type": "buy",
      "entryTime": "2025-11-08T16:00:00.000Z",
      ...
    }
  ]
}
```

#### **POST /api/positions**
Create a new position.

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "name": "Bitcoin",
  "quantity": 0.5,
  "entryPrice": 67890.50,
  "currentPrice": 67890.50,
  "type": "buy",
  "stopLoss": 65000,
  "takeProfit": 70000
}
```

#### **PUT /api/positions/:id**
Update a position (e.g., current price).

**Request Body:**
```json
{
  "currentPrice": 68500.00
}
```

#### **POST /api/positions/:id/close**
Close a position.

**Request Body:**
```json
{
  "currentPrice": 68500.00
}
```

#### **DELETE /api/positions/:id**
Delete a position permanently.

#### **POST /api/positions/update-prices**
Bulk update current prices for multiple symbols.

**Request Body:**
```json
{
  "prices": [
    { "symbol": "BTCUSDT", "price": 68500.00 },
    { "symbol": "ETHUSDT", "price": 3500.00 }
  ]
}
```

### **Watchlist Endpoints**

#### **GET /api/watchlist**
Get user's watchlist.

**Query Parameters:**
- `userId` (optional) - User ID (default: "default_user")

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "default_user",
    "symbols": [
      {
        "symbol": "BTCUSDT",
        "name": "Bitcoin",
        "addedAt": "2025-11-08T16:00:00.000Z"
      }
    ]
  }
}
```

#### **POST /api/watchlist**
Add symbol to watchlist.

**Request Body:**
```json
{
  "symbol": "SOLUSDT",
  "name": "Solana"
}
```

#### **DELETE /api/watchlist/:symbol**
Remove symbol from watchlist.

**Example:**
```
DELETE /api/watchlist/SOLUSDT
```

#### **PUT /api/watchlist**
Update entire watchlist.

**Request Body:**
```json
{
  "symbols": [
    { "symbol": "BTCUSDT", "name": "Bitcoin" },
    { "symbol": "ETHUSDT", "name": "Ethereum" }
  ]
}
```

---

## 🚀 Setup Instructions

### **Option 1: Local MongoDB**

1. **Install MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker:
     ```bash
     docker run -d -p 27017:27017 --name mongodb mongo:latest
     ```

2. **Update .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/tradex
   ```

3. **Start Server**
   ```bash
   pnpm dev
   ```

MongoDB will automatically create the `tradex` database and collections.

### **Option 2: MongoDB Atlas (Cloud)**

1. **Create Free Cluster**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up and create a free cluster

2. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string

3. **Update .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tradex
   ```

4. **Whitelist IP**
   - In Atlas, go to Network Access
   - Add your IP or allow all (0.0.0.0/0)

5. **Start Server**
   ```bash
   pnpm dev
   ```

---

## 🔐 Security Features

### **1. Encrypted API Keys**
- Secret keys encrypted with AES-256-CBC
- Encryption key stored in environment variable
- Never stored in plain text

### **2. Environment Variables**
```env
MONGODB_URI=mongodb://localhost:27017/tradex
ENCRYPTION_KEY=your-32-character-secret-key!!
```

**⚠️ Important:** Change `ENCRYPTION_KEY` in production!

### **3. Connection Security**
- Use MongoDB Atlas with TLS/SSL
- Whitelist specific IPs
- Use strong passwords
- Enable authentication

---

## 📊 Data Migration

### **From localStorage to MongoDB**

If you have existing data in localStorage, you can migrate it:

```javascript
// Get positions from localStorage
const positions = JSON.parse(localStorage.getItem('trading_positions') || '[]');

// Send to API
for (const position of positions) {
  await fetch('/api/positions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(position)
  });
}
```

---

## 🧪 Testing

### **Test Connection**
```bash
curl http://localhost:8080/api/ping
```

### **Test Position Creation**
```bash
curl -X POST http://localhost:8080/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "name": "Bitcoin",
    "quantity": 0.5,
    "entryPrice": 67890.50,
    "currentPrice": 67890.50,
    "type": "buy"
  }'
```

### **Test Get Positions**
```bash
curl http://localhost:8080/api/positions
```

### **Test Watchlist**
```bash
curl http://localhost:8080/api/watchlist
```

---

## 🔄 Data Flow

### **Creating a Position**
```
User clicks "Buy Bitcoin" in UI
    ↓
Frontend sends POST to /api/positions
    ↓
Server validates data
    ↓
Mongoose creates Position document
    ↓
MongoDB stores in positions collection
    ↓
Server returns saved position
    ↓
Frontend updates UI
```

### **Updating Prices**
```
Watchlist fetches new prices
    ↓
Frontend sends POST to /api/positions/update-prices
    ↓
Server finds all open positions for symbols
    ↓
Updates currentPrice for each
    ↓
Mongoose recalculates P&L automatically
    ↓
MongoDB saves updated documents
    ↓
Frontend fetches updated positions
```

---

## 🐛 Troubleshooting

### **Connection Failed**
```
Error: Failed to connect to MongoDB
```

**Solutions:**
- Check MongoDB is running: `mongosh` or check Docker
- Verify MONGODB_URI in .env
- Check firewall/network settings
- For Atlas: Verify IP whitelist

### **Authentication Error**
```
Error: Authentication failed
```

**Solutions:**
- Check username/password in connection string
- Verify user has correct permissions
- For Atlas: Check database user credentials

### **Collection Not Found**
```
Error: Collection 'positions' not found
```

**Solution:**
- Collections are created automatically on first insert
- Just create a position and it will be created

---

## 📈 Performance

### **Indexes**
All models have optimized indexes for:
- Fast user-based queries
- Status filtering
- Chronological sorting
- Symbol lookups

### **Connection Pooling**
- Mongoose maintains connection pool
- Reuses connections for efficiency
- Configurable pool size

### **Query Optimization**
- Lean queries for read-only operations
- Projection to fetch only needed fields
- Aggregation for complex analytics

---

## 🚀 Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Real-time updates with MongoDB Change Streams
- [ ] Data analytics and reporting
- [ ] Backup and restore functionality
- [ ] Data archiving for old positions
- [ ] Full-text search on positions
- [ ] Advanced filtering and sorting
- [ ] Export data to CSV/JSON

---

## 📝 Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tradex

# Security
ENCRYPTION_KEY=your-32-character-secret-key!!

# Optional: MongoDB Options
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
```

---

## ✅ Benefits of MongoDB Integration

1. **Persistence** - Data survives browser refresh and server restart
2. **Scalability** - Handle millions of positions and users
3. **Performance** - Fast queries with proper indexing
4. **Reliability** - ACID transactions and data integrity
5. **Flexibility** - Easy schema evolution
6. **Analytics** - Powerful aggregation framework
7. **Backup** - Easy data backup and restore
8. **Multi-device** - Access data from anywhere

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: November 8, 2025

---

## 🎉 Summary

Your TradeX application now has a professional database backend with:
- ✅ MongoDB integration
- ✅ Mongoose ODM with schemas
- ✅ RESTful API endpoints
- ✅ Data persistence
- ✅ Security features
- ✅ Scalable architecture

Start your server and MongoDB will handle all data storage automatically!
