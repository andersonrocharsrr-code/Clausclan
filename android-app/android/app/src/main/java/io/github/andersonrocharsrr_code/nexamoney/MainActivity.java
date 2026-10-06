package io.github.andersonrocharsrr_code.nexamoney;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(NexaNativePlugin.class);
        super.onCreate(savedInstanceState);
    }

    // Widget e notificações do banco abrem o app com uma ação (ex.: "novo" = abrir a janela de novo gasto).
    // O BridgeActivity também chama este método na abertura, com o intent inicial.
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (intent == null) return;
        String action = intent.getStringExtra(NexaNativePlugin.EXTRA_ACTION);
        if (action != null) {
            intent.removeExtra(NexaNativePlugin.EXTRA_ACTION);
            NexaNativePlugin.deliverAction(action);
        }
    }
}
