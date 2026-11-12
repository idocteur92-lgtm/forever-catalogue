#!/usr/bin/env python3
"""Fabrique la plateforme d'un client à partir du modèle du skill.

Usage :
  python3 personnaliser.py client.json DOSSIER_SORTIE
  python3 personnaliser.py --exemple            (affiche un client.json d'exemple)

Le dossier de sortie est régénéré entièrement à chaque fois (sauf .git et les fichiers listés dans KEEP),
donc relancer le script après une correction est sans risque. Besoin : Python 3 + Pillow (+ numpy, conseillé).
"""
import colorsys, json, os, re, shutil, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
TPL = os.path.join(SKILL, 'template')
FONT = os.path.join(SKILL, 'assets', 'Manrope.ttf')   # police variable (graisse réglée à 800)
KEEP = {'.git', 'CLAUDE.md', 'p', 'node_modules', '.vercel', 'client.json', 'sources'}   # conservés d'une génération à l'autre
TEXT = ('.html', '.css', '.js', '.json', '.webmanifest', '.svg', '.sql', '.ts', '.md')

EXEMPLE = {
    "marque": "Bien-Être Naturel",
    "marque_courte": "Bien-Être",
    "ville": "Abidjan",
    "indicatif": "225",
    "chiffres_locaux": 10,
    "whatsapp": "2250701020304",
    "whatsapp_affiche": "+225 07 01 02 03 04",
    "exemple_numero": "07 00 00 00 00",
    "exemple_quartier": "Cocody, Abidjan",
    "couleur_principale": "#16402F",
    "couleur_accent": "#E8B31A",
    "logo": "sources/logo.png",
    "supabase_ref": "abcdefghijklmnopqrst",
    "supabase_key": "sb_publishable_xxxxxxxxxxxxxxxx",
    "site": "bien-etre-naturel.vercel.app",
    "domaine_comptes": "",
}
REQUIRED = ['marque', 'ville', 'indicatif', 'chiffres_locaux', 'whatsapp', 'whatsapp_affiche', 'supabase_ref', 'supabase_key', 'site']

# Couleurs de référence du modèle (vert profond + or)
REF_P, REF_A = '#16402F', '#E8B31A'
PROTECT = {'#1FA855', '#25D366', '#128C7E', '#075E54', '#34B7F1', '#FFFFFF', '#000000'}   # couleurs WhatsApp et neutres


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:40] or 'catalogue'


def hx(h):
    h = h.strip().lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    if not re.fullmatch(r'[0-9a-fA-F]{6}', h): raise ValueError(f'Couleur invalide : {h}')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def to_hex(rgb): return '#' + ''.join(f'{max(0, min(255, round(v * 255))):02X}' for v in rgb)


class Recolor:
    """Décale toute la famille « vert » vers la couleur principale et la famille « or » vers l'accent,
    en gardant la luminosité de chaque nuance (fonds clairs, textes foncés, ombres…)."""
    def __init__(self, primary, accent):
        self.p = colorsys.rgb_to_hls(*hx(primary)); self.a = colorsys.rgb_to_hls(*hx(accent))
        self.rp = colorsys.rgb_to_hls(*hx(REF_P)); self.ra = colorsys.rgb_to_hls(*hx(REF_A))
        self.identity = primary.upper() == REF_P and accent.upper() == REF_A

    def hls(self, h, l, s):
        deg = h * 360
        if s > 0.12 and 95 <= deg <= 178:        # famille verte → couleur principale
            th, ts, rs = self.p[0], self.p[2], self.rp[2]
        elif s > 0.30 and 33 <= deg <= 60:       # famille or → accent
            th, ts, rs = self.a[0], self.a[2], self.ra[2]
        else:
            return h, l, s
        ns = min(1.0, s * (ts / rs if rs else 1))
        if l > 0.86: ns *= 0.75                  # fonds très clairs : teinte légère
        return th, l, ns

    def rgb(self, rgb):
        if self.identity: return rgb
        h, l, s = colorsys.rgb_to_hls(*rgb)
        return colorsys.hls_to_rgb(*self.hls(h, l, s))

    def text(self, s):
        if self.identity: return s
        def rep_hex(m):
            c = '#' + m.group(1).upper()
            return m.group(0) if c in PROTECT else to_hex(self.rgb(hx(c)))
        s = re.sub(r'#([0-9A-Fa-f]{6})\b', rep_hex, s)
        def rep_rgba(m):
            r, g, b = (int(x) / 255 for x in m.group(1, 2, 3))
            nr, ng, nb = (round(v * 255) for v in self.rgb((r, g, b)))
            return f'rgba({nr},{ng},{nb},'
        return re.sub(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,', rep_rgba, s)

    def image(self, path):
        if self.identity: return
        from PIL import Image
        im = Image.open(path); mode = im.mode; im = im.convert('RGBA')
        try:
            import numpy as np
            a = np.asarray(im).astype(float) / 255; rgb = a[..., :3]
            mx, mn = rgb.max(-1), rgb.min(-1); l = (mx + mn) / 2; d = mx - mn
            s = np.where(d == 0, 0, d / np.where(l < 0.5, mx + mn, 2 - mx - mn + 1e-9))
            r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
            h = np.where(d == 0, 0, np.where(mx == r, ((g - b) / (d + 1e-9)) % 6, np.where(mx == g, (b - r) / (d + 1e-9) + 2, (r - g) / (d + 1e-9) + 4))) / 6
            out = rgb.copy(); deg = h * 360
            for (lo, hi, smin, tgt, ref) in ((95, 178, 0.12, self.p, self.rp), (33, 60, 0.30, self.a, self.ra)):
                m = (s > smin) & (deg >= lo) & (deg <= hi)
                if not m.any(): continue
                ns = np.minimum(1, s * (tgt[2] / ref[2] if ref[2] else 1)); ns = np.where(l > 0.86, ns * 0.75, ns)
                q = np.where(l < 0.5, l * (1 + ns), l + ns - l * ns); p = 2 * l - q
                def f(t):
                    t = t % 1
                    return np.where(t < 1 / 6, p + (q - p) * 6 * t, np.where(t < 0.5, q, np.where(t < 2 / 3, p + (q - p) * (2 / 3 - t) * 6, p)))
                nr, ng, nb = f(tgt[0] + 1 / 3), f(tgt[0]), f(tgt[0] - 1 / 3)
                for i, ch in enumerate((nr, ng, nb)): out[..., i] = np.where(m, ch, out[..., i])
            a[..., :3] = out
            im = Image.fromarray((a * 255).round().astype('uint8'), 'RGBA')
        except ImportError:
            px = im.load()
            for y in range(im.height):
                for x in range(im.width):
                    r, g, b, al = px[x, y]
                    nr, ng, nb = (round(v * 255) for v in self.rgb((r / 255, g / 255, b / 255)))
                    px[x, y] = (nr, ng, nb, al)
        (im if mode == 'RGBA' else im.convert('RGB')).save(path)


def font(size):
    from PIL import ImageFont
    for f in (FONT, '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(f):
            ft = ImageFont.truetype(f, size)
            try: ft.set_variation_by_axes([800])
            except Exception: pass
            return ft
    return ImageFont.load_default()


def make_images(out, cfg, rc):
    from PIL import Image, ImageDraw, ImageFilter
    img = os.path.join(out, 'img')
    P = tuple(round(v * 255) for v in hx(cfg['couleur_principale'])); A = tuple(round(v * 255) for v in hx(cfg['couleur_accent']))
    logo = None
    if cfg.get('logo'):
        logo = Image.open(cfg['logo']).convert('RGBA')
        w, h = logo.size; side = max(w, h)
        sq = Image.new('RGBA', (side, side), (255, 255, 255, 0)); sq.paste(logo, ((side - w) // 2, (side - h) // 2), logo)
        logo = sq.resize((512, 512), Image.LANCZOS); logo.save(os.path.join(img, 'logo.png'))
        for n in (192, 512):                     # icônes de l'application (écran d'accueil du téléphone)
            bg = Image.new('RGBA', (n, n), (255, 255, 255, 255)); pad = round(n * 0.08)
            bg.paste(logo.resize((n - 2 * pad, n - 2 * pad), Image.LANCZOS), (pad, pad), logo.resize((n - 2 * pad, n - 2 * pad), Image.LANCZOS))
            bg.convert('RGB').save(os.path.join(img, f'icon-{n}.png'))
    else:
        for n in (192, 512): rc.image(os.path.join(img, f'icon-{n}.png'))
    # Image d'aperçu (partage du lien sur WhatsApp / Facebook) : 1200 × 630
    W, H = 1200, 630
    cv = Image.new('RGB', (W, H), P); d = ImageDraw.Draw(cv)
    dark = tuple(max(0, int(c * 0.55)) for c in P)
    for y in range(H): d.line([(0, y), (W, y)], fill=tuple(int(P[i] + (dark[i] - P[i]) * y / H) for i in range(3)))
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse((760, -200, 1400, 440), fill=A + (70,))
    cv = Image.alpha_composite(cv.convert('RGBA'), glow.filter(ImageFilter.GaussianBlur(90))); d = ImageDraw.Draw(cv)
    x = 80
    if logo is not None:
        lg = logo.resize((300, 300), Image.LANCZOS); cv.paste(lg, (80, 165), lg); x = 430
    title = cfg['marque']; fs = 74
    while fs > 40 and d.textlength(title, font=font(fs)) > W - x - 70: fs -= 4
    d.text((x, 190), 'CATALOGUE FOREVER 2025', font=font(30), fill=A)
    d.text((x, 240), title, font=font(fs), fill=(255, 255, 255))
    d.text((x, 250 + fs + 18), 'Prix en F CFA · Commande sur WhatsApp', font=font(32), fill=(235, 240, 236))
    d.text((x, 250 + fs + 70), cfg['whatsapp_affiche'], font=font(36), fill=A)
    cv.convert('RGB').save(os.path.join(img, 'og-cover.jpg'), quality=88)
    return logo is not None


def main():
    if len(sys.argv) == 2 and sys.argv[1] == '--exemple':
        print(json.dumps(EXEMPLE, ensure_ascii=False, indent=2)); return
    if len(sys.argv) != 3: sys.exit(__doc__)
    cfg = json.load(open(sys.argv[1], encoding='utf-8')); out = os.path.abspath(sys.argv[2])
    miss = [k for k in REQUIRED if not str(cfg.get(k, '')).strip()]
    if miss: sys.exit(f'Champs manquants dans {sys.argv[1]} : {", ".join(miss)}')
    cfg.setdefault('couleur_principale', REF_P); cfg.setdefault('couleur_accent', REF_A)
    cfg['couleur_principale'] = cfg['couleur_principale'] or REF_P; cfg['couleur_accent'] = cfg['couleur_accent'] or REF_A
    cc = re.sub(r'\D', '', str(cfg['indicatif'])); wa = re.sub(r'\D', '', str(cfg['whatsapp']))
    nloc = int(cfg['chiffres_locaux'])
    if not wa.startswith(cc) or len(wa) != len(cc) + nloc:
        sys.exit(f'Numéro WhatsApp « {cfg["whatsapp"]} » incohérent : attendu {cc} + {nloc} chiffres.')
    if not re.fullmatch(r'[a-z0-9]{20}', cfg['supabase_ref']): print('Attention : la référence Supabase ne ressemble pas à 20 lettres/chiffres.')
    host = re.sub(r'^https?://', '', cfg['site']).strip('/')
    dom = cfg.get('domaine_comptes') or f'clients.{slug(cfg["marque"])}.app'
    tokens = {
        '__ACCOUNT_DOMAIN_RE__': dom.replace('.', '\\.'), '__ACCOUNT_DOMAIN__': dom,
        '__SUPABASE_REF__': cfg['supabase_ref'], '__SUPABASE_KEY__': cfg['supabase_key'], '__SITE_HOST__': host,
        '__WA_DISPLAY__': cfg['whatsapp_affiche'], '__WA__': wa, '__CC__': cc, '__LOCAL_DIGITS__': str(nloc),
        '__BRAND_SHORT__': cfg.get('marque_courte') or cfg['marque'][:20], '__BRAND__': cfg['marque'],
        '__QUARTIER_EXEMPLE__': re.sub(r'^Ex\.?\s*', '', cfg.get('exemple_quartier') or f'Centre-ville, {cfg["ville"]}'), '__CITY__': cfg['ville'],
        '__PHONE_EXAMPLE__': cfg.get('exemple_numero') or ' '.join(['00'] * (nloc // 2)) + ('0' if nloc % 2 else ''),
    }
    for k in ('__BRAND__', '__CITY__', '__BRAND_SHORT__', '__QUARTIER_EXEMPLE__', '__WA_DISPLAY__', '__PHONE_EXAMPLE__'):
        if re.search(r'[<>"`\\]', tokens[k]): sys.exit(f'Caractère interdit dans {k} : < > " ` \\')

    # 1) Dossier de sortie régénéré (on garde .git, CLAUDE.md…)
    os.makedirs(out, exist_ok=True)
    for n in os.listdir(out):
        if n in KEEP: continue
        p = os.path.join(out, n); shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    for n in os.listdir(TPL):
        s, d = os.path.join(TPL, n), os.path.join(out, n)
        shutil.copytree(s, d) if os.path.isdir(s) else shutil.copy(s, d)

    # 2) Textes : marqueurs + couleurs
    rc = Recolor(cfg['couleur_principale'], cfg['couleur_accent'])
    left = []
    for dp, _, files in os.walk(out):
        if any(k in dp.split(os.sep) for k in ('.git', 'node_modules')): continue
        for fn in files:
            p = os.path.join(dp, fn)
            if not fn.endswith(TEXT) or fn == 'supabase.js' or fn == 'products.js': continue
            s = open(p, encoding='utf-8').read()
            for k, v in tokens.items(): s = s.replace(k, v)
            if fn.endswith(('.css', '.js', '.html', '.webmanifest', '.svg')): s = rc.text(s)
            left += [f'{os.path.relpath(p, out)} : {m}' for m in set(re.findall(r'__[A-Z_]+__', s))]
            open(p, 'w', encoding='utf-8').write(s)
    if left: sys.exit('Marqueurs non remplacés :\n  ' + '\n  '.join(left))

    # 3) Logo dans l'en-tête, icônes, image de partage
    has_logo = make_images(out, cfg, rc)
    if has_logo:
        ih = os.path.join(out, 'index.html'); s = open(ih, encoding='utf-8').read()
        s = re.sub(r'<span class="logo">.*?</svg></span>', '<span class="logo logo-img"><img src="img/logo.png" alt=""></span>', s, count=1, flags=re.S)
        open(ih, 'w', encoding='utf-8').write(s)
        with open(os.path.join(out, 'app.css'), 'a', encoding='utf-8') as fh:
            fh.write('\n.brand .logo.logo-img{background:#fff;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.06)}.brand .logo.logo-img img{width:100%;height:100%;object-fit:contain;display:block}\n')
        if os.path.exists(os.path.join(out, 'manifest.webmanifest')):
            mp = os.path.join(out, 'manifest.webmanifest'); m = json.load(open(mp, encoding='utf-8'))
            json.dump(m, open(mp, 'w', encoding='utf-8'), ensure_ascii=False)

    # 4) README du client
    with open(os.path.join(out, 'README.md'), 'w', encoding='utf-8') as fh:
        fh.write(f"# {cfg['marque']} · Catalogue Forever\n\nCatalogue Forever (81 produits, prix en F CFA) avec commande sur WhatsApp ({cfg['whatsapp_affiche']}).\n\n"
                 f"- Site : https://{host}\n- Réglages : `config.js` · Produits : `products.js` · Base de données : `supabase/schema.sql`\n"
                 f"- Pages de partage : `node gen-pages.js https://{host}`\n\nFabriqué avec le skill catalogue-forever-whatsapp.\n")
    print(json.dumps({'ok': True, 'dossier': out, 'site': f'https://{host}', 'domaine_comptes': dom, 'admin': f'{wa}@{dom}',
                      'logo': has_logo, 'couleurs': [cfg['couleur_principale'], cfg['couleur_accent']]}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
