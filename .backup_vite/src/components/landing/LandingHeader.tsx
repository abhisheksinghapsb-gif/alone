import React from 'react';
import { EVENT_COPY, NAV_ITEMS } from '../../data/landing';
import { GameButton } from './GameButton';
import { SoundToggle } from './SoundToggle';

export interface LandingHeaderProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  motionPaused: boolean;
  onToggleMotion: (paused: boolean) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  motionPaused,
  onToggleMotion,
}) => {
  return (
    <header
      id="landing-header"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-header)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 'clamp(12px, 2.5vw, 28px) clamp(16px, 3.5vw, 48px)',
        pointerEvents: 'none', // Allows clicking through empty header regions to scene
      }}
    >
      {/* 1. GDAI Ribbon Badge (Top Left) */}
      <div
        id="gdai-badge-container"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 200ms ease',
        }}
      >
        <img
          src="/assets/genesis/gdai-badge.webp"
          alt={EVENT_COPY.gdaiAlt}
          width={300}
          height={528}
          style={{
            display: 'block',
            width: 'clamp(46px, 4.2vw, 68px)',
            height: 'auto',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7))',
            pointerEvents: 'auto',
          }}
          draggable={false}
        />
      </div>

      {/* 2. Top Game-Style Nav Controls */}
      <nav
        id="primary-nav-controls"
        aria-label="Event Primary Navigation"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(8px, 1.6vw, 24px)',
          margin: '0 auto',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className="headerNavBtnWrap"
            style={{
              transition: 'transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <GameButton
              id={`nav-btn-${item.id}`}
              label={item.label}
              href={item.href}
              actionId={item.actionId}
              style={{
                width: 'clamp(110px, 11vw, 175px)',
                height: 'auto',
                display: 'block',
              }}
            >
              <img
                src={item.image}
                alt={item.alt}
                width={360}
                height={80}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6))',
                }}
                draggable={false}
              />
            </GameButton>
          </div>
        ))}
      </nav>

      {/* 3. Utility Controls Cluster (Sound & Motion Pause) */}
      <div
        id="utility-controls"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Pause Motion Button */}
        <button
          id="motion-toggle-btn"
          type="button"
          onClick={() => onToggleMotion(!motionPaused)}
          aria-label={motionPaused ? 'Resume ambient animations' : 'Pause ambient animations'}
          title={motionPaused ? 'Animations are PAUSED (Click to resume)' : 'Animations are ACTIVE (Click to pause)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: motionPaused
              ? 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)'
              : 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: motionPaused
              ? '0 0 12px rgba(245, 158, 11, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
              : '0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, background 200ms ease',
            color: '#FFFFFF',
            outline: 'none',
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

        {/* Sound Toggle Button */}
        <SoundToggle soundEnabled={soundEnabled} onToggle={onToggleSound} />
      </div>
    </header>
  );
};
