'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { CONTACT_PERSONS, VENUE_INFO } from './contactData';
import { ContactPlate } from './ContactPlate';
import { useContactMotion } from './useContactMotion';
import styles from './ContactSection.module.css';

export interface ContactSectionProps {
  motionPaused?: boolean;
  soundEnabled?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  motionPaused = false,
  soundEnabled = false,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  // Coordinated ScrollTrigger entrance, pointer depth, and tab lifecycle
  useContactMotion({
    sectionRef,
    bgRef,
    motionPaused,
  });

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Contact Us and Venue"
      className={styles.contactSection}
    >
      {/* 1. Contact-owned dark navy transition seam from FAQ */}
      <div className={styles.topSeam} aria-hidden="true" />

      {/* 2. Illustrated Battle Backdrop with subtle pointer depth */}
      <div ref={bgRef} className={styles.bgWrapper} aria-hidden="true">
        <Image
          src="/assets/genesis/contact/contact-mural.webp"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className={styles.muralImage}
        />
      </div>

      {/* 3. Overall 38% Black Darkening */}
      <div className={styles.overallOverlay} aria-hidden="true" />

      {/* 4. Central Feathered Darkening Vignette */}
      <div className={styles.centralVignette} aria-hidden="true" />

      {/* 5. Asynchronous Ambient Atmospheric Glints */}
      {!motionPaused && (
        <>
          <div className={styles.ambientGlint1} aria-hidden="true" />
          <div className={styles.ambientGlint2} aria-hidden="true" />
          <div className={styles.ambientGlint3} aria-hidden="true" />
        </>
      )}

      {/* 6. Central Document Flow */}
      <div className={styles.contentContainer}>
        {/* Yellow CONTACT US Heading Artwork */}
        <div data-contact-heading className={styles.headingWrapper}>
          <h2 className={styles.srOnlyTitle}>Contact Us</h2>
          <Image
            src="/assets/genesis/contact/heading-contact-us.svg"
            alt="CONTACT US"
            width={381}
            height={61}
            priority={false}
            className={styles.headingWordmark}
          />
        </div>

        {/* Central Vertical Stack: Contacts + Venue */}
        <div className={styles.contactStack}>
          {CONTACT_PERSONS.map((person) => (
            <ContactPlate
              key={person.id}
              person={person}
              soundEnabled={soundEnabled}
              motionPaused={motionPaused}
            />
          ))}

          {/* Venue Information Area */}
          <div data-contact-venue className={styles.venueContainer}>
            <div className={styles.venueTitle} role="heading" aria-level={3}>
              {VENUE_INFO.heading}
            </div>

            <div className={styles.venueCard}>
              <div className={styles.venueHeader}>
                <svg className={styles.venuePinIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                    fill="#ffde32"
                    stroke="#000000"
                    strokeWidth="1.2"
                  />
                </svg>
                <span className={styles.venueInstitution}>
                  {VENUE_INFO.institution}
                </span>
              </div>

              <p className={styles.venueAddress}>
                {VENUE_INFO.address}
              </p>

              {/* Embedded Google Maps Viewport */}
              <div className={styles.mapFrameWrapper}>
                <div className={styles.mapCornerTL} aria-hidden="true" />
                <div className={styles.mapCornerTR} aria-hidden="true" />
                <div className={styles.mapCornerBL} aria-hidden="true" />
                <div className={styles.mapCornerBR} aria-hidden="true" />
                <iframe
                  title="Army Institute of Technology (AIT) Pune Google Maps"
                  src={VENUE_INFO.googleMapsEmbedUrl}
                  className={styles.mapIframe}
                  loading="lazy"
                  allowFullScreen={false}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Direct Maps Navigation Button */}
              <a
                href={VENUE_INFO.googleMapsDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapActionBtn}
                aria-label="Open Army Institute of Technology on Google Maps"
              >
                <svg className={styles.mapBtnIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
                <span>OPEN IN GOOGLE MAPS</span>
                <svg className={styles.mapExternalIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Social Links Footer (Adapted from vaman-dev/Genesis commit a83d690326868542116792f193aa06780b675be1) */}
        <footer className={styles.socialFooterContainer} aria-label="Social media links">
          <div className={styles.socialLinksGroup}>
            <a
              href="https://www.instagram.com/gdxr_ait/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLinkAnchor}
              aria-label="Follow Genesis on Instagram (opens in a new tab)"
            >
              <svg
                className={styles.socialIcon}
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span className={styles.socialLabel}>INSTAGRAM</span>
              <span className={styles.srOnly}>(opens in a new tab)</span>
            </a>

            <a
              href="https://www.linkedin.com/company/87215024/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLinkAnchor}
              aria-label="Connect with Genesis on LinkedIn (opens in a new tab)"
            >
              <svg
                className={styles.socialIcon}
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3Z" />
              </svg>
              <span className={styles.socialLabel}>LINKEDIN</span>
              <span className={styles.srOnly}>(opens in a new tab)</span>
            </a>
          </div>
        </footer>
      </div>

      {/* 7. Restrained Dark-Blue Bottom Closing Strip */}
      <div className={styles.bottomClosingStrip} aria-hidden="true" />
    </section>
  );
};

export default ContactSection;
