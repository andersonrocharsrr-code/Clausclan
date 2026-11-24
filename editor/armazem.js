/* Editor de Vídeo — guarda o projeto no aparelho: o projeto (texto) no localStorage e os arquivos
   escolhidos no IndexedDB, para o trabalho continuar mesmo se o app for fechado. */
const BANCO = 'editor-midias';
const PROJETO = 'editor.projeto';

let banco = null;
function abrir() {
  if (banco) return banco;
  banco = new Promise((ok, falha) => {
    const r = indexedDB.open(BANCO, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('midias', { keyPath: 'id' });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => falha(r.error);
  });
  return banco;
}

function tx(modo, fn) {
  return abrir().then((db) => new Promise((ok, falha) => {
    const t = db.transaction('midias', modo);
    const st = t.objectStore('midias');
    const r = fn(st);
    t.oncomplete = () => ok(r && r.result);
    t.onerror = () => falha(t.error);
    t.onabort = () => falha(t.error);
  }));
}

/** Guarda uma mídia: { id, blob, nome, tipo, dur, w, h, temAudio… } */
export function guardarMidia(m) {
  const { url, thumb, ...resto } = m;
  return tx('readwrite', (st) => st.put(resto));
}

export function lerMidias() {
  return tx('readonly', (st) => st.getAll()).then((l) => l || []);
}

export function apagarMidia(id) {
  return tx('readwrite', (st) => st.delete(id));
}

export function guardarProjeto(p) {
  try { localStorage.setItem(PROJETO, JSON.stringify(p)); } catch (e) {}
}

export function lerProjeto() {
  try { return JSON.parse(localStorage.getItem(PROJETO) || 'null'); } catch (e) { return null; }
}
