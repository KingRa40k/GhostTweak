import { getPreferences, savePreferences } from './theme';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getEffectiveVolume(): number {
  const prefs = getPreferences();
  if (prefs.soundStyle === 'mute') return 0;
  return Math.max(0, Math.min(100, prefs.soundVolume || 80)) / 100;
}

export function getSoundEnabled(): boolean {
  const prefs = getPreferences();
  return prefs.soundStyle !== 'mute';
}

export function setSoundEnabled(enabled: boolean): void {
  const prefs = getPreferences();
  const nextStyle = enabled ? (prefs.soundStyle === 'mute' ? 'mechanical' : prefs.soundStyle) : 'mute';
  savePreferences({ ...prefs, soundStyle: nextStyle });
}

export function playSwitch(enabled: boolean = true): void {
  const vol = getEffectiveVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const prefs = getPreferences();
  const now = ctx.currentTime;

  if (prefs.soundStyle === 'mechanical') {
    // Tactile mechanical keyboard switch click + bottom-out thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(enabled ? 1400 : 900, now);
    osc.frequency.exponentialRampToValueAtTime(enabled ? 180 : 120, now + 0.035);

    gain.gain.setValueAtTime(0.25 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  } else if (prefs.soundStyle === 'scifi') {
    // Futuristic cybernetic pulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = enabled ? 520 : 880;
    const endFreq = enabled ? 1280 : 440;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

    gain.gain.setValueAtTime(0.18 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (prefs.soundStyle === 'soft') {
    // Subtle, muted acoustic blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(enabled ? 640 : 480, now);
    gain.gain.setValueAtTime(0.12 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }
}

export function playClick(): void {
  const vol = getEffectiveVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1100, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

  gain.gain.setValueAtTime(0.15 * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

export function playTurbo(): void {
  const vol = getEffectiveVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Deep power-up sweep with resonant sub-harmonics
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);

  // Filter sweep
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(4000, now + 0.25);

  gain.gain.setValueAtTime(0.22 * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.32);
}

export function playSuccess(): void {
  const vol = getEffectiveVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Harmonious high-tech two-tone chime
  [0, 0.08].forEach((delay, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + delay;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(idx === 0 ? 659.25 : 880, t); // E5 -> A5

    gain.gain.setValueAtTime(0.18 * vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}

export function playBlip(): void {
  const vol = getEffectiveVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  gain.gain.setValueAtTime(0.12 * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

