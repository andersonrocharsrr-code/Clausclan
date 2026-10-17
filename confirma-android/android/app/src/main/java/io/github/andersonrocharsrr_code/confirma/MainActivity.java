package io.github.andersonrocharsrr_code.confirma;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(TelaPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
