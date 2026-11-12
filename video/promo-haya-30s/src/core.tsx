import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { T } from './theme';
import { FPS, Phrase, wordTimes } from './timeline';

export const fr = (s: number) => Math.round(s * FPS);
export const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ez = (f: number, a: number, b: number, x: number, y: number, e = T.e.out) => interpolate(f, [a, b], [x, y], { ...cl, easing: e });
export const sp = (f: number, at: number, cfg = T.s.card) => spring({ frame: f - at, fps: FPS, config: cfg });

/* Fond blanc cassé + halo coloré flou qui respire (comme la référence) */
export const Backdrop: React.FC<{ night: number; glow: string }> = ({ night, glow }) => {
  const f = useCurrentFrame();
  const x = Math.sin(f / 70) * 60, y = Math.cos(f / 90) * 50, s = 1 + Math.sin(f / 55) * 0.05;
  return (
    <AbsoluteFill style={{ background: T.c.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 540 - 560 + x, top: 1150 - 560 + y, width: 1120, height: 1120, borderRadius: '50%', background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`, filter: 'blur(40px)', transform: `scale(${s})`, opacity: 0.9 }} />
      <div style={{ position: 'absolute', left: -300 - x, top: -260, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${T.c.mint} 0%, transparent 65%)`, filter: 'blur(60px)', opacity: 0.7 }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, #1F5A41 0%, ${T.c.night} 70%)`, opacity: night }} />
      <div style={{ position: 'absolute', left: 540 - 450 - x, top: 760 - 450, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,179,26,.28) 0%, transparent 65%)', filter: 'blur(50px)', opacity: night }} />
    </AbsoluteFill>
  );
};

/* Texte cinétique : chaque mot sort du flou au moment où la voix le prononce */
export const Kinetic: React.FC<{ p: Phrase; top: number; size?: number; color?: string; accent?: string }> = ({ p, top, size = 64, color = T.c.ink, accent = T.c.accent }) => {
  const f = useCurrentFrame();
  const times = wordTimes(p);
  const lines: { w: string; i: number }[][] = [[]];
  let i = 0;
  for (const tok of p.text.split(' ')) {
    if (tok === '/') { lines.push([]); continue; }
    lines[lines.length - 1].push({ w: tok, i: i++ });
  }
  const exitA = fr(p.end) - 8;
  const out = ez(f, exitA, exitA + 9, 0, 1, T.e.in);
  if (f < fr(p.start) - 2 || f > fr(p.end) + 2) return null;
  return (
    <div style={{ position: 'absolute', top, left: 60, right: 60, textAlign: 'center', fontFamily: T.f.sans, fontWeight: 800, fontSize: size, lineHeight: 1.17, letterSpacing: '-0.025em', color, opacity: 1 - out, filter: `blur(${out * 14}px)`, transform: `translateY(${-out * 16}px)` }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: size * 0.26 }}>
          {ln.map(({ w, i }) => {
            const a = fr(times[i]);
            const k = ez(f, a, a + 10, 0, 1, T.e.soft);
            const hot = w.startsWith('*');
            const clean = w.replace(/^\*/, '');
            return (
              <span key={i} style={{ display: 'inline-block', opacity: k, filter: `blur(${(1 - k) * 12}px)`, transform: `translateY(${(1 - k) * 18}px) scale(${0.96 + 0.04 * k})`, color: hot ? accent : color }}>{clean}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* Scène d'une carte : entrée (flou → net, montée, échelle), flottement 3D doux, sortie floue rapide */
export const CardStage: React.FC<{ from: number; to: number; top: number; children: React.ReactNode; width?: number; exitTo?: 'blur' | 'none' }> = ({ from, to, top, children, width = 760, exitTo = 'blur' }) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a - 1 || f > b + 1) return null;
  const k = sp(f, a, T.s.card);
  const o = exitTo === 'blur' ? ez(f, b - 9, b, 0, 1, T.e.in) : 0;
  const rx = Math.sin(f / 48) * 3, ry = Math.cos(f / 60) * 4, fy = Math.sin(f / 40) * 7;
  return (
    <div style={{ position: 'absolute', top, left: (1080 - width) / 2, width, perspective: 1800 }}>
      <div style={{ transformStyle: 'preserve-3d', transform: `translateY(${(1 - k) * 70 + fy - o * 20}px) scale(${0.88 + 0.12 * k - o * 0.05}) rotateX(${rx + (1 - k) * 14}deg) rotateY(${ry}deg)`, opacity: Math.min(1, k * 1.6) * (1 - o), filter: `blur(${(1 - Math.min(1, k * 1.2)) * 22 + o * 18}px)` }}>
        {children}
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; pad?: number }> = ({ children, style, pad = 36 }) => (
  <div style={{ background: T.c.card, borderRadius: 46, padding: pad, boxShadow: T.shadow, fontFamily: T.f.sans, color: T.c.ink, position: 'relative', overflow: 'hidden', ...style }}>{children}</div>
);

/* Petits éléments réutilisables */
export const CheckDot: React.FC<{ k: number; size?: number; bg?: string }> = ({ k, size = 40, bg = T.c.green3 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: k > 0.02 ? bg : '#fff', border: `3px solid ${k > 0.02 ? bg : T.c.line}`, display: 'grid', placeItems: 'center', transform: `scale(${0.7 + 0.3 * Math.min(1.15, k)})`, boxSizing: 'border-box', flex: 'none' }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" strokeDasharray={24} strokeDashoffset={24 * (1 - Math.min(1, k))} /></svg>
  </div>
);
export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile('icon.svg')} style={{ width: size, height: size, borderRadius: size * 0.24, display: 'block', ...style }} />
);
export const WaIcon: React.FC<{ size: number; color?: string }> = ({ size, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
);
export const typed = (txt: string, f: number, start: number, per = 2) => txt.slice(0, Math.max(0, Math.min(txt.length, Math.floor((f - start) / per))));
export const Caret: React.FC<{ on: boolean }> = ({ on }) => {
  const f = useCurrentFrame();
  return on ? <span style={{ display: 'inline-block', width: 3, height: '1.05em', background: T.c.green3, marginLeft: 2, verticalAlign: '-0.15em', opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} /> : null;
};
