# QuickMart - Quick Start Guide

## ✅ Project Status: CODE COMPLETE

All 5 applications are fully implemented and ready to run!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
# From the root directory
npm run install-all
```
This installs dependencies for all 5 apps (takes 2-3 minutes).

### Step 2: Start MongoDB
```bash
# Option 1: Local MongoDB
mongod

# Option 2: Use MongoDB Atlas (cloud)
# Update MONGODB_URI in server/.env with your Atlas connection string
```

### Step 3: Start All Applications
```bash
# From the root directory
npm run dev
```

This starts all 5 applications simultaneously:
- 🔧 Backend API → http://localhost:5000
- 🏪 Customer App → http://localhost:3000
- 📦 Picker App → http://localhost:3001
- 🚚 Rider App → http://localhost:3002
- 👨‍💼 Admin Dashboard → http://localhost:3003

---

## 📱 Application Access

### Customer Shopping App
**URL:** http://localhost:3000  
**Purpose:** Browse products, place orders, track deliveries  
**Login:** Any user with 'customer' role

### Picker Warehouse App
**URL:** http://localhost:3001  
**Purpose:** Pick items from warehouse, scan QR codes, manage inventory  
**Login:** User with 'picker' or 'admin' role

### Rider Delivery App
**URL:** http://localhost:3002  
**Purpose:** Accept deliveries, navigate routes, track earnings  
**Login:** User with 'rider' or 'admin' role

### Admin Dashboard
**URL:** http://localhost:3003  
**Purpose:** Manage entire business, view analytics, oversee staff  
**Login:** User with 'admin' role

### Backend API
**URL:** http://localhost:5000/api  
**Health Check:** http://localhost:5000/api/health

---

## 🔑 Default Test Accounts (Create These)

You'll need to create test accounts in MongoDB or via the login/signup flow:

```javascript
// Admin Account
{
  email: "admin@quickmart.com",
  password: "admin123",
  role: "admin"
}

// Picker Account
{
  email: "picker@quickmart.com",
  password: "picker123",
  role: "picker"
}

// Rider Account
{
  email: "rider@quickmart.com",
  password: "rider123",
  role: "rider"
}

// Customer Account
{
  email: "customer@quickmart.com",
  password: "customer123",
  role: "customer"
}
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in package.json if needed
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
# Windows: Check Services
# Mac/Linux: ps aux | grep mongod

# Update connection string in server/.env
MONGODB_URI=mongodb://localhost:27017/ecommerce-ecosystem
```

### Module Not Found
```bash
# Reinstall dependencies
cd <app-directory>
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear cache and rebuild
cd <app-directory>
rm -rf node_modules build
npm install
npm start
```

---

## 📝 Development Workflow

### 1. Start Backend First
```bash
cd server
npm run dev
```
Wait for "MongoDB connected successfully" message.

### 2. Start Frontend Apps
```bash
# Terminal 1
cd client && npm start

# Terminal 2
cd picker-app && npm start

# Terminal 3
cd rider-app && npm start

# Terminal 4
cd admin-dashboard && npm start
```

### 3. Test Features
- Create products in Admin Dashboard
- Place orders as Customer
- Pick orders in Picker App
- Deliver orders in Rider App
- Monitor everything in Admin Dashboard

---

## 🎯 Key Features to Test

### Customer App
- [ ] Browse products by category
- [ ] Add items to cart
- [ ] Place an order
- [ ] Track order status
- [ ] View order history

### Picker App
- [ ] View pending orders
- [ ] Scan QR codes (or manual entry)
- [ ] Pick items from bins
- [ ] Mark order as picked
- [ ] View inventory levels

### Rider App
- [ ] View available deliveries
- [ ] Accept delivery
- [ ] Update delivery status
- [ ] View earnings
- [ ] Check performance metrics

### Admin Dashboard
- [ ] View business metrics
- [ ] Manage orders
- [ ] Manage customers
- [ ] Manage products
- [ ] View analytics

---

## 🔄 Real-Time Features

The system includes Socket.io for real-time updates:
- Order status changes
- Picker/Rider availability
- Live notifications
- Cross-app synchronization

Make sure the backend is running for real-time features to work.

---

## 📦 Build for Production

### Build All Apps
```bash
# Customer App
cd client && npm run build

# Picker App
cd picker-app && npm run build

# Rider App
cd rider-app && npm run build

# Admin Dashboard
cd admin-dashboard && npm run build
```

### Deploy
- Frontend apps → Netlify, Vercel, or any static host
- Backend → Heroku, DigitalOcean, AWS, or any Node.js host
- Database → MongoDB Atlas (cloud)

---

## 📚 Additional Documentation

- `README.md` - Main project overview
- `COMPLETION_SUMMARY.md` - Admin dashboard completion details
- `ECOSYSTEM_STATUS.md` - Live application status
- `PROJECT_COMPLETE_STATUS.md` - Comprehensive project status

---

## 🆘 Need Help?

### Common Issues

**Q: Apps won't start**  
A: Make sure all dependencies are installed (`npm run install-all`)

**Q: Can't connect to backend**  
A: Verify backend is running on port 5000

**Q: Database connection failed**  
A: Start MongoDB or update connection string in server/.env

**Q: Port conflicts**  
A: Change ports in package.json scripts

**Q: Module errors**  
A: Delete node_modules and reinstall

---

## 🎉 Success Checklist

- [x] All code files created (8 new files)
- [x] All 5 apps have complete code
- [x] Dependencies properly configured
- [x] Redux stores configured
- [x] API routes implemented
- [x] Database models defined
- [x] Socket.io configured
- [x] UI/UX polished

**Your QuickMart ecosystem is ready to launch!** 🚀

---

**Pro Tip:** Start with the Admin Dashboard to set up products, then test the customer flow, followed by picker and rider workflows.
