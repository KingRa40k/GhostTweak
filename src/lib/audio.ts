// Audio feedback disabled per user request (no click / press sounds)

let isMuted = true;

export function isSoundMuted(): boolean {
  return true;
}

export function setSoundMuted(_muted: boolean): void {
  isMuted = true;
}

export function playKeyBlip(): void {}
export function playHoverTick(): void {}
export function playLaserSweep(): void {}
export function playSuccessChime(): void {}
export function playErrorTone(): void {}
