package io.github.andersonrocharsrr_code.sereno;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(SerenoNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
