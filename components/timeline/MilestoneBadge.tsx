'use client';

import React from 'react';
import { TimelineStageTheme } from './timelineData';

export interface MilestoneBadgeProps {
  step: '01' | '02' | '03' | '04';
  isActive: boolean;
  isReached: boolean;
  isHovered?: boolean;
  theme?: TimelineStageTheme;
  onClick?: () => void;
  className?: string;
  size?: number;
  badgeRef?: (el: HTMLButtonElement | null) => void;
}

// Vector paths extracted directly from Group 1000012459.svg
const NUMBER_PATHS: Record<string, { d: string; offset: string }> = {
  '01': {
    d: 'M197.962 43.4C194.628 43.4 191.895 42.1733 189.762 39.72C187.655 37.2667 186.602 33.68 186.602 28.96C186.602 24.24 187.668 20.68 189.802 18.28C191.935 15.8533 194.682 14.64 198.042 14.64C201.428 14.64 204.162 15.84 206.242 18.24C208.322 20.64 209.362 24.2533 209.362 29.08C209.362 33.9067 208.295 37.5067 206.162 39.88C204.055 42.2267 201.322 43.4 197.962 43.4ZM197.962 22.32C196.948 22.32 196.082 22.9067 195.362 24.08C194.668 25.2267 194.322 26.8667 194.322 29C194.322 31.1333 194.655 32.7733 195.322 33.92C196.015 35.04 196.895 35.6 197.962 35.6C199.055 35.6 199.935 35.0267 200.602 33.88C201.295 32.7333 201.642 31.0933 201.642 28.96C201.642 26.8267 201.282 25.1867 200.562 24.04C199.868 22.8933 199.002 22.32 197.962 22.32ZM226.749 14.8V43H220.269V22.28L213.989 25.24V19.4L222.029 14.8H226.749Z',
    offset: 'translate(-178, -1)',
  },
  '02': {
    d: 'M413.079 43.4C409.745 43.4 407.012 42.1733 404.879 39.72C402.772 37.2667 401.719 33.68 401.719 28.96C401.719 24.24 402.785 20.68 404.919 18.28C407.052 15.8533 409.799 14.64 413.159 14.64C416.545 14.64 419.279 15.84 421.359 18.24C423.439 20.64 424.479 24.2533 424.479 29.08C424.479 33.9067 423.412 37.5067 421.279 39.88C419.172 42.2267 416.439 43.4 413.079 43.4ZM413.079 22.32C412.065 22.32 411.199 22.9067 410.479 24.08C409.785 25.2267 409.439 26.8667 409.439 29C409.439 31.1333 409.772 32.7733 410.439 33.92C411.132 35.04 412.012 35.6 413.079 35.6C414.172 35.6 415.052 35.0267 415.719 33.88C416.412 32.7333 416.759 31.0933 416.759 28.96C416.759 26.8267 416.399 25.1867 415.679 24.04C414.985 22.8933 414.119 22.32 413.079 22.32ZM445.677 43H427.677V38.16L437.077 26.04C438.117 24.7067 438.863 23.48 439.317 22.36C439.77 21.24 439.997 20.1467 439.997 19.08C439.997 18.0667 439.677 17.2933 439.037 16.76C438.397 16.2267 437.383 15.96 435.997 15.96C434.797 15.96 433.81 16.2 433.037 16.68C432.263 17.16 431.57 17.84 430.957 18.72L426.637 14.56C427.703 13.2533 429.077 12.24 430.757 11.52C432.437 10.8 434.383 10.44 436.597 10.44C439.69 10.44 442.103 11.2267 443.837 12.8C445.57 14.3733 446.437 16.52 446.437 19.24C446.437 20.9467 446.063 22.68 445.317 24.44C444.57 26.2 443.25 28.16 441.357 30.32L434.757 37.6H445.677V43Z',
    offset: 'translate(-396, -1)',
  },
  '03': {
    d: 'M658.02 43.4C654.687 43.4 651.953 42.1733 649.82 39.72C647.713 37.2667 646.66 33.68 646.66 28.96C646.66 24.24 647.727 20.68 649.86 18.28C651.993 15.8533 654.74 14.64 658.1 14.64C661.487 14.64 664.22 15.84 666.3 18.24C668.38 20.64 669.42 24.2533 669.42 29.08C669.42 33.9067 668.353 37.5067 666.22 39.88C664.113 42.2267 661.38 43.4 658.02 43.4ZM658.02 22.32C657.007 22.32 656.14 22.9067 655.42 24.08C654.727 25.2267 654.38 26.8667 654.38 29C654.38 31.1333 654.713 32.7733 655.38 33.92C656.073 35.04 656.953 35.6 658.02 35.6C659.113 35.6 659.993 35.0267 660.66 33.88C661.353 32.7333 661.7 31.0933 661.7 28.96C661.7 26.8267 661.34 25.1867 660.62 24.04C659.927 22.8933 659.06 22.32 658.02 22.32ZM673.755 43.4C671.328 43.4 669.582 43.12 668.515 42.56L669.315 37.48C670.328 37.8533 671.742 38.04 673.555 38.04C674.888 38.04 675.928 37.7467 676.675 37.16C677.422 36.5467 677.795 35.68 677.795 34.56C677.795 33.4133 677.408 32.5333 676.635 31.92C675.888 31.28 674.795 30.96 673.355 30.96H670.795V26.24H673.355C674.555 26.24 675.475 25.96 676.115 25.4C676.755 24.84 677.075 24.04 677.075 23C677.075 22.0667 676.742 21.36 676.075 20.88C675.408 20.4 674.502 20.16 673.355 20.16C671.915 20.16 670.662 20.4267 669.595 20.96L667.635 16.52C669.075 15.6667 670.995 15.24 673.395 15.24C676.328 15.24 678.608 15.8533 680.235 17.08C681.888 18.28 682.715 20.08 682.715 22.48C682.715 23.9467 682.262 25.2667 681.355 26.44C680.475 27.5867 679.355 28.32 677.995 28.64V28.84C679.622 29.2133 680.955 30.0533 681.995 31.36C683.062 32.6667 683.595 34.3333 683.595 36.36C683.595 38.7067 682.688 40.5733 680.875 41.96C679.088 43.32 676.715 44 673.755 44V43.4Z',
    offset: 'translate(-641, -1)',
  },
  '04': {
    d: 'M882.133 44.4C878.8 44.4 876.067 43.1733 873.933 40.72C871.827 38.2667 870.773 34.68 870.773 29.96C870.773 25.24 871.84 21.68 873.973 19.28C876.107 16.8533 878.853 15.64 882.213 15.64C885.6 15.64 888.333 16.84 890.413 19.24C892.493 21.64 893.533 25.2533 893.533 30.08C893.533 34.9067 892.467 38.5067 890.333 40.88C888.227 43.2267 885.493 44.4 882.133 44.4ZM882.133 23.32C881.12 23.32 880.253 23.9067 879.533 25.08C878.84 26.2267 878.493 27.8667 878.493 30C878.493 32.1333 878.827 33.7733 879.493 34.92C880.187 36.04 881.067 36.6 882.133 36.6C883.227 36.6 884.107 36.0267 884.773 34.88C885.467 33.7333 885.813 32.0933 885.813 29.96C885.813 27.8267 885.453 26.1867 884.733 25.04C884.04 23.8933 883.173 23.32 882.133 23.32ZM915.6 32.04C915.867 32.04 916 33.0533 916 35.08C916 37.08 915.867 38.08 915.6 38.08L912.96 38.12V43.16C912.96 43.4533 912.414 43.6667 911.32 43.8C910.227 43.9333 909.28 44 908.48 44L906.84 43.92C905.48 43.8133 904.8 43.5733 904.8 43.2V38.24H896.84C896.147 37.5467 895.52 36.6533 894.96 35.56C894.4 34.44 894.12 33.64 894.12 33.16C894.12 32.6533 894.2 32.2533 894.36 31.96L903.12 16.44C903.227 16.2267 904.04 16.0667 905.56 15.96C907.107 15.8533 908.72 15.8 910.4 15.8C912.08 15.8 912.92 15.8667 912.92 16L912.96 32.04H915.6ZM905.96 32.08V23.72L901.28 32.08H905.96Z',
    offset: 'translate(-866, -1)',
  },
};

export const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  step,
  isActive,
  isReached,
  isHovered = false,
  theme,
  onClick,
  className = '',
  size = 56,
  badgeRef,
}) => {
  const numberInfo = NUMBER_PATHS[step];
  const isHighlighted = isActive || isHovered;
  const accentColor = theme?.primaryColor || '#FDD944';
  const glowColor = theme?.glowColor || 'rgba(253, 217, 68, 0.7)';

  return (
    <button
      ref={badgeRef}
      type="button"
      onClick={onClick}
      className={`relative rounded-full select-none cursor-pointer group focus:outline-none transition-transform duration-200 ease-out flex items-center justify-center ${
        isActive
          ? 'scale-110 z-30'
          : isHovered
          ? 'scale-115 z-25'
          : isReached
          ? 'scale-105 z-20'
          : 'scale-100 z-10 opacity-85 hover:opacity-100 hover:scale-105'
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      aria-label={`Milestone ${step} - ${
        isActive ? 'Active Checkpoint' : isHovered ? 'Hovered' : isReached ? 'Completed' : 'Upcoming'
      }`}
      title={`Stage ${step}`}
    >
      {/* Outer Glow Halo for Active or Hovered State */}
      {isHighlighted && (
        <div
          className="absolute -inset-2.5 rounded-full pointer-events-none transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, rgba(245,158,11,0.15) 60%, transparent 80%)`,
            filter: 'blur(5px)',
          }}
        />
      )}

      {/* Stage 03 Offline Accent: Lime expanding ring */}
      {step === '03' && isActive && (
        <div
          className="absolute -inset-2.5 rounded-full border-2 border-[#84CC16] pointer-events-none animate-ping opacity-60"
          style={{ animationDuration: '1.8s' }}
        />
      )}

      {/* Stage 04 Result Accent: Converging gold node highlight */}
      {step === '04' && isActive && (
        <div
          className="absolute -inset-2 rounded-full border-2 border-[#FDD944] pointer-events-none shadow-[0_0_18px_rgba(253,217,68,0.95)]"
        />
      )}

      {/* SVG Badge vector rendering */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]"
      >
        <defs>
          <radialGradient id={`badge-grad-${step}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={isHighlighted ? '#FFF9A5' : '#FFE269'} />
            <stop offset="65%" stopColor="#FDD944" />
            <stop offset="100%" stopColor="#F07527" />
          </radialGradient>

          <filter id={`badge-shadow-${step}`} x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* Milestone Base Outer Ring */}
        <circle
          cx="28"
          cy="28"
          r="26"
          fill={`url(#badge-grad-${step})`}
          stroke={isHighlighted ? '#FFFFFF' : accentColor}
          strokeWidth={isHighlighted ? '2.8' : '2'}
        />

        {/* Inner Highlight Ring */}
        <circle
          cx="28"
          cy="28"
          r="23"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
        />

        {/* Number Vector from Figma */}
        {numberInfo && (
          <g transform={numberInfo.offset} filter={`url(#badge-shadow-${step})`}>
            {/* Outline stroke */}
            <path
              d={numberInfo.d}
              fill="black"
              stroke="black"
              strokeWidth="2.5"
            />
            {/* White face */}
            <path
              d={numberInfo.d}
              fill={isHighlighted ? '#FFFFFF' : '#FFFBEB'}
            />
          </g>
        )}
      </svg>
    </button>
  );
};
