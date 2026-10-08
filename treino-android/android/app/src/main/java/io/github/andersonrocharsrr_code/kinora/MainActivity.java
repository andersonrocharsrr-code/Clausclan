package io.github.andersonrocharsrr_code.kinora;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(KinoraNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
