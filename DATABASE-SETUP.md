# 🗄️ Database Setup Guide

## ⚠️ MongoDB Atlas IP Whitelist Issue

You're seeing this error because your IP address is not whitelisted in MongoDB Atlas.

## 🎯 Choose Your Setup Method

### Option 1: Fix MongoDB Atlas (Recommended - Cloud Database)

**Step 1:** Go to MongoDB Atlas
- Visit: https://cloud.mongodb.com/
- Login with your credentials

**Step 2:** Whitelist Your IP
1. Select your cluster (Cluster0)
2. Click "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Click "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

**Step 3:** Update .env file
Edit `server/.env` and uncomment the Atlas connection:

```env
# Comment out local MongoDB
# MONGODB_URI=mongodb://localhost:27017/quickmart-ecommerce

# Uncomment Atlas connection
MONGODB_URI=mongodb+srv://quickmart_admin:Bhuvan%40151719@cluster0.zayc6gb.mongodb.net/ecommerce-ecosystem?retryWrites=true&w=majority&appName=Cluster0
```

---

### Option 2: Install MongoDB Locally

**Step 1:** Download MongoDB Community Edition
- Visit: https://www.mongodb.com/try/download/community
- Download for Windows
- Run the installer

**Step 2:** Install MongoDB
- Choose "Complete" installation
- Install as a Windows Service (check the box)
- Install MongoDB Compass (optional GUI tool)

**Step 3:** Start MongoDB Service
Open PowerShell as Administrator:

```powershell
# Start MongoDB service
net start MongoDB

# Or use Services app (services.msc)
# Find "MongoDB" and click "Start"
```

**Step 4:** Verify Installation
```bash
mongo --version
```

**Step 5:** Verify Connection
The `.env` file is already configured for local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/quickmart-ecommerce
```

---

## ✅ After Database Setup

1. **Create Admin User:**
```bash
cd server
node create-admin.js
```

2. **Start the Application:**
```bash
cd ..
npm run dev
```

---

## 🚀 Quick Start with Atlas (Fastest Option)

If you want to start immediately with Atlas:

1. **Allow all IPs temporarily** (for development):
   - MongoDB Atlas Dashboard
   - Network Access
   - Add IP Address
   - Enter: `0.0.0.0/0` (Allow from anywhere)
   - Confirm

2. **Update .env** to use Atlas connection (uncomment it)

3. **Run the project:**
```bash
cd server
node create-admin.js
cd ..
npm run dev
```

---

## 🔧 Troubleshooting

### MongoDB Atlas Issues
- **IP not whitelisted**: Follow Option 1 above
- **Connection timeout**: Check internet connection
- **Authentication failed**: Verify credentials in connection string

### Local MongoDB Issues
- **Service not starting**: Run as Administrator
- **Port 27017 in use**: Stop other MongoDB instances
- **Connection refused**: Start MongoDB service

### Check MongoDB Status (Local)
```powershell
# Windows
net start MongoDB

# Check if running
Get-Service MongoDB
```

---

## 💡 Recommended Approach

**For Development:** Use Option 2 (Local MongoDB)
- Faster
- No internet required
- Full control

**For Production/Demo:** Use Option 1 (MongoDB Atlas)
- Always available
- Managed backups
- Scalable

---

**Need help? Check the error messages carefully!**
