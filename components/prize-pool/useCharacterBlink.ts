'use client';

import { useState, useEffect, useRef } from 'react';

export type BlinkState = 'open' | 'half' | 'closed';

export interface UseCharacterBlinkOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  initialDelayMs?: number; // 0 for cowboy, 1500 for space ranger
  intervalMs?: number; // 3000ms
  motionPaused?: boolean;
}

export function useCharacterBlink({
  containerRef,
  initialDelayMs = 0,
  intervalMs = 3000,
  motionPaused = false,
}: UseCharacterBlinkOptions): BlinkState {
  const [blinkState, setBlinkState] = useState<BlinkState>('open');
  const isVisibleRef = useRef<boolean>(true);
  const isDocumentVisibleRef = useRef<boolean>(true);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];
  };

  useEffect(() => {
    if (motionPaused) {
      clearTimers();
      setBlinkState('open');
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      clearTimers();
      setBlinkState('open');
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let initialTimeoutId: NodeJS.Timeout | null = null;

    const triggerBlinkSequence = () => {
      if (!isVisibleRef.current || !isDocumentVisibleRef.current) {
        setBlinkState('open');
        return;
      }

      clearTimers();

      // 1. Close to half-state immediately: 0ms
      setBlinkState('half');

      // 2. Fully closed eye: at ~60ms
      const t1 = setTimeout(() => {
        setBlinkState('closed');
      }, 60);
      activeTimersRef.current.push(t1);

      // 3. Hold closed for ~35ms, reopen to half-state: at ~95ms
      const t2 = setTimeout(() => {
        setBlinkState('half');
      }, 95);
      activeTimersRef.current.push(t2);

      // 4. Fully reopened: at ~190ms (approx 95ms reopen transition)
      const t3 = setTimeout(() => {
        setBlinkState('open');
      }, 190);
      activeTimersRef.current.push(t3);
    };

    const startLoop = () => {
      triggerBlinkSequence();
      intervalId = setInterval(triggerBlinkSequence, intervalMs);
    };

    if (initialDelayMs > 0) {
      initialTimeoutId = setTimeout(startLoop, initialDelayMs);
    } else {
      startLoop();
    }

    // IntersectionObserver to pause blinking when offscreen
    let observer: IntersectionObserver | null = null;
    if (typeof window !== 'undefined' && containerRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisibleRef.current = entry.isIntersecting;
            if (!entry.isIntersecting) {
              clearTimers();
              setBlinkState('open');
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    }

    // VisibilityChange to pause blinking when tab is hidden
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden;
      if (document.hidden) {
        clearTimers();
        setBlinkState('open');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
      if (intervalId) clearInterval(intervalId);
      clearTimers();
      setBlinkState('open');
      if (observer) observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [containerRef, initialDelayMs, intervalMs, motionPaused]);

  return blinkState;
}
