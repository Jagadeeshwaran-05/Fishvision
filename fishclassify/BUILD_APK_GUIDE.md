# How to Build APK for FishClassify App

## Prerequisites

- Node.js installed ✅
- Expo CLI installed ✅
- At least 5GB free disk space
- Internet connection

---

## Method 1: EAS Build (Recommended - Cloud Build)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
cd "d:\Finalllll app\fishclassify"
npx eas-cli login
```

- If you don't have an account, create one at https://expo.dev/signup

### Step 3: Configure EAS Build

```bash
npx eas-cli build:configure
```

- Select "Android" when prompted
- This creates `eas.json` configuration file

### Step 4: Build APK

```bash
npx eas-cli build --platform android --profile preview
```

**Build Options:**

- `preview` - APK for testing (smaller, faster)
- `production` - AAB for Play Store (optimized)

### Step 5: Download APK

- You'll get a URL link in the terminal
- Click the link to download your APK
- Or check https://expo.dev/accounts/YOUR_USERNAME/projects/fishclassify/builds

### Step 6: Install on Android

- Transfer APK to your Android device
- Enable "Install from Unknown Sources" in Settings
- Tap the APK file to install

---

## Method 2: Local Build with Android Studio

### Prerequisites

- Install Android Studio
- Install Java JDK 17
- Set up ANDROID_HOME environment variable

### Step 1: Prebuild

```bash
cd "d:\Finalllll app\fishclassify"
npx expo prebuild --platform android
```

### Step 2: Build APK

```bash
cd android
./gradlew assembleRelease
```

### Step 3: Find APK

```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Method 3: Quick APK with Expo Application Services (Free Tier)

1. **Create Expo Account**: https://expo.dev/signup

2. **Run Build Command**:

```bash
npx eas-cli build -p android --profile preview
```

3. **Wait for Build** (5-15 minutes)

   - Build happens on Expo's servers
   - You don't need Android Studio
   - Progress shown in terminal

4. **Download APK**

   - Link provided in terminal
   - Also available at: https://expo.dev

5. **Install on Device**
   - Download APK from link
   - Install on Android phone
   - Enable "Install from Unknown Sources"

---

## Important Notes

### Backend Configuration

Before building, update your backend URL in the code:

**File**: `fishclassify/services/api.ts`

```typescript
const BASE_URL = "http://YOUR_PUBLIC_IP:3000/api";
// Change from http://192.168.1.6:3000/api to your public server
```

**Options for Backend:**

1. **Deploy backend to cloud** (Heroku, Railway, Render)
2. **Use ngrok** for temporary public URL
3. **Keep local** - APK will only work on same WiFi

### APK vs AAB

- **APK**: Direct install, good for testing
- **AAB**: Google Play Store format (smaller download)

### Expo Go vs Standalone APK

- **Expo Go**: Development, requires Expo app
- **Standalone APK**: Production, works independently

---

## Troubleshooting

### "No space left on device"

- Free up at least 5GB disk space
- Delete node_modules and reinstall: `npm install`
- Clear npm cache: `npm cache clean --force`

### "Build failed"

- Check eas.json configuration
- Ensure app.json has correct package name
- Update all packages: `npx expo install --fix`

### "Unable to connect to backend"

- Update BASE_URL to public IP or deployed backend
- Ensure backend is running
- Check firewall settings

### "App crashes on open"

- Check for missing dependencies
- Review app.json configuration
- Check logs: `npx expo start --dev-client`

---

## Free Build Tiers

**EAS Build Free Tier:**

- 30 builds per month
- iOS + Android
- No credit card required
- Perfect for development

**Expo Application Services:**

- Cloud builds
- Automatic updates
- Push notifications
- Free tier available

---

## Commands Summary

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
npx eas-cli login

# Configure
npx eas-cli build:configure

# Build Preview APK
npx eas-cli build --platform android --profile preview

# Build Production AAB
npx eas-cli build --platform android --profile production

# Check build status
npx eas-cli build:list
```

---

## Quick Start (Recommended)

1. Free up 5GB disk space
2. Run: `npx eas-cli build -p android --profile preview`
3. Create Expo account when prompted
4. Wait for build to complete
5. Download APK from provided link
6. Install on Android device

**Build Time:** 5-15 minutes
**Cost:** FREE (30 builds/month)
**Requirements:** Just internet connection

---

## Next Steps After Building APK

1. **Test thoroughly** on multiple devices
2. **Deploy backend** to cloud service
3. **Update BASE_URL** to production backend
4. **Build production version** for Play Store
5. **Create app signing key** for Play Store
6. **Submit to Google Play** (optional)

---

## Support Resources

- Expo Documentation: https://docs.expo.dev/build/setup/
- EAS Build Guide: https://docs.expo.dev/build/introduction/
- Discord: https://chat.expo.dev/
- Forums: https://forums.expo.dev/
