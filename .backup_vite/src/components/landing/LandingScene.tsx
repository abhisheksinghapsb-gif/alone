import React from 'react';
import styles from './LandingScene.module.css';
import { EVENT_COPY, SCENE_ASSETS } from '../../data/landing';
import { GameButton } from './GameButton';
import { useLandingMotion } from '../../hooks/useLandingMotion';

export interface LandingSceneProps {
  motionPaused: boolean;
  pageRef: React.RefObject<HTMLDivElement | null>;
}

export const LandingScene: React.FC<LandingSceneProps> = ({ motionPaused, pageRef }) => {
  // Hook coordinates Entrance GSAP, Idle loops, Comet trigger, and Pointer Parallax across pageRef
  useLandingMotion({ sceneRef: pageRef, motionPaused });

  return (
    <main id="main-content" className={styles.sceneContainer}>
      {/* Semantic H1 for Genesis 6 */}
      <h1 className="srOnly">
        {EVENT_COPY.title} — {EVENT_COPY.edition} | {EVENT_COPY.descriptor}
      </h1>

      {/* 1. Base Arena Background (Distant Floor & Horizon Glow) */}
      <div id="scene-bg" className={styles.bgLayer}>
        <img
          src={SCENE_ASSETS.bgArena.src}
          alt={SCENE_ASSETS.bgArena.alt}
          width={SCENE_ASSETS.bgArena.width}
          height={SCENE_ASSETS.bgArena.height}
          className={styles.bgImage}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* 2. Celestial Depth Layer (Parallax Celestial) */}
      {/* Ringed Planet (Upper Right) */}
      <div
        id="ringed-planet-layer"
        className={`${styles.ringedPlanetWrap} parallax-celestial`}
      >
        <div id="ringed-planet-idle">
          <img
            src={SCENE_ASSETS.ringedPlanet.src}
            alt={SCENE_ASSETS.ringedPlanet.alt}
            width={SCENE_ASSETS.ringedPlanet.width}
            height={SCENE_ASSETS.ringedPlanet.height}
            className={styles.ringedPlanetImg}
            draggable={false}
          />
        </div>
      </div>

      {/* Blue Planet (Upper Left) */}
      <div
        id="blue-planet-layer"
        className={`${styles.bluePlanetLeftWrap} parallax-celestial`}
      >
        <div id="blue-planet-idle">
          <img
            src={SCENE_ASSETS.bluePlanetLarge.src}
            alt={SCENE_ASSETS.bluePlanetLarge.alt}
            width={SCENE_ASSETS.bluePlanetLarge.width}
            height={SCENE_ASSETS.bluePlanetLarge.height}
            className={styles.bluePlanetLeftImg}
            draggable={false}
          />
        </div>
      </div>

      {/* Small Celestial Blue Planet (Mid Right) */}
      <div className={`${styles.bluePlanetSmallWrap} parallax-celestial`}>
        <img
          src={SCENE_ASSETS.bluePlanetSmall.src}
          alt={SCENE_ASSETS.bluePlanetSmall.alt}
          width={SCENE_ASSETS.bluePlanetSmall.width}
          height={SCENE_ASSETS.bluePlanetSmall.height}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
      </div>

      {/* Asteroids (Left & Right) */}
      <div className={`${styles.asteroidLeftWrap} parallax-celestial asteroid-idle`}>
        <img
          src={SCENE_ASSETS.asteroidSmall.src}
          alt={SCENE_ASSETS.asteroidSmall.alt}
          width={SCENE_ASSETS.asteroidSmall.width}
          height={SCENE_ASSETS.asteroidSmall.height}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
      </div>
      <div className={`${styles.asteroidRightWrap} parallax-celestial asteroid-idle`}>
        <img
          src={SCENE_ASSETS.asteroidLarge.src}
          alt={SCENE_ASSETS.asteroidLarge.alt}
          width={SCENE_ASSETS.asteroidLarge.width}
          height={SCENE_ASSETS.asteroidLarge.height}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
      </div>

      {/* Comet Streak Accent */}
      <div id="comet-accent" className={styles.cometAccentWrap}>
        <img
          src={SCENE_ASSETS.cometLarge.src}
          alt=""
          width={SCENE_ASSETS.cometLarge.width}
          height={SCENE_ASSETS.cometLarge.height}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
      </div>

      {/* 3. Glowing Blue Moon Dome (Midground) */}
      <div id="moon-layer" className={`${styles.moonWrap} parallax-mid`}>
        <div id="moon-idle">
          <img
            src={SCENE_ASSETS.moonDome.src}
            alt={SCENE_ASSETS.moonDome.alt}
            width={SCENE_ASSETS.moonDome.width}
            height={SCENE_ASSETS.moonDome.height}
            className={styles.moonImg}
            draggable={false}
          />
        </div>
      </div>

      {/* 4. Hero Characters Layer (Midground Parallax) */}
      {/* Left Character: Dual-Wielding Neon Gunslinger (Colt) */}
      <div id="gunslinger-layer" className={`${styles.gunslingerWrap} parallax-mid`}>
        <div id="gunslinger-idle">
          <img
            src={SCENE_ASSETS.gunslinger.src}
            alt="Neon Gunslinger Character"
            width={SCENE_ASSETS.gunslinger.width}
            height={SCENE_ASSETS.gunslinger.height}
            className={styles.gunslingerImg}
            draggable={false}
          />
        </div>
      </div>

      {/* Right Character: Chameleon Hood Ninja (Leon, horizontally mirrored) */}
      <div id="ninja-layer" className={`${styles.ninjaWrap} parallax-mid`}>
        <div id="ninja-idle">
          <img
            src={SCENE_ASSETS.ninja.src}
            alt="Chameleon Hood Ninja Brawler Character"
            width={SCENE_ASSETS.ninja.width}
            height={SCENE_ASSETS.ninja.height}
            className={styles.ninjaImg}
            draggable={false}
          />
        </div>
      </div>

      {/* 5. Foreground Stadium Objects (Foreground Parallax) */}
      {/* Left Foreground Cannon Turret (Grounded, no float) */}
      <div id="cannon-layer" className={`${styles.cannonWrap} parallax-fore`}>
        <img
          src={SCENE_ASSETS.cannon.src}
          alt="Star-Emblem Cannon Turret"
          width={SCENE_ASSETS.cannon.width}
          height={SCENE_ASSETS.cannon.height}
          className={styles.cannonImg}
          draggable={false}
        />
      </div>

      {/* Lower-Right Squeak Balloon Character with Speech Bubble */}
      <div id="balloon-layer" className={`${styles.balloonWrap} parallax-fore`}>
        <div id="balloon-idle">
          <img
            src={SCENE_ASSETS.balloon.src}
            alt="Squeak Balloon Character: Fine, you have my full attention."
            width={SCENE_ASSETS.balloon.width}
            height={SCENE_ASSETS.balloon.height}
            className={styles.balloonImg}
            draggable={false}
          />
        </div>
      </div>

      {/* 6. Central Hero Identity & REGISTER CTA */}
      <div id="identity-layer" className={styles.centerHeroWrap}>
        {/* Genesis Wordmark + Golden Star/Skull Emblem */}
        <div className={styles.genesisLogoWrap}>
          <img
            src={SCENE_ASSETS.genesisHero.src}
            alt={SCENE_ASSETS.genesisHero.alt}
            width={SCENE_ASSETS.genesisHero.width}
            height={SCENE_ASSETS.genesisHero.height}
            className={styles.genesisLogoImg}
            draggable={false}
          />
        </div>

        {/* Edition Label & Event Descriptor */}
        <div className={styles.eventMetaWrap}>
          <span className={styles.editionBadge}>{EVENT_COPY.edition}</span>
          <p className={styles.descriptorText}>{EVENT_COPY.descriptor}</p>
        </div>

        {/* Primary REGISTER CTA Button */}
        <div id="register-layer" className={styles.ctaContainer}>
          <GameButton
            id="primary-register-btn"
            label={EVENT_COPY.primaryCtaText}
            actionId="register"
            isCta={true}
            className={styles.registerBtnWrap}
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
