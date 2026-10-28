'use client';

import { useEffect, useRef } from 'react';
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
  const motionPausedRef = useRef<boolean>(motionPaused);
  motionPausedRef.current = motionPaused;
  const isSectionActiveRef = useRef<boolean>(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(
        [
          '#sponsors-heading-group',
          '#past-sponsors-panel',
          '.sponsorSlotHitTarget',
          '#sponsor-board-caption',
          '#sponsor-spike-character',
        ],
        { opacity: 1, x: 0, y: 0, scale: 1 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      // ── 1. Slower Coordinated Entrance (~1.8–2.0s sequence) ──
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play reverse play reverse',
        },
      });

      // 1. Heading settles from small upward offset (0.0s – 0.65s)
      mainTl.fromTo(
        '#sponsors-heading-group',
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
        0
      );

      // 2. Main Sponsor Board Panel emerges (0.25s – 1.05s)
      mainTl.fromTo(
        '#past-sponsors-panel',
        { y: 24, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
        0.25
      );

      // 3. Grid of Sponsor Slots cascades gently (0.5s – 1.4s)
      const slotCards = section.querySelectorAll('.sponsorSlotHitTarget');
      if (slotCards.length > 0) {
        mainTl.fromTo(
          slotCards,
          { opacity: 0, y: 16, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: 'back.out(1.2)',
          },
          0.5
        );
      }

      // 4. Floating dynamic caption below board (0.9s – 1.5s)
      mainTl.fromTo(
        '#sponsor-board-caption',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0.9
      );

      // 5. Spike character slides in from bottom-right (1.0s – 1.85s)
      mainTl.fromTo(
        '#sponsor-spike-character',
        { opacity: 0, x: 28, y: 18, scale: 0.94 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power2.out',
        },
        1.0
      );

      // ── 2. Idle Character Animation (Dedicated Idle Wrapper, ~3px bounce) ──
      const spikeIdle = section.querySelector('#spike-idle-wrap');
      if (spikeIdle) {
        const t = gsap.to(spikeIdle, {
          y: -4,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
        if (motionPausedRef.current) t.pause();
        idleTweensRef.current.push(t);
      }

      // Suspend idle loops when section is offscreen
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          isSectionActiveRef.current = true;
          const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!motionPausedRef.current && !document.hidden && !isReduced) {
            idleTweensRef.current.forEach((t) => t.play());
          }
        },
        onLeave: () => {
          isSectionActiveRef.current = false;
          idleTweensRef.current.forEach((t) => t.pause());
        },
        onEnterBack: () => {
          isSectionActiveRef.current = true;
          const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!motionPausedRef.current && !document.hidden && !isReduced) {
            idleTweensRef.current.forEach((t) => t.play());
          }
        },
        onLeaveBack: () => {
          isSectionActiveRef.current = false;
          idleTweensRef.current.forEach((t) => t.pause());
        },
      });
    }, sectionRef);

    // Pause when document is hidden (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        idleTweensRef.current.forEach((t) => t.pause());
      } else {
        const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!motionPausedRef.current && !isReduced && isSectionActiveRef.current) {
          idleTweensRef.current.forEach((t) => t.resume());
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      ctx.revert();
      idleTweensRef.current.forEach((t) => t.kill());
      idleTweensRef.current = [];
    };
  }, [sectionRef]);

  // Handle runtime pause toggle without re-triggering entrance sequence
  useEffect(() => {
    if (motionPaused) {
      idleTweensRef.current.forEach((t) => t.pause());
    } else {
      const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isSectionActiveRef.current && !document.hidden && !isReduced) {
        idleTweensRef.current.forEach((t) => t.resume());
      }
    }
  }, [motionPaused]);
};
