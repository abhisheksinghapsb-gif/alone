'use client';

import React, { useEffect, useRef } from 'react';

interface FallingStar {
  x: number;
  y: number;
  size: number;
  speedY: number; // Vertical speed in CSS px/s (30–70)
  speedX: number; // Horizontal drift in CSS px/s (6–18)
  baseAlpha: number;
  alpha: number;
  color: string;
  isStreak: boolean;
  trailLength: number;
}

export interface SpaceEffectsProps {
  motionPaused: boolean;
}

export const SpaceEffects: React.FC<SpaceEffectsProps> = ({ motionPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<FallingStar[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let skyHeight = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      // Sky region ends approximately at the arena rail ledge (~72% of height)
      skyHeight = height * 0.73;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cosmic star color palette
    const starColors = ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#FDE047', '#C4B5FD'];

    // Initialize 52 falling stars if not already present (preserves position on resize/pause)
    if (starsRef.current.length === 0) {
      const initialStars: FallingStar[] = [];
      const totalStars = 52;

      for (let i = 0; i < totalStars; i++) {
        // Depth tier: 0=distant (slow, tiny), 1=mid, 2=near (fast, brighter)
        const tier = Math.random();
        let speedY: number;
        let size: number;
        let baseAlpha: number;

        if (tier < 0.45) {
          // Distant layer: 30–42 px/s, small 0.8–1.2px
          speedY = 32 + Math.random() * 10;
          size = 0.85 + Math.random() * 0.35;
          baseAlpha = 0.35 + Math.random() * 0.3;
        } else if (tier < 0.82) {
          // Mid layer: 42–56 px/s, 1.2–1.7px
          speedY = 44 + Math.random() * 12;
          size = 1.25 + Math.random() * 0.45;
          baseAlpha = 0.55 + Math.random() * 0.3;
        } else {
          // Near layer: 56–68 px/s, 1.7–2.2px
          speedY = 58 + Math.random() * 12;
          size = 1.75 + Math.random() * 0.5;
          baseAlpha = 0.75 + Math.random() * 0.25;
        }

        // Downward-right diagonal drift (proportional to vertical speed)
        const speedX = 7 + (speedY / 70) * 10 + (Math.random() * 3 - 1.5);

        // Approximately 10% of stars have short aligned light streaks
        const isStreak = tier > 0.88;
        const trailLength = isStreak ? 12 + Math.random() * 12 : 0;

        initialStars.push({
          x: Math.random() * (width + 60) - 30,
          y: Math.random() * skyHeight, // distributed across sky
          size,
          speedY,
          speedX,
          baseAlpha,
          alpha: baseAlpha,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          isStreak,
          trailLength,
        });
      }

      starsRef.current = initialStars;
    }

    // Single Animation Frame Loop
    const animate = (currentTime: number) => {
      if (!isRunningRef.current) return;

      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      // Elapsed time in seconds; clamp to max 0.08s (12.5 FPS) to prevent teleportation after tab restore
      const dt = Math.min(Math.max((currentTime - lastTimeRef.current) / 1000, 0), 0.08);
      lastTimeRef.current = currentTime;

      ctx.clearRect(0, 0, width, height);

      const stars = starsRef.current;
      const shouldMove = !motionPaused && !prefersReducedMotion;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (shouldMove) {
          // Physics step based on exact elapsed time
          star.x += star.speedX * dt;
          star.y += star.speedY * dt;

          // Recycle star when it exits bottom of sky or right edge of viewport
          if (star.y > skyHeight || star.x > width + 30) {
            star.y = -12;
            star.x = Math.random() * (width + 120) - 80;
          }
        }

        // Draw star point
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();

        // Draw streak trail if active
        if (star.isStreak && star.trailLength > 0) {
          const norm = Math.hypot(star.speedX, star.speedY) || 1;
          const dirX = star.speedX / norm;
          const dirY = star.speedY / norm;

          const startX = star.x - dirX * star.trailLength;
          const startY = star.y - dirY * star.trailLength;

          const grad = ctx.createLinearGradient(startX, startY, star.x, star.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(1, star.color);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(star.x, star.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = star.size * 0.85;
          ctx.lineCap = 'round';
          ctx.globalAlpha = star.alpha * 0.85;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;

      if (isRunningRef.current) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    const drawStationaryFrame = () => {
      ctx.clearRect(0, 0, width, height);
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    };

    let isVisible = true;

    const stopLoop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isRunningRef.current = false;
    };

    const startLoop = () => {
      if (isRunningRef.current || !isVisible || motionPaused || prefersReducedMotion || document.hidden) return;
      lastTimeRef.current = 0; // Reset last time to prevent delta jump
      isRunningRef.current = true;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    // Start or stop based on motionPaused & visibility
    if (!motionPaused && !prefersReducedMotion) {
      startLoop();
    } else {
      stopLoop();
      drawStationaryFrame();
    }

    // Visibility change handler (tab suspension)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isVisible && !motionPaused && !prefersReducedMotion) {
        startLoop();
      }
    };

    const handleResize = () => {
      resize();
      if (!isRunningRef.current) {
        drawStationaryFrame();
      }
    };

    // IntersectionObserver to stop loop when hero/canvas is offscreen
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = entry ? entry.isIntersecting : false;
          if (isVisible && !document.hidden && !motionPaused && !prefersReducedMotion) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
      stopLoop();
    };
  }, [motionPaused]);

  return (
    <canvas
      ref={canvasRef}
      id="space-starfield-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 'var(--z-stars)',
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
};
