'use client';

import React from 'react';

export interface ExperienceControlsProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  motionPaused: boolean;
  onToggleMotion: (paused: boolean) => void;
}

export const ExperienceControls: React.FC<ExperienceControlsProps> = ({
  soundEnabled,
  onToggleSound,
  motionPaused,
  onToggleMotion,
}) => {
  return (
    <div
      id="utility-controls"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'auto',
      }}
    >
      {/* Motion Pause Toggle */}
      <button
        id="motion-toggle-btn"
        type="button"
        onClick={() => onToggleMotion(!motionPaused)}
        aria-label={motionPaused ? 'Resume ambient animations' : 'Pause ambient animations'}
        title={
          motionPaused
            ? 'Animations are PAUSED (Click to resume)'
            : 'Animations are ACTIVE (Click to pause)'
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '44px',
          minHeight: '44px',
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: motionPaused
            ? 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: motionPaused
            ? '0 0 12px rgba(245, 158, 11, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
            : '0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          transition: 'transform 150ms ease, background 200ms ease, box-shadow 200ms ease',
          color: '#FFFFFF',
        }}
      >
        {motionPaused ? (
          // Play Icon
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        ) : (
          // Pause Icon
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        )}
      </button>

      {/* Sound Mute/Unmute Toggle */}
      <button
        id="sound-toggle-btn"
        type="button"
        onClick={() => onToggleSound(!soundEnabled)}
        aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        title={soundEnabled ? 'Sound is ON (Click to mute)' : 'Sound is MUTED (Click to enable)'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '44px',
          minHeight: '44px',
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: soundEnabled
            ? 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)'
            : 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: soundEnabled
            ? '0 0 12px rgba(56, 189, 248, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
            : '0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          transition: 'transform 150ms ease, background 200ms ease, box-shadow 200ms ease',
          color: '#FFFFFF',
        }}
      >
        {soundEnabled ? (
          // Speaker ON Icon
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          // Speaker OFF Icon
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </div>
  );
};
