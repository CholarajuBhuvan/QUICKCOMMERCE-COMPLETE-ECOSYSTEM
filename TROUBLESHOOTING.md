# 🔧 TROUBLESHOOTING GUIDE - "Route not found" Error

## 🎯 Understanding the Error

The "Route not found" error means the frontend is trying to access an API endpoint that doesn't exist or the server can't connect to MongoDB.

---

## ✅ QUICK FIXES

### Fix 1: Whitelist IP in MongoDB Atlas (MOST COMMON)

**This is the #1 cause of routing issues!**

1. Go to https://cloud.mongodb.com/
2. Login to your account
3. Click **"Network Access"** in left sidebar
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Confirm"**
7. **Wait 2-3 minutes** for changes to propagate
8. Restart your server: `Ctrl+C` then `npm run dev`

---

### Fix 2: Verify Server is Running

Check terminal output for these messages:
```
✅ MongoDB connected successfully
✅ Server running on port 5000
```

If you see MongoDB connection errors:
- Follow Fix 1 above
- Or use local MongoDB (see DATABASE-SETUP.md)

---

### Fix 3: Clear Browser Cache

1. Open DevTools (F12)
2. Go to **Network** tab
3. Check "Disable cache"
4. Refresh page (Ctrl+R)
5. Check **Console** tab for errors

---

### Fix 4: Verify Environment Variables

**Check `server/.env`:**
```env
MONGODB_URI=mongodb+srv://quickmart_admin:Bhuvan%40151719@cluster0.zayc6gb.mongodb.net/ecommerce-ecosystem?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
```

**Check `client/.env` (and picker-app, rider-app, admin-dashboard):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### Fix 5: Create Admin User

If you're trying to login to admin dashboard:

```bash
cd server
node create-admin.js
```

If you get MongoDB connection error here too, go back to Fix 1!

---

## 🔍 DEBUGGING STEPS

### Step 1: Check Server Status

Open http://localhost:5000/api/health in browser

**Expected Response:**
```json
{"status":"OK","timestamp":"2025-..."}
```

**If you get "Route not found":**
- Server is running but routes aren't registered
- Check terminal for errors
- Restart server

**If page won't load:**
- Server isn't running
- Check if port 5000 is free
- Run `npm run dev` again

---

### Step 2: Check Available Routes

The server has these main routes:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/profile` - Get user profile
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/dashboard/stats` - Get dashboard stats
- `GET /api/inventory` - Get inventory items
- `GET /api/users` - Get users list (admin only)

---

### Step 3: Test API with Browser/Postman

**Test Health Check:**
```
GET http://localhost:5000/api/health
```

**Test Product List:**
```
GET http://localhost:5000/api/products
```

If these work, the issue is in the frontend configuration.

---

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors like:
   - `Failed to fetch`
   - `Network Error`
   - `401 Unauthorized`
   - `404 Not Found`
   - `CORS Error`

4. Go to **Network** tab
5. Click on failed requests
6. Check **Preview** tab to see the actual error

---

## 🚨 COMMON ERROR MESSAGES & SOLUTIONS

### Error: "MongoServerError: bad auth"
**Solution:** Wrong MongoDB credentials. Check .env file.

### Error: "ECONNREFUSED 127.0.0.1:5000"
**Solution:** Server isn't running. Run `npm run dev`.

### Error: "IP not whitelisted"
**Solution:** Follow Fix 1 - Whitelist IP in MongoDB Atlas.

### Error: "Cannot read property of undefined"
**Solution:** User not logged in. Check localStorage for token.

### Error: "401 Unauthorized"
**Solution:** 
- Token expired - login again
- No token - need to login
- Invalid token - clear localStorage and login

### Error: "403 Forbidden"
**Solution:** User doesn't have permission. Check user role.

### Error: "CORS policy blocked"
**Solution:**
- Server not running
- Wrong CORS configuration
- Check `server/index.js` CORS settings

---

## 📱 APPLICATION-SPECIFIC ISSUES

### Customer App (localhost:3000)
**Issue:** Can't register/login
**Fix:**
1. Server must be running on port 5000
2. MongoDB must be connected
3. Check network tab for exact error

### Picker App (localhost:3001)
**Issue:** "Route not found" on login
**Fix:**
1. Use demo credentials: picker@demo.com / demo123
2. Or create picker user in MongoDB
3. Check if `/api/auth/login` route works

### Rider App (localhost:3002)
**Issue:** Can't see deliveries
**Fix:**
1. Login first: rider@demo.com / demo123
2. Server must be connected to MongoDB
3. Need orders in database first

### Admin Dashboard (localhost:3003)
**Issue:** Can't login as admin
**Fix:**
1. **Must create admin user first:**
   ```bash
   cd server
   node create-admin.js
   ```
2. Login with: admin@quickmart.com / admin123
3. If still fails, check MongoDB connection

---

## 🔥 NUCLEAR OPTION - Full Reset

If nothing works, try this:

```bash
# Stop all apps (Ctrl+C)

# Clear node_modules and reinstall
npm run clean  # if script exists, or manually delete node_modules

# Reinstall all dependencies
npm run install-all

# Clear browser cache completely
# In Chrome: Ctrl+Shift+Delete -> Clear all

# Start fresh
npm run dev
```

---

## 💡 PREVENTION TIPS

1. **Always check MongoDB Atlas IP whitelist** after network changes
2. **Keep server terminal open** to see errors immediately
3. **Check browser console** before asking for help
4. **Test /api/health endpoint** to verify server status
5. **Create admin user** before trying to access admin dashboard

---

## 📞 STILL STUCK?

**Check this in order:**

1. ✅ MongoDB Atlas IP whitelisted?
2. ✅ Server showing "MongoDB connected"?
3. ✅ http://localhost:5000/api/health works?
4. ✅ Created admin user for admin dashboard?
5. ✅ Browser console shows specific error?

**Provide this info:**
- Which app (customer/picker/rider/admin)?
- What action you're trying to do?
- Exact error message from browser console
- Server terminal output

---

**Most issues are solved by whitelisting IP in MongoDB Atlas! Try that first!**
