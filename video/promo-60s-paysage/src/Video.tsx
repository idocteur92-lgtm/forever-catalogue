import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, staticFile } from 'remotion';
import { Bg, F, FPS, OFF, Streaks, TOTAL, cl } from './core';
import { Phone } from './phone';
import { AppIntro, BesoinsText, CatalogueText, CommandeText, CompteText, Fin, NavText, Orbit, Story } from './scenes';

/* Bruitages : [seconde de la voix, fichier, volume] — discrets, calés sur chaque animation */
const sfx = (): [number, string, number][] => {
  const L: [number, string, number][] = [];
  const keys = (t: number, n: number, v = 0.09) => { for (let i = 0; i < n; i++) L.push([t + i * 0.055, 'key', v]); };
  const many = (ts: number[], s: string, v: number) => ts.forEach((t) => L.push([t, s, v]));
  // transitions (souffle léger)
  many([4.12, 10.9, 13.5, 18.4, 23.5, 27.7, 29.72, 31.7, 32.5, 33.4, 33.92, 39.48, 41.74, 45.0, 48.05, 52.6], 'air', 0.15);
  // histoire
  L.push([0.0, 'thump', 0.3]); keys(0.76, 7); keys(3.28, 8); keys(4.42, 9);
  many([4.5, 4.62, 4.8, 4.95, 5.3, 5.5, 5.8, 6.3, 6.6, 6.9], 'pop', 0.12);
  L.push([8.0, 'air', 0.22], [9.12, 'thump', 0.45], [9.2, 'blip', 0.24], [9.22, 'chime', 0.2], [10.08, 'tick', 0.2], [10.4, 'tick', 0.2]);
  // application
  keys(11.58, 6); L.push([11.26, 'blip2', 0.16]);
  // catalogue
  many([14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8], 'pop', 0.09);
  for (let i = 0; i < 9; i++) L.push([15.12 + i * 0.085, 'count', 0.08]);
  L.push([15.9, 'blip', 0.2], [16.64, 'pop', 0.16]); keys(17.2, 5);
  // menu du bas
  many([20.06, 20.78, 21.44, 22.04, 22.66], 'tick', 0.26); many([20.06, 20.78, 21.44, 22.04, 22.66], 'blip2', 0.12);
  // besoins
  keys(23.96, 6); many([24.8, 25.52, 26.34, 27.04], 'tick', 0.24); many([24.8, 25.52, 26.34, 27.04], 'pop', 0.14);
  L.push([27.5, 'tap', 0.4], [29.56, 'tap', 0.4]); keys(29.04, 9); L.push([30.14, 'blip', 0.22], [30.3, 'tick', 0.2], [30.98, 'blip2', 0.2]); keys(31.14, 7);
  // commande
  many([31.9, 31.97, 32.04, 32.1, 32.17, 32.24], 'pop', 0.1); keys(31.96, 10);
  many([32.68, 33.88, 36.94, 39.0], 'blip', 0.2);
  L.push([33.1, 'tap', 0.4], [33.22, 'pop', 0.16], [33.74, 'tap', 0.4]);
  keys(34.22, 9, 0.1); keys(35.04, 9, 0.1); keys(36.06, 9, 0.1);
  L.push([37.48, 'tick', 0.26], [38.32, 'tick', 0.26], [39.16, 'tap', 0.42], [40.0, 'pop', 0.3], [41.02, 'tick', 0.2], [41.25, 'pop', 0.22]);
  // compte
  keys(42.54, 6); keys(42.6, 8, 0.08); keys(43.26, 10, 0.08); keys(44.14, 8, 0.08);
  L.push([43.3, 'pop', 0.16], [44.2, 'pop', 0.16], [44.72, 'tap', 0.4], [45.02, 'blip', 0.2]);
  many([45.3, 45.5, 45.7, 45.9], 'tick', 0.22); L.push([46.34, 'blip2', 0.22], [47.38, 'tap', 0.42]);
  // fin
  L.push([48.14, 'thump', 0.5], [48.16, 'chime', 0.32]); many([50.02, 50.92, 51.8], 'tick', 0.16); L.push([52.72, 'blip', 0.2], [53.3, 'pop', 0.22]);
  return L;
};

const Promo: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <Orbit front={false} />
    <Story />
    <AppIntro />
    <CatalogueText />
    <NavText />
    <BesoinsText />
    <CommandeText />
    <CompteText />
    <Phone />
    <Orbit front />
    <Fin />
    {[4.2, 10.93, 13.54, 31.72, 41.75, 48.08].map((t, i) => <Streaks key={t} at={t} dir={i % 2 ? -1 : 1} />)}
    <Audio src={staticFile('music.wav')} volume={(x) => interpolate(x, [0, 8, F(54.9), F(55.6), TOTAL - 1], [0, 0.3, 0.3, 0.55, 0.55], cl)} />
    <Audio src={staticFile('voice.wav')} volume={1} />
    {sfx().map(([t, s, v], i) => <Sequence key={i} from={Math.max(0, Math.round((t + OFF) * FPS) - 1)}><Audio src={staticFile(`sfx/${s}.wav`)} volume={v} /></Sequence>)}
  </AbsoluteFill>
);

registerRoot(() => <Composition id="Promo" component={Promo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />);
