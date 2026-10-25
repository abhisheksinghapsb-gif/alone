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
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [pulseKey, setPulseKey] = useState<number>(0);

  // Pointer move tilt calculation (capped at ~2 degrees for fine pointers only)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (motionPaused || e.pointerType === 'touch') return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to +0.5
      const rotateX = -y * 3.5; // capped around 1.75deg
      const rotateY = x * 3.5;
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
    setTiltStyle({});
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
      className={`sponsorSlotHitTarget ${isSelected ? 'isSelected' : ''} ${isHovered ? 'isHovered' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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

          {/* Energy Pulse Perimeter Runner (Triggered on deliberate selection) */}
          {isSelected && (
            <svg
              key={pulseKey}
              className={`slotPulseSvg ${!motionPaused ? 'runPulse' : ''}`}
              viewBox="0 0 315 185"
              aria-hidden="true"
            >
              {/* Slanted Parallelogram Path matching the exact card geometry */}
              <polygon
                points="45,55 326,55 314,199 32,199"
                className="slotPulsePoly"
                style={{ stroke: slot.accentColor }}
              />
            </svg>
          )}

          {/* Persistent Active Border Glow */}
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
