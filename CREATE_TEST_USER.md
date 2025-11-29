# Create Test User Accounts

## Quick Test - Create Admin User via API

### Using PowerShell:
```powershell
$body = @{
    name = "Admin User"
    email = "admin@quickmart.com"
    password = "admin123"
    phone = "1234567890"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Using Browser Console (F12):
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Admin User',
    email: 'admin@quickmart.com',
    password: 'admin123',
    phone: '1234567890',
    role: 'admin'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Test Accounts to Create

### 1. Admin Account
- **Email:** admin@quickmart.com
- **Password:** admin123
- **Role:** admin
- **Use for:** Admin Dashboard (port 3003)

### 2. Customer Account
- **Email:** customer@quickmart.com
- **Password:** customer123
- **Role:** customer
- **Use for:** Customer App (port 3000)

### 3. Picker Account
- **Email:** picker@quickmart.com
- **Password:** picker123
- **Role:** picker
- **Use for:** Picker App (port 3001)

### 4. Rider Account
- **Email:** rider@quickmart.com
- **Password:** rider123
- **Role:** rider
- **Use for:** Rider App (port 3002)

## How to Test Login

1. **Open any app** (e.g., http://localhost:3000)
2. **Click "Sign Up"** on the login page
3. **Fill in the form:**
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
   - Phone: 1234567890
4. **Click Register**
5. You should be logged in automatically!

## Troubleshooting

### If you see network errors:
1. Make sure backend is running: http://localhost:5000/api/health
2. Clear browser cache (Ctrl + Shift + Delete)
3. Try in incognito mode
4. Check browser console (F12) for detailed errors

### If registration fails:
- Make sure MongoDB Atlas is connected (check server terminal)
- Verify .env file has correct MONGODB_URI
- Try registering with a different email

## Quick Health Check

Test backend API:
```
http://localhost:5000/api/health
```

Should return:
```json
{"status":"OK","timestamp":"2025-10-17T..."}
```
