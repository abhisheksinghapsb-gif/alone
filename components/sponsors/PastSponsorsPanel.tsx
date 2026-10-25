'use client';

import React from 'react';
import { PAST_SPONSORS, SPONSORS_COPY } from '../../data/sponsorsData';

export interface PastSponsorsPanelProps {
  motionPaused?: boolean;
}

export const PastSponsorsPanel: React.FC<PastSponsorsPanelProps> = () => {
  return (
    <aside
      id="past-sponsors-panel"
      className="pastSponsorsPanel"
      aria-label="Past Event Sponsors Archive"
    >
      {/* Outer Slanted Decorative Frame Border */}
      <div className="pastPanelFrameBg" aria-hidden="true" />

      {/* Header Plaque */}
      <div className="pastPanelHeader">
        <h3 className="pastPanelTitle">{SPONSORS_COPY.pastHeading}</h3>
        {/* Non-interactive ornamental corner detail */}
        <div className="pastPanelOrnament" aria-hidden="true">
          <span className="ornamentDot" />
        </div>
      </div>

      {/* Content Area containing the two verified past sponsor plates */}
      <div className="pastPanelBody">
        {PAST_SPONSORS.map((sponsor) => (
          <div
            key={sponsor.id}
            id={`past-sponsor-plate-${sponsor.id}`}
            className="pastLogoPlate"
            tabIndex={0}
            role="region"
            aria-label={sponsor.name}
          >
            <div className="logoPlateSurface">
              <img
                src={sponsor.logo}
                alt={sponsor.alt}
                width={sponsor.width}
                height={sponsor.height}
                className="pastSponsorImg"
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
