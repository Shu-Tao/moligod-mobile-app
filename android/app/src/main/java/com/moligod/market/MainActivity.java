package com.moligod.market;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        // Register plugins
        registerPlugin(com.capacitorjs.plugins.app.AppPlugin.class);
        registerPlugin(com.capacitorjs.plugins.device.DevicePlugin.class);
        registerPlugin(com.capacitorjs.plugins.keyboard.KeyboardPlugin.class);
        registerPlugin(com.capacitorjs.plugins.statusbar.StatusBarPlugin.class);
        registerPlugin(com.capacitorjs.plugins.browser.BrowserPlugin.class);
        registerPlugin(com.capacitorjs.plugins.haptics.HapticsPlugin.class);
    }
}
