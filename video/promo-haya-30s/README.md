# Vidéo promo 30 s, style « Haya »

Texte qui sort du flou mot par mot, une carte de l application au centre, fondus flous, effets sonores discrets.
Script et minutage : `src/timeline.ts`. Cartes : `src/cards.tsx`. Sons : `python3 gen_audio.py`.
Voix off : mettre `public/voice.mp3` puis `VOICE = true` dans `src/Video.tsx`, et recaler les temps des mots.

Rendu : `npx remotion render src/index.tsx Promo out/promo.mp4 --codec h264 --crf 17`
