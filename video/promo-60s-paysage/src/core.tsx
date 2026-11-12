import React from 'react';
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import FONTS from './fonts.json';

const h = delayRender('polices');
Promise.all(FONTS.map((x) => {
  const ff = new FontFace(x.family, `url(${staticFile('fonts/' + x.file)}) format('woff2')`, { style: x.style, weight: x.weight, unicodeRange: x.range });
  return ff.load().then((l) => { document.fonts.add(l); });
})).then(() => continueRender(h)).catch(() => continueRender(h));

export const FPS = 30;
export const OFF = 0.25;                       // la voix démarre à 0,25 s
export const TOTAL = 60 * FPS;
export const F = (s: number) => Math.round((s + OFF) * FPS);   // seconde de la voix → image
export const C = {
  light: '#F6F6EE', dark: '#0A2619', ink: '#12241A', white: '#FFFFFF',
  gold: '#F2C230', goldDeep: '#D69A0B', lime: '#B6EE7C', leaf: '#8FD19E', green: '#16402F', green2: '#1F5A41', green3: '#2E7A57',
  wa: '#25D366', waDark: '#0B7A6C', waBubble: '#D9FDD3', waBg: '#EFE7DC', cream: '#F6F2E8', muted: '#6B746E',
};
export const SANS = "'Manrope', system-ui, sans-serif";
export const SERIF = "'Fraunces', Georgia, serif";
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1), soft: Easing.bezier(0.33, 1, 0.68, 1),
  inOut: Easing.bezier(0.72, 0, 0.2, 1), in: Easing.bezier(0.55, 0, 0.75, 0.2),
};
export const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ez = (f: number, a: number, b: number, x: number, y: number, e = E.out) => interpolate(f, [a, b], [x, y], { ...cl, easing: e });
export const sp = (f: number, at: number, cfg = { damping: 14, stiffness: 180, mass: 0.6 }) => spring({ frame: f - at, fps: FPS, config: cfg });
export const SOFT = { damping: 22, stiffness: 110, mass: 1 };
// piste d'images clés [image, valeur] avec accélération/décélération entre chaque clé
export const track = (f: number, keys: [number, number][], e = E.inOut) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (f <= keys[i + 1][0]) return keys[i][0] === keys[i + 1][0] ? keys[i + 1][1] : interpolate(f, [keys[i][0], keys[i + 1][0]], [keys[i][1], keys[i + 1][1]], { ...cl, easing: e });
  }
  return keys[keys.length - 1][1];
};

/* ── Fond : clair (taches vertes floues) ↔ vert foncé, comme la référence ── */
const DARK: [number, number][] = [[F(4.1), 0], [F(4.32), 1], [F(10.8), 1], [F(11.05), 0], [F(13.42), 0], [F(13.66), 1], [F(31.6), 1], [F(31.84), 0], [F(41.62), 0], [F(41.88), 1]];
export const darkAt = (f: number) => track(f, DARK);
export const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const d = darkAt(f);
  const a = Math.sin(f / 60) * 90, b = Math.cos(f / 75) * 70, c = Math.sin(f / 48 + 2) * 60;
  const blob = (x: number, y: number, s: number, col: string, o = 1) => <div style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', background: `radial-gradient(circle, ${col} 0%, transparent 66%)`, filter: 'blur(50px)', opacity: o }} />;
  return (
    <AbsoluteFill style={{ background: C.light, overflow: 'hidden' }}>
      {blob(1700 + a, 120 + b, 1100, '#A8E06C')}{blob(160 - a, 1000 + c, 1000, '#9BDB7A')}{blob(900 + c, -200, 800, '#D9F2A8', 0.9)}{blob(1300 - b, 1150, 900, '#F5E7A3', 0.8)}
      <AbsoluteFill style={{ background: `linear-gradient(135deg, #0C3A22 0%, ${C.dark} 55%, #123F25 100%)`, opacity: d }}>
        {blob(1500 + a, 900 + b, 1200, '#3E8F3A', 0.75)}{blob(300 - b, 200 + c, 1000, '#2E7A57', 0.7)}{blob(1000 + c, 400 - a, 700, '#77B255', 0.3)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── Texte cinétique : les mots arrivent un à un ; la ligne « pousse » (effet de caméra qui glisse) ── */
export type Wd = { w: string; t: number; box?: boolean; hot?: boolean };
export const Line: React.FC<{ words: Wd[]; end: number; x: number; y: number; size: number; anchor?: 'left' | 'right' | 'center'; color?: string; accent?: string; boxBg?: string; boxInk?: string; weight?: number; font?: string; italic?: boolean; exit?: 'left' | 'up' | 'blur' }> =
({ words, end, x, y, size, anchor = 'left', color = C.ink, accent = C.gold, boxBg = C.lime, boxInk = C.green, weight = 800, font = SANS, italic, exit = 'blur' }) => {
  const f = useCurrentFrame();
  const a0 = F(words[0].t), e0 = F(end);
  if (f < a0 - 3 || f > e0 + 1) return null;
  const o = ez(f, e0 - 7, e0, 0, 1, E.in);
  const pos: React.CSSProperties = anchor === 'left' ? { left: x } : anchor === 'right' ? { right: 1920 - x } : { left: x, transform: 'translateX(-50%)' };
  return (
    <div style={{ position: 'absolute', top: y - size * 0.62, ...pos, whiteSpace: 'nowrap' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: font, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', fontSize: size, letterSpacing: '-0.035em', lineHeight: 1.24, color, opacity: 1 - o, filter: `blur(${o * 16}px)`, transform: exit === 'left' ? `translateX(${-o * 260}px)` : exit === 'up' ? `translateY(${-o * 60}px)` : `scale(${1 - o * 0.04})` }}>
        {words.map((wd, i) => {
          const a = F(wd.t) - 2;
          const k = ez(f, a, a + 9, 0, 1, E.soft);
          const grow = ez(f, a, a + 8, 0, 1, E.out);
          const est = (wd.w.length * 0.62 + 0.3) * size + (wd.box ? size * 0.5 : 0);
          const gap = i ? size * 0.26 : 0;
          if (wd.box) {
            const n = Math.max(0, Math.min(wd.w.length, Math.floor((f - a - 2) / 1.3)));
            const typing = n < wd.w.length;
            return (
              <span key={i} style={{ display: 'inline-block', maxWidth: grow * est * 1.25, marginLeft: gap * grow, opacity: Math.min(1, k * 2) }}>
                <span style={{ display: 'inline-block', position: 'relative', background: boxBg, color: boxInk, padding: `0 ${size * 0.16}px`, borderLeft: `${Math.max(4, size * 0.045)}px solid ${boxInk}`, borderRight: `${Math.max(4, size * 0.045)}px solid ${boxInk}`, transform: `scale(${0.9 + 0.1 * k})`, transformOrigin: 'left center' }}>
                  {wd.w.slice(0, n)}<span style={{ opacity: 0 }}>{wd.w.slice(n)}</span>
                  {typing && <span style={{ position: 'absolute', left: `calc(${size * 0.16}px + ${(n / wd.w.length) * 100}% - ${(n / wd.w.length) * size * 0.32}px)`, top: '14%', width: Math.max(3, size * 0.04), height: '72%', background: boxInk }} />}
                </span>
              </span>
            );
          }
          return (
            <span key={i} style={{ display: 'inline-block', maxWidth: grow * est * 1.25, marginLeft: gap * grow, overflow: 'visible' }}>
              <span style={{ display: 'inline-block', opacity: k, color: wd.hot ? accent : undefined, filter: `blur(${(1 - k) * 14}px)`, transform: `translateY(${(1 - k) * size * 0.32}px) scale(${0.9 + 0.1 * k})` }}>{wd.w}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ── Trait dessiné à la main (accent) ── */
export const Squiggle: React.FC<{ at: number; x: number; y: number; d: string; color?: string; w?: number; dur?: number; hold?: number; size?: number }> = ({ at, x, y, d, color = C.lime, w = 14, dur = 10, hold = 14, size = 200 }) => {
  const f = useCurrentFrame(); const a = F(at);
  if (f < a || f > a + dur + hold + 8) return null;
  const k = ez(f, a, a + dur, 0, 1, E.out), o = ez(f, a + dur + hold, a + dur + hold + 8, 0, 1, E.in);
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}><path d={d} fill="none" stroke={color} strokeWidth={w * 100 / size} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k + o * -1} opacity={1 - o * 0.3} /></svg>;
};

/* ── Tuile d'icône en 3D (emoji ou texte) ── */
export const Tile: React.FC<{ size: number; children: React.ReactNode; bg?: string; rot?: number; style?: React.CSSProperties }> = ({ size, children, bg = `linear-gradient(145deg, #7BE38A, #2E9E57)`, rot = 0, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: bg, display: 'grid', placeItems: 'center', fontSize: size * 0.56, lineHeight: 1, boxShadow: `0 ${size * 0.22}px ${size * 0.4}px -${size * 0.12}px rgba(0,0,0,.45), inset 0 ${size * 0.04}px 0 rgba(255,255,255,.45), inset 0 -${size * 0.06}px 0 rgba(0,0,0,.14)`, transform: `rotate(${rot}deg)`, fontFamily: SANS, fontWeight: 800, color: '#fff', ...style }}>{children}</div>
);

/* ── Cartes floues qui traversent l'écran (transition « whip ») ── */
export const Streaks: React.FC<{ at: number; dir?: 1 | -1 }> = ({ at, dir = 1 }) => {
  const f = useCurrentFrame(); const a = F(at) - 6;
  if (f < a || f > a + 18) return null;
  const imgs = ['app/produit_view.png', 'app/home_view.png', 'app/besoins_view.png', 'app/compte_view.png', 'app/form3.png', 'app/panier_view.png'];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {imgs.map((src, i) => {
        const k = ez(f, a + i * 1.2, a + 11 + i * 1.2, 0, 1, E.inOut);
        const x0 = dir > 0 ? 2100 : -500, x1 = dir > 0 ? -700 : 2300;
        const y = 80 + ((i * 397) % 820);
        const w = 300 + (i % 3) * 110;
        return <div key={i} style={{ position: 'absolute', left: x0 + (x1 - x0) * k, top: y + (k - 0.5) * (i % 2 ? 160 : -160), width: w, height: w * 0.7, borderRadius: 26, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 60px -20px rgba(0,0,0,.4)', transform: `rotate(${(i % 2 ? 8 : -10)}deg) skewX(${dir * -14 * Math.sin(k * Math.PI)}deg)`, filter: `blur(${4 + Math.sin(k * Math.PI) * 16}px)`, opacity: Math.sin(k * Math.PI) > 0.02 ? 0.95 : 0 }}><Img src={staticFile(src)} style={{ width: '100%', marginTop: -(60 + i * 50) }} /></div>;
      })}
    </AbsoluteFill>
  );
};

export const WaIcon: React.FC<{ size: number; color?: string }> = ({ size, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
);
export const Check: React.FC<{ size: number; color?: string }> = ({ size, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
);
