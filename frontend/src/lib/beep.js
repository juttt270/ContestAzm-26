let audioCtx;

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(ctx, startTime, frequency, duration, type = "sine", peak = 0.6) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/** Audible gate-scan cue — one sharp tone for a valid pass, four rapid alarm beeps for a rejected/invalid one. */
export function playScanFeedback(success) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    if (success) {
      tone(ctx, now, 1800, 0.14, "triangle", 0.7);
    } else {
      const spacing = 0.14;
      for (let i = 0; i < 4; i++) {
        tone(ctx, now + i * spacing, 620, 0.09, "square", 0.55);
      }
    }
  } catch {
    // Audio is a convenience cue, never allowed to block the actual gate scan flow.
  }
}
