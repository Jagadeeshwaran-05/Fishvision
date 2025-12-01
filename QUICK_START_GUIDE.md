# Quick Start Guide - Testing Authentication

## 🚀 WORKAROUND FOR DISK SPACE ISSUE

Since you don't have enough disk space to install AsyncStorage, I've updated the sign-in screen to work **without AsyncStorage** using in-memory storage.

**IMPORTANT**: Tokens will NOT persist when you close the app, but authentication will still work for testing!

## ✅ What's Been Done

1. ✅ Backend server updated to listen on network (0.0.0.0)
2. ✅ API service configured with your IP: `192.168.1.6`
3. ✅ Sign-in screen updated to use real authentication (no AsyncStorage needed)
4. ✅ Token stored in memory (temporary solution)

## 📱 Testing Steps

### Step 1: Start the Backend Server

```powershell
cd "d:\Finalllll app\backend"
npm start
```

**Expected output:**

```
🚀 Server running on port 3000
📍 Local: http://localhost:3000/api/health
🌐 Network: http://192.168.1.6:3000/api/health
🔐 Auth endpoint: http://localhost:3000/api/auth
📱 For Expo Go: Use http://192.168.1.6:3000/api
```

### Step 2: Create a Test User

Open a **NEW PowerShell** window:

```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**Expected output:**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Step 3: Start Expo Go

Open a **THIRD PowerShell** window:

```powershell
cd "d:\Finalllll app\fishclassify"
npx expo start
```

### Step 4: Test in Expo Go

1. **Install Expo Go** on your phone (from App Store/Play Store)
2. **Connect** your phone to the SAME WiFi as your computer
3. **Scan the QR code** from the terminal
4. **Navigate** to the Sign In screen
5. **Enter credentials:**
   - Email: `test@example.com`
   - Password: `Password123!`
6. **Click Login**

## 🎯 What to Look For

### ✅ Success Indicators:

- Loading spinner appears when clicking Login
- No error alerts appear
- App navigates to the Home screen
- Console shows: `✅ Login successful: test@example.com`
- Console shows: `⚠️  Token stored in memory only (no AsyncStorage)`

### ❌ Common Errors:

**Error: "Network request failed"**

- ➡️ Backend server not running
- ➡️ Phone and computer on different WiFi networks
- ➡️ Firewall blocking port 3000

**Error: "Invalid credentials"**

- ➡️ User not created (run Step 2 first)
- ➡️ Wrong email/password

**Error: Connection refused**

- ➡️ Server not listening on 0.0.0.0 (check console output from Step 1)

## 🔧 Troubleshooting

### Check if Backend is Accessible from Phone:

Open browser on your phone and visit:

```
http://192.168.1.6:3000/api/health
```

**Should see:** `{"status":"OK","message":"Server is running"}`

### View Debug Info in App:

At the bottom of the Sign In screen, you'll see:

```
🔧 API: http://192.168.1.6:3000
💡 Make sure backend is running!
⚠️  No AsyncStorage - token won't persist
```

### Check Console Logs:

In the Expo terminal, you'll see:

- API requests being made
- Response data
- Any errors

## 📝 Note About Token Persistence

**Current Setup (No AsyncStorage):**

- ✅ Authentication works
- ✅ Token stored in memory
- ❌ Token lost when app closes
- ❌ Token lost when app refreshes

**With AsyncStorage (requires disk space):**

- ✅ Authentication works
- ✅ Token persists across app restarts
- ✅ User stays logged in

## 🎉 Next Steps

Once you confirm authentication is working:

1. **Test creating more users** with different emails
2. **Test invalid login** (wrong password)
3. **Test validation** (missing email/password)
4. **Approve Step 1** completion
5. **Move to Step 2**: User Profile Management

## 🆘 Need Help?

**Backend running but app can't connect:**

```powershell
# Check your IP hasn't changed
ipconfig | Select-String "IPv4"

# If different, update services/api.ts with new IP
```

**Want to test with different user:**

```powershell
# Create another user
$body = @{
    name = "Another User"
    email = "user2@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**Want to verify database:**

```powershell
cd "d:\Finalllll app\backend"
node -e "const initSQLJS = require('sql.js'); const fs = require('fs'); initSQLJS().then(SQL => { const db = new SQL.Database(fs.readFileSync('./data/fishclassify.db')); console.log(db.exec('SELECT id, name, email, created_at FROM users')); });"
```
