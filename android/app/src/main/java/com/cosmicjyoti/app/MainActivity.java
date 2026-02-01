package com.cosmicjyoti.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        try {
            registerPlugin(AdMobPlugin.class);
        } catch (Throwable t) {
            // Ignore - plugin may auto-discover
        }
        super.onCreate(savedInstanceState);
    }
}
