import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Promo } from './Video';
import { FPS, TOTAL_S } from './timeline';

registerRoot(() => <Composition id="Promo" component={Promo} durationInFrames={TOTAL_S * FPS} fps={FPS} width={1080} height={1920} />);
