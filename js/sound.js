(() => {
  let audioCtx;

  const tones = {
    pointAdd: [660, 820],
    pointRemove: [330],
    rankUp: [880, 1120],
    newLeader: [1040, 1310, 1560],
    sessionStart: [520, 690],
    sessionEnd: [480, 320]
  };

  function ensureCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function beep(freq, when, gain = 0.035, duration = 0.13) {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'triangle';
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(when);
    osc.stop(when + duration);
  }

  function play(name, enabled) {
    if (!enabled || !tones[name]) return;
    const ctx = ensureCtx();
    const start = ctx.currentTime;
    tones[name].forEach((freq, i) => beep(freq, start + i * 0.1));
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.sound = { play };
})();
