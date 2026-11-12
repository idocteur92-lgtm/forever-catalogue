# Questions de personnalisation

Pose-les par petits groupes (2 à 4 à la fois), avec des choix quand c'est possible. Propose toujours une valeur par défaut.

## Groupe 1 — Identité
1. **Nom de la marque / de l'activité** (affiché partout, ex. « Bien-Être Naturel »). → `marque`
2. **Nom court** pour l'icône du téléphone (≤ 12 caractères conseillé, ex. « Bien-Être »). → `marque_courte`
3. **Ville** principale (ex. « Abidjan »). → `ville`
4. **Exemple de quartier** pour le formulaire (ex. « Cocody, Abidjan »). → `exemple_quartier`

## Groupe 2 — WhatsApp et pays
5. **Pays** → indicatif et nombre de chiffres d'un numéro local (`indicatif`, `chiffres_locaux`) :

| Pays | Indicatif | Chiffres locaux | Exemple d'affichage |
|---|---|---|---|
| Niger | 227 | 8 | +227 90 00 00 00 |
| Mali | 223 | 8 | +223 70 00 00 00 |
| Burkina Faso | 226 | 8 | +226 70 00 00 00 |
| Togo | 228 | 8 | +228 90 00 00 00 |
| Côte d'Ivoire | 225 | 10 | +225 07 00 00 00 00 |
| Bénin | 229 | 10 | +229 01 90 00 00 00 |
| Sénégal | 221 | 9 | +221 77 000 00 00 |
| Cameroun | 237 | 9 | +237 6 70 00 00 00 |
| Gabon | 241 | 8 | +241 07 00 00 00 |
| Congo | 242 | 9 | +242 06 000 00 00 |
| Tchad | 235 | 8 | +235 60 00 00 00 |
| Guinée | 224 | 9 | +224 620 00 00 00 |

Vérifie toujours avec un vrai numéro de la personne : `indicatif + chiffres_locaux` doit donner exactement son numéro.

6. **Numéro WhatsApp qui reçoit les commandes** (format international sans + : `2250701020304`) → `whatsapp`,
   et sa version lisible (`+225 07 01 02 03 04`) → `whatsapp_affiche`.
   ⚠️ Ce numéro devient **l'administrateur** de la plateforme (il créera son compte avec ce numéro).
7. Exemple de numéro local pour le formulaire (ex. `07 00 00 00 00`) → `exemple_numero` (facultatif).

## Groupe 3 — Apparence
8. **Logo** : demande d'envoyer l'image (PNG ou JPG, idéalement carrée, fond transparent ou uni). Facultatif :
   sans logo, la feuille verte du modèle est gardée (aux couleurs choisies). Enregistre-le dans le dossier de travail → `logo` (chemin).
9. **Couleurs** : propose ces palettes (couleur principale foncée + accent), ou deux codes au choix :

| Palette | Principale | Accent |
|---|---|---|
| Vert & or (modèle d'origine) | `#16402F` | `#E8B31A` |
| Bleu nuit & or | `#14305A` | `#E8B31A` |
| Bordeaux & or | `#5A1426` | `#E8B31A` |
| Violet & rose | `#3B1F5C` | `#E86AA0` |
| Terre & orange | `#4A2E1A` | `#E8862A` |
| Turquoise & corail | `#0E4A4F` | `#F2765A` |

   La couleur principale doit être **foncée** (texte blanc lisible dessus) ; l'accent plutôt **vif**.
   Si la personne a un logo, propose une palette qui reprend ses couleurs (regarde l'image).

## Groupe 4 — Adresse du site
10. **Nom du lien** : `https://<nom>.vercel.app` (minuscules, chiffres, tirets ; ex. `bien-etre-naturel`). → `site`
    Vercel ajoute un suffixe si le nom est déjà pris : on corrigera après le premier déploiement.

## Récapitulatif à faire valider
```
Marque : …            Ville : …          Pays : … (+indicatif)
WhatsApp commandes / admin : +…
Logo : oui / non      Couleurs : … / …
Lien prévu : https://….vercel.app
```
Puis écris `client.json` (voir `python3 scripts/personnaliser.py --exemple`). `domaine_comptes` : laisse vide (calculé automatiquement).
