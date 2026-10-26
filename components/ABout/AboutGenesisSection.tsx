'use client';

import React, { useRef, useState } from 'react';
import { ABOUT_ASSETS, ABOUT_COPY } from '../../data/aboutGenesis';
import { BriefingPanel } from './BriefingPanel';
import { useAboutMotion } from '../../hooks/useAboutMotion';

export interface AboutGenesisSectionProps {
  motionPaused: boolean;
  soundEnabled: boolean;
}

export const AboutGenesisSection: React.FC<AboutGenesisSectionProps> = ({
  motionPaused,
  soundEnabled,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isAboutHovered, setIsAboutHovered] = useState<boolean>(false);

  // Coordinated entrance timeline, smoothed pointer parallax, and emblem reaction
  const { triggerEmblemReaction } = useAboutMotion({
    sectionRef,
    motionPaused,
    soundEnabled,
  });

  return (
    <section
      ref={sectionRef}
      id={ABOUT_COPY.sectionId}
      aria-labelledby="about-genesis-heading"
      className="aboutSectionContainer"
    >
      {/* Semantic Accessible Heading */}
      <h2 id="about-genesis-heading" className="srOnly">
        {ABOUT_COPY.heading}
      </h2>

      {/* 1. Base Arena Battle Background Scene (City, Mechas, Skyline) */}
      <div id="about-bg-layer" className="aboutBgLayer">
        <img
          src={ABOUT_ASSETS.battleBackground.src}
          alt={ABOUT_ASSETS.battleBackground.alt}
          width={ABOUT_ASSETS.battleBackground.width}
          height={ABOUT_ASSETS.battleBackground.height}
          className="aboutBgImage"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* 2. Top Seam Transition (Smooth bridge from Landing Arena floor to Nighttime City) */}
      <div className="aboutTopSeam" aria-hidden="true" />

      {/* 3. Dark Directional Gradient Overlay (Guarantees text contrast on left region) */}
      <div className="aboutGradientOverlay" aria-hidden="true" />

      {/* 4. Faint Technical Decorative Pattern (Group 808) */}
      <div
        id="about-decorative-pattern"
        className="aboutDecorativePattern"
        aria-hidden="true"
      >
        <img
          src={ABOUT_ASSETS.decorativePattern.src}
          alt=""
          width={ABOUT_ASSETS.decorativePattern.width}
          height={ABOUT_ASSETS.decorativePattern.height}
          className="aboutPatternImg"
          draggable={false}
        />
      </div>

      {/* 5. Two-Region Main Content Layout */}
      <div className="aboutContentLayout">
        {/* Left Region: Identity Stack & Briefing Board (45–49% usable width) */}
        <div className="aboutLeftRegion">
          {/* Identity Group: Yellow ABOUT Plaque + Overlapping Interactive Skull Emblem */}
          <div id="about-identity-group" className="aboutIdentityGroup">
            {/* Tightly Fitted Interactive Skull Star Emblem Button */}
            <button
              id="about-emblem-btn"
              type="button"
              className="aboutEmblemButton"
              onClick={triggerEmblemReaction}
              onPointerEnter={() => setIsAboutHovered(true)}
              onPointerLeave={() => setIsAboutHovered(false)}
              aria-label={ABOUT_COPY.emblemAriaLabel}
            >
              {/* Expanding Golden Pulse Ring on Activation */}
              <div
                id="about-emblem-ripple"
                className="aboutEmblemRipple"
                aria-hidden="true"
              />
              <img
                id="about-emblem-icon"
                src={ABOUT_ASSETS.skullEmblem.src}
                alt=""
                width={ABOUT_ASSETS.skullEmblem.width}
                height={ABOUT_ASSETS.skullEmblem.height}
                className={`aboutEmblemIcon ${isAboutHovered ? 'isRotating' : ''}`}
                draggable={false}
              />
            </button>

            {/* Yellow ABOUT Title Plaque */}
            <div
              id="about-plaque-wrapper"
              className="aboutPlaqueWrapper"
              onPointerEnter={() => setIsAboutHovered(true)}
              onPointerLeave={() => setIsAboutHovered(false)}
            >
              <img
                src={ABOUT_ASSETS.aboutPlaque.src}
                alt={ABOUT_ASSETS.aboutPlaque.alt}
                width={ABOUT_ASSETS.aboutPlaque.width}
                height={ABOUT_ASSETS.aboutPlaque.height}
                className="aboutPlaqueImg"
                draggable={false}
              />
            </div>
          </div>

          {/* Genesis Wordmark (Single complete instance with dark outline) */}
          <div
            id="about-wordmark-wrapper"
            className="aboutWordmarkWrapper"
            onPointerEnter={() => setIsAboutHovered(true)}
            onPointerLeave={() => setIsAboutHovered(false)}
          >
            <img
              src={ABOUT_ASSETS.genesisWordmark.src}
              alt={ABOUT_ASSETS.genesisWordmark.alt}
              width={ABOUT_ASSETS.genesisWordmark.width}
              height={ABOUT_ASSETS.genesisWordmark.height}
              className="aboutWordmarkImg"
              draggable={false}
            />
          </div>

          {/* Cyan Briefing Panel with Live HTML Approved Copy */}
          <BriefingPanel
            motionPaused={motionPaused}
            onHoverChange={setIsAboutHovered}
          />
        </div>

        {/* Right Region: Illustrated Action (Preserves foreground character & mecha combatants) */}
        <div className="aboutRightRegion" aria-hidden="true" />
      </div>
    </section>
  );
};
