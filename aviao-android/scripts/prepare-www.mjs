// Copia o app web (pasta aviao/) para www/, que vai dentro do APK, e liga o Capacitor.
import { cpSync, rmSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, '..', 'aviao');
const www = join(root, 'www');

rmSync(www, { recursive: true, force: true });
cpSync(src, www, { recursive: true });
// No app nativo não há service worker (o Android guarda os arquivos dentro do APK).
rmSync(join(www, 'sw.js'), { force: true });
copyFileSync(join(root, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js'), join(www, 'capacitor.js'));

// O capacitor.js entra antes do primeiro script do app.
const html = readFileSync(join(www, 'index.html'), 'utf8');
const tag = '<script src="avioes.js';
if (!html.includes(tag)) throw new Error('index.html: não achei o <script src="avioes.js">');
writeFileSync(join(www, 'index.html'), html.replace(tag, `<script src="capacitor.js"></script>\n  ${tag}`));
console.log('www pronto.');
