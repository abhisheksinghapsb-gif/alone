'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './AboutToTimelineDivider.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AboutToTimelineDividerProps {
  motionPaused?: boolean;
}

export const AboutToTimelineDivider: React.FC<AboutToTimelineDividerProps> = ({
  motionPaused = false,
}) => {
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = dividerRef.current;
    const pulse = pulseRef.current;
    if (!el || !pulse || motionPaused) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        pulse,
        { scaleX: 0.1, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onComplete: () => {
            gsap.to(pulse, {
              opacity: 0.75,
              duration: 0.6,
              ease: 'power1.out',
            });
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [motionPaused]);

  return (
    <div
      ref={dividerRef}
      id="about-to-timeline-divider"
      className={styles.dividerContainer}
      role="separator"
      aria-hidden="true"
    >
      {/* Top Bulkhead Upper Edge with Amber-Gold Gradient */}
      <div className={styles.bulkheadTop} />

      {/* Energy Seam Track */}
      <div className={styles.energyTrack}>
        <div ref={pulseRef} className={styles.energySeam} />
      </div>

      {/* Directional Chevron Runway Left (>>>) */}
      <div className={`${styles.sideChevrons} ${styles.leftChevrons}`}>
        <span className={`${styles.chevron} ${styles.ch1}`} />
        <span className={`${styles.chevron} ${styles.ch2}`} />
        <span className={`${styles.chevron} ${styles.ch3}`} />
      </div>

      {/* Central Decorative Chrono Milestone Bezel */}
      <div className={styles.centerBezel}>
        <div className={styles.emblemGlow} />
        {/* Custom Chrono Compass Milestone Star SVG */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className={styles.chronoStarSvg}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer tech chrono dial */}
          <circle cx="24" cy="24" r="21" stroke="#ffb703" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
          <circle cx="24" cy="24" r="17" stroke="#fb8500" strokeWidth="1.2" opacity="0.6" />
          
          {/* Compass 4-point golden star */}
          <path
            d="M24 4L27.5 19.5L42 24L27.5 28.5L24 44L20.5 28.5L6 24L20.5 19.5L24 4Z"
            fill="url(#chronoStarGrad)"
            stroke="#000000"
            strokeWidth="1.5"
          />
          {/* Center core jewel */}
          <circle cx="24" cy="24" r="4.5" fill="#ffffff" stroke="#ffb703" strokeWidth="1.5" />

          <defs>
            <linearGradient id="chronoStarGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff275" />
              <stop offset="0.45" stopColor="#ffb703" />
              <stop offset="1" stopColor="#fb8500" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Directional Chevron Runway Right (<<<) */}
      <div className={`${styles.sideChevrons} ${styles.rightChevrons}`}>
        <span className={`${styles.chevron} ${styles.ch3}`} />
        <span className={`${styles.chevron} ${styles.ch2}`} />
        <span className={`${styles.chevron} ${styles.ch1}`} />
      </div>

      {/* Bottom Bulkhead Lower Edge */}
      <div className={styles.bulkheadBottom} />
    </div>
  );
};
