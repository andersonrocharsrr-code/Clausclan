package io.github.andersonrocharsrr_code.baixar;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;
import org.json.JSONTokener;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Parte nativa do Salva Vídeo:
 * - pegar: abre a página do vídeo (como um navegador de computador, guardando os cookies do TikTok);
 * - baixar: baixa o arquivo do vídeo (com os mesmos cookies, senão o TikTok recusa) para a pasta temporária;
 * - gravarCache / publicar: grava o MP3 feito no app e põe o arquivo na galeria (Filmes ou Música → "Salva Vídeo");
 * - abrir: abre o vídeo/áudio no player do celular;
 * - linkCompartilhado: link que chegou pelo "Compartilhar" do TikTok.
 */
@CapacitorPlugin(
    name = "Baixador",
    permissions = { @Permission(alias = "armazenamento", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }) }
)
public class BaixadorPlugin extends Plugin {

    private static final String UA =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    private static final String PASTA = "Salva Vídeo";

    private final CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
    private final ExecutorService fila = Executors.newCachedThreadPool();
    private final Set<String> cancelados = Collections.newSetFromMap(new ConcurrentHashMap<>());
    private String linkPendente = null;

    // ---------- Link que chega pelo "Compartilhar" ----------

    @Override
    public void load() {
        linkPendente = textoDoIntent(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        String t = textoDoIntent(intent);
        if (t != null) {
            linkPendente = null;
            JSObject r = new JSObject();
            r.put("texto", t);
            notifyListeners("link", r, true);
        }
    }

    private static String textoDoIntent(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return null;
        // Aberto pela tela de apps recentes: o Android entrega de novo o link antigo do Compartilhar. Ignora.
        if ((intent.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) return null;
        CharSequence t = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
        intent.setAction(Intent.ACTION_MAIN); // não ler de novo se a tela for recriada
        return t == null ? null : t.toString();
    }

    @PluginMethod
    public void linkCompartilhado(PluginCall call) {
        JSObject r = new JSObject();
        r.put("texto", linkPendente);
        linkPendente = null;
        call.resolve(r);
    }

    // ---------- Internet ----------

    /** Abre a URL seguindo os redirecionamentos à mão, para guardar os cookies de cada passo. */
    private HttpURLConnection abrirConexao(String endereco) throws IOException {
        String atual = endereco;
        for (int i = 0; i < 10; i++) {
            URL url = new URL(atual);
            HttpURLConnection c = (HttpURLConnection) url.openConnection();
            c.setInstanceFollowRedirects(false);
            c.setConnectTimeout(20000);
            c.setReadTimeout(30000);
            c.setRequestProperty("User-Agent", UA);
            c.setRequestProperty("Accept-Language", "pt-BR,pt;q=0.9,en;q=0.8");
            c.setRequestProperty("Accept", "*/*");
            String host = url.getHost();
            if (host.endsWith("instagram.com") || host.endsWith("cdninstagram.com") || host.endsWith("fbcdn.net")) c.setRequestProperty("Referer", "https://www.instagram.com/");
            else if (!host.endsWith("tikwm.com")) c.setRequestProperty("Referer", "https://www.tiktok.com/");
            URI uri = URI.create(url.toString().replace(" ", "%20"));
            for (Map.Entry<String, List<String>> e : cookies.get(uri, new HashMap<>()).entrySet()) {
                if (!e.getValue().isEmpty()) c.setRequestProperty(e.getKey(), join(e.getValue()));
            }
            int st = c.getResponseCode();
            cookies.put(uri, c.getHeaderFields());
            if (st >= 300 && st < 400 && c.getHeaderField("Location") != null) {
                atual = new URL(url, c.getHeaderField("Location")).toString();
                c.disconnect();
                continue;
            }
            return c;
        }
        throw new IOException("Redirecionamentos demais");
    }

    private static String join(List<String> l) {
        StringBuilder sb = new StringBuilder();
        for (String s : l) { if (sb.length() > 0) sb.append("; "); sb.append(s); }
        return sb.toString();
    }

    @PluginMethod
    public void pegar(PluginCall call) {
        String url = call.getString("url");
        if (url == null) { call.reject("Sem endereço"); return; }
        fila.execute(() -> {
            HttpURLConnection c = null;
            try {
                c = abrirConexao(url);
                int st = c.getResponseCode();
                InputStream in = st >= 400 ? c.getErrorStream() : c.getInputStream();
                ByteArrayOutputStream buf = new ByteArrayOutputStream();
                if (in != null) { copiar(in, buf, null); in.close(); }
                JSObject r = new JSObject();
                r.put("status", st);
                r.put("url", c.getURL().toString());
                r.put("texto", new String(buf.toByteArray(), StandardCharsets.UTF_8));
                call.resolve(r);
            } catch (Exception e) {
                call.reject("Sem conexão: " + e.getMessage());
            } finally {
                if (c != null) c.disconnect();
            }
        });
    }

    private interface Progresso { void feito(long n); }

    private static void copiar(InputStream in, OutputStream out, Progresso p) throws IOException {
        byte[] b = new byte[64 * 1024];
        long total = 0;
        int n;
        while ((n = in.read(b)) > 0) {
            out.write(b, 0, n);
            total += n;
            if (p != null) p.feito(total);
        }
    }

    /** Baixa o primeiro endereço que funcionar da lista para a pasta temporária do app. */
    @PluginMethod
    public void baixar(PluginCall call) {
        JSArray urls = call.getArray("urls");
        String nome = call.getString("nome", "arquivo.mp4");
        String id = call.getString("id", "");
        if (urls == null || urls.length() == 0) { call.reject("Sem endereço do vídeo"); return; }
        fila.execute(() -> {
            File dest = new File(getContext().getCacheDir(), nomeSeguro(nome));
            String erro = "O TikTok não liberou o arquivo";
            List<String> lista = new ArrayList<>();
            try { lista = urls.toList(); } catch (Exception ignored) {}
            for (String u : lista) {
                if (cancelados.remove(id)) { call.reject("cancelado", "CANCELADO"); return; }
                HttpURLConnection c = null;
                try {
                    c = abrirConexao(u);
                    int st = c.getResponseCode();
                    String tipo = c.getContentType() == null ? "" : c.getContentType();
                    if (st != 200 || tipo.startsWith("text/")) { erro = "Erro " + st + " ao baixar"; continue; }
                    long total = c.getContentLengthLong();
                    final long[] ultimo = { 0 };
                    try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(dest)) {
                        copiar(in, out, n -> {
                            if (cancelados.contains(id)) throw new CanceladoException();
                            if (n - ultimo[0] >= 256 * 1024) {
                                ultimo[0] = n;
                                JSObject p = new JSObject();
                                p.put("id", id);
                                p.put("feito", n);
                                p.put("total", total);
                                notifyListeners("progresso", p);
                            }
                        });
                    }
                    if (dest.length() < 10 * 1024) { erro = "Arquivo vazio"; continue; }
                    JSObject r = new JSObject();
                    r.put("caminho", dest.getAbsolutePath());
                    r.put("tamanho", dest.length());
                    call.resolve(r);
                    return;
                } catch (CanceladoException e) {
                    cancelados.remove(id);
                    dest.delete();
                    call.reject("cancelado", "CANCELADO");
                    return;
                } catch (Exception e) {
                    erro = "Falha na conexão: " + e.getMessage();
                } finally {
                    if (c != null) c.disconnect();
                }
            }
            dest.delete();
            call.reject(erro);
        });
    }

    private static class CanceladoException extends RuntimeException {}

    @PluginMethod
    public void cancelar(PluginCall call) {
        String id = call.getString("id", "");
        cancelados.add(id);
        call.resolve();
    }

    private static String nomeSeguro(String n) {
        String s = n.replaceAll("[^\\w.\\-]+", "_");
        return s.isEmpty() ? "arquivo" : s;
    }

    /** Grava (ou acrescenta) um pedaço em base64 num arquivo da pasta temporária — usado para o MP3. */
    @PluginMethod
    public void gravarCache(PluginCall call) {
        String nome = call.getString("nome", "audio.mp3");
        String dados = call.getString("base64", "");
        boolean anexar = Boolean.TRUE.equals(call.getBoolean("anexar", false));
        fila.execute(() -> {
            File f = new File(getContext().getCacheDir(), nomeSeguro(nome));
            try (OutputStream out = new FileOutputStream(f, anexar)) {
                out.write(Base64.decode(dados, Base64.DEFAULT));
                JSObject r = new JSObject();
                r.put("caminho", f.getAbsolutePath());
                call.resolve(r);
            } catch (Exception e) {
                call.reject("Não consegui gravar: " + e.getMessage());
            }
        });
    }

    // ---------- Galeria ----------

    /** Move o arquivo da pasta temporária para a galeria: vídeo em Filmes/Salva Vídeo, MP3 em Música/Salva Vídeo. */
    @PluginMethod
    public void publicar(PluginCall call) {
        if (Build.VERSION.SDK_INT < 29 && getPermissionState("armazenamento") != PermissionState.GRANTED) {
            requestPermissionForAlias("armazenamento", call, "depoisDaPermissao");
            return;
        }
        fila.execute(() -> publicarAgora(call));
    }

    @PermissionCallback
    private void depoisDaPermissao(PluginCall call) {
        if (getPermissionState("armazenamento") == PermissionState.GRANTED) fila.execute(() -> publicarAgora(call));
        else call.reject("Sem permissão para gravar na memória do celular");
    }

    private void publicarAgora(PluginCall call) {
        String caminho = call.getString("caminho");
        String pasta = call.getString("pasta", "video");
        boolean foto = "foto".equals(pasta);
        boolean video = !foto && !"audio".equals(pasta);
        String nome = nomeSeguro(call.getString("nome", foto ? "foto.jpg" : video ? "video.mp4" : "audio.mp3"));
        String mime = call.getString("mime", foto ? "image/jpeg" : video ? "video/mp4" : "audio/mpeg");
        File origem = caminho == null ? null : new File(caminho);
        if (origem == null || !origem.exists()) { call.reject("Arquivo temporário sumiu"); return; }
        // Vídeo em Filmes, MP3 em Música e fotos em Imagens (todos na pasta "Salva Vídeo").
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
                    copiar(in, out, null);
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
                    copiar(in, out, null);
                }
                MediaScannerConnection.scanFile(getContext(), new String[] { dest.getAbsolutePath() }, new String[] { mime }, null);
                uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", dest);
            }
            origem.delete();
            JSObject r = new JSObject();
            r.put("uri", uri.toString());
            r.put("pasta", raiz + "/" + PASTA);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Não consegui salvar na galeria: " + e.getMessage());
        }
    }

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

    /** Abre o app do Instagram; sem ele, abre o site no navegador. */
    @PluginMethod
    public void abrirInstagram(PluginCall call) {
        try {
            Intent i = getContext().getPackageManager().getLaunchIntentForPackage("com.instagram.android");
            if (i == null) i = new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.instagram.com/"));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("Não consegui abrir o Instagram");
        }
    }

    /** Abre o app do TikTok (versões do Brasil e internacional); sem ele, abre o site no navegador. */
    @PluginMethod
    public void abrirTikTok(PluginCall call) {
        String[] pacotes = { "com.zhiliaoapp.musically", "com.ss.android.ugc.trill", "com.zhiliaoapp.musically.go" };
        try {
            for (String p : pacotes) {
                Intent i = getContext().getPackageManager().getLaunchIntentForPackage(p);
                if (i != null) {
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getActivity().startActivity(i);
                    call.resolve();
                    return;
                }
            }
            Intent web = new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.tiktok.com/"));
            web.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(web);
            call.resolve();
        } catch (Exception e) {
            call.reject("Não consegui abrir o TikTok");
        }
    }

    // ---------- Vídeos de um perfil ----------

    /** Lê os vídeos que aparecem na página do perfil (links, capas e visualizações) e rola para carregar mais. */
    private static final String SCRIPT_PERFIL =
        "(function(){var out=[],vistos={};" +
        "document.querySelectorAll('a[href*=\"/video/\"],a[href*=\"/photo/\"]').forEach(function(a){" +
        "var m=a.href.match(/\\/(video|photo)\\/(\\d+)/);if(!m||vistos[m[2]])return;vistos[m[2]]=1;" +
        "var img=a.querySelector('img');var v=a.querySelector('[data-e2e=\"video-views\"]');" +
        "out.push({id:m[2],url:a.href.split('?')[0],tipo:m[1],capa:img?(img.currentSrc||img.src||''):'',views:v?v.textContent:''});});" +
        "window.scrollBy(0,2500);return JSON.stringify(out);})()";

    private WebView navPerfil = null;

    /**
     * Abre a página pública do perfil num navegador escondido (atrás da tela do app), como uma pessoa abrindo
     * o perfil, e vai juntando os vídeos que aparecem. Manda "perfilItens" a cada passo e termina quando
     * chega em "max" vídeos, quando a lista para de crescer ou depois de 50 s.
     */
    @PluginMethod
    public void perfilVideos(PluginCall call) {
        String usuario = call.getString("usuario", "").replaceAll("[^\\w.\\-]", "");
        int max = call.getInt("max", 60);
        String id = call.getString("id", "");
        if (usuario.isEmpty()) { call.reject("Sem perfil"); return; }
        getActivity().runOnUiThread(() -> {
            fecharNavPerfil();
            WebView w = new WebView(getContext());
            navPerfil = w;
            WebSettings s = w.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setUserAgentString(UA);
            s.setMediaPlaybackRequiresUserGesture(true);
            s.setUseWideViewPort(true);
            s.setLoadWithOverviewMode(true);
            w.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                    // Não deixa a página abrir o app do TikTok nem outra coisa fora do navegador escondido.
                    String sc = r.getUrl().getScheme();
                    return sc == null || !(sc.equals("https") || sc.equals("http"));
                }
            });
            ViewGroup raiz = getActivity().findViewById(android.R.id.content);
            raiz.addView(w, 0, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

            Handler h = new Handler(Looper.getMainLooper());
            long inicio = System.currentTimeMillis();
            int[] ultimo = { -1 };
            int[] parado = { 0 };
            boolean[] feito = { false };
            JSArray[] ultimos = { new JSArray() };
            // Garantia: em 55 s termina de qualquer jeito (se a página travar, não fica carregando para sempre).
            h.postDelayed(() -> {
                if (feito[0]) return;
                feito[0] = true;
                if (navPerfil == w) fecharNavPerfil();
                JSObject r = new JSObject();
                r.put("itens", ultimos[0]);
                call.resolve(r);
            }, 55000);
            Runnable passo = new Runnable() {
                @Override
                public void run() {
                    if (feito[0]) return;
                    if (navPerfil != w) { feito[0] = true; call.reject("cancelado", "CANCELADO"); return; }
                    w.evaluateJavascript(SCRIPT_PERFIL, valor -> {
                        if (feito[0]) return;
                        JSArray itens = new JSArray();
                        try {
                            Object t = new JSONTokener(valor).nextValue();
                            if (t instanceof String) itens = new JSArray(new JSONArray((String) t).toString());
                        } catch (Exception ignored) {}
                        int n = itens.length();
                        ultimos[0] = itens;
                        if (n == ultimo[0]) parado[0]++; else parado[0] = 0;
                        ultimo[0] = n;
                        JSObject p = new JSObject();
                        p.put("id", id);
                        p.put("itens", itens);
                        notifyListeners("perfilItens", p);
                        long passou = System.currentTimeMillis() - inicio;
                        boolean fim = n >= max || (n > 0 && parado[0] >= 4) || (n == 0 && parado[0] >= 14) || passou > 50000;
                        if (fim) {
                            feito[0] = true;
                            fecharNavPerfil();
                            JSObject r = new JSObject();
                            r.put("itens", itens);
                            call.resolve(r);
                        } else {
                            h.postDelayed(this, 1500);
                        }
                    });
                }
            };
            w.loadUrl("https://www.tiktok.com/@" + usuario);
            h.postDelayed(passo, 4000);
        });
    }

    // ---------- Página aberta num navegador de verdade (Instagram) ----------

    private static final String UA_CELULAR =
        "Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
    private WebView navPagina = null;

    /**
     * Abre a página num navegador escondido (atrás da tela do app), como uma pessoa abrindo o link, e devolve o
     * HTML depois de carregar. O Instagram só entrega o post pronto para um navegador de verdade.
     * Termina em no máximo "limite" ms (padrão 25 s).
     */
    @PluginMethod
    public void paginaNavegador(PluginCall call) {
        String url = call.getString("url");
        int espera = call.getInt("espera", 2500);
        int limite = call.getInt("limite", 25000);
        if (url == null || !url.startsWith("https://")) { call.reject("Endereço inválido"); return; }
        getActivity().runOnUiThread(() -> {
            fecharNavPagina();
            WebView w = new WebView(getContext());
            navPagina = w;
            WebSettings s = w.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setUserAgentString(UA_CELULAR);
            s.setMediaPlaybackRequiresUserGesture(true);
            Handler h = new Handler(Looper.getMainLooper());
            boolean[] feito = { false };
            Runnable ler = () -> {
                if (feito[0] || navPagina != w) return;
                w.evaluateJavascript("document.documentElement.outerHTML", valor -> {
                    if (feito[0]) return;
                    feito[0] = true;
                    String html = "";
                    try {
                        Object t = new JSONTokener(valor).nextValue();
                        if (t instanceof String) html = (String) t;
                    } catch (Exception ignored) {}
                    JSObject r = new JSObject();
                    r.put("url", w.getUrl());
                    r.put("texto", html);
                    fecharNavPagina();
                    call.resolve(r);
                });
            };
            w.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                    String sc = r.getUrl().getScheme();
                    return sc == null || !(sc.equals("https") || sc.equals("http"));
                }

                @Override
                public void onPageFinished(WebView v, String u) {
                    h.postDelayed(ler, espera);
                }
            });
            ViewGroup raiz = getActivity().findViewById(android.R.id.content);
            raiz.addView(w, 0, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            h.postDelayed(() -> {
                if (feito[0]) return;
                ler.run();
                // Se nem a leitura responder, desiste.
                h.postDelayed(() -> {
                    if (feito[0]) return;
                    feito[0] = true;
                    fecharNavPagina();
                    call.reject("A página demorou demais");
                }, 3000);
            }, limite);
            w.loadUrl(url);
        });
    }

    private void fecharNavPagina() {
        WebView w = navPagina;
        navPagina = null;
        if (w == null) return;
        try {
            ViewGroup pai = (ViewGroup) w.getParent();
            if (pai != null) pai.removeView(w);
            w.stopLoading();
            w.destroy();
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void pararPerfil(PluginCall call) {
        getActivity().runOnUiThread(() -> { fecharNavPerfil(); call.resolve(); });
    }

    private void fecharNavPerfil() {
        WebView w = navPerfil;
        navPerfil = null;
        if (w == null) return;
        try {
            ViewGroup pai = (ViewGroup) w.getParent();
            if (pai != null) pai.removeView(w);
            w.stopLoading();
            w.destroy();
        } catch (Exception ignored) {}
    }

    /** Apaga o que sobrou na pasta temporária (downloads interrompidos). */
    @PluginMethod
    public void limparCache(PluginCall call) {
        fila.execute(() -> {
            File[] fs = getContext().getCacheDir().listFiles();
            if (fs != null) for (File f : fs) {
                String n = f.getName();
                if (f.isFile() && (n.endsWith(".mp4") || n.endsWith(".mp3") || n.endsWith(".m4a"))) f.delete();
            }
            call.resolve();
        });
    }
}
