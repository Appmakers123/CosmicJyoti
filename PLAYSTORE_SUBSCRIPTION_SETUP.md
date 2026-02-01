# Play Store App Upload & Subscription Setup Guide

Step-by-step guide to upload CosmicJyoti to the Play Store and configure subscriptions per Google's requirements.

---

## Part 1: Prerequisites

### 1.1 Google Play Developer Account
- **Cost**: One-time $25 registration fee
- **Sign up**: [play.google.com/console](https://play.google.com/console)
- **Verification**: May take 24–48 hours

### 1.2 Payments Profile (Required for Subscriptions)
- Go to [Google Payments Center](https://pay.google.com)
- Create/link a payments profile to your developer account
- **Required** to sell in-app purchases or subscriptions
- See: [Link payments profile](https://support.google.com/googleplay/android-developer/answer/3092739)

---

## Part 2: Upload Your App (First Time)

### 2.1 Add Google Play Billing Library
Your app **must** include the Billing Library before you can create subscription products in Play Console.

Add to `android/app/build.gradle`:

```gradle
dependencies {
    // ... existing deps
    implementation "com.android.billingclient:billing:7.1.1"
}
```

### 2.2 Build & Upload
1. Build release APK/AAB: `npm run build && npx cap sync android`
2. In Android Studio: **Build → Generate Signed Bundle / APK**
3. Upload to Play Console → **Internal testing** track first

### 2.3 Create App in Play Console
1. **All apps** → **Create app**
2. Fill store listing, content rating, privacy policy, etc.
3. **Publish** to Internal testing track (no review needed for internal)

**Important**: Billing products (subscriptions) only appear in Play Console **after** you publish a version that includes the Billing Library.

---

## Part 3: Subscription Structure (Google's Model)

Google uses a 3-level structure:

```
Subscription (e.g. cosmic_premium)
  └── Base Plan (e.g. monthly, yearly, prepaid_week)
        └── Offers (optional: free trial, intro price, upgrade)
```

### 3.1 Subscription Types

| Type | Use Case | Billing |
|------|----------|---------|
| **Auto-renewing** | Monthly/yearly recurring | Charges automatically each period |
| **Prepaid** | 1 day, 1 week, etc. | User pays once; no auto-renewal |
| **Installments** | Brazil, France, Italy, Spain only | Fixed monthly payments over 3–24 months |

### 3.2 Recommended Setup for CosmicJyoti

| Product ID | Base Plan | Type | Duration |
|------------|-----------|------|----------|
| `cosmic_premium` | `monthly` | Auto-renewing | Monthly |
| `cosmic_premium` | `yearly` | Auto-renewing | Yearly |
| `cosmic_premium` | `prepaid_day` | Prepaid | 1 day |
| `cosmic_premium` | `prepaid_week` | Prepaid | 1 week |

---

## Part 4: Create Subscriptions in Play Console

### 4.1 Navigate
**Monetize with Play** → **Products** → **Subscriptions**

### 4.2 Create Subscription
1. **Create subscription**
2. **Product ID**: `cosmic_premium` (unique, lowercase, max 40 chars)
3. **Name**: "CosmicJyoti AI Premium"
4. **Benefits**: Add up to 4 (e.g. "Unlimited Kundali", "Unlimited AI Chat", "No ads")
5. **Save**

### 4.3 Create Base Plans

**Base Plan 1 – Monthly (Auto-renewing)**
- **Base plan ID**: `monthly`
- **Type**: Auto-renewing
- **Billing period**: Monthly
- **Grace period**: 3 days (optional)
- **Price**: Set for India (₹149), US ($4.99), etc.
- **Activate**

**Base Plan 2 – Yearly (Auto-renewing)**
- **Base plan ID**: `yearly`
- **Type**: Auto-renewing
- **Billing period**: Yearly
- **Price**: ₹999 / $29.99
- **Activate**

**Base Plan 3 – 1 Day (Prepaid)**
- **Base plan ID**: `prepaid_day`
- **Type**: Prepaid
- **Duration**: 1 day
- **Allow extension**: Yes (user can top up)
- **Price**: ₹9 / $0.99
- **Activate**

**Base Plan 4 – 1 Week (Prepaid)**
- **Base plan ID**: `prepaid_week`
- **Type**: Prepaid
- **Duration**: 1 week
- **Price**: ₹49 / $2.99
- **Activate**

### 4.4 Create Offers (Optional)

**New customer acquisition**
- **Offer ID**: `intro_monthly`
- **Eligibility**: Never had this subscription
- **Phase**: Free trial 3 days, then recurring monthly
- Or: **Introductory price** – 50% off first month

**Upgrade offer**
- **Offer ID**: `monthly_to_yearly`
- **Eligibility**: Current subscription = monthly
- **Phase**: Discount to switch to yearly

---

## Part 5: Policy & UX Requirements

### 5.1 Subscriptions Policy
- Be **transparent**: cost, billing frequency, cancel method
- **Clear UI**: Users must easily find how to manage/cancel
- **Online cancel**: Provide easy web-based cancellation (Play Store subscription center handles this)

### 5.2 In-App Requirements
- Show subscription terms before purchase
- Link to manage/cancel (e.g. `https://play.google.com/store/account/subscriptions`)
- Don’t use misleading names (e.g. don’t name a paid plan "Free Trial")

---

## Part 6: Capacitor Integration Options

### Option A: RevenueCat (Recommended)
- Handles Play Billing + App Store + web
- Server-side receipt validation
- Free tier available
- **Install**: `npm install @revenuecat/purchases-capacitor`

### Option B: Cordova Plugin Purchase
- `cordova-plugin-purchase` (Fovea)
- Works with Capacitor
- **Install**: `npm install cc.fovea.cordova.purchase`

### Option C: Native Billing (Custom)
- Add Billing Library to `build.gradle`
- Create Capacitor plugin that wraps `BillingClient`
- More work, full control

---

## Part 7: Product ID Mapping

Map your app’s tiers to Play Console product IDs:

| Your Tier | Play Product ID | Base Plan ID |
|-----------|-----------------|--------------|
| 1 Day | `cosmic_premium` | `prepaid_day` |
| 1 Week | `cosmic_premium` | `prepaid_week` |
| 1 Month | `cosmic_premium` | `monthly` |
| 1 Year | `cosmic_premium` | `yearly` |

When purchasing, you request: `cosmic_premium` + specific base plan/offer.

---

## Part 8: Real-Time Developer Notifications (Optional but Recommended)

For subscription lifecycle (renew, cancel, refund):

1. Create a **Google Cloud Pub/Sub** topic
2. Grant `google-play-developer-notifications@system.gserviceaccount.com` **Pub/Sub Publisher**
3. In Play Console: **Monetize** → **Monetization setup** → **Real-time developer notifications**
4. Enter topic: `projects/YOUR_PROJECT/topics/YOUR_TOPIC`
5. Your backend subscribes to the topic to update user entitlements

---

## Part 9: Checklist Before Publishing

- [ ] Google Play Developer account ($25)
- [ ] Payments profile linked
- [ ] Billing Library in `build.gradle`
- [ ] App uploaded to Internal/Closed testing
- [ ] Subscriptions created in Play Console
- [ ] Base plans activated with prices
- [ ] Privacy policy URL set
- [ ] Subscription terms clear in app
- [ ] Cancel/manage link in app

---

## Quick Links

- [Create subscriptions](https://support.google.com/googleplay/android-developer/answer/140504)
- [Understanding subscriptions](https://support.google.com/googleplay/android-developer/answer/12154973)
- [Play Billing Library](https://developer.android.com/google/play/billing)
- [Capacitor In-App Purchases](https://capacitorjs.com/docs/guides/in-app-purchases)
