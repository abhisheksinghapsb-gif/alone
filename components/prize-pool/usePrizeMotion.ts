'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // With reduced motion, ensure everything is fully visible immediately
      gsap.set(
        section.querySelectorAll(
          '.prizePoolBannerWrapper, .prizeStage, .stageHeaderStrip, .stageSurfaceBody, .stageCharacterWrapper, .prizeMedalItem, .gemAccentWrapper'
        ),
        { opacity: 1, y: 0, scale: 1, clearProps: 'all' }
      );
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Title Banner Entrance & Reverse
      const banner = section.querySelector('.prizePoolBannerWrapper');
      if (banner) {
        gsap.fromTo(
          banner,
          { opacity: 0, y: -24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: banner,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 2. Stage 1: Main Prizes Stage Entrance & Reverse
      // Use static stage wrapper as trigger, animate its inner artwork
      const mainStage = section.querySelector('#prize-stage-main');
      if (mainStage) {
        const header = mainStage.querySelector('.stageHeaderStrip');
        const body = mainStage.querySelector('.stageSurfaceBody');
        const cowboy = mainStage.querySelector('.stageCharacterWrapper');
        const medals = mainStage.querySelectorAll('.prizeMedalItem');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: mainStage,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });

        if (header && body) {
          tl.fromTo(
            [header, body],
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
          );
        }

        if (cowboy) {
          tl.fromTo(
            cowboy,
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.2)' },
            '-=0.3'
          );
        }

        if (medals.length > 0) {
          tl.fromTo(
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
      }

      // 3. Intermediate Purple Gem Accent Entrance & Reverse
      const gem = section.querySelector('.gemAccentWrapper');
      if (gem) {
        gsap.fromTo(
          gem,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: gem,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 4. Stage 2: VR Track Stage Entrance & Reverse
      // Use static stage wrapper as trigger, animate its inner artwork
      const vrStage = section.querySelector('#prize-stage-vr');
      if (vrStage) {
        const header = vrStage.querySelector('.stageHeaderStrip');
        const body = vrStage.querySelector('.stageSurfaceBody');
        const buzz = vrStage.querySelector('.stageCharacterWrapper');
        const vrMedals = vrStage.querySelectorAll('.prizeMedalItem');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: vrStage,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });

        if (header && body) {
          tl.fromTo(
            [header, body],
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
          );
        }

        if (vrMedals.length > 0) {
          tl.fromTo(
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
          tl.fromTo(
            buzz,
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.2)' },
            '-=0.4'
          );
        }
      }

      // 5. Restrained Character Idle Animation on Dedicated Idle Frame (2-3px)
      // Dedicated idle frame prevents overriding hover enlargement or recoil transforms
      const cowboyIdle = section.querySelector('.characterIdleFrame.cowboyIdle');
      const buzzIdle = section.querySelector('.characterIdleFrame.buzzIdle');

      if (cowboyIdle) {
        const t1 = gsap.to(cowboyIdle, {
          y: -3,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
        if (motionPaused) t1.pause();
        idleTweensRef.current.push(t1);
      }

      if (buzzIdle) {
        const t2 = gsap.to(buzzIdle, {
          y: -2.5,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5,
        });
        if (motionPaused) t2.pause();
        idleTweensRef.current.push(t2);
      }

      // Suspend repeated character idle loops when section is offscreen
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          if (!motionPaused && !document.hidden) {
            idleTweensRef.current.forEach((t) => t.play());
          }
        },
        onLeave: () => idleTweensRef.current.forEach((t) => t.pause()),
        onEnterBack: () => {
          if (!motionPaused && !document.hidden) {
            idleTweensRef.current.forEach((t) => t.play());
          }
        },
        onLeaveBack: () => idleTweensRef.current.forEach((t) => t.pause()),
      });
    }, section);

    // Pause idle loops when tab is hidden
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
      idleTweensRef.current.forEach((t) => t.kill());
      idleTweensRef.current = [];
      ctx.revert();
    };
  }, [sectionRef]);

  // Handle runtime pause toggle
  useEffect(() => {
    if (motionPaused) {
      idleTweensRef.current.forEach((t) => t.pause());
    } else {
      idleTweensRef.current.forEach((t) => t.resume());
    }
  }, [motionPaused]);
};
