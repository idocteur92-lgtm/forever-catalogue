# Vidéo promo 30 s — Objectif Santé Durable (format 9:16, 1080×1920)

Inspirée des 4 vidéos de référence : fonds pastel en dégradé, vrais écrans de l'application dans des
téléphones inclinés en 3D, texte tapé lettre par lettre, un seul mot en couleur, doigt qui appuie, logo à la fin.
Musique originale à 120 BPM (générée par `gen_audio.py`), coupes calées sur la mesure.

| Temps | Scène | À l'écran | Texte |
|---|---|---|---|
| 0–4 s | Accroche | Logo qui tourne et se pose, phrase tapée, mot doré | « Votre santé mérite le **meilleur.** » |
| 4–11 s | Le catalogue | Téléphone en 3D : accueil, puis catalogue ; éventail de 3 téléphones ; compteurs | « Tout le catalogue Forever dans votre téléphone » · 81 produits · 25 besoins santé · Prix en F CFA |
| 11–15 s | Par besoin | Écran « Par besoin », étiquettes qui flottent, le doigt choisit « Prostate » | « Cherchez par **besoin** » |
| 15–26 s | Commander | Étapes 1-2-3 : fiche produit → appui sur Commander ; formulaire rempli ; bon de commande qui arrive dans WhatsApp, réponse « Merci ! » | « Commander ? Simple. » · 1. Choisissez vos produits · 2. Remplissez vos infos · 3. Envoyez sur WhatsApp |
| 26–30 s | Fin | Logo, QR code du catalogue, bouton WhatsApp, adresse du site | Objectif Santé Durable · Scannez le catalogue · +227 70 29 09 81 |

Voix off prévue (pas encore enregistrée : crédits ElevenLabs / Pelikulart / Magnific épuisés) :
« Votre santé mérite le meilleur. Voici Objectif Santé Durable : tout le catalogue Forever, dans votre téléphone.
Quatre-vingt-un produits, avec leurs prix et leurs bienfaits. Cherchez simplement par besoin : prostate, kilos, digestion…
Commander ? C'est facile ! Choisissez vos produits, remplissez vos informations… et votre bon de commande part directement sur WhatsApp.
Objectif Santé Durable. Scannez, et commandez dès aujourd'hui ! »

## Refaire la vidéo
```bash
npm install
python3 gen_audio.py                      # musique + effets sonores
node shoot.js && node shoot2.js           # captures du site en ligne (+ bon de commande)
cp shots/*.png shots/bon.jpg public/shots/
npx remotion render src/index.tsx Promo out/promo.mp4 --codec h264 --crf 17 --browser-executable=<headless_shell>
ffmpeg -i out/promo.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=7 -c:a aac -b:a 256k -movflags +faststart out/final.mp4
```
Tous les textes et les temps : `src/settings.ts`. Couleurs et polices : `src/theme.ts`.
