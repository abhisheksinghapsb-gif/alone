'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UseContactMotionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  bgRef: React.RefObject<HTMLDivElement | null>;
  motionPaused: boolean;
}

export const useContactMotion = ({
  sectionRef,
  bgRef,
  motionPaused,
}: UseContactMotionProps) => {
  const isOffscreenRef = useRef(false);

  // 1. Coordinated Section Entrance
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || motionPaused) {
      // Immediate presentation for reduced motion or paused state
      gsap.set(
        [
          section.querySelector('[data-contact-heading]'),
          section.querySelectorAll('[data-contact-group]'),
          section.querySelector('[data-contact-venue]'),
        ],
        { opacity: 1, y: 0, clearProps: 'all' }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const heading = section.querySelector('[data-contact-heading]');
      const contactGroups = section.querySelectorAll('[data-contact-group]');
      const venue = section.querySelector('[data-contact-venue]');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      });

      // 1. Heading settles (~16px downward settle)
      if (heading) {
        tl.fromTo(
          heading,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
          0
        );
      }

      // 2. Contact groups settle with graceful stagger
      if (contactGroups && contactGroups.length > 0) {
        tl.fromTo(
          contactGroups,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.18,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          },
          0.22
        );
      }

      // 3. Venue information settles
      if (venue) {
        tl.fromTo(
          venue,
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          },
          0.62
        );
      }
    }, section);

    return () => {
      ctx.revert();
    };
  }, [sectionRef]);

  // Handle mid-entrance pause: immediately show readable resting state
  useEffect(() => {
    if (motionPaused) {
      const section = sectionRef.current;
      if (section) {
        gsap.set(
          [
            section.querySelector('[data-contact-heading]'),
            section.querySelectorAll('[data-contact-group]'),
            section.querySelector('[data-contact-venue]'),
          ],
          { opacity: 1, y: 0 }
        );
      }
    }
  }, [motionPaused, sectionRef]);

  // 2. Illustrated Background Pointer Parallax Depth
  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const hasFinePointer =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || motionPaused || !hasFinePointer) {
      gsap.set(bg, { x: 0, y: 0 });
      return;
    }

    const quickX = gsap.quickTo(bg, 'x', { duration: 0.6, ease: 'power2.out' });
    const quickY = gsap.quickTo(bg, 'y', { duration: 0.6, ease: 'power2.out' });

    // Pointer move handler using reusable quickTo setters to eliminate GC thrashing
    const handlePointerMove = (e: PointerEvent) => {
      if (isOffscreenRef.current || document.hidden) return;

      const rect = section.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= 0) return;

      // Compute normalized offsets (-1 to +1) from section center
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Restrain parallax shift to 3-5px maximum
      const targetX = Math.max(-4, Math.min(4, nx * 4));
      const targetY = Math.max(-3, Math.min(3, ny * 3));

      quickX(targetX);
      quickY(targetY);
    };

    const handlePointerLeave = () => {
      quickX(0);
      quickY(0);
    };

    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      gsap.killTweensOf(bg);
      gsap.set(bg, { x: 0, y: 0 });
    };
  }, [sectionRef, bgRef, motionPaused]);

  // 3. Screen Visibility & Tab Liveness Management
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isOffscreenRef.current = !entry.isIntersecting;
        if (!entry.isIntersecting && bgRef.current) {
          gsap.to(bgRef.current, { x: 0, y: 0, duration: 0.4, overwrite: 'auto' });
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(section);

    const handleVisibility = () => {
      if (document.hidden && bgRef.current) {
        gsap.to(bgRef.current, { x: 0, y: 0, duration: 0.2, overwrite: 'auto' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sectionRef, bgRef]);
};
