'use client';

import React, { useState, useRef, useCallback } from 'react';
import { PrizeTrack, PrizeItem, MAIN_SHOT_COLORS, GunshotColors } from './prizePoolData';
import { PrizeMedal } from './PrizeMedal';
import { useCharacterBlink } from './useCharacterBlink';
import { uiAudio } from '../../lib/uiAudio';

export interface PrizeStageProps {
  track: PrizeTrack;
  soundEnabled?: boolean;
  motionPaused?: boolean;
  onActivateMedal?: (item: PrizeItem) => void;
}

interface ActiveShot {
  id: number;
  rankNumber: 1 | 2 | 3;
  colors: GunshotColors;
}

export const PrizeStage: React.FC<PrizeStageProps> = ({
  track,
  soundEnabled = false,
  motionPaused = false,
  onActivateMedal,
}) => {
  const isMain = track.id === 'main';
  const characterRef = useRef<HTMLDivElement | null>(null);

  // 1. Character Blinking every 3s (Buzz offset by 1.5s)
  const blinkState = useCharacterBlink({
    containerRef: characterRef,
    initialDelayMs: isMain ? 0 : 1500,
    intervalMs: 3000,
    motionPaused,
  });

  // 2. Cowboy Gunfire state and throttle controls
  const [activeShot, setActiveShot] = useState<ActiveShot | null>(null);
  const [isRecoiling, setIsRecoiling] = useState<boolean>(false);
  const lastShotTimeRef = useRef<number>(0);
  const lastTriggerKeyRef = useRef<string>('');
  const shotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recoilTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTriggerGunfire = useCallback(
    (item: PrizeItem, triggerType: 'hover' | 'focus' | 'tap') => {
      // Only the Cowboy on the Main Prize stage shoots for Main Prizes
      if (!isMain || item.trackId !== 'main') return;

      const now = performance.now();
      // 750ms cooldown against spam / overlapping shots (650-850ms spec)
      if (now - lastShotTimeRef.current < 750) {
        return;
      }

      // Prevent duplicate focus shot right after hover shot on the same medal
      const triggerKey = `${item.id}-${triggerType}`;
      if (
        triggerType === 'focus' &&
        lastTriggerKeyRef.current === `${item.id}-hover` &&
        now - lastShotTimeRef.current < 1200
      ) {
        return;
      }

      lastShotTimeRef.current = now;
      lastTriggerKeyRef.current = triggerKey;

      // Play restrained blaster audio if sound is enabled
      if (soundEnabled) {
        uiAudio.playColtBlaster();
      }

      // If motion is paused or reduced motion is active, suppress visual recoil & projectile
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!motionPaused && !prefersReducedMotion) {
        const colors = MAIN_SHOT_COLORS[item.rankNumber];
        setActiveShot({
          id: now,
          rankNumber: item.rankNumber,
          colors,
        });
        setIsRecoiling(true);

        if (recoilTimeoutRef.current) clearTimeout(recoilTimeoutRef.current);
        recoilTimeoutRef.current = setTimeout(() => {
          setIsRecoiling(false);
        }, 360);

        if (shotTimeoutRef.current) clearTimeout(shotTimeoutRef.current);
        shotTimeoutRef.current = setTimeout(() => {
          setActiveShot(null);
        }, 380);
      }
    },
    [isMain, soundEnabled, motionPaused]
  );

  const handleMedalHover = useCallback(
    (item: PrizeItem) => {
      handleTriggerGunfire(item, 'hover');
    },
    [handleTriggerGunfire]
  );

  const handleMedalFocus = useCallback(
    (item: PrizeItem) => {
      handleTriggerGunfire(item, 'focus');
    },
    [handleTriggerGunfire]
  );

  const handleMedalActivate = useCallback(
    (item: PrizeItem) => {
      // Touch or click activation can trigger gunfire if not already fired
      handleTriggerGunfire(item, 'tap');
      if (onActivateMedal) {
        onActivateMedal(item);
      }
    },
    [handleTriggerGunfire, onActivateMedal]
  );

  return (
    <div
      className={`prizeStage prizeStage-${track.id}`}
      id={`prize-stage-${track.id}`}
      data-track={track.id}
    >
      {/* Cyan Header Strip with Category Wordmark */}
      <div className="stageHeaderStrip">
        <div className="stageHeadingWrapper">
          <img
            src={track.headingAsset}
            alt={track.headingAlt}
            className="stageHeadingImg"
            draggable={false}
          />
        </div>
        {/* Subtle decorative stadium status beacons */}
        <div className="stageHeaderRightAccent" aria-hidden="true">
          <span className="stageHeaderDot" />
          <span className="stageHeaderDot" />
          <span className="stageHeaderDot" />
        </div>
      </div>

      {/* Stage Surface Body */}
      <div className={`stageSurfaceBody ${isMain ? 'stageMainBody' : 'stageVrBody'}`}>
        {/* Floor Horizon Accent Line */}
        <div className="stageFloorLine" aria-hidden="true" />

        {/* Character on Left for Main Stage (Cowboy) */}
        {isMain && (
          <div
            ref={characterRef}
            className="stageCharacterWrapper leftCharacter"
            data-character="cowboy"
          >
            {/* Stable Contact Shadow on Floor */}
            <div className="characterShadowBase" aria-hidden="true" />

            {/* Separate Transform Wrappers for Hover Pop, Idle Drift, and Recoil */}
            <div className="characterHoverFrame">
              <div className="characterIdleFrame cowboyIdle">
                <div className={`characterRecoilFrame ${isRecoiling ? 'is-recoiling' : ''}`}>
                  <div className="characterArtFrame">
                    {/* Base Open Eyes Character Illustration */}
                    <img
                      src={track.characterAsset}
                      alt={track.characterAlt}
                      className="characterIllustration cowboyIllustration"
                      draggable={false}
                    />

                    {/* Half-Closed Eyelid Expression Layer */}
                    <img
                      src="/assets/genesis/prize-pool/woody-blink-half.webp"
                      alt=""
                      aria-hidden="true"
                      className={`characterBlinkLayer ${blinkState === 'half' ? 'is-visible' : ''}`}
                      draggable={false}
                    />

                    {/* Fully Closed Eyelid Expression Layer */}
                    <img
                      src="/assets/genesis/prize-pool/woody-blink.webp"
                      alt=""
                      aria-hidden="true"
                      className={`characterBlinkLayer ${blinkState === 'closed' ? 'is-visible' : ''}`}
                      draggable={false}
                    />

                    {/* Cowboy Gunfire Rig anchored to viewer's right gun muzzle */}
                    {activeShot && (
                      <div
                        className={`cowboyGunfireRig rank-${activeShot.rankNumber}`}
                        style={
                          {
                            '--shot-core': activeShot.colors.core,
                            '--shot-glow': activeShot.colors.glow,
                            '--shot-beam': activeShot.colors.beam,
                            '--shot-flare': activeShot.colors.flare,
                          } as React.CSSProperties
                        }
                        aria-hidden="true"
                      >
                        <div className="gunBarrelFlare" />
                        <div className="gunMuzzleFlash" />
                        <div className="gunProjectileBeam" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medals Cluster */}
        <div
          className={`stageMedalsCluster ${
            isMain ? 'mainMedalsCluster' : 'vrMedalsCluster'
          }`}
        >
          {track.prizes.map((prize) => (
            <PrizeMedal
              key={prize.id}
              item={prize}
              soundEnabled={soundEnabled}
              motionPaused={motionPaused}
              onActivate={handleMedalActivate}
              onHover={handleMedalHover}
              onFocus={handleMedalFocus}
            />
          ))}
        </div>

        {/* Character on Right for VR Stage (Space Ranger) */}
        {!isMain && (
          <div
            ref={characterRef}
            className="stageCharacterWrapper rightCharacter"
            data-character="buzzlight"
          >
            {/* Stable Contact Shadow on Floor */}
            <div className="characterShadowBase" aria-hidden="true" />

            {/* Separate Transform Wrappers for Hover Pop and Idle Drift */}
            <div className="characterHoverFrame">
              <div className="characterIdleFrame buzzIdle">
                <div className="characterArtFrame">
                  {/* Base Open Eyes Character Illustration */}
                  <img
                    src={track.characterAsset}
                    alt={track.characterAlt}
                    className="characterIllustration buzzIllustration"
                    draggable={false}
                  />

                  {/* Half-Closed Eyelid Expression Layer */}
                  <img
                    src="/assets/genesis/prize-pool/buzzlight-blink-half.webp"
                    alt=""
                    aria-hidden="true"
                    className={`characterBlinkLayer ${blinkState === 'half' ? 'is-visible' : ''}`}
                    draggable={false}
                  />

                  {/* Fully Closed Eyelid Expression Layer */}
                  <img
                    src="/assets/genesis/prize-pool/buzzlight-blink.webp"
                    alt=""
                    aria-hidden="true"
                    className={`characterBlinkLayer ${blinkState === 'closed' ? 'is-visible' : ''}`}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
