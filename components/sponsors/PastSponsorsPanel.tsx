'use client';

import React from 'react';
import styles from './sponsors.module.css';

export interface PastSponsorsPanelProps {
  motionPaused?: boolean;
}

export const PastSponsorsPanel: React.FC<PastSponsorsPanelProps> = () => {
  return (
    <aside
      id="past-sponsors-panel"
      className={styles.pastSponsorsPanel}
      aria-label="Past Event Sponsors Archive"
    >
      {/* Outer Blue Arcade Cabinet Frame */}
      <div className={styles.pastCabinetOuterFrame} aria-hidden="true">
        <img
          src="/assets/genesis/sponsors/past-sponsors-outer-frame.svg"
          alt=""
          className={styles.cabinetFrameSvg}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Inner Border Artwork & (i) Info Badge */}
      <div className={styles.pastCabinetInnerBorder} aria-hidden="true">
        <img
          src="/assets/genesis/sponsors/past-sponsors-inner-border.svg"
          alt=""
          className={styles.cabinetBorderSvg}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Logos: GameCloud & GameDoora with Authentic Cyan & Amber Glows */}
      <div className={styles.pastPanelBody}>
        <div
          id="past-sponsor-plate-gamecloud"
          className={`${styles.pastLogoPlate} ${styles.sponsorGlowGamecloud}`}
          tabIndex={0}
          role="region"
          aria-label="GameCloud Technologies Private Limited"
        >
          <img
            src="/assets/genesis/sponsors/sponsor-logo-gamecloud.svg"
            alt="GameCloud Technologies Private Limited — Past Sponsor"
            width={330}
            height={149}
            className={styles.pastSponsorImg}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>

        <div
          id="past-sponsor-plate-gamedoora"
          className={`${styles.pastLogoPlate} ${styles.sponsorGlowGamedoora}`}
          tabIndex={0}
          role="region"
          aria-label="GAMEDOORA"
        >
          <img
            src="/assets/genesis/sponsors/sponsor-logo-gamedoora.svg"
            alt="GAMEDOORA — Past Sponsor"
            width={320}
            height={139}
            className={styles.pastSponsorImg}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </aside>
  );
};
