/* Editor de Vídeo — legenda automática: reconhece a fala (Whisper, no próprio celular) e devolve
   cada palavra com o tempo em que foi dita. Roda separado da tela para ela não travar.
   Na primeira vez baixa o modelo (~80 MB) do huggingface.co; depois fica guardado no aparelho. */
import { pipeline, env } from './vendor/transformers.min.js';

const MODELO = 'onnx-community/whisper-base_timestamped';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.wasmPaths = new URL('./vendor/ort/', import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1;

let asr = null;

async function carregar() {
  if (asr) return asr;
  const arquivos = new Map();
  const progresso = (p) => {
    if (p.status === 'progress' && p.file) {
      arquivos.set(p.file, { feito: p.loaded || 0, total: p.total || 0 });
      let feito = 0, total = 0;
      for (const a of arquivos.values()) { feito += a.feito; total += a.total; }
      postMessage({ tipo: 'baixando', feito, total });
    }
  };
  const opcoes = { dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' }, progress_callback: progresso };
  asr = await pipeline('automatic-speech-recognition', MODELO, { ...opcoes, device: 'wasm' });
  return asr;
}

onmessage = async ({ data }) => {
  if (data.tipo !== 'transcrever') return;
  try {
    const p = await carregar();
    postMessage({ tipo: 'ouvindo' });
    const r = await p(data.audio, {
      language: data.idioma || 'portuguese',
      task: 'transcribe',
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5
    });
    const palavras = (r.chunks || [])
      .map((c) => ({ p: String(c.text || '').trim(), t0: c.timestamp[0], t1: c.timestamp[1] }))
      .filter((w) => w.p && w.t0 != null);
    postMessage({ tipo: 'pronto', palavras });
  } catch (e) {
    postMessage({ tipo: 'erro', msg: (e && e.message) || String(e) });
  }
};
