import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from './theme';

const C = theme.colors;
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = (f: number, a: number, b: number, from: number, to: number, e = theme.ease.out) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: e });

/* Fond : crème + taches de couleur floues qui dérivent (style des références) */
export const BgMesh: React.FC<{ tint?: 'green' | 'gold' | 'mint' }> = ({ tint = 'green' }) => {
  const f = useCurrentFrame();
  const d1 = Math.sin(f / 50) * 60, d2 = Math.cos(f / 65) * 50, d3 = Math.sin(f / 80 + 1) * 40;
  const a = tint === 'gold' ? C.goldSoft : C.mint;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1300, height: 1300, borderRadius: '50%', top: -520, left: -420 + d1, filter: 'blur(60px)', background: `radial-gradient(circle, ${a} 0%, transparent 62%)` }} />
      <div style={{ position: 'absolute', width: 1100, height: 1100, borderRadius: '50%', bottom: -380, right: -420 - d2, filter: 'blur(70px)', background: `radial-gradient(circle, ${C.leaf}55 0%, transparent 62%)` }} />
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', top: 700 + d3, left: 420, filter: 'blur(80px)', background: `radial-gradient(circle, ${C.goldSoft} 0%, transparent 60%)`, opacity: 0.9 }} />
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill style={{ backgroundColor: C.green2, mixBlendMode: 'soft-light', opacity: 0.1 }} />
  </AbsoluteFill>
);
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return <AbsoluteFill style={{ pointerEvents: 'none', backgroundImage: noise, backgroundSize: '220px', backgroundPosition: `${(f * 7) % 220}px ${(f * 13) % 220}px`, opacity: 0.05, mixBlendMode: 'multiply' }} />;
};
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 60%, rgba(22,40,30,0.16) 100%)' }} />
);

/* Téléphone : cadre dessiné en CSS, capture réelle de l'application à l'intérieur */
export const PHONE_W = 600;
export const SCREEN_W = PHONE_W - 36;
export const STATUS = 58;
export const IMG_H = SCREEN_W * 2532 / 1170;
export const SCREEN_H = IMG_H + STATUS;
export const PHONE_H = SCREEN_H + 36;
export const Phone: React.FC<{ children: React.ReactNode; scale?: number; style?: React.CSSProperties }> = ({ children, scale = 1, style }) => (
  <div style={{ width: PHONE_W, height: PHONE_H, borderRadius: 86, background: 'linear-gradient(145deg,#2a2f2c,#0d100e)', padding: 18, boxShadow: theme.shadow + ', inset 0 0 0 3px #3b413d', transform: `scale(${scale})`, position: 'relative', ...style }}>
    <div style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: 70, overflow: 'hidden', position: 'relative', background: C.bg }}>
      <div style={{ position: 'absolute', left: 0, top: STATUS, width: SCREEN_W, height: IMG_H, overflow: 'hidden' }}>{children}</div>
      <div style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: STATUS, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 46px 0', boxSizing: 'border-box', fontFamily: theme.fonts.body, fontWeight: 800, fontSize: 22, color: C.ink }}>
        <span>10:24</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>{[8, 12, 16, 20].map((h) => <span key={h} style={{ width: 5, height: h, borderRadius: 2, background: C.ink }} />)}</span>
          <span style={{ width: 38, height: 18, borderRadius: 5, border: `2px solid ${C.ink}`, padding: 2, boxSizing: 'border-box', marginLeft: 6 }}><span style={{ display: 'block', width: '75%', height: '100%', background: C.ink, borderRadius: 2 }} /></span>
        </span>
      </div>
      <div style={{ position: 'absolute', top: 12, left: '50%', marginLeft: -78, width: 156, height: 40, borderRadius: 30, background: '#0b0d0c' }} />
    </div>
  </div>
);
/* Écran = capture ; y = défilement en fraction de l'écran */
export const Screen: React.FC<{ src: string; y?: number; opacity?: number; x?: number }> = ({ src, y = 0, opacity = 1, x = 0 }) => (
  <Img src={staticFile(src)} style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: IMG_H, transform: `translate(${x}px, ${-y * IMG_H}px)`, opacity }} />
);

/* Appui du doigt : cercle qui se contracte puis onde */
export const Tap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < -14 || t > 26) return null;
  const inP = ease(t, -14, 0, 0, 1);
  const press = t < 0 ? 1 : ease(t, 0, 5, 0.82, 1);
  const ring = ease(t, 0, 22, 0, 1);
  const out = ease(t, 16, 26, 1, 0, theme.ease.in);
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: 180 * ring, height: 180 * ring, left: -90 * ring, top: -90 * ring, borderRadius: '50%', border: `4px solid ${C.green}`, opacity: (1 - ring) * 0.7 }} />
      <div style={{ position: 'absolute', width: 86, height: 86, left: -43, top: -43, borderRadius: '50%', background: 'rgba(22,64,47,0.28)', border: '4px solid rgba(255,255,255,0.95)', boxShadow: '0 10px 30px rgba(22,64,47,.35)', opacity: inP * out, transform: `scale(${press * interpolate(inP, [0, 1], [1.4, 1])})` }} />
    </div>
  );
};

/* Texte tapé lettre par lettre avec curseur */
export const TypeText: React.FC<{ text: string; start: number; per?: number; style?: React.CSSProperties; caret?: boolean }> = ({ text, start, per = 1.6, style, caret = true }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((f - start) / per)));
  const done = n >= text.length;
  const blink = done ? (Math.floor((f - start) / 12) % 2 === 0 ? 1 : 0) : 1;
  return (
    <span style={{ ...style, whiteSpace: 'pre' }}>
      {text.slice(0, n)}
      {caret && f >= start && <span style={{ display: 'inline-block', width: 6, height: '0.9em', marginLeft: 6, background: 'currentColor', verticalAlign: '-0.08em', opacity: blink * (done && f - start > text.length * per + 40 ? 0 : 1) }} />}
    </span>
  );
};

/* Mot qui monte (fondu + montée + échelle) */
export const Rise: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ delay, children, style, y = 40 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: theme.spring.snappy });
  return <div style={{ display: 'inline-block', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`, ...style }}>{children}</div>;
};

/* Sortie de scène : plus rapide que l'entrée */
export const useExit = (dur: number, len = 10) => {
  const f = useCurrentFrame();
  const p = ease(f, dur - len, dur, 0, 1, theme.ease.in);
  return { p, style: { opacity: 1 - p, transform: `translateY(${-60 * p}px) scale(${1 + 0.06 * p})`, filter: `blur(${p * 10}px)` } as React.CSSProperties };
};

/* Logo (icône de l'application) */
export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile('icon.svg')} style={{ width: size, height: size, borderRadius: size * 0.22, boxShadow: '0 24px 60px -18px rgba(22,64,47,.55)', ...style }} />
);

export const WaIcon: React.FC<{ size: number; color?: string }> = ({ size, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
);
export const Check: React.FC<{ size: number; color?: string; sw?: number }> = ({ size, color = '#fff', sw = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
);
