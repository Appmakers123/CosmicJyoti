package com.cosmicjyoti.app;

import android.app.Activity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.OnUserEarnedRewardListener;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback;
import com.google.android.gms.ads.nativead.NativeAd;
import com.google.android.gms.ads.nativead.NativeAdView;
import com.google.android.gms.ads.nativead.MediaView;
import com.google.android.gms.ads.AdLoader;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.view.LayoutInflater;

@CapacitorPlugin(name = "AdMob")
public class AdMobPlugin extends Plugin {

    private static final String TAG = "AdMobPlugin";
    private static final String INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3559865379099936/3237133191";
    private static final String BANNER_AD_UNIT_ID = "ca-app-pub-3559865379099936/4642548355";
    private InterstitialAd interstitialAd;
    private RewardedInterstitialAd rewardedInterstitialAd;
    private PluginCall showRewardedAdCall;
    private AdView bannerAdView;
    private PluginCall loadAdCall;
    private PluginCall showAdCall;
    private boolean isInitialized = false;
    private NativeAd nativeAd;
    private ViewGroup nativeAdContainer;

    @Override
    public void load() {
        super.load();
        try {
            initializeAdMob();
        } catch (Exception e) {
            Log.e(TAG, "AdMob init failed (non-fatal): " + e.getMessage());
        }
    }

    private void initializeAdMob() {
        Activity activity = getActivity();
        if (activity == null) {
            Log.e(TAG, "Activity is null, cannot initialize AdMob");
            return;
        }
        try {
            activity.runOnUiThread(() -> {
                try {
                    MobileAds.initialize(activity, new OnInitializationCompleteListener() {
                        @Override
                        public void onInitializationComplete(InitializationStatus initializationStatus) {
                            isInitialized = true;
                            Log.d(TAG, "AdMob initialized successfully");
                        }
                    });
                } catch (Exception e) {
                    Log.e(TAG, "AdMob MobileAds.initialize failed: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "AdMob init error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void loadInterstitial(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        if (!isInitialized) {
            call.reject("AdMob not initialized yet");
            return;
        }

        loadAdCall = call;
        activity.runOnUiThread(() -> {
            AdRequest adRequest = new AdRequest.Builder().build();

            InterstitialAd.load(
                activity,
                INTERSTITIAL_AD_UNIT_ID,
                adRequest,
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(InterstitialAd ad) {
                        interstitialAd = ad;
                        Log.d(TAG, "Interstitial ad loaded");
                        
                        // Set full screen content callback
                        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                interstitialAd = null;
                                Log.d(TAG, "Interstitial ad dismissed");
                                if (showAdCall != null) {
                                    JSObject result = new JSObject();
                                    result.put("dismissed", true);
                                    showAdCall.resolve(result);
                                    showAdCall = null;
                                }
                            }

                            @Override
                            public void onAdFailedToShowFullScreenContent(AdError adError) {
                                interstitialAd = null;
                                Log.e(TAG, "Interstitial ad failed to show: " + adError.getMessage());
                                if (showAdCall != null) {
                                    showAdCall.reject("Failed to show ad: " + adError.getMessage());
                                    showAdCall = null;
                                }
                            }

                            @Override
                            public void onAdShowedFullScreenContent() {
                                Log.d(TAG, "Interstitial ad showed");
                            }
                        });

                        if (loadAdCall != null) {
                            JSObject result = new JSObject();
                            result.put("loaded", true);
                            loadAdCall.resolve(result);
                            loadAdCall = null;
                        }
                    }

                    @Override
                    public void onAdFailedToLoad(LoadAdError loadAdError) {
                        interstitialAd = null;
                        Log.e(TAG, "Interstitial ad failed to load: " + loadAdError.getMessage());
                        if (loadAdCall != null) {
                            loadAdCall.reject("Failed to load ad: " + loadAdError.getMessage());
                            loadAdCall = null;
                        }
                    }
                }
            );
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        if (interstitialAd == null) {
            call.reject("Interstitial ad not loaded. Call loadInterstitial first.");
            return;
        }

        showAdCall = call;
        activity.runOnUiThread(() -> {
            interstitialAd.show(activity);
        });
    }

    @PluginMethod
    public void isInterstitialReady(PluginCall call) {
        JSObject result = new JSObject();
        result.put("ready", interstitialAd != null);
        call.resolve(result);
    }

    @PluginMethod
    public void loadBanner(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        if (!isInitialized) {
            call.reject("AdMob not initialized yet");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                // Remove existing banner if any
                if (bannerAdView != null) {
                    ViewGroup parent = (ViewGroup) bannerAdView.getParent();
                    if (parent != null) {
                        parent.removeView(bannerAdView);
                    }
                    bannerAdView.destroy();
                    bannerAdView = null;
                }

                // Create new banner ad view
                bannerAdView = new AdView(activity);
                bannerAdView.setAdUnitId(BANNER_AD_UNIT_ID);
                bannerAdView.setAdSize(AdSize.BANNER);

                // Set ad listener
                bannerAdView.setAdListener(new AdListener() {
                    @Override
                    public void onAdLoaded() {
                        Log.d(TAG, "Banner ad loaded");
                        JSObject result = new JSObject();
                        result.put("loaded", true);
                        call.resolve(result);
                    }

                    @Override
                    public void onAdFailedToLoad(LoadAdError loadAdError) {
                        Log.e(TAG, "Banner ad failed to load: " + loadAdError.getMessage());
                        call.reject("Failed to load banner ad: " + loadAdError.getMessage());
                    }

                    @Override
                    public void onAdClicked() {
                        Log.d(TAG, "Banner ad clicked");
                    }

                    @Override
                    public void onAdOpened() {
                        Log.d(TAG, "Banner ad opened");
                    }

                    @Override
                    public void onAdClosed() {
                        Log.d(TAG, "Banner ad closed");
                    }
                });

                // Load the ad
                AdRequest adRequest = new AdRequest.Builder().build();
                bannerAdView.loadAd(adRequest);
            } catch (Exception e) {
                Log.e(TAG, "Error loading banner ad: " + e.getMessage());
                call.reject("Error loading banner ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        if (bannerAdView == null) {
            call.reject("Banner ad not loaded. Call loadBanner first.");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                // Get the root view
                View rootView = activity.findViewById(android.R.id.content);
                if (rootView instanceof ViewGroup) {
                    ViewGroup rootViewGroup = (ViewGroup) rootView;
                    
                    // Check if banner is already added
                    if (bannerAdView.getParent() != null) {
                        JSObject result = new JSObject();
                        result.put("shown", true);
                        call.resolve(result);
                        return;
                    }

                    // Create container for banner at bottom
                    FrameLayout bannerContainer = new FrameLayout(activity);
                    FrameLayout.LayoutParams containerParams = new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT
                    );
                    containerParams.gravity = android.view.Gravity.BOTTOM;
                    bannerContainer.setLayoutParams(containerParams);

                    // Add banner to container
                    FrameLayout.LayoutParams bannerParams = new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT
                    );
                    bannerParams.gravity = android.view.Gravity.CENTER_HORIZONTAL;
                    bannerAdView.setLayoutParams(bannerParams);
                    bannerContainer.addView(bannerAdView);

                    // Add container to root view
                    rootViewGroup.addView(bannerContainer);

                    JSObject result = new JSObject();
                    result.put("shown", true);
                    call.resolve(result);
                    Log.d(TAG, "Banner ad shown");
                } else {
                    call.reject("Root view is not a ViewGroup");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error showing banner ad: " + e.getMessage());
                call.reject("Error showing banner ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void hideBanner(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                if (bannerAdView != null && bannerAdView.getParent() != null) {
                    ViewGroup parent = (ViewGroup) bannerAdView.getParent();
                    if (parent.getParent() != null) {
                        ViewGroup grandParent = (ViewGroup) parent.getParent();
                        grandParent.removeView(parent);
                    } else {
                        parent.removeView(bannerAdView);
                    }
                    Log.d(TAG, "Banner ad hidden");
                }
                JSObject result = new JSObject();
                result.put("hidden", true);
                call.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Error hiding banner ad: " + e.getMessage());
                call.reject("Error hiding banner ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void removeBanner(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                if (bannerAdView != null) {
                    ViewGroup parent = (ViewGroup) bannerAdView.getParent();
                    if (parent != null) {
                        if (parent.getParent() != null) {
                            ViewGroup grandParent = (ViewGroup) parent.getParent();
                            grandParent.removeView(parent);
                        } else {
                            parent.removeView(bannerAdView);
                        }
                    }
                    bannerAdView.destroy();
                    bannerAdView = null;
                    Log.d(TAG, "Banner ad removed and destroyed");
                }
                JSObject result = new JSObject();
                result.put("removed", true);
                call.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Error removing banner ad: " + e.getMessage());
                call.reject("Error removing banner ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void loadRewarded(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }
        if (!isInitialized) {
            // Retry after a short delay - AdMob init is async and may not be ready yet
            activity.runOnUiThread(() -> {
                android.os.Handler handler = new android.os.Handler(android.os.Looper.getMainLooper());
                handler.postDelayed(() -> {
                    if (isInitialized) {
                        loadRewarded(call);
                    } else {
                        call.reject("AdMob not initialized yet");
                    }
                }, 1500);
            });
            return;
        }
        activity.runOnUiThread(() -> {
            AdRequest adRequest = new AdRequest.Builder().build();
            RewardedInterstitialAd.load(activity, BuildConfig.REWARDED_AD_UNIT_ID, adRequest, new RewardedInterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(RewardedInterstitialAd ad) {
                    rewardedInterstitialAd = ad;
                    Log.d(TAG, "Rewarded interstitial ad loaded");
                    JSObject result = new JSObject();
                    result.put("loaded", true);
                    call.resolve(result);
                }
                @Override
                public void onAdFailedToLoad(LoadAdError loadAdError) {
                    rewardedInterstitialAd = null;
                    Log.e(TAG, "Rewarded interstitial ad failed to load: " + loadAdError.getMessage());
                    call.reject("Failed to load rewarded ad: " + loadAdError.getMessage());
                }
            });
        });
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }
        if (rewardedInterstitialAd == null) {
            call.reject("Rewarded ad not loaded. Call loadRewarded first.");
            return;
        }
        showRewardedAdCall = call;
        activity.runOnUiThread(() -> {
            rewardedInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                    rewardedInterstitialAd = null;
                    Log.d(TAG, "Rewarded interstitial ad dismissed");
                    if (showRewardedAdCall != null) {
                        JSObject result = new JSObject();
                        result.put("dismissed", true);
                        result.put("earnedReward", false);
                        showRewardedAdCall.resolve(result);
                        showRewardedAdCall = null;
                    }
                }
                @Override
                public void onAdFailedToShowFullScreenContent(AdError adError) {
                    rewardedInterstitialAd = null;
                    Log.e(TAG, "Rewarded interstitial ad failed to show: " + adError.getMessage());
                    if (showRewardedAdCall != null) {
                        showRewardedAdCall.reject("Failed to show rewarded ad: " + adError.getMessage());
                        showRewardedAdCall = null;
                    }
                }
            });
            rewardedInterstitialAd.show(activity, rewardItem -> {
                Log.d(TAG, "User earned reward: " + rewardItem.getAmount() + " " + rewardItem.getType());
                if (showRewardedAdCall != null) {
                    JSObject result = new JSObject();
                    result.put("earnedReward", true);
                    result.put("amount", rewardItem.getAmount());
                    result.put("type", rewardItem.getType());
                    showRewardedAdCall.resolve(result);
                    showRewardedAdCall = null;
                }
            });
        });
    }

    @PluginMethod
    public void isRewardedReady(PluginCall call) {
        JSObject result = new JSObject();
        result.put("ready", rewardedInterstitialAd != null);
        call.resolve(result);
    }

    @PluginMethod
    public void loadNativeAd(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }
        if (!isInitialized) {
            call.reject("AdMob not initialized yet");
            return;
        }
        activity.runOnUiThread(() -> {
            AdLoader adLoader = new AdLoader.Builder(activity, BuildConfig.NATIVE_AD_UNIT_ID)
                .forNativeAd(ad -> {
                    if (nativeAd != null) {
                        nativeAd.destroy();
                    }
                    nativeAd = ad;
                    Log.d(TAG, "Native ad loaded");
                    JSObject result = new JSObject();
                    result.put("loaded", true);
                    call.resolve(result);
                })
                .withAdListener(new AdListener() {
                    @Override
                    public void onAdFailedToLoad(LoadAdError loadAdError) {
                        nativeAd = null;
                        Log.e(TAG, "Native ad failed to load: " + loadAdError.getMessage());
                        call.reject("Failed to load native ad: " + loadAdError.getMessage());
                    }
                })
                .build();
            adLoader.loadAd(new AdRequest.Builder().build());
        });
    }

    @PluginMethod
    public void showNativeAd(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }
        if (nativeAd == null) {
            call.reject("Native ad not loaded. Call loadNativeAd first.");
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                View rootView = activity.findViewById(android.R.id.content);
                if (!(rootView instanceof ViewGroup)) {
                    call.reject("Root view is not a ViewGroup");
                    return;
                }
                ViewGroup rootViewGroup = (ViewGroup) rootView;

                if (nativeAdContainer != null && nativeAdContainer.getParent() != null) {
                    ((ViewGroup) nativeAdContainer.getParent()).removeView(nativeAdContainer);
                }

                nativeAdContainer = new FrameLayout(activity);
                FrameLayout.LayoutParams containerParams = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT
                );
                containerParams.gravity = android.view.Gravity.BOTTOM;
                containerParams.bottomMargin = 60;
                nativeAdContainer.setLayoutParams(containerParams);

                LayoutInflater inflater = LayoutInflater.from(activity);
                NativeAdView adView = (NativeAdView) inflater.inflate(R.layout.native_ad_layout, nativeAdContainer, false);

                TextView headlineView = adView.findViewById(R.id.ad_headline);
                if (nativeAd.getHeadline() != null) {
                    headlineView.setText(nativeAd.getHeadline());
                    headlineView.setVisibility(View.VISIBLE);
                }
                adView.setHeadlineView(headlineView);

                ImageView iconView = adView.findViewById(R.id.ad_app_icon);
                if (nativeAd.getIcon() != null) {
                    iconView.setImageDrawable(nativeAd.getIcon().getDrawable());
                    iconView.setVisibility(View.VISIBLE);
                }
                adView.setIconView(iconView);

                TextView bodyView = adView.findViewById(R.id.ad_body);
                if (nativeAd.getBody() != null) {
                    bodyView.setText(nativeAd.getBody());
                    bodyView.setVisibility(View.VISIBLE);
                }
                adView.setBodyView(bodyView);

                MediaView mediaView = adView.findViewById(R.id.ad_media);
                adView.setMediaView(mediaView);

                Button ctaView = adView.findViewById(R.id.ad_call_to_action);
                if (nativeAd.getCallToAction() != null) {
                    ctaView.setText(nativeAd.getCallToAction());
                    ctaView.setVisibility(View.VISIBLE);
                }
                adView.setCallToActionView(ctaView);

                adView.setNativeAd(nativeAd);
                nativeAdContainer.addView(adView);
                rootViewGroup.addView(nativeAdContainer, 0);

                JSObject result = new JSObject();
                result.put("shown", true);
                call.resolve(result);
                Log.d(TAG, "Native ad shown");
            } catch (Exception e) {
                Log.e(TAG, "Error showing native ad: " + e.getMessage());
                call.reject("Error showing native ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void hideNativeAd(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }
        activity.runOnUiThread(() -> {
            if (nativeAdContainer != null && nativeAdContainer.getParent() != null) {
                ((ViewGroup) nativeAdContainer.getParent()).removeView(nativeAdContainer);
                nativeAdContainer.setVisibility(View.GONE);
            }
            JSObject result = new JSObject();
            result.put("hidden", true);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void removeNativeAd(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }
        activity.runOnUiThread(() -> {
            if (nativeAdContainer != null) {
                if (nativeAdContainer.getParent() != null) {
                    ((ViewGroup) nativeAdContainer.getParent()).removeView(nativeAdContainer);
                }
                nativeAdContainer = null;
            }
            if (nativeAd != null) {
                nativeAd.destroy();
                nativeAd = null;
            }
            JSObject result = new JSObject();
            result.put("removed", true);
            call.resolve(result);
        });
    }

    @Override
    public void handleOnDestroy() {
        super.handleOnDestroy();
        if (bannerAdView != null) {
            bannerAdView.destroy();
            bannerAdView = null;
        }
        if (nativeAd != null) {
            nativeAd.destroy();
            nativeAd = null;
        }
    }
}
