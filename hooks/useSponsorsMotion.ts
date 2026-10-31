'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UseSponsorsMotionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  motionPaused: boolean;
}

export const useSponsorsMotion = ({
  sectionRef,
  motionPaused,
}: UseSponsorsMotionProps) => {
  const idleTweensRef = useRef<gsap.core.Tween[]>([]);
  const mainEntranceTimelineRef = useRef<gsap.core.Timeline | null>(null);
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
    const cards = section.querySelectorAll('[data-sponsor-card], button[id^="sponsor-slot-"]');
    gsap.set(
      [
        '#sponsors-heading-group',
        '#past-sponsors-panel',
        '#sponsor-board-caption',
        '#sponsor-spike-character',
        ...Array.from(cards),
      ],
      { opacity: 1, x: 0, y: 0, scale: 1, clearProps: 'transform,opacity' }
    );
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
      // ── 1. Restored Six-Card & Panel Entrance Timeline from be0692a ──
      const mainTl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          hasEnteredRef.current = true;
        },
      });
      mainEntranceTimelineRef.current = mainTl;

      // 1. Heading settles from small upward offset (0.0s – 0.65s)
      mainTl.fromTo(
        '#sponsors-heading-group',
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
        0
      );

      // 2. Past Sponsors panel settles from slight left offset (0.2s – 0.9s)
      mainTl.fromTo(
        '#past-sponsors-panel',
        { x: -18, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        0.2
      );

      // 3. Six-card sponsor board enters with a restrained card stagger (0.35s – 1.3s)
      const slotCards = section.querySelectorAll<HTMLElement>(
        '[data-sponsor-card], button[id^="sponsor-slot-"]'
      );
      if (slotCards.length !== 6) {
        console.warn(`Expected 6 sponsor cards, found ${slotCards.length}`);
      }

      if (slotCards.length > 0) {
        mainTl.fromTo(
          slotCards,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
          },
          0.35
        );
      }

      // 4. Caption bar settles (0.65s – 1.2s)
      mainTl.fromTo(
        '#sponsor-board-caption',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' },
        0.65
      );

      // 5. Mascot settles smoothly into its reserved lower-right corner (0.8s – 1.4s)
      mainTl.fromTo(
        '#sponsor-spike-character',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.8
      );

      // Entrance ScrollTrigger: triggers once on entering viewport
      ScrollTrigger.create({
        trigger: section,
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
      });

      // ── 2. Restored Restrained Idle Motion (Crown, Chest, Mascot) from be0692a ──
      // Created paused; only played when section is active and motion allowed
      const crownEl = section.querySelector('[class*="crownIdleWrap"], #crown-idle-wrap');
      const chestEl = section.querySelector('[class*="chestIdleWrap"], #chest-idle-wrap');
      const spikeEl = section.querySelector('[class*="spikeIdleWrap"], #spike-idle-wrap');

      const tweens: gsap.core.Tween[] = [];

      if (crownEl) {
        const crownIdle = gsap.to(crownEl, {
          y: -3,
          rotation: -1.2,
          duration: 6.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          transformOrigin: '50% 90%',
          paused: true,
        });
        tweens.push(crownIdle);
      }

      if (chestEl) {
        const chestIdle = gsap.to(chestEl, {
          y: -3.5,
          rotation: 1.5,
          duration: 7.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          transformOrigin: '50% 90%',
          paused: true,
        });
        tweens.push(chestIdle);
      }

      if (spikeEl) {
        const mascotIdle = gsap.to(spikeEl, {
          y: -2.5,
          duration: 7.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          paused: true,
        });
        tweens.push(mascotIdle);
      }

      idleTweensRef.current = tweens;

      // Section intersection observer: suspend idle loops when offscreen
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
    }, sectionRef);

    // Pause when document is hidden (tab switch)
    const handleVisibilityChange = () => {
      reconcileIdles();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Live OS reduced motion listener
    const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const handleMotionPreferenceChange = () => {
      if (isReducedMotion()) {
        if (mainEntranceTimelineRef.current) {
          mainEntranceTimelineRef.current.progress(1);
        }
        setRestingStyles();
      }
      reconcileIdles();
    };
    mql?.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mql?.removeEventListener('change', handleMotionPreferenceChange);
      ctx.revert();
      idleTweensRef.current.forEach((t) => t.kill());
      idleTweensRef.current = [];
      mainEntranceTimelineRef.current = null;
    };
  }, [sectionRef, isReducedMotion, reconcileIdles, setRestingStyles]);

  // Handle runtime pause toggle without replaying completed entrances
  useEffect(() => {
    if (motionPaused) {
      if (mainEntranceTimelineRef.current && !hasEnteredRef.current) {
        // Paused before entering or mid-entrance: jump to complete resting state
        mainEntranceTimelineRef.current.progress(1);
      }
      setRestingStyles();
      reconcileIdles();
    } else {
      reconcileIdles();
    }
  }, [motionPaused, setRestingStyles, reconcileIdles]);
};
