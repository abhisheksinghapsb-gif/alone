/**
 * GENESIS 6 — Native Web Audio Sound Engine
 * Provides restrained, tactile game-style UI ticks for hover and press.
 * Initial state: Muted. Rate-limited and voice-capped.
 */

class UIAudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private lastHoverTime: number = 0;
  private activeVoices: number = 0;
  private readonly maxVoices: number = 3;
  private readonly hoverThrottleMs: number = 70;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        } else if (!document.hidden && this.ctx && this.isEnabled && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean): boolean {
    this.isEnabled = enabled;
    if (enabled) {
      this.initContext();
      this.playToggleChime(true);
    } else {
      this.playToggleChime(false);
    }
    return this.isEnabled;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public playHoverTick(): void {
    if (!this.isEnabled) return;
    const now = performance.now();
    if (now - this.lastHoverTime < this.hoverThrottleMs) return;
    if (this.activeVoices >= this.maxVoices) return;

    this.lastHoverTime = now;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.activeVoices++;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      const duration = 0.045; // 45ms crisp micro-tick

      // Quick snappy pitch bend (880Hz to 1320Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.exponentialRampToValueAtTime(1320, startTime + duration);

      // Low default volume envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.06, startTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        this.activeVoices = Math.max(0, this.activeVoices - 1);
      };
    } catch {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    }
  }

  public playPressClack(): void {
    if (!this.isEnabled) return;
    if (this.activeVoices >= this.maxVoices) return;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.activeVoices++;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      const duration = 0.075; // 75ms punchy button pop

      // Punchy arcade game down-pitch (320Hz down to 110Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(110, startTime + duration);

      // Volume envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        this.activeVoices = Math.max(0, this.activeVoices - 1);
      };
    } catch {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    }
  }

  public playToggleChime(enabling: boolean): void {
    // Only play if audio context is initialized
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      const duration = 0.12;

      osc.type = 'sine';
      if (enabling) {
        osc.frequency.setValueAtTime(523.25, startTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, startTime + duration); // G5
      } else {
        osc.frequency.setValueAtTime(659.25, startTime); // E5
        osc.frequency.exponentialRampToValueAtTime(392.00, startTime + duration); // G4
      }

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.09, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Audio context might be restricted
    }
  }
}

export const uiAudio = new UIAudioEngine();
