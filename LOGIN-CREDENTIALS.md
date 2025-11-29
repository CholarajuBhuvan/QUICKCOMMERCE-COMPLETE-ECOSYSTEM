# 🔑 LOGIN CREDENTIALS - ALL WORKING!

## ✅ ALL DEMO USERS CREATED IN DATABASE

All users have been successfully created in MongoDB. You can now login with these credentials:

---

## 👨‍💼 **ADMIN DASHBOARD**
**URL:** http://localhost:3003

**Credentials:**
```
Email: admin@quickmart.com
Password: admin123
```

**Access:**
- Full system control
- View all orders, customers, products
- Manage staff (pickers, riders)
- Real-time analytics and dashboards
- System configuration

---

## 📦 **PICKER APP (Warehouse)**
**URL:** http://localhost:3001

**Credentials:**
```
Email: picker@demo.com
Password: demo123
```

**Access:**
- View assigned orders
- Pick items from bins
- Scan QR codes
- Mark orders ready for delivery
- Track picking performance

---

## 🚚 **RIDER APP (Delivery)**
**URL:** http://localhost:3002

**Credentials:**
```
Email: rider@demo.com
Password: demo123
```

**Access:**
- Accept delivery assignments
- Navigate to customers
- Mark deliveries complete
- Track earnings
- View delivery history

---

## 🛍️ **CUSTOMER APP**
**URL:** http://localhost:3000

**Credentials:**
```
Email: customer@demo.com
Password: demo123
```

**Or register a new account!**

**Access:**
- Browse products
- Add to cart
- Place orders
- Track orders
- View order history

---

## 🔒 **IMPORTANT NOTES**

### Password Requirements:
- Minimum 6 characters
- All demo accounts use: `demo123`
- Admin uses: `admin123`

### If Login Fails:
1. **Check server is running** - Should show "MongoDB connected"
2. **Verify URL** - Make sure using correct port
3. **Clear browser cache** - Ctrl+Shift+R
4. **Check network tab** - Look for API errors in DevTools (F12)

### Network Error Solutions:
1. Backend must be running on port 5000
2. Check http://localhost:5000/api/health in browser
3. If 404 error, restart server: `npm run dev`
4. If CORS error, backend is not running properly

---

## 🧪 **TEST ACCOUNTS**

All accounts are fully functional and ready to test:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@quickmart.com | admin123 | Full system access |
| Picker | picker@demo.com | demo123 | Warehouse operations |
| Rider | rider@demo.com | demo123 | Delivery operations |
| Customer | customer@demo.com | demo123 | Shopping & orders |

---

## 🎯 **COMPLETE WORKFLOW TEST**

1. **Customer** → Place order (http://localhost:3000)
2. **Picker** → Accept and pick order (http://localhost:3001)
3. **Rider** → Accept and deliver order (http://localhost:3002)
4. **Admin** → Monitor everything (http://localhost:3003)

---

## ✅ **VERIFICATION STEPS**

### Step 1: Check Backend
```
Open: http://localhost:5000/api/health
Expected: {"status":"OK","timestamp":"..."}
```

### Step 2: Test Login
1. Go to any app URL
2. Enter credentials above
3. Click "Sign In"
4. Should redirect to dashboard

### Step 3: Check Console
- Press F12 in browser
- Go to Console tab
- Should see no errors
- Check Network tab for successful API calls

---

## 🔄 **IF STILL HAVING ISSUES**

### Clear Everything:
```bash
# Stop all apps
Ctrl+C in terminal

# Clear browser completely
F12 → Application → Clear Storage → Clear site data

# Restart
npm run dev
```

### Create Users Again:
```bash
cd server
node scripts/createDemoUsers.js
```

---

**All users are created and ready! Try logging in now! 🎉**
