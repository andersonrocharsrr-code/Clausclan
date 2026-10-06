package io.github.andersonrocharsrr_code.nexamoney;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Ponte entre o app (JavaScript) e as partes nativas do Nexa Money:
 * widget da tela inicial, ações vindas do widget/notificações e o leitor de notificações do banco.
 */
@CapacitorPlugin(name = "NexaNative")
public class NexaNativePlugin extends Plugin {

    static final String EXTRA_ACTION = "nexa_action";
    private static NexaNativePlugin instance;
    private static String pendingAction;

    @Override
    public void load() {
        instance = this;
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
        e.putString("month", call.getString("month", ""));
        e.putString("label", call.getString("label", ""));
        e.putString("amount", call.getString("amount", ""));
        e.putString("sub", call.getString("sub", ""));
        Integer pct = call.getInt("pct", -1);
        e.putInt("pct", pct == null ? -1 : pct);
        e.apply();
        NexaWidget.refreshAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void bankStatus(PluginCall call) {
        boolean on = NotificationManagerCompat.getEnabledListenerPackages(getContext()).contains(getContext().getPackageName());
        JSObject ret = new JSObject();
        ret.put("enabled", on);
        call.resolve(ret);
    }

    @PluginMethod
    public void openBankSettings(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    @PluginMethod
    public void getSuggestions(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("items", BankListener.load(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void removeSuggestion(PluginCall call) {
        BankListener.remove(getContext(), call.getString("id", ""));
        call.resolve();
    }

    @PluginMethod
    public void clearSuggestions(PluginCall call) {
        BankListener.clear(getContext());
        call.resolve();
    }
}
