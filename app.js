(() => {
'use strict';
const C = window.CONFIG;
const WA = C.WHATSAPP, WA_DISPLAY = C.WHATSAPP_DISPLAY;
const P = window.PRODUCTS, U = window.UNIVERS, B = window.BESOINS;
const byId = Object.fromEntries(P.map(p => [p.id, p]));
const uById = Object.fromEntries(U.map(u => [u.id, u]));
const bById = Object.fromEntries(B.map(b => [b.id, b]));
const $ = s => document.querySelector(s);
const app = $('#app');
const fmt = n => Number(n).toLocaleString('fr-FR').replace(/ | /g, ' ');
const money = n => `${fmt(n)} <small>F CFA</small>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const unitPrice = (p, v = 0) => (p.prices ? p.prices[v].p : p.price);
const variantLabel = (p, v = 0) => (p.prices ? p.prices[v].l : '');
const imgOf = (p, v = 0) => (v === 1 && p.img2 ? p.img2 : p.img);

/* ---------- stockage local (facultatif) ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
let cart = store.get('fl-cart', {});
const saveCart = () => { store.set('fl-cart', cart); updateBadge(); };
const cartItems = () => Object.keys(cart).map(k => { const [id, v] = k.split('|'); return { id, v: +v, q: Math.floor(+cart[k]) }; })
  .filter(it => { const p = byId[it.id]; return p && Number.isInteger(it.v) && it.v >= 0 && it.v < (p.prices ? p.prices.length : 1) && it.q >= 1 && it.q <= 999; });
const cartCount = () => cartItems().reduce((a, b) => a + b.q, 0);
function updateBadge() { const n = cartCount(); $('#badge').textContent = n || ''; }
const inCart = id => Object.keys(cart).some(k => k.split('|')[0] === id);
function addToCart(id, v = 0, q = 1) { const p = byId[id]; v = +v; q = Math.floor(+q); if (!p || !Number.isInteger(v) || v < 0 || v >= (p.prices ? p.prices.length : 1) || !Number.isFinite(q)) return; const k = `${id}|${v}`; if ((cart[k] || 0) + q > 999) q = 999 - (cart[k] || 0); cart[k] = (cart[k] || 0) + q; if (cart[k] <= 0) delete cart[k]; saveCart(); }

/* ---------- lien public d'un produit (aperçu avec photo dans WhatsApp) ---------- */
function siteUrl() {
  if (C.SITE_URL) return C.SITE_URL.replace(/\/$/, '');
  const h = location.hostname;
  if (/^https?:$/.test(location.protocol) && h && !/claude|anthropic|localhost|127\.0\.0\.1/.test(h)) return location.origin;
  return '';
}
const productLink = p => (siteUrl() ? `${siteUrl()}/p/${p.id}` : '');

/* ---------- comptes (Supabase) ---------- */
let sb = null, backend = 'checking', me = null; // me = { user, profile }
try { sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } }); } catch { backend = 'off'; }
const accountEmail = phone => `${phone}@${C.ACCOUNT_DOMAIN}`;
function normPhone(v) { let d = String(v || '').replace(/\D/g, ''); if (d.startsWith('00')) d = d.slice(2); if (d.length === 8) d = '227' + d; return d.length >= 8 && d.length <= 15 ? d : null; }
const prettyPhone = d => d && d.startsWith('227') && d.length === 11 ? `+227 ${d.slice(3,5)} ${d.slice(5,7)} ${d.slice(7,9)} ${d.slice(9)}` : (d ? '+' + d : '');
async function checkBackend() {
  if (!sb) { backend = 'off'; return; }
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(`${C.SUPABASE_URL}/auth/v1/health`, { headers: { apikey: C.SUPABASE_KEY }, signal: ctl.signal });
    clearTimeout(t); backend = r.ok ? 'on' : 'off';
  } catch { backend = 'off'; }
  if (backend === 'on') {
    const { data } = await sb.auth.getSession();
    if (data?.session) await loadMe(data.session.user);
    sb.auth.onAuthStateChange((_e, session) => { if (!session) { me = null; } });
  }
}
async function loadMe(user) {
  const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
  me = { user, profile: data || { full_name: '', phone: '', quartier: '', is_admin: false } };
  const c = store.get('fl-client', {}); store.set('fl-client', { ...c, name: me.profile.full_name || c.name, phone: me.profile.phone || c.phone, quartier: me.profile.quartier || c.quartier });
}

/* ---------- images : photo du catalogue, remplacée par la photo HD officielle si disponible ---------- */
let webOK = null; const webQueue = [];
function img(p, which = 'img') {
  const web = which === 'img' && p.web ? ` data-web="${p.web}"` : '';
  return `<img src="img/${p[which]}.jpg"${web} alt="${esc(p.name)}" loading="lazy" decoding="async">`;
}
function upgradeImages(root) {
  if (webOK === false) return;
  root.querySelectorAll('img[data-web]').forEach(el => { const u = el.dataset.web; el.removeAttribute('data-web'); webOK ? swap(el, u) : webQueue.push([el, u]); });
  if (webOK === null && webQueue.length && !upgradeImages.t) {
    upgradeImages.t = true; const t = new Image();
    t.onload = () => { webOK = true; webQueue.splice(0).forEach(([e, u]) => swap(e, u)); };
    t.onerror = () => { webOK = false; webQueue.length = 0; };
    t.src = webQueue[0][1];
  }
}
function swap(el, url) { const t = new Image(); t.onload = () => { el.src = url; el.style.mixBlendMode = 'normal'; }; t.src = url; }

/* ---------- icônes ---------- */
const plus = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
const check = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const info = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/></svg>`;
const waIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.4-.3z"/></svg>`;
const bigCheck = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

/* ---------- composants ---------- */
function card(p) {
  return `<article class="card">
    ${p.star ? '<span class="ribbon">Incontournable</span>' : ''}
    <a href="#produit-${p.id}" aria-label="${esc(p.name)}"><div class="ph">${img(p)}</div></a>
    <div class="bd">
      <span class="code">${esc(p.code)} · ${esc(uById[p.u].short)}</span>
      <a href="#produit-${p.id}"><h3>${esc(p.name)}</h3></a>
      <div class="price"><b class="tnum">${money(p.price)}</b>
        <button class="add ${inCart(p.id) ? 'in' : ''}" data-add="${p.id}" aria-label="Ajouter ${esc(p.name)} au panier">${inCart(p.id) ? check : plus}</button>
      </div>
    </div>
  </article>`;
}
const needChip = b => `<a class="need" href="#besoin-${b.id}"><span class="ic">${b.icon}</span>${esc(b.name)}</a>`;
const disclaimer = `<div class="note">${info}<span>Ces produits sont des compléments alimentaires et des cosmétiques destinés au bien-être. Ils ne sont pas des médicaments et ne remplacent pas un traitement médical. Toute personne sous traitement, enceinte ou allaitante doit demander l'avis de son médecin.</span></div>`;
const foot = () => `<footer>Prix clients conseillés en F CFA, issus du catalogue Forever Living Products 2025 (nouveaux tarifs). Les prix peuvent évoluer : confirmez avec votre conseillère avant achat. Les compléments alimentaires doivent être utilisés dans le cadre d'une alimentation variée et équilibrée et d'un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Produits distribués en vente directe par un Forever Business Owner indépendant.</footer>`;

/* ================= VUES ================= */
function vHome() {
  const stars = P.filter(p => p.star);
  const topNeeds = ['poids','digestion','prostate','articulations','immunite','fatigue','glycemie','coeur','femme','libido','peau-seche','acne','memoire','anti-age'].map(id => bById[id]);
  const hello = me?.profile?.full_name ? `Bonjour ${esc(me.profile.full_name.split(' ')[0])} 👋` : '✦ Nouveaux tarifs 2025';
  return `
  <section class="hero">
    <span class="eyebrow">${hello}</span>
    <h1>L'Aloe vera au service de votre <em>bien-être</em></h1>
    <p>Tous les produits Forever, leurs prix, leurs bienfaits et les conseils d'utilisation. Trouvez le produit adapté à votre besoin, commandez sur WhatsApp.</p>
    <button class="search-fake" data-search><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#66706A" stroke-width="2.3" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>Rechercher : prostate, Aloe gel, fatigue…</button>
    <div class="hero-stats"><div><b>${P.length}</b>produits</div><div><b>${B.length}</b>besoins santé</div><div><b>${U.length}</b>catégories</div></div>
  </section>

  <div class="sec"><div><h2>Je cherche un produit pour…</h2><p>Choisissez votre besoin, on vous montre les produits conseillés.</p></div><a class="more" href="#besoins">Tout voir</a></div>
  <div class="need-scroll">${topNeeds.map(needChip).join('')}</div>

  <div class="sec"><div><h2>Nos catégories</h2></div><a class="more" href="#catalogue">Tout le catalogue</a></div>
  <div class="uni-grid">${U.map(u => { const ps = P.filter(p => p.u === u.id);
    return `<a class="uni" href="#univers-${u.id}" style="--c:${u.color}"><span class="tag">${esc(u.group)}</span>
      <div><h3>${esc(u.name)}</h3><span class="n">${ps.length} produits</span></div>
      <span class="pics">${ps.slice(0, 2).map(p => `<img src="img/${p.img}.jpg" alt="" loading="lazy">`).join('')}</span></a>`; }).join('')}</div>

  <div class="sec"><div><h2>Les incontournables</h2><p>Les produits les plus demandés.</p></div></div>
  <div class="hscroll">${stars.map(card).join('')}</div>

  <div class="sec"><div><h2>Programmes minceur</h2></div></div>
  <a class="prog" href="#univers-programmes"><h3>Transformez-vous en 9 jours</h3><p>C9, DX4, F15, Vital5 : des programmes complets et guidés.</p><span class="cta">Découvrir les programmes →</span><img src="img/c9.jpg" alt=""></a>

  <div class="sec"><div><h2>Comment commander ?</h2></div></div>
  <div class="panel" style="padding:6px 16px">
    ${[['🛍️','Ajoutez vos produits au panier','Ou appuyez sur « Commander » depuis la fiche produit.'],['📝','Indiquez votre nom et votre quartier','Livraison à domicile à Niamey ou retrait.'],['💬','Envoyez la commande sur WhatsApp','Un message prêt à envoyer, avec le détail et le total.'],['👤','Suivez vos commandes','Créez votre compte pour retrouver vos commandes et leur statut.']].map(([i,t,d]) => `<div class="linkrow" style="justify-content:flex-start;gap:12px;align-items:flex-start"><span style="font-size:22px">${i}</span><span><b style="display:block">${t}</b><small style="color:var(--muted);font-weight:600">${d}</small></span></div>`).join('')}
  </div>

  <div class="contact">
    <span class="av"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 22c-.5-5-3-9-8-11 5 .3 8 3 8 8 .3-6 2.5-11 7-15-2 5-3.5 10-7 18z" fill="#E8B31A"/></svg></span>
    <div style="flex:1"><h3>Besoin d'un conseil ?</h3><p>${esc(C.BRAND)}, ${esc(C.CITY)} · ${WA_DISPLAY}</p></div>
  </div>
  <a class="btn wa" style="width:100%;margin-top:10px" href="https://wa.me/${WA}?text=${encodeURIComponent(`Bonjour ${C.BRAND} 👋\nJ'ai besoin d'un conseil sur les produits Forever.`)}" target="_blank" rel="noopener">${waIcon} Demander conseil sur WhatsApp</a>
  ${disclaimer}${foot()}`;
}

let sortMode = store.get('fl-sort', 'pert');
function sorted(list) {
  const l = list.slice();
  if (sortMode === 'asc') l.sort((a, b) => a.price - b.price);
  if (sortMode === 'desc') l.sort((a, b) => b.price - a.price);
  if (sortMode === 'az') l.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return l;
}
function vCatalogue(uid) {
  const list = uid ? P.filter(p => p.u === uid) : P; const u = uid && uById[uid];
  return `
  <div class="page-head"><h1>${u ? esc(u.name) : 'Tous les produits'}</h1><p>${u ? esc(u.desc) : 'Le catalogue complet Forever 2025, avec les prix clients conseillés.'}</p></div>
  <div class="sticky-tools">
    <div class="chips"><a class="chip ${!uid ? 'on' : ''}" href="#catalogue">Tous</a>${U.map(x => `<a class="chip ${uid === x.id ? 'on' : ''}" href="#univers-${x.id}">${esc(x.short)}</a>`).join('')}</div>
    <div class="toolbar"><span class="tnum">${list.length} produit${list.length > 1 ? 's' : ''}</span>
      <select class="select" id="sort" aria-label="Trier">
        <option value="pert" ${sortMode==='pert'?'selected':''}>Pertinence</option><option value="asc" ${sortMode==='asc'?'selected':''}>Prix croissant</option>
        <option value="desc" ${sortMode==='desc'?'selected':''}>Prix décroissant</option><option value="az" ${sortMode==='az'?'selected':''}>A → Z</option>
      </select></div>
  </div>
  <div class="grid">${sorted(list).map(card).join('')}</div>${foot()}`;
}
const BEAUTY = ['peau-seche','acne','anti-age','brulures','cheveux','bouche'];
function needCard(b) {
  const n = P.filter(p => p.besoins.includes(b.id)).length;
  return `<a class="need" href="#besoin-${b.id}"><span class="ic">${b.icon}</span><span>${esc(b.name)}<small style="display:block;margin-top:3px">${esc(b.desc)}</small></span><span class="count">${n} produit${n > 1 ? 's' : ''} →</span></a>`;
}
function vBesoins() {
  return `<div class="page-head"><h1>Par besoin</h1><p>Sélectionnez le problème ou l'objectif : nous vous montrons les produits Forever conseillés.</p></div>
  <div class="sec" style="margin-top:14px"><h2 style="font-size:18px">Santé & bien-être</h2></div>
  <div class="needs-grid">${B.filter(b => !BEAUTY.includes(b.id)).map(needCard).join('')}</div>
  <div class="sec"><h2 style="font-size:18px">Beauté & soins</h2></div>
  <div class="needs-grid">${B.filter(b => BEAUTY.includes(b.id)).map(needCard).join('')}</div>${disclaimer}${foot()}`;
}
function vBesoin(id) {
  const b = bById[id]; if (!b) return vBesoins();
  const list = P.filter(p => p.besoins.includes(id)).sort((x, y) => x.besoins.indexOf(id) - y.besoins.indexOf(id));
  const extra = { glycemie: 'Diabétiques : ces produits accompagnent une bonne hygiène de vie mais ne remplacent jamais votre traitement. Parlez-en à votre médecin.', coeur: 'En cas d\'hypertension ou de traitement cardiaque (anticoagulants…), demandez l\'avis de votre médecin avant de prendre un complément.', prostate: 'En cas de troubles urinaires persistants, consultez un médecin pour un bilan de la prostate.', enfants: 'Respectez les doses indiquées selon l\'âge et demandez conseil pour les enfants de moins de 12 ans.' }[id];
  return `<div class="need-hero"><span class="ic">${b.icon}</span><div><h1>${esc(b.name)}</h1><p>${esc(b.desc)}</p></div></div>
  ${extra ? `<div class="note" style="margin-top:0">${info}<span>${extra}</span></div>` : ''}
  <div class="toolbar"><span class="tnum">${list.length} produit${list.length > 1 ? 's' : ''} conseillé${list.length > 1 ? 's' : ''}</span></div>
  <div class="grid">${list.map(card).join('')}</div>
  <a class="btn ghost" style="width:100%;margin-top:14px" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent(`Bonjour ${C.BRAND} 👋\nJe cherche un conseil pour : *${b.name}*.\nQuels produits me recommandez-vous ?`)}">${waIcon} Demander un conseil personnalisé</a>
  <div class="sec"><h2 style="font-size:18px">Autres besoins</h2></div>
  <div class="need-scroll">${B.filter(x => x.id !== id).slice(0, 12).map(needChip).join('')}</div>${disclaimer}${foot()}`;
}

let curVar = 0, curQty = 1, curImg = 'img';
function vProduit(id) {
  const p = byId[id]; if (!p) return vCatalogue();
  const u = uById[p.u];
  const related = P.filter(x => x.id !== p.id && (x.u === p.u || x.besoins.some(b => p.besoins.includes(b))))
    .sort((a, b) => b.besoins.filter(n => p.besoins.includes(n)).length - a.besoins.filter(n => p.besoins.includes(n)).length).slice(0, 8);
  return `
  <div class="pd-img">${img(p, curImg)}
    ${p.img2 ? `<div class="alt"><button class="${curImg==='img'?'on':''}" data-img="img" aria-label="Photo 1"><img src="img/${p.img}.jpg" alt=""></button><button class="${curImg==='img2'?'on':''}" data-img="img2" aria-label="Photo 2"><img src="img/${p.img2}.jpg" alt=""></button></div>` : ''}
  </div>
  <div class="pd">
    <div class="crumbs"><a href="#univers-${u.id}">${esc(u.name)}</a></div>
    <h1>${esc(p.name)}</h1>
    <div class="meta">Réf. ${esc(p.code)} · ${esc(p.size)}</div>
    <p class="lead">${esc(p.short)}</p>
    <div class="pricebox" id="pricebox">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div><div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:4px">Prix client conseillé</div><div class="big tnum" id="bigPrice">${money(unitPrice(p, curVar))}</div></div>
        <div class="qty"><button data-q="-1" aria-label="Moins">−</button><span id="qv" class="tnum">${curQty}</span><button data-q="1" aria-label="Plus">+</button></div>
      </div>
      ${p.prices ? `<div class="variants">${p.prices.map((v, i) => `<button class="variant ${i===curVar?'on':''}" data-v="${i}"><span>${esc(v.l)}</span><span class="tnum">${fmt(v.p)} F</span></button>`).join('')}</div>` : ''}
      <div class="actions"><button class="btn wa" id="orderBtn">${waIcon} Commander sur WhatsApp</button></div>
      <div class="actions" style="margin-top:10px">
        <button class="btn ghost" id="addBtn">${plus} Ajouter au panier</button>
        <button class="btn ghost" id="shareBtn" style="flex:.7">Partager</button>
      </div>
    </div>
    <div class="block"><h2>✨ Bienfaits</h2><ul class="ticks">${p.benefits.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    ${p.besoins.length ? `<div class="block"><h2>🎯 Conseillé pour</h2><div class="tags">${p.besoins.map(b => `<a class="tag-need" href="#besoin-${b}">${bById[b].icon} ${esc(bById[b].name)}</a>`).join('')}</div></div>` : ''}
    <div class="block"><h2>📋 Utilisation</h2><p>${esc(p.usage)}</p></div>
    ${p.caution ? `<div class="block warn"><h2>⚠️ Précautions</h2><p>${esc(p.caution)}</p></div>` : ''}
    ${related.length ? `<div class="sec"><h2 style="font-size:19px">À associer avec</h2></div><div class="hscroll">${related.map(card).join('')}</div>` : ''}
    ${disclaimer}${foot()}
  </div>`;
}

function vListe() {
  const items = cartItems();
  if (!items.length) return `<div class="empty"><div class="big">🛍️</div><h2>Votre panier est vide</h2><p>Ajoutez des produits avec le bouton <b>+</b>, puis envoyez votre commande sur WhatsApp en un clic.</p><a class="btn pri" style="max-width:280px;margin:18px auto 0" href="#catalogue">Voir les produits</a></div>`;
  const total = items.reduce((a, it) => a + unitPrice(byId[it.id], it.v) * it.q, 0);
  return `<div class="page-head"><h1>Mon panier</h1><p>Vérifiez vos produits puis envoyez la commande sur WhatsApp. Le paiement et la livraison se font directement avec votre conseillère.</p></div>
  <div style="margin-top:14px">${items.map(it => { const p = byId[it.id], up = unitPrice(p, it.v), k = `${it.id}|${it.v}`;
    return `<div class="li"><a class="thumb" href="#produit-${p.id}"><img src="img/${p.img}.jpg" alt=""></a>
      <div class="info"><div style="display:flex;justify-content:space-between;gap:8px"><h3>${esc(p.name)}</h3><button data-rm="${k}" aria-label="Retirer ${esc(p.name)} du panier" style="color:var(--muted);font-size:20px;line-height:1;width:32px;height:32px;margin:-6px -6px 0 0;flex:none">×</button></div><small>${p.prices ? esc(variantLabel(p, it.v)) : esc(p.code)} · ${fmt(up)} F</small>
      <div class="row"><b class="tnum">${fmt(up * it.q)} F CFA</b><div class="qty"><button data-cq="${k}" data-d="-1" aria-label="Moins">−</button><span class="tnum">${it.q}</span><button data-cq="${k}" data-d="1" aria-label="Plus">+</button></div></div></div></div>`; }).join('')}</div>
  <div class="total"><div class="r"><span style="font-weight:700">Total estimé</span><b class="tnum">${fmt(total)} F</b></div><small>${cartCount()} article${cartCount() > 1 ? 's' : ''} · prix clients conseillés</small></div>
  <button class="btn wa" style="width:100%" id="checkoutBtn">${waIcon} Commander sur WhatsApp</button>
  <button class="btn ghost" style="width:100%;margin-top:10px" id="clearBtn">Vider le panier</button>
  ${!me && backend === 'on' ? `<p style="text-align:center;color:var(--muted);font-size:13px;margin-top:14px"><a href="#compte" style="color:var(--green-3);font-weight:800">Créez votre compte</a> pour suivre vos commandes.</p>` : ''}
  ${foot()}`;
}

/* ---------- message WhatsApp ---------- */
const LINE = '┈┈┈┈┈┈┈┈┈┈┈┈┈┈';
function orderMessage(items, client, orderNo, bonLink) {
  const total = items.reduce((a, it) => a + unitPrice(byId[it.id], it.v) * it.q, 0);
  const n = items.reduce((a, it) => a + it.q, 0);
  const lines = items.map((it, i) => {
    const p = byId[it.id], up = unitPrice(p, it.v);
    return [`*${i + 1}. ${p.name}*`, `    ${p.prices ? variantLabel(p, it.v) : 'Réf. ' + p.code + ' · ' + p.size}`, `    ${it.q} × ${fmt(up)} F = *${fmt(up * it.q)} F*`].join('\n');
  });
  const link = !bonLink && items.length === 1 ? productLink(byId[items[0].id]) : '';
  const parts = [
    ...(bonLink ? [`🧾 *Bon de commande :* ${bonLink}`, ''] : []),
    `🌿 *NOUVELLE COMMANDE FOREVER*${orderNo ? `  ·  N° ${orderNo}` : ''}`,
    `_${C.BRAND} · ${C.CITY}_`,
    LINE,
    ...lines,
    LINE,
    `🧾 *TOTAL : ${fmt(total)} F CFA*  (${n} article${n > 1 ? 's' : ''})`,
    '',
    `👤 *Client :* ${client.name}`,
    `📞 *Téléphone :* ${prettyPhone(client.phone)}`,
    `📍 *Quartier :* ${client.quartier || '—'}`,
    client.delivery === 'retrait' ? '🏬 *Retrait* chez la conseillère' : '🚚 *Livraison* à domicile',
  ];
  if (client.note) parts.push(`📝 *Note :* ${client.note}`);
  if (link) parts.push('', `🔗 Voir le produit : ${link}`);
  parts.push('', 'Merci de me confirmer la disponibilité et le délai 🙏');
  return { text: parts.join('\n'), total };
}


/* ---------- bon de commande en image (avec photos des produits) ---------- */
function loadImg(src) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }
function rrect(x, c, y, w, h, r) { x.beginPath(); x.moveTo(c + r, y); x.arcTo(c + w, y, c + w, y + h, r); x.arcTo(c + w, y + h, c, y + h, r); x.arcTo(c, y + h, c, y, r); x.arcTo(c, y, c + w, y, r); x.closePath(); }
function wrapText(x, text, maxW) { const words = String(text).split(' '); const lines = []; let l = ''; for (const w of words) { const t = l ? l + ' ' + w : w; if (x.measureText(t).width > maxW && l) { lines.push(l); l = w; } else l = t; } if (l) lines.push(l); return lines; }
async function buildOrderImage(items, client, orderNo) {
  try { await document.fonts.ready; } catch {}
  const W = 1080, PAD = 56, ROW = 210;
  const H = 300 + items.length * ROW + 150 + 330 + 90;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  const SERIF = 'Fraunces, Georgia, serif', SANS = 'Manrope, system-ui, sans-serif';
  x.fillStyle = '#F6F2E8'; x.fillRect(0, 0, W, H);
  // en-tête
  const g = x.createLinearGradient(0, 0, W, 260); g.addColorStop(0, '#1F5A41'); g.addColorStop(1, '#0F2E21');
  x.fillStyle = g; x.fillRect(0, 0, W, 260);
  x.fillStyle = '#E8B31A'; x.font = `800 26px ${SANS}`; x.fillText('🌿  ' + C.BRAND.toUpperCase() + ' · ' + C.CITY.toUpperCase(), PAD, 78);
  x.fillStyle = '#fff'; x.font = `600 60px ${SERIF}`; x.fillText('Bon de commande', PAD, 158);
  x.fillStyle = 'rgba(255,255,255,.75)'; x.font = `600 28px ${SANS}`;
  x.fillText(`${orderNo ? 'N° ' + orderNo + '  ·  ' : ''}${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}  ·  Catalogue Forever 2025`, PAD, 214);
  // produits
  let y = 300; let total = 0;
  for (const it of items) {
    const p = byId[it.id], up = unitPrice(p, it.v); total += up * it.q;
    x.fillStyle = '#fff'; rrect(x, PAD, y - 10, W - PAD * 2, ROW - 24, 28); x.fill();
    x.fillStyle = '#ECE5D3'; rrect(x, PAD + 18, y + 8, 150, 150, 20); x.fill();
    const im = await loadImg(`img/${imgOf(p, it.v)}.jpg`);
    if (im) { const s = Math.min(134 / im.width, 134 / im.height), w = im.width * s, h = im.height * s; x.save(); rrect(x, PAD + 18, y + 8, 150, 150, 20); x.clip(); x.globalCompositeOperation = 'multiply'; x.drawImage(im, PAD + 18 + (150 - w) / 2, y + 8 + (150 - h) / 2, w, h); x.restore(); }
    const tx = PAD + 196, tw = W - PAD * 2 - 196 - 200;
    x.fillStyle = '#1B241F'; x.font = `800 34px ${SANS}`;
    wrapText(x, p.name, tw).slice(0, 2).forEach((l, i) => x.fillText(l, tx, y + 50 + i * 40));
    x.fillStyle = '#66706A'; x.font = `600 25px ${SANS}`;
    x.fillText((p.prices ? variantLabel(p, it.v) : `Réf. ${p.code} · ${p.size}`).slice(0, 44), tx, y + 140);
    x.textAlign = 'right'; x.fillStyle = '#66706A'; x.font = `700 26px ${SANS}`; x.fillText(`${it.q} × ${fmt(up)} F`, W - PAD - 24, y + 52);
    x.fillStyle = '#16402F'; x.font = `800 34px ${SANS}`; x.fillText(`${fmt(up * it.q)} F`, W - PAD - 24, y + 100); x.textAlign = 'left';
    y += ROW;
  }
  // total
  x.fillStyle = '#16402F'; rrect(x, PAD, y, W - PAD * 2, 118, 28); x.fill();
  x.fillStyle = 'rgba(255,255,255,.8)'; x.font = `700 28px ${SANS}`; x.fillText(`TOTAL · ${items.reduce((a, b) => a + b.q, 0)} article(s)`, PAD + 34, y + 70);
  x.textAlign = 'right'; x.fillStyle = '#E8B31A'; x.font = `600 52px ${SERIF}`; x.fillText(`${fmt(total)} F CFA`, W - PAD - 34, y + 78); x.textAlign = 'left';
  y += 160;
  // client
  x.fillStyle = '#fff'; rrect(x, PAD, y, W - PAD * 2, 290, 28); x.fill();
  const rows = [['Client', client.name], ['Téléphone', prettyPhone(client.phone)], ['Quartier', client.quartier || '—'], ['Réception', client.delivery === 'retrait' ? 'Retrait chez la conseillère' : 'Livraison à domicile'], ['Note', client.note || '—']];
  rows.forEach(([k, v], i) => { x.fillStyle = '#66706A'; x.font = `700 25px ${SANS}`; x.fillText(k, PAD + 34, y + 58 + i * 52); x.fillStyle = '#1B241F'; x.font = `700 28px ${SANS}`; x.fillText(String(v).slice(0, 46), PAD + 250, y + 58 + i * 52); });
  y += 330;
  x.fillStyle = '#66706A'; x.font = `600 24px ${SANS}`; x.textAlign = 'center';
  x.fillText(`Commandes & conseils : WhatsApp ${WA_DISPLAY}`, W / 2, y + 10); x.textAlign = 'left';
  return new Promise(r => { try { cv.toBlob(b => r(b), 'image/jpeg', 0.9); } catch { r(null); } });
}

/* ---------- feuille de commande ---------- */
const sheet = $('#sheet'), sheetBg = $('#sheetBg');
let checkoutItems = [], checkoutFromCart = false, delivery = 'livraison';
function openSheet(html) { sheet.innerHTML = `<div class="grab"></div>${html}`; sheet.scrollTop = 0; sheet.classList.add('open'); sheetBg.classList.add('open'); upgradeImages(sheet); }
function closeSheet() { sheet.classList.remove('open'); sheetBg.classList.remove('open'); }
sheetBg.onclick = closeSheet;
function openCheckout(items, fromCart) {
  checkoutItems = items; checkoutFromCart = fromCart;
  const c = store.get('fl-client', {}); delivery = c.delivery || 'livraison';
  const total = items.reduce((a, it) => a + unitPrice(byId[it.id], it.v) * it.q, 0);
  openSheet(`
    <h2>Finaliser ma commande</h2><p class="sub">Vos coordonnées sont ajoutées au message WhatsApp.</p>
    <div class="recap">${items.map(it => { const p = byId[it.id], up = unitPrice(p, it.v);
      return `<div class="it"><img src="img/${imgOf(p, it.v)}.jpg" alt=""><span>${esc(p.name)}<small>${it.q} × ${fmt(up)} F${p.prices ? ' · ' + esc(variantLabel(p, it.v)) : ''}</small></span><b class="tnum">${fmt(up * it.q)} F</b></div>`; }).join('')}
      <div class="tot"><span>Total</span><b class="tnum">${fmt(total)} F CFA</b></div></div>
    <form id="coForm" novalidate>
      <div id="coErr"></div>
      <label class="field"><span>Nom complet</span><input class="input" name="name" autocomplete="name" maxlength="80" value="${esc(c.name || '')}" required></label>
      <label class="field"><span>Téléphone (WhatsApp)</span><div class="phone-in"><em>+227</em><input class="input" name="phone" inputmode="tel" autocomplete="tel" placeholder="90 00 00 00" value="${esc(c.phone ? c.phone.replace(/^227/, '') : '')}" required></div></label>
      <label class="field"><span>Quartier / ville</span><input class="input" name="quartier" autocomplete="address-level2" placeholder="Ex. Plateau, Niamey" value="${esc(c.quartier || '')}"></label>
      <div class="field"><span>Réception</span><div class="seg"><button type="button" data-dl="livraison" class="${delivery==='livraison'?'on':''}">🚚 Livraison</button><button type="button" data-dl="retrait" class="${delivery==='retrait'?'on':''}">🏬 Retrait</button></div></div>
      <label class="field"><span>Note <i>(facultatif)</i></span><textarea class="input" name="note" maxlength="500" placeholder="Heure de livraison, point de repère…"></textarea></label>
      <button class="btn wa" style="width:100%" type="submit" id="coSubmit">${waIcon} Envoyer la commande sur WhatsApp</button>
      ${me ? `<p style="text-align:center;color:var(--muted);font-size:12.5px;margin:10px 0 0">La commande sera aussi enregistrée dans votre compte.</p>` : backend === 'on' ? `<p style="text-align:center;color:var(--muted);font-size:12.5px;margin:10px 0 0"><a href="#compte" style="color:var(--green-3);font-weight:800">Connectez-vous</a> pour retrouver cette commande dans votre compte.</p>` : ''}
    </form>`);
  sheet.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { delivery = b.dataset.dl; sheet.querySelectorAll('[data-dl]').forEach(x => x.classList.toggle('on', x === b)); });
  $('#coForm').onsubmit = submitCheckout;
}
async function submitCheckout(e) {
  e.preventDefault();
  const f = e.target, err = $('#coErr');
  const cl = (v, n) => v.replace(/[<>]/g, '').trim().slice(0, n);
  const client = { name: cl(f.name.value, 80), phone: normPhone(f.phone.value), quartier: cl(f.quartier.value, 80), note: cl(f.note.value, 500), delivery: delivery === 'retrait' ? 'retrait' : 'livraison' };
  if (client.name.length < 2) { err.innerHTML = '<div class="err">Indiquez votre nom.</div>'; f.name.focus(); return; }
  if (!client.phone) { err.innerHTML = '<div class="err">Numéro de téléphone invalide.</div>'; f.phone.focus(); return; }
  store.set('fl-client', { name: client.name, phone: client.phone, quartier: client.quartier, delivery });
  const btn = $('#coSubmit'); btn.disabled = true; btn.innerHTML = 'Préparation du bon de commande…';
  const items = checkoutItems.map(it => ({ id: it.id, v: it.v, q: it.q, name: byId[it.id].name, label: variantLabel(byId[it.id], it.v), price: unitPrice(byId[it.id], it.v), img: imgOf(byId[it.id], it.v) }));
  const total = items.reduce((a, it) => a + it.price * it.q, 0);
  let orderNo = null, bonLink = '';
  const online = !!(sb && backend === 'on');
  const bonId = crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  let bonUrl = online ? `${C.SUPABASE_URL}/storage/v1/object/public/bons/${bonId}.jpg` : '';
  // 1) enregistrement de la commande (compte client) ou historique du téléphone
  if (me && online) {
    const { data, error } = await sb.from('orders').insert({ customer_name: client.name, phone: client.phone, quartier: client.quartier, delivery, note: client.note, items, total, bon_url: bonUrl }).select('id').single();
    if (!error && data) orderNo = data.id; else bonUrl = bonUrl;
    if (error && /Trop de commandes/.test(error.message || '')) toast('Commande non enregistrée dans le compte (limite du jour), mais envoyée sur WhatsApp.');
  }
  // 2) image du bon de commande, mise en ligne pour apparaître en grande photo dans WhatsApp
  try {
    const blob = await Promise.race([buildOrderImage(checkoutItems, client, orderNo), new Promise(r => setTimeout(() => r(null), 8000))]);
    if (blob && online) {
      const { error } = await sb.storage.from('bons').upload(`${bonId}.jpg`, blob, { contentType: 'image/jpeg', upsert: false });
      if (!error) bonLink = siteUrl() ? `${siteUrl()}/b/${bonId}` : bonUrl;
    }
  } catch {}
  if (!bonLink) bonUrl = '';
  if (!me) { const hist = store.get('fl-orders', []); hist.unshift({ id: 'L' + Date.now().toString(36).toUpperCase().slice(-5), created_at: new Date().toISOString(), items, total, status: 'nouvelle', bon_url: bonUrl }); store.set('fl-orders', hist.slice(0, 30)); }
  // 3) WhatsApp s'ouvre directement sur le numéro, avec le bon en photo et le détail en texte
  const { text } = orderMessage(checkoutItems, client, orderNo, bonLink);
  const url = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  if (checkoutFromCart) { cart = {}; saveCart(); }
  openSheet(`<div class="ok-box"><div class="ic">${bigCheck}</div><h2>Commande envoyée vers WhatsApp${orderNo ? ` · N° ${orderNo}` : ''}</h2>
    <p class="sub" style="margin:6px 0 16px">WhatsApp s'ouvre avec votre bon de commande en photo et le détail en texte. Il ne reste qu'à appuyer sur <b>Envoyer</b>.</p></div>
    <a class="btn wa" style="width:100%;height:54px;font-size:16px" href="${url}" target="_blank" rel="noopener" id="waGo">${waIcon} WhatsApp ne s'est pas ouvert ? Appuyez ici</a>
    ${bonUrl ? `<img src="${bonUrl}" alt="Bon de commande" style="width:100%;border-radius:16px;margin-top:14px;display:block">` : ''}
    <button class="btn ghost" style="width:100%;margin-top:12px" id="okClose">${me ? 'Voir mes commandes' : 'Continuer mes achats'}</button>`);
  $('#okClose').onclick = () => { closeSheet(); if (me) location.hash = 'compte'; else if (checkoutFromCart) location.hash = 'catalogue'; };
  try { window.location.href = url; } catch {}
  if (checkoutFromCart && location.hash === '#liste') route();
}

/* ---------- compte ---------- */
const STATUS = { nouvelle: 'Reçue', confirmee: 'Confirmée', preparation: 'En préparation', livree: 'Livrée', annulee: 'Annulée' };
const STEP = { nouvelle: 1, confirmee: 2, preparation: 3, livree: 4, annulee: 0 };
const dateFr = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
function orderCard(o, adminView) {
  const items = (Array.isArray(o.items) ? o.items : []).filter(it => it && typeof it === 'object').map(it => ({ id: String(it.id ?? ''), v: Number(it.v) || 0, q: Number(it.q) || 0, price: Number(it.price) || 0, name: String(it.name ?? ''), label: String(it.label ?? '') }));
  const bon = typeof o.bon_url === 'string' && o.bon_url.startsWith(`${C.SUPABASE_URL}/storage/v1/object/public/bons/`) ? o.bon_url : '';
  const total = Number(o.total) || 0;
  return `<div class="order">
    <div class="hd"><div><b>Commande N° ${esc(o.id)}</b><small>${dateFr(o.created_at)}</small>${adminView ? `<small style="color:var(--ink);font-weight:800;margin-top:4px">👤 ${esc(o.customer_name)} · ${esc(prettyPhone(o.phone))}</small><small>📍 ${esc(o.quartier || '—')} · ${o.delivery === 'retrait' ? 'Retrait' : 'Livraison'}</small>` : ''}</div><span class="st st-${STATUS[o.status] ? o.status : 'nouvelle'}">${STATUS[o.status] || 'Reçue'}</span></div>
    ${o.status !== 'annulee' ? `<div class="steps">${[1,2,3,4].map(i => `<i class="${STEP[o.status] >= i ? 'on' : ''}"></i>`).join('')}</div>` : ''}
    ${adminView ? `<div style="display:flex;gap:6px;margin:10px 0 0;overflow-x:auto">${items.map(it => byId[it.id] ? `<a href="#produit-${esc(it.id)}" style="flex:none;width:58px;height:58px;border-radius:12px;background:var(--sand);overflow:hidden"><img src="img/${esc(byId[it.id].img)}.jpg" alt="" style="width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;padding:3px"></a>` : '').join('')}</div>` : ''}
    <ul>${items.map(it => `<li><span>${fmt(it.q)} × ${esc(it.name)}${it.label ? ` <small style="color:var(--muted)">(${esc(it.label)})</small>` : ''}</span><span class="tnum">${fmt(it.price * it.q)} F</span></li>`).join('')}</ul>
    ${bon ? `<a href="${esc(bon)}" target="_blank" rel="noopener" style="display:inline-block;font-size:13px;font-weight:800;color:var(--green-3);margin:0 0 10px">🧾 Voir le bon de commande</a>` : ''}
    ${o.note && adminView ? `<p style="font-size:13px;margin:0 0 10px;color:var(--muted)">📝 ${esc(o.note)}</p>` : ''}
    <div class="ft"><b class="tnum">${fmt(total)} F CFA</b>
      ${adminView ? `<span style="display:flex;gap:6px"><a class="btn wa mini" target="_blank" rel="noopener" href="https://wa.me/${esc(String(o.phone).replace(/\D/g, ''))}?text=${encodeURIComponent(`Bonjour ${o.customer_name} 👋\nC'est ${C.BRAND}, au sujet de votre commande N° ${o.id} (${fmt(total)} F CFA).`)}">${waIcon}</a>
        <select class="select" data-status="${esc(o.id)}" aria-label="Statut">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k===o.status?'selected':''}>${v}</option>`).join('')}</select></span>`
      : `<button class="btn ghost mini" data-reorder='${esc(JSON.stringify(items.map(it => [it.id, it.v || 0, it.q])))}'>Recommander</button>`}
    </div></div>`;
}
let authTab = 'login', ordersCache = null;
function vCompte() {
  if (backend === 'checking') return `<div class="empty"><div class="big">⏳</div><h2>Chargement…</h2></div>`;
  if (backend === 'off') {
    const local = store.get('fl-orders', []);
    return `<div class="page-head"><h1>Mon compte</h1></div>
      <div class="offline" style="margin-top:14px"><div class="big">📶</div><h2 style="font-size:20px;margin:6px 0">Connexion impossible</h2><p style="color:var(--muted);font-size:14px;margin:0 0 14px">Vérifiez votre connexion Internet puis réessayez. Vous pouvez toujours commander sur WhatsApp.</p><button class="btn pri" id="retryBackend" style="width:100%">Réessayer</button></div>
      ${local.length ? `<div class="sec"><h2 style="font-size:18px">Commandes sur ce téléphone</h2></div>${local.map(o => orderCard(o)).join('')}` : ''}${foot()}`;
  }
  if (!me) return `<div class="page-head"><h1>Mon compte</h1><p>Créez votre compte avec votre numéro de téléphone pour retrouver toutes vos commandes et suivre leur livraison.</p></div>
    <div class="tabs"><button data-tab-auth="login" class="${authTab==='login'?'on':''}">Se connecter</button><button data-tab-auth="signup" class="${authTab==='signup'?'on':''}">Créer un compte</button></div>
    <div class="panel"><form id="authForm" novalidate><div id="authErr"></div>
      ${authTab === 'signup' ? `<label class="field"><span>Nom complet</span><input class="input" name="full_name" autocomplete="name" required></label>` : ''}
      <label class="field"><span>Numéro de téléphone</span><div class="phone-in"><em>+227</em><input class="input" name="phone" inputmode="tel" autocomplete="tel" placeholder="90 00 00 00" required></div></label>
      ${authTab === 'signup' ? `<label class="field"><span>Quartier / ville <i>(facultatif)</i></span><input class="input" name="quartier" placeholder="Ex. Plateau, Niamey"></label>` : ''}
      <label class="field"><span>Mot de passe ${authTab === 'signup' ? '<i>(6 caractères minimum)</i>' : ''}</span><div class="phone-in"><input class="input" name="password" type="password" autocomplete="${authTab==='signup'?'new-password':'current-password'}" required minlength="6"><button type="button" class="more" data-eye style="padding:0 14px;flex:none">Afficher</button></div></label>
      <button class="btn pri" style="width:100%" type="submit" id="authBtn">${authTab === 'signup' ? 'Créer mon compte' : 'Me connecter'}</button>
    </form>
    ${authTab === 'login' ? `<p style="text-align:center;font-size:13px;color:var(--muted);margin:14px 0 0">Mot de passe oublié ? <a style="color:var(--green-3);font-weight:800" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent('Bonjour, j\'ai oublié le mot de passe de mon compte client. Mon numéro : ')}">Écrivez-nous sur WhatsApp</a></p>` : ''}</div>
    <div class="panel" style="margin-top:12px">${[['📦','Historique de vos commandes'],['🚚','Suivi : reçue, confirmée, en préparation, livrée'],['🔁','Recommander en un clic'],['⚡','Vos coordonnées pré-remplies']].map(([i, t]) => `<div class="linkrow" style="justify-content:flex-start;gap:12px"><span style="font-size:20px">${i}</span>${t}</div>`).join('')}</div>${foot()}`;
  const pr = me.profile;
  return `<div class="panel profile" style="margin-top:8px"><span class="av">${esc((pr.full_name || '?').trim()[0]?.toUpperCase() || '?')}</span><div style="flex:1;min-width:0"><h2>${esc(pr.full_name || 'Mon compte')}</h2><p>${esc(prettyPhone(pr.phone))}${pr.quartier ? ' · ' + esc(pr.quartier) : ''}</p></div></div>
    ${pr.is_admin ? `<a class="btn pri" style="width:100%;margin-top:12px" href="#admin">🛠️ Espace administrateur</a>` : ''}
    <div class="sec"><div><h2 style="font-size:20px">Mes commandes</h2><p>Le statut est mis à jour par votre conseillère.</p></div></div>
    <div id="myOrders">${ordersCache ? (ordersCache.length ? ordersCache.map(o => orderCard(o)).join('') : `<div class="offline"><p style="margin:0;color:var(--muted)">Aucune commande pour l'instant.</p><a class="btn pri" style="margin-top:12px" href="#catalogue">Découvrir les produits</a></div>`) : '<p style="color:var(--muted)">Chargement…</p>'}</div>
    <details class="panel" style="margin-top:16px"><summary style="font-weight:800;cursor:pointer">✏️ Modifier mes informations</summary>
      <form id="profForm" novalidate style="margin-top:14px"><div id="profErr"></div>
        <label class="field"><span>Nom complet</span><input class="input" name="full_name" autocomplete="name" maxlength="80" value="${esc(pr.full_name)}" required></label>
        <label class="field"><span>Quartier / ville</span><input class="input" name="quartier" maxlength="80" value="${esc(pr.quartier)}"></label>
        <button class="btn pri" style="width:100%" type="submit">Enregistrer</button></form></details>
    <details class="panel" style="margin-top:12px"><summary style="font-weight:800;cursor:pointer">🔑 Changer mon mot de passe</summary>
      <form id="pwForm" novalidate style="margin-top:14px"><div id="pwErr"></div>
        <label class="field"><span>Nouveau mot de passe <i>(6 caractères minimum)</i></span><div class="phone-in"><input class="input" name="p1" type="password" autocomplete="new-password" required minlength="6"><button type="button" class="more" data-eye style="padding:0 14px;flex:none">Afficher</button></div></label>
        <label class="field"><span>Confirmer le mot de passe</span><input class="input" name="p2" type="password" autocomplete="new-password" required minlength="6"></label>
        <button class="btn pri" style="width:100%" type="submit">Enregistrer le nouveau mot de passe</button></form></details>
    <button class="btn ghost" style="width:100%;margin-top:16px" id="logoutBtn">Se déconnecter</button>${foot()}`;
}
async function loadMyOrders() {
  const { data } = await sb.from('orders').select('*').eq('user_id', me.user.id).order('created_at', { ascending: false }).limit(50);
  ordersCache = data || []; if (location.hash === '#compte') route(true);
}
async function submitAuth(e) {
  e.preventDefault();
  const f = e.target, err = $('#authErr'), btn = $('#authBtn');
  const phone = normPhone(f.phone.value), password = f.password.value;
  if (!phone) { err.innerHTML = '<div class="err">Numéro de téléphone invalide.</div>'; return; }
  if (password.length < 6) { err.innerHTML = '<div class="err">Le mot de passe doit contenir au moins 6 caractères.</div>'; return; }
  btn.disabled = true; btn.textContent = 'Un instant…'; err.innerHTML = '';
  try {
    if (authTab === 'signup') {
      const full_name = f.full_name.value.trim(); if (full_name.length < 2) throw new Error('Indiquez votre nom.');
      const { data, error } = await sb.functions.invoke('compte', { body: { action: 'signup', phone, password, full_name, quartier: f.quartier.value.trim() } });
      if (error) { let m = 'Inscription impossible pour le moment.'; try { m = (await error.context.json()).error || m; } catch {} throw new Error(m); }
      if (!data?.ok) throw new Error(data?.error || 'Inscription impossible.');
    }
    const { data, error } = await sb.auth.signInWithPassword({ email: accountEmail(phone), password });
    if (error) throw new Error(/invalid/i.test(error.message) ? 'Numéro ou mot de passe incorrect.' : 'Connexion impossible pour le moment.');
    await loadMe(data.user); ordersCache = null;
    toast(authTab === 'signup' ? 'Bienvenue ! Votre compte est créé.' : 'Vous êtes connecté.');
    route(true); loadMyOrders();
  } catch (x) { err.innerHTML = `<div class="err">${esc(x.message)}</div>`; btn.disabled = false; btn.textContent = authTab === 'signup' ? 'Créer mon compte' : 'Me connecter'; }
}

/* ---------- administration ---------- */
let adminFilter = 'actives', adminOrders = null;
function vAdmin() {
  if (!me?.profile?.is_admin) return `<div class="empty"><div class="big">🔒</div><h2>Accès réservé</h2><p>Connectez-vous avec le compte administrateur.</p><a class="btn pri" style="max-width:260px;margin:16px auto 0" href="#compte">Mon compte</a></div>`;
  if (!adminOrders) return `<div class="page-head"><h1>Commandes</h1></div><p style="color:var(--muted)">Chargement…</p>`;
  const list = adminOrders.filter(o => adminFilter === 'toutes' || (adminFilter === 'actives' ? !['livree','annulee'].includes(o.status) : o.status === adminFilter));
  const today = new Date().toDateString();
  const kNew = adminOrders.filter(o => o.status === 'nouvelle').length;
  const kToday = adminOrders.filter(o => new Date(o.created_at).toDateString() === today).length;
  const ca = adminOrders.filter(o => o.status === 'livree').reduce((a, o) => a + o.total, 0);
  return `<div class="page-head"><h1>Commandes</h1><p>Toutes les commandes passées par vos clients connectés.</p></div>
    <div class="kpis"><div class="kpi"><b class="tnum">${kNew}</b><span>Nouvelles</span></div><div class="kpi"><b class="tnum">${kToday}</b><span>Aujourd'hui</span></div><div class="kpi"><b class="tnum" style="font-size:17px">${fmt(ca)}</b><span>F CFA livrés</span></div></div>
    <div class="chips">${[['actives','En cours'],['nouvelle','Nouvelles'],['preparation','En préparation'],['livree','Livrées'],['annulee','Annulées'],['toutes','Toutes']].map(([k, l]) => `<button class="chip ${adminFilter===k?'on':''}" data-af="${k}">${l}</button>`).join('')}</div>
    ${list.length ? list.map(o => orderCard(o, true)).join('') : '<div class="offline"><p style="margin:0;color:var(--muted)">Aucune commande dans cette catégorie.</p></div>'}
    <div class="sec"><h2 style="font-size:18px">Réinitialiser le mot de passe d'un client</h2></div>
    <div class="panel"><form id="resetForm" novalidate><div id="resetErr"></div>
      <label class="field"><span>Numéro du client</span><div class="phone-in"><em>+227</em><input class="input" name="phone" inputmode="tel" required></div></label>
      <label class="field"><span>Nouveau mot de passe</span><input class="input" name="password" required minlength="6"></label>
      <button class="btn pri" style="width:100%" type="submit">Réinitialiser</button></form></div>
    <button class="btn ghost" style="width:100%;margin-top:12px" id="refreshAdmin">Actualiser</button>${foot()}`;
}
async function loadAdmin() {
  const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false }).limit(300);
  adminOrders = data || []; if (location.hash === '#admin') route(true);
}

/* ================= ROUTEUR ================= */
let lastRoute = ''; const scrollMem = {};
function route(keepScroll) {
  const h = (location.hash || '#accueil').slice(1);
  if (!keepScroll) scrollMem[lastRoute] = window.scrollY;
  let html, tab = 'accueil';
  if (h.startsWith('produit-')) { if (lastRoute !== h) { curVar = 0; curQty = 1; curImg = 'img'; } html = vProduit(h.slice(8)); tab = ''; }
  else if (h.startsWith('univers-')) { html = vCatalogue(h.slice(8)); tab = 'catalogue'; }
  else if (h === 'catalogue') { html = vCatalogue(); tab = 'catalogue'; }
  else if (h.startsWith('besoin-')) { html = vBesoin(h.slice(7)); tab = 'besoins'; }
  else if (h === 'besoins') { html = vBesoins(); tab = 'besoins'; }
  else if (h === 'liste') { html = vListe(); tab = 'liste'; }
  else if (h === 'compte') { html = vCompte(); tab = 'compte'; if (me && !ordersCache && lastRoute !== h) loadMyOrders(); }
  else if (h === 'admin') { html = vAdmin(); tab = 'compte'; if (me?.profile?.is_admin && lastRoute !== h) loadAdmin(); }
  else html = vHome();
  const same = lastRoute === h;
  app.innerHTML = `<div class="view"${same ? ' style="animation:none"' : ''}>${html}</div>`;
  document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  $('#backBtn').hidden = !/^(produit-|besoin-|admin)/.test(h);
  const p = h.startsWith('produit-') && byId[h.slice(8)];
  document.title = p ? `${p.name} · ${fmt(p.price)} F CFA · Forever` : 'Objectif Santé Durable · Catalogue Forever';
  bindView(h, p);
  upgradeImages(app);
  if (!same && !keepScroll) window.scrollTo(0, h.startsWith('produit-') ? 0 : (scrollMem[h] || 0));
  lastRoute = h;
}

/* ---------- liaisons propres à chaque vue ---------- */
const buybar = $('#buybar');
let buyObs;
function bindView(h, p) {
  buybar.classList.remove('show'); if (buyObs) { buyObs.disconnect(); buyObs = null; }
  if (p) bindProduct(p);
  const af = $('#authForm'); if (af) af.onsubmit = submitAuth;
  const rf = $('#resetForm'); if (rf) rf.onsubmit = submitReset;
  const pf = $('#pwForm'); if (pf) pf.onsubmit = submitPw;
  const prf = $('#profForm'); if (prf) prf.onsubmit = submitProfile;
}
function bindProduct(p) {
  const refresh = () => {
    $('#bigPrice').innerHTML = money(unitPrice(p, curVar)); $('#qv').textContent = curQty;
    buybar.querySelector('.wrap').innerHTML = `<div class="pr"><small>${esc(p.name)}${curQty > 1 ? ' × ' + curQty : ''}</small><b class="tnum">${fmt(unitPrice(p, curVar) * curQty)} F CFA</b></div>
      <button class="btn ghost mini" data-bb="add" aria-label="Ajouter au panier" style="height:46px;width:46px;padding:0">${plus}</button>
      <button class="btn wa" data-bb="order">${waIcon} Commander</button>`;
  };
  refresh();
  app.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { curVar = +b.dataset.v; app.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b)); refresh(); });
  app.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { curQty = Math.max(1, Math.min(99, curQty + +b.dataset.q)); refresh(); });
  app.querySelectorAll('[data-img]').forEach(b => b.onclick = () => { curImg = b.dataset.img; route(true); });
  const add = () => { addToCart(p.id, curVar, curQty); toast(`${curQty} × ${p.name} ajouté au panier`); };
  const order = () => openCheckout([{ id: p.id, v: curVar, q: curQty }], false);
  $('#addBtn').onclick = add; $('#orderBtn').onclick = order;
  buybar.onclick = e => { const b = e.target.closest('[data-bb]'); if (!b) return; b.dataset.bb === 'add' ? add() : order(); };
  $('#shareBtn').onclick = () => {
    const link = productLink(p);
    const text = `🌿 *${p.name}*\n${p.short}\n\n💰 *${fmt(unitPrice(p, curVar))} F CFA*\n✨ ${p.benefits.slice(0, 3).join('\n✨ ')}\n\n📲 Pour commander : ${WA_DISPLAY}${link ? `\n🔗 ${link}` : ''}`;
    openSheet(`<h2>Partager ce produit</h2><p class="sub">Envoyez la fiche à un proche ou dans un groupe.</p>
      <a class="btn wa" style="width:100%" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">${waIcon} Partager sur WhatsApp</a>
      <button class="btn ghost" style="width:100%;margin-top:10px" id="copyShare">Copier le texte</button>
      <pre style="white-space:pre-wrap;font:500 13px/1.5 Manrope,sans-serif;background:#E7F6EC;border-radius:14px;padding:12px;margin:14px 0 0">${esc(text)}</pre>`);
    $('#copyShare').onclick = async () => { try { await navigator.clipboard.writeText(text); toast('Texte copié'); } catch { toast('Sélectionnez le texte pour le copier'); } };
  };
  const box = $('#pricebox');
  if ('IntersectionObserver' in window && box) { buyObs = new IntersectionObserver(([en]) => buybar.classList.toggle('show', !en.isIntersecting && en.boundingClientRect.top < 0)); buyObs.observe(box); }
}
async function submitProfile(e) {
  e.preventDefault(); const f = e.target, err = $('#profErr');
  const full_name = f.full_name.value.replace(/[<>]/g, '').trim().slice(0, 80), quartier = f.quartier.value.replace(/[<>]/g, '').trim().slice(0, 80);
  if (full_name.length < 2) { err.innerHTML = '<div class="err">Indiquez votre nom.</div>'; return; }
  const { error } = await sb.from('profiles').update({ full_name, quartier }).eq('id', me.user.id);
  if (error) { err.innerHTML = '<div class="err">Modification impossible pour le moment.</div>'; return; }
  me.profile.full_name = full_name; me.profile.quartier = quartier;
  const c = store.get('fl-client', {}); store.set('fl-client', { ...c, name: full_name, quartier });
  toast('Informations enregistrées'); route(true);
}
async function submitPw(e) {
  e.preventDefault(); const f = e.target, err = $('#pwErr');
  const p1 = f.p1.value, p2 = f.p2.value;
  if (p1.length < 6) { err.innerHTML = '<div class="err">Le mot de passe doit contenir au moins 6 caractères.</div>'; return; }
  if (p1 !== p2) { err.innerHTML = '<div class="err">Les deux mots de passe ne sont pas identiques.</div>'; return; }
  const { error } = await sb.auth.updateUser({ password: p1 });
  if (error) { err.innerHTML = `<div class="err">${/same|different/i.test(error.message) ? 'Choisissez un mot de passe différent de l\'ancien.' : 'Modification impossible pour le moment.'}</div>`; return; }
  err.innerHTML = ''; f.reset(); f.closest('details').open = false; toast('Mot de passe modifié. Notez-le bien !');
}
async function submitReset(e) {
  e.preventDefault(); const f = e.target, err = $('#resetErr');
  const phone = normPhone(f.phone.value), password = f.password.value;
  if (!phone || password.length < 6) { err.innerHTML = '<div class="err">Numéro ou mot de passe (6 caractères min.) invalide.</div>'; return; }
  const { data, error } = await sb.functions.invoke('compte', { body: { action: 'reset_password', phone, password } });
  if (error || !data?.ok) { let m = 'Réinitialisation impossible.'; try { m = (await error.context.json()).error || m; } catch {} err.innerHTML = `<div class="err">${esc(m)}</div>`; return; }
  err.innerHTML = ''; f.reset(); toast('Mot de passe réinitialisé. Communiquez-le au client.');
}

/* ---------- événements globaux ---------- */
document.addEventListener('click', async e => {
  const a = e.target.closest('[data-add]');
  if (a) { e.preventDefault(); const p = byId[a.dataset.add];
    if (inCart(p.id)) { location.hash = 'liste'; return; }
    addToCart(p.id); a.classList.add('in'); a.innerHTML = check; toast(`${p.name} ajouté au panier`); return; }
  const cq = e.target.closest('[data-cq]');
  if (cq) { const k = cq.dataset.cq; cart[k] = (cart[k] || 0) + +cq.dataset.d; if (cart[k] <= 0) delete cart[k]; saveCart(); route(true); return; }
  const rm = e.target.closest('[data-rm]'); if (rm) { delete cart[rm.dataset.rm]; saveCart(); toast('Produit retiré du panier'); route(true); return; }
  if (e.target.closest('#clearBtn')) { if (clearArmed) { cart = {}; saveCart(); clearArmed = false; route(true); } else { clearArmed = true; e.target.closest('#clearBtn').textContent = 'Appuyez encore pour tout vider'; setTimeout(() => { clearArmed = false; const b = $('#clearBtn'); if (b) b.textContent = 'Vider le panier'; }, 3500); } return; }
  if (e.target.closest('#retryBackend')) { backend = 'checking'; route(true); await checkBackend(); route(true); return; }
  if (e.target.closest('#checkoutBtn')) { openCheckout(cartItems(), true); return; }
  if (e.target.closest('[data-search]')) { openSearch(); return; }
  const eye = e.target.closest('[data-eye]');
  if (eye) { const i = eye.parentElement.querySelector('input'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; eye.textContent = show ? 'Masquer' : 'Afficher'; return; }
  const ta = e.target.closest('[data-tab-auth]'); if (ta) { authTab = ta.dataset.tabAuth; route(true); return; }
  if (e.target.closest('#logoutBtn')) { await sb.auth.signOut(); me = null; ordersCache = null; adminOrders = null; toast('Vous êtes déconnecté.'); route(true); return; }
  const ro = e.target.closest('[data-reorder]');
  if (ro) { JSON.parse(ro.dataset.reorder).forEach(([id, v, q]) => byId[id] && addToCart(id, v, q)); toast('Produits ajoutés au panier'); location.hash = 'liste'; return; }
  const fl = e.target.closest('[data-af]'); if (fl) { adminFilter = fl.dataset.af; route(true); return; }
  if (e.target.closest('#refreshAdmin')) { adminOrders = null; route(true); loadAdmin(); }
});
document.addEventListener('change', async e => {
  if (e.target.id === 'sort') { sortMode = e.target.value; store.set('fl-sort', sortMode); route(true); }
  const st = e.target.closest('[data-status]');
  if (st) { const id = +st.dataset.status, status = st.value;
    const { error } = await sb.from('orders').update({ status }).eq('id', id);
    if (error) { toast('Mise à jour impossible'); return; }
    const o = adminOrders.find(x => x.id === id); if (o) o.status = status; toast(`Commande N° ${id} : ${STATUS[status]}`); route(true); }
});
$('#backBtn').onclick = () => { if (history.length > 1) history.back(); else location.hash = 'accueil'; };
window.addEventListener('hashchange', () => { closeSearch(); closeSheet(); route(); });
window.addEventListener('scroll', () => $('#top').classList.toggle('scrolled', scrollY > 4), { passive: true });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSearch(); closeSheet(); } });
let clearArmed = false;
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400); }

/* ---------- recherche ---------- */
const idx = P.map(p => ({ p, t: norm([p.name, p.code, p.code.replace(/#/g, ''), p.id, p.short, uById[p.u].name, p.benefits.join(' '), p.besoins.map(b => bById[b].name + ' ' + bById[b].desc).join(' ')].join(' ')) }));
const SYN = { diabete: 'glycemie', diabetique: 'glycemie', sucre: 'glycemie', ventre: 'poids', maigrir: 'poids', obesite: 'poids', mincir: 'poids', kilos: 'poids', toux: 'gorge', rhume: 'gorge', grippe: 'immunite', libido: 'sexuel', sexe: 'sexuel', erection: 'sexuel', bouton: 'bouton', dent: 'dent', dents: 'dent', yeux: 'yeux', oeil: 'yeux', tension: 'tension', hypertension: 'tension', constipation: 'transit', ballonnement: 'digestion', rides: 'rides', douleur: 'articulations', dos: 'articulations', genou: 'articulations', regles: 'cycle', menopause: 'menopause' };
function openSearch() { $('#overlay').classList.add('open'); $('#q').value = ''; renderSearch(''); setTimeout(() => $('#q').focus(), 50); }
function closeSearch() { $('#overlay').classList.remove('open'); }
$('#searchBtn').onclick = openSearch; $('#closeSearch').onclick = closeSearch;
$('#q').addEventListener('input', e => renderSearch(e.target.value));
function renderSearch(q) {
  const n = norm(q.trim()), res = $('#res');
  if (!n) {
    res.innerHTML = `<div class="label">Recherches fréquentes</div><div class="sugg">${['Aloe Vera Gel','prostate','ventre','articulations','fatigue','diabète','boutons','enfants','cheveux','immunité'].map(s => `<button class="chip" data-s="${s}">${s}</button>`).join('')}</div>
    <div class="label">Besoins</div><div class="needs-grid">${B.slice(0, 8).map(needCard).join('')}</div>`;
  } else {
    const terms = n.split(/\s+/).map(t => SYN[t] || t);
    const needs = B.filter(b => terms.every(t => norm(b.name + ' ' + b.desc + ' ' + b.id).includes(t)));
    const hits = idx.filter(x => terms.every(t => x.t.includes(t))).map(x => x.p).sort((a, b) => (norm(b.name).includes(terms[0]) ? 1 : 0) - (norm(a.name).includes(terms[0]) ? 1 : 0));
    res.innerHTML = `${needs.length ? `<div class="label">Besoins</div><div class="sugg">${needs.map(b => `<a class="tag-need" href="#besoin-${b.id}">${b.icon} ${esc(b.name)}</a>`).join('')}</div>` : ''}
      <div class="label">${hits.length} produit${hits.length > 1 ? 's' : ''}</div>
      ${hits.map(p => `<a class="hit" href="#produit-${p.id}"><span class="thumb"><img src="img/${p.img}.jpg" alt=""></span><span><b>${esc(p.name)}</b><small>${esc(p.code)} · ${esc(uById[p.u].short)}</small></span><span class="p tnum">${fmt(p.price)} F</span></a>`).join('') || '<p style="color:var(--muted)">Aucun produit trouvé. Essayez un autre mot (ex. « digestion », « crème », « 015 ») ou demandez conseil sur WhatsApp.</p>'}`;
  }
  res.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { $('#q').value = b.dataset.s; renderSearch(b.dataset.s); });
}

updateBadge();
route();
checkBackend().then(() => {
  if (/^#(compte|admin|liste)/.test(location.hash) || me) route(true);
  if (me && location.hash === '#compte' && !ordersCache) loadMyOrders();
  if (me?.profile?.is_admin && location.hash === '#admin' && !adminOrders) loadAdmin();
});
})();
