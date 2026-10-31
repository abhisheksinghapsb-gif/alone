'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  TIMELINE_STAGES,
  TIMELINE_COPY,
  TIMELINE_ASSETS,
  TimelineStageData,
} from './timelineData';
import { MilestoneBadge } from './MilestoneBadge';
import { TimelineChapter } from './TimelineChapter';
import { uiAudio } from '../../lib/uiAudio';
import styles from './timeline.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TimelineSectionProps {
  motionPaused?: boolean;
  soundEnabled?: boolean;
  onSectionActive?: (active: boolean) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  motionPaused = false,
  soundEnabled = false,
  onSectionActive,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const journeyListRef = useRef<HTMLOListElement | null>(null);
  const railContainerRef = useRef<HTMLDivElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  const milestoneRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const illustrationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titlePlateRefs = useRef<(HTMLDivElement | null)[]>([]);

  // State for active checkpoint
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [hoveredStageIndex, setHoveredStageIndex] = useState<number | null>(null);
  const [railBounds, setRailBounds] = useState<{ top: number; height: number }>({ top: 36, height: 1200 });

  const currentActiveIndexRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const railBoundsRef = useRef<{ top: number; height: number }>({ top: 36, height: 1200 });
  const nodeCentersRef = useRef<number[]>([]);

  // Single transform owner helper for progress rail fill and traveling marker
  const updateMarkerAndProgress = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const currentHeight = railBoundsRef.current.height;
    if (markerRef.current) {
      const markerY = clampedProgress * currentHeight;
      markerRef.current.style.transform = `translate3d(-50%, calc(-50% + ${markerY}px), 0)`;
    }
    if (progressLineRef.current) {
      progressLineRef.current.style.transform = `scaleY(${Math.max(0.04, clampedProgress)})`;
    }
  }, []);

  // Compute exact measured badge progress along rail
  const getBadgeProgress = useCallback((index: number) => {
    const centers = nodeCentersRef.current;
    const bounds = railBoundsRef.current;
    if (centers.length > index && bounds.height > 0) {
      return Math.max(0, Math.min(1, (centers[index] - bounds.top) / bounds.height));
    }
    return index / 3;
  }, []);

  // Recalculate rail geometry directly between first and last milestone badge button centers
  const measureRailGeometry = useCallback(() => {
    const milestoneEls = milestoneRefs.current.filter(Boolean) as HTMLButtonElement[];
    const listEl = journeyListRef.current;
    if (milestoneEls.length < 2 || !listEl) return;

    const firstBadge = milestoneEls[0];
    const lastBadge = milestoneEls[milestoneEls.length - 1];

    const listRect = listEl.getBoundingClientRect();
    const firstRect = firstBadge.getBoundingClientRect();
    const lastRect = lastBadge.getBoundingClientRect();

    const startCenterY = firstRect.top + firstRect.height / 2 - listRect.top;
    const endCenterY = lastRect.top + lastRect.height / 2 - listRect.top;
    const totalHeight = Math.max(100, endCenterY - startCenterY);

    const bounds = {
      top: startCenterY,
      height: totalHeight,
    };
    railBoundsRef.current = bounds;
    setRailBounds((prev) =>
      prev.top === bounds.top && prev.height === bounds.height ? prev : bounds
    );

    // Pre-calculate and cache badge center Y offsets relative to listEl
    nodeCentersRef.current = milestoneEls.map((badge) => {
      const r = badge.getBoundingClientRect();
      return r.top + r.height / 2 - listRect.top;
    });

    // Refresh marker position preserving continuous reading position or measured badge placement
    const currentProg = currentProgressRef.current > 0 ? currentProgressRef.current : getBadgeProgress(currentActiveIndexRef.current);
    updateMarkerAndProgress(currentProg);
  }, [updateMarkerAndProgress, getBadgeProgress]);

  useEffect(() => {
    measureRailGeometry();
    window.addEventListener('resize', measureRailGeometry, { passive: true });

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        measureRailGeometry();
      }).catch(() => {});
    }

    const listEl = journeyListRef.current;
    let ro: ResizeObserver | null = null;
    if (listEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        measureRailGeometry();
      });
      ro.observe(listEl);
    }

    const timer = setTimeout(measureRailGeometry, 300);

    return () => {
      window.removeEventListener('resize', measureRailGeometry);
      if (ro) ro.disconnect();
      clearTimeout(timer);
    };
  }, [measureRailGeometry]);

  // Section entry & visibility observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVis = entry.isIntersecting;
        if (isVis) onSectionActive?.(true);
        else onSectionActive?.(false);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onSectionActive]);

  // ── GSAP ScrollTrigger Choreography (Scoped & Isolated) ──
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const listEl = journeyListRef.current;
    if (!sectionEl || !listEl) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMotionDisabled = motionPaused || prefersReduced;

    if (isMotionDisabled) {
      // Reduced motion / paused: ensure all chapters and elements are displayed statically at final layout
      revealRefs.current.forEach((revealEl) => {
        if (revealEl) gsap.set(revealEl, { y: 0, opacity: 1 });
      });
      illustrationRefs.current.forEach((illusEl) => {
        if (illusEl) gsap.set(illusEl, { y: 0 });
      });
      titlePlateRefs.current.forEach((titleEl) => {
        if (titleEl) gsap.set(titleEl, { y: 0 });
      });
    }

    const ctx = gsap.context(() => {
      // 1. Reversible Scrubbed Reveals for each Checkpoint Chapter (active only when motion enabled)
      if (!isMotionDisabled) {
        revealRefs.current.forEach((revealEl, idx) => {
          const rowEl = rowRefs.current[idx];
          const illusEl = illustrationRefs.current[idx];
          const titleEl = titlePlateRefs.current[idx];
          if (!revealEl || !rowEl) return;

          // Outer chapter reveal: settles 28px with opacity
          gsap.fromTo(
            revealEl,
            { y: 28, opacity: 0.75 },
            {
              y: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: rowEl,
                start: 'top 92%',
                end: 'top 65%',
                scrub: 0.4,
              },
            }
          );

          // Foreground illustration moves independently 32px
          if (illusEl) {
            gsap.fromTo(
              illusEl,
              { y: 32 },
              {
                y: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: rowEl,
                  start: 'top 94%',
                  end: 'top 62%',
                  scrub: 0.4,
                },
              }
            );
          }

          // Title plate settles 14px
          if (titleEl) {
            gsap.fromTo(
              titleEl,
              { y: 14 },
              {
                y: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: rowEl,
                  start: 'top 94%',
                  end: 'top 68%',
                  scrub: 0.35,
                },
              }
            );
          }
        });
      }

      // 2. Master Travelling Marker & Illuminated Rail Scrub Trigger
      // Keeps reading progress functional even when motion is paused/reduced
      ScrollTrigger.create({
        trigger: listEl,
        start: 'top 70%',
        end: 'bottom 65%',
        scrub: isMotionDisabled ? false : 0.4,
        onUpdate: (self) => {
          const progress = Math.max(0, Math.min(1, self.progress));
          const currentHeight = railBoundsRef.current.height;

          // Single owner GPU transform update
          currentProgressRef.current = progress;
          updateMarkerAndProgress(progress);

          // Discrete Reading Position using pre-cached milestone geometry
          const markerOffsetFromList = railBoundsRef.current.top + progress * currentHeight;
          const centers = nodeCentersRef.current;
          if (centers.length > 0) {
            let closestIdx = 0;
            let minDistance = Infinity;

            for (let i = 0; i < centers.length; i++) {
              const dist = Math.abs(centers[i] - markerOffsetFromList);
              if (dist < minDistance) {
                minDistance = dist;
                closestIdx = i;
              }
            }

            if (closestIdx !== currentActiveIndexRef.current) {
              currentActiveIndexRef.current = closestIdx;
              setActiveStageIndex(closestIdx);
            }
          }
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [motionPaused, railBounds.height, updateMarkerAndProgress, getBadgeProgress]);

  // Handle stage selection using measured badge position
  const handleStageSelect = useCallback((index: number) => {
    if (soundEnabled) {
      uiAudio.playPressClack();
    }
    currentActiveIndexRef.current = index;
    setActiveStageIndex(index);
    const badgeProg = getBadgeProgress(index);
    currentProgressRef.current = badgeProg;
    updateMarkerAndProgress(badgeProg);

    const targetRow = rowRefs.current[index];
    if (targetRow) {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      targetRow.scrollIntoView({
        behavior: motionPaused || prefersReduced ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  }, [motionPaused, soundEnabled, updateMarkerAndProgress, getBadgeProgress]);

  const handleStageHover = useCallback((index: number, hovered: boolean) => {
    if (hovered) {
      setHoveredStageIndex(index);
      if (soundEnabled) {
        uiAudio.playHoverTick();
      }
    } else {
      setHoveredStageIndex((prev) => (prev === index ? null : prev));
    }
  }, [soundEnabled]);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      aria-label={TIMELINE_COPY.sectionAriaLabel}
      className={styles.timelineSection}
    >
      {/* ── 1. Cosmic Space Background Layer ── */}
      <div className={styles.cosmicBg}>
        <div className={styles.cosmicPattern} />
        <div className={styles.radialOverlay} />
        <div className={styles.edgeSeamTop} />
        <div className={styles.edgeSeamBottom} />
      </div>

      {/* Top Seam Strip */}
      <div className={styles.darkSeamStrip}>
        <img
          src={TIMELINE_ASSETS.stripDark}
          alt=""
          aria-hidden="true"
          className={styles.darkSeamImg}
        />
      </div>

      {/* ── 2. Section Header & Intentional Guide Introduction ── */}
      <header className={styles.sectionHeader}>
        {/* Parallelogram Banner Plate + TIMELINE Title */}
        <div className={styles.bannerContainer}>
          <div
            className={`${styles.bannerGlowLayer} ${motionPaused ? styles.bannerGlowPaused : ''}`}
            aria-hidden="true"
          >
            <img
              src={TIMELINE_ASSETS.headingBanner}
              alt=""
              width={459}
              height={82}
              draggable={false}
              className={styles.bannerGlowImg}
              loading="lazy"
              decoding="async"
            />
          </div>
          <img
            src={TIMELINE_ASSETS.headingBanner}
            alt="Tournament Timeline"
            width={459}
            height={82}
            draggable={false}
            className={styles.bannerImg}
            loading="lazy"
            decoding="async"
          />
          <img
            src={TIMELINE_ASSETS.headingText}
            alt={TIMELINE_COPY.sectionTitle}
            width={171}
            height={34}
            draggable={false}
            className={styles.titleWordmark}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Dedicated Guide Area (Buzz Mascot & Speech Bubble) */}
        <div className={styles.guideIntroArea}>
          <div className={styles.guideMascotWrap}>
            <img
              src={TIMELINE_ASSETS.characterGuide}
              alt={TIMELINE_COPY.guideName}
              width={1427}
              height={1102}
              loading="lazy"
              decoding="async"
              draggable={false}
              className={styles.guideMascotImg}
            />
          </div>

          <div className={styles.speechBubbleWrap}>
            <span className={styles.speechBubbleText}>{TIMELINE_COPY.speechPhrase}</span>
          </div>
        </div>

        {/* Dynamic Journey Stage Pill */}
        <div className={styles.checkpointStatusPill}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: TIMELINE_STAGES[activeStageIndex].theme.primaryColor,
              boxShadow: `0 0 10px ${TIMELINE_STAGES[activeStageIndex].theme.primaryColor}`,
            }}
          />
          <span>
            CHECKPOINT {TIMELINE_STAGES[activeStageIndex].step} — {TIMELINE_STAGES[activeStageIndex].title} ({TIMELINE_STAGES[activeStageIndex].badgeLabel})
          </span>
        </div>

        {/* Scroll Journey Prompt */}
        <p className={styles.scrollHintText}>
          {TIMELINE_COPY.desktopHint}
        </p>
      </header>

      {/* ── 3. Four Illustrated Chapters in Strict Vertical Flow ── */}
      <main className={styles.journeyContainer}>
        <div className={styles.journeyLayout}>
          {/* Continuous Vertical Substantial Gold Rail */}
          <div
            ref={railContainerRef}
            className={styles.verticalRail}
            style={{
              top: `${railBounds.top}px`,
              height: `${railBounds.height}px`,
            }}
          >
            {/* Dynamic Illuminated Progress Overlay Layer (GPU Transform Scale) */}
            <div
              ref={progressLineRef}
              data-timeline-progress="true"
              className={styles.railProgressFill}
            />

            {/* Traveling Progress Marker (Single Coordinate System via translate3d) */}
            <div
              ref={markerRef}
              data-timeline-marker="true"
              className={styles.travellingMarker}
            />
          </div>

          {/* Semantic Ordered List of 4 Chapters */}
          <ol
            ref={journeyListRef}
            className={styles.chapterList}
          >
            {TIMELINE_STAGES.map((stage: TimelineStageData, index: number) => {
              const isActive = activeStageIndex === index;
              const isReached = index <= activeStageIndex;
              const isHovered = hoveredStageIndex === index;

              return (
                <li
                  key={stage.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className={styles.chapterRow}
                  aria-label={`Chapter ${stage.step} — ${stage.title}`}
                >
                  {/* Left Rail Node with Numbered Milestone */}
                  <div className={styles.nodeWrapper}>
                    <MilestoneBadge
                      badgeRef={(el) => {
                        milestoneRefs.current[index] = el;
                      }}
                      step={stage.step}
                      isActive={isActive}
                      isReached={isReached}
                      isHovered={isHovered}
                      theme={stage.theme}
                      onClick={() => handleStageSelect(index)}
                      size={56}
                    />

                    {/* Horizontal Connector to Chapter Scene */}
                    <div
                      className={styles.connectorBeam}
                      style={{
                        width: 'clamp(18px, 4vw, 42px)',
                        background: isActive
                          ? stage.theme.accentGradient
                          : 'linear-gradient(90deg, #FDD944 0%, rgba(253, 217, 68, 0.4) 100%)',
                        boxShadow: isActive ? `0 0 12px ${stage.theme.glowColor}` : 'none',
                      }}
                    />
                  </div>

                  {/* Wide Chapter Scene Component */}
                  <TimelineChapter
                    stage={stage}
                    isActive={isActive}
                    onSelect={() => handleStageSelect(index)}
                    onHover={(h) => handleStageHover(index, h)}
                    revealRef={(el) => {
                      revealRefs.current[index] = el;
                    }}
                    illustrationRef={(el) => {
                      illustrationRefs.current[index] = el;
                    }}
                    titlePlateRef={(el) => {
                      titlePlateRefs.current[index] = el;
                    }}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </main>
    </section>
  );
};
