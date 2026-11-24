package io.github.andersonrocharsrr_code.editor;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.WindowManager;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Parte nativa do Editor de Vídeo: o vídeo é montado no app (tela web) e chega aqui em pedaços,
 * cada um com a posição no arquivo (o MP4 volta no começo para escrever o tamanho no fim).
 * Ao concluir, o arquivo vai para a galeria: vídeo em Filmes, áudio em Música e foto em Imagens,
 * sempre na pasta "Editor de Vídeo".
 */
@CapacitorPlugin(
    name = "Galeria",
    permissions = {
        @Permission(alias = "armazenamento", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE })
    }
)
public class GaleriaPlugin extends Plugin {

    private static final String PASTA = "Editor de Vídeo";
    /** Uma fila só: os pedaços são gravados na ordem em que chegam. */
    private final ExecutorService fila = Executors.newSingleThreadExecutor();
    private final Map<String, RandomAccessFile> abertos = new HashMap<>();
    private final Map<String, File> arquivos = new HashMap<>();

    private static String nomeSeguro(String n) {
        String s = n.replaceAll("[^\\w.\\- ]+", "_").trim();
        return s.isEmpty() ? "arquivo" : s;
    }

    /** Começa um arquivo novo na pasta temporária. Devolve o id usado nos próximos passos. */
    @PluginMethod
    public void criar(PluginCall call) {
        fila.execute(() -> {
            try {
                File pasta = new File(getContext().getCacheDir(), "saida");
                if (!pasta.exists() && !pasta.mkdirs()) throw new IOException("sem pasta temporária");
                String id = UUID.randomUUID().toString();
                File f = new File(pasta, id + ".tmp");
                abertos.put(id, new RandomAccessFile(f, "rw"));
                arquivos.put(id, f);
                JSObject r = new JSObject();
                r.put("id", id);
                call.resolve(r);
            } catch (Exception e) {
                call.reject("Não consegui começar o arquivo: " + e.getMessage());
            }
        });
    }

    /** Grava um pedaço (base64) na posição indicada. */
    @PluginMethod
    public void escrever(PluginCall call) {
        String id = call.getString("id", "");
        String dados = call.getString("dados", "");
        Double pos = call.getDouble("pos", 0.0);
        fila.execute(() -> {
            RandomAccessFile raf = abertos.get(id);
            if (raf == null) { call.reject("Arquivo não está aberto"); return; }
            try {
                raf.seek(pos.longValue());
                raf.write(Base64.decode(dados, Base64.DEFAULT));
                call.resolve();
            } catch (Exception e) {
                call.reject("Não consegui gravar (memória cheia?): " + e.getMessage());
            }
        });
    }

    /** Desiste do arquivo (cancelado ou deu erro). */
    @PluginMethod
    public void descartar(PluginCall call) {
        String id = call.getString("id", "");
        fila.execute(() -> {
            fechar(id);
            File f = arquivos.remove(id);
            if (f != null) f.delete();
            call.resolve();
        });
    }

    private void fechar(String id) {
        RandomAccessFile raf = abertos.remove(id);
        if (raf != null) try { raf.close(); } catch (IOException ignored) {}
    }

    /** Termina o arquivo e coloca na galeria. */
    @PluginMethod
    public void concluir(PluginCall call) {
        if (Build.VERSION.SDK_INT < 29 && getPermissionState("armazenamento") != PermissionState.GRANTED) {
            requestPermissionForAlias("armazenamento", call, "depoisDaPermissao");
            return;
        }
        fila.execute(() -> concluirAgora(call));
    }

    @PermissionCallback
    private void depoisDaPermissao(PluginCall call) {
        if (getPermissionState("armazenamento") == PermissionState.GRANTED) fila.execute(() -> concluirAgora(call));
        else call.reject("Sem permissão para gravar na memória do celular");
    }

    private void concluirAgora(PluginCall call) {
        String id = call.getString("id", "");
        String tipo = call.getString("tipo", "video");
        boolean foto = "foto".equals(tipo);
        boolean video = "video".equals(tipo);
        String nome = nomeSeguro(call.getString("nome", foto ? "foto.jpg" : video ? "video.mp4" : "audio.mp3"));
        String mime = call.getString("mime", foto ? "image/jpeg" : video ? "video/mp4" : "audio/mpeg");
        fechar(id);
        File origem = arquivos.remove(id);
        if (origem == null || !origem.exists()) { call.reject("Arquivo temporário sumiu"); return; }
        String raiz = foto ? Environment.DIRECTORY_PICTURES : video ? Environment.DIRECTORY_MOVIES : Environment.DIRECTORY_MUSIC;
        try {
            Uri uri;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentResolver cr = getContext().getContentResolver();
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.MediaColumns.DISPLAY_NAME, nome);
                cv.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                cv.put(MediaStore.MediaColumns.RELATIVE_PATH, raiz + "/" + PASTA);
                cv.put(MediaStore.MediaColumns.IS_PENDING, 1);
                Uri colecao = foto
                    ? MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                    : video
                    ? MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                    : MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                uri = cr.insert(colecao, cv);
                if (uri == null) throw new IOException("A galeria recusou o arquivo");
                try (InputStream in = new FileInputStream(origem); OutputStream out = cr.openOutputStream(uri)) {
                    if (out == null) throw new IOException("A galeria recusou o arquivo");
                    copiar(in, out);
                } catch (IOException e) {
                    cr.delete(uri, null, null);
                    throw e;
                }
                ContentValues pronto = new ContentValues();
                pronto.put(MediaStore.MediaColumns.IS_PENDING, 0);
                cr.update(uri, pronto, null, null);
            } else {
                File pasta = new File(Environment.getExternalStoragePublicDirectory(raiz), PASTA);
                if (!pasta.exists() && !pasta.mkdirs()) throw new IOException("Não consegui criar a pasta");
                File dest = new File(pasta, nome);
                int n = 1;
                String base = nome.replaceAll("\\.[^.]+$", ""), ext = nome.substring(base.length());
                while (dest.exists()) dest = new File(pasta, base + " (" + (n++) + ")" + ext);
                try (InputStream in = new FileInputStream(origem); OutputStream out = new FileOutputStream(dest)) {
                    copiar(in, out);
                }
                MediaScannerConnection.scanFile(getContext(), new String[] { dest.getAbsolutePath() }, new String[] { mime }, null);
                uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", dest);
            }
            JSObject r = new JSObject();
            r.put("uri", uri.toString());
            r.put("pasta", raiz + "/" + PASTA);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Não consegui salvar na galeria: " + e.getMessage());
        } finally {
            origem.delete();
        }
    }

    private static void copiar(InputStream in, OutputStream out) throws IOException {
        byte[] buf = new byte[1 << 16];
        int n;
        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
    }

    /** Abre o arquivo salvo no app de vídeo/música/fotos do celular. */
    @PluginMethod
    public void abrir(PluginCall call) {
        String uri = call.getString("uri");
        String mime = call.getString("mime", "video/mp4");
        try {
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(Uri.parse(uri), mime);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("Nenhum app para abrir este arquivo");
        }
    }

    /** Compartilhar (WhatsApp, Instagram…). */
    @PluginMethod
    public void compartilhar(PluginCall call) {
        String uri = call.getString("uri");
        String mime = call.getString("mime", "video/mp4");
        try {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(mime);
            i.putExtra(Intent.EXTRA_STREAM, Uri.parse(uri));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent escolha = Intent.createChooser(i, "Compartilhar");
            escolha.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(escolha);
            call.resolve();
        } catch (Exception e) {
            call.reject("Não consegui compartilhar");
        }
    }

    /** Mantém a tela acesa enquanto o vídeo é salvo (senão o Android pausa o app). */
    @PluginMethod
    public void telaAcesa(PluginCall call) {
        boolean ligar = Boolean.TRUE.equals(call.getBoolean("ligar", true));
        getActivity().runOnUiThread(() -> {
            if (ligar) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            call.resolve();
        });
    }

    /** Apaga sobras de arquivos temporários de vezes anteriores. */
    @PluginMethod
    public void limparTemporarios(PluginCall call) {
        fila.execute(() -> {
            File pasta = new File(getContext().getCacheDir(), "saida");
            File[] lista = pasta.listFiles();
            if (lista != null) for (File f : lista) if (!arquivos.containsValue(f)) f.delete();
            call.resolve();
        });
    }
}
