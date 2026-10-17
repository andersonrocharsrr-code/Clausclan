package io.github.andersonrocharsrr_code.confirma;

import android.graphics.Color;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Cor de fundo da janela. Ela começa verde-escura (abertura sem clarão) e o app troca para a cor da tela
 * depois da abertura: é o que aparece no espaço que o Android abre para o teclado antes de ele surgir.
 */
@CapacitorPlugin(name = "Tela")
public class TelaPlugin extends Plugin {

    @PluginMethod
    public void fundo(PluginCall call) {
        final int cor;
        try {
            cor = Color.parseColor(call.getString("cor", "#f2f5f3"));
        } catch (IllegalArgumentException e) {
            call.reject("Cor inválida.");
            return;
        }
        getActivity().runOnUiThread(() -> {
            getActivity().getWindow().getDecorView().setBackgroundColor(cor);
            bridge.getWebView().setBackgroundColor(cor);
            call.resolve();
        });
    }
}
