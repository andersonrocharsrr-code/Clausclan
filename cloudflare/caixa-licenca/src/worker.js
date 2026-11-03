// Servidor de licenças do app Caixa (Cloudflare Worker).
//
// Cada celular tem um código fixo (ex.: 7F3K-92QD). O app pergunta aqui até quando aquele código está pago e recebe
// a validade ASSINADA (Ed25519): sem a chave daqui ninguém consegue inventar uma validade. Sem internet o app usa a
// última validade recebida. O dono marca os pagamentos no painel (/painel), protegido pela senha CAIXA_ADMIN_SENHA.
//
// Segredos (wrangler secret): LICENCA_SEED (gera a chave de assinatura) e ADMIN_SENHA (senha do painel).
// KV: LICENCAS — chave = código do aparelho, valor = { nome, ate, bloqueado, criadoEm, vistoEm, plataforma, pagamentos[] }.
import nacl from 'tweetnacl';
import { PAINEL_HTML } from './painel.js';

const DIA = 86400000;
const CORTESIA_DIAS = 7; // celular novo (Android) ganha 7 dias até o primeiro pagamento
const CODIGO_OK = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors },
});

const utf8 = (s) => new TextEncoder().encode(s);
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// A mesma frase sempre gera a mesma chave (o app guarda a chave pública correspondente).
let chave = null;
function chaves(env) {
  if (!chave) chave = nacl.sign.keyPair.fromSeed(nacl.hash(utf8(env.LICENCA_SEED)).slice(0, 32));
  return chave;
}
// Licença = "codigo|ate|emitidoEm" assinada. O app confere a assinatura, o código e a data.
function assinar(env, codigo, ate) {
  const msg = `${codigo}|${ate}|${Date.now()}`;
  const sig = nacl.sign.detached(utf8(msg), chaves(env).secretKey);
  return `${b64url(utf8(msg))}.${b64url(sig)}`;
}

// Senha do painel: comparação em tempo constante.
function senhaOk(env, req) {
  const dada = utf8((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, ''));
  const certa = utf8(env.ADMIN_SENHA || '');
  if (!certa.length || dada.length !== certa.length) return false;
  let d = 0;
  for (let i = 0; i < certa.length; i++) d |= dada[i] ^ certa[i];
  return d === 0;
}

const ler = async (env, codigo) => (await env.LICENCAS.get(codigo, 'json')) || null;
const gravar = (env, codigo, reg) => env.LICENCAS.put(codigo, JSON.stringify(reg));

async function licenca(env, url) {
  const codigo = (url.searchParams.get('c') || '').toUpperCase();
  if (!CODIGO_OK.test(codigo)) return json({ erro: 'código inválido' }, 400);
  const nome = (url.searchParams.get('n') || '').slice(0, 60);
  const plataforma = url.searchParams.get('p') === 'android' ? 'android' : 'web';
  const agora = Date.now();
  let reg = await ler(env, codigo);
  if (!reg) {
    reg = { nome, plataforma, criadoEm: agora, ate: plataforma === 'android' ? agora + CORTESIA_DIAS * DIA : 0, bloqueado: false, pagamentos: [] };
  }
  if (nome && !reg.nomeManual) reg.nome = nome;
  reg.vistoEm = agora;
  await gravar(env, codigo, reg);
  const ate = reg.bloqueado ? 0 : reg.ate || 0;
  return json({ codigo, ate, bloqueado: !!reg.bloqueado, licenca: assinar(env, codigo, ate) });
}

async function admin(env, req, url) {
  if (!senhaOk(env, req)) return json({ erro: 'senha errada' }, 401);
  const rota = url.pathname.replace('/admin/', '');
  if (rota === 'lista') {
    const itens = [];
    let cursor;
    do {
      const r = await env.LICENCAS.list({ cursor });
      for (const k of r.keys) itens.push({ codigo: k.name, ...(await ler(env, k.name)) });
      cursor = r.list_complete ? null : r.cursor;
    } while (cursor);
    itens.sort((a, b) => (b.vistoEm || 0) - (a.vistoEm || 0));
    return json({ agora: Date.now(), itens });
  }
  if (req.method !== 'POST') return json({ erro: 'use POST' }, 405);
  const corpo = await req.json().catch(() => ({}));
  const codigo = String(corpo.codigo || '').toUpperCase();
  if (!CODIGO_OK.test(codigo)) return json({ erro: 'código inválido' }, 400);
  const agora = Date.now();
  const reg = (await ler(env, codigo)) || { nome: '', plataforma: 'android', criadoEm: agora, ate: 0, bloqueado: false, pagamentos: [] };
  if (rota === 'pagar') {
    const dias = Number(corpo.dias);
    if (![7, 15, 30].includes(dias)) return json({ erro: 'dias inválidos' }, 400);
    // Soma a partir da validade atual (se ainda vale) ou de hoje (se já venceu).
    reg.ate = Math.max(agora, reg.ate || 0) + dias * DIA;
    reg.bloqueado = false;
    (reg.pagamentos ||= []).push({ em: agora, dias });
  } else if (rota === 'nome') {
    reg.nome = String(corpo.nome || '').slice(0, 60);
    reg.nomeManual = true;
  } else if (rota === 'bloquear') {
    reg.bloqueado = !!corpo.bloquear;
  } else if (rota === 'apagar') {
    await env.LICENCAS.delete(codigo);
    return json({ ok: true });
  } else return json({ erro: 'rota desconhecida' }, 404);
  await gravar(env, codigo, reg);
  return json({ ok: true, codigo, ...reg });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    try {
      if (url.pathname === '/licenca') return await licenca(env, url);
      if (url.pathname.startsWith('/admin/')) return await admin(env, req, url);
      if (url.pathname === '/chave') return json({ pub: b64url(chaves(env).publicKey) });
      if (url.pathname === '/' || url.pathname === '/painel') {
        return new Response(PAINEL_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      return json({ erro: 'não encontrado' }, 404);
    } catch (e) {
      return json({ erro: 'falha no servidor' }, 500);
    }
  },
};
