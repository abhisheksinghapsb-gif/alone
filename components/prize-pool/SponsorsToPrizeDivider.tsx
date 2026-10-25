'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SponsorsToPrizeDividerProps {
  motionPaused?: boolean;
}

export const SponsorsToPrizeDivider: React.FC<SponsorsToPrizeDividerProps> = ({
  motionPaused = false,
}) => {
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const seamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = dividerRef.current;
    const seam = seamRef.current;
    if (!el || !seam || motionPaused) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        seam,
        { scaleX: 0.1, opacity: 0 },
        {
          scaleX: 1,
          opacity: 0.85,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onComplete: () => {
            gsap.to(seam, {
              opacity: 0.65,
              duration: 0.5,
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
      id="sponsors-prize-divider"
      className="sponsorsToPrizeDivider"
      role="separator"
      aria-hidden="true"
    >
      {/* Top Gradient Seam connecting to Sponsors */}
      <div className="dividerTopBand" />

      {/* Navy Bevel Body */}
      <div className="dividerNavyBody">
        {/* Gold Seam Energy Track */}
        <div className="dividerGoldSeamTrack">
          <div ref={seamRef} className="dividerGoldSeamHighlight" />
        </div>

        {/* Central Bezel with Purple Gem Artwork */}
        <div className="dividerCenterGem">
          <img
            src="/assets/genesis/prize-pool/gem-sparkle.svg"
            alt=""
            width={32}
            height={32}
            className="dividerGemIcon"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};
