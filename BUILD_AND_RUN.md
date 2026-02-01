# Build and Run CosmicJyoti

## Web (Development)
```bash
npm install
npm run dev
```

## Web (Production Build)
```bash
npm run build
npm run preview   # Optional: preview the build locally
```

---

# Android APK Build (Mobile App)

## Prerequisites
- Node.js 18+
- Java 17 (JDK) – for Android build
- Android Studio (optional, for debugging) or Android SDK
- Android device or emulator

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Build Web App
```bash
npm run build
```

## Step 3: Sync to Android
```bash
npx cap sync android
```
This copies the `dist` folder to `android/app/src/main/assets/public`. **Without this step, the app will show a blank screen.**

## Step 4: Build APK

### Debug APK (for testing)
```bash
cd android
.\gradlew clean assembleDebug
```
APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for Play Store)
1. Create a keystore (one-time):
   ```bash
   keytool -genkey -v -keystore cosmicjyoti-release.keystore -alias cosmicjyoti -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Create `android/keystore.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=cosmicjyoti
   storeFile=../cosmicjyoti-release.keystore
   ```
3. Update `android/app/build.gradle` signing config if needed.
4. Build:
   ```bash
   cd android
   .\gradlew clean assembleRelease
   ```
   APK output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Quick One-Liner (Debug APK)
```bash
npm run build && npx cap sync android && cd android && .\gradlew assembleDebug
```

## Step 5: Install & Run
- **Install APK**: Copy `app-debug.apk` to your device and install.
- **Run from Android Studio**: `npx cap open android` → Run on device/emulator.
- **Run via CLI**: `npx cap run android`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Blank/white screen** | Run `npx cap sync android` – web assets may be missing |
| **App crashes on launch** | Ensure full build + sync: `npm run build && npx cap sync android` |
| **"Unable to open asset"** | Web assets not synced – run `npx cap sync android` |
| **Ads not showing** | Check AdMob App ID in `AndroidManifest.xml`; ensure AD_ID permission is declared |
| **Profile submit fails** | Add `VITE_PROFILE_SUBMIT_URL` to `.env.local`; rebuild; redeploy Google Apps Script |
| **Gradle build fails** | Ensure Java 17 is installed: `java -version` |
| **Capacitor not found** | Run `npm install @capacitor/core @capacitor/cli @capacitor/android` |

---

## Environment Variables (for APK)
Add to `.env.local` before building:
- `API_KEY` – Gemini API key
- `VITE_GOOGLE_API_KEY` – Google Maps/Geocoding
- `VITE_PROFILE_SUBMIT_URL` – Profile submission (optional)
- `PERPLEXITY_API_KEY` – For personalized horoscope (optional)
