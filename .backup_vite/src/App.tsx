import React, { useState, useRef } from 'react';
import { LandingHeader } from './components/landing/LandingHeader';
import { LandingScene } from './components/landing/LandingScene';
import { uiAudio } from './lib/uiAudio';

export const App: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [motionPaused, setMotionPaused] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    uiAudio.setSoundEnabled(enabled);
  };

  const handleToggleMotion = (paused: boolean) => {
    setMotionPaused(paused);
  };

  return (
    <div
      ref={pageRef}
      id="page-root"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-space)',
      }}
    >
      <LandingHeader
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        motionPaused={motionPaused}
        onToggleMotion={handleToggleMotion}
      />
      <LandingScene motionPaused={motionPaused} pageRef={pageRef} />
    </div>
  );
};

export default App;
