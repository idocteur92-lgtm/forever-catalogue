// Captures de l'application en ligne : pour chaque page, le contenu entier (sans barres fixes),
// la barre du haut, le menu du bas, et la position des éléments (pour les zooms de caméra).
const { chromium } = require('playwright');
const fs = require('fs');
const URL = 'https://forever-catalogue-eight.vercel.app/';
const OUT = 'public/app/';
const SEL = 'h1,h2,.sec,.panel,.hero,.pricebox,#addBtn,#orderBtn,.field,.btn,.tabs,.order,.card,.pd-img,.variants,.qty,.steps,.chip,.search,.stats,.phone-in,.seg,.total,.row,.item,[data-reorder],.grid,.cats,.need';
const CLIENT = { name: 'Aminata Moussa', phone: '90 12 34 56', quartier: 'Plateau, Niamey' };
fs.mkdirSync(OUT, { recursive: true });
const meta = {};
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'fr-FR' });
  const pg = await ctx.newPage();
  await pg.route('**/app.js', async (r) => {
    const res = await r.fetch(); let t = await res.text();
    t = t.replace(/\}\)\(\);\s*$/, 'window.__dbg = { bon: buildOrderImage, setMe(m, o) { me = m; ordersCache = o; route(true); } };\n})();');
    await r.fulfill({ response: res, body: t });
  });
  await pg.goto(URL, { waitUntil: 'networkidle' });
  const setHide = (on) => pg.evaluate(([on]) => { let s = document.getElementById('__h'); if (!s) { s = document.createElement('style'); s.id = '__h'; document.head.appendChild(s); } s.textContent = on ? '.top,.nav,.buybar,.toast{display:none!important} .view{animation:none!important}' : '.buybar,.toast{display:none!important} .view{animation:none!important}'; }, [on]);
  const rects = () => pg.evaluate((SEL) => [...document.querySelectorAll(SEL)].slice(0, 90).map((e) => { const r = e.getBoundingClientRect(); return { c: (e.id ? '#' + e.id + ' ' : '') + e.tagName.toLowerCase() + '.' + [...e.classList].join('.'), t: (e.innerText || '').trim().slice(0, 28).replace(/\n/g, ' '), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((r) => r.w > 0), SEL);
  // page défilante : contenu entier + barres
  const page = async (name, hash, before) => {
    if (hash) { await pg.evaluate((h) => { location.hash = h; }, hash); await pg.waitForTimeout(1400); }
    if (before) await before();
    await pg.evaluate(() => window.scrollTo(0, 0));
    await setHide(false); await pg.waitForTimeout(500);
    await pg.screenshot({ path: OUT + name + '_view.png' });
    const bars = await pg.evaluate(() => { const t = document.querySelector('.top').getBoundingClientRect(), n = document.querySelector('.nav').getBoundingClientRect(); return { hh: Math.round(t.height), ny: Math.round(n.y), nh: Math.round(n.height), tabs: [...document.querySelectorAll('.nav a')].map((a) => { const r = a.getBoundingClientRect(); return { tab: a.dataset.tab, x: Math.round(r.x), w: Math.round(r.width) }; }) }; });
    await setHide(true); await pg.waitForTimeout(400);
    await pg.screenshot({ path: OUT + name + '.png', fullPage: true });
    const h = await pg.evaluate(() => document.documentElement.scrollHeight);
    meta[name] = { h, ...bars, rects: await rects() };
    console.log(name, h);
  };
  const variant = async (name) => { await setHide(true); await pg.waitForTimeout(300); await pg.screenshot({ path: OUT + name + '.png', fullPage: true }); console.log(' +', name); };

  await page('home', 'accueil');
  await page('catalogue', 'catalogue');
  await page('besoins', 'besoins');
  await page('fatigue', 'besoin-fatigue');
  await page('produit', 'produit-715');
  // panier
  await pg.evaluate(() => localStorage.setItem('fl-cart', JSON.stringify({ '715|0': 2, '196|0': 1 })));
  await pg.reload({ waitUntil: 'networkidle' });
  await page('panier', 'liste');
  // formulaire de commande (feuille fixe : captures de l'écran)
  await setHide(false);
  await pg.click('#checkoutBtn'); await pg.waitForTimeout(900);
  const sheetShot = async (n) => { await pg.waitForTimeout(350); await pg.screenshot({ path: OUT + n + '.png' }); console.log(' +', n); };
  const fld = (n) => pg.$(`#sheet [name="${n}"]`);
  await (await fld('name')).fill(''); await (await fld('phone')).fill(''); await (await fld('quartier')).fill('');
  await pg.evaluate(() => { document.activeElement && document.activeElement.blur(); document.querySelector('#sheet').scrollTop = 0; });
  await sheetShot('form0');
  meta.form = { rects: await pg.evaluate(() => [...document.querySelectorAll('#sheet .field, #sheet .btn, #sheet [data-del], #sheet .seg, #sheet button')].map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || '').trim().slice(0, 24).replace(/\n/g, ' '), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })) };
  await (await fld('name')).fill(CLIENT.name); await pg.evaluate(() => document.activeElement.blur()); await sheetShot('form1');
  await (await fld('phone')).fill(CLIENT.phone); await pg.evaluate(() => document.activeElement.blur()); await sheetShot('form2');
  await (await fld('quartier')).fill(CLIENT.quartier); await pg.evaluate(() => document.activeElement.blur()); await sheetShot('form3');
  await pg.evaluate(() => { const s = document.querySelector('#sheet'); s.scrollTop = s.scrollHeight; });
  await sheetShot('form4');
  meta.form.bottom = await pg.evaluate(() => [...document.querySelectorAll('#sheet .field, #sheet .btn, #sheet button')].map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || '').trim().slice(0, 24).replace(/\n/g, ' '), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }));
  // bon de commande (image réelle de l'application)
  const data = await pg.evaluate(async (c) => {
    const blob = await window.__dbg.bon([{ id: '715', v: 0, q: 2 }, { id: '196', v: 0, q: 1 }], { name: c.name, phone: '22790123456', quartier: c.quartier, delivery: 'livraison', note: '' }, '1024');
    const u = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s);
  }, CLIENT);
  fs.writeFileSync(OUT + 'bon.jpg', Buffer.from(data, 'base64'));
  // compte : création
  await pg.evaluate(() => localStorage.removeItem('fl-cart'));
  await pg.reload({ waitUntil: 'networkidle' });
  await page('signup0', 'compte', async () => { await pg.click('[data-tab-auth="signup"]'); await pg.waitForTimeout(400); });
  const af = (n) => pg.$(`#authForm [name="${n}"]`);
  await setHide(false);
  await (await af('full_name')).fill(CLIENT.name); await pg.evaluate(() => document.activeElement.blur()); await variant('signup1');
  await (await af('phone')).fill(CLIENT.phone); await (await af('quartier')).fill(CLIENT.quartier); await pg.evaluate(() => document.activeElement.blur()); await variant('signup2');
  await (await af('password')).fill('sante2025'); await pg.evaluate(() => document.activeElement.blur()); await variant('signup3');
  // compte : connecté, avec commandes (données d'exemple)
  const now = Date.now();
  await pg.evaluate(([c, now]) => window.__dbg.setMe({ user: { id: 'demo' }, profile: { full_name: c.name, phone: '22790123456', quartier: c.quartier, is_admin: false } }, [
    { id: 1024, created_at: new Date(now).toISOString(), status: 'confirmee', total: 76000, items: [{ id: '715', v: 0, q: 2, price: 22000, name: 'Forever Aloe Vera Gel', label: '1 litre' }, { id: '196', v: 0, q: 1, price: 32000, name: 'Forever Freedom', label: '' }] },
    { id: 1009, created_at: new Date(now - 12 * 864e5).toISOString(), status: 'livree', total: 58500, items: [{ id: '034', v: 0, q: 1, price: 22000, name: 'Forever Aloe Berry Nectar', label: '' }, { id: '289', v: 0, q: 1, price: 36500, name: 'Forever Lean', label: '' }] },
  ]), [CLIENT, now]);
  await pg.waitForTimeout(600);
  await page('compte', null);
  fs.writeFileSync('app-meta.json', JSON.stringify(meta, null, 1));
  await b.close();
})();
