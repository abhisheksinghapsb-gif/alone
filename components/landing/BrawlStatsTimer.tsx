'use client';

import React, { useState, useEffect } from 'react';
import styles from './BrawlStatsTimer.module.css';

export interface BrawlStatsTimerProps {
  motionPaused?: boolean;
}

export const BrawlStatsTimer: React.FC<BrawlStatsTimerProps> = ({ motionPaused = false }) => {
  // Target: Genesis 6 Event Start Date: March 5, 2027 09:00:00 IST
  const targetDate = new Date('2027-03-05T09:00:00+05:30').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 97,
    hours: 11,
    minutes: 47,
    seconds: 26,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Ticking fallback if past or zero
        const totalSecs = Math.abs(Math.floor(diff / 1000));
        const days = Math.floor(totalSecs / 86400) % 100;
        const hours = Math.floor((totalSecs % 86400) / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleScrollDown = () => {
    const target = document.getElementById('about') || document.getElementById('about-genesis');
    if (target) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches || motionPaused);
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section
      id="brawl-stats-timer"
      aria-label="Tournament Countdown Timer and Event Dates"
      className={styles.timerSectionWrap}
    >
      {/* Exact Figma Widget: brawler-stats-table */}
      <div id="brawler-stats-table" className={styles.tableCard}>
        {/* Top Circular Pink Badge with Down Chevron */}
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll down to About section"
          className={styles.topChevronBadge}
        >
          <svg
            viewBox="0 0 24 24"
            className={styles.chevronSvg}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Header Area */}
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            {/* Skull Shield Badge with TIMER label */}
            <div className={styles.skullBadgeWrap}>
              <span className={styles.timerLabel}>TIMER</span>
              <div className={styles.yellowSkullPlate}>
                <svg
                  viewBox="0 0 32 32"
                  className={styles.skullIconSvg}
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 4C9.5 4 5 8.5 5 15C5 19.2 7.2 22.8 10.5 24.5V28H21.5V24.5C24.8 22.8 27 19.2 27 15C27 8.5 22.5 4 16 4Z" />
                  <ellipse cx="11.5" cy="15" rx="2.5" ry="3.5" fill="#000000" />
                  <ellipse cx="20.5" cy="15" rx="2.5" ry="3.5" fill="#000000" />
                  <polygon points="16,19 14.5,21.5 17.5,21.5" fill="#000000" />
                  <line x1="13" y1="26" x2="13" y2="28" stroke="#000000" strokeWidth="2" />
                  <line x1="16" y1="26" x2="16" y2="28" stroke="#000000" strokeWidth="2" />
                  <line x1="19" y1="26" x2="19" y2="28" stroke="#000000" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* BRAWL / STARTS IN Title */}
            <div className={styles.titleLines}>
              <span className={styles.brawlText}>BRAWL</span>
              <span className={styles.startsInText}>STARTS IN</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.max11Badge}>MAX 11</span>
          </div>
        </div>

        {/* Segmented Pink Health Bar */}
        <div className={styles.healthBar} aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={styles.healthSegment} />
          ))}
        </div>

        {/* Row 1: Event Date */}
        <div className={styles.statRow}>
          <div className={styles.statBadgeGreen} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              className={styles.statBadgeIcon}
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className={styles.statTextCol}>
            <span className={styles.statLabelGreen}>DATE</span>
            <span className={styles.statValue}>5 MARCH – 6 MARCH, 2027</span>
          </div>
        </div>

        {/* Row 2: Live Countdown Timer */}
        <div className={styles.statRow}>
          <div className={styles.statBadgeRed} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              className={styles.statBadgeIcon}
              fill="currentColor"
            >
              <path d="M12 2L14.5 8.5L21.5 9L16 14L18 21L12 17.5L6 21L8 14L2.5 9L9.5 8.5L12 2Z" />
            </svg>
          </div>
          <div className={styles.statTextCol}>
            <span className={styles.statLabelRed}>STARTS IN</span>
            <span className={styles.countdownValue} id="live-brawl-countdown">
              {timeLeft.days}d : {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

