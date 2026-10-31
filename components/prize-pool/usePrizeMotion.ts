'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UsePrizeMotionOptions {
  sectionRef: React.RefObject<HTMLElement | null>;
  motionPaused?: boolean;
}

export const usePrizeMotion = ({
  sectionRef,
  motionPaused = false,
}: UsePrizeMotionOptions) => {
  const idleTweensRef = useRef<(gsap.core.Tween | gsap.core.Timeline)[]>([]);
  const entranceTimelinesRef = useRef<gsap.core.Timeline[]>([]);
  const motionPausedRef = useRef<boolean>(motionPaused);
  motionPausedRef.current = motionPaused;
  const isSectionActiveRef = useRef<boolean>(false);
  const hasEnteredRef = useRef<boolean>(false);

  const isReducedMotion = useCallback(() => {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const setRestingStyles = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const elements = section.querySelectorAll(
      '.prizePoolBannerWrapper, .prizeStage, .stageHeaderStrip, .stageSurfaceBody, .stageCharacterWrapper, .prizeMedalItem, .gemAccentWrapper, .characterIdleFrame, .characterShadowBase'
    );
    gsap.set(elements, { opacity: 1, y: 0, x: 0, scale: 1, rotation: 0, clearProps: 'transform,opacity' });
  }, [sectionRef]);

  const reconcileIdles = useCallback(() => {
    const shouldPlay =
      isSectionActiveRef.current &&
      !document.hidden &&
      !motionPausedRef.current &&
      !isReducedMotion();

    if (shouldPlay) {
      idleTweensRef.current.forEach((t) => t.play());
    } else {
      idleTweensRef.current.forEach((t) => t.pause());
    }
  }, [isReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (isReducedMotion() || motionPausedRef.current) {
      setRestingStyles();
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Title Banner Entrance (Scroll-driven scrub)
      const banner = section.querySelector<HTMLElement>('.prizePoolBannerWrapper');
      if (banner) {
        const bannerTl = gsap.timeline({
          scrollTrigger: {
            trigger: banner,
            start: 'top 95%',
            end: 'top 70%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        bannerTl.fromTo(
          banner,
          { opacity: 0, y: -24 },
          { opacity: 1, y: 0, ease: 'power2.out' }
        );
        entranceTimelinesRef.current.push(bannerTl);
      }

      // 2. Stage 1: Main Prizes Stage Entrance (Scroll-driven scrub reversing smoothly on reverse scroll)
      const mainStage = section.querySelector<HTMLElement>('#prize-stage-main');
      if (mainStage) {
        const header = mainStage.querySelector<HTMLElement>('.stageHeaderStrip');
        const body = mainStage.querySelector<HTMLElement>('.stageSurfaceBody');
        const cowboy = mainStage.querySelector<HTMLElement>('.stageCharacterWrapper');
        const medals = mainStage.querySelectorAll<HTMLElement>('.prizeMedalItem');

        const mainTl = gsap.timeline({
          scrollTrigger: {
            trigger: mainStage,
            start: 'top 92%',
            end: 'top 58%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        if (header && body) {
          mainTl.fromTo(
            [header, body],
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, ease: 'power2.out' }
          );
        }

        if (cowboy) {
          mainTl.fromTo(
            cowboy,
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, ease: 'back.out(1.2)' },
            '<+=0.1'
          );
        }

        if (medals.length > 0) {
          mainTl.fromTo(
            medals,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              ease: 'power2.out',
            },
            '<+=0.1'
          );
        }

        entranceTimelinesRef.current.push(mainTl);
      }

      // 3. Intermediate Purple Gem Accent Entrance (Scroll-driven scrub)
      const gem = section.querySelector<HTMLElement>('.gemAccentWrapper');
      if (gem) {
        const gemTl = gsap.timeline({
          scrollTrigger: {
            trigger: gem,
            start: 'top 95%',
            end: 'top 70%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        gemTl.fromTo(
          gem,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, ease: 'back.out(1.4)' }
        );
        entranceTimelinesRef.current.push(gemTl);
      }

      // 4. Stage 2: VR Track Stage Entrance (Scroll-driven scrub reversing smoothly on reverse scroll)
      const vrStage = section.querySelector<HTMLElement>('#prize-stage-vr');
      if (vrStage) {
        const header = vrStage.querySelector<HTMLElement>('.stageHeaderStrip');
        const body = vrStage.querySelector<HTMLElement>('.stageSurfaceBody');
        const buzz = vrStage.querySelector<HTMLElement>('.stageCharacterWrapper');
        const vrMedals = vrStage.querySelectorAll<HTMLElement>('.prizeMedalItem');

        const vrTl = gsap.timeline({
          scrollTrigger: {
            trigger: vrStage,
            start: 'top 92%',
            end: 'top 58%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        if (header && body) {
          vrTl.fromTo(
            [header, body],
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, ease: 'power2.out' }
          );
        }

        if (vrMedals.length > 0) {
          vrTl.fromTo(
            vrMedals,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              ease: 'power2.out',
            },
            '<+=0.1'
          );
        }

        if (buzz) {
          vrTl.fromTo(
            buzz,
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, ease: 'back.out(1.2)' },
            '<+=0.1'
          );
        }

        entranceTimelinesRef.current.push(vrTl);
      }

      // 5. Restrained Character Idle Animation (Created PAUSED)
      const cowboyIdle = section.querySelector<HTMLElement>('.characterIdleFrame.cowboyIdle');
      const buzzIdle = section.querySelector<HTMLElement>('.characterIdleFrame.buzzIdle');
      const buzzShadow = section.querySelector<HTMLElement>('#prize-stage-vr .characterShadowBase');
      const tweens: (gsap.core.Tween | gsap.core.Timeline)[] = [];

      // Cowboy: grounded weight shift & turning left and right in 3D perspective
      if (cowboyIdle) {
        const cowboyTl = gsap.timeline({
          repeat: -1,
          paused: true,
          defaults: { ease: 'sine.inOut' },
        });
        cowboyTl
          // Turn smoothly toward the left
          .to(cowboyIdle, {
            rotationY: -11,
            rotation: -1.4,
            x: -3.5,
            duration: 2.6,
            transformOrigin: '50% 95%',
          })
          // Pause and turn back to center
          .to(cowboyIdle, {
            rotationY: 0,
            rotation: 0,
            x: 0,
            duration: 1.8,
            transformOrigin: '50% 95%',
          })
          // Turn smoothly toward the right
          .to(cowboyIdle, {
            rotationY: 11,
            rotation: 1.4,
            x: 3.5,
            duration: 2.6,
            transformOrigin: '50% 95%',
          })
          // Return to center
          .to(cowboyIdle, {
            rotationY: 0,
            rotation: 0,
            x: 0,
            duration: 1.8,
            transformOrigin: '50% 95%',
          });
        tweens.push(cowboyTl);
      }

      // Buzz in VR: turns left and right in 3D perspective + occasional buoyant hop with landing settle
      if (buzzIdle) {
        const buzzTl = gsap.timeline({
          repeat: -1,
          paused: true,
        });

        // 0.0s - 2.2s: Turn toward right
        buzzTl.to(buzzIdle, {
          rotationY: 10,
          rotation: 0.9,
          x: 2.5,
          duration: 2.2,
          ease: 'sine.inOut',
          transformOrigin: '50% 95%',
        });

        // 2.2s - 4.4s: Turn toward left
        buzzTl.to(buzzIdle, {
          rotationY: -10,
          rotation: -0.9,
          x: -2.5,
          duration: 2.2,
          ease: 'sine.inOut',
          transformOrigin: '50% 95%',
        });

        // 4.4s - 5.4s: Return to center before hop
        buzzTl.to(buzzIdle, {
          rotationY: 0,
          rotation: 0,
          x: 0,
          duration: 1.0,
          ease: 'sine.inOut',
          transformOrigin: '50% 95%',
        });

        // Anticipation crouch
        buzzTl.to(
          buzzIdle,
          {
            y: 1.5,
            rotationY: 2,
            scaleY: 0.98,
            scaleX: 1.01,
            duration: 0.25,
            ease: 'power1.in',
            transformOrigin: '50% 95%',
          },
          '+=0.1'
        );
        if (buzzShadow) {
          buzzTl.to(
            buzzShadow,
            {
              scaleX: 1.05,
              opacity: 0.8,
              duration: 0.25,
              ease: 'power1.in',
            },
            '<'
          );
        }

        // Buoyant hop lift (~8.5px displacement, slight directional shift)
        buzzTl.to(buzzIdle, {
          y: -8.5,
          x: -1,
          rotationY: -5,
          rotation: -0.9,
          scaleY: 1.02,
          scaleX: 0.99,
          duration: 0.4,
          ease: 'power2.out',
          transformOrigin: '50% 95%',
        });
        if (buzzShadow) {
          buzzTl.to(
            buzzShadow,
            {
              scale: 0.82,
              opacity: 0.45,
              duration: 0.4,
              ease: 'power2.out',
            },
            '<'
          );
        }

        // Clean landing back to stage floor
        buzzTl.to(buzzIdle, {
          y: 0,
          x: 0,
          rotationY: 0,
          rotation: 0,
          scaleY: 1,
          scaleX: 1,
          duration: 0.3,
          ease: 'power2.in',
          transformOrigin: '50% 95%',
        });
        if (buzzShadow) {
          buzzTl.to(
            buzzShadow,
            {
              scale: 1,
              opacity: 0.7,
              duration: 0.3,
              ease: 'power2.in',
            },
            '<'
          );
        }

        // Calm settle compression on landing
        buzzTl.to(buzzIdle, {
          y: 1.2,
          scaleY: 0.985,
          scaleX: 1.01,
          duration: 0.2,
          ease: 'power1.out',
          transformOrigin: '50% 95%',
        });
        if (buzzShadow) {
          buzzTl.to(
            buzzShadow,
            {
              scaleX: 1.04,
              opacity: 0.78,
              duration: 0.2,
              ease: 'power1.out',
            },
            '<'
          );
        }

        // Rebound to rest
        buzzTl.to(buzzIdle, {
          y: 0,
          scaleY: 1,
          scaleX: 1,
          duration: 0.35,
          ease: 'power1.inOut',
          transformOrigin: '50% 95%',
        });
        if (buzzShadow) {
          buzzTl.to(
            buzzShadow,
            {
              scaleX: 1,
              scaleY: 1,
              opacity: 0.7,
              duration: 0.35,
              ease: 'power1.inOut',
            },
            '<'
          );
        }

        // Unhurried rest & slight turn before next cycle
        buzzTl.to(buzzIdle, {
          x: 0,
          rotationY: 6,
          rotation: 0.5,
          duration: 1.8,
          ease: 'sine.inOut',
        });
        buzzTl.to(buzzIdle, {
          rotationY: 0,
          rotation: 0,
          duration: 1.4,
          ease: 'sine.inOut',
        });

        tweens.push(buzzTl);
      }

      idleTweensRef.current = tweens;

      // Suspend idle loops when section is offscreen
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          isSectionActiveRef.current = true;
          reconcileIdles();
        },
        onLeave: () => {
          isSectionActiveRef.current = false;
          reconcileIdles();
        },
        onEnterBack: () => {
          isSectionActiveRef.current = true;
          reconcileIdles();
        },
        onLeaveBack: () => {
          isSectionActiveRef.current = false;
          reconcileIdles();
        },
      });

      // Initial reconciliation
      reconcileIdles();
    }, section);

    // Pause idle loops when tab is hidden
    const handleVisibilityChange = () => {
      reconcileIdles();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Live OS reduced motion listener
    const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const handleMotionPreferenceChange = () => {
      if (isReducedMotion()) {
        entranceTimelinesRef.current.forEach((tl) => tl.progress(1));
        setRestingStyles();
      }
      reconcileIdles();
    };
    mql?.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mql?.removeEventListener('change', handleMotionPreferenceChange);
      idleTweensRef.current.forEach((t) => t.kill());
      idleTweensRef.current = [];
      entranceTimelinesRef.current = [];
      ctx.revert();
    };
  }, [sectionRef, motionPaused, isReducedMotion, reconcileIdles, setRestingStyles]);

  // Handle runtime pause toggle without replaying completed entrances
  useEffect(() => {
    if (motionPaused) {
      // Pause mid-entrance: jump all pending entrance timelines to completed resting state
      entranceTimelinesRef.current.forEach((tl) => {
        tl.progress(1);
      });
      setRestingStyles();
      reconcileIdles();
    } else {
      reconcileIdles();
    }
  }, [motionPaused, setRestingStyles, reconcileIdles]);
};
