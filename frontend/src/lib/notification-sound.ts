// ponytail: two-tone chime synthesized with Web Audio, no audio asset/dependency needed.
let ctx: AudioContext | null = null;

export const playNotificationSound = () => {
  try {
    ctx ??= new AudioContext();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.15);
    playTone(1318.5, now + 0.1, 0.2);
  } catch {
    // ponytail: autoplay-blocked or unsupported browser — silently skip, toast still shows.
  }
};
