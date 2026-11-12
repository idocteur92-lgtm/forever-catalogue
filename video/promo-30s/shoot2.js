const { chromium } = require('playwright');
const fs = require('fs');
const URL = 'https://forever-catalogue-eight.vercel.app/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'fr-FR' });
  const pg = await ctx.newPage();
  await pg.route('**/app.js', async r => { const res = await r.fetch(); let t = await res.text(); t = t.replace(/\}\)\(\);\s*$/, 'window.__bon = buildOrderImage;\n})();'); await r.fulfill({ response: res, body: t }); });
  await pg.goto(URL, { waitUntil: 'networkidle' });
  await pg.evaluate(() => { localStorage.setItem('fl-cart', JSON.stringify({ '715|0': 2, '196|0': 1 })); });
  await pg.reload({ waitUntil: 'networkidle' }); await pg.evaluate(() => { location.hash = 'liste'; });
  await pg.waitForTimeout(1200);
  await pg.click('#checkoutBtn'); await pg.waitForTimeout(1000);
  const set = async (n, v) => { const e = await pg.$(`#sheet [name="${n}"]`) || await pg.$(`#sheet #${n}`); if (e) await e.fill(v); };
  await set('name', 'Aïcha Moussa'); await set('phone', '90 12 34 56'); await set('quartier', 'Plateau, Niamey');
  await pg.evaluate(() => { const s = document.querySelector('#sheet'); s.scrollTop = 0; });
  await pg.waitForTimeout(600); await pg.screenshot({ path: 'shots/form-filled.png' });
  await pg.evaluate(() => { const s = document.querySelector('#sheet'); s.scrollTop = s.scrollHeight; });
  await pg.waitForTimeout(600); await pg.screenshot({ path: 'shots/form-bottom.png' });
  const data = await pg.evaluate(async () => {
    const blob = await window.__bon([{ id: '715', v: 0, q: 2 }, { id: '196', v: 0, q: 1 }], { name: 'Aïcha Moussa', phone: '22790123456', quartier: 'Plateau, Niamey', delivery: 'livraison', note: '' }, '1024');
    const buf = await blob.arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s);
  });
  fs.writeFileSync('shots/bon.jpg', Buffer.from(data, 'base64'));
  console.log('ok');
  await b.close();
})();
