// Thème unique : couleurs de l'application Objectif Santé Durable.
import { Easing, continueRender, delayRender, staticFile } from 'remotion';
import FONTS from './fonts.json';

// Polices locales (public/fonts) : aucun téléchargement pendant le rendu.
const h = delayRender('polices');
Promise.all(FONTS.map((x) => {
  const ff = new FontFace(x.family, `url(${staticFile('fonts/' + x.file)}) format('woff2')`, { style: x.style, weight: x.weight, unicodeRange: x.range });
  return ff.load().then((l) => { document.fonts.add(l); });
})).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
const fr = { fontFamily: "'Fraunces', Georgia, serif" };
const mn = { fontFamily: "'Manrope', system-ui, sans-serif" };

export const theme = {
  colors: {
    bg: '#F6F2E8',      // crème
    sand: '#ECE5D3',
    green: '#16402F',   // vert profond (texte, boutons)
    green2: '#1F5A41',
    green3: '#2E7A57',
    leaf: '#8FD19E',
    mint: '#CFEBD6',
    gold: '#E8B31A',    // LA couleur héros : un seul élément par image
    goldSoft: '#FFF4D1',
    ink: '#1B241F',
    muted: '#66706A',
    card: '#FFFFFF',
    wa: '#25D366',
    waDark: '#128C7E',
    waBubble: '#D9FDD3',
    waBg: '#EFE7DC',
  },
  fonts: { display: fr.fontFamily, body: mn.fontFamily },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
  shadow: '0 50px 100px -30px rgba(22,64,47,0.45), 0 20px 40px -20px rgba(22,64,47,0.25)',
} as const;
