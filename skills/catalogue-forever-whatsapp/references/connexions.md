# Connexions : GitHub, Vercel, Supabase

Principe : **teste d'abord, demande ensuite.** Pour chaque service, regarde si l'accès existe déjà.
S'il manque, donne à la personne les étapes ci-dessous (courtes, numérotées), attends qu'elle dise « c'est fait », puis reteste.
Ne demande jamais un mot de passe ou un jeton dans la conversation.

Les trois comptes se créent le plus simplement avec **« Continue with GitHub »** : un seul identifiant pour tout.

## 1. GitHub

**Tester** (dans l'ordre, le premier qui marche suffit) :
- outils `mcp__github__*` présents → appeler `get_me` ;
- `git ls-remote https://github.com/<compte>/<dépôt>` ou `gh auth status` ;
- en session Claude Code dans le cloud : le dépôt de la session est déjà cloné et `git push` fonctionne.

**Si ça manque — à dire à la personne :**
1. Créez un compte gratuit sur **github.com** (si ce n'est pas déjà fait) et activez la double authentification.
2. Créez un dépôt **vide** : bouton « New repository », nom `catalogue-<votre-nom>`, Private ou Public, sans README.
3. Sur claude.ai : **Paramètres → Connecteurs → GitHub → Connecter**, puis installez l'application **Claude** sur GitHub
   (github.com/apps/claude → Install → choisissez le dépôt créé). Donnez l'accès **en écriture**.
4. Démarrez (ou redémarrez) une session **Claude Code** en sélectionnant ce dépôt : il sera cloné et on pourra y pousser.
   - Dans Claude Code sur ordinateur : `gh auth login` dans le terminal suffit.

Si la session a un outil pour ajouter un dépôt (ex. `add_repo`), utilise-le avec l'accès « push » au lieu de faire redémarrer.

## 2. Vercel

**Tester** : outils Vercel présents (connecteur Vercel : lister les projets/équipes) ou commande `vercel whoami` (avec un jeton déjà configuré).

**Si ça manque — à dire à la personne :**
1. Allez sur **vercel.com/signup** → **Continue with GitHub** (offre Hobby, gratuite).
2. Autorisez Vercel à voir le dépôt `catalogue-…` (pendant l'inscription ou dans GitHub → Settings → Applications → Vercel).
3. Pour que je suive les déploiements : sur claude.ai, **Paramètres → Connecteurs → Vercel → Connecter** (si le connecteur est proposé).

Sans connecteur Vercel, tout reste possible : la personne importe le dépôt elle-même (2 clics, voir `github-vercel.md`)
et te donne l'adresse affichée ; tu vérifies le site avec `curl` et `verifier.js`.
Option avancée : un jeton Vercel (vercel.com/account/tokens) enregistré **comme secret de l'environnement**, jamais collé dans la conversation.

## 3. Supabase

**Tester** : outils `mcp__Supabase__*` (ou nom proche) présents → `list_organizations` / `list_projects`.

**Si ça manque — à dire à la personne :**
1. Allez sur **supabase.com** → **Start your project** → **Continue with GitHub** (offre Free).
2. Sur claude.ai : **Paramètres → Connecteurs → Supabase → Connecter**, autorisez l'organisation.
3. Revenez ici (une nouvelle session peut être nécessaire pour que le connecteur soit chargé).

Sans connecteur Supabase : la personne crée le projet sur supabase.com, puis colle elle-même `supabase/schema.sql` dans
**SQL Editor → New query → Run**, et la fonction se déploie avec la CLI (`supabase functions deploy compte --no-verify-jwt`).
C'est plus long : préfère le connecteur.

## Récapitulatif à afficher quand tout est prêt
```
✅ GitHub  : dépôt <compte>/catalogue-<nom> (écriture OK)
✅ Vercel  : compte relié à GitHub
✅ Supabase : organisation <nom> accessible
```
