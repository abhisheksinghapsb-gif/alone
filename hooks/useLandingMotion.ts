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
  const isHeroVisibleRef = useRef<boolean>(true);
  const cleanupPointerListenersRef = useRef<(() => void) | null>(null);
  const pauseHeroWorkRef = useRef<(() => void) | null>(null);
  const resumeHeroWorkRef = useRef<(() => void) | null>(null);
  const motionPausedRef = useRef<boolean>(motionPaused);
  motionPausedRef.current = motionPaused;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // The hero visibility observer and pointer normalization use #main-content
    // while gsap.context uses scene (#page-root) to keep header entrance selectors working.
    const heroElement =
      (scene.id === 'main-content'
        ? scene
        : scene.querySelector<HTMLElement>('#main-content')) ||
      document.getElementById('main-content') ||
      scene;

    // Check media query for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let triggerFallingComet: () => void = () => {};
    let scheduleNextComet: (delay?: number) => void = () => {};

    scheduleNextComet = (delay?: number) => {
      if (cometTimerRef.current !== null) {
        clearTimeout(cometTimerRef.current);
        cometTimerRef.current = null;
      }
      if (motionPausedRef.current || document.hidden || !isHeroVisibleRef.current) return;
      const interval = delay !== undefined ? delay : (3500 + Math.random() * 2000);
      cometTimerRef.current = window.setTimeout(triggerFallingComet, interval);
    };

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

      // Ninja (Leon) gentle breathing hover and natural mouse responsiveness
      const ninjaIdle = gsap.to('#ninja-motion-idle', {
        y: -3.5,
        duration: 5.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.45,
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

      let cometIndex = 0;

      triggerFallingComet = () => {
        if (cometTimerRef.current !== null) {
          clearTimeout(cometTimerRef.current);
          cometTimerRef.current = null;
        }
        if (motionPausedRef.current || document.hidden || !isHeroVisibleRef.current) return;

        const cometImg = document.getElementById('falling-comet-img') as HTMLImageElement | null;
        if (!cometImg) return;

        const variantSrc = cometVariants[cometIndex % cometVariants.length];

        // Dynamically compute flight path from actual scene bounds so comets never disappear on phones
        const sceneWidth = heroElement.clientWidth || window.innerWidth;
        const sceneHeight = heroElement.clientHeight || window.innerHeight;
        const skyLimit = sceneHeight * 0.72;

        let path: { startX: number; startY: number; endX: number; endY: number; duration: number };
        const lane = cometIndex % 3;
        if (lane === 0) {
          // Lane A: Upper-left descending down-right across upper center
          path = {
            startX: -140,
            startY: -50,
            endX: sceneWidth * 0.55 + 50,
            endY: skyLimit * 0.8,
            duration: 1.85,
          };
        } else if (lane === 1) {
          // Lane B: Center high cosmic corridor descending rightward
          path = {
            startX: sceneWidth * 0.15,
            startY: -80,
            endX: sceneWidth * 0.88 + 40,
            endY: skyLimit * 0.75,
            duration: 2.05,
          };
        } else {
          // Lane C: Upper mid sky crossing toward right horizon
          path = {
            startX: sceneWidth * 0.3,
            startY: -60,
            endX: sceneWidth + 80,
            endY: skyLimit * 0.85,
            duration: 1.95,
          };
        }
        cometIndex++;

        // Switch to chosen variant artwork
        cometImg.src = variantSrc;

        // Kill any previous tweens on the comet element
        gsap.killTweensOf(cometImg);
        if (activeCometTlRef.current) {
          activeCometTlRef.current.kill();
          activeCometTlRef.current = null;
        }

        // Position at entry boundary beyond top/upper-left
        gsap.set(cometImg, {
          x: path.startX,
          y: path.startY,
          opacity: 0,
          scale: 0.92,
        });

        const cometTl = gsap.timeline({
          onComplete: () => {
            activeCometTlRef.current = null;
            scheduleNextComet();
          },
        });
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
      };

      // First pass starts ~1.8 seconds after landing entrance finishes
      scheduleNextComet(1800);

      // 5. Desktop Pointer Parallax (Single unified loop, fine pointer only)
      // Note: Telescope (#cannon-layer) is deliberately excluded from parallax and remains stationary.
      if (window.matchMedia('(pointer: fine)').matches) {
        const celestialEls = heroElement.querySelectorAll<HTMLElement>('.parallax-celestial');
        const midEls = heroElement.querySelectorAll<HTMLElement>('.parallax-mid');
        const foreEls = heroElement.querySelectorAll<HTMLElement>('.parallax-fore');

        const setCelestialX = gsap.quickSetter(celestialEls, 'x', 'px');
        const setCelestialY = gsap.quickSetter(celestialEls, 'y', 'px');
        const setMidX = gsap.quickSetter(midEls, 'x', 'px');
        const setMidY = gsap.quickSetter(midEls, 'y', 'px');
        const setForeX = gsap.quickSetter(foreEls, 'x', 'px');
        const setForeY = gsap.quickSetter(foreEls, 'y', 'px');

        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const updateParallax = () => {
          if (!isParallaxRunningRef.current || !isHeroVisibleRef.current) {
            parallaxRafRef.current = null;
            return;
          }

          const dx = targetX - mouseX;
          const dy = targetY - mouseY;

          if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
            mouseX = targetX;
            mouseY = targetY;
            setCelestialX(mouseX * 2.8);
            setCelestialY(mouseY * 2.2);
            setMidX(mouseX * 5.5);
            setMidY(mouseY * 4.5);
            setForeX(mouseX * 9.5);
            setForeY(mouseY * 7.0);
            parallaxRafRef.current = null;
            return;
          }

          mouseX += dx * 0.08;
          mouseY += dy * 0.08;

          setCelestialX(mouseX * 2.8);
          setCelestialY(mouseY * 2.2);
          setMidX(mouseX * 5.5);
          setMidY(mouseY * 4.5);
          setForeX(mouseX * 9.5);
          setForeY(mouseY * 7.0);

          parallaxRafRef.current = requestAnimationFrame(updateParallax);
        };

        const requestParallaxFrame = () => {
          if (!isParallaxRunningRef.current || !isHeroVisibleRef.current) return;
          if (parallaxRafRef.current === null) {
            parallaxRafRef.current = requestAnimationFrame(updateParallax);
          }
        };

        const handlePointerMove = (e: MouseEvent) => {
          const rect = heroElement.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const rawX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const rawY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          targetX = Math.max(-1, Math.min(1, rawX));
          targetY = Math.max(-1, Math.min(1, rawY));
          requestParallaxFrame();
        };

        const handlePointerLeave = () => {
          targetX = 0;
          targetY = 0;
          requestParallaxFrame();
        };

        isParallaxRunningRef.current = !motionPaused && !prefersReducedMotion;
        if (isParallaxRunningRef.current) {
          requestParallaxFrame();
        }

        heroElement.addEventListener('mousemove', handlePointerMove, { passive: true });
        heroElement.addEventListener('mouseleave', handlePointerLeave, { passive: true });
        cleanupPointerListenersRef.current = () => {
          heroElement.removeEventListener('mousemove', handlePointerMove);
          heroElement.removeEventListener('mouseleave', handlePointerLeave);
        };
      }
    }, scene);

    const pauseHeroWork = () => {
      idleTweensRef.current.forEach((t) => t.pause());
      if (activeCometTlRef.current) activeCometTlRef.current.pause();
      if (cometTimerRef.current !== null) {
        clearTimeout(cometTimerRef.current);
        cometTimerRef.current = null;
      }
      isParallaxRunningRef.current = false;
      if (parallaxRafRef.current) {
        cancelAnimationFrame(parallaxRafRef.current);
        parallaxRafRef.current = null;
      }
    };

    const resumeHeroWork = () => {
      if (motionPausedRef.current || prefersReducedMotion) return;
      idleTweensRef.current.forEach((t) => t.resume());
      if (activeCometTlRef.current && activeCometTlRef.current.progress() < 1) {
        activeCometTlRef.current.resume();
      } else {
        activeCometTlRef.current = null;
        scheduleNextComet(1200);
      }
      isParallaxRunningRef.current = true;
      if (parallaxRafRef.current === null) {
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        if (finePointer) {
          // Trigger a frame to reconcile settled position
          parallaxRafRef.current = requestAnimationFrame(() => {
            parallaxRafRef.current = null;
          });
        }
      }
    };
    resumeHeroWorkRef.current = resumeHeroWork;
    pauseHeroWorkRef.current = pauseHeroWork;

    // Visibility change handler (tab suspension)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseHeroWork();
      } else if (!motionPausedRef.current && isHeroVisibleRef.current) {
        resumeHeroWork();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // IntersectionObserver to pause idle decorative loops and parallax when hero is offscreen
    let heroObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      heroObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const visible = entry ? entry.isIntersecting : false;
          isHeroVisibleRef.current = visible;
          if (visible && !document.hidden && !motionPausedRef.current) {
            resumeHeroWork();
          } else {
            pauseHeroWork();
          }
        },
        { threshold: 0.05 }
      );
      heroObserver.observe(heroElement);
    }

    return () => {
      if (heroObserver) heroObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (cleanupPointerListenersRef.current) {
        cleanupPointerListenersRef.current();
        cleanupPointerListenersRef.current = null;
      }
      pauseHeroWork();
      ctx.revert();
      if (cometTimerRef.current !== null) {
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
    if (motionPaused) {
      if (masterTimelineRef.current && masterTimelineRef.current.isActive()) {
        masterTimelineRef.current.progress(1);
      }
      pauseHeroWorkRef.current?.();
    } else if (isHeroVisibleRef.current && !document.hidden) {
      resumeHeroWorkRef.current?.();
    }
  }, [motionPaused]);
}
