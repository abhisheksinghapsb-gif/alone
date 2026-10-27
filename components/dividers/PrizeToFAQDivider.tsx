'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PrizeToFAQDivider.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface PrizeToFAQDividerProps {
  motionPaused?: boolean;
}

export const PrizeToFAQDivider: React.FC<PrizeToFAQDividerProps> = ({
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
      id="prize-to-faq-divider"
      className={styles.dividerContainer}
      role="separator"
      aria-hidden="true"
    >
      {/* Top Bulkhead Upper Edge with Ultraviolet-Magenta Gradient */}
      <div className={styles.bulkheadTop} />

      {/* Energy Seam Track */}
      <div className={styles.energyTrack}>
        <div ref={pulseRef} className={styles.energySeam} />
      </div>

      {/* Hex Circuit Bus Notches Left */}
      <div className={`${styles.sideNotches} ${styles.leftNotches}`}>
        <div className={`${styles.hexPill} ${styles.p1}`}>
          <div className={styles.dot} />
        </div>
        <div className={`${styles.hexPill} ${styles.p2}`}>
          <div className={styles.dot} />
        </div>
        <div className={`${styles.hexPill} ${styles.p3}`}>
          <div className={styles.dot} />
        </div>
      </div>

      {/* Central Hexagonal Intel Crystal Bezel */}
      <div className={styles.centerBezelBorder}>
        <div className={styles.centerBezel}>
          <div className={styles.emblemGlow} />
          {/* Cyber Intel Crystal / Question Beacon SVG */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className={styles.intelCrystalSvg}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hex Crystal Outer Facets */}
            <path
              d="M24 4L40 14V34L24 44L8 34V14L24 4Z"
              fill="url(#crystalGrad1)"
              stroke="#000000"
              strokeWidth="1.5"
            />
            {/* Facet lines */}
            <path d="M24 4L24 44" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
            <path d="M8 14L40 34" stroke="#c084fc" strokeWidth="0.8" opacity="0.5" />
            <path d="M8 34L40 14" stroke="#c084fc" strokeWidth="0.8" opacity="0.5" />
            
            {/* Center question/spark glyph */}
            <path
              d="M20 18C20 15.8 21.8 14 24 14C26.2 14 28 15.8 28 18C28 19.8 26.6 21.2 24.8 21.8C24 22.1 23.5 22.8 23.5 23.6V25M23.5 29H24.5V30H23.5V29Z"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <defs>
              <linearGradient id="crystalGrad1" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f472b6" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="1" stopColor="#3b0764" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Hex Circuit Bus Notches Right */}
      <div className={`${styles.sideNotches} ${styles.rightNotches}`}>
        <div className={`${styles.hexPill} ${styles.p3}`}>
          <div className={styles.dot} />
        </div>
        <div className={`${styles.hexPill} ${styles.p2}`}>
          <div className={styles.dot} />
        </div>
        <div className={`${styles.hexPill} ${styles.p1}`}>
          <div className={styles.dot} />
        </div>
      </div>

      {/* Bottom Bulkhead Lower Edge */}
      <div className={styles.bulkheadBottom} />
    </div>
  );
};
