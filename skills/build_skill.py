#!/usr/bin/env python3
"""Fabrique le modèle (template/) du skill « catalogue-forever-whatsapp » à partir de l'application en ligne,
puis l'archive .skill à installer.  Usage :  python3 skills/build_skill.py
Chaque donnée propre à Objectif Santé Durable devient un marqueur __XXX__ que le skill remplace pour chaque client."""
import os, re, shutil, sys, zipfile, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL = os.path.join(ROOT, 'skills', 'catalogue-forever-whatsapp')
TPL = os.path.join(SKILL, 'template')
DIST = os.path.join(ROOT, 'skills', 'dist')

COPY = ['index.html', 'app.css', 'app.js', 'products.js', 'gen-pages.js', 'icon.svg', 'manifest.webmanifest',
        'vercel.json', 'api/bon.js', 'vendor/supabase.js', 'supabase/schema.sql', 'supabase/functions/compte/index.ts']
TEXT = ('.html', '.css', '.js', '.json', '.webmanifest', '.svg', '.sql', '.ts', '.md')

# Remplacements génériques (l'ordre compte : du plus précis au plus général)
GENERIC = [
    ('xnmebwxxukrhnoiynalg', '__SUPABASE_REF__'),
    ('forever-catalogue-eight.vercel.app', '__SITE_HOST__'),
    ('clients\\.santebioenergie\\.app', '__ACCOUNT_DOMAIN_RE__'),   # dans les expressions régulières SQL
    ('clients.santebioenergie.app', '__ACCOUNT_DOMAIN__'),
    ('22770290981', '__WA__'),
    ('+227 70 29 09 81', '__WA_DISPLAY__'),
    ('Objectif Santé Durable', '__BRAND__'),
    ('Santé Bio Énergie', '__BRAND__'),
    ('Plateau, Niamey', '__QUARTIER_EXEMPLE__'),
    ('Niamey', '__CITY__'),
    ('90 00 00 00', '__PHONE_EXAMPLE__'),
]
# Modifications de code ciblées : indicatif du pays et longueur des numéros deviennent des réglages
SPECIFIC = {
    'app.js': [
        ("if (d.length === 8) d = '227' + d;", "if (d.length === C.LOCAL_DIGITS) d = C.COUNTRY_CODE + d;"),
        ("const prettyPhone = d => d && d.startsWith('227') && d.length === 11 ? `+227 ${d.slice(3,5)} ${d.slice(5,7)} ${d.slice(7,9)} ${d.slice(9)}` : (d ? '+' + d : '');",
         "const prettyPhone = d => d && d.startsWith(C.COUNTRY_CODE) && d.length === C.COUNTRY_CODE.length + C.LOCAL_DIGITS ? `+${C.COUNTRY_CODE} ${d.slice(C.COUNTRY_CODE.length).replace(/(\\d\\d)(?=\\d)/g, '$1 ')}` : (d ? '+' + d : '');"),
        ('<em>+227</em>', '<em>+${esc(C.COUNTRY_CODE)}</em>'),
        ("c.phone.replace(/^227/, '')", "c.phone.replace(new RegExp('^' + C.COUNTRY_CODE), '')"),
    ],
    'supabase/functions/compte/index.ts': [
        ('if (d.length === 8) d = "227" + d;', 'if (d.length === __LOCAL_DIGITS__) d = "__CC__" + d;'),
    ],
    'manifest.webmanifest': [('"short_name":"Santé Durable"', '"short_name":"__BRAND_SHORT__"')],
    'index.html': [('content="https://__SITE_HOST__/img/og-cover.jpg"', 'content="img/og-cover.jpg"')],
}
CONFIG_JS = """// Réglages de l'application — __BRAND__ (fichier produit par le skill catalogue-forever-whatsapp)
window.CONFIG = {
  WHATSAPP: '__WA__',                    // numéro qui reçoit les commandes (indicatif + numéro, sans + ni espaces)
  WHATSAPP_DISPLAY: '__WA_DISPLAY__',
  BRAND: '__BRAND__',
  CITY: '__CITY__',
  COUNTRY_CODE: '__CC__',                // indicatif du pays (ex. 227 Niger, 225 Côte d'Ivoire)
  LOCAL_DIGITS: __LOCAL_DIGITS__,        // nombre de chiffres d'un numéro local sans l'indicatif
  // Adresse publique du site (mise à jour après le premier déploiement Vercel)
  SITE_URL: 'https://__SITE_HOST__',
  SUPABASE_URL: 'https://__SUPABASE_REF__.supabase.co',
  SUPABASE_KEY: '__SUPABASE_KEY__',      // clé « publishable » : publique par nature, protégée par les règles RLS
  ACCOUNT_DOMAIN: '__ACCOUNT_DOMAIN__',  // domaine technique des comptes (aucun e-mail n'est envoyé)
};
"""
# Données qui ne doivent JAMAIS rester dans le modèle
FORBIDDEN = ['xnmebwxxukrhnoiynalg', '22770290981', '70 29 09 81', 'santebioenergie', 'Objectif Santé', 'Santé Durable',
             'Niamey', 'sb_publishable_', 'forever-catalogue-eight', "'227'", '"227"', '^227', '+227']


def main():
    if os.path.exists(TPL): shutil.rmtree(TPL)
    os.makedirs(TPL)
    for rel in COPY:
        src, dst = os.path.join(ROOT, rel), os.path.join(TPL, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(src, dst)
    shutil.copytree(os.path.join(ROOT, 'img'), os.path.join(TPL, 'img'))
    os.remove(os.path.join(TPL, 'img', 'og-cover.jpg'))           # recréée pour chaque client
    with open(os.path.join(TPL, 'config.js'), 'w') as fh: fh.write(CONFIG_JS)
    with open(os.path.join(TPL, '.vercelignore'), 'w') as fh: fh.write('CLAUDE.md\nclient.json\nsources\nsupabase\n.vercelignore\n')

    for dp, _, files in os.walk(TPL):
        for fn in files:
            p = os.path.join(dp, fn); rel = os.path.relpath(p, TPL)
            if not fn.endswith(TEXT) or rel == 'vendor/supabase.js': continue
            s = open(p, encoding='utf-8').read()
            for a, b in SPECIFIC.get(rel, []): s = s.replace(a, b)
            s = re.sub(r"sb_publishable_[A-Za-z0-9_\-]+", '__SUPABASE_KEY__', s)
            for a, b in GENERIC: s = s.replace(a, b)
            for a, b in SPECIFIC.get(rel, []):   # 2e passage (motifs contenant des marqueurs) + contrôle
                s = s.replace(a, b)
                if b not in s: sys.exit(f'ERREUR : modification non appliquée dans {rel} : {a[:70]}')
            open(p, 'w', encoding='utf-8').write(s)

    bad = []
    for dp, _, files in os.walk(TPL):
        for fn in files:
            p = os.path.join(dp, fn)
            if not fn.endswith(TEXT) or fn == 'supabase.js': continue
            s = open(p, encoding='utf-8').read()
            bad += [f'{os.path.relpath(p, TPL)} : {w}' for w in FORBIDDEN if w in s]
    if bad: sys.exit('ERREUR : données personnelles restées dans le modèle :\n  ' + '\n  '.join(bad))

    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, 'catalogue-forever-whatsapp.skill')
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for dp, _, files in os.walk(SKILL):
            if '__pycache__' in dp: continue
            for fn in sorted(files):
                p = os.path.join(dp, fn)
                z.write(p, os.path.join('catalogue-forever-whatsapp', os.path.relpath(p, SKILL)))
    shutil.copy(out, out.replace('.skill', '.zip'))
    n = sum(len(f) for _, _, f in os.walk(SKILL))
    print(f'Modèle prêt ({n} fichiers). Archive : {os.path.relpath(out, ROOT)} ({os.path.getsize(out) // 1024} Ko)')


if __name__ == '__main__':
    main()
