'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  color: string;
}

export interface SpaceEffectsProps {
  motionPaused: boolean;
}

export const SpaceEffects: React.FC<SpaceEffectsProps> = ({ motionPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR at 1.5 for performance

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generate deterministic star budget: ~45 total stars
    // 25 distant stars (stable with slow twinkle)
    // 20 near drifting stars (slow directional drift)
    const starColors = ['#E2F1FF', '#FFFFFF', '#CBE9FE', '#FFF8D6', '#A5E9FE'];
    const stars: Star[] = [];

    // Distant stars
    for (let i = 0; i < 28; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.7, // Concentrated in upper space
        radius: 0.8 + Math.random() * 0.9,
        baseAlpha: 0.35 + Math.random() * 0.45,
        alpha: 0.5,
        twinkleSpeed: 0.015 + Math.random() * 0.025,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: 0,
        vy: 0,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // Near drifting stars
    for (let i = 0; i < 18; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.65,
        radius: 1.2 + Math.random() * 1.0,
        baseAlpha: 0.45 + Math.random() * 0.5,
        alpha: 0.6,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: 0.08 + Math.random() * 0.16, // Slow gentle drift to the right
        vy: 0.02 + Math.random() * 0.06, // Slight downward drift
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    starsRef.current = stars;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Animate twinkle and drift if motion is active
        if (!motionPaused && !prefersReducedMotion) {
          star.twinklePhase += star.twinkleSpeed;
          star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * (star.baseAlpha * 0.4);

          star.x += star.vx;
          star.y += star.vy;

          // Wrap boundaries
          if (star.x > width + 10) star.x = -10;
          if (star.y > height * 0.75) star.y = -5;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(1, star.alpha));
        ctx.fill();

        // Subtle 4-point sparkle on prominent near stars
        if (star.radius > 1.6 && star.alpha > 0.7 && !prefersReducedMotion) {
          ctx.beginPath();
          ctx.moveTo(star.x - star.radius * 2.2, star.y);
          ctx.lineTo(star.x + star.radius * 2.2, star.y);
          ctx.moveTo(star.x, star.y - star.radius * 2.2);
          ctx.lineTo(star.x, star.y + star.radius * 2.2);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.6;
          ctx.globalAlpha = star.alpha * 0.4;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;

      if (!motionPaused && !prefersReducedMotion) {
        rafIdRef.current = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      resize();
      render();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [motionPaused]);

  return (
    <canvas
      ref={canvasRef}
      id="space-stars-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 'var(--z-stars)',
      }}
    />
  );
};
