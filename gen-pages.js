// Génère une page de partage par produit (p/<id>.html) avec photo pour l'aperçu WhatsApp/Facebook.
// Usage : node gen-pages.js https://votre-site.vercel.app
const fs = require('fs'); const path = require('path');
const SITE = (process.argv[2] || '').replace(/\/$/, '');
if (!SITE) { console.error('Indiquez l\'adresse du site'); process.exit(1); }
global.window = {}; require('./products.js');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = n => n.toLocaleString('fr-FR').replace(/ | /g, ' ');
fs.mkdirSync(path.join(__dirname, 'p'), { recursive: true });
for (const p of window.PRODUCTS) {
  const image = p.web && !p.web.endsWith('.webp') ? p.web : `${SITE}/img/${p.img}.jpg`;
  const title = `${p.name} · ${fmt(p.price)} F CFA`;
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(p.short)}">
<meta property="og:type" content="product"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(p.short)}">
<meta property="og:image" content="${esc(image)}"><meta property="og:url" content="${SITE}/p/${p.id}"><meta property="og:site_name" content="Objectif Santé Durable · Catalogue Forever">
<meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${SITE}/#produit-${p.id}">
<meta http-equiv="refresh" content="0;url=${SITE}/#produit-${p.id}"><script>location.replace('${SITE}/#produit-${p.id}')</script>
</head><body style="font-family:sans-serif;padding:24px"><a href="${SITE}/#produit-${p.id}">${esc(p.name)}</a></body></html>`;
  fs.writeFileSync(path.join(__dirname, 'p', `${p.id}.html`), html);
}
for (const f of ['index.html']) { const fp = path.join(__dirname, f); fs.writeFileSync(fp, fs.readFileSync(fp, 'utf8').replace('content="img/og-cover.jpg"', `content="${SITE}/img/og-cover.jpg"`)); }
const cfg = path.join(__dirname, 'config.js'); fs.writeFileSync(cfg, fs.readFileSync(cfg, 'utf8').replace(/SITE_URL: '[^']*'/, `SITE_URL: '${SITE}'`));
console.log(`${window.PRODUCTS.length} pages produits générées pour ${SITE}`);
