import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { C, E, F, SANS, SOFT, WaIcon, ez, sp, track } from './core';

/* Unités de l'écran du téléphone : 390 × 844 (comme les captures). */
const SW = 390, SH = 844, BZ = 14, HH = 61, NY = 779;
type Sc = { at: number; kind: 'page' | 'shot' | 'wa'; name: string; bars?: string; enter?: 'slide' | 'up' | 'fade' | 'none' | 'wipe'; scroll?: [number, number][]; wipe?: [number, number]; shift?: [number, number][] };

/* Ce que montre l'écran, calé sur la voix (secondes de la voix) */
export const SCREENS: Sc[] = [
  { at: 10.4, kind: 'page', name: 'home', enter: 'none', scroll: [[13.75, 0], [14.9, 430]] },
  { at: 15.25, kind: 'page', name: 'catalogue', scroll: [[15.6, 0], [17.9, 640]] },
  { at: 19.96, kind: 'page', name: 'home' },
  { at: 20.68, kind: 'page', name: 'catalogue' },
  { at: 21.34, kind: 'page', name: 'besoins' },
  { at: 21.94, kind: 'page', name: 'panier' },
  { at: 22.56, kind: 'page', name: 'signup0' },
  { at: 23.42, kind: 'page', name: 'besoins', scroll: [[25.3, 0], [26.3, 260]] },
  { at: 27.72, kind: 'page', name: 'fatigue', scroll: [[28.15, 0], [29.3, 1700]] },
  { at: 29.74, kind: 'page', name: 'produit', scroll: [[29.95, 0], [30.42, 880], [30.9, 880], [31.35, 1465]] },
  { at: 31.9, kind: 'page', name: 'produit', enter: 'none', scroll: [[31.9, 540]] },
  { at: 33.42, kind: 'page', name: 'panier' },
  { at: 33.94, kind: 'shot', name: 'form0', enter: 'up' },
  { at: 34.22, kind: 'shot', name: 'form1', enter: 'wipe', wipe: [366, 422] },
  { at: 35.04, kind: 'shot', name: 'form2', enter: 'wipe', wipe: [452, 510] },
  { at: 36.06, kind: 'shot', name: 'form3', enter: 'wipe', wipe: [540, 596], shift: [[36.86, 0], [37.18, -90]] },
  { at: 37.18, kind: 'shot', name: 'form4', enter: 'none' },
  { at: 39.5, kind: 'wa', name: 'wa' },
  { at: 41.7, kind: 'page', name: 'signup0', enter: 'fade' },
  { at: 42.6, kind: 'page', name: 'signup1', bars: 'signup0', enter: 'wipe', wipe: [HH + 228, HH + 284] },
  { at: 43.26, kind: 'page', name: 'signup2', bars: 'signup0', enter: 'wipe', wipe: [HH + 314, HH + 458] },
  { at: 44.14, kind: 'page', name: 'signup3', bars: 'signup0', enter: 'wipe', wipe: [HH + 488, HH + 546] },
  { at: 45.0, kind: 'page', name: 'compte' },
];
const kf = (f: number, keys?: [number, number][]) => (keys ? track(f, keys.map(([t, v]) => [F(t), v] as [number, number])) : 0);
const activeIndex = (f: number) => { let i = 0; SCREENS.forEach((s, k) => { if (F(s.at) <= f) i = k; }); return i; };
export const scrollNow = (f: number) => kf(f, SCREENS[activeIndex(f)].scroll);

/* Appuis (curseur) et surbrillances, en unités d'écran */
const TAPS = [
  { t: 27.5, x: 103, y: 204 }, { t: 29.56, x: 287, y: 418 }, { t: 33.1, x: 122, y: 394 }, { t: 33.74, x: 195, y: 567 },
  { t: 39.16, x: 195, y: 753 }, { t: 44.72, x: 195, y: 642 }, { t: 47.38, x: 301, y: 408 },
];
const HL: { t: number; x: number; y: number; w: number; h: number; r: number; page?: boolean; d?: number }[] = [
  { t: 20.06, x: 12, y: NY + 4, w: 60, h: 56, r: 18 }, { t: 20.78, x: 88, y: NY + 4, w: 60, h: 56, r: 18 }, { t: 21.44, x: 165, y: NY + 4, w: 60, h: 56, r: 18 },
  { t: 22.04, x: 241, y: NY + 4, w: 60, h: 56, r: 18 }, { t: 22.66, x: 318, y: NY + 4, w: 60, h: 56, r: 18 },
  { t: 24.8, x: 16, y: 318, w: 174, h: 171, r: 18, page: true }, { t: 25.52, x: 16, y: 138, w: 174, h: 171, r: 18, page: true },
  { t: 26.34, x: 200, y: 717, w: 174, h: 208, r: 18, page: true }, { t: 27.04, x: 200, y: 318, w: 174, h: 171, r: 18, page: true, d: 0.5 },
  { t: 37.48, x: 11, y: 541, w: 181, h: 50, r: 14, d: 0.8 }, { t: 38.32, x: 198, y: 541, w: 181, h: 50, r: 14, d: 0.7 },
  { t: 45.3, x: 16, y: HH + 186, w: 358, h: 195, r: 18, d: 1.0 },
];

const WaScreen: React.FC<{ f: number }> = ({ f }) => {
  const b = sp(f, F(40.0) - 3, SOFT);
  const blue = f > F(41.02);
  const rep = sp(f, F(41.25));
  const tick = (c: string) => <span style={{ display: 'inline-flex' }}>{[0, 1].map((i) => <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: i ? -9 : 0 }}><path d="M5 12.5l4.2 4.2L19 7" /></svg>)}</span>;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.waBg, fontFamily: SANS }}>
      <div style={{ height: 78, background: C.waDark, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
        <Img src={staticFile('logo.png')} style={{ width: 46, height: 46, borderRadius: 23 }} />
        <div><div style={{ fontWeight: 800, fontSize: 16 }}>Objectif Santé Durable</div><div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>en ligne</div></div>
      </div>
      <div style={{ position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: C.muted }}>AUJOURD'HUI</div>
      <div style={{ position: 'absolute', right: 12, top: 126, width: 286, background: C.waBubble, borderRadius: '16px 4px 16px 16px', padding: 6, boxShadow: '0 2px 6px rgba(0,0,0,.1)', transformOrigin: '100% 100%', transform: `translateY(${(1 - b) * 260}px) scale(${0.6 + 0.4 * b})`, opacity: Math.min(1, b * 2) }}>
        <Img src={staticFile('app/bon.jpg')} style={{ width: 274, borderRadius: 11, display: 'block' }} />
        <div style={{ fontSize: 14, fontWeight: 600, padding: '7px 6px 0', lineHeight: 1.35, color: '#111' }}>Bonjour ! Voici ma commande N° 1024<br /><b>Total : 76 000 F CFA</b></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, fontSize: 10.5, color: '#667', padding: '0 4px 2px' }}>10:24 {tick(blue ? '#34B7F1' : '#8a9a92')}</div>
      </div>
      <div style={{ position: 'absolute', left: 12, top: 590, maxWidth: 290, background: '#fff', borderRadius: '4px 16px 16px 16px', padding: '10px 13px', fontSize: 14, fontWeight: 600, color: '#111', lineHeight: 1.35, boxShadow: '0 2px 6px rgba(0,0,0,.1)', transformOrigin: '0 0', transform: `scale(${Math.min(1, rep)})`, opacity: Math.min(1, rep * 2) }}>Merci Aminata ! Votre commande est bien reçue.</div>
    </div>
  );
};

const Layer: React.FC<{ s: Sc; f: number }> = ({ s, f }) => {
  if (s.kind === 'wa') return <WaScreen f={f} />;
  const shift = kf(f, s.shift);
  if (s.kind === 'shot') return <Img src={staticFile(`app/${s.name}.png`)} style={{ position: 'absolute', left: 0, top: shift, width: SW }} />;
  const bars = s.bars || s.name, sc = kf(f, s.scroll);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: C.cream }} />
      <Img src={staticFile(`app/${s.name}.png`)} style={{ position: 'absolute', left: 0, top: HH - sc, width: SW }} />
      <Img src={staticFile(`app/${bars}_top.png`)} style={{ position: 'absolute', left: 0, top: 0, width: SW }} />
      <Img src={staticFile(`app/${bars}_nav.png`)} style={{ position: 'absolute', left: 0, top: NY, width: SW }} />
    </>
  );
};

const Screens: React.FC<{ f: number }> = ({ f }) => {
  const i = activeIndex(f); const cur = SCREENS[i]; const prev = i > 0 ? SCREENS[i - 1] : null;
  const a = F(cur.at); const mode = cur.enter || 'slide';
  const p = mode === 'none' ? 1 : mode === 'wipe' ? ez(f, a, a + 15, 0, 1, E.soft) : ez(f, a, a + 10, 0, 1, E.out);
  const st: React.CSSProperties = mode === 'slide' ? { transform: `translateX(${(1 - p) * SW}px)`, boxShadow: '-20px 0 40px rgba(0,0,0,.18)' }
    : mode === 'up' ? { transform: `translateY(${(1 - p) * SH}px)` }
    : mode === 'fade' ? { opacity: p }
    : mode === 'wipe' && cur.wipe && p < 1 ? { clipPath: `inset(${cur.wipe[0]}px ${SW * (1 - p)}px ${SH - cur.wipe[1]}px 0px)` } : {};
  return (
    <>
      {prev && p < 1 ? <div style={{ position: 'absolute', inset: 0, transform: mode === 'slide' ? `translateX(${-p * 90}px)` : undefined }}><Layer s={prev!} f={f} /></div> : null}
      <div style={{ position: 'absolute', inset: 0, ...st }}><Layer s={cur} f={f} /></div>
    </>
  );
};

const Overlays: React.FC<{ f: number }> = ({ f }) => (
  <>
    {HL.map((h, i) => {
      const a = F(h.t) - 2, d = Math.round((h.d ?? 0.62) * 30);
      if (f < a || f > a + d + 6) return null;
      const k = sp(f, a), o = ez(f, a + d, a + d + 6, 1, 0, E.in);
      const y = h.page ? HH + h.y - scrollNow(f) : h.y;
      return <div key={i} style={{ position: 'absolute', left: h.x, top: y, width: h.w, height: h.h, borderRadius: h.r, border: `3px solid ${C.gold}`, background: 'rgba(242,194,48,.16)', boxShadow: `0 0 0 ${6 * (1 - Math.min(1, k)) + 3}px rgba(242,194,48,.28), 0 0 24px rgba(242,194,48,.6)`, transform: `scale(${0.86 + 0.14 * k})`, opacity: o * Math.min(1, k * 2), boxSizing: 'border-box' }} />;
    })}
    {TAPS.map((t, i) => {
      const a = F(t.t);
      if (f < a - 14 || f > a + 16) return null;
      const m = ez(f, a - 14, a - 2, 0, 1, E.out);
      const press = ez(f, a - 1, a + 2, 0, 1) * ez(f, a + 2, a + 7, 1, 0);
      const ring = ez(f, a, a + 14, 0, 1, E.out), o = ez(f, a + 9, a + 16, 1, 0);
      const x = t.x + (1 - m) * 110, y = t.y + (1 - m) * 150;
      return (
        <React.Fragment key={i}>
          {f >= a && <div style={{ position: 'absolute', left: t.x - 44 * ring, top: t.y - 44 * ring, width: 88 * ring, height: 88 * ring, borderRadius: '50%', border: `3px solid ${C.green}`, opacity: (1 - ring) * 0.8 }} />}
          <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: 'absolute', left: x - 5, top: y - 3, opacity: Math.min(1, m * 3) * o, transform: `scale(${1 - press * 0.22})`, transformOrigin: '20% 15%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.35))' }}><path d="M5 3l14 8.5-6.2 1.3L16 20l-2.6 1.2-3.2-7.1L5 18z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
        </React.Fragment>
      );
    })}
  </>
);

/* Caméra : où se trouve le point visé (fx, fy de l'écran) sur la scène 1920×1080, zoom et rotation */
type Cam = { t: number; cx: number; cy: number; s: number; fx: number; fy: number; ry: number; rx: number; rz?: number };
const CAM: Cam[] = [
  { t: 10.85, cx: 1500, cy: 1900, s: 1.1, fx: 195, fy: 422, ry: -50, rx: 26, rz: 10 },
  { t: 11.75, cx: 1400, cy: 548, s: 1.06, fx: 195, fy: 422, ry: -24, rx: 8, rz: 4 },
  { t: 13.35, cx: 1390, cy: 540, s: 1.08, fx: 195, fy: 422, ry: -10, rx: 5, rz: 2 },
  { t: 14.2, cx: 960, cy: 548, s: 0.94, fx: 195, fy: 422, ry: 8, rx: 4, rz: 0 },
  { t: 18.0, cx: 960, cy: 548, s: 0.94, fx: 195, fy: 422, ry: -8, rx: 4 },
  { t: 18.95, cx: 960, cy: 900, s: 1.8, fx: 195, fy: 800, ry: 0, rx: 10 },
  { t: 23.1, cx: 960, cy: 900, s: 1.86, fx: 195, fy: 800, ry: 0, rx: 10 },
  { t: 23.95, cx: 560, cy: 540, s: 1.12, fx: 195, fy: 422, ry: 16, rx: 4 },
  { t: 24.75, cx: 600, cy: 540, s: 1.72, fx: 195, fy: 400, ry: 10, rx: 3 },
  { t: 27.55, cx: 600, cy: 540, s: 1.78, fx: 195, fy: 400, ry: 8, rx: 3 },
  { t: 28.1, cx: 580, cy: 540, s: 1.3, fx: 195, fy: 422, ry: 14, rx: 3 },
  { t: 29.6, cx: 580, cy: 540, s: 1.34, fx: 195, fy: 422, ry: 10, rx: 3 },
  { t: 30.2, cx: 620, cy: 540, s: 2.0, fx: 195, fy: 250, ry: 8, rx: 2 },
  { t: 31.5, cx: 620, cy: 540, s: 2.05, fx: 195, fy: 240, ry: 6, rx: 2 },
  { t: 31.95, cx: -700, cy: 540, s: 1.4, fx: 195, fy: 422, ry: 40, rx: 0 },
  { t: 31.96, cx: 2700, cy: 640, s: 1.15, fx: 195, fy: 422, ry: -40, rx: 6 },
  { t: 32.75, cx: 1400, cy: 540, s: 1.15, fx: 195, fy: 422, ry: -14, rx: 4 },
  { t: 33.95, cx: 1400, cy: 540, s: 1.18, fx: 195, fy: 422, ry: -12, rx: 4 },
  { t: 34.4, cx: 1420, cy: 540, s: 1.9, fx: 195, fy: 470, ry: -7, rx: 2 },
  { t: 36.8, cx: 1420, cy: 540, s: 1.94, fx: 195, fy: 470, ry: -5, rx: 2 },
  { t: 37.35, cx: 1420, cy: 540, s: 2.12, fx: 195, fy: 566, ry: -5, rx: 2 },
  { t: 38.85, cx: 1420, cy: 540, s: 2.15, fx: 195, fy: 566, ry: -4, rx: 2 },
  { t: 39.2, cx: 1420, cy: 540, s: 1.75, fx: 195, fy: 690, ry: -6, rx: 3 },
  { t: 39.8, cx: 1400, cy: 540, s: 1.2, fx: 195, fy: 422, ry: -12, rx: 4 },
  { t: 41.5, cx: 1400, cy: 540, s: 1.22, fx: 195, fy: 422, ry: -8, rx: 4 },
  { t: 42.05, cx: 560, cy: 540, s: 1.15, fx: 195, fy: 422, ry: 16, rx: 4 },
  { t: 42.6, cx: 600, cy: 540, s: 1.8, fx: 195, fy: 400, ry: 10, rx: 3 },
  { t: 44.85, cx: 600, cy: 540, s: 1.84, fx: 195, fy: 410, ry: 8, rx: 3 },
  { t: 45.3, cx: 600, cy: 540, s: 1.9, fx: 195, fy: 320, ry: 9, rx: 3 },
  { t: 46.2, cx: 600, cy: 540, s: 1.94, fx: 195, fy: 320, ry: 7, rx: 3 },
  { t: 46.65, cx: 600, cy: 540, s: 2.55, fx: 262, fy: 392, ry: 6, rx: 2 },
  { t: 47.85, cx: 600, cy: 540, s: 2.6, fx: 262, fy: 392, ry: 4, rx: 2 },
  { t: 48.3, cx: -900, cy: 640, s: 1.2, fx: 195, fy: 422, ry: 45, rx: 6 },
];
const cam = (f: number, k: keyof Omit<Cam, 't'>) => track(f, CAM.map((c) => [F(c.t), (c[k] ?? 0) as number] as [number, number]));

export const Phone: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(10.85) || f > F(48.3)) return null;
  const s = cam(f, 's'), cx = cam(f, 'cx'), cy = cam(f, 'cy'), fx = cam(f, 'fx'), fy = cam(f, 'fy');
  const ry = cam(f, 'ry') + Math.sin(f / 37) * 2.2, rx = cam(f, 'rx') + Math.cos(f / 45) * 1.4, rz = cam(f, 'rz');
  const bob = Math.sin(f / 30) * 5;
  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 2400, perspectiveOrigin: `${cx}px ${cy}px`, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: cx, top: cy + bob, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})` }}>
        <div style={{ position: 'absolute', left: -(fx + BZ), top: -(fy + BZ), width: SW + BZ * 2, height: SH + BZ * 2, borderRadius: 60, background: 'linear-gradient(150deg,#3a403c,#0b0d0c 40%,#1c201d)', boxShadow: '0 70px 120px -30px rgba(0,0,0,.55), 0 30px 50px -25px rgba(0,0,0,.4), inset 0 0 0 2px #4a514c, inset 0 0 0 5px #0b0d0c' }}>
          <div style={{ position: 'absolute', left: BZ, top: BZ, width: SW, height: SH, borderRadius: 46, overflow: 'hidden', background: C.cream }}>
            <Screens f={f} />
            <Overlays f={f} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 32%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
