// Script + minutage (en secondes). Chaque mot apparaît à son temps « t », comme sous-titré par la voix.
// « * » devant un mot = mot en couleur. « / » = retour à la ligne.
// Quand la voix off ElevenLabs est prête : remplacer les temps par ceux de la voix (voir sync-voice.mjs).
export const FPS = 30;
export const TOTAL_S = 28;
export const OFFSET = 0.15;        // la voix démarre à 0,15 s
const v = (x: number) => +(x + OFFSET).toFixed(3);
export const FIN_START = v(19.78);  // « Objectif Santé Durable » final : fond vert + logo
export const CTA_T = v(23.0);       // QR code + WhatsApp

export type Phrase = { id: string; start: number; end: number; text: string; times?: number[] };

// accroche : gros mots, un par écran
export const HOOK = [
  { text: 'Fatigue', q: '?', t: v(0.0) },
  { text: 'Kilos en trop', q: '?', t: v(0.74) },
  { text: 'Digestion difficile', q: '?', t: v(1.68) },
];
export const HOOK_END = v(2.95);

export const PHRASES: Phrase[] = [
  { id: 'accueil', start: v(3.24), end: v(7.3), text: 'Sur *Objectif *Santé *Durable, / tout le catalogue Forever / tient dans votre téléphone.', times: [3.24, 3.36, 3.98, 4.26, 4.96, 5.02, 5.16, 5.58, 5.86, 6.3, 6.42, 6.62].map(v) },
  { id: 'produit', start: v(7.44), end: v(11.45), text: '*81 produits, / avec les prix, les *bienfaits / et les conseils d\'utilisation.', times: [7.44, 7.86, 8.24, 8.68, 8.88, 9.4, 9.48, 10.08, 10.14, 10.26, 10.6].map(v) },
  { id: 'besoins', start: v(11.58), end: v(15.0), text: 'Cherchez par besoin : / *prostate, *articulations, / *minceur…', times: [11.58, 11.86, 12.02, 12.3, 12.6, 13.28, 14.26].map(v) },
  { id: 'commande', start: v(15.08), end: v(17.12), text: 'Ajoutez au *panier, / remplissez vos *infos,', times: [15.08, 15.4, 15.54, 16.16, 16.56, 16.72].map(v) },
  { id: 'whatsapp', start: v(17.14), end: v(19.72), text: 'et votre bon de commande / part directement / sur *WhatsApp.', times: [17.14, 17.32, 17.54, 17.64, 17.74, 18.24, 18.36, 18.8, 19.1].map(v) },
  { id: 'fin', start: v(21.26), end: 28, text: 'Votre santé, / notre *objectif.', times: [21.26, 21.62, 22.34, 22.46].map(v) },
];

// répartit les mots d'une phrase entre start et (end - pause), au prorata de leur longueur (≈ débit de la voix)
export const wordTimes = (p: Phrase) => {
  const words = p.text.split(' ').filter((w) => w !== '/');
  if (p.times) return p.times;
  const speakEnd = p.start + (p.end - p.start) * (p.id === 'fin' ? 0.32 : 0.82);
  const w8 = words.map((w) => 0.22 + w.replace(/[*,.:…']/g, '').length * 0.045 + (/[,.:…]$/.test(w) ? 0.12 : 0));
  const sum = w8.reduce((a, b) => a + b, 0);
  let acc = p.start; const out: number[] = [];
  for (const k of w8) { out.push(acc); acc += (k / sum) * (speakEnd - p.start); }
  return out;
};
export const find = (id: string) => PHRASES.find((p) => p.id === id)!;
// temps (s) où un mot donné est prononcé dans une phrase
export const at = (id: string, word: string) => {
  const p = find(id); const words = p.text.split(' ').filter((w) => w !== '/');
  const i = words.findIndex((w) => w.replace(/[*,.:…]/g, '').toLowerCase().startsWith(word.toLowerCase()));
  return wordTimes(p)[Math.max(0, i)];
};
