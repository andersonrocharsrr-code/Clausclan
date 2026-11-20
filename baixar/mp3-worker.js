/* Converte o som do vídeo (já decodificado pelo app) em MP3, fora da tela para não travar.
   Recebe { canais: [Float32Array, …], taxa, kbps } e devolve pedaços do MP3 (Uint8Array). */
importScripts('vendor/lame.min.js');

self.onmessage = (ev) => {
  try {
    const { canais, taxa, kbps } = ev.data;
    const nCanais = Math.min(canais.length, 2);
    const enc = new lamejs.Mp3Encoder(nCanais, taxa, kbps || 192);
    const total = canais[0].length;
    const BLOCO = 1152 * 20;
    const partes = [];
    const paraInt16 = (f, ini, fim) => {
      const out = new Int16Array(fim - ini);
      for (let i = ini; i < fim; i++) {
        const s = Math.max(-1, Math.min(1, f[i]));
        out[i - ini] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return out;
    };
    let ultimo = 0;
    for (let i = 0; i < total; i += BLOCO) {
      const fim = Math.min(total, i + BLOCO);
      const esq = paraInt16(canais[0], i, fim);
      const buf = nCanais === 2 ? enc.encodeBuffer(esq, paraInt16(canais[1], i, fim)) : enc.encodeBuffer(esq);
      if (buf.length) partes.push(new Uint8Array(buf.buffer, buf.byteOffset, buf.length).slice());
      const pct = Math.floor((fim / total) * 100);
      if (pct - ultimo >= 2) { ultimo = pct; self.postMessage({ progresso: pct }); }
    }
    const fimBuf = enc.flush();
    if (fimBuf.length) partes.push(new Uint8Array(fimBuf.buffer, fimBuf.byteOffset, fimBuf.length).slice());
    self.postMessage({ pronto: partes });
  } catch (e) {
    self.postMessage({ erro: String((e && e.message) || e) });
  }
};
