'use client';

import React from 'react';
import { EVENT_COPY, NAV_ITEMS } from '../../data/landingScene';
import { GameButton } from './GameButton';
import { ExperienceControls } from './ExperienceControls';

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
    <header id="landing-header" className="landingHeader">
      {/* 1. GDAI Ribbon Badge (Top Left pinned flush to ceiling) — Clickable official GDAI link */}
      <div id="gdai-badge-container" className="gdaiBadgeWrap">
        <a
          id="gdai-badge-link"
          href="https://gdai.in"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit official Game Developer Association of India (GDAI) website (opens in a new tab)"
          className="gdaiBadgeLink"
          style={{
            display: 'inline-block',
            cursor: 'pointer',
            transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 200ms ease',
          }}
        >
          <img
            src="/assets/genesis/static/gdai-badge.webp"
            alt={EVENT_COPY.gdaiAlt}
            width={300}
            height={528}
            className="gdaiBadgeImg"
            draggable={false}
          />
        </a>
      </div>

      {/* 2. Top Nav Controls (Brochure, Prize, Sponsors) */}
      <nav
        id="primary-nav-controls"
        aria-label="Event Primary Navigation"
        className="primaryNavControls"
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
              className="navBtnItem"
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
      <ExperienceControls
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        motionPaused={motionPaused}
        onToggleMotion={onToggleMotion}
      />
    </header>
  );
};
