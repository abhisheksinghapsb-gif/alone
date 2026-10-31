'use client';

import React from 'react';
import { TimelineStageData } from './timelineData';
import styles from './timeline.module.css';

export interface TimelineChapterProps {
  stage: TimelineStageData;
  isActive: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  revealRef?: (el: HTMLDivElement | null) => void;
  illustrationRef?: (el: HTMLDivElement | null) => void;
  titlePlateRef?: (el: HTMLDivElement | null) => void;
}

export const TimelineChapter: React.FC<TimelineChapterProps> = ({
  stage,
  isActive,
  onSelect,
  onHover,
  revealRef,
  illustrationRef,
  titlePlateRef,
}) => {
  const handlePointerEnter = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    onHover(true);
  };

  const handlePointerLeave = () => {
    onHover(false);
  };

  // Stage-specific class names
  const stageClass =
    stage.step === '01'
      ? styles.chapterStage1
      : stage.step === '02'
      ? styles.chapterStage2
      : stage.step === '03'
      ? styles.chapterStage3
      : styles.chapterStage4;

  const titlePlateClass =
    stage.step === '01'
      ? styles.titlePlateStage1
      : stage.step === '02'
      ? styles.titlePlateStage2
      : stage.step === '03'
      ? styles.titlePlateStage3
      : styles.titlePlateStage4;

  return (
    <div className={styles.chapterSceneOuter}>
      {/* 1. Dedicated Scroll Reveal Wrapper */}
      <div
        ref={revealRef}
        className={styles.chapterRevealInner}
      >
        {/* 2. Interactive Dimensional Visual Surface (Controlled for Hover & Active selection) */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          className={`${styles.chapterFrame} ${stageClass} ${isActive ? styles.activeChapter : ''}`}
          aria-label={`Chapter ${stage.step}: ${stage.title} (${stage.badgeLabel})`}
          aria-current={isActive ? 'step' : undefined}
        >
          {/* Environment Background Layer */}
          <div className={styles.envBackgroundLayer}>
            <img
              src={stage.envAsset}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className={styles.envBackgroundImg}
            />
            <div className={styles.envOverlayGradient} />
          </div>

          {/* Wide Scene Grid */}
          <div className={styles.sceneGrid}>
            {/* Left: Solid Dimensional Title Plate & Stage Details */}
            <div className={styles.titlePane}>
              {/* Checkpoint Step Indicator */}
              <div className={styles.stageNumberBadge}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: stage.theme.primaryColor,
                    boxShadow: `0 0 8px ${stage.theme.primaryColor}`,
                  }}
                />
                <span style={{ color: '#FDD944' }}>CHAPTER {stage.step}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
                <span style={{ color: '#FFFFFF' }}>04</span>
              </div>

              {/* Dimensional Game Title Plate (Independently animated settle) */}
              <div
                ref={titlePlateRef}
                className={`${styles.titlePlate} ${titlePlateClass}`}
              >
                <h3 className={styles.stageMainTitle}>{stage.title}</h3>
                <div className={styles.stageSubTag}>
                  <span
                    className={styles.stageTagPill}
                    style={{
                      borderColor: stage.theme.primaryColor,
                      color: stage.step === '02' ? '#38D4FF' : stage.step === '03' ? '#9FFF24' : '#FFEA79',
                    }}
                  >
                    {stage.badgeLabel}
                  </span>
                  <span>{stage.sub}</span>
                </div>
              </div>

              {/* Stage Description */}
              <p className={styles.stageDescription}>{stage.description}</p>

              {/* Metadata Row */}
              <div className={styles.stageMetaRow}>
                <span className={styles.stageMetaDot} style={{ backgroundColor: stage.theme.primaryColor }} />
                <span>{stage.mode}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{stage.dates}</span>
              </div>
            </div>

            {/* Right: Generous Illustration Space with Independent Foreground Layer */}
            <div className={styles.illustrationPane}>
              <div
                ref={illustrationRef}
                className={styles.artworkContainer}
              >
                {stage.step === '01' && (
                  <div className={styles.stage1ArtWrapper}>
                    <img
                      src={stage.characterAsset}
                      alt={stage.alt}
                      loading="lazy"
                      decoding="async"
                      className={styles.charImgStage1}
                    />
                    {/* Realistic Multi-Wisp Steam Effect Rising from the Teapot */}
                    <div className={styles.teaSteamGroup} aria-label="Rising teapot steam" aria-hidden="true">
                      <span className={`${styles.steamWisp} ${styles.steamWisp1}`} />
                      <span className={`${styles.steamWisp} ${styles.steamWisp2}`} />
                      <span className={`${styles.steamWisp} ${styles.steamWisp3}`} />
                    </div>
                  </div>
                )}

                {stage.step === '02' && (
                  <div className={styles.starEmblemWrap}>
                    <div className={styles.starRaysGlow} />
                    <img
                      src={stage.characterAsset}
                      alt={stage.alt}
                      loading="lazy"
                      decoding="async"
                      className={styles.starEmblemImg}
                    />
                  </div>
                )}

                {stage.step === '03' && (
                  <div className={styles.stage3ArtWrapper}>
                    <img
                      src={stage.characterAsset}
                      alt={stage.alt}
                      loading="lazy"
                      decoding="async"
                      className={styles.charImgStage3}
                    />
                  </div>
                )}

                {stage.step === '04' && (
                  <div className={styles.emblemStage4Wrap}>
                    <img
                      src={stage.characterAsset}
                      alt={stage.alt}
                      loading="lazy"
                      decoding="async"
                      className={styles.emblemImgStage4}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
