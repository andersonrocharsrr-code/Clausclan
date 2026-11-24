import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Grain, Mask} from '../components/primitives';
import {clamp01, easeIn, easeInOut, easeOut, F, lerp, prog, sp} from '../lib';
import timeline from './timeline.json';

// Vinheta "Mistérios do Universo" (1080×1920, 10 s). Todo tempo vem de ./timeline.json; tudo é função do quadro.
export const TLV = timeline;
export const FPSV = TLV.fps;
export const WV = 1080;
export const HV = 1920;
const CX = 540;
const CY = 700;
// paleta: fundo azul-noite, creme para o texto, um único destaque (ouro) que marca o nome do canal
export const CV = {
  bg0: '#03040a',
  bg1: '#0b1226',
  cream: '#F2EEE4',
  creamDim: 'rgba(242,238,228,0.62)',
  muted: 'rgba(242,238,228,0.38)',
  gold: '#EFC46E',
  goldRgb: '239,196,110',
  blue: '#86B6FF',
  lilac: '#B9A6FF',
};

// gerador determinístico (sem Math.random)
const mulberry = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const r1 = mulberry(7);
const STARS = Array.from({length: 700}, () => ({x: (r1() - 0.5) * 2, y: (r1() - 0.5) * 2, z: 0.15 + r1() * 0.85, b: r1()}));
const r2 = mulberry(11);
const GAL = Array.from({length: 4200}, (_, i) => {
  const arm = i % 2;
  const u = Math.sqrt(r2());
  const r = 24 + u * 470;
  return {
    r: r + (r2() - 0.5) * 26,
    a: arm * Math.PI + Math.log(r / 20) * 1.55 + (r2() - 0.5) * (0.45 + u * 0.5),
    s: 1.4 + r2() * 3.2 * (1 - u * 0.5),
    c: r2() < 0.12 ? CV.gold : r2() < 0.45 ? CV.blue : r2() < 0.55 ? CV.lilac : CV.cream,
    d: r2(),
  };
});

const glow = (c: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) => {
  if (a <= 0 || r <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(0.4, `rgba(${rgb},${a * 0.35})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, 7);
  c.fill();
};

// velocidade da câmera pelas estrelas: deriva lenta, warp entre warp e drop, volta a derivar
const speed = (t: number) => {
  const w = prog(t, TLV.s1.warp, TLV.s1.warp + 0.4, easeIn) * (1 - prog(t, TLV.s2.drop - 0.5, TLV.s2.drop, easeOut));
  return 0.015 + w * w * 1.6;
};
const travel = (t: number) => {
  let acc = 0;
  const n = Math.ceil(t * 60);
  for (let i = 0; i < n; i++) acc += speed(i / 60) / 60;
  return acc;
};

const drawSpace = (c: CanvasRenderingContext2D, frame: number) => {
  const t = frame / FPSV;
  const {s1, s2, s3} = TLV;
  const bg = c.createRadialGradient(CX, CY, 0, CX, CY, 1300);
  bg.addColorStop(0, CV.bg1);
  bg.addColorStop(1, CV.bg0);
  c.fillStyle = bg;
  c.fillRect(0, 0, WV, HV);
  // câmera: aproximação contínua (em escala logarítmica) + "soco" leve a cada batida depois do drop
  const beat = 60 / TLV.bpm;
  const punch = t > s2.drop ? 0.012 * Math.exp(-((t - s2.drop) % beat) * 8) : 0;
  const zoom = Math.exp(lerp(0, Math.log(1.06), prog(t, s2.drop, TLV.duration, (x) => x))) + punch;
  c.save();
  c.translate(CX, CY);
  c.scale(zoom, zoom);
  c.translate(-CX, -CY);
  // estrelas (riscos durante o warp, derivados da velocidade real)
  const z0 = travel(t);
  const z1 = travel(Math.max(0, t - 1 / FPSV));
  STARS.forEach((e, i) => {
    const zz = (((e.z - z0) % 1) + 1) % 1 + 0.02;
    const zp = (((e.z - z1) % 1) + 1) % 1 + 0.02;
    const x = CX + (e.x / zz) * 260;
    const y = CY + (e.y / zz) * 260;
    if (x < -60 || x > WV + 60 || y < -60 || y > HV + 60) return;
    const xp = CX + (e.x / zp) * 260;
    const yp = CY + (e.y / zp) * 260;
    const br = clamp01((1 - zz) * 1.3) * (0.55 + 0.45 * Math.sin(t * (1.3 + e.b * 2) + i));
    const sz = (1 - zz) * 3.2 + 0.6;
    if (Math.hypot(x - xp, y - yp) > 3 && zp > zz) {
      c.strokeStyle = `rgba(220,232,255,${br})`;
      c.lineWidth = sz;
      c.beginPath();
      c.moveTo(xp, yp);
      c.lineTo(x, y);
      c.stroke();
    } else {
      c.fillStyle = `rgba(235,240,255,${br})`;
      c.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }
  });
  // galáxia: nasce no drop com mola "pesada e calma", gira devagar (linear: movimento contínuo)
  if (t >= s2.drop) {
    const e = sp(frame, s2.drop, {damping: 18, stiffness: 140, mass: 1}, FPSV);
    const spin = (t - s2.drop) * 0.25 + 1.2;
    c.save();
    c.translate(CX, CY);
    c.rotate(-0.35);
    c.scale(1, 0.52);
    c.globalCompositeOperation = 'lighter';
    for (let arm = 0; arm < 2; arm++)
      for (let k = 0; k < 60; k++) {
        const r = (30 + k * 7.4) * e;
        const a = arm * Math.PI + Math.log(r / 24 + 0.01) * 1.55 + spin * (1.3 - r / 700);
        const born = clamp01((t - s2.drop - (k / 60) * 0.35) / 0.4);
        c.globalAlpha = 0.07 * born * (1 - k / 70);
        c.fillStyle = k % 3 ? CV.blue : CV.lilac;
        c.beginPath();
        c.arc(Math.cos(a) * r, Math.sin(a) * r, 34 - k * 0.25, 0, 7);
        c.fill();
      }
    GAL.forEach((p) => {
      const born = clamp01((t - s2.drop - p.d * 0.35) / 0.4);
      if (born <= 0) return;
      const r = p.r * e;
      const a = p.a + spin * (1.3 - p.r / 700);
      c.globalAlpha = born * (0.45 + 0.55 * (1 - p.r / 520));
      c.fillStyle = p.c;
      c.fillRect(Math.cos(a) * r - p.s / 2, Math.sin(a) * r - p.s / 2, p.s, p.s);
    });
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.restore();
    glow(c, CX, CY, 230 * e, '255,214,160', 0.4);
    glow(c, CX, CY, 70 * e, '255,246,225', 0.95);
  }
  // anel de órbita (desenha-se em movimento entre estados → easeInOut) e planeta (mola "pop")
  if (t >= s3.anel) {
    const u = prog(t, s3.anel, s3.anel + 0.9, easeInOut);
    c.save();
    c.translate(CX, CY);
    c.rotate(-0.35);
    c.strokeStyle = `rgba(${CV.goldRgb},0.75)`;
    c.lineWidth = 4;
    c.beginPath();
    c.ellipse(0, 0, 500, 160, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u);
    c.stroke();
    if (t >= s3.planeta) {
      const pk = sp(frame, s3.planeta, {damping: 10, stiffness: 220, mass: 0.7}, FPSV);
      const a = -Math.PI / 2 + (t - s3.planeta) * 0.9 + 2.2;
      const x = Math.cos(a) * 500;
      const y = Math.sin(a) * 160;
      const r = 26 * pk;
      c.fillStyle = CV.blue;
      c.beginPath();
      c.arc(x, y, r, 0, 7);
      c.fill();
      c.fillStyle = 'rgba(3,4,10,.55)';
      c.beginPath();
      c.arc(x + r * 0.45, y + r * 0.3, r * 1.05, 0, 7);
      c.fill();
    }
    c.restore();
  }
  // ponto de luz: já aceso no quadro 0 (miniatura), pulsa nas batidas e cresce até o drop
  if (t <= s2.drop + 0.6) {
    let r = 9;
    for (const p of s1.pulso) r += t >= p ? 8 * Math.exp(-(t - p) * 6) : 0;
    r += 26 * prog(t, s1.warp, s2.drop, easeIn);
    const fade = 1 - prog(t, s2.drop, s2.drop + 0.6, easeOut);
    glow(c, CX, CY, r * 9, '255,214,150', 0.5 * fade);
    glow(c, CX, CY, r * 3, '255,240,210', 0.9 * fade);
    c.fillStyle = `rgba(255,255,255,${fade})`;
    c.beginPath();
    c.arc(CX, CY, r * 0.6, 0, 7);
    c.fill();
  }
  // explosão no drop: anel de luz que passa do canto mais distante (o momento principal)
  if (t >= s2.drop && t <= s2.drop + 1.2) {
    const u = prog(t, s2.drop, s2.drop + 1.2, easeOut);
    const R = Math.hypot(CX, HV - CY) * 1.05 * u;
    c.strokeStyle = `rgba(255,226,170,${0.8 * (1 - u)})`;
    c.lineWidth = 40 * (1 - u) + 2;
    c.beginPath();
    c.arc(CX, CY, R, 0, 7);
    c.stroke();
    glow(c, CX, CY, 700 * u, '255,230,190', 0.7 * (1 - u));
    if (t < s2.drop + 0.08) {
      c.fillStyle = `rgba(255,250,240,${1 - (t - s2.drop) / 0.08})`;
      c.fillRect(0, 0, WV, HV);
    }
  }
  c.restore();
};

const Space: React.FC<{frame: number}> = ({frame}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current?.getContext('2d');
    if (c) drawSpace(c, frame);
  }, [frame]);
  return <canvas ref={ref} width={WV} height={HV} style={{position: 'absolute', inset: 0}} />;
};

// título: três palavras entram por máscara com stagger de 0,12 s; "Universo" é a única palavra no destaque
const Title: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / FPSV;
  const {s2, s3} = TLV;
  const k = (i: number) => prog(t, s2.palavras[i], s2.palavras[i] + 0.8, easeOut);
  const line = prog(t, s2.traco, s2.traco + 0.7, easeOut);
  const sheen = prog(t, s3.selo, s3.selo + 0.9, easeInOut);
  // brilho só dentro das letras (background-clip: text), atravessando da esquerda para a direita
  const shine = (base: string): React.CSSProperties => ({
    backgroundImage: `linear-gradient(100deg, ${base} 0%, ${base} ${sheen * 140 - 30}%, #ffffff ${sheen * 140 - 15}%, ${base} ${sheen * 140}%, ${base} 100%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  });
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 1080, height: 560, textShadow: 'none'}}>
      <div style={{fontFamily: F.serif, fontSize: 204, lineHeight: 1, letterSpacing: '-0.02em', color: CV.cream, textAlign: 'center'}}>
        <Mask k={k(0)}>
          <span style={shine(CV.cream)}>Mistérios</span>
        </Mask>
      </div>
      <div style={{fontFamily: F.mono, fontSize: 46, letterSpacing: '0.22em', color: CV.creamDim, margin: '22px 0 10px'}}>
        <Mask k={k(1)}>DO</Mask>
      </div>
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 196, lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'center'}}>
        <Mask k={k(2)}>
          <span style={shine(CV.gold)}>Universo</span>
        </Mask>
      </div>
      <div style={{marginTop: 34, height: 4, width: 460 * line, background: CV.gold, borderRadius: 2}} />
    </AbsoluteFill>
  );
};

export const Vinheta: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPSV;
  const fadeOut = prog(t, TLV.s4.fim, TLV.duration, easeIn);
  return (
    <AbsoluteFill style={{background: CV.bg0}}>
      <Space frame={frame} />
      <Title frame={frame} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
      <Grain frame={frame} opacity={0.08} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
