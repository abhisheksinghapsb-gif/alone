'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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

  // 2. Cowboy Gunfire state (Paired volley from both guns) & Space Ranger Reaction
  const [shotLeft, setShotLeft] = useState<ActiveShot | null>(null);
  const [shotRight, setShotRight] = useState<ActiveShot | null>(null);
  const [isRecoiling, setIsRecoiling] = useState<boolean>(false);
  const [isBuzzReacting, setIsBuzzReacting] = useState<boolean>(false);

  const lastShotTimeRef = useRef<number>(0);
  const lastTriggerKeyRef = useRef<string>('');
  const leftShotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rightShotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayRightShotRef = useRef<NodeJS.Timeout | null>(null);
  const recoilTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buzzTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (leftShotTimeoutRef.current) clearTimeout(leftShotTimeoutRef.current);
      if (rightShotTimeoutRef.current) clearTimeout(rightShotTimeoutRef.current);
      if (delayRightShotRef.current) clearTimeout(delayRightShotRef.current);
      if (recoilTimeoutRef.current) clearTimeout(recoilTimeoutRef.current);
      if (buzzTimeoutRef.current) clearTimeout(buzzTimeoutRef.current);
    };
  }, []);

  const handleTriggerGunfire = useCallback(
    (item: PrizeItem, triggerType: 'hover' | 'focus' | 'tap') => {
      // 1) Main Stage Cowboy Firing (Paired Volley from Both Guns)
      if (isMain && item.trackId === 'main') {
        const now = performance.now();
        // 750ms cooldown against spam / overlapping shots
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

        // Play blaster audio if sound is enabled
        if (soundEnabled) {
          uiAudio.playColtBlaster();
          // Second shot sound 60ms later for the paired volley
          setTimeout(() => {
            if (soundEnabled) uiAudio.playColtBlaster();
          }, 60);
        }

        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!motionPaused && !prefersReducedMotion) {
          const colors = MAIN_SHOT_COLORS[item.rankNumber];

          // Gun 1 (Left barrel) fires immediately at t = 0
          setShotLeft({
            id: now,
            rankNumber: item.rankNumber,
            colors,
          });
          setIsRecoiling(true);

          if (leftShotTimeoutRef.current) clearTimeout(leftShotTimeoutRef.current);
          leftShotTimeoutRef.current = setTimeout(() => {
            setShotLeft(null);
          }, 260);

          // Gun 2 (Right barrel) fires ~60ms later
          if (delayRightShotRef.current) clearTimeout(delayRightShotRef.current);
          delayRightShotRef.current = setTimeout(() => {
            setShotRight({
              id: now + 60,
              rankNumber: item.rankNumber,
              colors,
            });

            if (rightShotTimeoutRef.current) clearTimeout(rightShotTimeoutRef.current);
            rightShotTimeoutRef.current = setTimeout(() => {
              setShotRight(null);
            }, 260);
          }, 60);

          if (recoilTimeoutRef.current) clearTimeout(recoilTimeoutRef.current);
          recoilTimeoutRef.current = setTimeout(() => {
            setIsRecoiling(false);
          }, 420);
        }
      }

      // 2) VR Stage Space Ranger Complementary Reaction
      if (!isMain && item.trackId === 'vr') {
        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!motionPaused && !prefersReducedMotion) {
          setIsBuzzReacting(true);
          if (buzzTimeoutRef.current) clearTimeout(buzzTimeoutRef.current);
          buzzTimeoutRef.current = setTimeout(() => {
            setIsBuzzReacting(false);
          }, 700);
        }
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

                    {/* Gun 1: Left Barrel (Viewer's Left, pointing at -114deg) */}
                    {shotLeft && (
                      <div
                        className={`cowboyGunfireRig gunRigLeft rank-${shotLeft.rankNumber}`}
                        style={
                          {
                            '--shot-core': shotLeft.colors.core,
                            '--shot-glow': shotLeft.colors.glow,
                            '--shot-beam': shotLeft.colors.beam,
                            '--shot-flare': shotLeft.colors.flare,
                          } as React.CSSProperties
                        }
                        aria-hidden="true"
                      >
                        <div className="gunBarrelFlare" />
                        <div className="gunMuzzleFlash gunMuzzleFlashLeft" />
                        <div className="gunProjectileBeam gunProjectileBeamLeft" />
                      </div>
                    )}

                    {/* Gun 2: Right Barrel (Viewer's Right, pointing at -66deg) */}
                    {shotRight && (
                      <div
                        className={`cowboyGunfireRig gunRigRight rank-${shotRight.rankNumber}`}
                        style={
                          {
                            '--shot-core': shotRight.colors.core,
                            '--shot-glow': shotRight.colors.glow,
                            '--shot-beam': shotRight.colors.beam,
                            '--shot-flare': shotRight.colors.flare,
                          } as React.CSSProperties
                        }
                        aria-hidden="true"
                      >
                        <div className="gunBarrelFlare" />
                        <div className="gunMuzzleFlash gunMuzzleFlashRight" />
                        <div className="gunProjectileBeam gunProjectileBeamRight" />
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
              <div
                className={`characterIdleFrame buzzIdle ${
                  isBuzzReacting ? 'is-buzz-reacting' : ''
                }`}
              >
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

                  {/* Masked Visor Glint during VR Medal Activation */}
                  <div
                    className={`buzzVisorGlintFrame ${isBuzzReacting ? 'is-active' : ''}`}
                    aria-hidden="true"
                  >
                    <div className="buzzVisorGlintSweep" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
