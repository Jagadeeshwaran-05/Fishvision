# ForAPK - Build Checklist & Testing Guide

## ✅ Pre-Build Checklist

### Code Changes Completed

- [x] Scan page: Disabled with offline message
- [x] Scan page: Changed "Swipe to save" → "Explore Fish Database"
- [x] Authentication: Completely offline (sign-in, sign-up)
- [x] Fish saving: Uses offline storage
- [x] Places bookmarking: Uses offline storage
- [x] Profile management: Offline updates
- [x] All API imports replaced with offline storage

### Files Modified

- [x] `app/scan.tsx` - Disabled scanning, added offline message
- [x] `app/auth/sign-in.tsx` - Offline authentication
- [x] `app/auth/sign-up.tsx` - Offline registration
- [x] `app/fish-details.tsx` - Offline fish management
- [x] `app/home.tsx` - Offline storage integration
- [x] `app/bookmarks.tsx` - Offline API calls
- [x] `app/profile.tsx` - Offline profile management
- [x] `services/offlineStorage.ts` - NEW: Complete offline storage service

### Documentation

- [x] `OFFLINE_APK_CHANGES.md` - Complete change documentation
- [x] This checklist file

---

## 🧪 Testing Instructions

### 1. Authentication Testing

#### Sign Up

```
1. Open app
2. Navigate to sign-up screen
3. Fill form: name, email, password
4. Click "Sign Up"
5. Should auto-login and navigate to home

✅ Expected: Success message, navigate to home
❌ Test fail conditions:
   - Empty fields → Shows error
   - Duplicate email → Shows "Email already registered"
   - Passwords don't match → Shows error
   - Password < 6 chars → Shows error
```

#### Sign In

```
1. Open app (or logout first)
2. Navigate to sign-in screen
3. Enter email and password
4. Click "Login"

✅ Expected: Navigate to home screen
❌ Test fail conditions:
   - Wrong email → "User not found"
   - Wrong password → "Incorrect password"
   - Empty fields → Shows validation error
```

#### Login Later

```
1. On sign-in screen
2. Click "Login Later" button

✅ Expected: Navigate to home without authentication
Note: Some features require login
```

---

### 2. Fish Management Testing

#### Browse Fish Catalog

```
1. From home, tap "Explore All Fishes"
2. OR navigate to fish-catalog page
3. Scroll through fish list

✅ Expected: All 31 species visible with images
```

#### View Fish Details

```
1. Tap any fish card
2. View full details page

✅ Expected:
   - Fish image loads
   - Name, scientific name visible
   - Characteristics shown
   - Related species displayed
   - Heart icon shows (empty if not saved)
```

#### Save/Unsave Fish

```
1. On fish details page
2. Tap heart icon in top-right

✅ Expected:
   - First tap: Heart fills, "Fish saved" alert
   - Second tap: Heart empties, "Fish removed" alert
   - Counter updates on home screen
```

#### View Saved Fishes

```
1. Navigate to Bookmarks page
2. Select "Fishes" tab

✅ Expected:
   - All saved fishes appear
   - Can tap to view details
   - Can delete by tapping X button
   - Heart icon is filled
```

---

### 3. Places Management Testing

#### Browse Places

```
1. From home, scroll to "Popular Places"
2. Tap "Explore All Places"

✅ Expected: Grid of places with fish counts
```

#### View Place Details

```
1. Tap any place card
2. View place details page

✅ Expected:
   - Place name and region
   - List of fish species in that region
   - Can tap fish to view details
```

#### Bookmark Places

```
1. On places list or place details
2. Tap bookmark icon

✅ Expected:
   - Icon fills
   - Place saved to bookmarks
```

#### View Bookmarked Places

```
1. Navigate to Bookmarks page
2. Select "Places" tab

✅ Expected:
   - All bookmarked places appear
   - Can tap to view details
   - Can remove bookmark
```

---

### 4. Scanning Feature Testing

#### Access Scan Page

```
1. Navigate to scan page
2. Tap "Scan your fish" button
3. Choose Camera or Gallery

✅ Expected:
   - Image picker opens
   - Can select image
```

#### View Offline Message

```
1. After selecting image
2. Wait for "loading" animation

✅ Expected: Result card shows:
   - "Scanning Feature Unavailable"
   - "Scanning doesn't work on APK version"
   - Message about backend requirement
   - Stats show: Available ❌, Database ✓, Offline ✓
```

#### Explore Database Button

```
1. On result card
2. Tap "Explore Fish Database" button

✅ Expected: Navigate to fish-catalog page
```

---

### 5. Profile Management Testing

#### View Profile

```
1. Navigate to Profile page
2. View current profile info

✅ Expected: Shows user name, email
```

#### Update Profile

```
1. Edit name, first name, last name, etc.
2. Tap "Update Profile"

✅ Expected:
   - Success alert
   - Changes persist after app restart
```

#### Change Password

```
1. Enter current password
2. Enter new password
3. Tap "Change Password"

✅ Expected:
   - Success alert
   - Can login with new password after logout
```

#### Upload Avatar

```
1. Tap avatar/profile image
2. Select image from gallery
3. Confirm selection

✅ Expected:
   - Image shows immediately
   - Persists after app restart
```

---

### 6. Data Persistence Testing

#### Test After App Restart

```
1. Close app completely
2. Reopen app

✅ Check persistence of:
   - User login (should stay logged in)
   - Saved fishes
   - Bookmarked places
   - Profile changes
   - Profile image
```

#### Test Logout/Login

```
1. Logout from profile
2. Login again with same credentials

✅ Expected:
   - All saved data visible
   - Saved fishes intact
   - Bookmarked places intact
   - Profile data correct
```

---

## 🚀 Build Commands

### Development Testing

```bash
# Start development server
npx expo start

# Test on Android device
npx expo start --android

# Test on iOS device (Mac only)
npx expo start --ios

# Web testing
npx expo start --web
```

### Production APK Build

#### Method 1: EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK for Android
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
```

#### Method 2: Local Build

```bash
# Generate Android bundle
npx expo export --platform android

# Or use Expo Application Services
npx expo build:android
```

---

## 📱 APK Installation Testing

### After Build Completes

1. **Download APK** from EAS dashboard or build output
2. **Transfer to Android device** via:

   - USB cable
   - Email/Cloud storage
   - Direct download link

3. **Install APK**:

   ```
   - Enable "Unknown Sources" in Settings
   - Locate APK file
   - Tap to install
   - Accept permissions
   ```

4. **Test Installation**:
   ```
   - App opens without crash
   - No immediate errors
   - Splash screen shows
   - Navigation works
   ```

---

## 🔍 Common Issues & Fixes

### Issue: App crashes on startup

**Fix**: Check logs, may need to rebuild with production config

### Issue: Images not loading

**Fix**: Ensure all image URLs are accessible or use local images

### Issue: Fish database empty

**Fix**: Verify `assets/fish_database.json` is included in bundle

### Issue: Authentication not working

**Fix**: Clear app data and test fresh installation

### Issue: Data not persisting

**Fix**: Check AsyncStorage permissions in app manifest

---

## 📊 Performance Checklist

- [ ] App opens in < 3 seconds
- [ ] Fish catalog loads instantly
- [ ] Search is responsive
- [ ] Images load quickly
- [ ] No memory leaks after extended use
- [ ] Smooth scrolling in lists
- [ ] No crashes during normal use

---

## 🎯 Final Verification

Before distributing APK:

1. [ ] Test on multiple Android devices/versions
2. [ ] Test with fresh install (no previous data)
3. [ ] Test all main features
4. [ ] Verify offline functionality
5. [ ] Check app permissions are minimal
6. [ ] Ensure no backend dependencies
7. [ ] Test data persistence across restarts
8. [ ] Verify proper error handling

---

## 📦 Distribution

### APK Distribution Methods:

1. **Direct Download**

   - Host APK on website
   - Share download link
   - Users install manually

2. **Email/File Sharing**

   - Send APK via email
   - Share via Google Drive, Dropbox, etc.

3. **Internal Testing** (Google Play)

   - Upload to Google Play Console
   - Create internal testing track
   - Add testers via email

4. **Public Release** (Future)
   - Prepare for Play Store listing
   - Create screenshots, description
   - Submit for review

---

## 🎉 Success Criteria

Your APK is ready for distribution when:

✅ All features work offline
✅ No backend dependencies
✅ Data persists correctly
✅ No crashes or critical bugs
✅ User authentication works
✅ Fish and place management works
✅ Profile management works
✅ Scanning shows appropriate message
✅ App size is reasonable (< 50MB recommended)
✅ Tested on multiple devices

---

## 📝 Notes for Users

Include this in your distribution:

```
FishVision APK - Offline Version

Features:
- Browse 31 fish species offline
- Save favorite fishes
- Bookmark fishing places
- Offline authentication
- Complete profile management

Limitations:
- No fish scanning (requires backend server)
- Data stored only on device
- No cloud sync

Requirements:
- Android 5.0 or higher
- ~50MB storage space

Installation:
1. Enable "Install from Unknown Sources"
2. Download and install APK
3. Open app and create account
4. Start exploring fish database!
```

---

Good luck with your APK build! 🚀🐟
