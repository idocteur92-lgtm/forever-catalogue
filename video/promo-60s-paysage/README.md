# Vidéo promo 60 s, paysage 16:9 (style Finqube)

Texte cinétique, téléphone 3D avec zooms de caméra sur chaque section, voix off Elisa calée mot par mot.
- Scènes et textes : `src/scenes.tsx` · téléphone, écrans et caméra : `src/phone.tsx` · sons : `python3 gen_audio.py`
- Captures de l application : `node shoot.js` (puis recréer les bandes `_top` / `_nav`, voir historique)
- Voix : `ffmpeg -i public/voix-off-elisa-60s.mp3 -af adelay=250|250 public/voice.wav`
- Rendu : `npx remotion render src/Video.tsx Promo out/promo.mp4 --codec h264 --crf 17`
