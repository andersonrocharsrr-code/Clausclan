package io.github.andersonrocharsrr_code.forja;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ForjaNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
