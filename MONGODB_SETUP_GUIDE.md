# 🚀 MongoDB Setup Guide - Quick Start

## Choose Your Setup Method

### ⚡ Option 1: MongoDB Atlas (Cloud - Recommended for Beginners)

**No installation needed! Free tier available.**

#### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google

#### Step 2: Create Cluster
1. Choose "Free" tier (M0)
2. Select a cloud provider (AWS/Google/Azure)
3. Choose a region close to you
4. Click "Create Cluster" (takes 3-5 minutes)

#### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `tradex_user`
5. Password: Generate or create strong password
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

#### Step 4: Whitelist IP Address
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP for better security
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go back to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://tradex_user:<password>@cluster0.xxxxx.mongodb.net/`

#### Step 6: Update .env File
```env
MONGODB_URI=mongodb+srv://tradex_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tradex?retryWrites=true&w=majority
```

**Replace:**
- `YOUR_PASSWORD` with your actual password
- `cluster0.xxxxx` with your actual cluster address

#### Step 7: Start Your App
```bash
pnpm dev
```

✅ **Done!** MongoDB Atlas is connected!

---

### 💻 Option 2: Local MongoDB (For Development)

**Install MongoDB on your computer.**

#### For Windows:

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" and "MSI" package
   - Download and run installer

2. **Install MongoDB**
   - Choose "Complete" installation
   - Install as a Service: ✅ Yes
   - Install MongoDB Compass: ✅ Yes (GUI tool)
   - Click "Install"

3. **Verify Installation**
   ```powershell
   mongosh --version
   ```

4. **Start MongoDB** (if not running as service)
   ```powershell
   net start MongoDB
   ```

5. **Update .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/tradex
   ```

6. **Start Your App**
   ```bash
   pnpm dev
   ```

#### For macOS:

1. **Install with Homebrew**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

3. **Update .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/tradex
   ```

4. **Start Your App**
   ```bash
   pnpm dev
   ```

#### For Linux (Ubuntu/Debian):

1. **Import MongoDB GPG Key**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Update .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/tradex
   ```

6. **Start Your App**
   ```bash
   pnpm dev
   ```

---

### 🐳 Option 3: Docker (Easiest for Development)

**Requires Docker Desktop installed.**

#### Step 1: Run MongoDB Container
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

#### Step 2: Verify Container is Running
```bash
docker ps
```

You should see `mongodb` container running.

#### Step 3: Update .env
```env
MONGODB_URI=mongodb://localhost:27017/tradex
```

#### Step 4: Start Your App
```bash
pnpm dev
```

#### Useful Docker Commands:
```bash
# Stop MongoDB
docker stop mongodb

# Start MongoDB
docker start mongodb

# Remove MongoDB (data persists in volume)
docker rm mongodb

# Remove MongoDB with data
docker rm mongodb
docker volume rm mongodb_data
```

---

## ✅ Verify Connection

### Check Server Logs
When you run `pnpm dev`, you should see:
```
✅ Connected to MongoDB successfully
📊 Database: tradex
🔗 Mongoose connected to MongoDB
```

### Test API Endpoint
```bash
curl http://localhost:8080/api/positions
```

Expected response:
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to:
   - **Atlas**: Use your connection string
   - **Local**: `mongodb://localhost:27017`
3. You should see `tradex` database
4. Collections: `positions`, `watchlists`, `apiconfigs`

---

## 🐛 Troubleshooting

### Error: "Failed to connect to MongoDB"

**For Atlas:**
- ✅ Check internet connection
- ✅ Verify connection string in .env
- ✅ Ensure IP is whitelisted
- ✅ Check username/password are correct
- ✅ Remove `<password>` brackets and replace with actual password

**For Local:**
- ✅ Check MongoDB is running: `mongosh` or `docker ps`
- ✅ Verify port 27017 is not blocked
- ✅ Check MongoDB service status

### Error: "Authentication failed"

**For Atlas:**
- ✅ Verify database user credentials
- ✅ Check user has correct permissions
- ✅ Password might contain special characters - URL encode them

**For Local:**
- ✅ Local MongoDB usually doesn't require authentication
- ✅ If you enabled auth, add credentials to connection string

### Collections Not Showing

- ✅ Collections are created automatically on first insert
- ✅ Try creating a position from the UI
- ✅ Refresh MongoDB Compass

---

## 🔒 Security Best Practices

### For Production:

1. **Change Encryption Key**
   ```env
   ENCRYPTION_KEY=generate-a-random-32-character-key-here
   ```

2. **Use Strong Passwords**
   - At least 16 characters
   - Mix of letters, numbers, symbols

3. **Whitelist Specific IPs** (Atlas)
   - Don't use 0.0.0.0/0 in production
   - Add only your server's IP

4. **Enable SSL/TLS**
   - Atlas has this by default
   - For local, configure MongoDB with SSL

5. **Regular Backups**
   - Atlas has automatic backups
   - For local, use `mongodump`

---

## 📊 Database Structure

After setup, your database will have:

### Collections:

1. **positions** - Trading positions
   - Stores all buy/sell trades
   - Tracks P&L in real-time

2. **watchlists** - User watchlists
   - Custom cryptocurrency lists
   - Synced across devices

3. **apiconfigs** - API configurations
   - Encrypted Binance API keys
   - User preferences

---

## 🎉 Next Steps

1. ✅ MongoDB is connected
2. ✅ Start trading and creating positions
3. ✅ Data is automatically saved to database
4. ✅ Check MongoDB Compass to see your data

Your TradeX app now has persistent storage! 🚀

---

## 📞 Need Help?

- **MongoDB Docs**: https://docs.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/docs/
- **Atlas Support**: https://support.mongodb.com/

---

**Setup Time:** 5-10 minutes  
**Difficulty:** Easy  
**Cost:** Free (Atlas M0 tier or local)
