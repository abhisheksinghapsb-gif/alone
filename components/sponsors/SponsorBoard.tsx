'use client';

import React from 'react';
import { SPONSOR_SLOTS, SponsorSlotData } from '../../data/sponsorsData';
import { SponsorSlotCard } from './SponsorSlotCard';

export interface SponsorBoardProps {
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  motionPaused: boolean;
}

export const SponsorBoard: React.FC<SponsorBoardProps> = ({
  selectedSlotId,
  onSelectSlot,
  motionPaused,
}) => {
  const selectedSlot =
    SPONSOR_SLOTS.find((s) => s.id === selectedSlotId) || SPONSOR_SLOTS[0];

  return (
    <div
      id="sponsor-board-container"
      className="sponsorBoardContainer"
      style={{
        '--active-board-accent': selectedSlot.accentColor,
      } as React.CSSProperties}
    >
      {/* Restrained Recessed Backing Frame with Dynamic Accent Edge */}
      <div className="sponsorBoardBacking" aria-hidden="true">
        <div className="boardAccentSeam" />
      </div>

      {/* 3 Columns × 2 Rows Slot Grid */}
      <div
        id="sponsor-slots-grid"
        className="sponsorSlotsGrid"
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

      {/* Compact Reserved Caption Area Beneath Board */}
      <div id="sponsor-board-caption" className="sponsorBoardCaptionWrap">
        {/* Screen Reader Accessible Announcement on deliberate selection */}
        <div className="srOnly" aria-live="polite">
          {selectedSlot.captionText}
        </div>

        {/* Visual Stable Caption Bar with quick readable transition */}
        <div key={selectedSlot.id} className="sponsorCaptionBar" aria-hidden="true">
          <span
            className="captionAccentDot"
            style={{ backgroundColor: selectedSlot.accentColor }}
          />
          <span className="captionCategoryName">
            {selectedSlot.categoryName}
          </span>
          <span className="captionDivider">·</span>
          <span className="captionStatusText">{selectedSlot.status}</span>
        </div>
      </div>
    </div>
  );
};
