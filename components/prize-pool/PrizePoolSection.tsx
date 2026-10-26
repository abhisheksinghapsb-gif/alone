'use client';

import React, { useRef } from 'react';
import { PRIZE_TRACKS } from './prizePoolData';
import { PrizeStage } from './PrizeStage';
import { usePrizeMotion } from './usePrizeMotion';

export interface PrizePoolSectionProps {
  motionPaused?: boolean;
  soundEnabled?: boolean;
}

export const PrizePoolSection: React.FC<PrizePoolSectionProps> = ({
  motionPaused = false,
  soundEnabled = false,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Initialize GSAP scroll triggers and idle animations
  usePrizeMotion({ sectionRef, motionPaused });

  const mainTrack = PRIZE_TRACKS.find((t) => t.id === 'main')!;
  const vrTrack = PRIZE_TRACKS.find((t) => t.id === 'vr')!;

  return (
    <section
      ref={sectionRef}
      id="prize-pool"
      aria-labelledby="prize-pool-heading"
      className="prizePoolSection"
    >
      {/* Background Vignette */}
      <div className="prizePoolVignette" aria-hidden="true" />

      {/* Screen reader semantic heading hierarchy */}
      <h2 id="prize-pool-heading" className="sr-only">
        Genesis 6 Prize Pool
      </h2>

      <div className="prizePoolContainer">
        {/* 1. Yellow Title Banner */}
        <div className="prizePoolBannerWrapper">
          <img
            src="/assets/genesis/prize-pool/title-prize-pool.svg"
            alt="PRIZE POOL"
            width={527}
            height={116}
            className="prizePoolBannerImg"
            draggable={false}
          />
        </div>

        {/* 2. Main Prize Stage */}
        <h3 className="sr-only">Main Prizes</h3>
        <PrizeStage
          track={mainTrack}
          soundEnabled={soundEnabled}
          motionPaused={motionPaused}
        />

        {/* 3. Intermediate Purple Gem Accent */}
        <div className="prizeStageGap" aria-hidden="true">
          <div className="gemAccentWrapper">
            <div className="gemAccentGlow" />
            <img
              src="/assets/genesis/prize-pool/gem-sparkle.svg"
              alt=""
              width={140}
              height={150}
              className="gemAccentImg"
              draggable={false}
            />
          </div>
        </div>

        {/* 4. VR Track Stage */}
        <h3 className="sr-only">VR Track Prizes</h3>
        <PrizeStage
          track={vrTrack}
          soundEnabled={soundEnabled}
          motionPaused={motionPaused}
        />
      </div>
    </section>
  );
};
