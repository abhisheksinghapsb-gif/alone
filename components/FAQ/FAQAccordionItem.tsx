'use client';

import React from 'react';
import Image from 'next/image';
import { FAQQuestionItem } from './faqData';
import styles from './FAQSection.module.css';
import { uiAudio } from '../../lib/uiAudio';

export interface FAQAccordionItemProps {
  item: FAQQuestionItem;
  isOpen: boolean;
  onToggle: () => void;
  soundEnabled: boolean;
  motionPaused: boolean;
}

export const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({
  item,
  isOpen,
  onToggle,
  soundEnabled,
  motionPaused,
}) => {
  const headingId = `faq-head-${item.id}`;
  const contentId = `faq-body-${item.id}`;

  const handleClick = () => {
    if (soundEnabled) {
      uiAudio.playPressClack();
    }
    onToggle();
  };

  return (
    <div
      className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ''}`}
      data-faq-item={item.id}
    >
      <h3 className={styles.questionHeading}>
        <button
          type="button"
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={handleClick}
          className={styles.questionTrigger}
        >
          <span className={styles.questionText}>{item.question}</span>
          <span className={styles.plusContainer} aria-hidden="true">
            <Image
              src="/assets/genesis/faq/icon-plus.svg"
              alt=""
              width={18}
              height={18}
              className={`${styles.plusIcon} ${isOpen ? styles.plusIconRotated : ''}`}
              style={{
                transitionDuration: motionPaused ? '0.01ms' : undefined,
              }}
            />
          </span>
        </button>
      </h3>

      <div
        id={contentId}
        role="region"
        aria-labelledby={headingId}
        className={`${styles.answerDrawer} ${
          isOpen ? styles.answerDrawerOpen : styles.answerDrawerClosed
        }`}
        style={{
          transitionDuration: motionPaused ? '0.01ms' : undefined,
        }}
      >
        <div className={styles.answerDrawerInner}>
          <div className={styles.answerContent}>
            <p className={styles.answerText}>{item.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
