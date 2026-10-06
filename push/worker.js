/*
 * Nexa Money - servidor de notificacoes (Cloudflare Worker).
 *
 * O app envia para ca so os lembretes futuros de cada celular (data, titulo e texto).
 * A cada minuto, o agendamento (Cron) procura lembretes vencidos e manda a notificacao
 * pelo servico de push do navegador (Web Push), mesmo com o app fechado.
 *
 * Precisa de: um banco D1 ligado com o nome "DB" e um gatilho Cron "* * * * *".
 * As chaves de seguranca (VAPID) sao criadas sozinhas na primeira vez e ficam no banco.
 */

const MAX_ITEMS = 300;          // lembretes por celular
const MAX_TEXT = 300;           // caracteres por titulo/texto
const SUBJECT = 'mailto:nexa-money@users.noreply.github.com';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    try {
      await setup(env);
      if (req.method === 'GET' && url.pathname === '/') return json({ ok: true, app: 'nexa-money-push' });
      if (req.method === 'GET' && url.pathname === '/key') return json({ key: (await vapid(env)).publicKey });
      if (req.method === 'POST' && url.pathname === '/sync') return json(await sync(env, await req.json()));
      if (req.method === 'POST' && url.pathname === '/test') return json(await test(env, await req.json()));
      if (req.method === 'POST' && url.pathname === '/remove') {
        const { id } = await req.json();
        if (validId(id)) await removeDevice(env, id);
        return json({ ok: true });
      }
      return json({ error: 'not found' }, 404);
    } catch (err) {
      return json({ error: String(err && err.message || err) }, 400);
    }
  },
  async scheduled(event, env, ctx) {
    await setup(env);
    ctx.waitUntil(sendDue(env));
  },
};

/* ---------------- Banco ---------------- */
let ready = false;
async function setup(env) {
  if (ready) return;
  if (!env.DB) throw new Error('Banco D1 n\u00e3o ligado: crie a liga\u00e7\u00e3o com o nome DB.');
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS devices (id TEXT PRIMARY KEY, sub TEXT NOT NULL, updated INTEGER)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS items (device TEXT NOT NULL, at INTEGER NOT NULL, tag TEXT, title TEXT, body TEXT, url TEXT)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS items_at ON items(at)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS items_device ON items(device)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT)'),
  ]);
  ready = true;
}
const validId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(id);
const clip = (s) => String(s == null ? '' : s).slice(0, MAX_TEXT);

async function sync(env, data) {
  const { id, subscription, items } = data || {};
  if (!validId(id)) throw new Error('id inv\u00e1lido');
  const sub = subscription;
  if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
    throw new Error('inscri\u00e7\u00e3o de push inv\u00e1lida');
  }
  const now = Date.now();
  const list = (Array.isArray(items) ? items : [])
    .filter((x) => x && Number.isFinite(x.at) && x.at > now - 60000 && x.at < now + 400 * 864e5)
    .slice(0, MAX_ITEMS);
  const stmts = [
    env.DB.prepare('INSERT INTO devices (id, sub, updated) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET sub = ?2, updated = ?3')
      .bind(id, JSON.stringify({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }), now),
    env.DB.prepare('DELETE FROM items WHERE device = ?1').bind(id),
    ...list.map((x) => env.DB.prepare('INSERT INTO items (device, at, tag, title, body, url) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
      .bind(id, Math.round(x.at), clip(x.tag), clip(x.title), clip(x.body), clip(x.url || './'))),
  ];
  await env.DB.batch(stmts);
  return { ok: true, scheduled: list.length };
}

async function removeDevice(env, id) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM items WHERE device = ?1').bind(id),
    env.DB.prepare('DELETE FROM devices WHERE id = ?1').bind(id),
  ]);
}

async function test(env, data) {
  const { id } = data || {};
  if (!validId(id)) throw new Error('id inv\u00e1lido');
  const row = await env.DB.prepare('SELECT sub FROM devices WHERE id = ?1').bind(id).first();
  if (!row) throw new Error('celular n\u00e3o cadastrado');
  const status = await push(env, JSON.parse(row.sub), {
    title: 'Notifica\u00e7\u00f5es ativadas \u2705', body: 'Pronto! Os lembretes v\u00e3o chegar mesmo com o app fechado.', tag: 'push-test', url: './',
  });
  return { ok: status < 300, status };
}

async function sendDue(env) {
  const now = Date.now();
  const due = await env.DB.prepare(
    'SELECT items.rowid AS rid, items.device, items.tag, items.title, items.body, items.url, devices.sub FROM items JOIN devices ON devices.id = items.device WHERE items.at <= ?1 ORDER BY items.at LIMIT 200',
  ).bind(now).all();
  const rows = due.results || [];
  if (!rows.length) return;
  const gone = new Set();
  await Promise.all(rows.map(async (r) => {
    if (gone.has(r.device)) return;
    try {
      const status = await push(env, JSON.parse(r.sub), { title: r.title, body: r.body, tag: r.tag, url: r.url });
      if (status === 404 || status === 410) gone.add(r.device);
    } catch { /* tenta de novo so se o app sincronizar outra vez */ }
  }));
  await env.DB.batch([
    ...rows.map((r) => env.DB.prepare('DELETE FROM items WHERE rowid = ?1').bind(r.rid)),
    ...[...gone].flatMap((id) => [
      env.DB.prepare('DELETE FROM items WHERE device = ?1').bind(id),
      env.DB.prepare('DELETE FROM devices WHERE id = ?1').bind(id),
    ]),
  ]);
}

/* ---------------- Chaves VAPID (criadas uma vez e guardadas no banco) ---------------- */
let vapidCache = null;
async function vapid(env) {
  if (vapidCache) return vapidCache;
  const row = await env.DB.prepare("SELECT v FROM config WHERE k = 'vapid'").first();
  let jwk;
  if (row) jwk = JSON.parse(row.v);
  else {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
    await env.DB.prepare("INSERT OR IGNORE INTO config (k, v) VALUES ('vapid', ?1)").bind(JSON.stringify(jwk)).run();
    const again = await env.DB.prepare("SELECT v FROM config WHERE k = 'vapid'").first();
    jwk = JSON.parse(again.v);
  }
  const privateKey = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, d: jwk.d }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const pub = concat(new Uint8Array([4]), b64d(jwk.x), b64d(jwk.y));
  vapidCache = { privateKey, publicKey: b64e(pub) };
  return vapidCache;
}

/* ---------------- Web Push (RFC 8291 + RFC 8292) ---------------- */
async function push(env, sub, message) {
  const { privateKey, publicKey } = await vapid(env);
  const endpoint = new URL(sub.endpoint);
  const jwt = await signJwt(privateKey, { aud: endpoint.origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SUBJECT });
  const body = await encrypt(new TextEncoder().encode(JSON.stringify(message)), b64d(sub.keys.p256dh), b64d(sub.keys.auth));
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: 'vapid t=' + jwt + ', k=' + publicKey,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '86400',
      Urgency: 'high',
    },
    body,
  });
  return res.status;
}

async function signJwt(key, claims) {
  const enc = (o) => b64e(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = enc({ typ: 'JWT', alg: 'ES256' }) + '.' + enc(claims);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
  return unsigned + '.' + b64e(new Uint8Array(sig));
}

async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8));
}

async function encrypt(plaintext, uaPublic, authSecret) {
  const te = new TextEncoder();
  const local = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', local.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, local.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, concat(te.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const record = concat(plaintext, new Uint8Array([2]));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, record));
  const header = new Uint8Array(16 + 4 + 1 + asPublic.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096);
  header[20] = asPublic.length;
  header.set(asPublic, 21);
  return concat(header, cipher);
}

/* ---------------- Utilitarios ---------------- */
function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
function b64e(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64d(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

