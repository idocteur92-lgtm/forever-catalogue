import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { SCENES, TOTAL } from './settings';
import { BgMesh, Grade, Grain, Vignette, clamp } from './components';
import { Besoins, Catalogue, Commande, Fin, Intro } from './scenes';

// Effets sonores : [image, fichier, volume] — placés 2-3 images AVANT l'image clé
const SFX: [number, string, number][] = [
  [3, 'pop', 0.5], [46, 'shimmer', 0.35],
  [117, 'whoosh', 0.6], [216, 'whoosh', 0.35], [236, 'pop', 0.4], [244, 'pop', 0.4], [252, 'pop', 0.4],
  [327, 'whoosh', 0.6], [342, 'pop', 0.35], [347, 'pop', 0.35], [352, 'pop', 0.35], [357, 'pop', 0.35], [362, 'pop', 0.35], [388, 'click', 0.6],
  [447, 'whoosh', 0.6], [518, 'click', 0.6], [552, 'whoosh', 0.45], [575, 'tick', 0.5], [587, 'tick', 0.5], [599, 'tick', 0.5], [646, 'click', 0.6],
  [662, 'whoosh', 0.45], [690, 'whoosh', 0.4], [702, 'ding', 0.5], [735, 'pop', 0.4],
  [777, 'whoosh', 0.6], [782, 'shimmer', 0.4], [804, 'pop', 0.45],
];

export const Promo: React.FC = () => (
  <AbsoluteFill>
    <BgMesh />
    <Sequence from={SCENES.intro.from} durationInFrames={SCENES.intro.dur}><Intro /></Sequence>
    <Sequence from={SCENES.catalogue.from} durationInFrames={SCENES.catalogue.dur}><Catalogue /></Sequence>
    <Sequence from={SCENES.besoins.from} durationInFrames={SCENES.besoins.dur}><Besoins /></Sequence>
    <Sequence from={SCENES.commande.from} durationInFrames={SCENES.commande.dur}><Commande /></Sequence>
    <Sequence from={SCENES.fin.from} durationInFrames={SCENES.fin.dur}><Fin /></Sequence>
    <Grade />
    <Grain />
    <Vignette />
    <Audio src={staticFile('music.wav')} volume={(f) => interpolate(f, [0, 10, TOTAL - 30, TOTAL], [0, 0.85, 0.85, 0], clamp)} />
    {SFX.map(([at, s, v], i) => (
      <Sequence key={i} from={at}><Audio src={staticFile(`sfx/${s}.wav`)} volume={v} /></Sequence>
    ))}
  </AbsoluteFill>
);
