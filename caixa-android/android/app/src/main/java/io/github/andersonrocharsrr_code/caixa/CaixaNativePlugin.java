package io.github.andersonrocharsrr_code.caixa;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/** Recursos do Android que o app web não tem: salvar a folha do caixa (PNG) na galeria, na pasta "Caixa". */
@CapacitorPlugin(
    name = "CaixaNative",
    permissions = { @Permission(alias = "galeria", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }) }
)
public class CaixaNativePlugin extends Plugin {

    @PluginMethod
    public void salvarNaGaleria(PluginCall call) {
        // Android 10+ salva pelo MediaStore sem pedir permissão; antes disso precisa da permissão de armazenamento.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q && getPermissionState("galeria") != PermissionState.GRANTED) {
            requestPermissionForAlias("galeria", call, "depoisDaPermissao");
            return;
        }
        salvar(call);
    }

    @PermissionCallback
    private void depoisDaPermissao(PluginCall call) {
        if (getPermissionState("galeria") == PermissionState.GRANTED) salvar(call);
        else call.reject("Sem permissão para salvar na galeria.");
    }

    private void salvar(PluginCall call) {
        String data = call.getString("data");
        String nome = call.getString("nome", "caixa.png");
        if (data == null || data.isEmpty()) {
            call.reject("Imagem vazia.");
            return;
        }
        byte[] bytes = Base64.decode(data, Base64.DEFAULT);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentResolver cr = getContext().getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.Images.Media.DISPLAY_NAME, nome);
                v.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                v.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Caixa");
                v.put(MediaStore.Images.Media.IS_PENDING, 1);
                Uri uri = cr.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v);
                if (uri == null) throw new Exception("Não deu para criar o arquivo na galeria.");
                try (OutputStream out = cr.openOutputStream(uri)) {
                    if (out == null) throw new Exception("Não deu para gravar na galeria.");
                    out.write(bytes);
                }
                v.clear();
                v.put(MediaStore.Images.Media.IS_PENDING, 0);
                cr.update(uri, v, null, null);
            } else {
                File pasta = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "Caixa");
                if (!pasta.exists() && !pasta.mkdirs()) throw new Exception("Não deu para criar a pasta Caixa.");
                File arq = new File(pasta, nome);
                try (FileOutputStream out = new FileOutputStream(arq)) {
                    out.write(bytes);
                }
                MediaScannerConnection.scanFile(getContext(), new String[] { arq.getAbsolutePath() }, new String[] { "image/png" }, null);
            }
            JSObject ret = new JSObject();
            ret.put("pasta", "Imagens/Caixa");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(e.getMessage() != null ? e.getMessage() : "Erro ao salvar na galeria.", e);
        }
    }
}
