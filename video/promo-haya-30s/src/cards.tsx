import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { T } from './theme';
import { at, find } from './timeline';
import { Card, Caret, CheckDot, Logo, WaIcon, ez, fr, sp, typed } from './core';

const C = T.c;
const muted: React.CSSProperties = { color: C.muted, fontWeight: 600 };
const money = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');

/* ───── 1. Accueil de l'application ───── */
export const AccueilCard: React.FC = () => {
  const f = useCurrentFrame();
  const p = find('accueil');
  const tSearch = fr(at('accueil', 'Objectif')) + 6;
  const tCount = fr(at('accueil', 'catalogue'));
  const tPhone = fr(at('accueil', 'téléphone'));
  const n = (v: number) => Math.round(v * ez(f, tCount, tCount + 26, 0, 1, T.e.soft));
  const q = 'prostate, Aloe gel…';
  const pulse = ez(f, tPhone, tPhone + 8, 0, 1) * ez(f, tPhone + 8, tPhone + 20, 1, 0, T.e.inOut);
  return (
    <Card pad={26}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '6px 10px 22px' }}>
        <Logo size={70} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 32 }}>Objectif Santé Durable</div>
          <div style={{ ...muted, fontSize: 22 }}>Catalogue Forever 2025</div>
        </div>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: C.cream, display: 'grid', placeItems: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
      </div>
      <div style={{ borderRadius: 36, padding: '34px 32px 30px', background: `linear-gradient(150deg, ${C.green2}, #0F2E21)`, color: '#fff', transform: `scale(${1 + pulse * 0.015})` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(232,179,26,.18)', color: C.gold, borderRadius: 999, padding: '9px 18px', fontWeight: 800, fontSize: 19, letterSpacing: '0.06em' }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: C.gold }} /> NOUVEAUX TARIFS 2025
        </div>
        <div style={{ fontFamily: T.f.title, fontWeight: 600, fontSize: 54, lineHeight: 1.06, margin: '22px 0 16px', letterSpacing: '-0.02em' }}>
          L'Aloe vera au service de votre <span style={{ color: C.gold, fontStyle: 'italic' }}>bien-être</span>
        </div>
        <div style={{ fontSize: 23, lineHeight: 1.4, opacity: 0.82, fontWeight: 500 }}>Tous les produits Forever, leurs prix, leurs bienfaits et les conseils d'utilisation.</div>
        <div style={{ marginTop: 24, background: '#fff', color: C.ink, borderRadius: 26, height: 84, display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px', fontSize: 27, fontWeight: 600 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          {f < tSearch ? <span style={{ color: '#9aa29d' }}>Rechercher…</span> : <span>{typed(q, f, tSearch, 2)}<Caret on={f < tCount + 30} /></span>}
        </div>
        <div style={{ display: 'flex', gap: 46, marginTop: 30 }}>
          {[[81, 'produits'], [25, 'besoins santé'], [10, 'catégories']].map(([v, l]) => (
            <div key={l as string}>
              <div style={{ fontFamily: T.f.title, fontSize: 60, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{n(v as number)}</div>
              <div style={{ fontSize: 21, opacity: 0.75, fontWeight: 600, marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

/* ───── 2. Fiche produit (avec deux autres produits derrière) ───── */
const Mini: React.FC<{ src: string; name: string; price: number; k: number; dir: number }> = ({ src, name, price, k, dir }) => (
  <div style={{ position: 'absolute', top: 90, left: '50%', width: 330, marginLeft: -165, transform: `translateX(${dir * 250 * k}px) rotate(${dir * 9 * k}deg) scale(${0.86})`, opacity: Math.min(1, k * 2) * 0.96 }}>
    <Card pad={18} style={{ borderRadius: 34 }}>
      <div style={{ height: 300, borderRadius: 24, background: C.cream, display: 'grid', placeItems: 'center' }}><Img src={staticFile(src)} style={{ height: 270 }} /></div>
      <div style={{ fontWeight: 800, fontSize: 24, marginTop: 14 }}>{name}</div>
      <div style={{ fontWeight: 800, fontSize: 26, color: C.green, marginTop: 6 }}>{money(price)} F CFA</div>
    </Card>
  </div>
);

export const ProduitCard: React.FC = () => {
  const f = useCurrentFrame();
  const p = find('produit');
  const tDeck = fr(p.start) + 4;
  const tPrix = fr(at('produit', 'prix'));
  const tBien = fr(at('produit', 'bienfaits'));
  const tCons = fr(at('produit', 'conseils'));
  const deck = sp(f, tDeck, T.s.soft);
  const hl = sp(f, tPrix, T.s.pop);
  const ben = ['Bonne digestion, transit régulier', 'Meilleure absorption des nutriments', 'Soutient les défenses naturelles'];
  const cons = sp(f, tCons, T.s.pop);
  const kb = interpolate(f, [fr(p.start), fr(p.end)], [1, 1.07]);
  return (
    <div style={{ position: 'relative', height: 1060 }}>
      <Mini src="prod/196.png" name="Forever Freedom" price={32000} k={deck} dir={-1} />
      <Mini src="prod/034.png" name="Aloe Berry Nectar" price={22000} k={deck} dir={1} />
      <div style={{ position: 'absolute', left: 40, right: 40, top: 0 }}>
        <Card pad={24}>
          <div style={{ height: 380, borderRadius: 32, background: `radial-gradient(circle at 50% 60%, #fff 0%, ${C.cream} 70%)`, display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <Img src={staticFile('prod/715.png')} style={{ height: 400, transform: `scale(${kb}) translateY(18px)` }} />
            <div style={{ position: 'absolute', top: 22, left: 22, background: C.gold, color: C.green, fontWeight: 800, fontSize: 18, letterSpacing: '0.06em', padding: '8px 16px', borderRadius: 999 }}>INCONTOURNABLE</div>
          </div>
          <div style={{ padding: '22px 12px 4px' }}>
            <div style={{ ...muted, fontSize: 21 }}>#015 · Boissons à l'Aloe · 1 litre</div>
            <div style={{ fontFamily: T.f.title, fontWeight: 600, fontSize: 48, letterSpacing: '-0.02em', marginTop: 6 }}>Forever Aloe Vera Gel</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <div style={{ position: 'relative', padding: '8px 18px', marginLeft: -18 }}>
                <div style={{ position: 'absolute', inset: 0, background: C.goldSoft, border: `3px solid ${C.gold}`, borderRadius: 20, transform: `scaleX(${hl})`, transformOrigin: 'left', opacity: Math.min(1, hl) }} />
                <span style={{ position: 'relative', fontFamily: T.f.title, fontSize: 52, fontWeight: 700, color: C.green }}>22 000 <span style={{ fontFamily: T.f.sans, fontSize: 24, fontWeight: 800 }}>F CFA</span></span>
              </div>
              <div style={{ width: 70, height: 70, borderRadius: 22, background: C.green, display: 'grid', placeItems: 'center' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </div>
            </div>
            <div style={{ height: 2, background: C.line, margin: '22px 0 18px' }} />
            <div style={{ fontWeight: 800, fontSize: 25, marginBottom: 12, opacity: ez(f, tBien - 4, tBien + 6, 0.35, 1) }}>Bienfaits</div>
            {ben.map((b, i) => {
              const k = sp(f, tBien + i * 6, T.s.pop);
              return (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, opacity: 0.35 + 0.65 * Math.min(1, k), transform: `translateX(${(1 - Math.min(1, k)) * 14}px)` }}>
                  <CheckDot k={k} size={38} /><span style={{ fontSize: 25, fontWeight: 600 }}>{b}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 14, borderRadius: 24, background: C.mint, padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'center', opacity: Math.min(1, cons), transform: `translateY(${(1 - Math.min(1, cons)) * 30}px) scale(${0.95 + 0.05 * Math.min(1, cons)})` }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill={C.green3}><path d="M12 22c-.5-5-3-9-8-11 5 .3 8 3 8 8 .3-6 2.5-11 7-15-2 5-3.5 10-7 18z" /></svg>
              <div style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.35 }}><b>Conseil :</b> 40 ml dans un verre d'eau, jusqu'à 3 fois par jour, avant les repas.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ───── 3. Recherche par besoin ───── */
const ICONS: Record<string, React.ReactNode> = {
  prostate: <path d="M12 3v6m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />,
  articulations: <path d="M7 4a3 3 0 0 1 4 4l6 6a3 3 0 1 1-3 3l-6-6a3 3 0 0 1-1-7z" />,
  poids: <><path d="M4 20h16l-2-11H6z" /><circle cx="12" cy="6" r="2.5" /></>,
  digestion: <path d="M12 21c-.5-5-3-9-8-11 5 .3 8 3 8 8 .3-6 2.5-11 7-15-2 5-3.5 10-7 18z" />,
};
export const BesoinsCard: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { id: 'prostate', name: 'Prostate & confort urinaire', n: 2, w: 'prostate', col: '#3D6FB6' },
    { id: 'articulations', name: 'Articulations & douleurs', n: 8, w: 'articulations', col: '#D9532C' },
    { id: 'poids', name: 'Surpoids & minceur', n: 12, w: 'minceur', col: '#7A5BB5' },
    { id: 'digestion', name: 'Digestion & transit', n: 10, w: '', col: C.green3 },
  ];
  return (
    <Card pad={34}>
      <div style={{ fontFamily: T.f.title, fontWeight: 600, fontSize: 56, letterSpacing: '-0.02em' }}>Par besoin</div>
      <div style={{ ...muted, fontSize: 24, margin: '6px 0 24px' }}>Choisissez votre besoin, on vous montre les produits conseillés.</div>
      {rows.map((r, i) => {
        const tw = r.w ? fr(at('besoins', r.w)) : 1e9;
        const k = sp(f, tw, T.s.pop);
        const on = Math.min(1, k);
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 22px', borderRadius: 28, marginBottom: 14, background: on > 0.01 ? `rgba(255,244,209,${on})` : C.cream, border: `3px solid ${on > 0.01 ? `rgba(232,179,26,${on})` : 'transparent'}`, transform: `scale(${1 + 0.03 * on * (1 - ez(f, tw + 10, tw + 24, 0, 1))})` }}>
            <div style={{ width: 70, height: 70, borderRadius: 22, background: r.col, display: 'grid', placeItems: 'center', flex: 'none' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{ICONS[r.id]}</svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 29 }}>{r.name}</div>
              <div style={{ ...muted, fontSize: 22, marginTop: 4, color: on > 0.5 ? C.green3 : C.muted }}>{r.n} produits conseillés →</div>
            </div>
            <CheckDot k={k} size={44} bg={C.gold} />
          </div>
        );
      })}
    </Card>
  );
};

/* ───── 4. Panier + formulaire ───── */
export const CommandeCard: React.FC = () => {
  const f = useCurrentFrame();
  const p = find('commande');
  const tCart = fr(at('commande', 'panier'));
  const tFill = fr(at('commande', 'remplissez'));
  const tBtn = fr(p.end) - 10;
  const items = [
    { src: 'prod/715.png', name: 'Forever Aloe Vera Gel', q: '2 × 22 000 F', tot: 44000 },
    { src: 'prod/196.png', name: 'Forever Freedom', q: '1 × 32 000 F', tot: 32000 },
  ];
  const fields = [['Nom complet', 'Aïcha Moussa'], ['Téléphone (WhatsApp)', '+227 90 12 34 56'], ['Quartier', 'Plateau, Niamey']];
  const press = ez(f, tBtn, tBtn + 3, 0, 1) * ez(f, tBtn + 3, tBtn + 9, 1, 0);
  const totalK = ez(f, tCart + 6, tCart + 22, 0, 1, T.e.soft);
  return (
    <Card pad={34}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: T.f.title, fontWeight: 600, fontSize: 48, letterSpacing: '-0.02em' }}>Ma commande</div>
        <div style={{ position: 'relative', width: 66, height: 66, borderRadius: 20, background: C.cream, display: 'grid', placeItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.3" strokeLinejoin="round"><path d="M5 8h14l-1.2 11H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
          <div style={{ position: 'absolute', top: -8, right: -8, width: 34, height: 34, borderRadius: 17, background: C.gold, color: C.green, fontWeight: 800, fontSize: 19, display: 'grid', placeItems: 'center', transform: `scale(${sp(f, tCart + 8, T.s.pop)})` }}>3</div>
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        {items.map((it, i) => {
          const k = sp(f, tCart - 6 + i * 6, T.s.pop);
          return (
            <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', borderBottom: `2px solid ${C.line}`, opacity: Math.min(1, k), transform: `translateX(${(1 - Math.min(1, k)) * 60}px)` }}>
              <div style={{ width: 82, height: 82, borderRadius: 20, background: C.cream, display: 'grid', placeItems: 'center', flex: 'none' }}><Img src={staticFile(it.src)} style={{ height: 74 }} /></div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 26 }}>{it.name}</div><div style={{ ...muted, fontSize: 21 }}>{it.q}</div></div>
              <div style={{ fontWeight: 800, fontSize: 26 }}>{money(it.tot)} F</div>
            </div>
          );
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0 6px', opacity: totalK }}>
          <span style={{ fontWeight: 800, fontSize: 26 }}>Total</span>
          <span style={{ fontFamily: T.f.title, fontWeight: 700, fontSize: 40, color: C.green, fontVariantNumeric: 'tabular-nums' }}>{money(Math.round(76000 * totalK / 500) * 500)} F CFA</span>
        </div>
      </div>
      {fields.map(([l, v], i) => {
        const st = tFill + i * 8;
        const act = f >= st && f < st + 9;
        return (
          <div key={l} style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.muted, marginBottom: 7 }}>{l}</div>
            <div style={{ height: 70, borderRadius: 20, border: `3px solid ${act ? C.green3 : C.line}`, background: act ? '#fff' : C.cream, display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: 26, fontWeight: 600, boxShadow: act ? `0 0 0 6px ${C.mint}` : 'none' }}>
              {typed(v, f, st, 0.5)}<Caret on={act} />
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 24, height: 88, borderRadius: 26, background: C.wa, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontWeight: 800, fontSize: 29, transform: `scale(${1 - press * 0.05})`, boxShadow: `0 16px 30px -14px ${C.wa}` }}>
        <WaIcon size={36} /> Envoyer sur WhatsApp
      </div>
    </Card>
  );
};

/* ───── 5. Conversation WhatsApp ───── */
export const WhatsAppCard: React.FC = () => {
  const f = useCurrentFrame();
  const tBub = fr(at('whatsapp', 'bon')) - 4;
  const tWa = fr(at('whatsapp', 'WhatsApp'));
  const b = sp(f, tBub, T.s.card);
  const blue = f > tWa + 4;
  const typing = f > tWa + 4 && f < tWa + 12;
  const rep = sp(f, tWa + 12, T.s.pop);
  const ticks = (c: string) => (
    <span style={{ display: 'inline-flex' }}>
      {[0, 1].map((i) => <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: i ? -15 : 0 }}><path d="M5 12.5l4.2 4.2L19 7" /></svg>)}
    </span>
  );
  return (
    <Card pad={0} style={{ background: C.waBg }}>
      <div style={{ background: C.waDark, color: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '26px 30px' }}>
        <Logo size={72} style={{ borderRadius: 36 }} />
        <div><div style={{ fontWeight: 800, fontSize: 30 }}>Objectif Santé Durable</div><div style={{ fontSize: 22, opacity: 0.85, fontWeight: 600 }}>{typing ? 'écrit…' : 'en ligne'}</div></div>
      </div>
      <div style={{ height: 860, position: 'relative', padding: 24 }}>
        <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 14, padding: '8px 18px', fontSize: 19, fontWeight: 700, color: C.muted }}>AUJOURD'HUI</div>
        <div style={{ position: 'absolute', right: 26, top: 90, width: 470, background: C.waBubble, borderRadius: '28px 8px 28px 28px', padding: 10, boxShadow: '0 4px 10px rgba(0,0,0,.08)', transformOrigin: '100% 100%', transform: `translateY(${(1 - b) * 300}px) scale(${0.6 + 0.4 * b})`, opacity: Math.min(1, b * 2) }}>
          <Img src={staticFile('bon.jpg')} style={{ width: 450, borderRadius: 20, display: 'block' }} />
          <div style={{ fontSize: 24, fontWeight: 600, padding: '12px 10px 0', lineHeight: 1.35 }}>Bonjour ! Voici ma commande N° 1024<br /><b>Total : 76 000 F CFA</b></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, fontSize: 18, color: '#667', padding: '0 8px 4px' }}>10:24 {ticks(blue ? C.tickBlue : '#8a9a92')}</div>
        </div>
        {typing && (
          <div style={{ position: 'absolute', left: 26, top: 760, background: '#fff', borderRadius: '8px 28px 28px 28px', padding: '20px 26px', display: 'flex', gap: 9 }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 13, height: 13, borderRadius: 7, background: '#9aa', transform: `translateY(${Math.sin((f + i * 5) / 4) * 4}px)` }} />)}
          </div>
        )}
        <div style={{ position: 'absolute', left: 26, top: 740, maxWidth: 520, background: '#fff', borderRadius: '8px 28px 28px 28px', padding: '18px 24px', fontSize: 25, fontWeight: 600, lineHeight: 1.35, boxShadow: '0 4px 10px rgba(0,0,0,.08)', transformOrigin: '0 0', transform: `scale(${Math.min(1, rep)})`, opacity: Math.min(1, rep * 2) }}>
          Merci ! Votre commande est bien reçue.
        </div>
      </div>
    </Card>
  );
};
