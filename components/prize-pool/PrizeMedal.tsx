'use client';

import React, { useState, useRef, useCallback } from 'react';
import { PrizeItem, VR_HOLO_COLORS } from './prizePoolData';
import { uiAudio } from '../../lib/uiAudio';

export interface PrizeMedalProps {
  item: PrizeItem;
  soundEnabled?: boolean;
  motionPaused?: boolean;
  onActivate?: (item: PrizeItem) => void;
  onHover?: (item: PrizeItem) => void;
  onFocus?: (item: PrizeItem) => void;
}

export const PrizeMedal: React.FC<PrizeMedalProps> = ({
  item,
  soundEnabled = false,
  motionPaused = false,
  onActivate,
  onHover,
  onFocus,
}) => {
  const isVr = item.trackId === 'vr';
  const [isFlourishing, setIsFlourishing] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isHoloActive, setIsHoloActive] = useState<boolean>(false);
  const cooldownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holoSequenceRef = useRef<boolean>(false);

  const vrColors = isVr
    ? VR_HOLO_COLORS[item.rankNumber as 1 | 2] || VR_HOLO_COLORS[1]
    : null;

  const handlePointerEnter = () => {
    setIsHovered(true);
    onHover?.(item);

    if (isVr && !holoSequenceRef.current && !motionPaused) {
      holoSequenceRef.current = true;
      setIsHoloActive(true);
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setIsHoloActive(false);
    holoSequenceRef.current = false;
  };

  const handleFocus = () => {
    setIsHovered(true);
    onFocus?.(item);

    if (isVr && !holoSequenceRef.current && !motionPaused) {
      holoSequenceRef.current = true;
      setIsHoloActive(true);
    }
  };

  const handleBlur = () => {
    setIsHovered(false);
    setIsHoloActive(false);
    holoSequenceRef.current = false;
  };

  const handleActivate = useCallback(() => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;

    // Trigger visual celebration flourish
    setIsFlourishing(true);

    // Audio cue if sound is enabled
    if (soundEnabled) {
      uiAudio.playEmblemAccent();
    }

    if (onActivate) {
      onActivate(item);
    }

    // 800ms celebration flourish duration, 900ms protection cooldown
    timeoutRef.current = setTimeout(() => {
      setIsFlourishing(false);
    }, 750);

    setTimeout(() => {
      cooldownRef.current = false;
    }, 900);
  }, [item, soundEnabled, onActivate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };

  // Particles for celebration burst (6 local particles with defined trajectories)
  const burstParticles = [
    { dx: '-45px', dy: '-55px', color: '#ffde32', size: '10px' },
    { dx: '45px', dy: '-55px', color: '#ffffff', size: '8px' },
    { dx: '-65px', dy: '-10px', color: '#e15fff', size: '10px' },
    { dx: '65px', dy: '-10px', color: '#24c5f6', size: '9px' },
    { dx: '-35px', dy: '35px', color: '#ffde32', size: '8px' },
    { dx: '35px', dy: '35px', color: '#ffffff', size: '10px' },
  ];

  return (
    <div
      className={`prizeMedalItem rank-${item.position} track-${item.trackId} ${
        isFlourishing ? 'is-flourishing' : ''
      } ${isHovered ? 'is-hovered' : ''} ${isHoloActive ? 'is-holo-active' : ''}`}
      style={
        {
          '--spotlight-color': item.spotlightColor,
          ...(vrColors
            ? {
                '--holo-primary': vrColors.primary,
                '--holo-accent': vrColors.accent,
                '--holo-beam': vrColors.beam,
                '--holo-glow': vrColors.glow,
              }
            : {}),
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        className="prizeMedalBtn"
        aria-label={item.accessibleName}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
      >
        {/* Stage Spotlight Behind Medal */}
        <div className="medalSpotlight" aria-hidden="true" />

        {/* Contact Floor Shadow Underneath */}
        <div className="medalContactShadow" aria-hidden="true" />

        {/* VR Holographic Projection Sequence Rig */}
        {isVr && (
          <div className={`vrHoloRig ${isHoloActive ? 'is-active' : ''}`} aria-hidden="true">
            {/* 1. Perspective-Tilted Holographic Base Ellipse */}
            <div className="vrHoloEmitterBase">
              <div className="vrHoloRingsOuter" />
              <div className="vrHoloRingsInner" />
            </div>

            {/* 2. Soft Rising Light Fragments */}
            <span className="vrHoloFragment frag1" />
            <span className="vrHoloFragment frag2" />
            <span className="vrHoloFragment frag3" />
          </div>
        )}

        {/* Scalable Vector Medal (Front Plaque, Amount, & Separate Star Badge) */}
        <div className="medalSvgWrapper">
          <img
            src={item.assetPath}
            alt=""
            width={265}
            height={315}
            className="medalSvg"
            draggable={false}
          />
          {/* Gleam light sweep on activation */}
          <div className="medalGleamStripe" aria-hidden="true" />

          {/* VR Holographic Soft Scan Highlight Sweep across medal artwork */}
          {isVr && (
            <div className={`vrHoloScanOverlay ${isHoloActive ? 'run-scan' : ''}`} aria-hidden="true">
              <div className="vrHoloScanLine" />
            </div>
          )}
        </div>

        {/* Particle Celebration Burst */}
        {isFlourishing && !motionPaused && (
          <div className="medalBurstContainer" aria-hidden="true">
            {burstParticles.map((p, idx) => (
              <span
                key={idx}
                className="burstParticle"
                style={
                  {
                    '--dx': p.dx,
                    '--dy': p.dy,
                    backgroundColor: p.color,
                    width: p.size,
                    height: p.size,
                    borderRadius: idx % 2 === 0 ? '50%' : '2px',
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
      </button>

      {/* Accessible Live Amount Label for Scanners & High-Contrast Mode */}
      <div className="accessibleMedalText" aria-hidden="true">
        <span className="accessibleAmount">{item.formattedAmount}</span>
      </div>
    </div>
  );
};
