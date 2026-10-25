'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SectionDividerProps {
  motionPaused?: boolean;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ motionPaused = false }) => {
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

    // Single restrained energy highlight sweep along seam when scrolled into view
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
              opacity: 0.7,
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
      id="arena-section-divider"
      className="arenaSectionDivider"
      role="separator"
      aria-hidden="true"
    >
      {/* Top Bulkhead Upper Edge */}
      <div className="dividerBulkheadTop" />

      {/* Energy Seam Track */}
      <div className="dividerEnergyTrack">
        <div ref={pulseRef} className="dividerEnergySeam" />
      </div>

      {/* Geometric Polygonal Side Details Left */}
      <div className="dividerSideDetails leftSide">
        <span className="dividerNotch notch1" />
        <span className="dividerNotch notch2" />
        <span className="dividerNotch notch3" />
      </div>

      {/* Central Decorative Emblem Bezel */}
      <div className="dividerCenterEmblemBezel">
        <div className="dividerEmblemGlow" />
        <img
          src="/assets/genesis/about/skull-star-emblem.svg"
          alt=""
          width={42}
          height={42}
          className="dividerEmblemImg"
          draggable={false}
        />
      </div>

      {/* Geometric Polygonal Side Details Right */}
      <div className="dividerSideDetails rightSide">
        <span className="dividerNotch notch3" />
        <span className="dividerNotch notch2" />
        <span className="dividerNotch notch1" />
      </div>

      {/* Bottom Bulkhead Lower Edge */}
      <div className="dividerBulkheadBottom" />
    </div>
  );
};
