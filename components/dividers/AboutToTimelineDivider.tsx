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
              opacity: 0.8,
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
      {/* Heavy Gold Bulkhead Upper Edge */}
      <div className={styles.bulkheadTop} />

      {/* Central Electric Energy Seam Track */}
      <div className={styles.energyTrack}>
        <div ref={pulseRef} className={styles.energySeam} />
      </div>

      {/* Brawl Stars Arena Side Details Left */}
      <div className={`${styles.sideDetails} ${styles.leftSide}`}>
        <div className={styles.starBracket}>
          <span className={styles.bracketDot} />
        </div>
        <span className={`${styles.brawlNotch} ${styles.notch1}`} />
        <span className={`${styles.brawlNotch} ${styles.notch2}`} />
        <span className={`${styles.brawlNotch} ${styles.notch3}`} />
      </div>

      {/* Central Authentic Brawl Stars Skull-Star Bezel */}
      <div className={styles.centerBezel}>
        <div className={styles.emblemGlow} />
        <img
          src="/assets/genesis/about/skull-star-emblem.svg"
          alt=""
          width={44}
          height={44}
          className={styles.brawlEmblemImg}
          draggable={false}
        />
      </div>

      {/* Brawl Stars Arena Side Details Right */}
      <div className={`${styles.sideDetails} ${styles.rightSide}`}>
        <span className={`${styles.brawlNotch} ${styles.notch3}`} />
        <span className={`${styles.brawlNotch} ${styles.notch2}`} />
        <span className={`${styles.brawlNotch} ${styles.notch1}`} />
        <div className={styles.starBracket}>
          <span className={styles.bracketDot} />
        </div>
      </div>

      {/* Heavy Gold Bulkhead Lower Edge */}
      <div className={styles.bulkheadBottom} />
    </div>
  );
};
