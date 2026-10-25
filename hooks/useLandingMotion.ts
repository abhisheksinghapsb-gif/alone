'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface UseLandingMotionOptions {
  sceneRef: React.RefObject<HTMLDivElement | null>;
  motionPaused: boolean;
}

export function useLandingMotion({ sceneRef, motionPaused }: UseLandingMotionOptions) {
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const idleTweensRef = useRef<gsap.core.Tween[]>([]);
  const cometTimerRef = useRef<number | null>(null);
  const parallaxRafRef = useRef<number | null>(null);
  const isParallaxRunningRef = useRef<boolean>(false);

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
      gsap.set('#register-layer', { opacity: 0, scale: 0.88 });
      gsap.set('.headerNavBtnWrap', { opacity: 0, y: -14 });
      gsap.set('#gdai-badge-container', { opacity: 0, y: -18 });

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
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.15)' },
          '-=0.35'
        )
        // Step 8: Top navigation controls arrive with 60ms stagger
        .to(
          '#gdai-badge-container',
          { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.1)' },
          '-=0.45'
        )
        .to(
          '.headerNavBtnWrap',
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.42, ease: 'back.out(1.15)' },
          '-=0.4'
        )
        // Step 9: Primary Register CTA pops in with clear prominence
        .to(
          '#register-layer',
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.3)' },
          '-=0.2'
        );

      // 3. Ambient Idle Loops (Dedicated wrappers prevent transform clashes)
      const idleTweens: gsap.core.Tween[] = [];

      // Large Blue Planet: continuous 2D rotation on its axis (75s)
      const bluePlanetRot = gsap.to('#blue-planet-rot', {
        rotation: 360,
        duration: 75,
        ease: 'none',
        repeat: -1,
      });
      idleTweens.push(bluePlanetRot);

      // Small Blue Planet (Image 2): continuous 2D rotation on its axis (55s)
      const bluePlanetSmallRot = gsap.to('#blue-planet-small-rot', {
        rotation: -360,
        duration: 55,
        ease: 'none',
        repeat: -1,
      });
      idleTweens.push(bluePlanetSmallRot);

      // Ringed Planet Core (Image 2): continuous rotation on its axis around/inside the ring (48s)
      const ringedPlanetCoreRot = gsap.to('#ringed-planet-sphere-rot', {
        rotation: 360,
        duration: 48,
        ease: 'none',
        repeat: -1,
      });
      idleTweens.push(ringedPlanetCoreRot);

      // Ringed planet overall celestial rocking & drift
      const planetIdle = gsap.to('#ringed-planet-idle', {
        y: -5,
        x: 2.5,
        rotation: 1.5,
        duration: 7.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      idleTweens.push(planetIdle);

      // Asteroid rocks rotating on their axis (Image 2)
      const asteroidLeftRot = gsap.to('#asteroid-left-rot', {
        rotation: 360,
        duration: 38,
        ease: 'none',
        repeat: -1,
      });
      idleTweens.push(asteroidLeftRot);

      const asteroidRightRot = gsap.to('#asteroid-right-rot', {
        rotation: -360,
        duration: 46,
        ease: 'none',
        repeat: -1,
      });
      idleTweens.push(asteroidRightRot);

      // Asteroid rocks ambient float drift
      const asteroidIdle = gsap.to('.asteroid-idle', {
        y: -3,
        x: 2,
        duration: 6.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.4,
      });
      idleTweens.push(asteroidIdle);

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

      // Squeak balloon gentle buoyant bob (~8–10px)
      const balloonIdle = gsap.to('#balloon-ambient-wrapper', {
        y: -9,
        duration: 3.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.3,
      });
      idleTweens.push(balloonIdle);

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

      // 4. Big Falling Shooting Stars Animations (Active recurring cycle every 3–5.5s)
      let starCycle = 0;
      const triggerShootingStar = () => {
        if (motionPaused) return;

        const star1 = document.getElementById('big-shooting-star-1');
        const star2 = document.getElementById('big-shooting-star-2');
        const streak = document.getElementById('big-shooting-star-streak');

        if (starCycle === 0 && star1) {
          // Major shooting star from upper right across to lower left
          gsap.killTweensOf(star1);
          gsap.set(star1, {
            opacity: 0,
            x: 1050 + Math.random() * 150,
            y: -120 + Math.random() * 40,
            scale: 0.75,
          });
          const tlStar = gsap.timeline();
          tlStar
            .to(star1, { opacity: 1, scale: 1.15, duration: 0.32, ease: 'power1.in' })
            .to(
              star1,
              {
                x: 120 + Math.random() * 120,
                y: 440 + Math.random() * 80,
                scale: 0.85,
                opacity: 0,
                duration: 0.85,
                ease: 'power2.out',
              },
              '-=0.04'
            );
        } else if (starCycle === 1 && star2) {
          // Flipped major shooting star crossing from upper left to lower right
          gsap.killTweensOf(star2);
          gsap.set(star2, {
            opacity: 0,
            x: 60 + Math.random() * 120,
            y: -100 + Math.random() * 50,
            scale: 0.7,
          });
          const tlStar = gsap.timeline();
          tlStar
            .to(star2, { opacity: 1, scale: 1.1, duration: 0.35, ease: 'power1.in' })
            .to(
              star2,
              {
                x: 980 + Math.random() * 160,
                y: 410 + Math.random() * 70,
                scale: 0.85,
                opacity: 0,
                duration: 0.9,
                ease: 'power2.out',
              },
              '-=0.04'
            );
        } else if (starCycle === 2 && streak) {
          // High-altitude swift streak passing through space
          gsap.killTweensOf(streak);
          gsap.set(streak, {
            opacity: 0,
            x: 850 + Math.random() * 120,
            y: -40 + Math.random() * 40,
            scale: 0.85,
          });
          const tlStar = gsap.timeline();
          tlStar
            .to(streak, { opacity: 0.95, duration: 0.22, ease: 'power1.in' })
            .to(
              streak,
              {
                x: 340 + Math.random() * 100,
                y: 240 + Math.random() * 60,
                opacity: 0,
                duration: 0.62,
                ease: 'power2.out',
              },
              '-=0.04'
            );
        }

        starCycle = (starCycle + 1) % 3;
        const nextDelay = 3000 + Math.random() * 2500;
        cometTimerRef.current = window.setTimeout(triggerShootingStar, nextDelay);
      };

      cometTimerRef.current = window.setTimeout(triggerShootingStar, 1400);

      // 5. Desktop Pointer Parallax (Single unified loop, fine pointer only)
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
          // Foreground cannon & balloon: ~8-10px
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

        // Tab visibility handler for parallax
        const handleVisibilityChange = () => {
          if (document.hidden) {
            isParallaxRunningRef.current = false;
            if (parallaxRafRef.current) {
              cancelAnimationFrame(parallaxRafRef.current);
              parallaxRafRef.current = null;
            }
          } else if (!motionPaused && !prefersReducedMotion) {
            isParallaxRunningRef.current = true;
            parallaxRafRef.current = requestAnimationFrame(updateParallax);
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
      }
      if (parallaxRafRef.current) {
        cancelAnimationFrame(parallaxRafRef.current);
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
      isParallaxRunningRef.current = false;
      if (parallaxRafRef.current) {
        cancelAnimationFrame(parallaxRafRef.current);
        parallaxRafRef.current = null;
      }
    } else {
      isParallaxRunningRef.current = true;
    }
  }, [motionPaused]);
}
