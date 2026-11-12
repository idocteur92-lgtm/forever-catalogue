import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from './theme';
import { SCENES, TXT } from './settings';
import { BgMesh, Check, Logo, Phone, PHONE_H, PHONE_W, Rise, Screen, SCREEN_H, SCREEN_W, STATUS, IMG_H, Tap, TypeText, WaIcon, clamp, ease, useExit } from './components';

const C = theme.colors;
const D = theme.fonts.display, B = theme.fonts.body;
const hero: React.CSSProperties = { fontFamily: D, fontWeight: 600, color: C.green, letterSpacing: '-0.03em', lineHeight: 1.04 };
const breathe = (f: number, k = 1) => Math.sin(f / 28) * 8 * k;

/* Pastille dorée derrière le mot héros */
const GoldWord: React.FC<{ text: string; at: number; size: number }> = ({ text, at, size }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: theme.spring.snappy });
  const pill = spring({ frame: f - at - 5, fps, config: theme.spring.bouncy });
  return (
    <span style={{ position: 'relative', display: 'inline-block', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [36, 0])}px)` }}>
      <span style={{ position: 'absolute', left: -18, right: -18, top: '12%', bottom: '2%', background: C.gold, borderRadius: size * 0.2, transform: `scaleX(${pill}) rotate(-1.5deg)`, transformOrigin: 'left center', zIndex: 0 }} />
      <span style={{ position: 'relative', zIndex: 1, color: C.green, fontStyle: 'italic' }}>{text}</span>
    </span>
  );
};

/* ───────── 1. ACCROCHE ───────── */
export const Intro: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ex = useExit(SCENES.intro.dur, 10);
  const lg = spring({ frame: f - 4, fps, config: theme.spring.bouncy });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', ...ex.style }}>
      <div style={{ position: 'absolute', top: 560, transform: `scale(${lg}) rotate(${interpolate(lg, [0, 1], [-25, 0])}deg) translateY(${breathe(f, 0.5)}px)`, opacity: Math.min(1, lg) }}>
        <Logo size={150} />
      </div>
      <div style={{ ...hero, fontSize: 132, textAlign: 'center', marginTop: 120 }}>
        <div style={{ height: 150 }}><TypeText text={TXT.hook1} start={12} per={1.8} /></div>
        <div style={{ display: 'flex', gap: 30, justifyContent: 'center', alignItems: 'baseline' }}>
          {TXT.hook2.map((w, i) => <Rise key={w} delay={38 + i * 4}>{w}</Rise>)}
        </div>
        <div style={{ marginTop: 8 }}><GoldWord text={TXT.hookHero} at={48} size={132} /></div>
      </div>
      <Rise delay={70} style={{ position: 'absolute', top: 1360, fontFamily: B, fontWeight: 700, fontSize: 36, color: C.muted, letterSpacing: '0.04em' }}>{TXT.hookSub}</Rise>
    </AbsoluteFill>
  );
};

/* ───────── 2. LE CATALOGUE ───────── */
const Stat: React.FC<{ n: number; label: string; at: number; x: number; y: number }> = ({ n, label, at, x, y }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: theme.spring.bouncy });
  const cnt = Math.round(interpolate(spring({ frame: f - at, fps, config: { damping: 30, stiffness: 60 } }), [0, 1], [0, n]));
  return (
    <div style={{ position: 'absolute', left: x, top: y + breathe(f + at * 3, 0.8), transform: `scale(${p})`, opacity: Math.min(1, p), display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 30, padding: '20px 30px', boxShadow: '0 24px 50px -20px rgba(22,64,47,.4)' }}>
      {n > 0 ? <span style={{ fontFamily: D, fontWeight: 700, fontSize: 64, color: C.green, fontVariantNumeric: 'tabular-nums' }}>{cnt}</span>
        : <span style={{ width: 54, height: 54, borderRadius: 16, background: C.green, display: 'grid', placeItems: 'center' }}><Check size={34} /></span>}
      <span style={{ fontFamily: B, fontWeight: 800, fontSize: 32, color: C.ink, lineHeight: 1.1 }}>{label}</span>
    </div>
  );
};

export const Catalogue: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ex = useExit(SCENES.catalogue.dur, 10);
  const enter = spring({ frame: f - 2, fps, config: theme.spring.smooth });
  // phase A : un téléphone qui se redresse et défile ; phase B : éventail de 3 téléphones
  const fan = spring({ frame: f - 96, fps, config: theme.spring.smooth });
  const scroll = ease(f, 44, 60, 0, 1, theme.ease.inOut);
  const swap = ease(f, 96, 110, 0, 1, theme.ease.inOut);
  const rotY = interpolate(enter, [0, 1], [-38, -10]) + interpolate(fan, [0, 1], [0, 10]) + Math.sin(f / 40) * 2;
  const rotX = interpolate(enter, [0, 1], [30, 8]) - interpolate(fan, [0, 1], [0, 8]);
  const mainScale = interpolate(fan, [0, 1], [0.9, 0.8]);
  const side = (dir: number, src: string, delay: number) => {
    const p = spring({ frame: f - 100 - delay, fps, config: theme.spring.smooth });
    return (
      <div style={{ position: 'absolute', left: '50%', top: 600, marginLeft: -PHONE_W / 2, transformOrigin: '50% 0%', opacity: Math.min(1, p * 1.4), transform: `translateX(${dir * interpolate(p, [0, 1], [0, 330])}px) translateY(${interpolate(p, [0, 1], [80, 90]) + breathe(f + delay * 9, 0.6)}px) rotateY(${dir * -22}deg) rotateZ(${dir * interpolate(p, [0, 1], [0, 7])}deg) scale(0.78)` }}>
        <Phone><Screen src={src} /></Phone>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ ...ex.style }}>
      <div style={{ position: 'absolute', top: 210, width: '100%', textAlign: 'center', ...hero, fontSize: 92 }}>
        <Rise delay={4}>{TXT.catTitle}</Rise><br />
        <span style={{ display: 'inline-flex', gap: 24 }}>
          <Rise delay={10} style={{ fontStyle: 'italic', color: C.green3 }}>{TXT.catTitle2}</Rise>
        </span>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 40, color: C.muted, letterSpacing: 0, marginTop: 18 }}><Rise delay={18}>{TXT.catTitle3}</Rise></div>
      </div>
      <AbsoluteFill style={{ perspective: 2200 }}>
        {side(-1, 'shots/besoins.png', 0)}
        {side(1, 'shots/produit.png', 5)}
        <div style={{ position: 'absolute', left: '50%', top: 560, marginLeft: -PHONE_W / 2, transformOrigin: '50% 0%', transformStyle: 'preserve-3d', transform: `translateY(${interpolate(enter, [0, 1], [900, 0]) + breathe(f)}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${mainScale})`, zIndex: 2 }}>
          <Phone>
            <Screen src="shots/home.png" y={scroll * 0.25} opacity={1 - scroll} />
            <Screen src="shots/home2.png" y={(scroll - 1) * 0.25} opacity={scroll * (1 - swap)} />
            <Screen src="shots/catalogue.png" opacity={swap} x={(1 - swap) * 120} />
          </Phone>
        </div>
      </AbsoluteFill>
      <Stat n={81} label={TXT.stats[0].label} at={118} x={80} y={1480} />
      <Stat n={25} label={TXT.stats[1].label} at={126} x={600} y={1360} />
      <Stat n={0} label={TXT.stats[2].label} at={134} x={330} y={1640} />
    </AbsoluteFill>
  );
};

/* ───────── 3. PAR BESOIN ───────── */
export const Besoins: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ex = useExit(SCENES.besoins.dur, 10);
  const enter = spring({ frame: f, fps, config: theme.spring.smooth });
  const swap = ease(f, 66, 80, 0, 1, theme.ease.inOut);
  const pos = [[90, 760], [700, 860], [60, 1150], [690, 1260], [120, 1520]];
  return (
    <AbsoluteFill style={{ ...ex.style }}>
      <div style={{ position: 'absolute', top: 230, width: '100%', textAlign: 'center', ...hero, fontSize: 104 }}>
        <TypeText text={TXT.besoinTitle} start={2} per={1.4} caret={false} /><br />
        <GoldWord text={TXT.besoinHero} at={22} size={104} />
      </div>
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div style={{ position: 'absolute', left: '50%', top: 610, marginLeft: -PHONE_W / 2, transform: `translateX(${interpolate(enter, [0, 1], [500, 0])}px) rotateY(${interpolate(enter, [0, 1], [40, 12]) + Math.sin(f / 40) * 2}deg) rotateX(6deg) scale(0.84) translateY(${breathe(f)}px)`, opacity: Math.min(1, enter * 1.5) }}>
          <Phone>
            <Screen src="shots/besoins.png" opacity={1 - swap} />
            <Screen src="shots/prostate.png" opacity={swap} x={(1 - swap) * 140} />
          </Phone>
        </div>
      </AbsoluteFill>
      {TXT.besoins.map((b, i) => {
        const p = spring({ frame: f - 14 - i * 5, fps, config: theme.spring.bouncy });
        const sel = i === 0 && f >= 60;
        const selP = ease(f, 60, 68, 0, 1);
        const fade = i === 0 ? 1 : ease(f, 62 + i * 2, 72 + i * 2, 1, 0, theme.ease.in);
        return (
          <div key={b} style={{ position: 'absolute', left: pos[i][0], top: pos[i][1] + breathe(f + i * 20, 0.7), transform: `scale(${p * (sel ? 1 + 0.08 * selP : 1)})`, opacity: Math.min(1, p) * fade, padding: '22px 36px', borderRadius: 999, background: sel ? C.green : '#fff', color: sel ? '#fff' : C.green, fontFamily: B, fontWeight: 800, fontSize: 40, boxShadow: '0 24px 50px -20px rgba(22,64,47,.45)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: sel ? C.leaf : C.green3 }} />{b}
          </div>
        );
      })}
      <Tap at={58} x={pos[0][0] + 150} y={pos[0][1] + 48} />
    </AbsoluteFill>
  );
};

/* ───────── 4. COMMANDER EN 3 ÉTAPES ───────── */
const STEP = 110;
const Stepper: React.FC<{ step: number; f: number }> = ({ step, f }) => (
  <div style={{ position: 'absolute', top: 470, left: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
    {TXT.stepShort.map((s, i) => {
      const on = i <= step; const cur = i === step;
      const lineP = ease(f - i * STEP, STEP - 16, STEP, 0, 1, theme.ease.inOut);
      return (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 200 }}>
            <div style={{ width: 76, height: 76, borderRadius: 38, display: 'grid', placeItems: 'center', background: on ? C.green : '#fff', color: on ? '#fff' : C.muted, fontFamily: B, fontWeight: 800, fontSize: 34, boxShadow: cur ? `0 0 0 10px ${C.mint}` : '0 10px 24px -12px rgba(22,64,47,.35)', transform: `scale(${cur ? 1.08 : 1})` }}>
              {i < step ? <Check size={40} /> : i + 1}
            </div>
            <div style={{ fontFamily: B, fontWeight: 800, fontSize: 28, color: on ? C.green : C.muted }}>{s}</div>
          </div>
          {i < 2 && <div style={{ width: 110, height: 6, borderRadius: 3, background: '#fff', marginTop: -40, overflow: 'hidden' }}><div style={{ width: `${(i < step ? 1 : lineP) * 100}%`, height: '100%', background: C.green3 }} /></div>}
        </React.Fragment>
      );
    })}
  </div>
);

const WhatsApp: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  const bub = spring({ frame: t - 14, fps, config: theme.spring.smooth });
  const tickBlue = t > 52;
  const reply = spring({ frame: t - 62, fps, config: theme.spring.snappy });
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.waBg }}>
      <div style={{ height: 140, background: C.waDark, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 18 }}>
        <Img src={staticFile('icon.svg')} style={{ width: 74, height: 74, borderRadius: 37 }} />
        <div style={{ color: '#fff', fontFamily: B }}>
          <div style={{ fontWeight: 800, fontSize: 30 }}>{TXT.waName}</div>
          <div style={{ fontWeight: 600, fontSize: 22, opacity: 0.85 }}>{TXT.phone}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 22, top: 180, width: 420, background: C.waBubble, borderRadius: 26, padding: 10, boxShadow: '0 6px 14px rgba(0,0,0,.08)', transform: `translateY(${interpolate(bub, [0, 1], [700, 0])}px) scale(${interpolate(bub, [0, 1], [0.7, 1])})`, transformOrigin: 'bottom right', opacity: Math.min(1, bub * 2) }}>
        <Img src={staticFile('shots/bon.jpg')} style={{ width: 400, borderRadius: 18, display: 'block' }} />
        <div style={{ fontFamily: B, fontSize: 25, fontWeight: 600, color: '#111', padding: '12px 8px 4px' }}>{TXT.waMsg}<br /><b>Total : {TXT.waTotal}</b></div>
        <div style={{ textAlign: 'right', fontFamily: B, fontSize: 19, color: '#667', paddingRight: 8, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
          10:24 <span style={{ display: 'inline-flex', marginLeft: 2 }}><Check size={22} color={tickBlue ? '#34B7F1' : '#8a9'} sw={2.6} /><span style={{ marginLeft: -14 }}><Check size={22} color={tickBlue ? '#34B7F1' : '#8a9'} sw={2.6} /></span></span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 22, top: 870, maxWidth: 420, background: '#fff', borderRadius: 26, padding: '18px 22px', fontFamily: B, fontSize: 26, fontWeight: 600, color: '#111', boxShadow: '0 6px 14px rgba(0,0,0,.08)', transform: `scale(${reply})`, transformOrigin: 'top left', opacity: Math.min(1, reply) }}>
        {TXT.waReply}
      </div>
    </div>
  );
};

export const Commande: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ex = useExit(SCENES.commande.dur, 10);
  const step = Math.min(2, Math.floor(f / STEP));
  const t = f - step * STEP;
  const enter = spring({ frame: f, fps, config: theme.spring.smooth });
  // transition entre étapes : le téléphone tourne sur lui-même (flip)
  const flip = (k: number) => ease(f, k * STEP - 8, k * STEP + 8, 0, 1, theme.ease.inOut);
  const rot = (flip(1) + flip(2)) * 360 + interpolate(enter, [0, 1], [-30, 0]);
  const s1scroll = ease(t, 22, 52, 0, 1, theme.ease.inOut);
  const formSwap = ease(t, 62, 74, 0, 1, theme.ease.inOut);
  const titleIn = (k: number) => spring({ frame: f - k * STEP - 4, fps, config: theme.spring.snappy });
  const titleOut = (k: number) => ease(f, (k + 1) * STEP - 8, (k + 1) * STEP, 1, 0, theme.ease.in);
  const fields = [0.467, 0.57, 0.673];
  return (
    <AbsoluteFill style={{ ...ex.style }}>
      <div style={{ position: 'absolute', top: 210, width: '100%', textAlign: 'center', ...hero, fontSize: 104 }}>
        <Rise delay={2}>{TXT.cmdTitle}</Rise>{' '}
        <Rise delay={8} style={{ fontStyle: 'italic', color: C.green3 }}>{TXT.cmdHero}</Rise>
      </div>
      <Rise delay={14} y={20} style={{ position: 'absolute', left: 0, width: '100%' }}><Stepper step={step} f={f} /></Rise>
      {TXT.steps.map((s, k) => k === step && (
        <div key={s} style={{ position: 'absolute', top: 1690, width: '100%', textAlign: 'center', fontFamily: B, fontWeight: 800, fontSize: 54, zIndex: 5, color: C.ink, opacity: titleIn(k) * (k < 2 ? titleOut(k) : 1), transform: `translateY(${interpolate(titleIn(k), [0, 1], [30, 0])}px)` }}>
          <span style={{ color: C.green3 }}>{k + 1}.</span> {s}
        </div>
      ))}
      <AbsoluteFill style={{ perspective: 2600 }}>
        <div style={{ position: 'absolute', left: '50%', top: 650, marginLeft: -PHONE_W / 2, transform: `translateY(${interpolate(enter, [0, 1], [900, 0]) + breathe(f, 0.6)}px) rotateY(${rot + Math.sin(f / 45) * 4}deg) scale(0.74)`, transformOrigin: '50% 0%' }}>
          <Phone>
            {step === 0 && <>
              <Screen src="shots/produit.png" opacity={1 - s1scroll} />
              <Screen src="shots/produit2.png" opacity={s1scroll} y={(1 - s1scroll) * -0.1} />
            </>}
            {step === 1 && <>
              <Screen src="shots/form-filled.png" opacity={1 - formSwap} />
              <Screen src="shots/form-bottom.png" opacity={formSwap} />
              {fields.map((y, i) => {
                const p = spring({ frame: t - 14 - i * 12, fps, config: theme.spring.bouncy });
                return <div key={i} style={{ position: 'absolute', left: SCREEN_W - 92, top: y * IMG_H - 24, width: 48, height: 48, borderRadius: 24, background: C.green3, display: 'grid', placeItems: 'center', transform: `scale(${p})`, opacity: (1 - formSwap) * Math.min(1, p) }}><Check size={30} /></div>;
              })}
            </>}
            {step === 2 && <WhatsApp t={t} />}
          </Phone>
          {step === 0 && <Tap at={70} x={18 + SCREEN_W / 2} y={18 + STATUS + 0.326 * IMG_H} />}
          {step === 1 && <Tap at={88} x={18 + SCREEN_W / 2} y={18 + STATUS + 0.891 * IMG_H} />}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────── 5. FIN : logo, QR code, WhatsApp ───────── */
export const Fin: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const lg = spring({ frame: f - 2, fps, config: theme.spring.bouncy });
  const qr = spring({ frame: f - 14, fps, config: theme.spring.smooth });
  const wa = spring({ frame: f - 24, fps, config: theme.spring.bouncy });
  const glow = 0.5 + 0.5 * Math.sin(f / 10);
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <div style={{ transform: `scale(${lg}) rotate(${interpolate(lg, [0, 1], [-20, 0])}deg)` }}><Logo size={140} /></div>
        <Rise delay={6} style={{ ...hero, fontSize: 86, textAlign: 'center' }}>{TXT.brand}</Rise>
        <Rise delay={10} style={{ fontFamily: B, fontWeight: 700, fontSize: 36, color: C.muted }}>{TXT.brandSub}</Rise>
      </div>
      <div style={{ position: 'absolute', top: 820, background: '#fff', borderRadius: 48, padding: 44, boxShadow: theme.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, transform: `translateY(${interpolate(qr, [0, 1], [120, 0]) + breathe(f, 0.5)}px) scale(${interpolate(qr, [0, 1], [0.85, 1])})`, opacity: Math.min(1, qr * 1.5) }}>
        <Img src={staticFile('qr.svg')} style={{ width: 400, height: 400 }} />
        <div style={{ fontFamily: B, fontWeight: 800, fontSize: 36, color: C.green }}>{TXT.scan}</div>
      </div>
      <div style={{ position: 'absolute', top: 1500, display: 'flex', alignItems: 'center', gap: 20, background: C.wa, color: '#fff', borderRadius: 999, padding: '26px 48px', fontFamily: B, fontWeight: 800, fontSize: 52, transform: `scale(${wa})`, boxShadow: `0 0 ${50 + glow * 30}px ${C.wa}66, 0 24px 50px -20px rgba(18,140,126,.6)` }}>
        <WaIcon size={60} /> {TXT.phone}
      </div>
      <Rise delay={34} style={{ position: 'absolute', top: 1660, fontFamily: B, fontWeight: 700, fontSize: 34, color: C.green2 }}>{TXT.url}</Rise>
    </AbsoluteFill>
  );
};
