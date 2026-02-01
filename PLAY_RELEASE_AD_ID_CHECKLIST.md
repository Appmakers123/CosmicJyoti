# Get Your Release Through – Advertising ID (AD_ID) Checklist

If Play Console blocks your release with *"Your advertising ID declaration... manifest doesn't include AD_ID"* or **"Incomplete advertising ID declaration"**, follow this.

---

## Fix: "Incomplete advertising ID declaration"

**All apps targeting Android 13+ must declare whether they use the advertising ID.** You have to complete this in Play Console; the release will stay blocked until it’s done.

### Steps (with AD_ID excluded in your app)

1. Open **Google Play Console** → select your app (**CosmicJyoti**).
2. In the left menu go to **Policy and programmes** → **App content** (or **Policy** → **App content**).
3. Find the row **"Advertising ID"** (or "Uses advertising ID" / "Advertising ID declaration").
4. Click **Start** or **Manage** (or the pencil/edit) to open the declaration.
5. Answer the question **"Does your app use the advertising ID?"**:
   - Choose **"No, my app does not use the advertising ID"** (or equivalent).
   - This matches your current build: the manifest has **no** AD_ID permission.
6. Save / Submit. If there’s a **"Submit declaration"** or **"Save"** button, use it.
7. Wait until the status for **Advertising ID** shows **Complete** or a green check.

Then try creating or updating your release again. The "Incomplete advertising ID declaration" error should go away.

**Important:** Do **not** select "Yes" while your app has no AD_ID permission in the manifest, or you’ll get a different rejection (declaration doesn’t match the app).

---

## Current setup: AD_ID excluded (for publishing)

**AD_ID permission is currently removed** from the manifest so you can publish without the declaration mismatch. AdMob remains in the app; ads may show as non-personalized.

**In Play Console you must:**  
App content → **Advertising ID** (or “Uses advertising ID”) → set to **“No, my app does not use the advertising ID”**.  
If you set “Yes” while the manifest has no AD_ID, the release will be rejected.

---

## 1. (If you add AD_ID back later) Confirm the manifest has AD_ID

Your `android/app/src/main/AndroidManifest.xml` would need **before any other permission**:

```xml
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

Right now this line is **not** in the project so you can publish with “No” to advertising ID.

---

## 2. Build a new AAB from this project

Use this project. Do not upload an old AAB.

From project root:

```bash
npm run build
npx cap sync android
cd android
./gradlew clean bundleRelease
```

Windows:

```bash
npm run build
npx cap sync android
cd android
gradlew.bat clean bundleRelease
```

The AAB you upload must be:

**`android\app\build\outputs\bundle\release\app-release.aab`**

(Use that exact file from this build. Check its “modified” time.)

---

## 3. Match Play Console to your app

Play Console → Your app → **App content** (or **Policy and programmes** → **App content**).

Find the **Advertising ID** (or “Ads” / “Uses advertising ID”) question and set it to:

- **“No, my app does not use the advertising ID”** (or equivalent)

With AD_ID excluded from the manifest, the declaration must be “No”.  
If you set “Yes”, Play will reject the release because the manifest doesn’t include AD_ID.

Also complete **Data safety** if asked (e.g. “Data collected”, “Advertising or marketing”).

---

## 4. Upload the new AAB and create a new release

1. Open the release (Production or your chosen track).
2. **Remove** the old release version / AAB if one is there.
3. **Add** the new `app-release.aab` from step 2.
4. Save and send the release for review.

Use only the AAB you just built. Don’t reuse an old one.

---

## 5. Optional: Check the built AAB does not contain AD_ID

After `bundleRelease`, you can confirm AD_ID is not in the package (so “No” in Play Console is correct):

1. Copy `app-release.aab` to `app-release.zip`.
2. Unzip it.
3. Open `base/manifest/AndroidManifest.xml` in a text editor or with `bundletool dump manifest`.
4. Search for `AD_ID`. You should **not** see `com.google.android.gms.permission.AD_ID`.

---

## Summary (current: AD_ID excluded)

- Manifest: **No** AD_ID permission in `android/app/src/main/AndroidManifest.xml`.
- Build: `./gradlew clean bundleRelease` (or `gradlew.bat` on Windows) in this project.
- Upload: use only the new `app-release.aab` from this build.
- Play Console: set “Uses advertising ID” (or equivalent) to **No** and complete Data safety if required.

Publish with this setup; you can add AD_ID back later and switch the declaration to “Yes” if you want.
