# 🚀 QUICK START GUIDE

## ⚡ Fast Setup (3 Steps)

### Step 1: Install Dependencies

**Option A - Using Batch File (Windows):**
```
Double-click INSTALL.bat
```

**Option B - Using Command:**
```bash
npm run install-all
```

### Step 2: Create Admin User

```bash
cd server
node create-admin.js
cd ..
```

**Credentials:**
- Email: admin@quickmart.com
- Password: admin123

### Step 3: Start All Applications

**Option A - Using Batch File (Windows):**
```
Double-click START.bat
```

**Option B - Using Command:**
```bash
npm run dev
```

## 🌐 Access Applications

Once started, open these URLs in your browser:

| Application | URL | Demo Login |
|------------|-----|------------|
| 🛍️ **Customer App** | http://localhost:3000 | Register new account |
| 📦 **Picker App** | http://localhost:3001 | picker@demo.com / demo123 |
| 🚚 **Rider App** | http://localhost:3002 | rider@demo.com / demo123 |
| 👨‍💼 **Admin Dashboard** | http://localhost:3003 | admin@quickmart.com / admin123 |
| 🔌 **Backend API** | http://localhost:5000 | API Server |

## 🎯 Test Complete Workflow

1. **Customer App**: Browse products → Add to cart → Place order
2. **Picker App**: Accept order → Pick items → Mark ready
3. **Rider App**: Accept delivery → Mark delivered
4. **Admin Dashboard**: Monitor everything in real-time

## ❌ Troubleshooting

**Port already in use?**
```bash
# Find and kill process on port 3000 (example)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**MongoDB connection error?**
- Database is already configured with MongoDB Atlas
- No additional setup needed
- Check internet connection

**Dependencies failed?**
```bash
npm cache clean --force
npm run install-all
```

## 📚 Full Documentation

See **SETUP.md** for detailed documentation.

---

**That's it! You're ready to go! 🎉**
