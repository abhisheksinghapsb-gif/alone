'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SCENE_ASSETS } from '../data/landingScene';

export interface UseLandingMotionOptions {
  sceneRef: React.RefObject<HTMLDivElement | null>;
  motionPaused: boolean;
}

export function useLandingMotion({ sceneRef, motionPaused }: UseLandingMotionOptions) {
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const idleTweensRef = useRef<gsap.core.Animation[]>([]);
  const cometTimerRef = useRef<number | null>(null);
  const activeCometTlRef = useRef<gsap.core.Timeline | null>(null);
  const parallaxRafRef = useRef<number | null>(null);
  const isParallaxRunningRef = useRef<boolean>(false);
  const motionPausedRef = useRef<boolean>(motionPaused);
  motionPausedRef.current = motionPaused;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Check media query for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // 1. Reduced Motion handling: immediate appearance, no movement loops
      if (prefersReducedMotion) {
        gsap.set(
          [
            '#scene-bg',
            '#moon-layer',
            '#gunslinger-layer',
            '#ninja-layer',
            '#barrier-layer',
            '#cannon-layer',
            '#balloon-layer',
            '#ringed-planet-layer',
            '#blue-planet-layer',
            '#identity-layer',
            '#register-layer',
            '.headerNavBtnWrap',
            '#gdai-badge-container',
          ],
          { opacity: 1, x: 0, y: 0, scale: 1 }
        );
        return;
      }

      // 2. Entrance Sequence (Coordinated ~1.5s overlapping timeline)
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      masterTimelineRef.current = tl;

      // Initial state before entrance
      gsap.set('#scene-bg', { opacity: 0 });
      gsap.set('#moon-layer', { opacity: 0, y: 16 });
      gsap.set('#gunslinger-layer', { opacity: 0, x: -28 });
      gsap.set('#ninja-layer', { opacity: 0, x: 28 });
      gsap.set('#barrier-layer', { opacity: 0, y: 14 });
      gsap.set('#cannon-layer', { opacity: 0, y: 30 });
      gsap.set('#balloon-layer', { opacity: 0, y: 24 });
      gsap.set('#ringed-planet-layer', { opacity: 0, scale: 0.92 });
      gsap.set('#blue-planet-layer', { opacity: 0, scale: 0.9 });
      gsap.set('#identity-layer', { opacity: 0, y: -24, scale: 0.95 });

      // Step 1: Base space and arena lighting emerge
      tl.to('#scene-bg', { opacity: 1, duration: 0.55 })
        // Step 2: Glowing moon settles into place behind the arena
        .to('#moon-layer', { opacity: 1, y: 0, duration: 0.7 }, '-=0.35')
        // Step 3: Celestial planets appear in celestial depth
        .to('#ringed-planet-layer', { opacity: 1, scale: 1, duration: 0.6 }, '-=0.55')
        .to('#blue-planet-layer', { opacity: 1, scale: 1, duration: 0.55 }, '-=0.5')
        // Step 4: Hero characters enter from left and right
        .to('#gunslinger-layer', { opacity: 1, x: 0, duration: 0.65 }, '-=0.4')
        .to('#ninja-layer', { opacity: 1, x: 0, duration: 0.65 }, '-=0.6')
        // Step 5: Foreground arena barrier settles into place, naturally concealing cut edges
        .to('#barrier-layer', { opacity: 1, y: 0, duration: 0.55 }, '-=0.45')
        // Step 6: Grounded cannon and balloon character rise to floor positions
        .to('#cannon-layer', { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
        .to('#balloon-layer', { opacity: 1, y: 0, duration: 0.55 }, '-=0.45')
        // Step 7: Genesis wordmark and emblem drop into hero position
        .to(
          '#identity-layer',
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.15)', clearProps: 'opacity,transform' },
          '-=0.35'
        )
        // Step 8: Top navigation controls arrive with 60ms stagger
        .fromTo(
          '#gdai-badge-container',
          { opacity: 0, y: -18 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.1)', clearProps: 'opacity,transform' },
          '-=0.45'
        )
        .fromTo(
          '.headerNavBtnWrap',
          { opacity: 0, y: -14 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.42, ease: 'back.out(1.15)', clearProps: 'opacity,transform' },
          '-=0.4'
        )
        // Step 9: Primary Register CTA pops in with clear prominence
        .fromTo(
          '#register-layer',
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.3)', clearProps: 'opacity,transform' },
          '-=0.2'
        );

      // 3. Ambient Idle Loops (Dedicated wrappers prevent transform clashes)
      const idleTweens: gsap.core.Animation[] = [];

      // Large Blue Planet: continuous 2D rotation on visible axis center (55s per revolution, clockwise)
      const bluePlanetRot = gsap.to('#blue-planet-rot', {
        rotation: 360,
        duration: 55,
        ease: 'none',
        repeat: -1,
      });
      idleTweens.push(bluePlanetRot);

      // Small Blue Planet: continuous 2D rotation on visible axis center (75s per revolution, clockwise)
      const bluePlanetSmallRot = gsap.to('#blue-planet-small-rot', {
        rotation: 360,
        duration: 75,
        ease: 'none',
        repeat: -1,
      });
      idleTweens.push(bluePlanetSmallRot);

      // Purple Ringed Planet: keep rings strictly held at current inclination and size
      // Surface features rotate continuously via internal spherical projection canvas
      const planetIdle = gsap.to('#ringed-planet-idle', {
        y: -3,
        x: 1.5,
        duration: 8.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      idleTweens.push(planetIdle);

      // Gunslinger gentle breathing hover (restrained to keep safe bounds)
      const gunIdle = gsap.to('#gunslinger-motion-idle', {
        y: -3.5,
        duration: 4.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.2,
      });
      idleTweens.push(gunIdle);

      // Ninja gentle breathing hover (restrained to keep safe bounds)
      const ninjaIdle = gsap.to('#ninja-motion-idle', {
        y: -3.5,
        duration: 5.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.6,
      });
      idleTweens.push(ninjaIdle);

      // Squeak balloon buoyant, asymmetrical idle loop (~6–9px vertical, ~2px horizontal, ~1° tilt, 4.5s cycle)
      const balloonIdleTl = gsap.timeline({ repeat: -1 });
      balloonIdleTl
        .to('#balloon-ambient-wrapper', {
          y: -8,
          x: 2.2,
          rotation: 1.2,
          duration: 2.2,
          ease: 'sine.inOut',
        })
        .to('#balloon-ambient-wrapper', {
          y: 0,
          x: -1.2,
          rotation: -1.0,
          duration: 2.3,
          ease: 'sine.inOut',
        });
      idleTweens.push(balloonIdleTl);

      // Asteroid rocks slow drift
      const asteroidIdle = gsap.to('.asteroid-idle', {
        y: -3,
        x: 2,
        rotation: 10,
        duration: 6.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.4,
      });
      idleTweens.push(asteroidIdle);

      // Moon subtle breathing glow
      const moonIdle = gsap.to('#moon-glow-idle', {
        opacity: 0.95,
        scale: 1.01,
        duration: 5.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      idleTweens.push(moonIdle);

      idleTweensRef.current = idleTweens;

      // 4. Supplied Large Comets Falling Diagonal Descent Across the Sky
      // Direction: Downward and to the right, agreeing with the lower-right bright head and upper-left tail.
      const cometVariants = [
        SCENE_ASSETS.cometVariant1.src,
        SCENE_ASSETS.cometVariant2.src,
        SCENE_ASSETS.cometVariant3.src,
      ];

      const cometPaths = [
        // Path A: Upper-left open sky corridor, descending down-right across upper arena
        { startX: -160, startY: -60, endX: 740, endY: 390, duration: 1.85 },
        // Path B: Central high cosmic corridor, descending across the upper center sky
        { startX: 380, startY: -110, endX: 1340, endY: 370, duration: 2.05 },
        // Path C: Right sky lane crossing downward past the upper right
        { startX: 620, startY: -80, endX: 1580, endY: 410, duration: 1.95 },
      ];

      let cometIndex = 0;

      const triggerFallingComet = () => {
        if (motionPausedRef.current || document.hidden) return;

        const cometImg = document.getElementById('falling-comet-img') as HTMLImageElement | null;
        if (!cometImg) return;

        const variantSrc = cometVariants[cometIndex % cometVariants.length];
        const path = cometPaths[cometIndex % cometPaths.length];
        cometIndex++;

        // Switch to chosen variant artwork
        cometImg.src = variantSrc;

        // Kill any previous tweens on the comet element
        gsap.killTweensOf(cometImg);

        // Position at entry boundary beyond top/upper-left
        gsap.set(cometImg, {
          x: path.startX,
          y: path.startY,
          opacity: 0,
          scale: 0.92,
        });

        const cometTl = gsap.timeline();
        activeCometTlRef.current = cometTl;

        // Diagonal downward-right flight
        cometTl
          .to(cometImg, {
            x: path.endX,
            y: path.endY,
            duration: path.duration,
            ease: 'power1.inOut',
          }, 0)
          // Fade in near entry boundary
          .to(cometImg, {
            opacity: 1,
            duration: 0.28,
            ease: 'power1.in',
          }, 0)
          // Fade out near exit boundary
          .to(cometImg, {
            opacity: 0,
            duration: 0.38,
            ease: 'power2.out',
          }, path.duration - 0.38);

        // Schedule next pass (interval ~3.5–5.5s between passes)
        const nextInterval = 3500 + Math.random() * 2000;
        cometTimerRef.current = window.setTimeout(triggerFallingComet, nextInterval);
      };

      // First pass starts ~1.8 seconds after landing entrance finishes
      cometTimerRef.current = window.setTimeout(triggerFallingComet, 1800);

      // 5. Desktop Pointer Parallax (Single unified loop, fine pointer only)
      // Note: Telescope (#cannon-layer) is deliberately excluded from parallax and remains stationary.
      if (window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handlePointerMove = (e: MouseEvent) => {
          const rect = scene.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        };

        const handlePointerLeave = () => {
          targetX = 0;
          targetY = 0;
        };

        const updateParallax = () => {
          if (!isParallaxRunningRef.current) return;

          mouseX += (targetX - mouseX) * 0.08;
          mouseY += (targetY - mouseY) * 0.08;

          // Distant celestial: ~2-3px
          gsap.set('.parallax-celestial', {
            x: mouseX * 2.8,
            y: mouseY * 2.2,
            overwrite: 'auto',
          });
          // Midground moon & characters: ~5-6px
          gsap.set('.parallax-mid', {
            x: mouseX * 5.5,
            y: mouseY * 4.5,
            overwrite: 'auto',
          });
          // Foreground balloon: ~8-10px (cannon is stationary)
          gsap.set('.parallax-fore', {
            x: mouseX * 9.5,
            y: mouseY * 7.0,
            overwrite: 'auto',
          });

          parallaxRafRef.current = requestAnimationFrame(updateParallax);
        };

        isParallaxRunningRef.current = !motionPaused && !prefersReducedMotion;
        if (isParallaxRunningRef.current) {
          parallaxRafRef.current = requestAnimationFrame(updateParallax);
        }

        scene.addEventListener('mousemove', handlePointerMove, { passive: true });
        scene.addEventListener('mouseleave', handlePointerLeave, { passive: true });

        // Tab visibility handler: suspend work when tab hidden, resume smoothly on return
        const handleVisibilityChange = () => {
          if (document.hidden) {
            isParallaxRunningRef.current = false;
            if (parallaxRafRef.current) {
              cancelAnimationFrame(parallaxRafRef.current);
              parallaxRafRef.current = null;
            }
            if (cometTimerRef.current) {
              clearTimeout(cometTimerRef.current);
              cometTimerRef.current = null;
            }
            if (activeCometTlRef.current) {
              activeCometTlRef.current.pause();
            }
          } else if (!motionPausedRef.current && !prefersReducedMotion) {
            isParallaxRunningRef.current = true;
            parallaxRafRef.current = requestAnimationFrame(updateParallax);
            if (activeCometTlRef.current) {
              activeCometTlRef.current.resume();
            }
            if (!cometTimerRef.current) {
              cometTimerRef.current = window.setTimeout(triggerFallingComet, 1200);
            }
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          scene.removeEventListener('mousemove', handlePointerMove);
          scene.removeEventListener('mouseleave', handlePointerLeave);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          if (parallaxRafRef.current) cancelAnimationFrame(parallaxRafRef.current);
          isParallaxRunningRef.current = false;
        };
      }
    }, scene);

    return () => {
      ctx.revert();
      if (cometTimerRef.current) {
        clearTimeout(cometTimerRef.current);
        cometTimerRef.current = null;
      }
      if (activeCometTlRef.current) {
        activeCometTlRef.current.kill();
        activeCometTlRef.current = null;
      }
      if (parallaxRafRef.current) {
        cancelAnimationFrame(parallaxRafRef.current);
        parallaxRafRef.current = null;
      }
      isParallaxRunningRef.current = false;
    };
  }, [sceneRef]);

  // Handle Pause Motion state: pause or resume all idle tweens without jumping
  useEffect(() => {
    idleTweensRef.current.forEach((tween) => {
      if (motionPaused) {
        tween.pause();
      } else {
        tween.resume();
      }
    });

    if (motionPaused) {
      if (cometTimerRef.current) {
        clearTimeout(cometTimerRef.current);
        cometTimerRef.current = null;
      }
      if (activeCometTlRef.current) {
        activeCometTlRef.current.pause();
      }
      isParallaxRunningRef.current = false;
      if (parallaxRafRef.current) {
        cancelAnimationFrame(parallaxRafRef.current);
        parallaxRafRef.current = null;
      }
    } else {
      isParallaxRunningRef.current = true;
      if (activeCometTlRef.current) {
        activeCometTlRef.current.resume();
      }
    }
  }, [motionPaused]);
}
