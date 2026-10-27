'use client';

import React, { useState } from 'react';
import { TimelineStageData } from './timelineData';

export interface TimelineCardProps {
  stage: TimelineStageData;
  isActive: boolean;
  isHovered: boolean;
  isPulsing: boolean;
  motionPaused?: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  stage,
  isActive,
  isHovered,
  isPulsing,
  motionPaused = false,
  onSelect,
  onHover,
}) => {
  const [localHover, setLocalHover] = useState(false);
  const isHighlighted = isActive || isHovered || localHover;

  const handlePointerEnter = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setLocalHover(true);
    onHover(true);
  };

  const handlePointerLeave = () => {
    setLocalHover(false);
    onHover(false);
  };

  // Hover transform is strictly isolated to this innermost visual wrapper
  // Outer wrappers are animated by GSAP ScrollTrigger reveals without conflict
  const hoverTransform =
    !motionPaused && localHover
      ? 'translateY(-5px) scale(1.02)'
      : 'translateY(0px) scale(1.0)';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="group relative cursor-pointer select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full max-w-[340px]"
      aria-label={`Checkpoint ${stage.step}: ${stage.title} (${stage.sub})`}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* ── Separate Nested Visual Wrapper for Hover & Ambient Lighting ── */}
      <div
        className="relative w-full rounded-2xl transition-transform duration-200 ease-out"
        style={{
          transform: hoverTransform,
          willChange: 'transform',
        }}
      >
        {/* Ambient Stage-Themed Atmospheric Glow */}
        {isHighlighted && (
          <div
            className="absolute -inset-2.5 rounded-2xl pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${stage.theme.glowColor} 0%, rgba(253,217,68,0.12) 60%, transparent 85%)`,
              filter: 'blur(10px)',
            }}
          />
        )}

        {/* Card Artwork Plaque Container with Preserved Portrait Proportions (275/416) */}
        <div
          className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
            isHighlighted
              ? 'drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] brightness-105'
              : 'drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)] opacity-95'
          }`}
          style={{
            aspectRatio: '275 / 416',
            width: '100%',
            border: isHighlighted
              ? `2.5px solid ${stage.theme.primaryColor}`
              : '1.5px solid rgba(253, 217, 68, 0.4)',
            boxShadow: isHighlighted
              ? `0 0 16px ${stage.theme.glowColor}, inset 0 0 8px ${stage.theme.glowColor}`
              : 'none',
          }}
        >
          {/* Complete Illustrated Card Silhouette with Native Lazy Loading */}
          <img
            src={stage.asset}
            alt={stage.alt}
            width={550}
            height={832}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="w-full h-full object-contain pointer-events-none select-none block"
          />

          {/* Click Activation Accent Pulse */}
          {isPulsing && (
            <div
              className="absolute inset-0 rounded-2xl ring-4 ring-amber-300 ring-offset-2 ring-offset-transparent pointer-events-none animate-pulse"
              style={{ animationDuration: '380ms' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
