// Painel do dono: lista os celulares e marca os pagamentos (+7 / +15 / +30 dias). Abre em /painel.
export const PAINEL_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<title>Caixa · Licenças</title>
<style>
:root{--bg:#eef2f8;--card:#fff;--ink:#0f1b33;--muted:#64708a;--line:#e2e8f2;--accent:#2563eb;--ok:#16a34a;--warn:#d97706;--bad:#dc2626}
@media (prefers-color-scheme:dark){:root{--bg:#0b1220;--card:#131c2e;--ink:#e8eefb;--muted:#93a0bb;--line:#22304a;--accent:#5b8cff}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
header{background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;padding:18px 16px}
header h1{margin:0;font-size:20px} header p{margin:4px 0 0;opacity:.85;font-size:13px}
main{max-width:640px;margin:0 auto;padding:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:12px}
input{width:100%;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit}
button{font:inherit;font-weight:600;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);padding:10px 14px;cursor:pointer}
button.pri{background:var(--accent);border-color:var(--accent);color:#fff}
button.perigo{color:var(--bad)}
.linha{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.cod{font-family:ui-monospace,monospace;font-weight:700;letter-spacing:.06em}
.st{display:inline-block;padding:3px 10px;border-radius:999px;font-size:13px;font-weight:700}
.st.ok{background:rgba(22,163,74,.14);color:var(--ok)} .st.warn{background:rgba(217,119,6,.14);color:var(--warn)} .st.bad{background:rgba(220,38,38,.14);color:var(--bad)}
.muted{color:var(--muted);font-size:13px}
.nome{font-size:17px;font-weight:700}
.vazio{text-align:center;color:var(--muted);padding:24px}
#msg{position:fixed;left:16px;right:16px;bottom:16px;max-width:600px;margin:0 auto;background:#111827;color:#fff;padding:12px 14px;border-radius:12px;display:none}
[hidden]{display:none!important}
</style>
</head>
<body>
<header><h1>🔐 Caixa · Licenças</h1><p>Marque aqui os pagamentos. O celular do vendedor libera sozinho quando tiver internet.</p></header>
<main>
  <section class="card" id="entrar">
    <p><b>Senha do painel</b></p>
    <div class="linha"><input id="senha" type="password" autocomplete="current-password" placeholder="CAIXA_ADMIN_SENHA"><button class="pri" id="btnEntrar">Entrar</button></div>
  </section>
  <section id="area" hidden>
    <div class="card">
      <p style="margin-top:0"><b>Adicionar celular pelo código</b> <span class="muted">(o vendedor vê o código no app)</span></p>
      <div class="linha"><input id="novoCod" placeholder="ex.: 7F3K-92QD" autocapitalize="characters" style="flex:1;min-width:140px"><input id="novoNome" placeholder="Nome do vendedor" style="flex:1;min-width:140px"><button class="pri" id="btnAdd">Adicionar</button></div>
    </div>
    <div class="linha" style="justify-content:space-between;margin:6px 2px 10px"><b id="qtd"></b><button id="btnAtualizar">↻ Atualizar</button></div>
    <div id="lista"></div>
  </section>
</main>
<div id="msg"></div>
<script>
const $ = (s) => document.querySelector(s);
let senha = '';
try { senha = localStorage.getItem('caixa.painel') || ''; } catch (e) {}
const dia = 86400000;
const data = (t) => new Date(t).toLocaleDateString('pt-BR');
const quando = (t) => { if (!t) return 'nunca'; const m = Math.round((Date.now() - t) / 60000); if (m < 2) return 'agora'; if (m < 60) return 'há ' + m + ' min'; const h = Math.round(m / 60); if (h < 24) return 'há ' + h + ' h'; return 'há ' + Math.round(h / 24) + ' dia(s)'; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function aviso(t) { const m = $('#msg'); m.textContent = t; m.style.display = 'block'; clearTimeout(aviso.t); aviso.t = setTimeout(() => { m.style.display = 'none'; }, 2600); }
async function api(rota, corpo) {
  const r = await fetch('/admin/' + rota, { method: corpo ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + senha, 'Content-Type': 'application/json' }, body: corpo ? JSON.stringify(corpo) : undefined });
  if (r.status === 401) { sair(); throw new Error('Senha errada.'); }
  const j = await r.json();
  if (!r.ok) throw new Error(j.erro || 'Falhou.');
  return j;
}
function sair() { senha = ''; try { localStorage.removeItem('caixa.painel'); } catch (e) {} $('#entrar').hidden = false; $('#area').hidden = true; }
function status(it, agora) {
  if (it.bloqueado) return '<span class="st bad">Bloqueado</span>';
  if (!it.ate || it.ate < agora) return '<span class="st bad">Vencido' + (it.ate ? ' desde ' + data(it.ate) : '') + '</span>';
  const resta = Math.ceil((it.ate - agora) / dia);
  return '<span class="st ' + (resta <= 3 ? 'warn' : 'ok') + '">Pago até ' + data(it.ate) + ' · ' + resta + ' dia(s)</span>';
}
async function carregar() {
  const { agora, itens } = await api('lista');
  $('#qtd').textContent = itens.length + ' celular(es)';
  $('#lista').innerHTML = itens.length ? itens.map((it) => '<div class="card" data-c="' + esc(it.codigo) + '">'
    + '<div class="linha" style="justify-content:space-between"><span class="nome">' + (esc(it.nome) || '<i class="muted">sem nome</i>') + '</span>' + status(it, agora) + '</div>'
    + '<p class="muted" style="margin:6px 0 10px">Código <span class="cod">' + esc(it.codigo) + '</span> · ' + (it.plataforma === 'web' ? 'navegador' : 'Android') + ' · último acesso ' + quando(it.vistoEm)
    + (it.pagamentos && it.pagamentos.length ? ' · ' + it.pagamentos.length + ' pagamento(s)' : '') + '</p>'
    + '<div class="linha"><button class="pri" data-pagar="7">+7 dias</button><button class="pri" data-pagar="15">+15 dias</button><button class="pri" data-pagar="30">+30 dias</button>'
    + '<button data-nome>✎ Nome</button><button class="perigo" data-bloq="' + (it.bloqueado ? '0' : '1') + '">' + (it.bloqueado ? 'Desbloquear' : 'Bloquear') + '</button></div></div>').join('')
    : '<div class="card vazio">Nenhum celular ainda. Quando o vendedor abrir o app com internet, ele aparece aqui.</div>';
}
$('#lista').addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const codigo = b.closest('[data-c]').dataset.c;
  try {
    if (b.dataset.pagar) { const r = await api('pagar', { codigo, dias: Number(b.dataset.pagar) }); aviso('Pago ✓ Vale até ' + data(r.ate)); }
    else if ('nome' in b.dataset) { const n = prompt('Nome do vendedor:'); if (n == null) return; await api('nome', { codigo, nome: n }); }
    else if (b.dataset.bloq) { if (b.dataset.bloq === '1' && !confirm('Bloquear este celular? Ele para de fazer os cálculos na próxima vez que tiver internet.')) return; await api('bloquear', { codigo, bloquear: b.dataset.bloq === '1' }); }
    await carregar();
  } catch (err) { aviso(err.message); }
});
$('#btnEntrar').addEventListener('click', async () => {
  senha = $('#senha').value.trim();
  try { await carregar(); try { localStorage.setItem('caixa.painel', senha); } catch (e) {} $('#entrar').hidden = true; $('#area').hidden = false; }
  catch (err) { aviso(err.message); }
});
$('#senha').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btnEntrar').click(); });
$('#btnAtualizar').addEventListener('click', () => carregar().catch((err) => aviso(err.message)));
$('#btnAdd').addEventListener('click', async () => {
  const codigo = $('#novoCod').value.trim().toUpperCase();
  if (!/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(codigo)) { aviso('Código no formato XXXX-XXXX.'); return; }
  try { await api('nome', { codigo, nome: $('#novoNome').value.trim() }); $('#novoCod').value = ''; $('#novoNome').value = ''; await carregar(); aviso('Adicionado. Agora marque o pagamento.'); }
  catch (err) { aviso(err.message); }
});
if (senha) carregar().then(() => { $('#entrar').hidden = true; $('#area').hidden = false; }).catch(() => sair());
</script>
</body>
</html>`;
