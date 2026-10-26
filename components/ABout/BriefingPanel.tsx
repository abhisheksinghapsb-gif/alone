'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ABOUT_COPY } from '../../data/aboutGenesis';

export interface BriefingPanelProps {
  motionPaused?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export const BriefingPanel: React.FC<BriefingPanelProps> = ({
  motionPaused,
  onHoverChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 620,
    height: 380,
  });

  // Track cursor position inside the text box for reading spotlight glow
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Scrolling state management
  const [canScroll, setCanScroll] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const [hasMaskTop, setHasMaskTop] = useState<boolean>(false);
  const [hasMaskBottom, setHasMaskBottom] = useState<boolean>(false);

  const userInteractedRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const autoScrollRafRef = useRef<number | null>(null);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollable = scrollHeight > clientHeight + 4;
    setCanScroll(scrollable);

    if (scrollable) {
      const atBottom = scrollTop + clientHeight >= scrollHeight - 18;
      setIsAtBottom(atBottom);
      setHasMaskTop(scrollTop > 10);
      setHasMaskBottom(!atBottom);
    } else {
      setIsAtBottom(false);
      setHasMaskTop(false);
      setHasMaskBottom(false);
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(
    (delay = 2000) => {
      stopAutoScroll();

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (motionPaused || prefersReducedMotion) return;

      autoScrollTimeoutRef.current = setTimeout(() => {
        let lastTime = performance.now();

        const step = (time: number) => {
          const el = scrollRef.current;
          if (!el || isHoveredRef.current || userInteractedRef.current) {
            stopAutoScroll();
            return;
          }

          const delta = Math.min(32, time - lastTime);
          lastTime = time;

          const maxScroll = el.scrollHeight - el.clientHeight;
          if (el.scrollTop >= maxScroll - 2) {
            setIsAtBottom(true);
            stopAutoScroll();
            return;
          }

          // ~24px per second readable glide
          el.scrollTop += (24 * delta) / 1000;
          checkScrollState();

          autoScrollRafRef.current = requestAnimationFrame(step);
        };

        autoScrollRafRef.current = requestAnimationFrame(step);
      }, delay);
    },
    [motionPaused, stopAutoScroll, checkScrollState]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorPos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
      active: true,
    });
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    isHoveredRef.current = true;
    stopAutoScroll();
    onHoverChange?.(true);

    if (e.pointerType === 'touch') return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorPos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
      active: true,
    });
  };

  const handlePointerLeave = () => {
    isHoveredRef.current = false;
    onHoverChange?.(false);
    setCursorPos((prev) => ({ ...prev, active: false }));

    const el = scrollRef.current;
    if (el && el.scrollTop < el.scrollHeight - el.clientHeight - 20) {
      startAutoScroll(2600);
    }
  };

  const handleUserInteraction = () => {
    userInteractedRef.current = true;
    stopAutoScroll();
  };

  const handleScrollAction = () => {
    const el = scrollRef.current;
    if (!el) return;
    stopAutoScroll();

    if (isAtBottom) {
      userInteractedRef.current = false;
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      userInteractedRef.current = true;
      const step = Math.min(el.clientHeight * 0.7, 160);
      const target = Math.min(el.scrollTop + step, el.scrollHeight - el.clientHeight);
      el.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  // Ensure initial scroll position starts at the very top
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  // Track container dimensions via ResizeObserver for precise SVG frame geometry
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
        checkScrollState();
      }
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateSize());
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [checkScrollState]);

  // Viewport-aware auto-scroll trigger: ONLY starts when user has scrolled About section into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollState();

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            // When user enters view, if not interacted and at top, start reading scroll after grace period
            if (!userInteractedRef.current && !isHoveredRef.current) {
              startAutoScroll(2200);
            }
          } else {
            // Left the view: pause auto-scroll
            stopAutoScroll();
          }
        },
        { threshold: [0.1, 0.25, 0.5] }
      );
      observer.observe(el);
    } else {
      startAutoScroll(2400);
    }

    return () => {
      stopAutoScroll();
      if (observer) observer.disconnect();
    };
  }, [motionPaused, checkScrollState, startAutoScroll, stopAutoScroll]);

  // Compute exact silhouette path following Vector 38 geometry
  const w = Math.max(280, dimensions.width);
  const h = Math.max(240, dimensions.height);

  // Tab anchors (centered cleanly on container width matching Vector 38 silhouette)
  const tabWidth = Math.min(220, Math.max(160, Math.round(w * 0.32)));
  const tabLeft = Math.round((w - tabWidth) / 2);
  const tabRight = tabLeft + tabWidth;
  const bevelWidth = 32.5;
  const tabHeight = 42.5;

  const leftShoulderX = Math.max(2.5, tabLeft - bevelWidth);
  const rightShoulderX = Math.min(w - 2.5, tabRight + bevelWidth);

  // Main silhouette SVG path
  const panelPath = `
    M ${tabLeft} 2.5
    L ${leftShoulderX} ${tabHeight}
    H 2.5
    V ${h - 2.5}
    H ${w - 2.5}
    V ${tabHeight}
    H ${rightShoulderX}
    L ${tabRight} 2.5
    Z
  `.trim();

  // Offset shadow path (7px right, 9px down)
  const shadowOffsetX = 7;
  const shadowOffsetY = 9;
  const shadowPath = `
    M ${tabLeft + shadowOffsetX} ${2.5 + shadowOffsetY}
    L ${leftShoulderX + shadowOffsetX} ${tabHeight + shadowOffsetY}
    H ${2.5 + shadowOffsetX}
    V ${h - 2.5 + shadowOffsetY}
    H ${w - 2.5 + shadowOffsetX}
    V ${tabHeight + shadowOffsetY}
    H ${rightShoulderX + shadowOffsetX}
    L ${tabRight + shadowOffsetX} ${2.5 + shadowOffsetY}
    Z
  `.trim();

  return (
    <div
      ref={containerRef}
      id="briefing-panel-board"
      className="briefingBoardContainer"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* 1. Scalable SVG Silhouette Frame with Neon Boundary Glow, 5px Border & Offset Edge Shadow */}
      <svg
        className="briefingBoardSvg"
        width={w + shadowOffsetX}
        height={h + shadowOffsetY}
        viewBox={`0 0 ${w + shadowOffsetX} ${h + shadowOffsetY}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <defs>
          {/* Subtle Outer Boundary Cyan Accent Filter */}
          <filter id="panelBoundarySubtleGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Dynamic Border Reflection Gradient: catches cyan-white light at the nearest panel border */}
          <radialGradient
            id="panelReflectionGrad"
            cx={cursorPos.x}
            cy={cursorPos.y}
            r="160"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#cffafe" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="85%" stopColor="#0284c7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>

          {/* Stationary Focus Border Gradient */}
          <linearGradient id="panelFocusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* 1A. Physical Thickness Offset Shadow */}
        <path d={shadowPath} fill="#050814" opacity="0.95" />

        {/* 1B. Solid Opaque Cyan Fill Plate (#BCE6F2) - Stable background contrast */}
        <path d={panelPath} fill="#BCE6F2" />

        {/* 1C. Clean Subtle Frame Definition Accent Rim */}
        <path
          d={panelPath}
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeLinejoin="miter"
          opacity="0.5"
          filter="url(#panelBoundarySubtleGlow)"
          fill="none"
        />

        {/* 1D. Subtle Frame Reflection that follows pointer along the panel's outline */}
        <path
          d={panelPath}
          stroke="url(#panelReflectionGrad)"
          strokeWidth="3.5"
          strokeLinejoin="miter"
          fill="none"
          className="briefingBorderReflection"
          style={{
            opacity: cursorPos.active ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        />

        {/* 1E. Quiet, Stationary Border Highlight on Keyboard Focus */}
        <path
          d={panelPath}
          stroke="url(#panelFocusGrad)"
          strokeWidth="2.5"
          strokeLinejoin="miter"
          fill="none"
          className="briefingFocusBorder"
        />

        {/* 1F. 5px Solid Black Outline */}
        <path
          d={panelPath}
          stroke="#000000"
          strokeWidth="5"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
      </svg>

      {/* 3. Real Bounded Scrollport & Viewport (Clips text strictly within panel boundaries) */}
      <div className="briefingReadingScrollport">
        <div
          ref={scrollRef}
          className={`briefingScrollContainer ${hasMaskTop ? 'hasMaskTop' : ''} ${hasMaskBottom ? 'hasMaskBottom' : ''}`}
          onScroll={checkScrollState}
          onWheel={handleUserInteraction}
          onTouchStart={handleUserInteraction}
        >
          <div className="briefingContent">
            <p className="briefingParagraph" id="briefing-p1">
              {ABOUT_COPY.paragraph1}
            </p>

            <p className="briefingParagraph briefingParagraphFinal" id="briefing-p2">
              {ABOUT_COPY.paragraph2}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Directional Floating Scroll Cue (No text words, compact chevron icon button) */}
      {canScroll && (
        <div className="briefingScrollPromptWrapper">
          <button
            type="button"
            className={`briefingScrollBtn ${isAtBottom ? 'isAtBottom' : ''}`}
            onClick={handleScrollAction}
            aria-label={isAtBottom ? ABOUT_COPY.scrollToTopPrompt : ABOUT_COPY.scrollMorePrompt}
          >
            <span className="scrollBtnIcon" aria-hidden="true">
              {isAtBottom ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
