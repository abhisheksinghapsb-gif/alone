'use client';

import { useState, useRef, useCallback } from 'react';

export interface SceneActivityState {
  activeCharacter: string | null;
  canInteract: boolean;
}

/**
 * Coordinated character interaction state and cooldown management.
 * Pointer tracking is consolidated in useLandingMotion.ts.
 */
export function useSceneActivity() {
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);

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

  return {
    activeCharacter,
    triggerCharacterReaction,
  };
}
