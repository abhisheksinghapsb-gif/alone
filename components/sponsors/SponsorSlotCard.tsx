'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { SponsorSlotData } from '../../data/sponsorsData';
import styles from './sponsors.module.css';

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
  const tiltRafRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [pulseKey, setPulseKey] = useState<number>(0);

  const applyVisualTransform = useCallback((transform: string) => {
    if (visualRef.current) {
      visualRef.current.style.transform = transform;
    }
  }, []);

  // Pointer move tilt calculation (restrained to <= 1.5 degrees, coalesced into 1 pending RAF)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (motionPaused || e.pointerType === 'touch') return;
      if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to +0.5
      const rotateX = Math.max(-1.5, Math.min(1.5, -y * 3.0));
      const rotateY = Math.max(-1.5, Math.min(1.5, x * 3.0));

      if (tiltRafRef.current !== null) {
        cancelAnimationFrame(tiltRafRef.current);
      }
      tiltRafRef.current = requestAnimationFrame(() => {
        tiltRafRef.current = null;
        applyVisualTransform(
          `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4.5px) scale(1.02)`
        );
      });
    },
    [motionPaused, applyVisualTransform]
  );

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    if (tiltRafRef.current !== null) {
      cancelAnimationFrame(tiltRafRef.current);
      tiltRafRef.current = null;
    }
    if (!isFocused) {
      applyVisualTransform('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    applyVisualTransform('perspective(600px) translateY(-4.5px) scale(1.02)');
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isHovered) {
      applyVisualTransform('');
    }
  };

  const handleClick = () => {
    setPulseKey((prev) => prev + 1);
    onSelect(slot.id);
  };

  // Cancel pending animation frame on unmount
  useEffect(() => {
    return () => {
      if (tiltRafRef.current !== null) {
        cancelAnimationFrame(tiltRafRef.current);
        tiltRafRef.current = null;
      }
    };
  }, []);

  return (
    <button
      ref={cardRef}
      id={`sponsor-slot-${slot.id}`}
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={slot.ariaLabel}
      className={`${styles.sponsorSlotHitTarget} ${isSelected ? styles.isSelected : ''} ${
        isHovered ? styles.isHovered : ''
      } ${isFocused ? styles.isFocused : ''}`}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {/* Stable Visual Motion Wrapper (transforms visual without altering hit test area) */}
      <div
        ref={visualRef}
        className={styles.slotVisualWrapper}
        style={{
          '--slot-accent': slot.accentColor,
        } as React.CSSProperties}
      >
        {/* Main Vector Artwork Card Surface */}
        <div className={styles.slotCardSurface}>
          {/* Complete Figma Vector SVG Card with full unclipped illustration */}
          <img
            src={slot.svgPath}
            alt=""
            width={315}
            height={185}
            className={styles.slotSvgArtwork}
            loading="eager"
            decoding="async"
            draggable={false}
          />

          {/* Miniature Illustrated Window Glint (sweeps briefly on hover / keyboard focus) */}
          <div
            className={`${styles.slotWindowGlintTrack} ${
              (isHovered || isFocused) && !motionPaused ? styles.runGlint : ''
            }`}
            aria-hidden="true"
          >
            <div className={styles.slotWindowGlintBeam} />
          </div>

          {/* Hover / Focus Border Brightening in Card's Color */}
          <div className={styles.slotHoverBorder} aria-hidden="true" />

          {/* Slower Settle Arrival Highlight */}
          <div className={styles.slotArrivalHighlight} aria-hidden="true" />

          {/* Travelling Edge Highlight around the exact angled perimeter on deliberate selection */}
          {isSelected && (
            <svg
              key={pulseKey}
              className={`${styles.slotPulseSvg} ${!motionPaused ? styles.runPulse : ''}`}
              viewBox={slot.viewBox}
              aria-hidden="true"
            >
              <path
                d={slot.perimeterPath}
                className={styles.slotPulsePoly}
                style={{ stroke: slot.accentColor }}
              />
            </svg>
          )}

          {/* Settled Crisp Selected Border following exact card boundary */}
          {isSelected && (
            <svg
              className={styles.slotSelectedOutlineSvg}
              viewBox={slot.viewBox}
              aria-hidden="true"
            >
              <path
                d={slot.perimeterPath}
                className={styles.slotSelectedOutlinePoly}
                style={{ stroke: slot.accentColor }}
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};
