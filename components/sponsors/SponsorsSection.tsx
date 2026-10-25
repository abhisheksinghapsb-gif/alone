'use client';

import React, { useState, useRef, useEffect } from 'react';
import './sponsors.css';
import {
  SPONSORS_COPY,
  SPONSORS_ASSETS,
  SPONSOR_SLOTS,
} from '../../data/sponsorsData';
import { PastSponsorsPanel } from './PastSponsorsPanel';
import { SponsorBoard } from './SponsorBoard';
import { uiAudio } from '../../lib/uiAudio';
import { useSponsorsMotion } from '../../hooks/useSponsorsMotion';

export interface SponsorsSectionProps {
  motionPaused?: boolean;
  soundEnabled?: boolean;
}

export const SponsorsSection: React.FC<SponsorsSectionProps> = ({
  motionPaused = false,
  soundEnabled = false,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    SPONSORS_COPY.defaultSlotId
  );
  const [characterSettled, setCharacterSettled] = useState<boolean>(false);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Coordinated entrance and ambient motion
  useSponsorsMotion({
    sectionRef,
    motionPaused,
  });

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlotId(slotId);

    // Audio feedback: deliberate slot selection plays one quiet existing UI tick
    if (soundEnabled) {
      uiAudio.playPressClack();
    }

    // Character accent makes one small local upward settle (~3-4px)
    if (!motionPaused) {
      setCharacterSettled(true);
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
      settleTimeoutRef.current = setTimeout(() => {
        setCharacterSettled(false);
      }, 350);
    }
  };

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={SPONSORS_COPY.sectionId}
      aria-labelledby="sponsors-heading"
      className="sponsorsSectionContainer"
    >
      {/* Accessible semantic heading for screen readers */}
      <h2 id="sponsors-heading" className="srOnly">
        {SPONSORS_COPY.heading}
      </h2>

      {/* 1. Base Cosmic Background Layer */}
      <div id="sponsors-bg-layer" className="sponsorsBgLayer" aria-hidden="true">
        <img
          src={SPONSORS_ASSETS.bgCosmic.src}
          alt=""
          width={SPONSORS_ASSETS.bgCosmic.width}
          height={SPONSORS_ASSETS.bgCosmic.height}
          className="sponsorsBgImg"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className="sponsorsBgOverlay" />
      </div>

      {/* 2. Top Structural Dark Strip */}
      <div className="sponsorsTopStrip" aria-hidden="true" />

      {/* 3. Centered Content Layout Wrapper */}
      <div className="sponsorsContentWrap">
        {/* Heading Group: SPONSORS wordmark flanked by Crowned icon and Credits chest */}
        <div id="sponsors-heading-group" className="sponsorsHeadingGroup">
          {/* Crowned Green Character Icon (Left flank) */}
          <div className="headingIconFlank" aria-hidden="true">
            <img
              src={SPONSORS_ASSETS.crownedIcon.src}
              alt=""
              width={SPONSORS_ASSETS.crownedIcon.width}
              height={SPONSORS_ASSETS.crownedIcon.height}
              className="crownFlankImg"
              draggable={false}
            />
          </div>

          {/* SPONSORS Wordmark */}
          <div className="headingWordmarkWrap">
            <img
              src={SPONSORS_ASSETS.wordmark.src}
              alt={SPONSORS_COPY.heading}
              width={SPONSORS_ASSETS.wordmark.width}
              height={SPONSORS_ASSETS.wordmark.height}
              className="headingWordmarkImg"
              draggable={false}
            />
          </div>

          {/* Credits Chest Icon (Right flank) */}
          <div className="headingIconFlank" aria-hidden="true">
            <img
              src={SPONSORS_ASSETS.creditsChest.src}
              alt=""
              width={SPONSORS_ASSETS.creditsChest.width}
              height={SPONSORS_ASSETS.creditsChest.height}
              className="chestFlankImg"
              draggable={false}
            />
          </div>
        </div>

        {/* Two-Column Grid: Past Sponsors Panel (Left) & Six-Slot Board (Right) */}
        <div className="sponsorsMainColumns">
          {/* Left: Past Sponsors Archive */}
          <PastSponsorsPanel motionPaused={motionPaused} />

          {/* Right: Six-Slot Interactive Sponsor Board */}
          <div style={{ position: 'relative' }}>
            <SponsorBoard
              selectedSlotId={selectedSlotId}
              onSelectSlot={handleSelectSlot}
              motionPaused={motionPaused}
            />

            {/* Blue/Green Spike Character Accent near Lower Right of Board */}
            <div
              id="sponsor-spike-character"
              className={`spikeCharacterAccent ${characterSettled ? 'characterSettle' : ''}`}
              aria-hidden="true"
            >
              <img
                src={SPONSORS_ASSETS.characterSpike.src}
                alt=""
                width={SPONSORS_ASSETS.characterSpike.width}
                height={SPONSORS_ASSETS.characterSpike.height}
                className="spikeCharacterImg"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Structural Blue Strip */}
      <div className="sponsorsBottomStrip" aria-hidden="true" />
    </section>
  );
};
