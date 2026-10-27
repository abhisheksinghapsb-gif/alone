'use client';

import React from 'react';
import { PAST_SPONSORS, SPONSORS_COPY } from '../../data/sponsorsData';
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
      {/* Outer Slanted Decorative Frame Border */}
      <div className={styles.pastPanelFrameBg} aria-hidden="true" />

      {/* Header Plaque */}
      <div className={styles.pastPanelHeader}>
        <h3 className={styles.pastPanelTitle}>{SPONSORS_COPY.pastHeading}</h3>
        {/* Info circle detail matching Figma */}
        <div className={styles.pastPanelOrnament} title="Past Sponsors" aria-hidden="true">
          <span className={styles.ornamentText}>i</span>
        </div>
      </div>

      {/* Content Area containing the two verified past sponsor plates */}
      <div className={styles.pastPanelBody}>
        {PAST_SPONSORS.map((sponsor) => (
          <div
            key={sponsor.id}
            id={`past-sponsor-plate-${sponsor.id}`}
            className={styles.pastLogoPlate}
            tabIndex={0}
            role="region"
            aria-label={sponsor.name}
          >
            {/* Subtle pointer-entry sheen effect on plate backing */}
            <div className={styles.plateSheen} aria-hidden="true" />
            <div className={styles.logoPlateSurface}>
              <img
                src={sponsor.logo}
                alt={sponsor.alt}
                width={sponsor.width}
                height={sponsor.height}
                className={styles.pastSponsorImg}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
