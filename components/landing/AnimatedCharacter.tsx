'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SCENE_ASSETS } from '../../data/landingScene';
import { uiAudio } from '../../lib/uiAudio';

export interface AnimatedCharacterProps {
  type: 'gunslinger' | 'ninja' | 'cannon' | 'balloon';
  motionPaused: boolean;
  pointerPosRef: React.RefObject<{ x: number; y: number }>;
  className?: string;
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  type,
  motionPaused,
  pointerPosRef,
  className = '',
}) => {
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [showMuzzleFlare, setShowMuzzleFlare] = useState<boolean>(false);
  const [blinkState, setBlinkState] = useState<boolean>(false);
  const cooldownRef = useRef<boolean>(false);
  const blinkTimerRef = useRef<number | null>(null);

  // Natural Blink Cycle for humanoid characters
  useEffect(() => {
    if (type !== 'gunslinger' && type !== 'ninja') return;
    if (motionPaused) return;

    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 3000;
      blinkTimerRef.current = window.setTimeout(() => {
        setBlinkState(true);
        window.setTimeout(() => {
          setBlinkState(false);
          scheduleNextBlink();
        }, 130);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [type, motionPaused]);

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
      window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 550);
    } else if (type === 'ninja') {
      uiAudio.playNinjaSwoosh();
      window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 600);
    } else if (type === 'cannon') {
      uiAudio.playCannonBlast();
      setShowMuzzleFlare(true);
      window.setTimeout(() => setShowMuzzleFlare(false), 120);
      window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 600);
    } else if (type === 'balloon') {
      uiAudio.playBalloonSqueak();
      window.setTimeout(() => {
        setIsReacting(false);
        cooldownRef.current = false;
      }, 650);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInteraction(e);
    }
  };

  // 1. GUNSLINGER (COLT)
  if (type === 'gunslinger') {
    return (
      <div
        id="gunslinger-wrapper"
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
        }}
      >
        <div
          id="gunslinger-idle"
          style={{
            transform: isReacting
              ? 'translateY(-3px) scale(0.98)'
              : 'translateY(0px)',
            transition: isReacting
              ? 'transform 90ms ease-out'
              : 'transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)',
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

          {/* Eyelid Blink Overlay (Positioned precisely over Colt's eyes) */}
          {blinkState && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '40.6%',
                left: '44.8%',
                width: '4.8%',
                height: '2.5%',
                backgroundColor: '#F3B497',
                borderRadius: '50%',
                borderBottom: '1.5px solid #6E3B27',
                pointerEvents: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            />
          )}

          {/* Muzzle Light Flare on Click */}
          {showMuzzleFlare && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '52%',
                left: '32%',
                width: '70px',
                height: '70px',
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)',
                animation: 'muzzlePop 110ms ease-out forwards',
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

  // 2. NINJA (LEON) - Inward-facing orientation (NO horizontal flip)
  if (type === 'ninja') {
    return (
      <div
        id="ninja-wrapper"
        className={`characterInteractionTarget ${className}`}
        role="button"
        tabIndex={0}
        aria-label="Leon the Chameleon Hood Ninja. Click for shuriken readiness gesture."
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <div
          id="ninja-idle"
          style={{
            transform: isReacting
              ? 'translateY(-4px) rotate(-2.5deg) scale(1.02)'
              : 'translateY(0px) rotate(0deg) scale(1)',
            transition: isReacting
              ? 'transform 100ms cubic-bezier(0.1, 0.9, 0.2, 1)'
              : 'transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Note: NO scaleX(-1). He faces inward to the left toward the center arena */}
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

          {/* Eyelid Blink Overlay (Positioned over Leon's eyes inside the hood) */}
          {blinkState && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '38.2%',
                left: '46.5%',
                width: '6.2%',
                height: '2.4%',
                backgroundColor: '#F9BE9B',
                borderRadius: '50%',
                borderBottom: '1.5px solid #4A3228',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // 3. CANNON TURRET (Firmly grounded in left foreground)
  if (type === 'cannon') {
    return (
      <div
        id="cannon-wrapper"
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
        }}
      >
        <div
          id="cannon-barrel-idle"
          style={{
            transform: isReacting
              ? 'translate(-8px, 6px) scale(0.97)'
              : 'translate(0px, 0px) scale(1)',
            transition: isReacting
              ? 'transform 80ms ease-out'
              : 'transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)',
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

  // 4. SQUEAK BALLOON (Lower-Right Foreground with speech bubble)
  if (type === 'balloon') {
    return (
      <div
        id="balloon-wrapper"
        className={`characterInteractionTarget ${className}`}
        role="button"
        tabIndex={0}
        aria-label="Squeak Balloon character. Click for soft squash and buoyant bounce."
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <div
          id="balloon-idle"
          style={{
            transform: isReacting
              ? 'scale(1.14, 0.86) translateY(6px)'
              : 'scale(1, 1) translateY(0px)',
            transformOrigin: '50% 90%',
            transition: isReacting
              ? 'transform 90ms cubic-bezier(0.1, 0.9, 0.2, 1)'
              : 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <img
            src={SCENE_ASSETS.balloon.src}
            alt={SCENE_ASSETS.balloon.alt}
            width={SCENE_ASSETS.balloon.width}
            height={SCENE_ASSETS.balloon.height}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 10px 26px rgba(0, 0, 0, 0.8))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>
      </div>
    );
  }

  return null;
};
