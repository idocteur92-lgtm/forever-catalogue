# CLAUDE.md — Objectif Santé Durable (catalogue Forever)

Contexte transmis depuis une conversation Claude (messagerie) pour continuer le travail dans Claude Code.
Langue de travail : **français**. L'utilisateur s'appelle **Ange** (Niamey, Niger). Il travaille souvent depuis son téléphone.

## Première chose à faire dans la nouvelle session

1. Lire ce fichier en entier.
2. Donner à Ange, étape par étape et simplement, la marche à suivre pour que cette session Code soit connectée à son dépôt GitHub
   `idocteur92-lgtm/forever-catalogue` (autorisation GitHub, sélection du dépôt, droits en écriture pour pouvoir pousser).
3. Vérifier ensuite l'accès : cloner le dépôt, `git log --oneline | head` (dernier commit attendu : `d964c70`).
4. Proposer d'ajouter ce CLAUDE.md à la racine du dépôt (commit) pour que chaque future session le retrouve.

## Le projet

Application web mobile (PWA) publique qui présente le catalogue **Forever Living Products** (Côte d'Ivoire, Catalogue 2025)
pour l'activité « Santé Bio Énergie » d'Ange, rebaptisée **Objectif Santé Durable**.

- 81 produits, prix en F CFA (les colonnes CC du catalogue PDF ont été retirées).
- Pour chaque produit : vraie photo, bienfaits, conseils d'utilisation, problèmes de santé concernés.
- Catégories par type (compléments, cosmétique, diététique / minceur, etc.) **et par besoin** (prostate, surpoids/obésité, digestion, articulations…).
- **Pas de paiement en ligne** : la commande part sur **WhatsApp** avec un bon de commande en image.
- Priorité absolue : design et UX sur téléphone. Rester sobre en coûts (pas d'infra lourde).

## Liens

- Site en ligne : https://forever-catalogue-eight.vercel.app
- Dépôt : https://github.com/idocteur92-lgtm/forever-catalogue (branche `main`, Vercel déploie automatiquement à chaque push)
- Vercel : projet `forever-catalogue` sur le compte d'Ange.
- Supabase : projet `xnmebwxxukrhnoiynalg` (https://xnmebwxxukrhnoiynalg.supabase.co)
- WhatsApp de réception des commandes : **+227 70 29 09 81** (`22770290981`)

## Structure du dépôt

- `index.html`, `app.css`, `app.js` : SPA en JavaScript vanilla, routage par hash (`#/…`).
- `config.js` : constantes publiques
  - `WHATSAPP: '22770290981'`, `BRAND: 'Objectif Santé Durable'`, `SITE_URL`
  - `SUPABASE_URL`, `SUPABASE_KEY` (clé **publishable**, publique par nature)
  - `ACCOUNT_DOMAIN: 'clients.santebioenergie.app'`
- `products.js` : les 81 produits (nom, prix, catégories, besoins, bienfaits, usage, image).
- `img/` : photos produits. `icon.svg`, `manifest.webmanifest` : PWA.
- `vendor/supabase.js` : client Supabase embarqué (pas de CDN, à cause de la CSP).
- `gen-pages.js` → génère `p/*.html` : une page statique par produit avec balises Open Graph (aperçu photo dans WhatsApp).
- `api/bon.js` : fonction serverless Vercel ; `/b/:id` est réécrit vers `/api/bon?id=:id` et sert l'aperçu (photo du bon de commande) quand le lien est partagé sur WhatsApp.
- `vercel.json` : `cleanUrls`, en-têtes de sécurité (CSP stricte, HSTS, X-Frame-Options DENY…), réécriture `/b/:id`.
  Toute nouvelle source externe (images, scripts, API) doit être ajoutée à la CSP, sinon elle sera bloquée.

## Fonctionnement des commandes

- Panier → formulaire (nom, téléphone, quartier, livraison ou retrait, note).
- Un **seul bouton WhatsApp** : le bon de commande est généré en image (canvas), envoyé dans le bucket Storage `bons`,
  puis WhatsApp s'ouvre directement vers le numéro avec un texte soigné et le lien `/b/<id>` (aperçu = photo du bon).
- La commande est aussi enregistrée dans la table `orders` (clients connectés **et** visiteurs).

## Comptes et administration (Supabase)

- Connexion client par **téléphone + mot de passe**. Techniquement : e-mail fictif `{téléphone}@clients.santebioenergie.app`.
- Tables :
  - `profiles` (avec `blocked`, `is_admin`)
  - `orders` (`user_id` nullable pour les visiteurs, `bon_url`, contraintes CHECK contre l'injection HTML)
  - `signup_attempts`, `order_attempts` (anti-abus / limitation)
- RLS activé partout ; droits limités par colonne (un client ne peut pas se donner `is_admin` ni changer le numéro WhatsApp de réception).
- Edge function **`compte`** (v3), actions : `signup`, `guest_order`, `list_clients`, `reset_password`, `block`, `unblock`, `delete_client`.
  ⚠️ Son code source n'est **pas** dans le dépôt : il est seulement déployé sur Supabase. Le récupérer (Supabase CLI/MCP) et l'ajouter
  dans `supabase/functions/compte/` serait une bonne amélioration.
- Admin = le compte du numéro **22770290981**. Espace admin dans l'app : commandes (y compris visiteurs) et onglet **Clients**
  (bloquer / débloquer, supprimer, réinitialiser le mot de passe).
- Ne jamais écrire de mot de passe dans le dépôt ni dans ce fichier. Ange doit changer le mot de passe admin temporaire s'il ne l'a pas encore fait.

## Ce qui a été fait (historique)

1. Extraction du catalogue PDF, recherche des produits, images, bienfaits, catégories par besoin.
2. Message WhatsApp amélioré avec image du produit ; pages de partage avec aperçu photo.
3. Comptes clients + espace admin ; nouveau nom « Objectif Santé Durable ».
4. Bon de commande en image envoyé en un clic sur WhatsApp.
5. Audit sécurité + UX (en-têtes, assainissement, validation du panier, profil modifiable). Conclusion : le numéro de réception ne peut pas être détourné par un client.
6. Admin : liste des clients (bloquer, supprimer, mot de passe) et commandes des visiteurs visibles.

## Vidéo promo (motion design 3D)

Deux vidéos de 60 s ont été livrées et validées : **16:9 (1920×1080)** et **9:16 (1080×1920)**.

- Technique : pages HTML + GSAP (caméra 3D en CSS `perspective` / `preserve-3d`, téléphones en volume, éléments qui sortent de l'écran),
  rendu image par image avec Playwright (Chrome headless) → ffmpeg (libx264, crf 18, 30 fps), une vidéo par scène puis concat.
- 7 scènes : accroche « Votre santé mérite le meilleur » → besoins (fatigue, digestion, kilos, articulations) + « La nature a des solutions »
  → logo + catalogue → 3 téléphones / +81 produits → recherche par besoin (Prostate) → comment commander (produit, Commander, formulaire,
  bon de commande qui tombe dans WhatsApp) → compte client, logo, QR codes (catalogue + WhatsApp), lien et numéro.
- Voix off : ElevenLabs, voix « Elisa – Dynamic French Commercial » (`rPVufKNutioPFV4by3r0`). Musique fournie par Ange, abaissée sous la voix.
- Détail technique retenu : un dégradé or (`background-clip:text`) doit être appliqué **à chaque lettre** quand le mot est animé lettre par lettre en 3D, sinon Chrome ne l'affiche pas.
- ⚠️ Les fichiers sources de la vidéo (pages `video3d.html` / `video3d_v.html`, script de rendu, captures, sons) étaient dans l'espace de travail
  de la conversation précédente et **ne sont pas dans le dépôt**. Les vidéos finales ont été envoyées à Ange dans cette conversation.

## Idées de suite (à proposer, pas à faire sans accord)

- Ajouter le code de l'edge function `compte` et les migrations SQL au dépôt.
- Activer la double authentification sur GitHub et Vercel.
- Tester une commande visiteur et l'onglet Clients sur le site en ligne.

## Façon de travailler avec Ange

- Réponses en français, courtes, claires, lisibles sur téléphone.
- Faire le travail directement (commit + push → Vercel déploie), puis expliquer en quelques lignes ce qui a changé.
- Toujours vérifier soi-même le résultat (captures, tests) avant de dire que c'est bon.
