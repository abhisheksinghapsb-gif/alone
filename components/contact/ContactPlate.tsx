'use client';

import React, { useState } from 'react';
import { ContactPerson } from './contactData';
import styles from './ContactSection.module.css';
import { uiAudio } from '../../lib/uiAudio';

export interface ContactPlateProps {
  person: ContactPerson;
  soundEnabled?: boolean;
  motionPaused?: boolean;
  className?: string;
}

export const ContactPlate: React.FC<ContactPlateProps> = ({
  person,
  soundEnabled = false,
  motionPaused = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [shimmerKey, setShimmerKey] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!motionPaused) {
      // Trigger a clean single shimmer cycle on entry
      setShimmerKey((prev) => prev + 1);
    }
    if (soundEnabled) {
      uiAudio.playHoverTick();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleFocus = () => {
    setIsHovered(true);
    if (!motionPaused) {
      setShimmerKey((prev) => prev + 1);
    }
    if (soundEnabled) {
      uiAudio.playHoverTick();
    }
  };

  const handleBlur = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (soundEnabled) {
      uiAudio.playPressClack();
    }
  };

  return (
    <div
      data-contact-group={person.id}
      className={`${styles.contactGroup} ${className}`}
    >
      {/* Contact Name (Brawl Stars white embossed lettering) */}
      <div
        className={`${styles.personName} ${isHovered && !motionPaused ? styles.nameLifted : ''}`}
        aria-hidden="true"
      >
        {person.name}
      </div>

      {/* Structural Telephone Anchor with stable bounding box */}
      <a
        href={person.telHref}
        aria-label={person.ariaLabel}
        className={styles.plateAnchor}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        {/* Visual Responsive Plate Container */}
        <div
          className={`${styles.plateVisual} ${
            isHovered && !motionPaused ? styles.plateHovered : ''
          } ${isPressed && !motionPaused ? styles.platePressed : ''}`}
        >
          {/* Subtle outward gold pulse glow */}
          {!motionPaused && (
            <div
              key={`glow-${shimmerKey}`}
              className={`${styles.plateAuraGlow} ${shimmerKey > 0 ? styles.auraActive : ''}`}
              aria-hidden="true"
            />
          )}

          {/* Yellow Dimensional Phone Plate Graphic */}
          <div className={styles.plateGraphicWrapper} aria-hidden="true">
            <svg
              viewBox="0 0 258 73"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.plateSvg}
              preserveAspectRatio="none"
            >
              <g filter="url(#plate_shadow)">
                {/* Yellow Face: #FFDE32 */}
                <path
                  d="M14.5 0C11.1863 0 8.5 2.68629 8.5 6V51.4239H251.5V6C251.5 2.68629 248.814 0 245.5 0H14.5Z"
                  fill="#FFDE32"
                  className={styles.plateFacePath}
                />
                {/* Orange Dimensional Lip: #FFA800 */}
                <path
                  d="M8.5 51.4239C8.5 54.5035 10.9965 57 14.0761 57H245.924C249.004 57 251.5 54.5035 251.5 51.4239H8.5Z"
                  fill="#FFA800"
                />
              </g>
              <defs>
                <filter
                  id="plate_shadow"
                  x="0"
                  y="0"
                  width="258"
                  height="72.5"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dx="-1" dy="8" />
                  <feGaussianBlur stdDeviation="3.75" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.59 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>

            {/* Restrained traveling edge shimmer highlight */}
            {!motionPaused && (
              <div
                key={`shimmer-${shimmerKey}`}
                className={`${styles.edgeShimmer} ${
                  shimmerKey > 0 ? styles.shimmerActive : ''
                }`}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Selectable Live HTML Phone Digits */}
          <span className={styles.phoneDigits}>
            {person.phoneDisplay}
          </span>
        </div>
      </a>
    </div>
  );
};
