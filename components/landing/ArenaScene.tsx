'use client';

import React from 'react';
import { EVENT_COPY, SCENE_ASSETS } from '../../data/landingScene';
import { GameButton } from './GameButton';
import { AnimatedCharacter } from './AnimatedCharacter';
import { SpaceEffects } from './SpaceEffects';
import { RingedPlanet } from './RingedPlanet';
import { useLandingMotion } from '../../hooks/useLandingMotion';

export interface ArenaSceneProps {
  motionPaused: boolean;
  pageRef: React.RefObject<HTMLDivElement | null>;
}

export const ArenaScene: React.FC<ArenaSceneProps> = ({ motionPaused, pageRef }) => {
  // Unified GSAP Entrance, Idle loops, Comet trigger, and Pointer Parallax
  useLandingMotion({ sceneRef: pageRef, motionPaused });

  return (
    <main id="main-content" className="sceneContainer">
      {/* Semantic Accessible Heading for Genesis 6 */}
      <h1 className="srOnly">
        {EVENT_COPY.title} — {EVENT_COPY.edition} | {EVENT_COPY.descriptor}
      </h1>

      {/* 1. Base Arena Background (Pure Cosmic Space Sky with Atmospheric Glow, No Wall) */}
      <div id="scene-bg" className="bgLayer">
        <img
          src={SCENE_ASSETS.bgSpaceSky.src}
          alt={SCENE_ASSETS.bgSpaceSky.alt}
          width={SCENE_ASSETS.bgSpaceSky.width}
          height={SCENE_ASSETS.bgSpaceSky.height}
          className="bgImage"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* 1.5. Dynamic Starfield Canvas Layer (Active falling stars) */}
      <SpaceEffects motionPaused={motionPaused} />

      {/* 2. Celestial Depth Layer (Parallax Celestial) */}
      {/* Ringed Planet (Upper Right Space) — Rotating spherical surface with fixed rings */}
      <div
        id="ringed-planet-layer"
        className="ringedPlanetWrap parallax-celestial"
      >
        <div id="ringed-planet-idle">
          <RingedPlanet motionPaused={motionPaused} />
        </div>
      </div>

      {/* Rotating Blue Planet (Upper Left Space) */}
      <div
        id="blue-planet-layer"
        className="bluePlanetLeftWrap parallax-celestial"
      >
        <div id="blue-planet-rot">
          <img
            src={SCENE_ASSETS.bluePlanetLarge.src}
            alt={SCENE_ASSETS.bluePlanetLarge.alt}
            width={SCENE_ASSETS.bluePlanetLarge.width}
            height={SCENE_ASSETS.bluePlanetLarge.height}
            className="bluePlanetLeftImg"
            draggable={false}
          />
        </div>
      </div>


      {/* Asteroids (Left & Right) — Separate outer parallax wrapper from inner idle wrapper */}
      <div className="asteroidLeftWrap parallax-celestial">
        <div className="asteroid-idle">
          <img
            src={SCENE_ASSETS.asteroidSmall.src}
            alt={SCENE_ASSETS.asteroidSmall.alt}
            width={SCENE_ASSETS.asteroidSmall.width}
            height={SCENE_ASSETS.asteroidSmall.height}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            draggable={false}
          />
        </div>
      </div>
      <div className="asteroidRightWrap parallax-celestial">
        <div className="asteroid-idle">
          <img
            src={SCENE_ASSETS.asteroidLarge.src}
            alt={SCENE_ASSETS.asteroidLarge.alt}
            width={SCENE_ASSETS.asteroidLarge.width}
            height={SCENE_ASSETS.asteroidLarge.height}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            draggable={false}
          />
        </div>
      </div>

      {/* Dynamic Falling Comet Artwork (Supplied Neon Comet variants) */}
      <div id="dynamic-comet-container" className="dynamicCometContainer" aria-hidden="true">
        <img
          id="falling-comet-img"
          src={SCENE_ASSETS.cometVariant1.src}
          alt=""
          className="fallingCometImg"
          draggable={false}
        />
      </div>

      {/* 3. Glowing Blue Moon Dome (Midground) */}
      {/* Sits behind the characters and behind the arena rail */}
      <div id="moon-layer" className="moonWrap parallax-mid">
        <div id="moon-glow-idle">
          <img
            src={SCENE_ASSETS.moonDome.src}
            alt={SCENE_ASSETS.moonDome.alt}
            width={SCENE_ASSETS.moonDome.width}
            height={SCENE_ASSETS.moonDome.height}
            className="moonImg"
            draggable={false}
          />
        </div>
      </div>

      {/* 4. Hero Characters Layer (Midground Parallax) */}
      {/* Left Character: Gunslinger (Colt) */}
      <div id="gunslinger-layer" className="gunslingerWrap parallax-mid">
        <div id="gunslinger-motion-idle">
          <AnimatedCharacter
            type="gunslinger"
            motionPaused={motionPaused}
          />
        </div>
      </div>

      {/* Right Character: Ninja (Leon) — Facing inward toward the center (stationary) */}
      <div id="ninja-layer" className="ninjaWrap">
        <div id="ninja-motion-idle">
          <AnimatedCharacter
            type="ninja"
            motionPaused={motionPaused}
          />
        </div>
      </div>

      {/* 5. Arena Foreground Barrier Rail & Stage Floor (Single explicit wall placement) */}
      {/* Naturally occludes the lower torso cutoffs of Colt and Leon, and the moon base */}
      <div id="barrier-layer" className="barrierLayer">
        <img
          src={SCENE_ASSETS.arenaRailTight.src}
          alt={SCENE_ASSETS.arenaRailTight.alt}
          width={SCENE_ASSETS.arenaRailTight.width}
          height={SCENE_ASSETS.arenaRailTight.height}
          className="barrierImage"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </div>

      {/* 6. Foreground Grounded Arena Objects */}
      {/* Left Foreground Telescope (Firmly grounded on arena floor, stationary during pointer movement) */}
      <div id="cannon-layer" className="cannonWrap">
        <AnimatedCharacter
          type="cannon"
          motionPaused={motionPaused}
        />
      </div>

      {/* Right Foreground Squeak Balloon Accent */}
      <div id="balloon-layer" className="balloonWrap parallax-fore">
        <AnimatedCharacter
          type="balloon"
          motionPaused={motionPaused}
        />
      </div>

      {/* 7. Central Hero Identity & REGISTER CTA */}
      <div id="identity-layer" className="centerHeroWrap">
        {/* 3D Genesis Wordmark + Golden Star/Skull Emblem */}
        <div className="genesisLogoWrap">
          <img
            src={SCENE_ASSETS.genesisHero.src}
            alt={SCENE_ASSETS.genesisHero.alt}
            width={SCENE_ASSETS.genesisHero.width}
            height={SCENE_ASSETS.genesisHero.height}
            className="genesisLogoImg"
            loading="eager"
            {...({ fetchPriority: 'high' } as any)}
            decoding="async"
            draggable={false}
          />
        </div>

        {/* Edition Label Block */}
        <div className="eventMetaWrap">
          <span className="editionBadge">{EVENT_COPY.edition}</span>
        </div>

        {/* Primary REGISTER CTA Button */}
        <div id="register-layer" className="ctaContainer">
          <GameButton
            id="primary-register-btn"
            label={EVENT_COPY.primaryCtaText}
            actionId="register"
            isCta={true}
            className="registerBtnWrap"
          >
            <img
              src={SCENE_ASSETS.registerBtn.src}
              alt="REGISTER"
              width={SCENE_ASSETS.registerBtn.width}
              height={SCENE_ASSETS.registerBtn.height}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              draggable={false}
            />
          </GameButton>
        </div>
      </div>
    </main>
  );
};
