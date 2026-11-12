// Réglages de la vidéo : tous les textes et les temps sont ici (30 images = 1 seconde).
// 120 BPM : un temps = 15 images, une mesure = 60 images. Les changements de scène tombent sur la mesure.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const SCENES = {
  intro: { from: 0, dur: 120 },      // 0–4 s   accroche
  catalogue: { from: 120, dur: 210 }, // 4–11 s  le catalogue
  besoins: { from: 330, dur: 120 },   // 11–15 s recherche par besoin
  commande: { from: 450, dur: 330 },  // 15–26 s comment commander (3 étapes)
  fin: { from: 780, dur: 120 },       // 26–30 s logo, QR code, WhatsApp
};
export const TOTAL = 900;

export const TXT = {
  hook1: 'Votre santé',
  hook2: ['mérite', 'le'],
  hookHero: 'meilleur.',
  hookSub: 'Catalogue Forever 2025 · Niamey',
  catTitle: 'Tout le catalogue',
  catTitle2: 'Forever',
  catTitle3: 'dans votre téléphone',
  stats: [
    { n: 81, label: 'produits' },
    { n: 25, label: 'besoins santé' },
    { n: 0, label: 'Prix en F CFA' },
  ],
  besoinTitle: 'Cherchez par',
  besoinHero: 'besoin',
  besoins: ['Prostate', 'Surpoids', 'Digestion', 'Articulations', 'Fatigue'],
  cmdTitle: 'Commander ?',
  cmdHero: 'Simple.',
  steps: ['Choisissez vos produits', 'Remplissez vos infos', 'Envoyez sur WhatsApp'],
  stepShort: ['Choisir', 'Remplir', 'Envoyer'],
  waName: 'Objectif Santé Durable',
  waMsg: 'Bonjour ! Voici ma commande N° 1024',
  waTotal: '76 000 F CFA',
  waReply: 'Merci ! Votre commande est bien reçue.',
  brand: 'Objectif Santé Durable',
  brandSub: 'Catalogue Forever 2025',
  scan: 'Scannez le catalogue',
  phone: '+227 70 29 09 81',
  url: 'forever-catalogue-eight.vercel.app',
};
