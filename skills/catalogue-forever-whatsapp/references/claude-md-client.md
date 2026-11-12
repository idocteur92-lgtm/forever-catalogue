# Modèle de CLAUDE.md pour le dépôt du client

Copie ce bloc dans `<dépôt>/CLAUDE.md`, remplace les `<…>`. Il permet à toute future session Claude de reprendre le travail.

```markdown
# CLAUDE.md — <Marque> (catalogue Forever + commande WhatsApp)

Langue : **français**, réponses courtes et claires (la personne travaille souvent depuis son téléphone).
Plateforme créée avec le skill `catalogue-forever-whatsapp`.

## Liens
- Site : https://<adresse>
- Dépôt : https://github.com/<compte>/<dépôt> (branche `main` ; Vercel déploie à chaque push)
- Supabase : projet `<ref>` (https://<ref>.supabase.co)
- WhatsApp des commandes (= administrateur) : <+XXX …> (`<numéro>`)

## Structure
- `index.html`, `app.css`, `app.js` : application (JavaScript sans framework, routage par `#`).
- `config.js` : réglages publics (marque, numéro, indicatif, Supabase URL + clé publishable).
- `products.js` : les 81 produits (prix en F CFA). `img/` : photos, icônes, image de partage.
- `gen-pages.js` → `p/*.html` (aperçu photo dans WhatsApp). `api/bon.js` : page du bon de commande (`/b/:id`).
- `vercel.json` : en-têtes de sécurité (CSP stricte : ajouter toute nouvelle source externe).
- `supabase/schema.sql`, `supabase/functions/compte/index.ts` : base de données et fonction serveur.
- `client.json` : réponses de personnalisation (relancer `personnaliser.py` du skill pour régénérer).

## Règles
- Jamais de mot de passe ni de clé `service_role` dans le dépôt.
- Toujours vérifier soi-même (captures, `verifier.js`) avant de dire que c'est bon.
- Après un changement d'adresse du site : redéployer la fonction `compte`, relancer `gen-pages.js`.
```
