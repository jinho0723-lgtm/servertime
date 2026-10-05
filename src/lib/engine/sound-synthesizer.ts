export type SoundType = "digital" | "voice" | "bell";

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastTickSecond: number = -1;

  public unlockAudio(): boolean {
    if (typeof window === "undefined") return false;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  private getAudioContext(): AudioContext | null {
    this.unlockAudio();
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Synthesizes an oscillator tone with attack and smooth decay
   */
  public playTone(
    freq: number,
    durationSec: number = 0.1,
    type: OscillatorType = "sine",
    volume: number = 0.25
  ) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch {}
  }

  /**
   * 10-second countdown tick with progressive urgency
   * - 10s to 6s: ascending warning pips (700Hz to 1100Hz)
   * - 5s to 1s: sharp high-tension double pulse (1300Hz to 2100Hz)
   * - 0s: rich chime fanfare
   */
  public playCountdownTick(remainingSec: number) {
    if (this.isMuted) return;

    // Prevent duplicate triggers within the same integer second
    if (this.lastTickSecond === remainingSec) return;
    this.lastTickSecond = remainingSec;

    if (remainingSec >= 6 && remainingSec <= 10) {
      // Ascending frequency: 10s -> 700Hz, 9s -> 780Hz, ..., 6s -> 1020Hz
      const freq = 700 + (10 - remainingSec) * 80;
      this.playTone(freq, 0.12, "triangle", 0.3);
    } else if (remainingSec >= 1 && remainingSec <= 5) {
      // Intense urgent alert: higher pitch + sub-pulse
      const freq = 1300 + (5 - remainingSec) * 160;
      this.playTone(freq, 0.08, "sine", 0.4);
      setTimeout(() => {
        this.playTone(freq * 1.25, 0.1, "triangle", 0.35);
      }, 70);
    } else if (remainingSec === 0) {
      this.playTargetOpenFanfare();
    }
  }

  /**
   * Triumphant open fanfare for 00 seconds:
   * Ascending arpeggio (C5 -> E5 -> G5 -> C6)
   */
  public playTargetOpenFanfare() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.35, "triangle", 0.4);
      }, idx * 80);
    });
  }

  /**
   * Standard single hour chime
   */
  public playHourChime() {
    this.playTargetOpenFanfare();
  }

  public resetTickGuard() {
    this.lastTickSecond = -1;
  }
}

export const soundSynthesizer = new SoundSynthesizer();
