'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LandingHeader } from './LandingHeader';
import { ArenaScene } from './ArenaScene';
import { SectionDivider } from './SectionDivider';
import { AboutGenesisSection } from '../ABout/AboutGenesisSection';
import { TimelineSection } from '../timeline';
import { SponsorsDivider } from '../sponsors/SponsorsDivider';
import { SponsorsSection } from '../sponsors/SponsorsSection';
import { SponsorsToPrizeDivider, PrizePoolSection } from '../prize-pool';
import { FAQSection } from '../FAQ';
import { ContactSection } from '../contact';
import {
  AboutToTimelineDivider,
  PrizeToFAQDivider,
  FAQToContactDivider,
} from '../dividers';
import { uiAudio } from '../../lib/uiAudio';

export const LandingExperience: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [motionPaused, setMotionPaused] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.motionPaused = motionPaused ? 'true' : 'false';
    }
  }, [motionPaused]);

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    uiAudio.setSoundEnabled(enabled);
  };

  const handleToggleMotion = (paused: boolean) => {
    setMotionPaused(paused);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.motionPaused = paused ? 'true' : 'false';
    }
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

      {/* 1. Compact Arena Structural Divider (Hero -> About) */}
      <SectionDivider motionPaused={motionPaused} />

      {/* About Genesis Section (Arena Briefing Board) */}
      <AboutGenesisSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 2. Chrono Milestone Roadmap Divider (About -> Timeline) */}
      <AboutToTimelineDivider motionPaused={motionPaused} />

      {/* Genesis Tournament Timeline Roadmap */}
      <TimelineSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 3. Royal Crown Structural Divider (Timeline -> Sponsors) */}
      <SponsorsDivider motionPaused={motionPaused} />

      {/* Sponsors Section (Interactive Sponsor Shop) */}
      <SponsorsSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 4. Purple Gem Structural Divider (Sponsors -> Prize Pool) */}
      <SponsorsToPrizeDivider motionPaused={motionPaused} />

      {/* Prize Pool Section (Two Illustrated Trophy Stages) */}
      <PrizePoolSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 5. Cyber Intel Crystal Structural Divider (Prize Pool -> FAQ) */}
      <PrizeToFAQDivider motionPaused={motionPaused} />

      {/* Genesis 6 Frequently Asked Questions Section */}
      <FAQSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 6. Radar Beacon & Tactical Stadium Divider (FAQ -> Contact Us) */}
      <FAQToContactDivider motionPaused={motionPaused} />

      {/* Genesis 6 Contact Us & Venue Section */}
      <ContactSection
        motionPaused={motionPaused}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};

