package io.github.andersonrocharsrr_code.nexamoney;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Ponte entre o app (JavaScript) e as partes nativas do Nexa Money:
 * o widget da tela inicial e as ações vindas dele (botão "+").
 */
@CapacitorPlugin(name = "NexaNative")
public class NexaNativePlugin extends Plugin {

    static final String EXTRA_ACTION = "nexa_action";
    private static NexaNativePlugin instance;
    private static String pendingAction;

    @Override
    public void load() {
        instance = this;
        // Limpa o que sobrou da antiga leitura de notificações do banco (recurso removido).
        Context ctx = getContext();
        ctx.getSharedPreferences("nexa_bank", Context.MODE_PRIVATE).edit().clear().apply();
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            android.app.NotificationManager nm = (android.app.NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.deleteNotificationChannel("banco");
        }
    }

    /** Chamado pela MainActivity. Se o app ainda está abrindo, guarda a ação para o JavaScript buscar. */
    static void deliverAction(String action) {
        if (instance != null) {
            JSObject data = new JSObject();
            data.put("action", action);
            instance.notifyListeners("action", data, true);
        } else {
            pendingAction = action;
        }
    }

    @PluginMethod
    public void takeLaunchAction(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("action", pendingAction);
        pendingAction = null;
        call.resolve(ret);
    }

    /** Recebe o resumo do mês já formatado pelo app e atualiza o widget. */
    @PluginMethod
    public void updateWidget(PluginCall call) {
        SharedPreferences.Editor e = getContext().getSharedPreferences(NexaWidget.PREFS, Context.MODE_PRIVATE).edit();
        JSObject data = call.getData();
        java.util.Iterator<String> keys = data.keys();
        while (keys.hasNext()) {
            String k = keys.next();
            if (k.equals("pct")) e.putInt("pct", data.optInt("pct", -1));
            else e.putString(k, data.optString(k, ""));
        }
        e.apply();
        NexaWidget.refreshAll(getContext());
        call.resolve();
    }
}
