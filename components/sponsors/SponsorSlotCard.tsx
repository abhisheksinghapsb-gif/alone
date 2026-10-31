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
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [pulseKey, setPulseKey] = useState<number>(0);

  const applyVisualTransform = useCallback((transform: string) => {
    if (visualRef.current) {
      visualRef.current.style.transform = transform;
    }
  }, []);

  // Pointer move tilt calculation (restrained to <= 1.0 degrees, coalesced into 1 pending RAF)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      setIsHovered(true);
      if (motionPaused || e.pointerType === 'touch') return;
      if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to +0.5
      const rotateX = Math.max(-1.0, Math.min(1.0, -y * 2.0));
      const rotateY = Math.max(-1.0, Math.min(1.0, x * 2.0));

      if (tiltRafRef.current !== null) {
        cancelAnimationFrame(tiltRafRef.current);
      }
      tiltRafRef.current = requestAnimationFrame(() => {
        tiltRafRef.current = null;
        applyVisualTransform(
          `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px) scale(1.015)`
        );
      });
    },
    [motionPaused, applyVisualTransform]
  );

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    setIsHovered(true);
    if (!motionPaused) {
      applyVisualTransform('perspective(600px) translateY(-3px) scale(1.015)');
    }
  };

  const handlePointerLeave = () => {
    lastPointerRef.current = null;
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
    applyVisualTransform('perspective(600px) translateY(-3px) scale(1.015)');
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

  // Clear hover state and transform if user scrolls while pointer is stationary
  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current) return;
      if (lastPointerRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const { x, y } = lastPointerRef.current;
        // If card scrolled out from under the pointer, clear hover state immediately
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
          setIsHovered(false);
          lastPointerRef.current = null;
          if (tiltRafRef.current !== null) {
            cancelAnimationFrame(tiltRafRef.current);
            tiltRafRef.current = null;
          }
          if (!isFocused) {
            applyVisualTransform('');
          }
        }
      } else if (!isFocused) {
        setIsHovered(false);
        applyVisualTransform('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isFocused, applyVisualTransform]);

  // Clear inline tilt when motion is paused or on unmount
  useEffect(() => {
    if (motionPaused) {
      if (tiltRafRef.current !== null) {
        cancelAnimationFrame(tiltRafRef.current);
        tiltRafRef.current = null;
      }
      applyVisualTransform('');
    }
  }, [motionPaused, applyVisualTransform]);

  useEffect(() => {
    return () => {
      if (tiltRafRef.current !== null) {
        cancelAnimationFrame(tiltRafRef.current);
        tiltRafRef.current = null;
      }
      applyVisualTransform('');
    };
  }, [applyVisualTransform]);

  return (
    <button
      ref={cardRef}
      id={`sponsor-slot-${slot.id}`}
      data-sponsor-card
      data-is-hovered={isHovered ? 'true' : 'false'}
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
      onPointerCancel={handlePointerLeave}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onMouseMove={handlePointerMove}
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
            loading="lazy"
            decoding="async"
            draggable={false}
          />

          {/* Soft luminous halo outline following exact angled perimeter on hover / focus */}
          <svg
            className={`${styles.slotHoverOutlineSvg} ${
              (isHovered || isFocused) && !isSelected ? styles.showHoverOutline : ''
            }`}
            viewBox={slot.viewBox}
            aria-hidden="true"
          >
            <path
              d={slot.perimeterPath}
              className={styles.slotHoverOutlinePoly}
              style={{ stroke: slot.accentColor }}
            />
          </svg>

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
