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
  const idleTweensRef = useRef<gsap.core.Tween[]>([]);
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
      '.prizePoolBannerWrapper, .prizeStage, .stageHeaderStrip, .stageSurfaceBody, .stageCharacterWrapper, .prizeMedalItem, .gemAccentWrapper'
    );
    gsap.set(elements, { opacity: 1, y: 0, scale: 1, clearProps: 'transform,opacity' });
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
    }

    const ctx = gsap.context(() => {
      // 1. Title Banner Entrance
      const banner = section.querySelector<HTMLElement>('.prizePoolBannerWrapper');
      if (banner) {
        const bannerTl = gsap.timeline({
          paused: true,
          scrollTrigger: {
            trigger: banner,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              hasEnteredRef.current = true;
              if (!motionPausedRef.current && !isReducedMotion()) {
                bannerTl.play();
              } else {
                bannerTl.progress(1);
                gsap.set(banner, { opacity: 1, y: 0 });
              }
            },
          },
        });
        bannerTl.fromTo(
          banner,
          { opacity: 0, y: -24 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
        entranceTimelinesRef.current.push(bannerTl);
      }

      // 2. Stage 1: Main Prizes Stage Entrance
      const mainStage = section.querySelector<HTMLElement>('#prize-stage-main');
      if (mainStage) {
        const header = mainStage.querySelector<HTMLElement>('.stageHeaderStrip');
        const body = mainStage.querySelector<HTMLElement>('.stageSurfaceBody');
        const cowboy = mainStage.querySelector<HTMLElement>('.stageCharacterWrapper');
        const medals = mainStage.querySelectorAll<HTMLElement>('.prizeMedalItem');

        const mainTl = gsap.timeline({
          paused: true,
          scrollTrigger: {
            trigger: mainStage,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              hasEnteredRef.current = true;
              if (!motionPausedRef.current && !isReducedMotion()) {
                mainTl.play();
              } else {
                mainTl.progress(1);
                setRestingStyles();
              }
            },
          },
        });

        if (header && body) {
          mainTl.fromTo(
            [header, body],
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
          );
        }

        if (cowboy) {
          mainTl.fromTo(
            cowboy,
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.2)' },
            '-=0.3'
          );
        }

        if (medals.length > 0) {
          mainTl.fromTo(
            medals,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
            },
            '-=0.4'
          );
        }

        entranceTimelinesRef.current.push(mainTl);
      }

      // 3. Intermediate Purple Gem Accent Entrance
      const gem = section.querySelector<HTMLElement>('.gemAccentWrapper');
      if (gem) {
        const gemTl = gsap.timeline({
          paused: true,
          scrollTrigger: {
            trigger: gem,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              if (!motionPausedRef.current && !isReducedMotion()) {
                gemTl.play();
              } else {
                gemTl.progress(1);
                gsap.set(gem, { opacity: 1, scale: 1 });
              }
            },
          },
        });
        gemTl.fromTo(
          gem,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }
        );
        entranceTimelinesRef.current.push(gemTl);
      }

      // 4. Stage 2: VR Track Stage Entrance
      const vrStage = section.querySelector<HTMLElement>('#prize-stage-vr');
      if (vrStage) {
        const header = vrStage.querySelector<HTMLElement>('.stageHeaderStrip');
        const body = vrStage.querySelector<HTMLElement>('.stageSurfaceBody');
        const buzz = vrStage.querySelector<HTMLElement>('.stageCharacterWrapper');
        const vrMedals = vrStage.querySelectorAll<HTMLElement>('.prizeMedalItem');

        const vrTl = gsap.timeline({
          paused: true,
          scrollTrigger: {
            trigger: vrStage,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              hasEnteredRef.current = true;
              if (!motionPausedRef.current && !isReducedMotion()) {
                vrTl.play();
              } else {
                vrTl.progress(1);
                setRestingStyles();
              }
            },
          },
        });

        if (header && body) {
          vrTl.fromTo(
            [header, body],
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
          );
        }

        if (vrMedals.length > 0) {
          vrTl.fromTo(
            vrMedals,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
            },
            '-=0.3'
          );
        }

        if (buzz) {
          vrTl.fromTo(
            buzz,
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.2)' },
            '-=0.4'
          );
        }

        entranceTimelinesRef.current.push(vrTl);
      }

      // 5. Restrained Character Idle Animation (Created PAUSED)
      const cowboyIdle = section.querySelector<HTMLElement>('.characterIdleFrame.cowboyIdle');
      const buzzIdle = section.querySelector<HTMLElement>('.characterIdleFrame.buzzIdle');
      const tweens: gsap.core.Tween[] = [];

      if (cowboyIdle) {
        const t1 = gsap.to(cowboyIdle, {
          y: -3,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          paused: true,
        });
        tweens.push(t1);
      }

      if (buzzIdle) {
        const t2 = gsap.to(buzzIdle, {
          y: -2.5,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5,
          paused: true,
        });
        tweens.push(t2);
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
  }, [sectionRef, isReducedMotion, reconcileIdles, setRestingStyles]);

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
