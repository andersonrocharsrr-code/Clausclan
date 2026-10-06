package io.github.andersonrocharsrr_code.nexamoney;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationCompat;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Lê as notificações dos apps de banco (só os da lista abaixo, com permissão do usuário)
 * e, quando aparece um valor em R$, guarda uma sugestão de lançamento e avisa com uma notificação.
 * Nada sai do celular: as sugestões ficam no aparelho até o app lançar ou ignorar.
 */
public class BankListener extends NotificationListenerService {

    private static final String PREFS = "nexa_bank";
    private static final String CHANNEL = "banco";
    private static final int MAX = 30;
    private static final Pattern AMOUNT = Pattern.compile("R\\$\\s*(\\d{1,3}(?:\\.\\d{3})*|\\d+),(\\d{2})");
    private static final Map<String, String> BANKS = new HashMap<>();

    static {
        BANKS.put("com.nu.production", "Nubank");
        BANKS.put("com.itau", "Itaú");
        BANKS.put("com.itau.iti", "iti");
        BANKS.put("com.bradesco", "Bradesco");
        BANKS.put("br.com.bradesco.next", "Next");
        BANKS.put("br.com.bb.android", "Banco do Brasil");
        BANKS.put("br.com.gabba.Caixa", "Caixa");
        BANKS.put("br.gov.caixa.tem", "Caixa Tem");
        BANKS.put("com.santander.app", "Santander");
        BANKS.put("br.com.intermedium", "Inter");
        BANKS.put("com.c6bank.app", "C6 Bank");
        BANKS.put("com.picpay", "PicPay");
        BANKS.put("com.mercadopago.wallet", "Mercado Pago");
        BANKS.put("br.com.uol.ps.myaccount", "PagBank");
        BANKS.put("br.com.neon", "Neon");
        BANKS.put("br.com.sicoobnet", "Sicoob");
        BANKS.put("br.com.sicredi.app.mobile", "Sicredi");
        BANKS.put("br.com.original.bank", "Original");
        BANKS.put("com.btg.pactual.banking", "BTG");
        BANKS.put("com.google.android.apps.walletnfcrel", "Google Wallet");
        BANKS.put("com.samsung.android.spay", "Samsung Wallet");
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            String pkg = sbn.getPackageName();
            String bank = BANKS.get(pkg);
            if (bank == null) return;
            Notification n = sbn.getNotification();
            if ((n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
            Bundle x = n.extras;
            String title = str(x.getCharSequence(Notification.EXTRA_TITLE));
            String text = str(x.getCharSequence(Notification.EXTRA_BIG_TEXT));
            if (text.isEmpty()) text = str(x.getCharSequence(Notification.EXTRA_TEXT));
            Matcher m = AMOUNT.matcher(title + " " + text);
            if (!m.find()) return;
            long cents = Long.parseLong(m.group(1).replace(".", "")) * 100 + Long.parseLong(m.group(2));
            if (cents <= 0) return;
            add(this, pkg, bank, title, text, cents, sbn.getPostTime());
        } catch (Exception ignored) {
            // Notificação num formato inesperado: só ignora.
        }
    }

    private static String str(CharSequence c) {
        return c == null ? "" : c.toString().trim();
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static synchronized JSONArray load(Context ctx) {
        try {
            return new JSONArray(prefs(ctx).getString("items", "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    private static void store(Context ctx, JSONArray items) {
        prefs(ctx).edit().putString("items", items.toString()).apply();
    }

    private static synchronized void add(Context ctx, String pkg, String bank, String title, String text, long cents, long time) throws Exception {
        JSONArray items = load(ctx);
        // O mesmo aviso costuma chegar repetido (atualizações da mesma notificação): ignora o repetido.
        for (int i = 0; i < items.length(); i++) {
            JSONObject o = items.getJSONObject(i);
            if (o.optLong("amount") == cents && o.optString("pkg").equals(pkg)
                && o.optString("text").equals(text) && Math.abs(o.optLong("time") - time) < 10 * 60 * 1000) return;
        }
        String id = Long.toString(time, 36) + Long.toString(cents, 36);
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("pkg", pkg);
        o.put("app", bank);
        o.put("title", title);
        o.put("text", text);
        o.put("time", time);
        o.put("amount", cents);
        JSONArray out = new JSONArray();
        out.put(o);
        for (int i = 0; i < items.length() && out.length() < MAX; i++) out.put(items.get(i));
        store(ctx, out);
        notifySuggestion(ctx, id, bank, cents, out.length());
    }

    static synchronized void remove(Context ctx, String id) {
        JSONArray items = load(ctx);
        JSONArray out = new JSONArray();
        for (int i = 0; i < items.length(); i++) {
            JSONObject o = items.optJSONObject(i);
            if (o != null && !o.optString("id").equals(id)) out.put(o);
        }
        store(ctx, out);
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(id, 7001);
    }

    static synchronized void clear(Context ctx) {
        JSONArray items = load(ctx);
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        for (int i = 0; nm != null && i < items.length(); i++) {
            JSONObject o = items.optJSONObject(i);
            if (o != null) nm.cancel(o.optString("id"), 7001);
        }
        store(ctx, new JSONArray());
    }

    private static void notifySuggestion(Context ctx, String id, String bank, long cents, int count) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Sugestões do banco", NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription("Avisa quando uma compra do banco pode ser lançada no Nexa Money");
            nm.createNotificationChannel(ch);
        }
        String value = String.format(new java.util.Locale("pt", "BR"), "R$ %,.2f", cents / 100.0);
        Intent open = new Intent(ctx, MainActivity.class)
            .setAction("nexa.SUGESTAO")
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            .putExtra(NexaNativePlugin.EXTRA_ACTION, "sugestao");
        PendingIntent pi = PendingIntent.getActivity(ctx, 102, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new NotificationCompat.Builder(ctx, CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_nexa)
            .setColor(0xFF6D5DFC)
            .setContentTitle("Lançar " + value + "?")
            .setContentText(count > 1 ? bank + " · toque para revisar (" + count + " pendentes)" : bank + " · toque para lançar no Nexa Money")
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .build();
        nm.notify(id, 7001, n);
    }
}
