'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FAQCategoryId } from './faqData';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UseFAQMotionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  activeCategoryId: FAQCategoryId;
  motionPaused: boolean;
}

export const useFAQMotion = ({
  sectionRef,
  activeCategoryId,
  motionPaused,
}: UseFAQMotionProps) => {
  const entranceTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const categorySwitchTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isInitialMount = useRef(true);
  const motionPausedRef = useRef<boolean>(motionPaused);
  motionPausedRef.current = motionPaused;
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
    gsap.set(
      [
        section.querySelector('[data-faq-plaque]'),
        section.querySelector('[data-faq-panel]'),
        section.querySelector('[data-faq-category-bar]'),
        section.querySelectorAll('[data-faq-item]'),
      ],
      { opacity: 1, y: 0, clearProps: 'transform,opacity' }
    );
  }, [sectionRef]);

  // 1. Entrance Choreography with ScrollTrigger
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (isReducedMotion() || motionPausedRef.current) {
      setRestingStyles();
    }

    const ctx = gsap.context(() => {
      const plaque = section.querySelector('[data-faq-plaque]');
      const panel = section.querySelector('[data-faq-panel]');
      const categoryBar = section.querySelector('[data-faq-category-bar]');
      const firstItems = section.querySelectorAll('[data-faq-item]');

      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            hasEnteredRef.current = true;
            if (!motionPausedRef.current && !isReducedMotion()) {
              tl.play();
            } else {
              tl.progress(1);
              setRestingStyles();
            }
          },
        },
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      });
      entranceTimelineRef.current = tl;

      // 1. Plaque settles (~14px movement)
      if (plaque) {
        tl.fromTo(
          plaque,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' },
          0
        );
      }

      // 2. Blue panel settles (~16px movement)
      if (panel) {
        tl.fromTo(
          panel,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out' },
          0.18
        );
      }

      // 3. Question rows settle with short stagger
      if (firstItems && firstItems.length > 0) {
        tl.fromTo(
          firstItems,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.045, ease: 'power1.out' },
          0.38
        );
      }

      // 4. Category bar follows
      if (categoryBar) {
        tl.fromTo(
          categoryBar,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          0.55
        );
      }
    }, section);

    // Live OS reduced motion listener
    const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const handleMotionPreferenceChange = () => {
      if (isReducedMotion()) {
        entranceTimelineRef.current?.progress(1);
        setRestingStyles();
      }
    };
    mql?.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      mql?.removeEventListener('change', handleMotionPreferenceChange);
      ctx.revert();
      entranceTimelineRef.current = null;
    };
  }, [sectionRef, isReducedMotion, setRestingStyles]);

  // Handle mid-entrance pause: immediately set readable resting state without re-running entrance
  useEffect(() => {
    if (motionPaused) {
      if (entranceTimelineRef.current && !hasEnteredRef.current) {
        entranceTimelineRef.current.progress(1);
      }
      setRestingStyles();
    }
  }, [motionPaused, setRestingStyles]);

  // 2. Tactile Category Switch Transition (Staggered row settling)
  useEffect(() => {
    // Skip on initial mount since entrance timeline handles it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    // Interrupt any active category transition safely and restore neutral presentation
    if (categorySwitchTimelineRef.current) {
      categorySwitchTimelineRef.current.kill();
      categorySwitchTimelineRef.current = null;
      const allItems = section.querySelectorAll<HTMLElement>('[data-faq-item]');
      const allTitles = section.querySelectorAll<HTMLElement>('[data-faq-title]');
      gsap.set(allItems, { clearProps: 'transform,opacity' });
      gsap.set(allTitles, { clearProps: 'transform,opacity' });
    }

    if (isReducedMotion() || motionPaused) {
      const activePanel = section.querySelector<HTMLElement>(
        `[id="faq-panel-${activeCategoryId}"]`
      );
      if (activePanel) {
        const items = activePanel.querySelectorAll<HTMLElement>('[data-faq-item]');
        gsap.set(items, { clearProps: 'transform,opacity' });
      }
      return;
    }

    // Active category container and question rows
    const activePanel = section.querySelector<HTMLElement>(
      `[id="faq-panel-${activeCategoryId}"]`
    );
    const categoryTitle = section.querySelector<HTMLElement>('[data-faq-title]');

    if (!activePanel) return;

    const items = activePanel.querySelectorAll<HTMLElement>('[data-faq-item]');

    const tl = gsap.timeline({
      onComplete: () => {
        categorySwitchTimelineRef.current = null;
      },
    });
    categorySwitchTimelineRef.current = tl;

    // Subtle header text bump
    if (categoryTitle) {
      tl.fromTo(
        categoryTitle,
        { opacity: 0.4, y: -4 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', clearProps: 'transform,opacity' },
        0
      );
    }

    // Question rows settle into place with short stagger
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.22,
          stagger: 0.04,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        },
        0.04
      );
    }

    return () => {
      if (categorySwitchTimelineRef.current) {
        categorySwitchTimelineRef.current.kill();
        categorySwitchTimelineRef.current = null;
      }
      if (items.length > 0) {
        gsap.set(items, { clearProps: 'transform,opacity' });
      }
      if (categoryTitle) {
        gsap.set(categoryTitle, { clearProps: 'transform,opacity' });
      }
    };
  }, [activeCategoryId, sectionRef, motionPaused, isReducedMotion]);
};
