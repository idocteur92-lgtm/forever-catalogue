// Script + minutage (en secondes). Chaque mot apparaît à son temps « t », comme sous-titré par la voix.
// « * » devant un mot = mot en couleur. « / » = retour à la ligne.
// Quand la voix off ElevenLabs est prête : remplacer les temps par ceux de la voix (voir sync-voice.mjs).
export const FPS = 30;
export const TOTAL_S = 30;

export type Phrase = { id: string; start: number; end: number; text: string; times?: number[] };

// accroche : gros mots, un par écran
export const HOOK = [
  { text: 'Fatigue', q: '?', t: 0.1 },
  { text: 'Kilos en trop', q: '?', t: 1.0 },
  { text: 'Digestion difficile', q: '?', t: 1.9 },
];
export const HOOK_END = 3.0;

export const PHRASES: Phrase[] = [
  { id: 'accueil', start: 3.4, end: 8.4, text: 'Sur *Objectif *Santé *Durable, / tout le catalogue Forever / tient dans votre téléphone.' },
  { id: 'produit', start: 8.5, end: 12.9, text: '*81 produits, / avec les prix, les *bienfaits / et les conseils d\'utilisation.' },
  { id: 'besoins', start: 13.0, end: 16.4, text: 'Cherchez par besoin : / *prostate, *articulations, / *minceur…' },
  { id: 'commande', start: 16.5, end: 19.0, text: 'Ajoutez au *panier, / remplissez vos *infos,' },
  { id: 'whatsapp', start: 19.0, end: 23.2, text: 'et votre bon de commande / part directement / sur *WhatsApp.' },
  { id: 'fin', start: 23.5, end: 30, text: 'Votre santé, / notre *objectif.' },
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
