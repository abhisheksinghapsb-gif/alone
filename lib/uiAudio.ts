/**
 * GENESIS 6 — Native Web Audio Sound Engine
 * Provides restrained, tactile game-style UI feedback and character interaction audio.
 * Initial state: Muted. Activated only after explicit user interaction.
 * Rate-limited and voice-capped to prevent sound stacking.
 */

class UIAudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private lastHoverTime: number = 0;
  private lastActionTime: number = 0;
  private activeVoices: number = 0;
  private readonly maxVoices: number = 4;
  private readonly hoverThrottleMs: number = 70;
  private readonly actionThrottleMs: number = 180;

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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  /**
   * Crisp 45ms pitch sweep for button hover
   */
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
      const duration = 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.exponentialRampToValueAtTime(1320, startTime + duration);

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

  /**
   * Punchy 75ms down-pitch pop for button click
   */
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
      const duration = 0.075;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(110, startTime + duration);

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

  /**
   * Dual-tone toggle chime when sound is enabled or disabled
   */
  public playToggleChime(enabling: boolean): void {
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
        osc.frequency.exponentialRampToValueAtTime(392.0, startTime + duration); // G4
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

  /**
   * Gunslinger Colt blaster recoil sound: short retro sci-fi laser
   */
  public playColtBlaster(): void {
    if (!this.isEnabled) return;
    const now = performance.now();
    if (now - this.lastActionTime < this.actionThrottleMs) return;
    this.lastActionTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.activeVoices++;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      const duration = 0.14;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, startTime);
      osc.frequency.exponentialRampToValueAtTime(220, startTime + duration);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
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

  /**
   * Ninja Leon shuriken / ready swoosh: swift blade whoosh
   */
  public playNinjaSwoosh(): void {
    if (!this.isEnabled) return;
    const now = performance.now();
    if (now - this.lastActionTime < this.actionThrottleMs) return;
    this.lastActionTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.activeVoices++;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      const duration = 0.16;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, startTime);
      osc.frequency.exponentialRampToValueAtTime(950, startTime + 0.06);
      osc.frequency.exponentialRampToValueAtTime(320, startTime + duration);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, startTime);
      filter.Q.setValueAtTime(3, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.11, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);

      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
        this.activeVoices = Math.max(0, this.activeVoices - 1);
      };
    } catch {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    }
  }



  /**
   * Star-Skull Emblem activation: crisp, golden tactile resonant chime pop
   */
  public playEmblemAccent(): void {
    if (!this.isEnabled) return;
    const now = performance.now();
    if (now - this.lastActionTime < this.actionThrottleMs) return;
    this.lastActionTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.activeVoices++;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      const duration = 0.16;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, startTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, startTime + 0.05); // A5
      osc.frequency.exponentialRampToValueAtTime(440.0, startTime + duration); // A4

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.015);
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
}

export const uiAudio = new UIAudioEngine();
