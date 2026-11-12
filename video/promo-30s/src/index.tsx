import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Promo } from './Video';
import { FPS, H, TOTAL, W } from './settings';

const Root: React.FC = () => (
  <Composition id="Promo" component={Promo} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
registerRoot(Root);
