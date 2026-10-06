package io.github.andersonrocharsrr_code.nexamoney;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Widget da tela inicial: quanto já foi gasto no mês e um botão "+" para lançar um gasto direto.
 * Os números chegam prontos do app (NexaNativePlugin.updateWidget) e ficam guardados em SharedPreferences.
 */
public class NexaWidget extends AppWidgetProvider {

    static final String PREFS = "nexa_widget";

    static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, NexaWidget.class));
        if (ids != null && ids.length > 0) update(ctx, mgr, ids);
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        update(ctx, mgr, ids);
    }

    private static void update(Context ctx, AppWidgetManager mgr, int[] ids) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String month = p.getString("month", "");
        String now = new SimpleDateFormat("yyyy-MM", Locale.US).format(new Date());
        boolean fresh = now.equals(month);

        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_nexa);
        if (fresh) {
            v.setTextViewText(R.id.w_label, p.getString("label", "Gasto no mês"));
            v.setTextViewText(R.id.w_amount, p.getString("amount", ""));
            v.setTextViewText(R.id.w_sub, p.getString("sub", ""));
            int pct = p.getInt("pct", -1);
            if (pct >= 0) {
                v.setViewVisibility(R.id.w_bar, View.VISIBLE);
                v.setProgressBar(R.id.w_bar, 100, Math.min(pct, 100), false);
            } else {
                v.setViewVisibility(R.id.w_bar, View.GONE);
            }
        } else {
            v.setTextViewText(R.id.w_label, "Gasto no mês");
            v.setTextViewText(R.id.w_amount, "—");
            v.setTextViewText(R.id.w_sub, "Abra o app para atualizar");
            v.setViewVisibility(R.id.w_bar, View.GONE);
        }

        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        Intent open = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        v.setOnClickPendingIntent(R.id.w_root, PendingIntent.getActivity(ctx, 100, open, flags));

        Intent add = new Intent(ctx, MainActivity.class)
            .setAction("nexa.NOVO")
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            .putExtra(NexaNativePlugin.EXTRA_ACTION, "novo");
        v.setOnClickPendingIntent(R.id.w_add, PendingIntent.getActivity(ctx, 101, add, flags));

        mgr.updateAppWidget(ids, v);
    }
}
