# Supabase : base de données, comptes, commandes

Ce qu'il faut : un projet Supabase **neuf et dédié**, le schéma `supabase/schema.sql` appliqué, la fonction `compte` déployée.

## 1. Créer le projet (connecteur Supabase)
1. `list_organizations` → choisis l'organisation de la personne.
2. Vérifie le coût (outils `get_cost` / `confirm_cost` s'ils existent) : l'offre Free permet **2 projets actifs** par organisation.
   Si la limite est atteinte, dis-le à la personne (mettre en pause un ancien projet, ou passer à l'offre Pro) ; ne décide pas à sa place.
3. `create_project` : nom `catalogue-<nom>`, région la plus proche (Afrique de l'Ouest → `eu-west-1` ou `eu-central-1`).
   Attends que le statut soit **ACTIVE_HEALTHY** (`get_project`, toutes les ~15 s).
4. Récupère : la **référence** du projet (20 caractères, dans l'URL `https://<ref>.supabase.co`) → `supabase_ref`,
   et la clé **publishable** (`get_publishable_keys`, celle qui commence par `sb_publishable_`) → `supabase_key`.
   (Si seule une clé « anon » JWT existe, elle convient aussi.)

## 2. Appliquer le schéma (après `personnaliser.py`)
- Lis le fichier **généré** `<dépôt>/supabase/schema.sql` (il contient le domaine des comptes, le numéro admin et la référence du projet).
- `apply_migration` avec le nom `schema_catalogue` et tout le contenu du fichier.
- Contrôle :
  ```sql
  select tablename from pg_tables where schemaname = 'public';            -- profiles, orders, signup_attempts, order_attempts
  select id, public from storage.buckets where id = 'bons';                -- bons | true
  select policyname from pg_policies where schemaname in ('public','storage');  -- 6 règles
  ```
- Lance `get_advisors` (sécurité) : aucune alerte « RLS disabled » ne doit apparaître.

## 3. Déployer la fonction `compte`
- Fichier généré : `<dépôt>/supabase/functions/compte/index.ts`.
- `deploy_edge_function` : nom `compte`, fichier `index.ts`, **`verify_jwt: false`** (indispensable : l'inscription et les commandes
  des visiteurs se font sans être connecté ; la fonction vérifie elle-même le jeton pour les actions admin).
- Elle utilise automatiquement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (rien à configurer, ne copie jamais cette clé).
- **Redéploie-la** chaque fois que l'adresse du site change (la liste `ORIGINS` limite les sites autorisés).

## 4. Réglages Auth (tableau de bord, vérifier seulement)
- Authentication → Providers → **Email** : activé (les comptes utilisent une adresse technique `<numéro>@clients.<marque>.app`,
  validée automatiquement ; aucun e-mail n'est envoyé).
- Les inscriptions directes sont de toute façon refusées par la base (déclencheur `auto_confirm_phone_accounts`) :
  seules celles qui passent par la fonction `compte` (limite par adresse IP) sont acceptées.

## 5. Administrateur
Le compte dont le numéro est égal au WhatsApp de `client.json` devient administrateur **à sa création**.
La personne crée simplement son compte dans l'onglet **Compte** du site, avec ce numéro et un mot de passe (6 caractères minimum).
Si le compte existait avant un changement de numéro :
```sql
update public.profiles set is_admin = true where phone = '<numéro au format 225…>';
```

## 6. Supprimer une commande de test
```sql
delete from public.orders where customer_name = 'TEST Claude';
```
(Demande l'accord de la personne avant toute suppression.)

## Dépannage
- « Connexion impossible » dans Compte : URL/clé fausses dans `config.js`, projet en pause, ou CSP de `vercel.json` sans l'URL Supabase.
- Inscription refusée : fonction non déployée ou `verify_jwt` resté à `true` ; domaine différent entre `schema.sql` et `index.ts`
  (relancer `personnaliser.py` puis réappliquer).
- Bon de commande absent du message : bucket `bons` manquant ou règle `bons: depot` absente.
