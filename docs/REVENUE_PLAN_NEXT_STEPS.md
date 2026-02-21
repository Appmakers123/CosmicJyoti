# CosmicJyoti — Revenue model: next-step plan

Use this as a checklist when you’re ready to implement revenue. Do it in order; each phase can be a separate “day” or sprint.

---

## Phase 1: Define the offer

- [ ] **1.1** List what stays **free** (e.g. daily horoscope, 1–2 AI questions/day, basic Kundali, one or two labs).
- [ ] **1.2** List what is **premium** (unlimited Rishi, full Kundali + dashas, all labs, PDF export, no ads).
- [ ] **1.3** Choose pricing: e.g. weekly / monthly / yearly (e.g. ₹99 / ₹299 / ₹999 or USD equivalent).
- [ ] **1.4** Decide where ads stay (free only) and where rewarded video “unlock for 5 min” stays.

---

## Phase 2: Payment integration

- [ ] **2.1** Pick provider: **Razorpay** (India), **Stripe** (global), or **Google Play Billing** (if Android app).
- [ ] **2.2** Create account, get API keys, add to `.env` (e.g. `VITE_RAZORPAY_KEY`, backend secret).
- [ ] **2.3** Backend: add endpoint(s) for create subscription / one-time payment and verify webhook.
- [ ] **2.4** Frontend: add “Upgrade” / “Subscribe” screen with plan selection and redirect to payment.
- [ ] **2.5** After successful payment: store premium status (user profile or backend flag) and optionally expiry for subscription.

---

## Phase 3: Paywall and premium checks

- [ ] **3.1** Add a single source of truth for “is premium” (e.g. `usePremium()` or context) that reads from profile/backend.
- [ ] **3.2** Where you already have limits (e.g. chat limit, “premium path” message), gate by `isPremium`: premium users skip limit.
- [ ] **3.3** Lock premium-only screens (e.g. full Kundali, certain labs): show paywall or “Upgrade to unlock” when not premium.
- [ ] **3.4** Hide or reduce ads for premium users (no interstitials, no forced ads; optional rewarded only if you want).

---

## Phase 4: Ads (optional refinement)

- [ ] **4.1** Keep ads only on free tier; ensure premium users are not shown ads.
- [ ] **4.2** If using AdMob: set up mediation and consider rewarded video for “unlock for 5 min” where already used.
- [ ] **4.3** Add a simple “Remove ads” upsell that ties into the same premium subscription (Phase 2–3).

---

## Phase 5: One-time purchases (optional, later)

- [ ] **5.1** Define add-ons (e.g. “Full Kundali PDF – ₹49”, “Compatibility report – ₹79”).
- [ ] **5.2** Add product IDs in payment provider and backend endpoints for one-time payment + delivery (e.g. PDF link).
- [ ] **5.3** UI: “Buy this report” buttons that call payment flow and then show/download report.

---

## Phase 6: Consultations / affiliates (optional, much later)

- [ ] **6.1** If doing “Book astrologer”: design booking flow, slots, and payment share with experts.
- [ ] **6.2** If doing affiliates: add tracking for gemstone / ritual / course links and a simple dashboard or sheet to track commissions.

---

## Quick reference: files to touch (when you implement)

- **Premium state:** e.g. `contexts/SubscriptionContext.tsx` or existing subscription/premium logic in `App.tsx` or profile.
- **Paywall / Upgrade UI:** e.g. `components/PremiumUpgradeModal.tsx`, `components/SubscriptionModal.tsx`, or a dedicated “Upgrade” page.
- **Chat limit:** where you check daily limit for Rishi — add “if premium, unlimited”.
- **Backend:** payment creation, webhook handler, and endpoint that returns “isPremium” (and expiry if subscription).
- **Env:** e.g. `VITE_RAZORPAY_KEY`, `RAZORPAY_SECRET`, or Stripe/Play Billing equivalents.

---

## Notes

- Start with **Phase 1 + 2 + 3** (define offer → payment → paywall). That’s your core revenue.
- Phases 4–6 can be done later or in parallel if you have time.
- Keep this file updated as you complete items (check off the boxes or move done items to a “Done” section at the top).
