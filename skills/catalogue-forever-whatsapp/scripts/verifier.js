// Vérifie une plateforme (en local ou en ligne) sur un écran de téléphone, sans rien commander.
// Usage : node verifier.js https://site.vercel.app [dossier-captures]
// Besoin : Playwright (require('playwright')). Sortie : captures PNG + rapport JSON ; code 1 si un contrôle échoue.
const { chromium } = require('playwright');
const fs = require('fs');
const URL = (process.argv[2] || '').replace(/\/$/, '') + '/';
const OUT = process.argv[3] || 'verification';
if (URL === '/') { console.error('Usage : node verifier.js https://site [dossier]'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR' });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push('JS : ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/supabase|Failed to fetch|ERR_NAME|net::/i.test(m.text())) errors.push('console : ' + m.text().slice(0, 160)); });
  const res = await pg.goto(URL, { waitUntil: 'networkidle' });
  const R = { url: URL, http: res.status(), csp: res.headers()['content-security-policy'] ? 'oui' : 'non (normal en local)', checks: {} };
  const cfg = await pg.evaluate(() => window.CONFIG);
  R.config = { BRAND: cfg.BRAND, WHATSAPP: cfg.WHATSAPP, SITE_URL: cfg.SITE_URL, SUPABASE_URL: cfg.SUPABASE_URL, COUNTRY_CODE: cfg.COUNTRY_CODE };
  const shot = async (h, name) => { if (h) { await pg.evaluate((x) => { location.hash = x; }, h); await pg.waitForTimeout(1300); } await pg.screenshot({ path: `${OUT}/${name}.png` }); };
  await shot('accueil', '1-accueil');
  const waLinks = () => pg.evaluate(() => [...document.querySelectorAll('a[href*="wa.me/"]')].map((a) => a.href.match(/wa\.me\/(\d+)/)?.[1]).filter(Boolean));
  const wa = await waLinks();
  R.checks.marque_en_tete = (await pg.textContent('.brand b')) === cfg.BRAND;
  R.checks.produits = await pg.evaluate(() => (window.PRODUCTS || []).length);
  await shot('catalogue', '2-produits');
  await shot('besoins', '3-besoins');
  await shot('produit-715', '4-fiche-produit');
  wa.push(...await waLinks());
  R.checks.liens_whatsapp = wa.length ? [...new Set(wa)] : 'aucun lien sur cette page';
  await pg.evaluate(() => localStorage.setItem('fl-cart', JSON.stringify({ '715|0': 2, '196|0': 1 })));
  await pg.reload({ waitUntil: 'networkidle' });
  await shot('liste', '5-panier');
  const btn = await pg.$('#checkoutBtn');
  if (btn) { await btn.click(); await pg.waitForTimeout(900); await pg.screenshot({ path: `${OUT}/6-formulaire.png` }); R.checks.indicatif_formulaire = (await pg.textContent('#sheet .phone-in em')) || ''; }
  await pg.evaluate(() => { document.querySelector('#sheet')?.classList.remove('open'); document.querySelector('#sheetBg')?.classList.remove('open'); localStorage.removeItem('fl-cart'); });
  await shot('compte', '7-compte');
  R.checks.whatsapp_ok = Array.isArray(R.checks.liens_whatsapp) ? R.checks.liens_whatsapp.every((n) => n === cfg.WHATSAPP) : true;
  R.checks.indicatif_ok = !R.checks.indicatif_formulaire || R.checks.indicatif_formulaire === '+' + cfg.COUNTRY_CODE;
  R.erreurs = errors;
  R.ok = R.http === 200 && R.checks.marque_en_tete && R.checks.produits === 81 && R.checks.whatsapp_ok && R.checks.indicatif_ok && errors.length === 0;
  fs.writeFileSync(`${OUT}/rapport.json`, JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
  await b.close();
  process.exit(R.ok ? 0 : 1);
})();
