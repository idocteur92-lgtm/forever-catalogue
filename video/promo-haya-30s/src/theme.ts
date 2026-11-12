import { Easing, continueRender, delayRender, staticFile } from 'remotion';
import FONTS from './fonts.json';

const h = delayRender('polices');
Promise.all(FONTS.map((x) => {
  const ff = new FontFace(x.family, `url(${staticFile('fonts/' + x.file)}) format('woff2')`, { style: x.style, weight: x.weight, unicodeRange: x.range });
  return ff.load().then((l) => { document.fonts.add(l); });
})).then(() => continueRender(h)).catch(() => continueRender(h));

export const T = {
  c: {
    bg: '#F4F3EF',        // blanc cassé (fond principal, comme la référence)
    ink: '#14231B',       // texte : presque noir, teinté vert
    accent: '#D08A0C',    // mots en couleur : or ambré (lisible sur fond clair)
    gold: '#E8B31A',
    goldSoft: '#FFF4D1',
    green: '#16402F', green2: '#1F5A41', green3: '#2E7A57', leaf: '#8FD19E', mint: '#DDF1E2',
    cream: '#F6F2E8', sand: '#ECE5D3', line: '#E7E1D2', muted: '#6B746E', card: '#FFFFFF',
    wa: '#25D366', waDark: '#0B7A6C', waBubble: '#D9FDD3', waBg: '#EFE7DC', tickBlue: '#34B7F1',
    night: '#0E2A1E',     // fond de fin
  },
  f: { title: "'Fraunces', Georgia, serif", sans: "'Manrope', system-ui, sans-serif" },
  e: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    soft: Easing.bezier(0.33, 1, 0.68, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    in: Easing.bezier(0.55, 0, 0.75, 0.2),
  },
  s: {
    card: { damping: 22, stiffness: 120, mass: 1 },
    pop: { damping: 13, stiffness: 190, mass: 0.6 },
    soft: { damping: 26, stiffness: 90, mass: 1 },
  },
  shadow: '0 60px 120px -40px rgba(20,45,32,0.38), 0 18px 40px -18px rgba(20,45,32,0.18), 0 0 0 1px rgba(20,45,32,0.04)',
} as const;
