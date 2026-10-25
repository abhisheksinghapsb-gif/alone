'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SponsorsDividerProps {
  motionPaused?: boolean;
}

export const SponsorsDivider: React.FC<SponsorsDividerProps> = ({ motionPaused = false }) => {
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
      id="about-to-sponsors-divider"
      className="sponsorsDivider"
      role="separator"
      aria-hidden="true"
    >
      {/* Top Bulkhead Upper Edge */}
      <div className="sponsorsDividerBulkheadTop" />

      {/* Energy Seam Track */}
      <div className="sponsorsDividerEnergyTrack">
        <div ref={pulseRef} className="sponsorsDividerEnergySeam" />
      </div>

      {/* Geometric Polygonal Side Details Left */}
      <div className="sponsorsDividerSideDetails leftSide">
        <span className="sponsorsDividerNotch notch1" />
        <span className="sponsorsDividerNotch notch2" />
        <span className="sponsorsDividerNotch notch3" />
      </div>

      {/* Central Decorative Crown Emblem Bezel */}
      <div className="sponsorsDividerCenterBezel">
        <div className="sponsorsDividerEmblemGlow" />
        <img
          src="/assets/genesis/sponsors/icon-crowned-royal.webp"
          alt=""
          width={38}
          height={48}
          className="sponsorsDividerCrownImg"
          draggable={false}
        />
      </div>

      {/* Geometric Polygonal Side Details Right */}
      <div className="sponsorsDividerSideDetails rightSide">
        <span className="sponsorsDividerNotch notch3" />
        <span className="sponsorsDividerNotch notch2" />
        <span className="sponsorsDividerNotch notch1" />
      </div>

      {/* Bottom Bulkhead Lower Edge */}
      <div className="sponsorsDividerBulkheadBottom" />
    </div>
  );
};
