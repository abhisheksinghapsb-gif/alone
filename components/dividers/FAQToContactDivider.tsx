'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './FAQToContactDivider.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface FAQToContactDividerProps {
  motionPaused?: boolean;
}

export const FAQToContactDivider: React.FC<FAQToContactDividerProps> = ({
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
      id="faq-to-contact-divider"
      className={styles.dividerContainer}
      role="separator"
      aria-hidden="true"
    >
      {/* Top Bulkhead Upper Edge with Cyan-Yellow Conduit Gradient */}
      <div className={styles.bulkheadTop} />

      {/* Energy Seam Track */}
      <div className={styles.energyTrack}>
        <div ref={pulseRef} className={styles.energySeam} />
      </div>

      {/* Heavy Hazard Armor Flanges Left */}
      <div className={`${styles.sideHazardBrackets} ${styles.leftHazard}`}>
        <div className={`${styles.hazardBlock} ${styles.hb1}`} />
        <div className={`${styles.hazardBlock} ${styles.hbYellow} ${styles.hb2}`} />
        <div className={`${styles.hazardBlock} ${styles.hb3}`} />
      </div>

      {/* Central Decorative Radar Beacon Bezel */}
      <div className={styles.centerBezel}>
        <div className={styles.emblemGlow} />
        {/* Radar Crosshair & Venue Location Beacon SVG */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className={styles.radarBeaconSvg}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radar Circles */}
          <circle cx="24" cy="24" r="21" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
          <circle cx="24" cy="24" r="14" stroke="#ffde32" strokeWidth="1.2" opacity="0.65" />
          <circle cx="24" cy="24" r="7" stroke="#00e5ff" strokeWidth="1.2" />

          {/* Crosshair Spikes */}
          <line x1="24" y1="2" x2="24" y2="8" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="40" x2="24" y2="46" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="24" x2="8" y2="24" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="24" x2="46" y2="24" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />

          {/* Glowing Venue Target Marker */}
          <path
            d="M24 16C21.8 16 20 17.8 20 20C20 23 24 27.5 24 27.5C24 27.5 28 23 28 20C28 17.8 26.2 16 24 16ZM24 21.5C23.2 21.5 22.5 20.8 22.5 20C22.5 19.2 23.2 18.5 24 18.5C24.8 18.5 25.5 19.2 25.5 20C25.5 20.8 24.8 21.5 24 21.5Z"
            fill="#ffde32"
            stroke="#000000"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* Heavy Hazard Armor Flanges Right */}
      <div className={`${styles.sideHazardBrackets} ${styles.rightHazard}`}>
        <div className={`${styles.hazardBlock} ${styles.hb3}`} />
        <div className={`${styles.hazardBlock} ${styles.hbYellow} ${styles.hb2}`} />
        <div className={`${styles.hazardBlock} ${styles.hb1}`} />
      </div>

      {/* Bottom Bulkhead Lower Edge */}
      <div className={styles.bulkheadBottom} />
    </div>
  );
};
