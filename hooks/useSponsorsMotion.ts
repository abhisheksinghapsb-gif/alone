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
  const ambientTweenRef = useRef<gsap.core.Timeline | null>(null);

  // 1. Coordinated Section Entrance (lasts ~1.0s, triggers once)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || motionPaused) {
      gsap.set(
        [
          '#sponsors-heading-group',
          '#past-sponsors-panel',
          '.sponsorSlotHitTarget',
          '#sponsor-spike-character',
          '#sponsor-board-caption',
        ],
        { opacity: 1, x: 0, y: 0, scale: 1 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play reverse play reverse',
        },
      });

      // 1. Heading settles from small upward offset
      tl.fromTo(
        '#sponsors-heading-group',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
        0
      );

      // 2. Past Sponsors panel enters from small left offset (~25-30px)
      tl.fromTo(
        '#past-sponsors-panel',
        { x: -28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        0.1
      );

      // 3. Six sponsor slots appear with restrained stagger
      tl.fromTo(
        '.sponsorSlotHitTarget',
        { y: 18, scale: 0.96, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'back.out(1.2)',
        },
        0.2
      );

      // 4. Staggered card border illumination sequence across all 6 slots (Requirement 6A)
      tl.fromTo(
        '.slotArrivalHighlight',
        { opacity: 0 },
        {
          opacity: 0.95,
          duration: 0.18,
          stagger: 0.07,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
        },
        0.35
      );

      // 5. Finishing glint highlight on heading artwork (Requirement 6A)
      tl.fromTo(
        '.headingWordmarkImg',
        { filter: 'drop-shadow(0 0 0px transparent)' },
        {
          filter: 'drop-shadow(0 0 22px rgba(0, 240, 255, 0.85)) brightness(1.25)',
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        },
        0.82
      );

      // 6. Board caption settles
      tl.fromTo(
        '#sponsor-board-caption',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
        0.65
      );

      // 7. Spike character settles last
      tl.fromTo(
        '#sponsor-spike-character',
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' },
        0.75
      );
    }, section);

    return () => ctx.revert();
  }, [sectionRef, motionPaused]);

  // 2. Restrained Ambient Movements (gentle 2-3px idle drift)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || motionPaused) {
      if (ambientTweenRef.current) {
        ambientTweenRef.current.kill();
        ambientTweenRef.current = null;
      }
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const ambientTl = gsap.timeline({ repeat: -1, yoyo: true });

      // Crown icon and credits chest drift slightly (2-3px)
      ambientTl.to('.crownFlankImg', {
        y: -3,
        duration: 2.8,
        ease: 'sine.inOut',
      }, 0);

      ambientTl.to('.chestFlankImg', {
        y: 2.5,
        duration: 3.2,
        ease: 'sine.inOut',
      }, 0);

      // Spike character subtle idle sway (2px)
      ambientTl.to('#sponsor-spike-character', {
        y: -2.5,
        duration: 3.5,
        ease: 'sine.inOut',
      }, 0);

      ambientTweenRef.current = ambientTl;
    }, section);

    return () => ctx.revert();
  }, [sectionRef, motionPaused]);
};
