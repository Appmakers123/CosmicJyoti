# Subscription & Payment Integration Guide

CosmicJyoti uses a **subscription-based business model** to cover AI API costs while keeping free features accessible with ads.

## Business Model

| Tier | Access | Monetization |
|------|--------|--------------|
| **Free** | Limited AI (1 Kundali/day, 3 Horoscopes/day, 1 Compatibility/day, 10 Chat messages/day). Dreams & Astro Games require subscription. | Non-disruptive ads |
| **Subscription** | Unlimited AI (Kundali, Horoscope, Chat, Tarot, Palm, Numerology, Cosmic Health, Ask AI, etc.) | Paid plans |

## Subscription Tiers (Pricing)

Pricing set above API cost per user (~$0.001–0.01/query, ~$3–6/month for heavy users).

| Plan | INR | USD | Duration |
|------|-----|-----|----------|
| 1 Day | ₹19 | $0.99 | 24 hours |
| 1 Week | ₹79 | $2.99 | 7 days |
| 1 Month | ₹249 | $4.99 | 30 days |
| 1 Year | ₹1499 | $29.99 | 365 days |

## Testing (Dev Mode)

- **Promo codes**: Use `cosmic1d`, `cosmic1w`, `cosmic1m`, `cosmic1y`, or `test` in the Subscription modal to activate a plan.
- **Dev purchase**: In development (`import.meta.env.DEV`), the Subscribe button grants subscription directly for testing.

## Payment Integration

### Android (Google Play Billing)

1. **Add Capacitor plugin**:
   ```bash
   npm install @capgo/capacitor-purchases
   # or: npm install @revenuecat/purchases-capacitor
   ```

2. **Create products in Play Console**:
   - In-app products: `cosmic_day`, `cosmic_week`, `cosmic_month`, `cosmic_year`
   - Or subscriptions: `cosmic_monthly`, `cosmic_yearly`

3. **Update `SubscriptionModal.tsx`**:
   - Replace `handlePurchase` with real IAP flow
   - Call `grantSubscription(tier)` after successful purchase
   - Use server-side verification (recommended) for security

4. **RevenueCat** (recommended): Handles Play Store + App Store + web, free tier available. See [RevenueCat docs](https://www.revenuecat.com/docs).

### Web (Stripe / Paddle)

1. **Stripe Payment Links** (no backend needed):
   - Create Payment Links in Stripe Dashboard for each tier
   - Use Stripe Checkout for one-time purchases
   - Webhook to your backend to validate and grant subscription

2. **Update `SubscriptionModal.tsx`**:
   - For web (`!isCapacitor()`), open Stripe Payment Link
   - After payment, redirect to success URL that calls `grantSubscription` (e.g. via URL param + localStorage)

3. **Paddle** is an alternative that handles tax/VAT automatically.

## Files to Modify

- `components/SubscriptionModal.tsx` – Replace `handlePurchase` with real payment flow
- `utils/subscriptionService.ts` – Add server-side validation if needed
- `.env.example` – Add `VITE_STRIPE_PUBLIC_KEY`, `VITE_REVENUECAT_KEY`, etc.

## Free Tier Limits (configurable)

Edit `utils/freeUsageLimits.ts`:

```ts
const FREE_LIMITS = {
  kundali: 1,
  horoscope: 3,
  compatibility: 1,
  dream: 0,  // subscription only
  tarot: 0,
  palm: 0,
  numerology: 0,
  cosmicHealth: 0,
};
```

## Subscriber Benefits

- Unlimited AI features (Kundali, Horoscope, Chat, Tarot, Palm, Numerology, Dreams, Astro Games, Cosmic Health, Ask AI)
- **Clean app** – no ads (banners and interstitials hidden)
- Ask AI in Kundali, Horoscope, Tarot, Compatibility
