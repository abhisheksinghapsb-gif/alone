'use client';

import React, { useRef, useState, useCallback } from 'react';
import { SponsorSlotData } from '../../data/sponsorsData';

export interface SponsorSlotCardProps {
  slot: SponsorSlotData;
  isSelected: boolean;
  onSelect: (slotId: string) => void;
  motionPaused: boolean;
}

export const SponsorSlotCard: React.FC<SponsorSlotCardProps> = ({
  slot,
  isSelected,
  onSelect,
  motionPaused,
}) => {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [pulseKey, setPulseKey] = useState<number>(0);

  // Pointer move tilt calculation (restrained to <= 1.5 degrees)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (motionPaused || e.pointerType === 'touch') return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to +0.5
      const rotateX = Math.max(-1.5, Math.min(1.5, -y * 3.0)); // capped at 1.5deg
      const rotateY = Math.max(-1.5, Math.min(1.5, x * 3.0));
      setTiltStyle({
        transform: `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale(1.02)`,
      });
    },
    [motionPaused]
  );

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    if (!isFocused) {
      setTiltStyle({});
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setTiltStyle({
      transform: 'perspective(600px) translateY(-4px) scale(1.02)',
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isHovered) {
      setTiltStyle({});
    }
  };

  const handleClick = () => {
    setPulseKey((prev) => prev + 1);
    onSelect(slot.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={cardRef}
      id={`sponsor-slot-${slot.id}`}
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={slot.ariaLabel}
      className={`sponsorSlotHitTarget ${isSelected ? 'isSelected' : ''} ${isHovered ? 'isHovered' : ''} ${isFocused ? 'isFocused' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={{
        outline: 'none',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      {/* Stable Visual Motion Wrapper (transforms visual without altering hit test area) */}
      <div
        ref={visualRef}
        className="slotVisualWrapper"
        style={{
          ...tiltStyle,
          '--slot-accent': slot.accentColor,
        } as React.CSSProperties}
      >
        {/* Main Vector Artwork Card */}
        <div className="slotCardSurface">
          <img
            src={slot.svgPath}
            alt=""
            width={315}
            height={185}
            className="slotSvgArtwork"
            loading="eager"
            decoding="async"
            draggable={false}
          />

          {/* Clean Overlay Status Pill in lower illustrated portion */}
          <div className="slotStatusOverlay">
            <span className="slotStatusText">{slot.status}</span>
          </div>

          {/* Miniature Illustrated Window Glint (passes briefly on hover / keyboard focus) */}
          <div
            className={`slotWindowGlintTrack ${(isHovered || isFocused) && !motionPaused ? 'runGlint' : ''}`}
            aria-hidden="true"
          >
            <div className="slotWindowGlintBeam" />
          </div>

          {/* Hover / Focus Border Brightening in Card's Color */}
          <div className="slotHoverBorder" aria-hidden="true" />

          {/* Arrival Staggered Illumination Highlight */}
          <div className="slotArrivalHighlight" aria-hidden="true" />

          {/* Refined Selection Perimeter Energy Runner */}
          {isSelected && (
            <svg
              key={pulseKey}
              className={`slotPulseSvg ${!motionPaused ? 'runPulse' : ''}`}
              viewBox="0 0 315 185"
              aria-hidden="true"
            >
              <polygon
                points="45,55 326,55 314,199 32,199"
                className="slotPulsePoly"
                style={{ stroke: slot.accentColor }}
              />
            </svg>
          )}

          {/* Persistent Clear Active Border in Card's Accent Color */}
          {isSelected && (
            <div
              className="slotActiveGlowBorder"
              style={{ borderColor: slot.accentColor }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </button>
  );
};
