// Page d'un bon de commande : grande image dans l'aperçu WhatsApp + affichage du bon.
const SUPABASE_URL = 'https://__SUPABASE_REF__.supabase.co';
const BRAND = '__BRAND__';
module.exports = (req, res) => {
  const id = String((req.query && req.query.id) || '').toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    res.statusCode = 404; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.end('Bon introuvable');
  }
  const site = 'https://__SITE_HOST__';
  const img = `${SUPABASE_URL}/storage/v1/object/public/bons/${id}.jpg`;
  const title = `Bon de commande · ${BRAND}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="robots" content="noindex">
<meta property="og:type" content="website"><meta property="og:title" content="${title}">
<meta property="og:description" content="Commande Forever avec le détail des produits et le total.">
<meta property="og:image" content="${img}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1080">
<meta property="og:url" content="${site}/b/${id}"><meta property="og:site_name" content="${BRAND}"><meta name="twitter:card" content="summary_large_image">
<style>body{margin:0;background:#F6F2E8;font-family:system-ui,sans-serif;color:#1B241F}main{max-width:560px;margin:0 auto;padding:16px}img{width:100%;border-radius:16px;box-shadow:0 6px 20px rgba(22,64,47,.12);display:block}a{display:block;text-align:center;margin:16px 0;padding:14px;border-radius:14px;background:#16402F;color:#fff;font-weight:700;text-decoration:none}</style>
</head><body><main><img src="${img}" alt="${title}"><a href="${site}/#catalogue">Voir le catalogue ${BRAND}</a></main></body></html>`);
};
