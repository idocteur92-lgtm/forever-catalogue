# Objectif Santé Durable · Catalogue Forever

Application web (mobile) du catalogue Forever Living 2025 : produits, prix en F CFA, conseils par besoin,
commande sur WhatsApp, comptes clients et espace administrateur (Supabase).

- `products.js` : produits, prix, catégories et besoins
- `config.js` : numéro WhatsApp, adresse du site, clés publiques Supabase
- `node gen-pages.js https://adresse-du-site` : génère les pages `p/<id>.html` (aperçu photo dans WhatsApp)

Site statique : aucune compilation, Vercel le publie tel quel.
