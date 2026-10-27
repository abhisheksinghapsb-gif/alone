'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { FAQ_CATEGORIES, FAQCategoryId } from './faqData';
import { FAQAccordionItem } from './FAQAccordionItem';
import { FAQCategoryTabs } from './FAQCategoryTabs';
import { useFAQMotion } from './useFAQMotion';
import styles from './FAQSection.module.css';
import { uiAudio } from '../../lib/uiAudio';

export interface FAQSectionProps {
  motionPaused?: boolean;
  soundEnabled?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  motionPaused = false,
  soundEnabled = false,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Active Category (defaults to General)
  const [activeCategoryId, setActiveCategoryId] = useState<FAQCategoryId>('general');

  // Track the last open question ID for each category during this mounted session
  // Default: all categories start with all answers collapsed
  const [openQuestions, setOpenQuestions] = useState<Record<FAQCategoryId, string | null>>({
    general: null,
    technical: null,
    prizes: null,
    logistics: null,
  });

  // Coordinated ScrollTrigger entrance and category-settle animations
  useFAQMotion({
    sectionRef,
    activeCategoryId,
    motionPaused,
  });

  const activeCategory =
    FAQ_CATEGORIES.find((cat) => cat.id === activeCategoryId) || FAQ_CATEGORIES[0];

  const currentOpenQuestionId = openQuestions[activeCategoryId];

  // Accordion toggle: single open answer per category; clicking open question collapses it
  const handleToggleQuestion = (questionId: string) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [activeCategoryId]: prev[activeCategoryId] === questionId ? null : questionId,
    }));
  };

  // Red X Inline Action: Collapses the currently open answer in the active category
  const handleCollapseActiveCategory = () => {
    if (!currentOpenQuestionId) return;
    if (soundEnabled) {
      uiAudio.playPressClack();
    }
    setOpenQuestions((prev) => ({
      ...prev,
      [activeCategoryId]: null,
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-label="Frequently Asked Questions"
      className={styles.faqSection}
    >
      {/* Restrained dark-blue seam transition at top of FAQ section */}
      <div className={styles.topSeam} aria-hidden="true" />

      {/* Main Content Area: Heading Plaque + Scalable Blue Panel */}
      <div className={styles.contentContainer}>
        {/* Centered Orange Angled FAQ Plaque */}
        <div
          data-faq-plaque
          className={styles.plaqueWrapper}
          role="presentation"
        >
          <Image
            src="/assets/genesis/faq/heading-plaque.svg"
            alt=""
            fill
            priority={false}
            className={styles.plaqueBg}
          />
          <div className={styles.plaqueContent}>
            <Image
              src="/assets/genesis/faq/heading-faqs.svg"
              alt="Frequently Asked Questions"
              width={88}
              height={41}
              className={styles.plaqueWordmark}
            />
          </div>
        </div>

        {/* Scalable Royal-Blue FAQ Panel */}
        <div data-faq-panel className={styles.panelCard}>
          {/* Lighter Blue Category Header Bar */}
          <div className={styles.panelHeader}>
            <h2 data-faq-title className={styles.categoryTitle}>
              {activeCategory.headingText}
            </h2>

            {/* Red X Control: collapses open answer in the current category */}
            <button
              type="button"
              disabled={!currentOpenQuestionId}
              onClick={handleCollapseActiveCategory}
              className={styles.closeButton}
              aria-label={`Collapse answers in ${activeCategory.headingText}`}
              title={`Collapse answers in ${activeCategory.headingText}`}
            >
              <Image
                src="/assets/genesis/faq/button-close.svg"
                alt=""
                width={55}
                height={45}
                className={styles.closeIcon}
              />
            </button>
          </div>

          {/* Panel Body: Geometrically stabilized across all 4 categories */}
          <div className={styles.panelBody}>
            {FAQ_CATEGORIES.map((category) => {
              const isCategoryActive = category.id === activeCategoryId;
              const panelId = `faq-panel-${category.id}`;
              const tabId = `faq-tab-${category.id}`;

              return (
                <div
                  key={category.id}
                  id={panelId}
                  role="tabpanel"
                  aria-labelledby={tabId}
                  hidden={!isCategoryActive}
                  className={styles.tabPanel}
                >
                  {category.questions.map((q) => (
                    <FAQAccordionItem
                      key={q.id}
                      item={q}
                      isOpen={openQuestions[category.id] === q.id}
                      onToggle={() => handleToggleQuestion(q.id)}
                      soundEnabled={soundEnabled}
                      motionPaused={motionPaused}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Category Navigation Bar */}
      <div data-faq-category-bar style={{ width: '100%' }}>
        <FAQCategoryTabs
          categories={FAQ_CATEGORIES}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(catId) => setActiveCategoryId(catId)}
          soundEnabled={soundEnabled}
          motionPaused={motionPaused}
        />
      </div>
    </section>
  );
};
export default FAQSection;
