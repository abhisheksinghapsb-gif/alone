'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { uiAudio } from '../lib/uiAudio';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UseAboutMotionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  motionPaused: boolean;
  soundEnabled: boolean;
}

export const useAboutMotion = ({
  sectionRef,
  motionPaused,
  soundEnabled,
}: UseAboutMotionProps) => {
  const emblemAnimRef = useRef<gsap.core.Timeline | null>(null);
  const pointerRafRef = useRef<number | null>(null);

  // Parallax target and current interpolated values
  const mouseTarget = useRef({ x: 0, y: 0, isHovering: false });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  // 1. Entrance Choreography with ScrollTrigger
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Immediate presentation for reduced motion
      gsap.set(
        [
          '#about-bg-layer',
          '#about-bg-entrance',
          '#about-plaque-wrapper',
          '#about-emblem-btn',
          '#about-wordmark-wrapper',
          '#briefing-panel-board',
          '.briefingParagraph',
        ],
        { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      // Coordinated Entrance Timeline (lasts ~0.9s, triggers once)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      });

      // 1. Background settles from a small enlargement (separate transform owner from pointer parallax)
      tl.fromTo(
        '#about-bg-entrance',
        { scale: 1.04, opacity: 0.8 },
        { scale: 1.0, opacity: 1, duration: 0.9, ease: 'power2.out' },
        0
      );

      // 2. About plaque slides into place by ~16px
      tl.fromTo(
        '#about-plaque-wrapper',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
        0.15
      );

      // 3. Skull emblem settles with a small rotation
      tl.fromTo(
        '#about-emblem-btn',
        { scale: 0.88, rotation: -14, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.6)' },
        0.2
      );

      // 4. Genesis wordmark appears with short vertical settle
      tl.fromTo(
        '#about-wordmark-wrapper',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.28
      );

      // 5. Cyan panel enters by ~18px
      tl.fromTo(
        '#briefing-panel-board',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        0.35
      );

      // 6. Paragraph groups appear with restrained stagger
      tl.fromTo(
        '.briefingParagraph',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power1.out' },
        0.5
      );
    }, section);

    return () => {
      ctx.revert();
      if (emblemAnimRef.current) {
        emblemAnimRef.current.kill();
        emblemAnimRef.current = null;
      }
    };
  }, [sectionRef]);

  // 2. Smoothed Pointer-Responsive Parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || motionPaused) return;

    // Cache DOM targets once
    const bg = section.querySelector<HTMLElement>('#about-bg-layer');
    const dec = section.querySelector<HTMLElement>('#about-decorative-pattern');
    const identityGroup = section.querySelector<HTMLElement>('#about-identity-group');

    let isRunning = false;

    const updateParallax = () => {
      const dx = mouseTarget.current.x - mouseCurrent.current.x;
      const dy = mouseTarget.current.y - mouseCurrent.current.y;

      let settled = false;
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        mouseCurrent.current.x = mouseTarget.current.x;
        mouseCurrent.current.y = mouseTarget.current.y;
        settled = true;
      } else {
        mouseCurrent.current.x += dx * 0.08;
        mouseCurrent.current.y += dy * 0.08;
      }

      const cx = mouseCurrent.current.x;
      const cy = mouseCurrent.current.y;

      // 1. Battle background translation: max 5px
      if (bg) {
        bg.style.transform = `translate3d(${-cx * 5}px, ${-cy * 4}px, 0)`;
      }

      // 2. Decorative pattern translation: max 3px
      if (dec) {
        dec.style.transform = `translate3d(${cx * 3}px, ${cy * 2.5}px, 0)`;
      }

      // 3. Plaque & Emblem group translation: max 4px, slight tilt
      if (identityGroup) {
        identityGroup.style.transform = `translate3d(${cx * 4}px, ${cy * 3}px, 0) rotate(${cx * 1.2}deg)`;
      }

      if (!settled) {
        pointerRafRef.current = requestAnimationFrame(updateParallax);
      } else {
        isRunning = false;
        pointerRafRef.current = null;
      }
    };

    const startParallax = () => {
      if (isRunning) return;
      isRunning = true;
      pointerRafRef.current = requestAnimationFrame(updateParallax);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      // Section-relative normalized coordinates (-1 to +1)
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      mouseTarget.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
        isHovering: true,
      };
      startParallax();
    };

    const handlePointerLeave = () => {
      mouseTarget.current = { x: 0, y: 0, isHovering: false };
      startParallax();
    };

    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      if (pointerRafRef.current) {
        cancelAnimationFrame(pointerRafRef.current);
        pointerRafRef.current = null;
      }
      isRunning = false;
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [sectionRef, motionPaused]);

  // 3. Interactive Emblem Activation Trigger
  const triggerEmblemReaction = () => {
    // Play quiet tactile UI chime pop if sound is enabled
    if (soundEnabled) {
      uiAudio.playEmblemAccent();
    }

    const emblem = sectionRef.current?.querySelector('#about-emblem-icon');
    const ring = sectionRef.current?.querySelector('#about-emblem-ripple');
    if (!emblem) return;

    // Clean up any in-flight emblem animation cleanly
    if (emblemAnimRef.current) {
      emblemAnimRef.current.kill();
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || motionPaused) return;

    const tl = gsap.timeline();
    emblemAnimRef.current = tl;

    // Quick tactical tilt followed by damped elastic spring return
    tl.to(emblem, {
      rotation: -14,
      scale: 1.12,
      duration: 0.1,
      ease: 'power2.out',
    }).to(emblem, {
      rotation: 0,
      scale: 1,
      duration: 0.48,
      ease: 'elastic.out(1.3, 0.45)',
    });

    // Expanding subtle golden pulse ring accent behind emblem
    if (ring) {
      tl.fromTo(
        ring,
        { scale: 0.9, opacity: 0.75 },
        { scale: 1.55, opacity: 0, duration: 0.42, ease: 'power2.out' },
        0
      );
    }
  };

  return {
    triggerEmblemReaction,
  };
};
