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

      // 2. Past Sponsors panel settles from slight left offset (0.2s – 0.9s)
      mainTl.fromTo(
        '#past-sponsors-panel',
        { x: -18, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        0.2
      );

      // 3. Six-card sponsor board enters with a restrained card stagger (0.35s – 1.3s)
      mainTl.fromTo(
        'button[id^="sponsor-slot-"]',
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

      // ── 2. Restrained Asynchronous Idle Motion (Crown, Chest, Mascot) ──
      // ~2–3px displacement, 6–9 seconds per cycle, no synchronized bouncing
      const crownIdle = gsap.to('[class*="crownIdleWrap"]', {
        y: -2.5,
        duration: 6.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      const chestIdle = gsap.to('[class*="chestIdleWrap"]', {
        y: -3,
        duration: 8.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      const mascotIdle = gsap.to('[class*="spikeIdleWrap"]', {
        y: -2.5,
        duration: 7.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      idleTweensRef.current = [crownIdle, chestIdle, mascotIdle];

      // Pause ambient idle loop when section is offscreen
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => idleTweensRef.current.forEach((t) => t.play()),
        onLeave: () => idleTweensRef.current.forEach((t) => t.pause()),
        onEnterBack: () => idleTweensRef.current.forEach((t) => t.play()),
        onLeaveBack: () => idleTweensRef.current.forEach((t) => t.pause()),
      });
    }, sectionRef);

    // Pause when document is hidden (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        idleTweensRef.current.forEach((t) => t.pause());
      } else if (!motionPaused && !prefersReducedMotion) {
        idleTweensRef.current.forEach((t) => t.resume());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      ctx.revert();
      idleTweensRef.current.forEach((t) => t.kill());
      idleTweensRef.current = [];
    };
  }, [motionPaused, sectionRef]);
};
