/*
 * හඳ මාමා කතන්දර — soft sounds made in code (no audio files to download)
 * rustle: a page turning · pop: a gentle tap · chime: a happy moment · plop: a pebble in water
 */
(function () {
  'use strict';
  let ctx = null;
  let enabled = true;
  let noise = null;

  function ac() {
    if (!enabled) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  function noiseBuffer(c) {
    if (noise) return noise;
    const len = c.sampleRate * 0.8;
    noise = c.createBuffer(1, len, c.sampleRate);
    const d = noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { // soft brown-ish noise sounds more like paper
      const w = Math.random() * 2 - 1;
      last = (last + 0.06 * w) / 1.06;
      d[i] = last * 3.2 + w * 0.25;
    }
    return noise;
  }

  function rustle() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const src = c.createBufferSource(); src.buffer = noiseBuffer(c);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(900, t); bp.frequency.linearRampToValueAtTime(3200, t + 0.35); bp.frequency.linearRampToValueAtTime(1400, t + 0.7);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t, Math.random() * 0.1); src.stop(t + 0.8);
  }

  function tone(freq, freq2, dur, vol, type) {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (freq2) o.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }

  const api = {
    rustle,
    pop() { tone(620, 300, 0.14, 0.12); },
    plop() { tone(420, 110, 0.18, 0.16); setTimeout(() => tone(900, 600, 0.08, 0.04), 60); },
    chime() { tone(784, null, 0.9, 0.06); setTimeout(() => tone(1175, null, 0.9, 0.05), 110); setTimeout(() => tone(1568, null, 1.1, 0.04), 220); },
    setEnabled(v) { enabled = !!v; if (!enabled && ctx) ctx.suspend(); },
    get enabled() { return enabled; },
  };
  window.HM_SOUND = api;
})();
