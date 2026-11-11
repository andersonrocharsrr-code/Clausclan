package io.github.andersonrocharsrr_code.caixa;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.util.Calendar;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(CaixaNativePlugin.class);
        super.onCreate(savedInstanceState);
    }

    // A troca do ícone é feita quando o vendedor sai do app (e não com ele aberto, para não fechar a tela).
    @Override
    protected void onStop() {
        super.onStop();
        trocarIcone();
    }

    /** De novembro até 6 de janeiro o ícone da tela do celular ganha o gorro de Papai Noel; no resto do ano, o normal. */
    private void trocarIcone() {
        try {
            Calendar c = Calendar.getInstance();
            int mes = c.get(Calendar.MONTH), dia = c.get(Calendar.DAY_OF_MONTH);
            boolean natal = mes >= Calendar.NOVEMBER || (mes == Calendar.JANUARY && dia <= 6);
            PackageManager pm = getPackageManager();
            ComponentName normal = new ComponentName(this, getPackageName() + ".IconeNormal");
            ComponentName comGorro = new ComponentName(this, getPackageName() + ".IconeNatal");
            ligar(pm, natal ? comGorro : normal, true);
            ligar(pm, natal ? normal : comGorro, false);
        } catch (Exception ignored) {
            // Se o celular não deixar trocar, fica o ícone que está.
        }
    }

    private void ligar(PackageManager pm, ComponentName nome, boolean ligado) {
        int agora = pm.getComponentEnabledSetting(nome);
        // "Padrão" = como está no AndroidManifest: o normal vem ligado e o de Natal desligado.
        boolean estaLigado = agora == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT
            ? !nome.getClassName().endsWith(".IconeNatal")
            : agora == PackageManager.COMPONENT_ENABLED_STATE_ENABLED;
        if (estaLigado == ligado) return; // já está certo: não mexe (cada troca faz o celular redesenhar o ícone)
        int quer = ligado ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
        pm.setComponentEnabledSetting(nome, quer, PackageManager.DONT_KILL_APP);
    }
}
