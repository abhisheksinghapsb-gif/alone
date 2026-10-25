'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SCENE_ASSETS } from '../../data/landingScene';
import { uiAudio } from '../../lib/uiAudio';

export interface AnimatedCharacterProps {
  type: 'gunslinger' | 'ninja' | 'cannon' | 'balloon';
  motionPaused: boolean;
  className?: string;
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  type,
  motionPaused,
  className = '',
}) => {
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [showMuzzleFlare, setShowMuzzleFlare] = useState<boolean>(false);
  const [isBalloonHovered, setIsBalloonHovered] = useState<boolean>(false);
  const cooldownRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Click / Tap Reaction Handler with Cooldown
  const handleInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setIsReacting(true);

    if (type === 'gunslinger') {
      uiAudio.playColtBlaster();
      setShowMuzzleFlare(true);
      window.setTimeout(() => setShowMuzzleFlare(false), 110);
      timerRef.current = window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 450);
    } else if (type === 'ninja') {
      uiAudio.playNinjaSwoosh();
      timerRef.current = window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 500);
    } else if (type === 'cannon') {
      uiAudio.playCannonBlast();
      setShowMuzzleFlare(true);
      window.setTimeout(() => setShowMuzzleFlare(false), 120);
      timerRef.current = window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 550);
    } else if (type === 'balloon') {
      uiAudio.playBalloonSqueak();
      timerRef.current = window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 480);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInteraction(e);
    }
  };

  // 1. GUNSLINGER (COLT) — Large Hero on Left
  if (type === 'gunslinger') {
    return (
      <div
        id="colt-character-wrap"
        className={`characterInteractionTarget ${className}`}
        role="button"
        tabIndex={0}
        aria-label="Colt the Neon Gunslinger. Click for blaster readiness recoil."
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          cursor: 'pointer',
          outline: 'none',
          display: 'block',
        }}
      >
        <div
          id="colt-click-recoil"
          style={{
            transform: isReacting
              ? 'translateY(-4px) scale(0.97)'
              : 'translateY(0px) scale(1)',
            transition: isReacting
              ? 'transform 80ms ease-out'
              : 'transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            willChange: 'transform',
          }}
        >
          <img
            src={SCENE_ASSETS.gunslinger.src}
            alt={SCENE_ASSETS.gunslinger.alt}
            width={SCENE_ASSETS.gunslinger.width}
            height={SCENE_ASSETS.gunslinger.height}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.75))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>
      </div>
    );
  }

  // 2. NINJA (LEON) — Large Inward-Facing Hero on Right
  if (type === 'ninja') {
    return (
      <div
        id="leon-character-wrap"
        className={`characterInteractionTarget ${className}`}
        role="button"
        tabIndex={0}
        aria-label="Leon the Hooded Ninja Brawler. Click for shuriken readiness gesture."
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          cursor: 'pointer',
          outline: 'none',
          display: 'block',
        }}
      >
        <div
          id="leon-click-recoil"
          style={{
            transform: isReacting
              ? 'translateY(-4px) rotate(-1.5deg) scale(0.97)'
              : 'translateY(0px) rotate(0deg) scale(1)',
            transition: isReacting
              ? 'transform 80ms ease-out'
              : 'transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            willChange: 'transform',
          }}
        >
          <img
            src={SCENE_ASSETS.ninja.src}
            alt={SCENE_ASSETS.ninja.alt}
            width={SCENE_ASSETS.ninja.width}
            height={SCENE_ASSETS.ninja.height}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.75))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>
      </div>
    );
  }

  // 3. CANNON TURRET — Grounded Left Foreground
  if (type === 'cannon') {
    return (
      <div
        id="cannon-turret-wrap"
        className={`characterInteractionTarget ${className}`}
        role="button"
        tabIndex={0}
        aria-label="Star-Emblem Cannon Turret. Click for heavy barrel recoil."
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          cursor: 'pointer',
          outline: 'none',
          display: 'block',
        }}
      >
        <div
          id="cannon-barrel-recoil"
          style={{
            transform: isReacting
              ? 'translate(-8px, 6px) scale(0.96)'
              : 'translate(0px, 0px) scale(1)',
            transition: isReacting
              ? 'transform 75ms ease-out'
              : 'transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            willChange: 'transform',
          }}
        >
          <img
            src={SCENE_ASSETS.cannon.src}
            alt={SCENE_ASSETS.cannon.alt}
            width={SCENE_ASSETS.cannon.width}
            height={SCENE_ASSETS.cannon.height}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 12px 30px rgba(0, 0, 0, 0.85))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />

          {/* Muzzle Light Spark on Click */}
          {showMuzzleFlare && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '38%',
                right: '18%',
                width: '85px',
                height: '85px',
                pointerEvents: 'none',
                transform: 'translate(50%, -50%)',
                animation: 'muzzlePop 120ms ease-out forwards',
              }}
            >
              <img
                src={SCENE_ASSETS.muzzleFlare.src}
                alt=""
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. SQUEAK BALLOON — Lower-Right Foreground with Separated Dialogue Bubble
  if (type === 'balloon') {
    return (
      <div
        id="balloon-character-group"
        className={`balloonCompositeContainer ${className}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
        }}
      >
        {/* Dialogue speech bubble: fixed in layout, 100% stable, no squash */}
        <div
          id="squeak-dialog-wrapper"
          className="squeakDialogWrap"
          style={{
            width: 'clamp(180px, 17vw, 250px)',
            height: 'auto',
            marginBottom: '16px',
            filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.65))',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <img
            src={SCENE_ASSETS.squeakDialog.src}
            alt="Fine, you have my full attention."
            width={SCENE_ASSETS.squeakDialog.width}
            height={SCENE_ASSETS.squeakDialog.height}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            draggable={false}
          />
        </div>

        {/* Balloon character body: nested wrappers for idle, hover tilt, and click squash */}
        <div id="balloon-ambient-wrapper" className="balloonAmbientWrapper">
          <div
            id="balloon-hover-wrapper"
            style={{
              transform: isBalloonHovered
                ? 'translateY(-6px) rotate(3deg)'
                : 'translateY(0px) rotate(0deg)',
              transition: 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              willChange: 'transform',
            }}
          >
            <button
              id="squeak-balloon-btn"
              type="button"
              tabIndex={0}
              aria-label="Squeak Balloon character. Click for soft squash and bounce."
              onClick={handleInteraction}
              onKeyDown={handleKeyDown}
              onPointerEnter={() => setIsBalloonHovered(true)}
              onPointerLeave={() => setIsBalloonHovered(false)}
              style={{
                width: 'clamp(95px, 8.5vw, 130px)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                outline: 'none',
                display: 'block',
              }}
            >
              <div
                id="balloon-click-squash"
                style={{
                  transformOrigin: '50% 90%',
                  transform: isReacting
                    ? 'scale(1.18, 0.82) translateY(6px)'
                    : 'scale(1, 1) translateY(0px)',
                  transition: isReacting
                    ? 'transform 85ms cubic-bezier(0.1, 0.9, 0.2, 1)'
                    : 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  willChange: 'transform',
                }}
              >
                <img
                  src={SCENE_ASSETS.squeakBalloon.src}
                  alt={SCENE_ASSETS.squeakBalloon.alt}
                  width={SCENE_ASSETS.squeakBalloon.width}
                  height={SCENE_ASSETS.squeakBalloon.height}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.8))',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                  draggable={false}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
