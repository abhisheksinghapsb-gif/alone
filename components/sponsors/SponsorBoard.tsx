'use client';

import React from 'react';
import { SPONSOR_SLOTS, SPONSORS_ASSETS } from '../../data/sponsorsData';
import { SponsorSlotCard } from './SponsorSlotCard';
import styles from './sponsors.module.css';

export interface SponsorBoardProps {
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  motionPaused: boolean;
  companionReaction?: 'idle' | 'lean-left' | 'lean-center' | 'lean-right';
}

export const SponsorBoard: React.FC<SponsorBoardProps> = ({
  selectedSlotId,
  onSelectSlot,
  motionPaused,
  companionReaction = 'idle',
}) => {
  const selectedSlot =
    SPONSOR_SLOTS.find((s) => s.id === selectedSlotId) || SPONSOR_SLOTS[0];

  const reactionClass =
    companionReaction === 'lean-left'
      ? styles.leanLeft
      : companionReaction === 'lean-center'
      ? styles.leanCenter
      : companionReaction === 'lean-right'
      ? styles.leanRight
      : '';

  return (
    <div
      id="sponsor-board-container"
      className={styles.sponsorBoardContainer}
      style={{
        '--active-board-accent': selectedSlot.accentColor,
      } as React.CSSProperties}
    >
      {/* Restrained Recessed Backing Frame with Dynamic Accent Edge */}
      <div className={styles.sponsorBoardBacking} aria-hidden="true">
        <div className={styles.boardAccentSeam} />
      </div>

      {/* Board Header Label matching Figma */}
      <div className={styles.boardHeaderLabel} aria-hidden="true">
        <span>SPONSORS</span>
      </div>

      {/* 3 Columns × 2 Rows Slot Grid */}
      <div
        id="sponsor-slots-grid"
        className={styles.sponsorSlotsGrid}
        role="group"
        aria-label="Genesis 6 Sponsor Categories"
      >
        {SPONSOR_SLOTS.map((slot) => (
          <SponsorSlotCard
            key={slot.id}
            slot={slot}
            isSelected={slot.id === selectedSlot.id}
            onSelect={onSelectSlot}
            motionPaused={motionPaused}
          />
        ))}
      </div>

      {/* Board Footer: Caption Area + Spike Mascot in Dedicated Reserved Space */}
      <div className={styles.sponsorBoardFooter}>
        {/* Left spacer to visually balance the mascot on the right */}
        <div className={styles.footerSpacer} aria-hidden="true" />

        {/* Centered Caption Pill */}
        <div id="sponsor-board-caption" className={styles.sponsorBoardCaptionWrap}>
          {/* Screen Reader Accessible Announcement */}
          <div className={styles.srOnly} aria-live="polite">
            {selectedSlot.captionText}
          </div>

          {/* Visual Stable Caption Bar */}
          <div key={selectedSlot.id} className={styles.sponsorCaptionBar} aria-hidden="true">
            <span
              className={styles.captionAccentDot}
              style={{ backgroundColor: selectedSlot.accentColor }}
            />
            <span className={styles.captionCategoryName}>
              {selectedSlot.categoryName}
            </span>
            <span className={styles.captionDivider}>·</span>
            <span className={styles.captionStatusText}>{selectedSlot.status}</span>
          </div>
        </div>

        {/* Spike Companion Mascot at lower-right with dedicated reserved bounding area */}
        <div
          id="sponsor-spike-character"
          className={styles.spikeCharacterDock}
          aria-hidden="true"
        >
          <div id="spike-idle-wrap" className={styles.spikeIdleWrap}>
            <div className={`${styles.spikeReactionWrap} ${reactionClass}`}>
              <img
                src={SPONSORS_ASSETS.characterSpike.src}
                alt=""
                width={SPONSORS_ASSETS.characterSpike.width}
                height={SPONSORS_ASSETS.characterSpike.height}
                className={styles.spikeCharacterImg}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
