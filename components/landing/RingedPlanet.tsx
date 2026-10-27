'use client';

import React, { useEffect, useRef } from 'react';

interface RingedPlanetProps {
  motionPaused?: boolean;
}

export const RingedPlanet: React.FC<RingedPlanetProps> = ({ motionPaused = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionPausedRef = useRef<boolean>(motionPaused);
  motionPausedRef.current = motionPaused;

  const startLoopRef = useRef<(() => void) | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    // Fixed display canvas resolution for crisp retina rendering
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    const R = size / 2.0;
    const cx = R;
    const cy = R;

    // Ring tilt angle: -22.85 deg
    const theta = (-22.846 * Math.PI) / 180.0;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    let isDestroyed = false;
    let isVisible = true;
    let animId: number | null = null;

    // Load assets: surface map texture + sphere lighting map
    const mapImg = new Image();
    const sphereImg = new Image();

    let mapLoaded = false;
    let sphereLoaded = false;

    // Precomputed lookup table variables
    let numPixels = 0;
    let destOffsets: Int32Array;
    let texVRows: Int32Array;
    let colBases: Float32Array;
    let lightingData: Uint8Array; // Consolidated single lighting array
    let alphaData: Uint8Array;
    let imageData: ImageData;
    let texData: Uint8ClampedArray;
    let mapW = 512;
    let mapH = 256;

    let rotationPhase = 0; // Preserved rotation phase (0.0 to 1.0)
    let lastActiveTime = performance.now();
    let lastDrawTime = 0;

    const renderFrame = (progress: number) => {
      if (!imageData || numPixels === 0) return;

      const destData = imageData.data;
      const shift = (progress * mapW) % mapW;

      for (let k = 0; k < numPixels; k++) {
        const col = Math.floor(colBases[k] + shift) % mapW;
        const validCol = col < 0 ? col + mapW : col;
        const texIdx = (texVRows[k] + validCol) * 4;
        const dest = destOffsets[k];
        const light = lightingData[k];

        // Integer fixed-point lighting modulation
        destData[dest] = (texData[texIdx] * light) >> 7;
        destData[dest + 1] = (texData[texIdx + 1] * light) >> 7;
        destData[dest + 2] = (texData[texIdx + 2] * light) >> 7;
        destData[dest + 3] = alphaData[k];
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const periodMs = 42000; // 42 seconds per revolution

    const loop = (time: number) => {
      if (isDestroyed || !isVisible || motionPausedRef.current || document.hidden) return;

      const dt = Math.max(0, time - lastActiveTime);
      lastActiveTime = time;
      rotationPhase = (rotationPhase + dt / periodMs) % 1.0;

      // Limit surface painting to ~30 frames per second (~33.3ms)
      if (time - lastDrawTime >= 33.3) {
        lastDrawTime = time;
        renderFrame(rotationPhase);
      }

      animId = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (animId !== null || isDestroyed || !isVisible || motionPausedRef.current || document.hidden) return;
      lastActiveTime = performance.now();
      animId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    startLoopRef.current = startLoop;
    stopLoopRef.current = stopLoop;

    const tryInitLUT = () => {
      if (!mapLoaded || !sphereLoaded || isDestroyed) return;

      // Extract surface texture pixels from an offscreen canvas
      const offMap = document.createElement('canvas');
      offMap.width = mapImg.naturalWidth || 512;
      offMap.height = mapImg.naturalHeight || 256;
      mapW = offMap.width;
      mapH = offMap.height;
      const offMapCtx = offMap.getContext('2d');
      if (!offMapCtx) return;
      offMapCtx.drawImage(mapImg, 0, 0);
      texData = offMapCtx.getImageData(0, 0, mapW, mapH).data;

      // Extract original sphere lighting & alpha
      const offSphere = document.createElement('canvas');
      offSphere.width = size;
      offSphere.height = size;
      const offSphereCtx = offSphere.getContext('2d');
      if (!offSphereCtx) return;
      offSphereCtx.drawImage(sphereImg, 0, 0, size, size);
      const sphereData = offSphereCtx.getImageData(0, 0, size, size).data;

      imageData = ctx.createImageData(size, size);

      // Precompute circular silhouette and spherical normal coordinates
      const maxPixels = size * size;
      const tempDestOffsets = new Int32Array(maxPixels);
      const tempTexVRows = new Int32Array(maxPixels);
      const tempColBases = new Float32Array(maxPixels);
      const tempLight = new Uint8Array(maxPixels); // Consolidated single lighting buffer
      const tempAlpha = new Uint8Array(maxPixels);

      let count = 0;
      for (let y = 0; y < size; y++) {
        const ny = (y - cy) / R;
        for (let x = 0; x < size; x++) {
          const nx = (x - cx) / R;
          const r2 = nx * nx + ny * ny;
          const pixelIdx = (y * size + x) * 4;
          const sphereAlpha = sphereData[pixelIdx + 3];

          if (r2 <= 0.992 && sphereAlpha > 15) {
            const nz = Math.sqrt(Math.max(0, 1.0 - r2));

            // Rotate coordinates by -theta to align ring plane with equatorial plane
            const u = nx * cosT + ny * sinT;
            const v = -nx * sinT + ny * cosT;
            const w = nz;

            // Latitude (-PI/2 to PI/2), Longitude (0 to PI on visible side)
            const clampedV = Math.max(-1.0, Math.min(1.0, v));
            const lat = Math.asin(clampedV);
            const lon = Math.atan2(w, u);

            // Texture UVs
            const texV = Math.floor(((lat / Math.PI) + 0.5) * mapH) % mapH;
            const baseColRatio = (lon / (2.0 * Math.PI)) * mapW;

            // Compute stationary illumination factor from original sphere artwork
            const sr = sphereData[pixelIdx];
            const sg = sphereData[pixelIdx + 1];
            const sb = sphereData[pixelIdx + 2];
            const lum = (0.299 * sr + 0.587 * sg + 0.114 * sb) / 255.0;

            // Scaled fixed-point lighting multiplier
            const ambient = 0.24;
            const diffuse = lum * 1.6;
            const totalLight = Math.min(2.0, ambient + diffuse);
            const lightByte = Math.min(255, Math.floor(totalLight * 128));

            tempDestOffsets[count] = pixelIdx;
            tempTexVRows[count] = texV * mapW;
            tempColBases[count] = baseColRatio;
            tempLight[count] = lightByte;
            tempAlpha[count] = sphereAlpha;
            count++;
          }
        }
      }

      numPixels = count;
      destOffsets = tempDestOffsets.slice(0, numPixels);
      texVRows = tempTexVRows.slice(0, numPixels);
      colBases = tempColBases.slice(0, numPixels);
      lightingData = tempLight.slice(0, numPixels);
      alphaData = tempAlpha.slice(0, numPixels);

      // Render initial frame
      renderFrame(rotationPhase);

      // Start continuous rotation if motion is not paused
      if (!motionPausedRef.current) {
        startLoop();
      }
    };

    // Intersection Observer to pause rendering when planet is offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry ? entry.isIntersecting : false;
        if (isVisible && !motionPausedRef.current && !document.hidden) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Visibility change listener to pause rendering when tab/document is hidden
    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isVisible && !motionPausedRef.current) {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    mapImg.src = '/assets/genesis/static/ringed-planet-surface-map.webp';
    mapImg.onload = () => {
      mapLoaded = true;
      tryInitLUT();
    };

    sphereImg.src = '/assets/genesis/static/ringed-planet-sphere.webp';
    sphereImg.onload = () => {
      sphereLoaded = true;
      tryInitLUT();
    };

    return () => {
      isDestroyed = true;
      stopLoop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      startLoopRef.current = null;
      stopLoopRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (motionPaused) {
      stopLoopRef.current?.();
    } else {
      startLoopRef.current?.();
    }
  }, [motionPaused]);

  return (
    <div
      ref={containerRef}
      className="ringedPlanetRig"
      aria-label="Majestic purple celestial ringed planet with rotating surface features"
      role="img"
    >
      {/* 1. Rear Ring Segment (z-index: 1) — stationary, held at current position & inclination */}
      <img
        src="/assets/genesis/static/ringed-planet-back.webp"
        alt=""
        width={1444}
        height={752}
        className="planetRingsBack"
        draggable={false}
      />

      {/* 2. Rotating Spherical Surface (z-index: 2) — circular mask with canvas & stationary lighting */}
      <div className="planetSphereWindow">
        <canvas
          ref={canvasRef}
          className="planetSurfaceCanvas"
          width={200}
          height={200}
          aria-hidden="true"
        />
        {/* Stationary atmosphere & specular rim overlay */}
        <img
          src="/assets/genesis/static/ringed-planet-sphere.webp"
          alt=""
          className="planetAtmosphereOverlay"
          draggable={false}
          aria-hidden="true"
        />
      </div>

      {/* 3. Front Ring Segment (z-index: 3) — stationary, crossing in front of the sphere */}
      <img
        src="/assets/genesis/static/ringed-planet-front.webp"
        alt=""
        width={1444}
        height={752}
        className="planetRingsFront"
        draggable={false}
      />
    </div>
  );
};
