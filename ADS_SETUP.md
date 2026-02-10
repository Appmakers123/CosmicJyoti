# Ads: AdMob (Android app) + AdSense (Website)

The app uses **AdMob** in the Android app and **AdSense** on the website. They are kept separate for policy compliance and correct reporting.

## Summary

| Platform | Network | Where |
|----------|---------|--------|
| **Android app** (Capacitor WebView) | **AdMob** | Native plugin: banner, interstitial, rewarded. No AdSense script loaded. |
| **Website** (browser at cosmicjyoti.com) | **AdSense** | Script loaded in `App.tsx` only when **not** in app. `AdBanner` shows AdSense units. |

## Android: AdMob

- **App ID** (AndroidManifest): `ca-app-pub-3559865379099936~4711305500`
- **Ad units** (AdMobPlugin.java): Interstitial, Banner, Rewarded (rewarded ID in `BuildConfig`), Native (BuildConfig).
- **Logic**: `services/admobService.ts` calls the native plugin only when `isCapacitor()` (Android). `App.tsx` preloads banner/interstitial/rewarded on app start.
- **AdBanner**: On Android, `AdBanner` does **not** render AdSense; the native AdMob banner is shown at the bottom via the plugin.

## Website: AdSense

- **Publisher ID**: `ca-pub-3559865379099936`
- **Script**: Loaded in `App.tsx` only when **not** `isCapacitor()` (so never in the Android WebView).
- **Slots** (AdBanner.tsx): multiplex, in-feed, display, in-article, etc.
- **Static pages**: `public/landing.html`, `public/about.html`, `public/blog.html`, etc. have AdSense placement comments; add `<ins class="adsbygoogle">` + `(adsbygoogle = window.adsbygoogle || []).push({})` where you want ads.
- **ads.txt**: `public/ads.txt` contains `google.com, pub-3559865379099936, DIRECT, ...`. Ensure it is served at `https://www.cosmicjyoti.com/ads.txt`.

## Checklist

- [ ] **AdSense**: Domain (www.cosmicjyoti.com) verified in [Google AdSense](https://www.google.com/adsense/).
- [ ] **AdSense**: `ads.txt` live at `https://www.cosmicjyoti.com/ads.txt` (deploy `public/ads.txt`).
- [ ] **AdMob**: App linked in AdMob console; ad units created and IDs in AndroidManifest + AdMobPlugin (and BuildConfig for rewarded/native).
- [ ] **Policy**: Do not load AdSense inside the Android app WebView; do not use AdMob on the website. Current code keeps this split.

## Where to change IDs

| What | File |
|------|------|
| AdMob App ID | `android/app/src/main/AndroidManifest.xml` |
| AdMob Interstitial/Banner | `android/app/src/main/java/.../AdMobPlugin.java` |
| AdMob Rewarded/Native | `android/app/build.gradle` (buildConfigField for release) |
| AdSense client + slots | `components/AdBanner.tsx` (`clientId`, `AD_SLOTS`) |
| AdSense script (client) | `App.tsx` (script `src=...client=ca-pub-...`) |
| ads.txt (web) | `public/ads.txt` |
