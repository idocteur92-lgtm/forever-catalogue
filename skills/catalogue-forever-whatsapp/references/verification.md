# Vérifications avant de dire « c'est en ligne »

## 1. Automatique
```bash
node <skill>/scripts/verifier.js https://<adresse> verif
```
Attendu : `"ok": true`, `"http": 200`, `"csp": "oui"`, `"produits": 81`, `"erreurs": []`, liens WhatsApp = le bon numéro,
indicatif du formulaire = `+<indicatif>`. **Regarde les 7 captures** (couleurs, logo, nom, textes lisibles, rien de coupé).
Dans Compte, l'écran doit proposer « Se connecter / Créer un compte » (et plus « Connexion impossible »).

## 2. En-têtes de sécurité
```bash
curl -sI https://<adresse> | grep -iE "content-security|strict-transport|x-frame"
curl -s -o /dev/null -w "%{http_code}\n" https://<adresse>/CLAUDE.md      # 404 attendu
curl -s -o /dev/null -w "%{http_code}\n" https://<adresse>/client.json    # 404 attendu
```

## 3. Aperçu WhatsApp
```bash
curl -s https://<adresse>/p/715 | grep -o 'og:image" content="[^"]*'     # photo du produit
curl -s https://<adresse>/ | grep -o 'og:image" content="[^"]*'          # https://<adresse>/img/og-cover.jpg
```

## 4. Compte administrateur (fait par la personne)
« Ouvrez le site → onglet **Compte** → **Créer un compte** avec votre numéro WhatsApp <numéro> et un mot de passe. »
Elle doit voir le bouton **Espace administrateur**. Sinon : voir `supabase.md` §5.

## 5. Commande d'essai (avec l'accord de la personne)
Sur son téléphone : ajouter un produit → Commander → nom « TEST Claude » → **Envoyer sur WhatsApp**.
Attendu : WhatsApp s'ouvre vers **son** numéro avec le message et le lien du bon ; la commande apparaît dans l'espace admin.
Puis supprime la commande de test (`supabase.md` §6).

## 6. Rapport à la personne (court)
```
✅ Site en ligne : https://…
✅ 81 produits, vos couleurs, votre logo, commandes vers +…
✅ Sécurité : en-têtes OK, base protégée (RLS)
👉 À faire de votre côté : créer votre compte admin avec votre numéro, activer la double authentification (GitHub, Vercel, Supabase)
```
Joins un QR code du lien (PNG), par ex. :
```bash
python3 -c "import qrcode; qrcode.make('https://<adresse>').save('qr-catalogue.png')"   # pip install qrcode
```
