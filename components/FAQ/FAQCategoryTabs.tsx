'use client';

import React, { useRef } from 'react';
import { FAQCategory, FAQCategoryId } from './faqData';
import styles from './FAQSection.module.css';
import { uiAudio } from '../../lib/uiAudio';

export interface FAQCategoryTabsProps {
  categories: FAQCategory[];
  activeCategoryId: FAQCategoryId;
  onSelectCategory: (categoryId: FAQCategoryId) => void;
  soundEnabled: boolean;
  motionPaused: boolean;
}

export const FAQCategoryTabs: React.FC<FAQCategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  soundEnabled,
  motionPaused,
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabClick = (categoryId: FAQCategoryId) => {
    if (categoryId !== activeCategoryId) {
      if (soundEnabled) {
        uiAudio.playPressClack();
      }
      onSelectCategory(categoryId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let targetIndex = -1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % categories.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + categories.length) % categories.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = categories.length - 1;
    }

    if (targetIndex >= 0 && targetIndex !== currentIndex) {
      const nextCategory = categories[targetIndex];
      handleTabClick(nextCategory.id);
      const nextBtn = tabRefs.current[targetIndex];
      if (nextBtn) {
        nextBtn.focus({ preventScroll: true });
      }
    }
  };

  return (
    <nav
      className={styles.categoryBarContainer}
      aria-label="FAQ Category Navigation"
    >
      <div className={styles.categoryBar}>
        <div
          role="tablist"
          aria-label="FAQ Categories"
          className={styles.categoryList}
        >
          {categories.map((cat, index) => {
            const isSelected = cat.id === activeCategoryId;
            const tabId = `faq-tab-${cat.id}`;
            const panelId = `faq-panel-${cat.id}`;

            return (
              <button
                key={cat.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleTabClick(cat.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={styles.categoryTab}
                style={{
                  transitionDuration: motionPaused ? '0.01ms' : undefined,
                }}
              >
                <span className={styles.categoryLabel}>{cat.label}</span>
                {isSelected && (
                  <span
                    className={styles.activeAccent}
                    aria-hidden="true"
                    style={{
                      transitionDuration: motionPaused ? '0.01ms' : undefined,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
