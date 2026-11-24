package io.github.andersonrocharsrr_code.editor;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(GaleriaPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
