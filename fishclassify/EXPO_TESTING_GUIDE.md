# 📱 Testing Backend API in Expo App with Expo Go

## Step-by-Step Guide

### 1️⃣ Install Required Packages

```bash
cd "d:\Finalllll app\fishclassify"
npm install @react-native-async-storage/async-storage
```

### 2️⃣ Update Backend Server to Accept Network Requests

The backend needs to listen on your network IP, not just localhost.

Update `backend/src/server.js`:

```javascript
// Start server
app.listen(PORT, "0.0.0.0", () => {
  // Add '0.0.0.0' here
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Network: http://192.168.1.6:${PORT}/api/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
});
```

### 3️⃣ Restart Backend Server

```powershell
# Stop any running servers
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server (it will now be accessible from your network)
cd "d:\Finalllll app\backend"
node src/server.js
```

### 4️⃣ Test Backend from Your Phone's Network

Open a browser on your phone (connected to same WiFi) and go to:

```
http://192.168.1.6:3000/api/health
```

You should see:

```json
{
  "success": true,
  "message": "Fish Classify API is running",
  "timestamp": "2025-10-27T..."
}
```

### 5️⃣ Use the Updated Sign-In Screen

Replace your current `app/auth/sign-in.tsx` with the content from `app/auth/sign-in-new.tsx`

Or manually update it to use the API:

```tsx
import { authApi } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleLogin = async () => {
  try {
    const response = await authApi.signin(email, password);

    // Store token
    await AsyncStorage.setItem("authToken", response.data.token);
    await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));

    // Navigate to home
    router.replace("/home");
  } catch (error) {
    Alert.alert("Login Failed", error.message);
  }
};
```

### 6️⃣ Update Sign-Up Screen Similarly

Create `app/auth/sign-up-new.tsx` or update existing:

```tsx
import { authApi } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleSignUp = async () => {
  try {
    const response = await authApi.signup(
      name,
      email,
      password,
      confirmPassword
    );

    // Store token
    await AsyncStorage.setItem("authToken", response.data.token);
    await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));

    // Navigate to home
    router.replace("/home");
  } catch (error) {
    Alert.alert("Sign Up Failed", error.message);
  }
};
```

### 7️⃣ Start Expo App

```bash
cd "d:\Finalllll app\fishclassify"
npm start
```

Then scan the QR code with Expo Go on your phone!

---

## 🔥 Quick Test Commands

### Install AsyncStorage:

```bash
cd "d:\Finalllll app\fishclassify"
npm install @react-native-async-storage/async-storage
```

### Restart Backend (Network Mode):

```powershell
cd "d:\Finalllll app\backend"
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
node src/server.js
```

### Test from Browser on Phone:

```
http://192.168.1.6:3000/api/health
```

### Start Expo:

```bash
cd "d:\Finalllll app\fishclassify"
npm start
```

---

## 📝 Troubleshooting

### ❌ "Network request failed"

- Make sure backend is running on `0.0.0.0:3000`
- Check that phone and computer are on the same WiFi
- Try accessing `http://192.168.1.6:3000/api/health` in phone browser first

### ❌ "Cannot connect to server"

- Verify your IP address hasn't changed: `ipconfig | Select-String "IPv4"`
- Update `services/api.ts` with the correct IP
- Disable any firewall blocking port 3000

### ❌ Windows Firewall blocking

```powershell
# Allow Node.js through firewall (run as Administrator)
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

---

## ✅ Expected Flow

1. Open Expo Go app on phone
2. Scan QR code
3. App loads with sign-in screen
4. Enter credentials
5. App calls `http://192.168.1.6:3000/api/auth/signin`
6. Backend returns JWT token
7. Token saved to AsyncStorage
8. Navigate to home screen

---

## 🎯 Testing Checklist

- [ ] Backend running on port 3000
- [ ] Can access `http://192.168.1.6:3000/api/health` from phone browser
- [ ] AsyncStorage installed in fishclassify app
- [ ] `services/api.ts` has correct IP (192.168.1.6)
- [ ] Sign-in screen updated to use authApi
- [ ] Expo app running
- [ ] Phone connected to same WiFi as computer

---

## Alternative: Use Android Emulator or iOS Simulator

If Expo Go doesn't work well, use emulator/simulator:

### Android Emulator:

```tsx
// services/api.ts
const devApiUrl = "http://10.0.2.2:3000/api"; // Special Android emulator IP
```

### iOS Simulator:

```tsx
// services/api.ts
const devApiUrl = "http://localhost:3000/api"; // Works in simulator
```

---

Need help? Let me know which step you're stuck on! 🚀
