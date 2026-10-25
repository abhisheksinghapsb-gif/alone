'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface SceneActivityState {
  pointerX: number; // Normalized -1 to 1
  pointerY: number; // Normalized -1 to 1
  activeCharacter: string | null;
  canInteract: boolean;
}

export function useSceneActivity(sceneRef: React.RefObject<HTMLDivElement | null>) {
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Trigger character interaction with cooldown
  const triggerCharacterReaction = useCallback((characterId: string, durationMs: number = 700) => {
    setActiveCharacter(characterId);
    if (cooldownTimerRef.current) {
      window.clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = window.setTimeout(() => {
      setActiveCharacter((current) => (current === characterId ? null : current));
      cooldownTimerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Only enable pointer tracking on fine pointer devices (desktops/laptops)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      targetPosRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };

    const handlePointerLeave = () => {
      targetPosRef.current = { x: 0, y: 0 };
    };

    const updateSmoothing = () => {
      // Ease pointer position toward target
      pointerPosRef.current.x += (targetPosRef.current.x - pointerPosRef.current.x) * 0.08;
      pointerPosRef.current.y += (targetPosRef.current.y - pointerPosRef.current.y) * 0.08;
      rafRef.current = requestAnimationFrame(updateSmoothing);
    };

    scene.addEventListener('mousemove', handlePointerMove, { passive: true });
    scene.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    rafRef.current = requestAnimationFrame(updateSmoothing);

    return () => {
      scene.removeEventListener('mousemove', handlePointerMove);
      scene.removeEventListener('mouseleave', handlePointerLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [sceneRef]);

  return {
    pointerPosRef,
    activeCharacter,
    triggerCharacterReaction,
  };
}
