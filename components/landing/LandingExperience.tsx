'use client';

import React, { useState, useRef } from 'react';
import { LandingHeader } from './LandingHeader';
import { ArenaScene } from './ArenaScene';
import { uiAudio } from '../../lib/uiAudio';

export const LandingExperience: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [motionPaused, setMotionPaused] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    uiAudio.setSoundEnabled(enabled);
  };

  const handleToggleMotion = (paused: boolean) => {
    setMotionPaused(paused);
  };

  return (
    <div
      ref={pageRef}
      id="page-root"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-space)',
      }}
    >
      {/* Top Semantic Header with GDAI badge, nav, and sound/motion toggles */}
      <LandingHeader
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        motionPaused={motionPaused}
        onToggleMotion={handleToggleMotion}
      />

      {/* Primary Layered Arena Scene */}
      <ArenaScene motionPaused={motionPaused} pageRef={pageRef} />
    </div>
  );
};
