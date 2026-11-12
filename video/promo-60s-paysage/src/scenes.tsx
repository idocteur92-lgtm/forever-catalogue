import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, Check, E, F, Line, SANS, SERIF, SOFT, Squiggle, Tile, WaIcon, ez, sp } from './core';

const W = (w: string, t: number, o: Partial<{ box: boolean; hot: boolean }> = {}) => ({ w, t, ...o });

/* ═════ 1. L'HISTOIRE (0 – 8 s) ═════ */
const FLOAT = [
  { k: 'pill', txt: 'C\'est combien ?', x: 250, y: 210, r: -8, t: 4.5, z: 1 }, { k: 'tile', txt: '?', x: 1560, y: 170, r: 12, t: 4.62, z: 1.1 },
  { k: 'pill', txt: 'Ça sert à quoi ?', x: 1300, y: 800, r: 6, t: 4.8, z: 1 }, { k: 'tile', txt: 'F', x: 420, y: 830, r: -14, t: 4.95, z: 0.9 },
  { k: 'pill', txt: 'Lequel prendre ?', x: 130, y: 560, r: 5, t: 5.3, z: 0.8 }, { k: 'tile', txt: '?', x: 1720, y: 520, r: -10, t: 5.5, z: 0.8 },
  { k: 'tile', txt: '?', x: 840, y: 120, r: 8, t: 5.8, z: 0.7 }, { k: 'pill', txt: 'Quel prix ?', x: 1050, y: 930, r: -5, t: 6.3, z: 0.75 },
  { k: 'tile', txt: '😩', x: 700, y: 900, r: 10, t: 6.6, z: 0.85 }, { k: 'tile', txt: '?', x: 1480, y: 330, r: -16, t: 6.9, z: 0.6 },
];
export const Story: React.FC = () => {
  const f = useCurrentFrame();
  if (f > F(11.2)) return null;
  const suck = ez(f, F(8.0), F(8.55), 0, 1, E.inOut);
  const icon = sp(f, F(9.2) - 5, { damping: 11, stiffness: 150, mass: 0.7 });
  const iconOut = ez(f, F(10.78), F(10.98), 0, 1, E.in);
  const ring = ez(f, F(9.2) - 3, F(9.2) + 18, 0, 1, E.out);
  return (
    <AbsoluteFill>
      {/* clair */}
      <Line words={[W('Aminata', 0), W('était', 0.52), W('fatiguée', 0.76, { box: true }), W('tous', 1.3), W('les', 1.62), W('jours.', 1.8)]} end={2.46} x={1560} y={540} size={128} anchor="right" exit="left" />
      <Squiggle at={0.95} x={1230} y={590} d="M5 30 C 25 80, 55 85, 60 40 S 85 10, 95 55" size={170} />
      <Line words={[W('Elle', 2.52), W('voulait', 2.66), W('des', 2.88), W('produits', 3.06), W('naturels…', 3.28, { box: true })]} end={4.16} x={1620} y={540} size={128} anchor="right" exit="left" />
      <Squiggle at={3.45} x={1500} y={300} d="M10 80 C 30 20, 60 20, 90 60" size={150} color={C.gold} />
      {/* sombre : le problème */}
      {FLOAT.map((o, i) => {
        const a = F(o.t);
        if (f < a || suck >= 1) return null;
        const k = sp(f, a, SOFT);
        const dx = (f - a) * -0.9 * o.z, dy = (f - a) * -0.55 * o.z + Math.sin((f + i * 20) / 22) * 10;
        const x = o.x + dx + (960 - o.x - dx) * suck, y = o.y + dy + (540 - o.y - dy) * suck;
        const sc = k * o.z * (1 - suck);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) perspective(900px) rotateY(${o.r * 2}deg) rotate(${o.r + suck * 90}deg) scale(${sc})`, filter: `blur(${(1 - o.z) * 7 + suck * 6}px)`, opacity: Math.min(1, k * 2) }}>
            {o.k === 'pill'
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(240,240,236,.95)', borderRadius: 30, padding: '18px 34px 18px 20px', fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#1b241f', boxShadow: '0 30px 50px -20px rgba(0,0,0,.5)' }}><span style={{ width: 54, height: 54, borderRadius: 18, background: C.wa, display: 'grid', placeItems: 'center' }}><WaIcon size={34} /></span>{o.txt}</div>
              : <Tile size={120} bg={o.txt === '😩' ? 'linear-gradient(145deg,#FFE28A,#F2B230)' : undefined}>{o.txt}</Tile>}
          </div>
        );
      })}
      <Line words={[W('mais', 4.22), W('impossible', 4.42, { box: true }), W('de', 5.1), W('connaître', 5.42), W('les', 5.76), W('prix,', 5.98, { hot: true })]} end={6.22} x={1640} y={540} size={118} anchor="right" color="#fff" boxBg={C.gold} boxInk={C.dark} exit="left" />
      <Line words={[W('ni', 6.24), W('de', 6.74), W('savoir', 6.88), W('quoi', 7.14, { hot: true }), W('prendre.', 7.32, { hot: true })]} end={8.08} x={960} y={540} size={118} anchor="center" color="#fff" />
      <Squiggle at={7.35} x={1330} y={600} d="M5 50 C 30 10, 50 90, 95 40" size={170} color={C.gold} />
      {/* la découverte */}
      <Line words={[W('Puis,', 8.18), W('elle', 8.58), W('a', 8.68), W('découvert', 8.76, { hot: true })]} end={9.16} x={960} y={540} size={104} anchor="center" color="#fff" />
      {f >= F(9.2) - 5 && (
        <div style={{ position: 'absolute', left: 960, top: 400, opacity: 1 - iconOut, transform: `translate(-50%,-50%) scale(${1 - iconOut * 0.3})`, filter: `blur(${iconOut * 14}px)` }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 300 + ring * 500, height: 300 + ring * 500, marginLeft: -(150 + ring * 250), marginTop: -(150 + ring * 250), borderRadius: '50%', border: `${8 * (1 - ring)}px solid ${C.lime}`, opacity: 1 - ring }} />
          <Img src={staticFile('logo.png')} style={{ width: 330, height: 330, borderRadius: '50%', transform: `scale(${icon}) rotate(${(1 - Math.min(1, icon)) * -30}deg)`, boxShadow: '0 40px 90px -20px rgba(0,0,0,.6), 0 0 90px rgba(182,238,124,.35)' }} />
        </div>
      )}
      <Line words={[W('Objectif', 9.2), W('Santé', 10.08, { hot: true }), W('Durable', 10.4, { hot: true })]} end={10.98} x={960} y={770} size={112} anchor="center" color="#fff" />
    </AbsoluteFill>
  );
};

/* ═════ 2. L'APPLICATION (11 – 13,4 s) ═════ */
export const AppIntro: React.FC = () => (
  <AbsoluteFill>
    <Line words={[W('Une', 11.12), W('application', 11.26)]} end={13.42} x={150} y={410} size={112} exit="left" />
    <Line words={[W('simple,', 11.58, { box: true })]} end={13.42} x={150} y={560} size={132} exit="left" />
    <Line words={[W('sur', 12.22), W('votre', 12.58), W('téléphone.', 12.78)]} end={13.42} x={150} y={710} size={92} exit="left" />
    <Squiggle at={11.75} x={610} y={470} d="M10 60 C 35 10, 65 100, 92 35" size={150} />
    <Squiggle at={12.9} x={860} y={720} d="M10 30 C 30 85, 70 85, 90 30" size={110} color={C.gold} />
  </AbsoluteFill>
);

/* ═════ 3. LE CATALOGUE : produits en orbite autour du téléphone (13,7 – 18,2 s) ═════ */
const ORB = ['prod/715.png', 'prod/196.png', 'prod/374.webp', 'prod/034.png', 'prod/289.webp', 'prod/absorbent-c.jpg', 'prod/active-ha.jpg', 'prod/arctic-sea.jpg'];
export const Orbit: React.FC<{ front: boolean }> = ({ front }) => {
  const f = useCurrentFrame();
  const a = F(13.9), b = F(18.2);
  if (f < a || f > b + 10) return null;
  const out = ez(f, b - 2, b + 9, 0, 1, E.in);
  const ringK = ez(f, a, a + 20, 0, 1, E.out);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {!front && [330, 500].map((R, i) => <svg key={i} width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}><ellipse cx="960" cy="560" rx={R * (0.7 + 0.3 * ringK) * (1 + out * 0.4)} ry={R * 0.4 * (0.7 + 0.3 * ringK) * (1 + out * 0.4)} fill="none" stroke="rgba(182,238,124,.5)" strokeWidth="2.5" strokeDasharray="10 12" opacity={ringK} /></svg>)}
      {ORB.map((src, i) => {
        const R = (i % 2 ? 500 : 330) * (1 + out * 0.5), th = (i / ORB.length) * Math.PI * 2 + f * (i % 2 ? 0.016 : -0.021);
        const z = Math.sin(th);
        if ((z > 0) !== front) return null;
        const k = sp(f, a + 6 + i * 3);
        const size = (i % 2 ? 128 : 108) * (0.82 + 0.22 * z);
        return (
          <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(th) * R, top: 560 + z * R * 0.4, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fff, #E9F5DF)', boxShadow: `0 0 0 4px rgba(182,238,124,.85), 0 20px 40px -12px rgba(0,0,0,.55)`, overflow: 'hidden', display: 'grid', placeItems: 'center', transform: `scale(${k})`, filter: `blur(${z < -0.4 ? 1.5 : 0}px)` }}>
            <Img src={staticFile(src)} style={{ height: size * 0.84, width: size * 0.84, objectFit: 'contain', mixBlendMode: src.endsWith('.jpg') ? 'multiply' : 'normal' }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const CatalogueText: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(15.12);
  if (f < F(13.6) || f > F(18.3)) return null;
  const n = Math.round(81 * ez(f, a, a + 24, 0, 1, E.soft));
  const k = sp(f, a - 2), o = ez(f, F(18.2) - 7, F(18.2), 0, 1, E.in);
  const tag = sp(f, F(16.74) - 4);
  return (
    <AbsoluteFill>
      <Line words={[W('Tout', 13.7), W('le', 13.8), W('catalogue', 13.96)]} end={18.2} x={90} y={300} size={60} color="#fff" exit="left" />
      <Line words={[W('Forever', 14.38, { hot: true })]} end={18.2} x={90} y={385} size={76} color="#fff" exit="left" />
      <div style={{ position: 'absolute', left: 84, top: 440, fontFamily: SANS, fontWeight: 800, fontSize: 250, letterSpacing: '-0.05em', color: C.gold, lineHeight: 1, fontVariantNumeric: 'tabular-nums', opacity: Math.min(1, k * 2) * (1 - o), transform: `scale(${0.7 + 0.3 * Math.min(1.05, k)}) translateX(${-o * 200}px)`, transformOrigin: 'left center', filter: `blur(${(1 - Math.min(1, k)) * 14 + o * 14}px)`, textShadow: '0 0 60px rgba(242,194,48,.35)' }}>{n}</div>
      <Line words={[W('produits', 15.58)]} end={18.2} x={92} y={760} size={84} color="#fff" exit="left" />
      <div style={{ position: 'absolute', left: 1500, top: 250, transform: `scale(${tag}) rotate(${-8 + Math.sin(f / 25) * 4}deg)`, opacity: 1 - o }}><Tile size={120} bg="linear-gradient(145deg,#FFE28A,#E8A915)" style={{ color: C.dark }}>F</Tile></div>
      <Line words={[W('Prix', 16.74), W('en', 16.98)]} end={18.2} x={1500} y={480} size={86} color="#fff" />
      <Line words={[W('F CFA', 17.2, { box: true })]} end={18.2} x={1500} y={600} size={92} boxBg={C.gold} boxInk={C.dark} />
    </AbsoluteFill>
  );
};

/* ═════ 4. LE MENU DU BAS (18,3 – 23,3 s) ═════ */
const TABS: [string, number][] = [['Accueil', 20.06], ['Produits', 20.78], ['Besoins', 21.44], ['Panier', 22.04], ['Compte', 22.66]];
export const NavText: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(18.2) || f > F(23.5)) return null;
  return (
    <AbsoluteFill>
      <Line words={[W('En', 18.26), W('bas,', 18.38, { hot: true })]} end={23.3} x={70} y={360} size={84} color="#fff" exit="left" />
      <Line words={[W('tout', 18.88), W('est', 18.94), W('à', 19.12)]} end={23.3} x={70} y={470} size={62} color="#fff" exit="left" />
      <Line words={[W('portée', 19.22), W('de', 19.54), W('main.', 19.62)]} end={23.3} x={70} y={555} size={62} color="#fff" exit="left" />
      <Squiggle at={19.7} x={380} y={590} d="M5 40 C 30 90, 60 0, 95 50" size={130} dur={8} hold={90} />
      {TABS.map(([name, t], i) => {
        const end = i < 4 ? TABS[i + 1][1] - 0.02 : 23.3;
        const a = F(t);
        const k = sp(f, a - 2);
        const vis = f >= a - 3 && f <= F(end);
        return (
          <React.Fragment key={name}>
            {vis && <div style={{ position: 'absolute', left: 1400, top: 330, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.lime, letterSpacing: '0.12em', opacity: Math.min(1, k) }}>{i + 1} / 5</div>}
            <Line words={[W(name, t, { box: true })]} end={end} x={1400} y={470} size={92} boxBg={C.gold} boxInk={C.dark} exit="up" />
            {vis && <div style={{ position: 'absolute', left: 1400, top: 560, display: 'flex', gap: 12 }}>{TABS.map((_, j) => <div key={j} style={{ width: j === i ? 54 : 16, height: 16, borderRadius: 8, background: j === i ? C.gold : 'rgba(255,255,255,.3)' }} />)}</div>}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═════ Ligne « icône + mot » ═════ */
const Item: React.FC<{ at: number; end: number; x: number; y: number; icon: string; text: string; size?: number; color?: string; dimAt?: number }> = ({ at, end, x, y, icon, text, size = 72, color = '#fff', dimAt }) => {
  const f = useCurrentFrame(); const a = F(at) - 2, e = F(end);
  if (f < a || f > e + 1) return null;
  const k = sp(f, a), t = ez(f, a + 2, a + 12, 0, 1, E.soft), o = ez(f, e - 7, e, 0, 1, E.in);
  const dim = dimAt ? ez(f, F(dimAt) - 2, F(dimAt) + 6, 1, 0.45) : 1;
  return (
    <div style={{ position: 'absolute', left: x, top: y - size * 0.7, display: 'flex', alignItems: 'center', gap: size * 0.4, opacity: (1 - o) * dim, filter: `blur(${o * 12}px)`, transform: `translateX(${o * 80}px)` }}>
      <div style={{ transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * -40 + Math.sin((f + y) / 28) * 4}deg)` }}><Tile size={size * 1.25} bg="linear-gradient(145deg,#FFFFFF,#DDF3D2)">{icon}</Tile></div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: '-0.03em', color, opacity: t, filter: `blur(${(1 - t) * 12}px)`, transform: `translateX(${(1 - t) * 40}px)`, whiteSpace: 'nowrap' }}>{text}</div>
    </div>
  );
};

/* ═════ 5. LES BESOINS, LES PRODUITS CONSEILLÉS, LA FICHE (23,4 – 31,7 s) ═════ */
export const BesoinsText: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(23.2) || f > F(31.9)) return null;
  const X = 1070;
  const ck = sp(f, F(30.14) - 3);
  return (
    <AbsoluteFill>
      <Line words={[W('Choisissez', 23.36), W('votre', 23.76)]} end={27.76} x={X} y={210} size={74} color="#fff" />
      <Line words={[W('besoin', 23.96, { box: true })]} end={27.76} x={X} y={320} size={96} boxBg={C.gold} boxInk={C.dark} />
      <Item at={24.8} end={27.76} x={X} y={500} icon="⚡" text="Fatigue" dimAt={25.52} />
      <Item at={25.52} end={27.76} x={X} y={630} icon="🌿" text="Digestion" dimAt={26.34} />
      <Item at={26.34} end={27.76} x={X} y={760} icon="🚹" text="Prostate" dimAt={27.04} />
      <Item at={27.04} end={27.76} x={X} y={890} icon="⚖️" text="Surpoids" />
      <Line words={[W('tout', 28.06), W('de', 28.34), W('suite', 28.46)]} end={30.06} x={1000} y={330} size={62} color={C.lime} />
      <Line words={[W('les', 28.64), W('produits', 28.8)]} end={30.06} x={1000} y={470} size={112} color="#fff" />
      <Line words={[W('conseillés', 29.04, { box: true })]} end={30.06} x={1000} y={620} size={112} boxBg={C.gold} boxInk={C.dark} />
      <Squiggle at={29.2} x={1640} y={640} d="M10 20 C 40 90, 70 90, 90 30" size={130} />
      {f >= F(30.14) - 3 && f < F(30.94) && <div style={{ position: 'absolute', left: 1180, top: 330, transform: `scale(${ck}) rotate(${-6 + Math.sin(f / 20) * 4}deg)`, opacity: ez(f, F(30.94) - 6, F(30.94), 1, 0) }}><Tile size={130}><Check size={84} /></Tile></div>}
      <Line words={[W('Bienfaits', 30.14)]} end={30.94} x={1170} y={600} size={128} color={C.gold} exit="up" />
      <Line words={[W('Mode', 30.98)]} end={31.68} x={1170} y={480} size={112} color="#fff" exit="left" />
      <Line words={[W('d\'emploi', 31.14, { box: true })]} end={31.68} x={1170} y={630} size={112} boxBg={C.gold} boxInk={C.dark} exit="left" />
    </AbsoluteFill>
  );
};

/* ═════ 6. COMMANDER (31,8 – 41,7 s) ═════ */
const EMO = [['🛒', 330, 250, -12], ['📦', 1560, 230, 10], ['💬', 250, 800, 8], ['✅', 1620, 810, -8], ['🚚', 940, 170, 6], ['🛍️', 1000, 900, -10]] as const;
const STEPS: [string, number][] = [['Ajoutez au panier', 32.68], ['Nom, téléphone, quartier', 33.88], ['Livraison ou retrait', 36.94], ['Envoi sur WhatsApp', 39.0]];
export const CommandeText: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(31.7) || f > F(41.95)) return null;
  const out = ez(f, F(41.68) - 8, F(41.68), 0, 1, E.in);
  return (
    <AbsoluteFill>
      {EMO.map(([e, x, y, r], i) => {
        const a = F(31.9) + i * 2, k = sp(f, a), o = ez(f, F(32.6) - 5, F(32.6) + 3, 0, 1, E.in);
        if (f < a || o >= 1) return null;
        return <div key={i} style={{ position: 'absolute', left: x, top: y + Math.sin((f + i * 30) / 16) * 12, fontSize: 110, transform: `translate(-50%,-50%) scale(${k * (1 - o)}) rotate(${r + Math.sin((f + i * 9) / 14) * 8}deg)`, filter: `blur(${o * 10}px)` }}>{e}</div>;
      })}
      <Line words={[W('Pour', 31.84), W('commander ?', 31.96, { box: true })]} end={32.64} x={960} y={540} size={156} anchor="center" />
      <div style={{ position: 'absolute', left: 120, top: 190, fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: '0.16em', color: C.green3, opacity: ez(f, F(32.68), F(32.68) + 10, 0, 1) * (1 - out) }}>COMMENT COMMANDER</div>
      {STEPS.map(([txt, t], i) => {
        const a = F(t) - 2;
        if (f < a) return null;
        const k = sp(f, a), tk = ez(f, a + 2, a + 12, 0, 1, E.soft);
        const next = i < 3 ? F(STEPS[i + 1][1]) - 2 : 1e9;
        const done = sp(f, next), isDone = f >= next;
        const active = !isDone;
        const sc = 1 + 0.07 * (active ? Math.min(1, k) : 1 - Math.min(1, done));
        return (
          <div key={i} style={{ position: 'absolute', left: 120, top: 280 + i * 150, display: 'flex', alignItems: 'center', gap: 28, opacity: 1 - out, filter: `blur(${out * 12}px)`, transform: `translateX(${-out * 160}px) scale(${sc})`, transformOrigin: 'left center' }}>
            <div style={{ width: 88, height: 88, borderRadius: 30, background: isDone ? C.green3 : C.gold, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.dark, transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * -30}deg)`, boxShadow: '0 22px 34px -14px rgba(20,60,30,.5), inset 0 3px 0 rgba(255,255,255,.4), inset 0 -5px 0 rgba(0,0,0,.12)' }}>
              {isDone ? <div style={{ transform: `scale(${Math.min(1.1, done)})` }}><Check size={50} /></div> : i + 1}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, letterSpacing: '-0.03em', color: isDone ? '#5d6b62' : C.ink, opacity: tk, filter: `blur(${(1 - tk) * 12}px)`, transform: `translateX(${(1 - tk) * 40}px)`, whiteSpace: 'nowrap' }}>{txt}</div>
          </div>
        );
      })}
      {[0, 1, 2].map((i) => {
        const a = F(40.05) + i * 7; const k = ez(f, a, a + 26, 0, 1, E.inOut);
        if (f < a || k >= 1) return null;
        return <svg key={i} width="70" height="70" viewBox="0 0 24 24" style={{ position: 'absolute', left: 1150 - k * (700 + i * 160), top: 520 - k * (300 - i * 210) - Math.sin(k * Math.PI) * 120, transform: `rotate(${-150 + i * 22 - k * 30}deg)`, opacity: Math.sin(k * Math.PI), filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.25))' }}><path d="M3 11.5L21 3l-6 18-3.5-7.2z" fill={C.wa} stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" /></svg>;
      })}
    </AbsoluteFill>
  );
};

/* ═════ 7. LE COMPTE (41,9 – 47,9 s) ═════ */
const STAT = ['Reçue', 'Confirmée', 'En préparation', 'Livrée'];
export const CompteText: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(41.7) || f > F(48.2)) return null;
  const X = 1080;
  const re = sp(f, F(46.34) - 4);
  return (
    <AbsoluteFill>
      <Line words={[W('Créez', 41.9), W('aussi', 42.14), W('votre', 42.3)]} end={44.94} x={X} y={250} size={84} color="#fff" />
      <Line words={[W('compte', 42.54, { box: true })]} end={44.94} x={X} y={380} size={112} boxBg={C.gold} boxInk={C.dark} />
      <Item at={43.3} end={44.94} x={X} y={590} icon="📱" text="Votre numéro" size={66} />
      <Item at={44.2} end={44.94} x={X} y={730} icon="🔒" text="Un mot de passe" size={66} />
      <Line words={[W('Vous', 45.0), W('suivez', 45.08, { hot: true })]} end={46.28} x={X} y={330} size={96} color="#fff" />
      <Line words={[W('vos', 45.44), W('commandes', 45.56, { box: true })]} end={46.28} x={X} y={470} size={96} color="#fff" boxBg={C.gold} boxInk={C.dark} />
      {f >= F(45.3) && f <= F(46.28) && (
        <div style={{ position: 'absolute', left: X, top: 600, display: 'flex', gap: 14, alignItems: 'center', opacity: ez(f, F(46.28) - 7, F(46.28), 1, 0), fontFamily: SANS, fontWeight: 800, fontSize: 30 }}>
          {STAT.map((s, i) => { const k = sp(f, F(45.3) + i * 6); const on = f >= F(45.3) + i * 6 + 2; return <div key={s} style={{ padding: '14px 22px', borderRadius: 999, background: on ? (i === 3 ? C.lime : 'rgba(182,238,124,.22)') : 'rgba(255,255,255,.1)', color: on ? (i === 3 ? C.dark : C.lime) : 'rgba(255,255,255,.5)', transform: `scale(${0.8 + 0.2 * Math.min(1.1, k)})`, opacity: Math.min(1, k * 2), whiteSpace: 'nowrap' }}>{s}</div>; })}
        </div>
      )}
      {f >= F(46.34) - 4 && <div style={{ position: 'absolute', left: X, top: 230, transform: `scale(${re}) rotate(${(f - F(46.34)) * 3}deg)`, opacity: ez(f, F(47.95) - 7, F(47.95), 1, 0) }}><Tile size={120} bg="linear-gradient(145deg,#FFFFFF,#DDF3D2)">🔁</Tile></div>}
      <Line words={[W('Recommandez', 46.34)]} end={47.96} x={X} y={500} size={104} color={C.gold} />
      <Line words={[W('en', 46.92), W('un', 47.18), W('clic.', 47.38)]} end={47.96} x={X} y={640} size={104} color="#fff" />
    </AbsoluteFill>
  );
};

/* ═════ 8. FIN : logo, devise, QR code, WhatsApp (48,2 – 60 s) ═════ */
export const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(48.16) - 3;
  if (f < a) return null;
  const k = sp(f, a, { damping: 13, stiffness: 120, mass: 0.9 });
  const ring = ez(f, a + 2, a + 30, 0, 1, E.out);
  const qr = sp(f, F(52.72) - 3, SOFT), wa = sp(f, F(53.3) - 2);
  const fl = Math.sin(f / 40) * 8;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 500, top: 540 + fl, transform: 'translate(-50%,-50%)' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 660 + ring * 500, height: 660 + ring * 500, marginLeft: -(330 + ring * 250), marginTop: -(330 + ring * 250), borderRadius: '50%', border: `${10 * (1 - ring)}px solid ${C.gold}`, opacity: 1 - ring }} />
        <Img src={staticFile('logo.png')} style={{ width: 700, height: 700, borderRadius: '50%', display: 'block', transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * -24}deg)`, boxShadow: `0 60px 120px -30px rgba(0,0,0,.7), 0 0 ${90 + Math.sin(f / 18) * 30}px rgba(242,194,48,.35)` }} />
      </div>
      <Line words={[W('Votre', 49.78), W('santé,', 50.02, { hot: true })]} end={99} x={990} y={190} size={92} color="#fff" font={SERIF} weight={600} italic />
      <Line words={[W('votre', 50.76), W('force,', 50.92, { hot: true })]} end={99} x={990} y={305} size={92} color="#fff" font={SERIF} weight={600} italic />
      <Line words={[W('votre', 51.66), W('avenir.', 51.8, { hot: true })]} end={99} x={990} y={420} size={92} color="#fff" font={SERIF} weight={600} italic />
      <div style={{ position: 'absolute', left: 990, top: 520 - fl * 0.5, background: '#fff', borderRadius: 40, padding: 30, display: 'flex', alignItems: 'center', gap: 34, boxShadow: '0 50px 100px -30px rgba(0,0,0,.6)', opacity: Math.min(1, qr * 1.5), transform: `translateY(${(1 - qr) * 120}px) scale(${0.85 + 0.15 * qr})`, filter: `blur(${(1 - Math.min(1, qr)) * 14}px)` }}>
        <Img src={staticFile('qr.svg')} style={{ width: 250, height: 250 }} />
        <div style={{ fontFamily: SANS, color: C.ink, width: 420 }}>
          <div style={{ fontWeight: 800, fontSize: 46, lineHeight: 1.08, letterSpacing: '-0.02em' }}>Scannez<br />le catalogue</div>
          <div style={{ fontWeight: 700, fontSize: 25, color: C.muted, marginTop: 14 }}>81 produits Forever · prix en F CFA</div>
          <div style={{ fontWeight: 800, fontSize: 23, color: C.green3, marginTop: 8 }}>forever-catalogue-eight.vercel.app</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 990, top: 880, display: 'flex', alignItems: 'center', gap: 20, background: C.wa, color: '#fff', borderRadius: 999, padding: '24px 48px', fontFamily: SANS, fontWeight: 800, fontSize: 56, transform: `scale(${wa})`, transformOrigin: 'left center', boxShadow: `0 0 ${50 + Math.sin(f / 10) * 20}px rgba(37,211,102,.45), 0 26px 50px -20px rgba(37,211,102,.7)` }}>
        <WaIcon size={62} /> +227 70 29 09 81
      </div>
    </AbsoluteFill>
  );
};
