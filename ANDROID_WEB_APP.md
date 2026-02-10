# Android App: Web Shell (No App Update Needed for Content)

The CosmicJyoti Android app **loads the live website** instead of bundled files. Users always see the latest content without updating the app from the Play Store.

## How It Works

- **`capacitor.config.json`** has `server.url`: `https://www.cosmicjyoti.com`
- On launch, the app opens that URL in an in-app WebView (with native splash, AdMob, etc.).
- Any change you deploy to **www.cosmicjyoti.com** is reflected in the app the next time the user opens it or refreshes.

## When to Update the App

| Change type | Update website only | New app release needed |
|------------|----------------------|-------------------------|
| New features, UI, content, fixes | ✅ Yes | ❌ No |
| New Capacitor/native plugins | — | ✅ Yes |
| Changes to `MainActivity` or Android config | — | ✅ Yes |
| Changes to `capacitor.config.json` (e.g. `server.url`) | — | ✅ Yes |

## Summary

- **Content/features:** Deploy to https://www.cosmicjyoti.com → no app update.
- **Native/Android/Capacitor changes:** Build a new APK/AAB and release on Play Store.

See **BUILD_AND_RUN.md** for build and sync steps when you do need a new app build.
