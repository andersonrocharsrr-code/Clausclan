/* Sereno — instrutora em 3D (three.js).
   O modelo (ioga/instrutora-3d.glb) foi gerado com IA no Tripo e tem esqueleto no padrão Mixamo.
   As posturas usam os mesmos ângulos da ilustração 2D (figure.js → Fig.angles): cada osso é apontado
   na direção do ângulo, no plano de perfil. Nas transições, as rotações dos ossos são interpoladas.
   Construído com: cd ioga-3d && npm ci && npm run build  →  ioga/vendor/instrutora3d.min.js */
import {
  WebGLRenderer, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, Vector3, Quaternion,
  Box3, Mesh, CylinderGeometry, MeshStandardMaterial, Color, SRGBColorSpace, ACESFilmicToneMapping,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

const ANKLE_Y = 0.035; // altura real do tornozelo (o rig do Tripo põe o osso quase na sola)
const CH = {
  Hips: 'Spine', Spine: 'Spine1', Spine1: 'Spine2', Spine2: 'Neck', Neck: 'Head',
  LeftArm: 'LeftForeArm', LeftForeArm: 'LeftHand', RightArm: 'RightForeArm', RightForeArm: 'RightHand',
  LeftUpLeg: 'LeftLeg', LeftLeg: 'LeftFoot', RightUpLeg: 'RightLeg', RightLeg: 'RightFoot',
};
const D = Math.PI / 180;
const ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
// ângulo do app (0 = frente, 90 = baixo, -90 = cima) → direção no plano de perfil (x = frente, y = cima)
const ang = (a, z = 0) => new Vector3(Math.cos(a * D), -Math.sin(a * D), z).normalize();
const norm180 = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

let modelPromise = null;
function loadModel(url) {
  if (!modelPromise) modelPromise = new GLTFLoader().loadAsync(url);
  return modelPromise;
}

/* ---------- Postura 3D a partir dos ângulos 2D ---------- */
// Mãos espalmadas no chão nestas posturas; pés com o peito no chão quando a canela está deitada.
const PALMAS = new Set(['mesa', 'gato', 'vaca', 'prancha', 'cachorro', 'caocima', 'cobra']);
// Ajustes feitos para o corpo 3D (proporções diferentes do desenho).
const AJUSTES = {
  avanco: { l0: 8, l1: 92, r0: 102, r1: 178 },
  caocima: { t: -70, h: -100, c: -8, a0: 93, a1: 91, b0: 91, b1: 91, l0: 162, l1: 176, r0: 161, r1: 176 },
  vaca: { h: -88 },
  gato: { h: 70 },
  cobra: { h: -70 },
};
export function pose3d(id, n) {
  const p = { ...n, ...(AJUSTES[id] || {}) };
  p.palmas = PALMAS.has(id);
  return p;
}

export function create(el, opts = {}) {
  const url = opts.model || 'instrutora-3d.glb';
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';

  const scene = new Scene();
  scene.add(new HemisphereLight(0xfff8ef, 0x8a7f70, 2.1));
  const sun = new DirectionalLight(0xffffff, 1.7); sun.position.set(1.5, 3, 3); scene.add(sun);
  const camera = new PerspectiveCamera(28, 1, 0.01, 50);

  // Tapete
  const matColor = new Color(opts.matColor || '#c9b8a4');
  const mat = new Mesh(new CylinderGeometry(0.62, 0.62, 0.012, 48), new MeshStandardMaterial({ color: matColor, roughness: 0.95 }));
  mat.scale.set(1, 1, 0.42); mat.position.y = -0.006; scene.add(mat);

  let root = null, B = {}, rest = {}, restW = {}, cur = null, raf = 0, disposed = false, yawExtra = 0;
  let size = { w: 300, h: 300 };

  function frame() {
    const r = el.getBoundingClientRect();
    size = { w: Math.max(50, r.width), h: Math.max(50, r.height) };
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    // Enquadra a maior postura (deitada ~1,45 de largura, braços para cima ~1,2 de altura).
    const t = Math.tan((camera.fov * D) / 2);
    const dist = Math.max(1.22 / 2 / t, 1.5 / 2 / (t * camera.aspect)) * 1.08;
    const az = 0.32 + yawExtra;
    camera.position.set(Math.sin(az) * dist, 0.62, Math.cos(az) * dist);
    camera.lookAt(0, 0.5, 0);
    camera.updateProjectionMatrix();
    render();
  }
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => frame()) : null;
  ro?.observe(el);

  /* ---------- Esqueleto ---------- */
  function setup(gltf) {
    root = cloneSkinned(gltf.scene); // cópia com esqueleto próprio (pode haver mais de uma tela 3D)
    const bonesByName = {};
    root.traverse((o) => { if (o.isBone) bonesByName[o.name] = o; if (o.isSkinnedMesh) o.frustumCulled = false; });
    for (const [k, b] of Object.entries(bonesByName)) B[k.replace('mixamorig', '').replace(':', '')] = b;
    scene.add(root);
    root.updateMatrixWorld(true);
    // Sobe o ponto de giro do tornozelo e refaz a ligação da pele (forma em repouso não muda).
    for (const s of ['Left', 'Right']) {
      const f = B[s + 'Foot'], t = B[s + 'ToeBase'], leg = B[s + 'Leg'];
      const toeW = t.getWorldPosition(new Vector3()), fW = f.getWorldPosition(new Vector3());
      f.position.copy(leg.worldToLocal(new Vector3(fW.x - 0.004, ANKLE_Y, fW.z))); f.updateMatrixWorld(true);
      t.position.copy(f.worldToLocal(toeW.clone())); t.updateMatrixWorld(true);
    }
    root.updateMatrixWorld(true);
    root.traverse((o) => { if (o.isSkinnedMesh) o.skeleton.calculateInverses(); });
    for (const k in B) rest[k] = B[k].quaternion.clone();
    for (const k of ['LeftHand', 'RightHand', 'LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase']) restW[k] = B[k].getWorldQuaternion(new Quaternion());
  }
  function reset() { for (const k in B) B[k].quaternion.copy(rest[k]); root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.updateMatrixWorld(true); }
  const tmpA = new Vector3(), tmpB = new Vector3();
  function aim(name, dir) {
    const b = B[name], c = B[CH[name]];
    root.updateMatrixWorld(true);
    const cur0 = c.getWorldPosition(tmpB).sub(b.getWorldPosition(tmpA)).normalize();
    const q = new Quaternion().setFromUnitVectors(cur0, dir.clone().normalize());
    const wq = b.getWorldQuaternion(new Quaternion());
    const pq = b.parent.getWorldQuaternion(new Quaternion());
    b.quaternion.copy(pq.invert().multiply(q.multiply(wq)));
    b.updateMatrixWorld(true);
  }
  function orient(name, q) { // rotação no mundo a partir do repouso
    const b = B[name];
    root.updateMatrixWorld(true);
    const want = q.multiply(restW[name].clone());
    const pq = b.parent.getWorldQuaternion(new Quaternion());
    b.quaternion.copy(pq.invert().multiply(want));
    b.updateMatrixWorld(true);
  }
  const pitch = (a) => new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -a * D);
  const palm = (s) => orient(s + 'Hand', new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), s === 'Left' ? -Math.PI / 2 : Math.PI / 2));

  // Calcula a postura (rotações locais de cada osso + posição no tapete), sem mostrar.
  function solve(p, mirror) {
    reset();
    const t = p.t, c = p.c || 0, h = p.h ?? t;
    for (const [n, k] of [['Hips', -2.4], ['Spine', -0.8], ['Spine1', 0.8], ['Spine2', 2.4]]) aim(n, ang(t + c * k));
    aim('Neck', ang(h));
    const legs = [['Right', p.l0, p.l1, p.fl, 0.07], ['Left', p.r0, p.r1, p.fr, -0.07]];
    for (const [s, l0, l1, ft, z] of legs) {
      aim(s + 'UpLeg', ang(l0, z)); aim(s + 'Leg', ang(l1, z * 0.3));
      let fa = ft ?? l1 - 90, toe = 0;
      const shin = norm180(l1);
      if (Math.abs(Math.abs(shin) - 180) < 35 && Math.abs(norm180(fa) - 180) < 50) { fa = 160; toe = 6; } // peito do pé no chão
      orient(s + 'Foot', pitch(fa));
      orient(s + 'ToeBase', pitch(fa + toe));
    }
    const arms = [['Right', p.a0, p.a1, 0.1], ['Left', p.b0, p.b1, -0.1]];
    for (const [s, u, f, z] of arms) {
      aim(s + 'Arm', ang(u, z)); aim(s + 'ForeArm', ang(f, z * 0.5));
      if (p.palmas) palm(s);
    }
    const q = {}; for (const k in B) q[k] = B[k].quaternion.clone();
    // Encosta no tapete e centraliza (com o giro do lado esquerdo).
    root.rotation.y = mirror ? Math.PI : 0;
    root.updateMatrixWorld(true);
    const bb = new Box3().setFromObject(root, true);
    const pos = new Vector3(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    return { q, pos, yaw: root.rotation.y };
  }
  function show(s) {
    for (const k in B) B[k].quaternion.copy(s.q[k]);
    root.position.copy(s.pos); root.rotation.set(0, s.yaw, 0);
    root.updateMatrixWorld(true);
    render();
  }

  const ready = loadModel(url).then((g) => { if (disposed) return; setup(g); frame(); });

  let pending = null;
  const api = {
    ready,
    set(p, mirror) {
      if (!root) { pending = [p, mirror, 0]; ready.then(() => pending && api.set(pending[0], pending[1])); return; }
      cancelAnimationFrame(raf); pending = null;
      cur = solve(p, mirror); show(cur);
    },
    to(p, mirror, ms = 1200) {
      if (!root) { pending = [p, mirror, ms]; ready.then(() => pending && api.set(pending[0], pending[1])); return; }
      cancelAnimationFrame(raf); pending = null;
      const target = solve(p, mirror);
      if (!cur || ms <= 0 || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { cur = target; show(cur); return; }
      const from = cur, t0 = performance.now();
      // giro do lado: passa pela frente (para a câmera), não por trás
      let y0 = from.yaw, y1 = target.yaw;
      if (Math.abs(y1 - y0) > 0.01) y1 = y0 + (y1 > y0 ? 1 : -1) * Math.PI;
      const tmpQ = new Quaternion(), tmpP = new Vector3();
      const step = (now) => {
        const k = ease(Math.min(1, (now - t0) / ms));
        for (const n in B) B[n].quaternion.copy(tmpQ.copy(from.q[n]).slerp(target.q[n], k));
        root.position.copy(tmpP.copy(from.pos).lerp(target.pos, k));
        root.rotation.set(0, y0 + (y1 - y0) * k, 0);
        root.updateMatrixWorld(true);
        render();
        if (k < 1) raf = requestAnimationFrame(step); else cur = target;
      };
      raf = requestAnimationFrame(step);
    },
    // Gira a câmera em volta da instrutora (tela "Ver em 3D").
    orbit(delta) { yawExtra += delta; frame(); },
    setMatColor(c) { mat.material.color.set(c); render(); },
    stop() { cancelAnimationFrame(raf); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); ro?.disconnect();
      renderer.dispose(); renderer.domElement.remove();
    },
  };
  return api;
}
