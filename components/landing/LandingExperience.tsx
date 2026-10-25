'use client';

import React, { useState, useRef } from 'react';
import { LandingHeader } from './LandingHeader';
import { ArenaScene } from './ArenaScene';
import { SectionDivider } from './SectionDivider';
import { AboutGenesisSection } from '../ABout/AboutGenesisSection';
import { SponsorsDivider } from '../sponsors/SponsorsDivider';
import { SponsorsSection } from '../sponsors/SponsorsSection';
import { SponsorsToPrizeDivider, PrizePoolSection } from '../prize-pool';
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
        overflowX: 'hidden',
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

      {/* Compact Arena Structural Divider */}
      <SectionDivider motionPaused={motionPaused} />

      {/* About Genesis Section (Arena Briefing Board) */}
      <AboutGenesisSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />

      {/* About-to-Sponsors Structural Divider */}
      <SponsorsDivider motionPaused={motionPaused} />

      {/* Sponsors Section (Interactive Sponsor Shop) */}
      <SponsorsSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />

      {/* Sponsors-to-Prize Structural Divider */}
      <SponsorsToPrizeDivider motionPaused={motionPaused} />

      {/* Prize Pool Section (Two Illustrated Trophy Stages) */}
      <PrizePoolSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};

