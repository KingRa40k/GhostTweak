// Audio disabled per user request (no click / press sounds)

class SoundEngine {
  playHoverTick() {}
  playPurgeWhoosh() {}
  playSuccessChime() {}
  playThemeBlip() {}
}

export const sound = new SoundEngine();
