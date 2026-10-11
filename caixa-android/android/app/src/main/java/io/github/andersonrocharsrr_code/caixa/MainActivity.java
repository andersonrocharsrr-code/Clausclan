package io.github.andersonrocharsrr_code.caixa;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(CaixaNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
