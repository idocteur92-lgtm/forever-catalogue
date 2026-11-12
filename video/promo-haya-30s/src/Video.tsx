import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { T } from './theme';
import { FPS, HOOK, HOOK_END, PHRASES, TOTAL_S, at, find } from './timeline';
import { Backdrop, CardStage, Kinetic, Logo, WaIcon, cl, ez, fr, sp } from './core';
import { AccueilCard, BesoinsCard, CommandeCard, ProduitCard, WhatsAppCard } from './cards';

export const VOICE = false; // passer à true quand public/voice.mp3 (ElevenLabs) est prêt
const C = T.c;

/* Accroche : un gros mot par écran, qui arrive avec un flou de mouvement horizontal */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {HOOK.map((h, i) => {
        const a = fr(h.t), b = fr(i < HOOK.length - 1 ? HOOK[i + 1].t : HOOK_END);
        if (f < a || f >= b) return null;
        const inK = ez(f, a, a + 8, 0, 1, T.e.out);
        const outK = ez(f, b - 5, b, 0, 1, T.e.in);
        const blur = (1 - inK) * 40 + outK * 50;
        const x = (1 - inK) * 300 - outK * 340;
        const id = `mb${i}`;
        return (
          <AbsoluteFill key={i} style={{ alignItems: 'center', justifyContent: 'center' }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}><filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={`${blur} ${blur * 0.08}`} /></filter></svg>
            <div style={{ fontFamily: T.f.sans, fontWeight: 800, fontSize: h.text.length > 12 ? 128 : 158, letterSpacing: '-0.04em', color: C.ink, textAlign: 'center', lineHeight: 1.02, padding: '0 60px', transform: `translateX(${x}px) scale(${1 + (1 - inK) * 0.06})`, filter: `url(#${id})`, opacity: Math.min(1, inK * 2) * (1 - outK * 0.6) }}>
              {h.text} <span style={{ color: C.accent }}>{h.q}</span>
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/* Fin : fond vert nuit, logo, nom, devise, WhatsApp + QR code */
const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const p = find('fin');
  const a = fr(p.start);
  const lg = sp(f, a, T.s.pop);
  const name = ez(f, a + 8, a + 20, 0, 1, T.e.soft);
  const tCta = fr(26.0);
  const cta = sp(f, tCta, T.s.card);
  const pill = sp(f, tCta + 8, T.s.pop);
  if (f < a - 2) return null;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 330 - (cta * 90), width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ transform: `scale(${lg}) rotate(${(1 - Math.min(1, lg)) * -18}deg)`, filter: `drop-shadow(0 30px 50px rgba(0,0,0,.35))` }}><Logo size={170} style={{ boxShadow: '0 0 0 3px rgba(255,255,255,.22), 0 0 80px rgba(232,179,26,.35)' }} /></div>
        <div style={{ marginTop: 40, fontFamily: T.f.sans, fontWeight: 800, fontSize: 76, letterSpacing: '-0.03em', color: '#fff', opacity: name, filter: `blur(${(1 - name) * 12}px)`, transform: `translateY(${(1 - name) * 20}px)` }}>Objectif Santé Durable</div>
      </div>
      <Kinetic p={p} top={680 - cta * 90} size={56} color="rgba(255,255,255,.82)" accent={C.gold} />
      <div style={{ position: 'absolute', top: 900, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: Math.min(1, cta * 1.5), filter: `blur(${(1 - Math.min(1, cta)) * 16}px)`, transform: `translateY(${(1 - cta) * 80}px)` }}>
        <div style={{ background: '#fff', borderRadius: 44, padding: 34, display: 'flex', alignItems: 'center', gap: 34, boxShadow: '0 40px 90px -30px rgba(0,0,0,.55)' }}>
          <Img src={staticFile('qr.svg')} style={{ width: 300, height: 300 }} />
          <div style={{ fontFamily: T.f.sans, color: C.ink, width: 300 }}>
            <div style={{ fontWeight: 800, fontSize: 38, lineHeight: 1.1 }}>Scannez le catalogue</div>
            <div style={{ fontWeight: 600, fontSize: 24, color: C.muted, marginTop: 12, lineHeight: 1.35 }}>81 produits Forever, prix en F CFA</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: C.wa, color: '#fff', borderRadius: 999, padding: '26px 50px', fontFamily: T.f.sans, fontWeight: 800, fontSize: 52, transform: `scale(${pill})`, boxShadow: '0 24px 50px -20px rgba(37,211,102,.7)' }}>
          <WaIcon size={58} /> +227 70 29 09 81
        </div>
        <div style={{ fontFamily: T.f.sans, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,.7)', opacity: ez(f, tCta + 16, tCta + 30, 0, 1) }}>forever-catalogue-eight.vercel.app</div>
      </div>
    </AbsoluteFill>
  );
};

/* Effets sonores calés sur l'animation : [seconde, fichier, volume] */
const sfx = (): [number, string, number][] => {
  const L: [number, string, number][] = [];
  HOOK.forEach((h) => { L.push([h.t - 0.02, 'thump', 0.5]); L.push([h.t - 0.06, 'air', 0.12]); });
  const cards = ['accueil', 'produit', 'besoins', 'commande', 'whatsapp'];
  cards.forEach((id) => { const p = find(id); L.push([p.start - 0.08, 'air', 0.18]); L.push([p.start + 0.2, 'blip', 0.22]); });
  // accueil : frappe de la recherche + compteurs
  const ts = at('accueil', 'Objectif') + 0.2;
  for (let i = 0; i < 19; i += 2) L.push([ts + i * 2 / FPS, 'key', 0.1]);
  const tc = at('accueil', 'catalogue');
  for (let i = 0; i < 9; i++) L.push([tc + i * 0.09, 'count', 0.07]);
  // produit : éventail, prix, bienfaits, conseil
  L.push([find('produit').start + 0.15, 'air', 0.12]);
  L.push([at('produit', 'prix'), 'blip2', 0.2]);
  for (let i = 0; i < 3; i++) L.push([at('produit', 'bienfaits') + i * 0.2, 'tick', 0.22]);
  L.push([at('produit', 'conseils'), 'pop', 0.16]);
  // besoins
  ['prostate', 'articulations', 'minceur'].forEach((w) => L.push([at('besoins', w), 'tick', 0.26]));
  // commande
  L.push([at('commande', 'panier') - 0.2, 'pop', 0.16]); L.push([at('commande', 'panier'), 'pop', 0.16]);
  const tf = at('commande', 'remplissez');
  for (let i = 0; i < 40; i += 2) L.push([tf + i / FPS, 'key', 0.08]);
  L.push([find('commande').end - 0.33, 'tap', 0.4]);
  // whatsapp
  L.push([at('whatsapp', 'bon') - 0.13, 'pop', 0.3]);
  L.push([at('whatsapp', 'WhatsApp') + 0.2, 'tick', 0.18]);
  L.push([at('whatsapp', 'WhatsApp') + 1.13, 'pop', 0.24]);
  // fin
  L.push([find('fin').start - 0.05, 'chime', 0.32]);
  L.push([26.0, 'air', 0.15]); L.push([26.25, 'blip', 0.2]);
  return L;
};

export const Promo: React.FC = () => {
  const f = useCurrentFrame();
  const finA = fr(find('fin').start) - 6;
  const night = ez(f, finA, finA + 12, 0, 1, T.e.inOut);
  const glows: Record<string, string> = { accueil: 'rgba(143,209,158,.55)', produit: 'rgba(232,179,26,.35)', besoins: 'rgba(232,179,26,.30)', commande: 'rgba(143,209,158,.5)', whatsapp: 'rgba(37,211,102,.28)' };
  const cur = PHRASES.find((p) => f >= fr(p.start) - 6 && f < fr(p.end) + 4);
  const top = 760;
  return (
    <AbsoluteFill>
      <Backdrop night={night} glow={cur ? glows[cur.id] || 'rgba(232,179,26,.3)' : 'rgba(232,179,26,.3)'} />
      <Hook />
      {PHRASES.filter((p) => p.id !== 'fin').map((p) => <Kinetic key={p.id} p={p} top={400} size={68} />)}
      <CardStage from={find('accueil').start} to={find('accueil').end + 0.1} top={top}><AccueilCard /></CardStage>
      <CardStage from={find('produit').start} to={find('produit').end + 0.1} top={top - 20} width={800}><ProduitCard /></CardStage>
      <CardStage from={find('besoins').start} to={find('besoins').end + 0.1} top={top + 40}><BesoinsCard /></CardStage>
      <CardStage from={find('commande').start} to={find('commande').end} top={top - 40}><CommandeCard /></CardStage>
      <CardStage from={find('whatsapp').start} to={find('whatsapp').end + 0.2} top={top - 20}><WhatsAppCard /></CardStage>
      <Fin />
      <Audio src={staticFile('music.wav')} volume={(x) => interpolate(x, [0, 6, fr(TOTAL_S) - 20, fr(TOTAL_S)], [0, VOICE ? 0.42 : 0.8, VOICE ? 0.42 : 0.8, 0], cl)} />
      {VOICE && <Audio src={staticFile('voice.mp3')} volume={1} />}
      {sfx().map(([t, s, v], i) => <Sequence key={i} from={Math.max(0, fr(t))}><Audio src={staticFile(`sfx/${s}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
