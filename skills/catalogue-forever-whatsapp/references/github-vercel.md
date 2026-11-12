# GitHub puis Vercel : du code au lien en ligne

## A. Dépôt GitHub
1. Si le dépôt n'existe pas encore : crée-le avec l'outil GitHub disponible (`create_repository`, `gh repo create catalogue-<nom> --private`),
   sinon demande à la personne de le créer **vide** (voir `connexions.md`).
2. Clone-le (ou utilise celui de la session) ; tu travailles sur `main`, sauf si l'environnement impose une autre branche
   (dans ce cas, pousse sur cette branche puis demande l'autorisation de pousser sur `main`, car Vercel publie `main`).
3. Génère la plateforme dedans : `python3 <skill>/scripts/personnaliser.py client.json <dossier-du-dépôt>`.
4. Range `client.json` à la racine et le logo d'origine dans `sources/` (ils sont conservés quand on relance le script et ne sont pas publiés sur le site) ; **jamais** de clé secrète.
5. Premier commit : « Plateforme catalogue Forever – <marque> », puis `git push -u origin main`.

## B. Projet Vercel
**Avec le connecteur Vercel :** regarde ce qu'il permet (lister les projets, créer/déployer, lire les déploiements).
S'il ne permet pas d'importer un dépôt GitHub, utilise la voie manuelle ci-dessous puis suis le déploiement avec ses outils.

**Voie manuelle (2 minutes, faite par la personne) :**
1. Ouvrez **vercel.com/new**.
2. À côté du dépôt `catalogue-<nom>`, cliquez **Import**.
3. Project Name : `<nom>` (le lien sera `https://<nom>.vercel.app`). Framework : **Other**. Ne touchez à rien d'autre.
4. Cliquez **Deploy**, attendez « Congratulations », et envoyez-moi le lien affiché.

Ensuite, **chaque `git push` sur `main` redéploie automatiquement** (≈ 30 s).

## C. Après le premier déploiement
1. Adresse réelle ≠ adresse prévue ? Mets-la dans `client.json` (`site`), relance `personnaliser.py`,
   redéploie la fonction Supabase `compte`.
2. Pages de partage avec photo : `node gen-pages.js https://<adresse>` (écrit `p/*.html`, `SITE_URL` et l'image d'aperçu).
3. Commit « Adresse du site et pages de partage », push. Attends le redéploiement (`curl -sI https://<adresse> | grep -i age` → `age: 0`).

## D. Nom de domaine personnalisé (facultatif)
Vercel → projet → Settings → Domains → ajouter `www.sa-marque.com` et suivre les instructions DNS.
Puis mets la nouvelle adresse dans `client.json` → relance le script → redéploie `compte` → `gen-pages.js` → push.

## E. Fichiers non publiés
Le modèle fournit un `.vercelignore` : `CLAUDE.md`, `client.json`, `sources/`, `supabase/` restent dans GitHub mais ne sont pas servis sur le site.
