package io.github.andersonrocharsrr_code.nexamoney;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.util.SizeF;
import android.view.View;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Widget da tela inicial (estilo "vidro escuro"): quanto já foi gasto no mês e um botão "+" para lançar um gasto.
 * Muda de layout conforme o tamanho: grande (4×2), médio (4×1), pequeno (2×2) e mini (1×1).
 * Os números chegam prontos do app (NexaNativePlugin.updateWidget) e ficam guardados em SharedPreferences.
 */
public class NexaWidget extends AppWidgetProvider {

    static final String PREFS = "nexa_widget";

    private enum Size { XS, SM, MD, LG }

    static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, NexaWidget.class));
        if (ids != null) for (int id : ids) update(ctx, mgr, id);
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) update(ctx, mgr, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr, int id, Bundle options) {
        update(ctx, mgr, id);
    }

    private static void update(Context ctx, AppWidgetManager mgr, int id) {
        if (Build.VERSION.SDK_INT >= 31) {
            // Android 12+: o próprio sistema escolhe o layout certo a cada tamanho, sem atraso.
            Map<SizeF, RemoteViews> map = new HashMap<>();
            map.put(new SizeF(40f, 40f), build(ctx, Size.XS));
            map.put(new SizeF(120f, 100f), build(ctx, Size.SM));
            map.put(new SizeF(200f, 40f), build(ctx, Size.MD));
            map.put(new SizeF(220f, 100f), build(ctx, Size.LG));
            mgr.updateAppWidget(id, new RemoteViews(map));
        } else {
            Bundle o = mgr.getAppWidgetOptions(id);
            int w = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250);
            int h = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 110);
            Size s = w >= 220 ? (h >= 100 ? Size.LG : Size.MD) : w >= 120 && h >= 100 ? Size.SM : Size.XS;
            mgr.updateAppWidget(id, build(ctx, s));
        }
    }

    private static RemoteViews build(Context ctx, Size size) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String now = new SimpleDateFormat("yyyy-MM", Locale.US).format(new Date());
        boolean fresh = now.equals(p.getString("month", ""));
        String monthName = fresh ? p.getString("monthName", "") : "";
        String amount = fresh ? p.getString("amount", "") : "—";
        String shortAmount = fresh ? p.getString("short", amount) : "—";
        int pct = fresh ? p.getInt("pct", -1) : -1;
        String pctText = pct >= 0 ? pct + "%" : "";

        int layout = size == Size.LG ? R.layout.widget_lg : size == Size.MD ? R.layout.widget_md : size == Size.SM ? R.layout.widget_sm : R.layout.widget_xs;
        RemoteViews v = new RemoteViews(ctx.getPackageName(), layout);

        switch (size) {
            case LG: {
                v.setTextViewText(R.id.w_month, monthName);
                v.setTextViewText(R.id.w_amount, amount);
                bar(v, pct);
                String lead = fresh ? p.getString("lead", "") : "Abra o app para atualizar";
                String val = fresh ? p.getString("val", "") : "";
                String tone = p.getString("tone", "");
                v.setTextViewText(R.id.w_lead, lead.isEmpty() ? "Toque no + para lançar" : lead);
                v.setViewVisibility(R.id.w_val, val.isEmpty() ? View.GONE : View.VISIBLE);
                v.setTextViewText(R.id.w_val, val);
                v.setTextColor(R.id.w_val, "bad".equals(tone) ? 0xFFFCA5A5 : 0xFF5EEAD4);
                v.setTextViewText(R.id.w_tail, pct >= 0 ? " · " + pctText : "");
                break;
            }
            case MD:
                v.setTextViewText(R.id.w_label, fresh && !monthName.isEmpty() ? "Gasto em " + monthName : "Gasto no mês");
                v.setTextViewText(R.id.w_amount, amount);
                v.setViewVisibility(R.id.w_pct, pct >= 0 ? View.VISIBLE : View.GONE);
                v.setTextViewText(R.id.w_pct, pctText);
                break;
            case SM:
                v.setTextViewText(R.id.w_month, monthName.isEmpty() ? "Nexa Money" : cap(monthName));
                v.setTextViewText(R.id.w_amount, shortAmount);
                bar(v, pct);
                v.setTextViewText(R.id.w_pct, !fresh ? "Abra o app" : pct >= 0 ? pctText + " do orçamento" : "");
                break;
            default:
                v.setTextViewText(R.id.w_month, monthName.isEmpty() ? "Nexa" : cap(monthName));
                v.setTextViewText(R.id.w_amount, shortAmount);
        }

        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        Intent open = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        v.setOnClickPendingIntent(R.id.w_root, PendingIntent.getActivity(ctx, 100, open, flags));
        Intent add = new Intent(ctx, MainActivity.class)
            .setAction("nexa.NOVO")
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            .putExtra(NexaNativePlugin.EXTRA_ACTION, "novo");
        v.setOnClickPendingIntent(R.id.w_add, PendingIntent.getActivity(ctx, 101, add, flags));
        return v;
    }

    private static void bar(RemoteViews v, int pct) {
        v.setViewVisibility(R.id.w_bar, pct >= 0 ? View.VISIBLE : View.GONE);
        if (pct >= 0) v.setProgressBar(R.id.w_bar, 100, Math.min(pct, 100), false);
    }

    private static String cap(String s) {
        return s.isEmpty() ? s : s.substring(0, 1).toUpperCase(new Locale("pt", "BR")) + s.substring(1);
    }
}
