'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LandingHeader } from './LandingHeader';
import { ArenaScene } from './ArenaScene';
import { BrawlStatsTimer } from './BrawlStatsTimer';
import { SectionDivider } from './SectionDivider';
import { AboutGenesisSection } from '../ABout/AboutGenesisSection';
import { TimelineSection } from '../timeline';
import { SponsorsDivider } from '../sponsors/SponsorsDivider';
import { SponsorsSection } from '../sponsors/SponsorsSection';
import { SponsorsToPrizeDivider, PrizePoolSection } from '../prize-pool';
import { FAQSection } from '../FAQ';
import { ContactSection } from '../contact';
import { AboutToTimelineDivider, PrizeToFAQDivider, FAQToContactDivider } from '../dividers';
import { MemoriesSection } from '../memories';
import { uiAudio } from '../../lib/uiAudio';

export const LandingExperience: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [userMotionPaused, setUserMotionPaused] = useState<boolean>(false);
  const [osReducedMotion, setOsReducedMotion] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const effectiveMotionPaused = userMotionPaused || osReducedMotion;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      setOsReducedMotion(mql.matches);
      const handleMotionPreference = (e: MediaQueryListEvent) => {
        setOsReducedMotion(e.matches);
      };
      mql.addEventListener('change', handleMotionPreference);
      return () => mql.removeEventListener('change', handleMotionPreference);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.motionPaused = effectiveMotionPaused ? 'true' : 'false';
    }
  }, [effectiveMotionPaused]);

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    uiAudio.setSoundEnabled(enabled);
  };

  const handleToggleMotion = (paused: boolean) => {
    setUserMotionPaused(paused);
  };

  return (
    <div
      ref={pageRef}
      id="page-root"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'clip',
        backgroundColor: 'var(--color-bg-space)',
      }}
    >
      {/* Top Semantic Header with GDAI badge, nav, and sound/motion toggles */}
      <LandingHeader
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        motionPaused={effectiveMotionPaused}
        onToggleMotion={handleToggleMotion}
      />

      {/* Primary Layered Arena Scene */}
      <ArenaScene motionPaused={effectiveMotionPaused} pageRef={pageRef} />

      {/* Brawl Stars Countdown Timer & Match Dates (Figma brawler-stats-table) */}
      <BrawlStatsTimer motionPaused={effectiveMotionPaused} />

      {/* 1. Compact Arena Structural Divider (Hero -> About) */}
      <SectionDivider motionPaused={effectiveMotionPaused} />

      {/* About Genesis Section (Arena Briefing Board) */}
      <AboutGenesisSection
        motionPaused={effectiveMotionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 2. Chrono Milestone Roadmap Divider (About -> Timeline) */}
      <AboutToTimelineDivider motionPaused={effectiveMotionPaused} />

      {/* Genesis Tournament Timeline Roadmap */}
      <TimelineSection
        motionPaused={effectiveMotionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 3. Purple Gem Structural Divider (Timeline -> Prize Pool) */}
      <SponsorsToPrizeDivider motionPaused={effectiveMotionPaused} />

      {/* Prize Pool Section (Two Illustrated Trophy Stages) */}
      <PrizePoolSection
        motionPaused={effectiveMotionPaused}
        soundEnabled={soundEnabled}
      />

      {/* Memories Section (Photo Scrapbook Journey) */}
      <MemoriesSection motionPaused={effectiveMotionPaused} />

      {/* 4. Royal Crown Structural Divider (Memories -> Sponsors) */}
      <SponsorsDivider motionPaused={effectiveMotionPaused} />

      {/* Sponsors Section (Interactive Sponsor Shop) */}
      <SponsorsSection
        motionPaused={effectiveMotionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 5. Cyber Intel Crystal Structural Divider (Sponsors -> FAQ) */}
      <PrizeToFAQDivider motionPaused={effectiveMotionPaused} />

      {/* Genesis 6 Frequently Asked Questions Section */}
      <FAQSection
        motionPaused={effectiveMotionPaused}
        soundEnabled={soundEnabled}
      />

      {/* 6. Radar Beacon & Tactical Stadium Divider (FAQ -> Contact Us) */}
      <FAQToContactDivider motionPaused={effectiveMotionPaused} />

      {/* Genesis 6 Contact Us & Venue Section */}
      <ContactSection
        motionPaused={effectiveMotionPaused}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};

