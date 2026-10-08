/*
 * Fotos dos pratos feitos pelo usuário. Ficam no IndexedDB (cabem bem mais que no localStorage).
 * Registro: { id, recipeId, at, blob }
 */
const DB = 'tempero-fotos', STORE = 'fotos';
let dbp = null;

function db() {
  dbp ||= new Promise((res, rej) => {
    const rq = indexedDB.open(DB, 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore(STORE, { keyPath: 'id' }).createIndex('recipe', 'recipeId');
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
  return dbp;
}

const tx = async (mode, fn) => {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => res(out?.result ?? out);
    t.onerror = () => rej(t.error);
  });
};

/** Reduz a foto para no máximo 1080 px (JPEG) antes de guardar. */
export async function shrink(file, max = 1080) {
  const img = await createImageBitmap(file).catch(() => null);
  if (!img) return file;
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b || file), 'image/jpeg', 0.82));
}

export async function addPhoto(recipeId, file) {
  const blob = await shrink(file);
  const rec = { id: `${recipeId}:${Date.now()}`, recipeId, at: Date.now(), blob };
  await tx('readwrite', (s) => s.put(rec));
  window.dispatchEvent(new CustomEvent('photos-changed'));
  return rec;
}

export async function photosOf(recipeId) {
  try {
    const all = await tx('readonly', (s) => s.index('recipe').getAll(recipeId));
    return (all || []).sort((a, b) => b.at - a.at);
  } catch { return []; }
}

export async function allPhotos() {
  try {
    const all = await tx('readonly', (s) => s.getAll());
    return (all || []).sort((a, b) => b.at - a.at);
  } catch { return []; }
}

export async function deletePhoto(id) {
  await tx('readwrite', (s) => s.delete(id));
  window.dispatchEvent(new CustomEvent('photos-changed'));
}

export async function clearPhotos() {
  try { await tx('readwrite', (s) => s.clear()); } catch { /* sem banco */ }
}

/** URL temporária para exibir (revogada quando a tela troca). */
const urls = new Set();
export function urlFor(rec) {
  const u = URL.createObjectURL(rec.blob);
  urls.add(u);
  return u;
}
export function releaseUrls() { urls.forEach((u) => URL.revokeObjectURL(u)); urls.clear(); }
