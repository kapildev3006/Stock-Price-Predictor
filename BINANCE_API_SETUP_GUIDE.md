# 🔑 Binance API Setup Guide

## ✅ How to Fix "Binance API Error"

If you're getting an error when testing your API connection, follow this guide to properly set up your Binance API keys.

---

## 📋 Step-by-Step Guide

### **Step 1: Create Binance Account**
If you don't have a Binance account yet:
1. Go to https://www.binance.com
2. Click "Register" and create an account
3. Complete email/phone verification
4. Enable 2FA (Two-Factor Authentication) for security

### **Step 2: Navigate to API Management**
1. Log in to your Binance account
2. Hover over your profile icon (top right)
3. Click on **"API Management"**
   - Direct link: https://www.binance.com/en/my/settings/api-management

### **Step 3: Create API Key**
1. Click **"Create API"** button
2. You'll be asked to verify your identity:
   - Email verification code
   - 2FA authentication code
3. Enter a label for your API key:
   - Example: "TradeX App" or "Trading Dashboard"

### **Step 4: Configure API Restrictions**

**⚠️ IMPORTANT - For Safety:**

1. **Enable these permissions ONLY:**
   - ✅ **Enable Reading** - This allows reading account data
   - ❌ **DO NOT enable** "Enable Spot & Margin Trading"
   - ❌ **DO NOT enable** "Enable Withdrawals"

2. **API Restrictions:**
   - You can restrict API access by IP address (optional but recommended for production)
   - For testing, you can leave it as "Unrestricted"

3. Click **"Create"**

### **Step 5: Save Your Keys**

**🚨 CRITICAL: You will only see the Secret Key ONCE!**

1. **API Key** - This will always be visible
2. **Secret Key** - Copy this immediately! You cannot view it again.
   - If you lose it, you'll need to create a new API key

**Copy both keys:**
```
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Secret Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

### **Step 6: Add Keys to TradeX**

1. Go to your TradeX Dashboard
2. Navigate to **API Settings** tab
3. Paste your API Key in the "API Key" field
4. Paste your Secret Key in the "Secret Key" field
5. Click **"Save Keys"**
6. Click **"Test Connection"**

---

## ✅ Successful Connection

If everything is correct, you'll see:
```
✅ Connection successful! Your API keys are working.
Found X assets with balance:
BTC: 0.00123456
USDT: 100.50
...
```

---

## ❌ Common Errors & Solutions

### **Error: "Invalid API-key, IP, or permissions for action"**

**Causes:**
- API key is incorrect (typo when copying)
- API key was deleted from Binance
- IP restriction is enabled but your IP doesn't match

**Solutions:**
1. Double-check you copied the API key correctly
2. Go to Binance API Management and verify the key exists
3. If IP-restricted, add your current IP or remove restrictions
4. Create a new API key if needed

---

### **Error: "Signature for this request is not valid"**

**Causes:**
- Secret key is incorrect
- Clock synchronization issue

**Solutions:**
1. Verify you copied the Secret Key correctly
2. Create a new API key and copy both keys again
3. Check your computer's system time is correct

---

### **Error: "Timestamp for this request is outside of the recvWindow"**

**Causes:**
- Your computer's clock is not synchronized

**Solutions:**
1. Check your system time/date
2. Enable automatic time synchronization:
   - **Windows**: Settings → Time & Language → Sync now
   - **Mac**: System Preferences → Date & Time → Set automatically
   - **Linux**: `sudo ntpdate -s time.nist.gov`

---

### **Error: "API key does not exist"**

**Causes:**
- API key was deleted from Binance
- Wrong API key format

**Solutions:**
1. Go to Binance API Management
2. Check if your API key still exists
3. Create a new API key if needed

---

### **Error: Connection failed / Network error**

**Causes:**
- No internet connection
- Binance API is down
- Firewall blocking the request

**Solutions:**
1. Check your internet connection
2. Try accessing https://www.binance.com in browser
3. Check firewall settings
4. Try again in a few minutes

---

## 🔒 Security Best Practices

### **✅ DO:**
- Use **read-only** permissions for this app
- Enable 2FA on your Binance account
- Use IP restrictions if possible
- Create separate API keys for different apps
- Regularly review and rotate your API keys
- Keep your Secret Key private

### **❌ DON'T:**
- Enable trading or withdrawal permissions (unless needed)
- Share your Secret Key with anyone
- Store API keys in public code repositories
- Use the same API key for multiple apps
- Take screenshots of your Secret Key
- Send API keys via email or chat

---

## 🧪 Testing Your Setup

### **Test 1: Basic Connection**
1. Save your API keys in TradeX
2. Click "Test Connection"
3. Should show: "✅ Connection successful!"

### **Test 2: View Balances**
- If connection successful, you'll see your Binance account balances
- Shows assets with non-zero balance

### **Test 3: Try the Dashboard**
- Navigate to the Dashboard
- Watchlist should show real-time prices (works without API keys)
- API-dependent features will work with valid keys

---

## 📊 What Data Does TradeX Access?

With **read-only** API keys, TradeX can:
- ✅ Read your account balances
- ✅ View your trading history
- ✅ Access market data (this works without API keys too)

TradeX **CANNOT**:
- ❌ Make trades on your behalf
- ❌ Withdraw funds
- ❌ Change account settings
- ❌ Access funds

---

## 🔄 Creating a New API Key

If you need to create a new API key:

1. **Delete old key** (optional):
   - Go to Binance API Management
   - Click "Delete" on old key
   - Confirm deletion

2. **Create new key**:
   - Click "Create API"
   - Follow Steps 3-6 above
   - Copy new keys immediately

3. **Update TradeX**:
   - Go to API Settings
   - Paste new keys
   - Click "Save Keys"
   - Test connection

---

## 📱 API Key Management Tips

### **Naming Convention**
Use descriptive names:
- ✅ "TradeX Dashboard - Read Only"
- ✅ "Trading Bot - Live"
- ❌ "My API Key" (too generic)

### **Regular Audits**
- Review your API keys monthly
- Delete unused keys
- Rotate keys every 3-6 months

### **Multiple Environments**
- Use different keys for testing vs production
- Separate keys for different applications

---

## 🆘 Still Having Issues?

### **Check Server Logs**
If using the app locally:
```bash
# Look for error messages in the console
# Common errors will be logged with details
```

### **Binance API Status**
Check if Binance API is operational:
- https://www.binance.com/en/support/announcement

### **Common Questions**

**Q: Do I need API keys to use TradeX?**
A: No! API keys are optional. You can use most features without them. They're only needed for:
- Viewing your actual Binance balances
- Accessing your trading history
- Future features that require account data

**Q: Are my API keys stored on your server?**
A: No! Your API keys are stored locally in your browser (localStorage) only. They're never sent to any external servers except Binance when testing the connection.

**Q: Can I use TradeX without Binance API keys?**
A: Yes! The simulated trading features work without API keys. You can:
- View real-time prices
- Practice trading with paper money
- Track positions
- All without API keys

**Q: What's the difference between API Key and Secret Key?**
A: 
- **API Key**: Public identifier (like a username)
- **Secret Key**: Private authentication (like a password)
- Both are needed for API access

---

## ✅ Success Checklist

Before testing connection, verify:
- [ ] Binance account created and verified
- [ ] 2FA enabled on Binance account
- [ ] API key created with correct permissions
- [ ] "Enable Reading" permission is ON
- [ ] Trading/Withdrawal permissions are OFF (for safety)
- [ ] Both API Key and Secret Key copied correctly
- [ ] Keys saved in TradeX (clicked "Save Keys")
- [ ] System time is correct and synchronized

---

## 🎉 You're All Set!

Once your connection test is successful, you can:
- View your real Binance account balances
- See which cryptocurrencies you hold
- Track your portfolio value
- Access account-specific features

**Happy Trading!** 📊🚀

---

**Last Updated**: November 9, 2025  
**Guide Version**: 1.0.0
