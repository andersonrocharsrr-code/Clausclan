package io.github.andersonrocharsrr_code.fibra;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(FibraNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
