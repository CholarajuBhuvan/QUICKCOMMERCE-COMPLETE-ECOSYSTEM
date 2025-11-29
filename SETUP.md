# 🚀 QuickMart E-commerce Ecosystem - Setup Guide

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for version control)

## 📦 Installation Steps

### Step 1: Install Root Dependencies

```bash
# Navigate to project root
cd c:/Users/Cholaraju\ Bhuvan/OneDrive/Desktop/Ecommerce

# Install concurrently (to run all apps simultaneously)
npm install
```

### Step 2: Install All Application Dependencies

Run this command from the project root to install dependencies for all applications:

```bash
npm run install-all
```

This will install dependencies for:
- ✅ Backend Server
- ✅ Client Application
- ✅ Picker Application
- ✅ Rider Application
- ✅ Admin Dashboard

**Note:** This may take 5-10 minutes depending on your internet connection.

## 🗄️ Database Setup

### Option 1: Using MongoDB Atlas (Cloud - Recommended)

The project is already configured with MongoDB Atlas connection string in `server/.env`:
```
MONGODB_URI=mongodb+srv://quickmart_admin:Bhuvan%40151719@cluster0.zayc6gb.mongodb.net/ecommerce-ecosystem
```

**No additional setup required!** The database is ready to use.

### Option 2: Using Local MongoDB

If you prefer local MongoDB:

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Update `server/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/ecommerce-ecosystem
   ```

## 🎯 Running the Project

### Option A: Run All Applications Together (Recommended)

From the project root, run:

```bash
npm run dev
```

This will start all 5 applications concurrently:
- 🌐 **Backend API** → http://localhost:5000
- 🛍️ **Customer App** → http://localhost:3000
- 📦 **Picker App** → http://localhost:3001
- 🚚 **Rider App** → http://localhost:3002
- 👨‍💼 **Admin Dashboard** → http://localhost:3003

### Option B: Run Applications Individually

**Backend Server:**
```bash
npm run server
```

**Customer Application:**
```bash
npm run client
```

**Picker Application:**
```bash
npm run picker
```

**Rider Application:**
```bash
npm run rider
```

**Admin Dashboard:**
```bash
npm run admin
```

## 🔐 Demo Credentials

### Admin Dashboard
- **Email:** admin@demo.com
- **Password:** demo123

### Picker Application
- **Email:** picker@demo.com
- **Password:** demo123

### Rider Application
- **Email:** rider@demo.com
- **Password:** demo123

### Customer Application
- **Register a new account** or use:
- **Email:** customer@demo.com
- **Password:** demo123

## 🧪 Testing the System

### 1. Create Admin User (First Time Setup)

Run this script to create the initial admin user:

```bash
cd server
node create-admin.js
```

### 2. Seed Sample Data (Optional)

To populate the database with sample products and data:

```bash
cd server
npm run seed
```

### 3. Test Complete Workflow

**Step-by-step testing:**

1. **Customer App** (http://localhost:3000)
   - Register/Login as customer
   - Browse products
   - Add items to cart
   - Place an order

2. **Picker App** (http://localhost:3001)
   - Login as picker
   - View available orders
   - Accept and pick order
   - Mark as ready for delivery

3. **Rider App** (http://localhost:3002)
   - Login as rider
   - View available deliveries
   - Accept delivery
   - Mark as delivered

4. **Admin Dashboard** (http://localhost:3003)
   - Login as admin
   - View real-time dashboard
   - Monitor all orders
   - Check analytics

## 🔧 Troubleshooting

### Port Already in Use

If you get "Port already in use" error:

**Windows:**
```bash
# Find process using port 3000 (example)
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error

1. Check if MongoDB is running
2. Verify connection string in `server/.env`
3. Check network connectivity for MongoDB Atlas

### Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Application Won't Start

1. Check if all dependencies are installed
2. Verify Node.js version (should be v16+)
3. Check console for specific error messages
4. Ensure MongoDB is accessible

## 📱 Browser Compatibility

Recommended browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 🌐 Environment Variables

All environment variables are pre-configured in `server/.env`. For production deployment, update:

- `JWT_SECRET` - Change to a secure random string
- `SMTP_*` - Configure for email notifications
- `TWILIO_*` - Configure for SMS notifications
- `STRIPE_*` - Configure for payment processing

## 📚 Project Structure

```
Ecommerce/
├── server/              # Backend API (Port 5000)
├── client/              # Customer App (Port 3000)
├── picker-app/          # Picker App (Port 3001)
├── rider-app/           # Rider App (Port 3002)
├── admin-dashboard/     # Admin Dashboard (Port 3003)
├── package.json         # Root package with scripts
└── README.md            # Project documentation
```

## 🚀 Next Steps

1. ✅ Install all dependencies (`npm run install-all`)
2. ✅ Start all applications (`npm run dev`)
3. ✅ Create admin user (`node server/create-admin.js`)
4. ✅ Access applications in browser
5. ✅ Test complete order workflow

## 💡 Tips

- Keep all terminal windows open while development
- Use browser DevTools for debugging
- Check Network tab for API calls
- Monitor console for real-time updates
- Socket.io provides live notifications

## 🆘 Need Help?

- Check console logs for detailed error messages
- Verify all services are running on correct ports
- Ensure MongoDB connection is successful
- Check browser console for frontend errors

---

**Happy Coding! 🎉**
