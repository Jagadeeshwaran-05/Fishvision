# 📱 Building FishVision APK - Complete Guide

## 🚀 Quick Start (Recommended Method)

### Option 1: EAS Build (Cloud Build - Easiest)

This is the **recommended** method - no Android Studio or Java setup needed!

#### Prerequisites

```powershell
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to your Expo account (create one at expo.dev if you don't have)
eas login
```

#### Build Commands

**For Testing (Internal APK)**:

```powershell
# Build APK for testing (fastest, no signing needed)
eas build -p android --profile preview

# Or use the apk profile
eas build -p android --profile apk
```

**For Production (Release APK)**:

```powershell
# Build production APK
eas build -p android --profile production
```

#### What Happens:

1. ✅ Code is uploaded to EAS servers
2. ✅ Android build environment is set up automatically
3. ✅ APK is compiled (takes 10-20 minutes)
4. ✅ Download link is provided
5. ✅ APK is also stored in your Expo account

#### After Build Completes:

- You'll get a download URL
- The APK will be saved at: https://expo.dev/accounts/YOUR_USERNAME/projects/fishvision/builds
- Download and install on your Android device

---

## Option 2: Local Build (Advanced)

Build APK locally on your Windows machine. Requires more setup but gives you full control.

### Prerequisites

#### 1. Install Java Development Kit (JDK)

```powershell
# Download and install JDK 17 from:
# https://adoptium.net/temurin/releases/?version=17

# After installation, verify:
java -version
# Should show: openjdk version "17.x.x"
```

#### 2. Install Android Studio

```powershell
# Download from: https://developer.android.com/studio
# During installation, make sure to install:
# - Android SDK
# - Android SDK Platform
# - Android Virtual Device (optional)
```

#### 3. Set Environment Variables

```powershell
# Add to System Environment Variables:
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

#### 4. Accept Android SDK Licenses

```powershell
cd %ANDROID_HOME%\tools\bin
sdkmanager --licenses
# Press 'y' for each license
```

### Build Steps

#### 1. Prebuild (Generate Android Native Code)

```powershell
npx expo prebuild --platform android
```

This creates the `android/` folder with native Android project.

#### 2. Build APK Locally

```powershell
# Navigate to android folder
cd android

# Build release APK using Gradle
.\gradlew assembleRelease

# Or build debug APK (faster, no signing)
.\gradlew assembleDebug
```

#### 3. Find Your APK

```
Release APK: android\app\build\outputs\apk\release\app-release.apk
Debug APK: android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📦 APK File Sizes (Expected)

- **Debug APK**: ~80-100 MB
- **Release APK**: ~30-40 MB (optimized)
- **With Database**: Includes all 2492 fish species (~2.5 MB)

---

## 🔧 Troubleshooting

### Error: "Port 8081 already in use"

```powershell
# Kill the process using port 8081
npx kill-port 8081

# Or use different port
npx expo start --port 8082
```

### Error: "JAVA_HOME not set"

```powershell
# Check Java installation
java -version

# Set JAVA_HOME manually
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
```

### Error: "Android SDK not found"

```powershell
# Verify Android SDK location
dir $env:ANDROID_HOME

# If empty, reinstall Android Studio and SDK
```

### Error: "Gradle build failed"

```powershell
# Clean gradle cache
cd android
.\gradlew clean

# Retry build
.\gradlew assembleRelease --stacktrace
```

### Error: "Out of memory during build"

```powershell
# Increase heap size in android/gradle.properties
# Add or modify:
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

---

## 📲 Installing APK on Android Device

### Method 1: USB Transfer

1. Connect phone to PC via USB
2. Enable "File Transfer" mode on phone
3. Copy APK to phone's Downloads folder
4. On phone, open Files app → Downloads → Tap APK
5. Allow "Install from unknown sources" if prompted
6. Install and open FishVision

### Method 2: Wireless Transfer

1. Upload APK to Google Drive / Dropbox
2. Download on phone
3. Install as above

### Method 3: Direct Install via ADB

```powershell
# With phone connected via USB and USB debugging enabled
adb install android\app\build\outputs\apk\release\app-release.apk
```

---

## ✅ Pre-Build Checklist

Before building, ensure:

- [ ] All code changes committed
- [ ] Database files present in `assets/`
- [ ] App icon images exist in `assets/images/`
- [ ] `app.json` has correct app name and package ID
- [ ] Version number updated in `app.json`
- [ ] No console errors when running `npx expo start`
- [ ] Tested app functionality in Expo Go

---

## 🎯 Build Profiles Explained

### `preview` (Best for Testing)

- Internal distribution
- Fast build
- Easy to install
- Not for Play Store

### `apk` (Custom Profile)

- Standalone APK
- Can be shared directly
- Good for beta testing

### `production` (For Release)

- Optimized and minified
- Smaller file size
- Ready for Play Store
- Requires signing keys

---

## 🔑 Signing Your APK (For Production)

EAS handles signing automatically. If building locally:

### Generate Keystore

```powershell
keytool -genkey -v -keystore fishvision-release.keystore -alias fishvision -keyalg RSA -keysize 2048 -validity 10000
```

### Configure in `android/app/build.gradle`

```gradle
android {
    signingConfigs {
        release {
            storeFile file('fishvision-release.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'fishvision'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ...
        }
    }
}
```

**⚠️ Important**: Never commit keystore or passwords to git!

---

## 📊 Build Performance Tips

1. **Use EAS for first build** - Faster and easier
2. **Enable Gradle daemon** - Speeds up subsequent builds
3. **Use SSD** - Much faster build times
4. **Close other apps** - Free up RAM
5. **Use preview profile** - Faster than production

---

## 🚀 Next Steps After APK is Built

1. **Test on multiple devices** (different Android versions)
2. **Check app size** - Optimize if > 50 MB
3. **Test offline functionality** - All 2492 species should work
4. **Test all features**:
   - Fish catalog browsing
   - Search functionality
   - Filter by habitat/family
   - Bookmarks
   - Swipe gestures
5. **Gather feedback** from beta testers
6. **Fix bugs** and rebuild
7. **Prepare for Play Store** (screenshots, description, etc.)

---

## 📝 Current App Configuration

- **App Name**: FishVision
- **Package ID**: com.jagadeeshwaran05.fishvision
- **Version**: 1.0.0
- **Version Code**: 1
- **Database**: 2492 Indian fish species
- **Size**: ~30-40 MB (estimated)
- **Min Android**: Android 6.0 (API 23)
- **Target Android**: Android 14 (API 34)

---

## 💡 Pro Tips

1. **Keep EAS builds** - They're stored for 30 days
2. **Version your builds** - Increment version for each release
3. **Test debug APK first** - It's faster to build
4. **Use internal testing** - Share with small group first
5. **Monitor build logs** - Check for warnings
6. **Keep keystore safe** - You can't recover it if lost

---

## 🆘 Need Help?

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev/
- **React Native Docs**: https://reactnative.dev/docs/signed-apk-android

---

**Ready to build?** Start with the Quick Start (EAS Build) method! ⚡
