'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './memories.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface Memory {
  id: number;
  src: string;
  x: number;
  y: number;
  tilt: number;
}

export const MEMORIES: Memory[] = [
  { id: 1, src: '/landing-pages/memories/photos/memory-01.webp', x: 22, y: 19, tilt: -9 },
  { id: 2, src: '/landing-pages/memories/photos/memory-02.webp', x: 71, y: 24, tilt: 7 },
  { id: 3, src: '/landing-pages/memories/photos/memory-03.webp', x: 44, y: 50, tilt: -6 },
  { id: 4, src: '/landing-pages/memories/photos/memory-04.webp', x: 82, y: 72, tilt: 10 },
  { id: 5, src: '/landing-pages/memories/photos/memory-05.webp', x: 20, y: 77, tilt: -12 },
  { id: 6, src: '/landing-pages/memories/photos/memory-06.webp', x: 52, y: 14, tilt: 6 },
  { id: 7, src: '/landing-pages/memories/photos/memory-07.webp', x: 15, y: 49, tilt: 8 },
  { id: 8, src: '/landing-pages/memories/photos/memory-08.webp', x: 60, y: 87, tilt: -5 },
];

export interface MemoriesSectionProps {
  motionPaused?: boolean;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({
  motionPaused = false,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const [initFailed, setInitFailed] = useState<boolean>(false);
  const [osReducedMotion, setOsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setOsReducedMotion(media.matches);
      const updateMotion = (e: MediaQueryListEvent) => {
        setOsReducedMotion(e.matches);
      };
      media.addEventListener('change', updateMotion);
      return () => media.removeEventListener('change', updateMotion);
    }
  }, []);

  const isEffectivePaused = motionPaused || osReducedMotion || initFailed;

  useEffect(() => {
    const section = sectionRef.current;
    const camera = cameraRef.current;
    if (!section || !camera) return;

    if (isEffectivePaused) {
      camera.classList.remove(styles.isAnimating);
      gsap.set(camera, { clearProps: 'transform,scale,rotation,x,y' });
      section.removeAttribute('data-progress');
      return;
    }

    let disposed = false;
    let started = false;
    let ctx: gsap.Context | null = null;
    let applyInitialFocus: (() => void) | null = null;

    const initialise = () => {
      if (started || disposed) return;
      started = true;

      try {
        ctx = gsap.context(() => {
          const isPhone = () => window.innerWidth < 640;
          const scaleForViewport = () => {
            let scale = isPhone() ? 0.96 : window.innerWidth < 1024 ? 1.06 : 1.19;
            if (typeof window !== 'undefined' && window.innerHeight < 550) {
              const heightRatio = (window.innerHeight - 80) / 480;
              scale = Math.min(scale, Math.min(0.74, heightRatio));
            }
            return scale;
          };

          const target = (memory: Memory) => {
            const scale = scaleForViewport();
            const cameraWidth = camera.offsetWidth;
            const cameraHeight = camera.offsetHeight;
            return {
              x: -(memory.x / 100 - 0.5) * cameraWidth * scale,
              y: -(memory.y / 100 - 0.5) * cameraHeight * scale,
              scale,
              rotation: -memory.tilt * 0.14,
            };
          };

          // First photograph in focus before scrolling begins.
          applyInitialFocus = () => {
            const t0 = target(MEMORIES[0]);
            gsap.set(camera, {
              x: t0.x,
              y: t0.y,
              scale: t0.scale,
              rotation: t0.rotation,
              transformOrigin: '50% 50%',
            });
          };

          applyInitialFocus();

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              invalidateOnRefresh: true,
              onEnter: () => camera.classList.add(styles.isAnimating),
              onEnterBack: () => camera.classList.add(styles.isAnimating),
              onLeave: () => camera.classList.remove(styles.isAnimating),
              onLeaveBack: () => camera.classList.remove(styles.isAnimating),
              onUpdate: (self) => {
                const progress = self.progress.toFixed(3);
                if (section.dataset.progress !== progress) {
                  section.dataset.progress = progress;
                }
              },
            },
          });

          timeline.set(camera, {
            x: () => target(MEMORIES[0]).x,
            y: () => target(MEMORIES[0]).y,
            scale: () => target(MEMORIES[0]).scale,
            rotation: () => target(MEMORIES[0]).rotation,
            transformOrigin: '50% 50%',
          });

          for (let index = 1; index < MEMORIES.length; index += 1) {
            const memory = MEMORIES[index];
            timeline.to(camera, {
              x: () => target(memory).x,
              y: () => target(memory).y,
              scale: () => target(memory).scale,
              rotation: () => target(memory).rotation,
              duration: 1,
            });
          }

          ScrollTrigger.refresh();
        }, section);
      } catch (error) {
        console.error('[GENESIS Memories] Animation initialization failed:', error);
        setInitFailed(true);
      }
    };

    initialise();

    const handleResize = () => {
      ScrollTrigger.refresh();
      if (section && camera) {
        const rect = section.getBoundingClientRect();
        if (rect.top >= -20 && rect.top <= 20) {
          applyInitialFocus?.();
        }
      }
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(section);
    }

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      camera.classList.remove(styles.isAnimating);
      if (ctx) {
        ctx.revert();
      }
    };
  }, [isEffectivePaused]);

  return (
    <section
      ref={sectionRef}
      id="memories"
      aria-label="GENESIS Memories photo journey"
      className={`${styles.genesisMemories} genesis-memories`}
      data-runtime="memories-scrollaroids-v1"
      data-motion-paused={isEffectivePaused ? 'true' : 'false'}
      style={{
        minHeight: isEffectivePaused ? 'auto' : `${MEMORIES.length * 70}svh`,
      }}
    >
      <div className={`${styles.memoriesViewport} memories-viewport`} data-memories-viewport>
        <div className={`${styles.memoriesBackground} memories-background`} aria-hidden="true" />

        <div
          ref={cameraRef}
          className={`${styles.memoriesCamera} memories-camera`}
          data-memories-camera
        >
          {MEMORIES.map((memory) => (
            <figure
              key={memory.id}
              className={`${styles.memoriesPhoto} memories-photo`}
              data-memories-photo={memory.id}
              style={{
                left: `${memory.x}%`,
                top: `${memory.y}%`,
                ['--memory-tilt' as string]: `${memory.tilt}deg`,
              }}
            >
              <Image
                src={memory.src}
                alt={`GENESIS memory photograph ${String(memory.id).padStart(2, '0')}`}
                width={960}
                height={700}
                sizes="(max-width: 639px) 76vw, (max-width: 1023px) 320px, 360px"
                className={`${styles.memoriesPhotoImage} memories-photo-image`}
                loading="lazy"
                fetchPriority="auto"
                decoding="async"
              />
              <figcaption className={`${styles.memoriesPhotoCaption} memories-photo-caption`}>
                MEMORY {String(memory.id).padStart(2, '0')}
              </figcaption>
            </figure>
          ))}
        </div>

        <header className={`${styles.memoriesHeader} memories-header`} data-memories-header>
          <Image
            className={`${styles.memoriesTitle} memories-title`}
            src="/landing-pages/memories/ui/memories-title.svg"
            width={490}
            height={130}
            alt="MEMORIES"
            data-memories-title
          />
        </header>
      </div>
    </section>
  );
};
