package io.github.andersonrocharsrr_code.fibrafit;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(FibrafitNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
