package io.github.andersonrocharsrr_code.baixar;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(BaixadorPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
