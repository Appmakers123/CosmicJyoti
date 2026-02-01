# AdMob Ad Units (CosmicJyoti)

## Configured Ad Units

| Type | Ad Unit ID | Usage |
|------|------------|-------|
| **Rewarded Interstitial** | `ca-app-pub-3559865379099936/3402574133` | Chat bonus, Karma Store, Feature unlocks |
| **Interstitial** | `ca-app-pub-3559865379099936/3237133191` | Full-page ads after Kundali, Tarot, Numerology, Palm readings |
| **Banner** | `ca-app-pub-3559865379099936/4642548355` | Bottom banner on app |

## Build Configuration

- **Debug builds**: Use Google test rewarded interstitial ID (always has fill)
- **Release builds**: Use production rewarded interstitial ID

## Location in Code

- **AdMobPlugin.java**: Uses `RewardedInterstitialAd` for the rewards ad unit
