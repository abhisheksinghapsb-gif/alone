'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SPONSORS_COPY,
  SPONSORS_ASSETS,
} from '../../data/sponsorsData';
import { PastSponsorsPanel } from './PastSponsorsPanel';
import { SponsorBoard } from './SponsorBoard';
import { uiAudio } from '../../lib/uiAudio';
import { useSponsorsMotion } from '../../hooks/useSponsorsMotion';
import styles from './sponsors.module.css';

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
  const [companionReaction, setCompanionReaction] = useState<
    'idle' | 'lean-left' | 'lean-center' | 'lean-right'
  >('idle');
  const [chestSettle, setChestSettle] = useState<boolean>(false);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Coordinated entrance and ambient motion
  useSponsorsMotion({
    sectionRef,
    motionPaused,
  });

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlotId(slotId);

    // Audio feedback: deliberate slot selection plays quiet press clack
    if (soundEnabled) {
      uiAudio.playPressClack();
    }

    // Connected character response (Requirement 9C):
    // Mascot leans toward the selected column + chest gives a small restrained settle
    if (!motionPaused) {
      let lean: 'lean-left' | 'lean-center' | 'lean-right' = 'lean-center';
      if (slotId === 'title-sponsor' || slotId === 'slot-4') {
        lean = 'lean-left';
      } else if (slotId === 'platform-sponsor' || slotId === 'slot-6') {
        lean = 'lean-right';
      }

      setCompanionReaction(lean);
      setChestSettle(true);

      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
      settleTimeoutRef.current = setTimeout(() => {
        setCompanionReaction('idle');
        setChestSettle(false);
      }, 420);
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
      className={styles.sponsorsSectionContainer}
    >
      {/* Accessible semantic heading for screen readers */}
      <h2 id="sponsors-heading" className={styles.srOnly}>
        {SPONSORS_COPY.heading}
      </h2>

      {/* 1. Base Cosmic Background Layer */}
      <div id="sponsors-bg-layer" className={styles.sponsorsBgLayer} aria-hidden="true">
        <img
          src={SPONSORS_ASSETS.bgCosmic.src}
          alt=""
          width={SPONSORS_ASSETS.bgCosmic.width}
          height={SPONSORS_ASSETS.bgCosmic.height}
          className={styles.sponsorsBgImg}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className={styles.sponsorsBgOverlay} />
      </div>

      {/* 2. Top Structural Dark Strip */}
      <div className={styles.sponsorsTopStrip} aria-hidden="true" />

      {/* 3. Centered Content Layout Wrapper */}
      <div className={styles.sponsorsContentWrap}>
        {/* Heading Group: SPONSORS wordmark flanked by Crowned icon and Credits chest */}
        <div id="sponsors-heading-group" className={styles.sponsorsHeadingGroup}>
          {/* Crowned Green Character Icon (Left flank) */}
          <div className={styles.headingIconFlank} aria-hidden="true">
            <div className={styles.crownIdleWrap}>
              <img
                src={SPONSORS_ASSETS.crownedIcon.src}
                alt=""
                width={SPONSORS_ASSETS.crownedIcon.width}
                height={SPONSORS_ASSETS.crownedIcon.height}
                className={styles.crownFlankImg}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>
          </div>

          {/* SPONSORS Wordmark */}
          <div className={styles.headingWordmarkWrap}>
            <img
              src={SPONSORS_ASSETS.wordmark.src}
              alt={SPONSORS_COPY.heading}
              width={SPONSORS_ASSETS.wordmark.width}
              height={SPONSORS_ASSETS.wordmark.height}
              className={styles.headingWordmarkImg}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>

          {/* Credits Chest Icon (Right flank with dedicated idle & reaction wrappers) */}
          <div className={styles.headingIconFlank} aria-hidden="true">
            <div className={styles.chestIdleWrap}>
              <div className={`${styles.chestReactWrap} ${chestSettle ? styles.chestReact : ''}`}>
                <img
                  src={SPONSORS_ASSETS.creditsChest.src}
                  alt=""
                  width={SPONSORS_ASSETS.creditsChest.width}
                  height={SPONSORS_ASSETS.creditsChest.height}
                  className={styles.chestFlankImg}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Past Sponsors Panel (Left 28–32%) & Six-Slot Board (Right 68–72%) */}
        <div className={styles.sponsorsMainColumns}>
          {/* Left Column: Past Sponsors Archive */}
          <PastSponsorsPanel motionPaused={motionPaused} />

          {/* Right Column: Six-Slot Interactive Sponsor Board */}
          <div className={styles.sponsorBoardColumnWrap}>
            <SponsorBoard
              selectedSlotId={selectedSlotId}
              onSelectSlot={handleSelectSlot}
              motionPaused={motionPaused}
              companionReaction={companionReaction}
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom Structural Blue Strip */}
      <div className={styles.sponsorsBottomStrip} aria-hidden="true" />
    </section>
  );
};
