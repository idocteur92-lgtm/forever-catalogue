---
name: catalogue-forever-whatsapp
description: Crée de A à Z, pour une personne qui vend les produits Forever Living, sa propre plateforme web mobile (PWA) « catalogue Forever + commande sur WhatsApp » — 81 produits avec photos, prix en F CFA, bienfaits, conseils, recherche par besoin de santé, panier, bon de commande en image envoyé sur WhatsApp, comptes clients par téléphone, espace administrateur — personnalisée à son nom, son logo, ses couleurs et son numéro WhatsApp, puis mise en ligne sur GitHub + Vercel + Supabase. À utiliser dès qu'on demande un catalogue Forever, un site/une application de commande WhatsApp pour un distributeur Forever, ou de « refaire la plateforme Objectif Santé Durable pour quelqu'un d'autre ».
---

# Catalogue Forever + commande WhatsApp — plateforme clé en main

Ce skill reproduit, pour une nouvelle personne, la plateforme **Objectif Santé Durable** (en ligne et éprouvée) :
SPA en JavaScript sans framework, hébergée sur **Vercel** (gratuit), code sur **GitHub**, comptes et commandes sur **Supabase** (gratuit).
Tout est dans `template/` ; `scripts/personnaliser.py` fabrique la version de la personne en une commande.

**Parle français, simplement, en phrases courtes : la personne travaille souvent depuis son téléphone et n'est pas développeuse.**
Fais le travail toi-même ; ne lui demande que ce qu'elle seule peut faire (se connecter à un service, choisir, donner son logo).

## Ce qu'obtient la personne
- Un lien `https://<nom>.vercel.app` à partager (et un QR code), installable comme une application.
- Les commandes arrivent sur **son** WhatsApp avec un bon de commande en image ; elles sont aussi enregistrées.
- Un espace admin (connectée avec son numéro) : commandes, statuts, clients (bloquer, supprimer, mot de passe).

## Déroulé (suis les étapes dans l'ordre, coche-les dans une liste de tâches)

### Étape 0 — Annoncer le plan
En 5 lignes : ce qu'on va construire, les 3 comptes gratuits nécessaires (GitHub, Vercel, Supabase), les questions à venir, la durée (~30 min).
Environnement conseillé : **Claude Code** (claude.ai/code, l'application ou le terminal), car il faut écrire des fichiers et pousser du code.
Dans une simple conversation sans exécution de code, explique-le et propose de continuer dans Claude Code.

### Étape 1 — Connexions (une à une, vérifie chacune avant de passer à la suivante)
Lis `references/connexions.md`. Pour chaque service, **teste d'abord si l'accès existe déjà** (outil disponible, commande qui répond) ;
s'il manque, donne à la personne les étapes exactes, puis attends sa confirmation et reteste.
1. **GitHub** : pouvoir créer/pousser dans un dépôt.
2. **Vercel** : compte créé avec « Continue with GitHub », et connecteur Vercel relié à Claude si disponible.
3. **Supabase** : compte créé (« Continue with GitHub ») et connecteur Supabase relié à Claude.
Ne demande **jamais** de mot de passe ni de jeton dans la conversation. Un jeton se met dans les secrets de l'environnement
(outil `request_credential` s'il existe) ou dans la commande de la personne elle-même.

### Étape 2 — Questions de personnalisation
Lis `references/questions.md` et pose les questions (outil de questions à choix si disponible, sinon une courte liste numérotée).
Indispensables : nom de la marque, ville, pays (→ indicatif), **numéro WhatsApp qui reçoit les commandes** (il devient aussi l'administrateur),
logo (image, facultatif), couleurs (palette proposée ou deux codes), nom du lien (`<nom>.vercel.app`).
Répète le récapitulatif et fais-le valider **avant** de créer quoi que ce soit.

### Étape 3 — Base de données Supabase
Lis `references/supabase.md`. Crée (ou choisis) un projet **dédié à cette personne**, applique `template/supabase/schema.sql`
**après personnalisation** (étape 5, fichier `supabase/schema.sql` du dossier généré), déploie la fonction `compte`,
récupère l'URL (référence du projet) et la clé **publishable**.
Ordre pratique : crée le projet ici, note la référence et la clé, puis fais l'étape 5 avant d'appliquer le schéma et la fonction.

### Étape 4 — Dépôt GitHub
Lis `references/github-vercel.md` (partie GitHub). Dépôt nommé comme le lien (ex. `catalogue-bien-etre`), branche `main`.

### Étape 5 — Fabriquer la plateforme
1. Écris `client.json` (modèle : `python3 scripts/personnaliser.py --exemple`) avec les réponses de l'étape 2 et les infos Supabase.
2. `python3 scripts/personnaliser.py client.json <dossier-du-dépôt>` (Pillow requis ; `pip install pillow numpy` si besoin).
   Le script refuse de finir s'il reste un marqueur `__XXX__` ou si le numéro ne correspond pas à l'indicatif.
3. Applique le schéma SQL et déploie la fonction `compte` (fichiers du dossier généré, voir `references/supabase.md`).
4. Vérifie en local : `python3 -m http.server 8080` dans le dossier, puis `node scripts/verifier.js http://localhost:8080 verif`
   (Playwright). Regarde les captures toi-même (couleurs, logo, nom, indicatif +XXX dans le formulaire). « Connexion impossible » dans
   Compte est normal tant que le site n'est pas en ligne (la sécurité Supabase n'autorise que l'adresse du site).
5. Écris un `CLAUDE.md` à la racine du dépôt (modèle : `references/claude-md-client.md`).

### Étape 6 — Mise en ligne
Lis `references/github-vercel.md` (partie Vercel). Pousse sur `main`, importe le dépôt dans Vercel (une seule fois), attends le déploiement.
Puis, avec l'adresse **réelle** donnée par Vercel :
- si elle diffère de celle prévue : corrige `site` dans `client.json`, relance `personnaliser.py`, redéploie la fonction `compte` ;
- `node gen-pages.js https://<adresse>` (pages de partage produit avec photo) ; commit + push (Vercel redéploie seul).

### Étape 7 — Vérifications en ligne (obligatoires, ne dis jamais « c'est bon » sans les avoir faites)
Lis `references/verification.md`. Résumé : `node scripts/verifier.js https://<adresse> verif` doit finir avec `"ok": true`,
la politique CSP doit être présente, aucune erreur JS, les liens WhatsApp vont au bon numéro ; regarde les captures.
Ensuite **la personne** crée son compte avec son numéro WhatsApp dans l'onglet Compte : elle doit voir « Espace administrateur ».
Avec son accord, une commande d'essai de bout en bout (puis suppression de la ligne de test).

### Étape 8 — Remise
Donne : le lien, un QR code (PNG) du lien, 5 lignes de mode d'emploi admin, ce qu'il faut faire pour changer un prix
(`products.js`) ou le numéro (`client.json` + relancer le script). Rappelle la sécurité : double authentification sur GitHub,
Vercel et Supabase ; ne jamais partager la clé `service_role`.

## Règles importantes
- **Une plateforme = un projet Supabase + un dépôt + un projet Vercel**, propres à la personne. Ne réutilise jamais ceux d'un autre client.
- La clé **publishable** (`sb_publishable_…`) va dans `config.js` (publique par nature, protégée par RLS). La clé **service_role**
  ne doit jamais apparaître dans le dépôt ni dans la conversation (la fonction `compte` la reçoit automatiquement de Supabase).
- **CSP** (`vercel.json`) : toute nouvelle source externe (image, script, API) doit y être ajoutée, sinon le navigateur la bloque.
- **Prix** : `products.js` contient les prix clients conseillés du **catalogue Forever 2025 (Côte d'Ivoire, F CFA)**. Demande si les prix
  du pays de la personne sont les mêmes ; sinon, modifie les prix concernés avant la mise en ligne (champ `price`, et `prices` pour les variantes).
- **Coûts** : Supabase gratuit (le projet se met en pause après ~1 semaine sans aucune visite ; il suffit de le relancer depuis
  le tableau de bord). Vercel « Hobby » est gratuit mais prévu pour un usage non commercial : pour une activité commerciale importante,
  signale l'offre Pro à la personne, sans bloquer.
- Pour modifier l'application plus tard : modifie les fichiers du dépôt du client (pas le modèle), commit, push → Vercel redéploie.
- Les textes médicaux restent prudents (compléments alimentaires, pas des médicaments) : ne les rends pas plus affirmatifs.

## Fichiers du skill
- `template/` : l'application complète avec des marqueurs `__XXX__` (ne pas modifier à la main ; fabriqué par `build_skill.py` dans le dépôt d'origine).
- `scripts/personnaliser.py` : marqueurs → valeurs, couleurs (toute la palette suit les 2 couleurs choisies), logo, icônes, image de partage.
- `scripts/verifier.js` : contrôle automatique sur écran de téléphone + captures.
- `references/` : connexions, questions, Supabase, GitHub/Vercel, vérification, modèle de CLAUDE.md client.
- `assets/Manrope.ttf` : police de l'image de partage.
