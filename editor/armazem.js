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

// ---------- Vários projetos ----------
// Lista (editor.projetos) com { id, nome, alterado, dur, formato, capa } e cada projeto em editor.p.<id>.
const LISTA = 'editor.projetos';
const chave = (id) => 'editor.p.' + id;

export function listarProjetos() {
  let l = null;
  try { l = JSON.parse(localStorage.getItem(LISTA) || 'null'); } catch (e) {}
  if (!Array.isArray(l)) {
    l = [];
    // Projeto único das versões antigas vira o primeiro da lista.
    let velho = null;
    try { velho = JSON.parse(localStorage.getItem(PROJETO) || 'null'); } catch (e) {}
    if (velho && velho.clipes && velho.clipes.length) {
      const id = 'p' + Date.now().toString(36);
      velho.nome = velho.nome || 'Meu primeiro vídeo';
      try { localStorage.setItem(chave(id), JSON.stringify(velho)); } catch (e) {}
      l.push({ id, nome: velho.nome, alterado: Date.now(), dur: 0, formato: velho.formato });
    }
    try { localStorage.setItem(LISTA, JSON.stringify(l)); localStorage.removeItem(PROJETO); } catch (e) {}
  }
  return l.sort((a, b) => b.alterado - a.alterado);
}

function gravarLista(l) { try { localStorage.setItem(LISTA, JSON.stringify(l)); } catch (e) {} }

export function lerProjetoId(id) {
  try { return JSON.parse(localStorage.getItem(chave(id)) || 'null'); } catch (e) { return null; }
}

/** Guarda o projeto e atualiza a ficha dele na lista (nome, duração, capa…). */
export function guardarProjetoId(id, p, ficha) {
  try { localStorage.setItem(chave(id), JSON.stringify(p)); } catch (e) {}
  const l = listarProjetos();
  const i = l.findIndex((x) => x.id === id);
  const nova = { ...(i >= 0 ? l[i] : { id }), ...ficha, nome: p.nome, alterado: Date.now() };
  if (i >= 0) l[i] = nova; else l.push(nova);
  gravarLista(l);
}

export function apagarProjetoId(id) {
  try { localStorage.removeItem(chave(id)); } catch (e) {}
  gravarLista(listarProjetos().filter((x) => x.id !== id));
}

/** Todos os projetos guardados (para saber quais arquivos ainda são usados). */
export function todosOsProjetos() {
  return listarProjetos().map((f) => lerProjetoId(f.id)).filter(Boolean);
}

// Antigo (um projeto só): mantido para a conversão acima.
export function guardarProjeto(p) {
  try { localStorage.setItem(PROJETO, JSON.stringify(p)); } catch (e) {}
}

export function lerProjeto() {
  try { return JSON.parse(localStorage.getItem(PROJETO) || 'null'); } catch (e) { return null; }
}
