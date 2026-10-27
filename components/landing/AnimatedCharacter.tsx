'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  // --- Colt (Gunslinger) Blinking State ---
  const [isColtBlinking, setIsColtBlinking] = useState<boolean>(false);
  const characterContainerRef = useRef<HTMLDivElement | null>(null);
  const isColtVisibleRef = useRef<boolean>(true);
  const blinkIntervalRef = useRef<number | null>(null);
  const blinkCloseTimerRef = useRef<number | null>(null);
  const isUnmountedRef = useRef<boolean>(false);

  // --- Colt (Gunslinger) Shooting State ---
  const [muzzleKey, setMuzzleKey] = useState<number>(0);
  const [showMuzzleFx, setShowMuzzleFx] = useState<boolean>(false);
  const [showLocalGlow, setShowLocalGlow] = useState<boolean>(false);
  const [projectiles, setProjectiles] = useState<{ id: number }[]>([]);
  const nextProjectileIdRef = useRef<number>(0);
  const projectileTimersRef = useRef<Map<number, number>>(new Map());
  const recoilRef = useRef<HTMLDivElement | null>(null);

  const muzzleTimerRef = useRef<number | null>(null);
  const glowTimerRef = useRef<number | null>(null);

  // --- Hover States ---
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isBalloonHovered, setIsBalloonHovered] = useState<boolean>(false);

  // Track unmount lifecycle
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // --------------------------------------------------------------------------
  // 1. Natural Eyelid Blinking for Colt (Gunslinger)
  // Interval: 3 seconds between blink starts while visible and motion enabled.
  // Timings: Close ~60ms, Hold ~35ms, Reopen ~100ms.
  // Suspends immediately when offscreen, tab hidden, motion paused, or reduced motion.
  // Restores open eyes when suspending.
  // --------------------------------------------------------------------------
  const clearAllBlinkTimers = useCallback(() => {
    if (blinkIntervalRef.current !== null) {
      window.clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
    if (blinkCloseTimerRef.current !== null) {
      window.clearTimeout(blinkCloseTimerRef.current);
      blinkCloseTimerRef.current = null;
    }
  }, []);

  const triggerSingleBlink = useCallback(() => {
    if (isUnmountedRef.current || motionPaused || !isColtVisibleRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsColtBlinking(false);
      return;
    }

    // Start blink: close (~60ms via transition)
    setIsColtBlinking(true);

    // Hold for ~35ms after close: 60ms + 35ms = 95ms
    if (blinkCloseTimerRef.current !== null) {
      window.clearTimeout(blinkCloseTimerRef.current);
    }
    blinkCloseTimerRef.current = window.setTimeout(() => {
      if (isUnmountedRef.current) return;
      // Reopen (~100ms via transition)
      setIsColtBlinking(false);
      blinkCloseTimerRef.current = null;
    }, 95);
  }, [motionPaused]);

  // Handle visibility changes and 3s interval loop
  useEffect(() => {
    if (type !== 'gunslinger') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (motionPaused || prefersReducedMotion) {
      setIsColtBlinking(false);
      clearAllBlinkTimers();
      return;
    }

    clearAllBlinkTimers();
    blinkIntervalRef.current = window.setInterval(triggerSingleBlink, 3000);

    const handleVisibility = () => {
      if (document.hidden) {
        setIsColtBlinking(false);
        clearAllBlinkTimers();
      } else if (!motionPaused && isColtVisibleRef.current) {
        clearAllBlinkTimers();
        blinkIntervalRef.current = window.setInterval(triggerSingleBlink, 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearAllBlinkTimers();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [type, motionPaused, triggerSingleBlink, clearAllBlinkTimers]);

  // IntersectionObserver to pause blinking when offscreen
  useEffect(() => {
    if (type !== 'gunslinger') return;
    const el = characterContainerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isColtVisibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          setIsColtBlinking(false);
          clearAllBlinkTimers();
        } else if (!motionPaused && !document.hidden) {
          clearAllBlinkTimers();
          blinkIntervalRef.current = window.setInterval(triggerSingleBlink, 3000);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [type, motionPaused, triggerSingleBlink, clearAllBlinkTimers]);

  // --------------------------------------------------------------------------
  // 2. Responsive Shooting for Gunslinger Blaster
  // Every deliberate click produces an immediate shot without excessive cooldown.
  // Repeated clicks trigger fresh muzzle feedback, restart recoil from current pose,
  // and spawn new projectiles into a bounded pool (max 3-4 simultaneous).
  // --------------------------------------------------------------------------
  const clearShotTimers = useCallback(() => {
    if (muzzleTimerRef.current !== null) {
      window.clearTimeout(muzzleTimerRef.current);
      muzzleTimerRef.current = null;
    }
    if (glowTimerRef.current !== null) {
      window.clearTimeout(glowTimerRef.current);
      glowTimerRef.current = null;
    }
    projectileTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    projectileTimersRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      clearShotTimers();
    };
  }, [clearShotTimers]);

  const triggerShot = useCallback(() => {
    if (isUnmountedRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Play blaster sound (governed by audio toggle and bounded voices in uiAudio)
    uiAudio.playColtBlaster();

    if (!prefersReducedMotion) {
      // 1. Fresh muzzle flash and local weapon glow immediately
      setMuzzleKey((k) => k + 1);
      setShowMuzzleFx(true);
      setShowLocalGlow(true);

      if (muzzleTimerRef.current !== null) {
        window.clearTimeout(muzzleTimerRef.current);
      }
      muzzleTimerRef.current = window.setTimeout(() => {
        if (!isUnmountedRef.current) setShowMuzzleFx(false);
        muzzleTimerRef.current = null;
      }, 75);

      if (glowTimerRef.current !== null) {
        window.clearTimeout(glowTimerRef.current);
      }
      glowTimerRef.current = window.setTimeout(() => {
        if (!isUnmountedRef.current) setShowLocalGlow(false);
        glowTimerRef.current = null;
      }, 110);

      // 2. New short projectile in bounded pool (up to 4 simultaneous)
      const pId = nextProjectileIdRef.current++;
      setProjectiles((prev) => {
        const pool = prev.length >= 4 ? prev.slice(prev.length - 3) : prev;
        return [...pool, { id: pId }];
      });

      const pTimer = window.setTimeout(() => {
        if (isUnmountedRef.current) return;
        setProjectiles((prev) => prev.filter((p) => p.id !== pId));
        projectileTimersRef.current.delete(pId);
      }, 160);
      projectileTimersRef.current.set(pId, pTimer);

      // 3. Restart or blend local recoil from current pose immediately
      if (recoilRef.current && typeof recoilRef.current.animate === 'function') {
        recoilRef.current.getAnimations().forEach((anim) => anim.cancel());
        recoilRef.current.animate(
          [
            { transform: 'translate(-3.2px, -1.8px) rotate(-0.8deg)' },
            { transform: 'translate(0px, 0px) rotate(0deg)' },
          ],
          {
            duration: 220,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'forwards',
          }
        );
      }
    }
  }, []);

  const fireGunslingerBlaster = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerShot();
  };

  const handleBlasterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.repeat) {
        // Prevent held keyboard key from creating an uncontrolled firing loop
        e.preventDefault();
        return;
      }
      // Native button handles click on non-repeated Enter/Space key action
    }
  };

  // ==========================================================================
  // 1. GUNSLINGER (COLT) — Left Hero Character
  // Features:
  // - High-fidelity eyelid overlay (1:1 registration, 0% iris bleed)
  // - Natural blink timing (~3.5–6.5s interval, rare double blink)
  // - Semantic blaster weapon target button over right revolver
  // - Aligned muzzle flash at barrel tip (98.24%, 52.33%) along +3° trajectory
  // - Forward projectile energy streak and local muzzle light
  // - Restrained whole-character recoil wrapper (-3px impulse, 230ms return)
  // - Hover enlargement preserved on character body
  // ==========================================================================
  if (type === 'gunslinger') {
    return (
      <div
        ref={characterContainerRef}
        id="colt-character-wrap"
        className={`gunslingerCharacterWrap ${className}`}
        aria-label="Colt the Neon Gunslinger. Hover to inspect, click to fire blaster."
        onPointerEnter={() => {
          setIsHovered(true);
          uiAudio.playHoverTick();
        }}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'block',
          userSelect: 'none',
        }}
      >
        {/* Character Hover Enlargement Wrapper (Part 1 behaviour preserved) */}
        <div
          id="colt-hover-popup"
          style={{
            transform: isHovered
              ? 'translateY(-14px) scale(1.05)'
              : 'translateY(0px) scale(1)',
            filter: isHovered
              ? 'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.95)) brightness(1.06)'
              : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.75))',
            transformOrigin: '50% 92%',
            transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 280ms ease',
            willChange: 'transform',
          }}
        >
          {/* Dedicated Recoil Wrapper (Nested inside hover & idle structure) */}
          <div
            ref={recoilRef}
            id="colt-click-recoil"
            className="coltRecoilWrapper"
            style={{
              position: 'relative',
              transform: 'translate(0px, 0px) rotate(0deg)',
              transformOrigin: '50% 85%',
              willChange: 'transform',
            }}
          >
            {/* Base Gunslinger Hero Artwork (1532 x 1200) */}
            <img
              src={SCENE_ASSETS.gunslinger.src}
              alt={SCENE_ASSETS.gunslinger.alt}
              width={SCENE_ASSETS.gunslinger.width}
              height={SCENE_ASSETS.gunslinger.height}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              draggable={false}
            />

            {/* Part 2: Pixel-Perfect Closed Eyelid Artwork (1:1 Registration, Zero Iris Bleed) */}
            <img
              src="/assets/genesis/static/colt-eyelids-closed.webp"
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: isColtBlinking ? 1 : 0,
                transition: isColtBlinking
                  ? 'opacity 60ms cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'opacity 100ms cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 4,
              }}
              draggable={false}
            />

            {/* Part 2: Local Weapon Glow Response (Near firing hand/weapon) */}
            {showLocalGlow && (
              <div
                key={`colt-glow-${muzzleKey}`}
                aria-hidden="true"
                className="coltLocalGlow"
                style={{
                  position: 'absolute',
                  left: '88%',
                  top: '52.5%',
                  width: '130px',
                  height: '130px',
                  transform: 'translate(-50%, -50%)',
                  background:
                    'radial-gradient(circle, rgba(0, 245, 255, 0.42) 0%, rgba(0, 160, 255, 0.16) 45%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  animation: 'localWeaponGlow 110ms ease-out forwards',
                  zIndex: 5,
                }}
              />
            )}

            {/* Part 2: Aligned Directional Muzzle Flash at Barrel Opening (98.24%, 52.33%) */}
            {showMuzzleFx && (
              <div
                key={`colt-flash-${muzzleKey}`}
                aria-hidden="true"
                className="coltBlasterMuzzleFlash"
                style={{
                  position: 'absolute',
                  left: '98.24%',
                  top: '52.33%',
                  width: '135px',
                  height: '80px',
                  transform: 'translate(-8px, -50%) rotate(3deg)',
                  transformOrigin: '8px 50%',
                  pointerEvents: 'none',
                  animation: 'directionalMuzzleFlash 75ms ease-out forwards',
                  zIndex: 8,
                }}
              >
                <svg
                  viewBox="-10 -40 140 80"
                  style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
                >
                  <defs>
                    <radialGradient id="coltFlashCore" cx="15%" cy="50%" r="70%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                      <stop offset="35%" stopColor="#80FFFF" stopOpacity="0.95" />
                      <stop offset="70%" stopColor="#00F5FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
                    </radialGradient>
                    <filter id="coltFlashGlow" x="-20%" y="-40%" width="150%" height="180%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Transverse compensator venting spikes (vertical blast) */}
                  <polygon
                    points="6,-32 14,-8 20,-26"
                    fill="#00F5FF"
                    opacity="0.85"
                    filter="url(#coltFlashGlow)"
                  />
                  <polygon
                    points="6,32 14,8 20,26"
                    fill="#00F5FF"
                    opacity="0.85"
                    filter="url(#coltFlashGlow)"
                  />

                  {/* Main forward blast cone & spikes */}
                  <polygon
                    points="6,-7 22,-14 42,-5 105,0 42,5 22,14 6,7"
                    fill="url(#coltFlashCore)"
                    filter="url(#coltFlashGlow)"
                  />

                  {/* High-intensity pure white core */}
                  <ellipse cx="14" cy="0" rx="12" ry="6" fill="#FFFFFF" />
                </svg>
              </div>
            )}

            {/* Part 2: Projectile Energy Trail Streaks (Bounded Pool) */}
            {projectiles.map((p) => (
              <div
                key={`colt-proj-${p.id}`}
                aria-hidden="true"
                className="coltProjectileStreak"
                style={{
                  position: 'absolute',
                  left: '98.24%',
                  top: '52.33%',
                  width: '120px',
                  height: '18px',
                  transform: 'translate(0, -50%) rotate(3deg)',
                  transformOrigin: '0% 50%',
                  pointerEvents: 'none',
                  animation: 'projectileStreak 150ms ease-out forwards',
                  zIndex: 7,
                }}
              >
                <svg
                  viewBox="0 0 120 18"
                  style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id={`coltStreakGrad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.2" />
                      <stop offset="40%" stopColor="#00F5FF" stopOpacity="0.9" />
                      <stop offset="85%" stopColor="#FFFFFF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#80FFFF" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  {/* Outer neon cyan glow beam */}
                  <line
                    x1="0"
                    y1="9"
                    x2="85"
                    y2="9"
                    stroke={`url(#coltStreakGrad-${p.id})`}
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Intense inner white core line */}
                  <line
                    x1="25"
                    y1="9"
                    x2="82"
                    y2="9"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}

            {/* Semantic Accessible Button Over Gunslinger Hit Target */}
            <button
              id="colt-blaster-btn"
              type="button"
              aria-label="Fire gunslinger blaster"
              onClick={fireGunslingerBlaster}
              onKeyDown={handleBlasterKeyDown}
              className="coltBlasterButton"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                borderRadius: '16px',
                zIndex: 10,
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 2. NINJA (LEON) — Right Hero Character
  // Responsive Cursor Hover Pop-Out:
  // - On hover: lifts -14px with spring scale 1.05 and deep drop-shadow
  // - Plays soft audio hover tick via uiAudio.playHoverTick()
  // - Smooth transition returning to baseline rest on pointer leave
  // - Preserves clean character art without circular aura, reticle, or idle loops
  // ==========================================================================
  if (type === 'ninja') {
    return (
      <div
        id="leon-character-wrap"
        className={`ninjaCharacterWrap characterInteractionTarget ${className}`}
        aria-label="Leon the Chameleon Hood Ninja Brawler. Hover to inspect."
        onPointerEnter={() => {
          setIsHovered(true);
          uiAudio.playHoverTick();
        }}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'block',
          cursor: 'pointer',
          userSelect: 'none',
          outline: 'none',
        }}
      >
        <div
          id="leon-hover-popup"
          style={{
            transform: isHovered
              ? 'translateY(-14px) scale(1.05)'
              : 'translateY(0px) scale(1)',
            filter: isHovered
              ? 'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.95)) brightness(1.06)'
              : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.75))',
            transformOrigin: '50% 92%',
            transition: motionPaused
              ? 'none'
              : 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 280ms ease',
            willChange: 'transform, filter',
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
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 3. CANNON TURRET (TELESCOPE) — Grounded Left Foreground Floor
  // Requirements:
  // - Stationary during pointer movement
  // - Established tripod hover enlargement anchored at floor point (50% 92%)
  // - Strictly NON-FIRING: no click handler, no blast recoil, no muzzle flare.
  // ==========================================================================
  if (type === 'cannon') {
    return (
      <div
        id="cannon-turret-wrap"
        className={`telescopeInteractionTarget ${className}`}
        aria-label="Star-Emblem Telescope Cannon. Hover to inspect."
        onPointerEnter={() => {
          setIsHovered(true);
          uiAudio.playHoverTick();
        }}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          cursor: 'default',
          outline: 'none',
          display: 'block',
          userSelect: 'none',
        }}
      >
        <div
          id="telescope-hover-popup"
          style={{
            transform: isHovered
              ? 'translateY(-10px) scale(1.045)'
              : 'translateY(0px) scale(1)',
            filter: isHovered
              ? 'drop-shadow(0 16px 32px rgba(0, 0, 0, 0.95)) brightness(1.08)'
              : 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.85))',
            transformOrigin: '50% 92%',
            transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 260ms ease',
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
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 4. SQUEAK BALLOON — Lower-Right Foreground Floor
  // Requirements:
  // - Decorative, non-clickable (NO click action)
  // - Independent dialogue speech bubble
  // - Hover response on balloon body: lift ~8px, scale ~1.05, tilt ~2.5deg
  // ==========================================================================
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
          pointerEvents: 'none',
        }}
      >
        {/* Dialogue speech bubble: fixed in layout, 100% stable, undeformed */}
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

        {/* Balloon character body: nested idle loop wrapper and hover wrapper (decorative, non-clickable) */}
        <div id="balloon-ambient-wrapper" className="balloonAmbientWrapper" style={{ pointerEvents: 'auto' }}>
          <div
            id="balloon-hover-wrapper"
            className={isBalloonHovered ? 'isHovered' : ''}
            onPointerEnter={() => {
              setIsBalloonHovered(true);
              uiAudio.playHoverTick();
            }}
            onPointerLeave={() => setIsBalloonHovered(false)}
            style={{
              cursor: 'default',
              display: 'block',
              width: 'clamp(95px, 8.5vw, 130px)',
              transform: isBalloonHovered
                ? 'translateY(-8px) scale(1.05) rotate(2.5deg)'
                : 'translateY(0px) scale(1) rotate(0deg)',
              transition: 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
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
                userSelect: 'none',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.75))',
              }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
