// ═══════════════════════════════════════════════════════════════════════════
// Pawprint Network — Realistic Animal Sound Synthesizer v3.0
// 
// Architecture: each sound is a multi-layer synthesis chain modeling
// the physical acoustics of real cat/dog vocalizations:
//   • Glottal source (oscillator stack) — the vocal fold vibration
//   • Vocal tract filter (formant chain) — mouth/throat shaping
//   • Breathiness layer (filtered noise) — turbulent airflow
//   • Subharmonic (period doubling) — chest resonance in dogs
//   • Tremolo/vibrato LFO — natural pitch/amplitude variation
// ═══════════════════════════════════════════════════════════════════════════

let _ctx: AudioContext | null = null;
let _muted = false;
let _masterVol = 0.85;

function ctx(): AudioContext {
  if (!_ctx) {
    const AC = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _ctx = new AC();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

export function setAudioMuted(m: boolean) { _muted = m; }
export function getAudioMuted() { return _muted; }
export function setMasterVolume(v: number) { _masterVol = Math.max(0, Math.min(1, v)); }

// ─── Core node builders ──────────────────────────────────────────────────────

function osc(type: OscillatorType, freq: number): OscillatorNode {
  const o = ctx().createOscillator();
  o.type = type;
  o.frequency.value = freq;
  return o;
}

function gain(v: number): GainNode {
  const g = ctx().createGain();
  g.gain.value = v;
  return g;
}

function bpf(freq: number, q: number): BiquadFilterNode {
  const f = ctx().createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function lpf(freq: number, q = 0.7): BiquadFilterNode {
  const f = ctx().createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function hpf(freq: number, q = 0.7): BiquadFilterNode {
  const f = ctx().createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function noise(dur: number): AudioBufferSourceNode {
  const c = ctx();
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function waveshaper(amount: number): WaveShaperNode {
  const ws = ctx().createWaveShaper();
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  ws.curve = curve;
  ws.oversample = '4x';
  return ws;
}

function out(): GainNode {
  const g = gain(_masterVol);
  g.connect(ctx().destination);
  return g;
}

// Exponential ramp helper — clamps to min 0.001 to avoid log(0)
function ramp(param: AudioParam, target: number, time: number) {
  param.exponentialRampToValueAtTime(Math.max(0.0001, target), time);
}

// ─── CAT SOUNDS ──────────────────────────────────────────────────────────────

/**
 * MEOW — full formant synthesis
 * M-consonant noise attack → "ee" vowel → "ow" vowel → tail vibrato
 */
export function playMeowSound(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const p = pitch;
  const master = out();

  // Pitch arc: M-attack → ee-peak → ow-body → tail drop
  const F0 = [480, 860, 380, 310].map(f => f * p);

  // Carrier stack (fundamental + harmonics for timbral richness)
  const carr  = osc('sine', F0[0]);
  const h2    = osc('sine', F0[0] * 2.01);
  const h3    = osc('sine', F0[0] * 3.02);
  const h4    = osc('sine', F0[0] * 4.00);

  [carr, h2, h3, h4].forEach((o, i) => {
    const mult = [1, 2.01, 3.02, 4.00][i];
    ramp(o.frequency, F0[1] * mult, t + 0.08);
    ramp(o.frequency, F0[2] * mult, t + 0.26);
    ramp(o.frequency, F0[3] * mult, t + 0.50);
  });

  // Vibrato LFO — kicks in during the "ow" tail
  const vibLFO  = osc('sine', 5.8);
  const vibGain = gain(0);
  vibGain.gain.linearRampToValueAtTime(0,            t + 0.22);
  vibGain.gain.linearRampToValueAtTime(22 * p,       t + 0.33);
  vibGain.gain.linearRampToValueAtTime(14 * p,       t + 0.52);
  vibLFO.connect(vibGain);
  vibGain.connect(carr.frequency);
  vibGain.connect(h2.frequency);

  // Formant 1 — main vowel shaping
  const f1 = bpf(2100, 2.8);
  f1.frequency.setValueAtTime(2100, t);
  ramp(f1.frequency, 1100, t + 0.14);
  ramp(f1.frequency, 600,  t + 0.38);

  // Formant 2 — secondary resonance
  const f2 = bpf(900, 1.8);
  f2.frequency.setValueAtTime(900, t);
  ramp(f2.frequency, 450, t + 0.30);

  // Harmonic gains
  const gH2 = gain(0.38), gH3 = gain(0.14), gH4 = gain(0.06);

  // Breath noise — the "M" consonant puff at attack
  const breath   = noise(0.07);
  const bFilt    = lpf(3200);
  const bGain    = gain(0.001);
  bGain.gain.linearRampToValueAtTime(0.055, t + 0.015);
  ramp(bGain.gain, 0.001, t + 0.07);
  breath.connect(bFilt); bFilt.connect(bGain); bGain.connect(master);

  // Amplitude envelope
  const env = gain(0.001);
  env.gain.linearRampToValueAtTime(0.30,  t + 0.055);
  env.gain.setValueAtTime(0.28,           t + 0.18);
  ramp(env.gain, 0.001,                   t + 0.55);

  carr.connect(f1); carr.connect(f2);
  h2.connect(gH2); gH2.connect(f1);
  h3.connect(gH3); gH3.connect(f1);
  h4.connect(gH4); gH4.connect(f1);
  f1.connect(env); f2.connect(env);
  env.connect(master);

  [vibLFO, carr, h2, h3, h4].forEach(o => { o.start(t); o.stop(t + 0.58); });
  breath.start(t); breath.stop(t + 0.08);
}

/**
 * HISS — turbulent broadband noise through resonant tract
 * Sharp attack, sustained friction, fast decay
 */
export function playCatHiss(intensity = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const dur = 0.6 + intensity * 0.3;
  const master = out();

  // Core hiss: white noise → highpass → resonant bandpass
  const n1 = noise(dur);
  const hp  = hpf(2000, 1.0);
  const res = bpf(3500, 3.5);
  const nG  = gain(0.001);
  nG.gain.linearRampToValueAtTime(0.45 * intensity, t + 0.018);
  nG.gain.setValueAtTime(0.42 * intensity,           t + dur * 0.6);
  ramp(nG.gain, 0.001,                               t + dur);

  // High-frequency sibilance layer
  const n2   = noise(dur);
  const sib  = bpf(6500, 2.0);
  const sibG = gain(0.001);
  sibG.gain.linearRampToValueAtTime(0.15 * intensity, t + 0.020);
  ramp(sibG.gain, 0.001,                              t + dur);

  // Sub-tone — the chest rumble beneath the hiss
  const sub  = osc('sawtooth', 95);
  const subF = lpf(300, 4.0);
  const subG = gain(0.001);
  subG.gain.linearRampToValueAtTime(0.10, t + 0.04);
  ramp(subG.gain, 0.001,                  t + dur * 0.7);

  n1.connect(hp); hp.connect(res); res.connect(nG); nG.connect(master);
  n2.connect(sib); sib.connect(sibG); sibG.connect(master);
  sub.connect(subF); subF.connect(subG); subG.connect(master);

  n1.start(t); n1.stop(t + dur);
  n2.start(t); n2.stop(t + dur);
  sub.start(t); sub.stop(t + dur);
}

/**
 * PURR — amplitude-modulated dual oscillator + resonant chest
 * 20–30 Hz modulation rate, real cat purr frequency band
 */
export function playPurrSound(duration = 1.2) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const master = out();

  // Detuned fundamental pair for thickness
  const o1 = osc('sawtooth', 27);
  const o2 = osc('sawtooth', 31);
  const o3 = osc('sine', 54); // octave — warmth

  // Purr rate LFO at 25Hz (middle of 20–30Hz cat purr range)
  const lfo  = osc('sine', 25);
  const lfoG = gain(0.11);
  lfo.connect(lfoG);

  // Chest resonance filter
  const chest = bpf(180, 5.0);

  // Warm low-pass shaping
  const warm = lpf(380, 3.2);

  // Amplitude envelope
  const env = gain(0.001);
  env.gain.linearRampToValueAtTime(0.14,  t + 0.20);
  env.gain.linearRampToValueAtTime(0.12,  t + duration * 0.75);
  ramp(env.gain, 0.001,                   t + duration);
  lfoG.connect(env.gain); // modulate amplitude at purr rate

  const g3 = gain(0.3);
  o1.connect(warm); o2.connect(warm);
  o3.connect(g3); g3.connect(warm);
  warm.connect(chest); chest.connect(env);
  env.connect(master);

  [lfo, o1, o2, o3].forEach(o => { o.start(t); o.stop(t + duration + 0.05); });
}

/**
 * CHIRP — the bird-watching trill
 * Fast frequency modulation simulating the stutter-chirp cats make at birds
 */
export function playCatChirp(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const master = out();
  const p = pitch;

  // 6 rapid chirp pulses
  for (let i = 0; i < 6; i++) {
    const delay = i * 0.055;
    const freq  = (900 + i * 40) * p;

    const o   = osc('sine', freq);
    const env = gain(0.001);
    env.gain.linearRampToValueAtTime(0.22, t + delay + 0.010);
    ramp(env.gain, 0.001,                  t + delay + 0.045);

    // Fast up-glide on each pulse
    ramp(o.frequency, freq * 1.18, t + delay + 0.025);

    o.connect(env); env.connect(master);
    o.start(t + delay); o.stop(t + delay + 0.05);
  }
}

/**
 * GROWL — deep territorial warning
 * Sub-bass drone + period-doubling noise, harsh waveshaper
 */
export function playCatGrowl(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const dur = 0.9;
  const master = out();
  const p = pitch;

  const fund = osc('sawtooth', 110 * p);
  ramp(fund.frequency, 80 * p, t + dur);

  const sub = osc('sawtooth', 55 * p);
  ramp(sub.frequency, 40 * p, t + dur);

  const ws  = waveshaper(18);
  const flt = lpf(600, 2.5);
  const env = gain(0.001);
  env.gain.linearRampToValueAtTime(0.28, t + 0.08);
  env.gain.setValueAtTime(0.25,          t + dur * 0.6);
  ramp(env.gain, 0.001,                  t + dur);

  const gSub = gain(0.4);
  fund.connect(ws); ws.connect(flt);
  sub.connect(gSub); gSub.connect(flt);
  flt.connect(env); env.connect(master);

  [fund, sub].forEach(o => { o.start(t); o.stop(t + dur); });
}

/**
 * TRILL — the affectionate greeting "mrrp" or "brrrp"
 * Brief, rapidly modulated, soft and friendly
 */
export function playCatTrill(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const master = out();
  const p = pitch;

  const o   = osc('sine', 550 * p);
  // Rapid freq wobble (rolling-R quality)
  const tLFO  = osc('sine', 28);
  const tGain = gain(90 * p);
  tLFO.connect(tGain);
  tGain.connect(o.frequency);

  ramp(o.frequency, 680 * p, t + 0.06);
  ramp(o.frequency, 500 * p, t + 0.16);

  const f1  = bpf(1200, 2.0);
  const env = gain(0.001);
  env.gain.linearRampToValueAtTime(0.18, t + 0.03);
  ramp(env.gain, 0.001,                  t + 0.22);

  o.connect(f1); f1.connect(env); env.connect(master);
  [tLFO, o].forEach(x => { x.start(t); x.stop(t + 0.25); });
}

// ─── DOG SOUNDS ──────────────────────────────────────────────────────────────

/**
 * WOOF — realistic multi-layer bark
 * Noise burst (air) + sawtooth (tonal body) + sub (chest thump) + waveshaper grit
 */
export function playWoofSound(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const dur = 0.34;
  const master = out();
  const p = pitch;

  // Tonal body — shaped pitch drop
  const ton = osc('sawtooth', 290 * p);
  ramp(ton.frequency, 440 * p, t + 0.022);
  ramp(ton.frequency, 150 * p, t + 0.19);
  ramp(ton.frequency, 105 * p, t + 0.32);

  // Sub-bass chest thump
  const sub = osc('sine', 95 * p);
  ramp(sub.frequency, 58 * p, t + 0.14);

  // Burst noise — the "air" of the bark
  const n1   = noise(dur);
  const bpf1 = bpf(620 * p, 1.9);
  bpf1.frequency.setValueAtTime(620 * p, t);
  ramp(bpf1.frequency, 310 * p, t + 0.20);

  // High-freq crack at attack onset
  const n2   = noise(0.04);
  const bpf2 = bpf(3000, 2.5);

  // Waveshaper for vocal grit
  const ws = waveshaper(12);

  // Envelopes
  const nG  = gain(0.001);
  nG.gain.linearRampToValueAtTime(0.32, t + 0.014);
  ramp(nG.gain, 0.001,                  t + 0.31);

  const crackG = gain(0.001);
  crackG.gain.linearRampToValueAtTime(0.20, t + 0.008);
  ramp(crackG.gain, 0.001,                  t + 0.04);

  const tG = gain(0.001);
  tG.gain.linearRampToValueAtTime(0.34, t + 0.017);
  ramp(tG.gain, 0.001,                  t + 0.30);

  const sG = gain(0.001);
  sG.gain.linearRampToValueAtTime(0.26, t + 0.024);
  ramp(sG.gain, 0.001,                  t + 0.28);

  n1.connect(bpf1); bpf1.connect(nG); nG.connect(master);
  n2.connect(bpf2); bpf2.connect(crackG); crackG.connect(master);
  ton.connect(ws); ws.connect(tG); tG.connect(master);
  sub.connect(sG); sG.connect(master);

  n1.start(t); n1.stop(t + dur);
  n2.start(t); n2.stop(t + 0.045);
  ton.start(t); ton.stop(t + dur);
  sub.start(t); sub.stop(t + dur);
}

/**
 * HOWL — long ascending/descending vocal arc
 * Slow pitch glide, strong formants, tremolo for realism
 */
export function playDogHowl(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const dur = 2.0;
  const master = out();
  const p = pitch;

  const f0 = 280 * p;

  const fund  = osc('sawtooth', f0 * 0.8);
  const harm2 = osc('sine',     f0 * 1.6);
  const harm3 = osc('sine',     f0 * 2.4);

  // Howl pitch arc: start → rise → hold → fall → end
  [fund, harm2, harm3].forEach((o, i) => {
    const mult = [0.8, 1.6, 2.4][i];
    o.frequency.setValueAtTime(f0 * mult * 0.9,  t);
    ramp(o.frequency, f0 * mult * 1.25,           t + 0.4);
    o.frequency.setValueAtTime(f0 * mult * 1.22,  t + 0.9);
    ramp(o.frequency, f0 * mult * 0.95,           t + 1.6);
    ramp(o.frequency, f0 * mult * 0.80,           t + dur);
  });

  // Tremolo LFO at 5Hz
  const tremLFO  = osc('sine', 5.0);
  const tremGain = gain(0.06);
  tremLFO.connect(tremGain);

  // Formant shaping
  const form1 = bpf(900, 2.5);
  const form2 = bpf(1800, 1.8);

  const gH2 = gain(0.4), gH3 = gain(0.2);

  const env = gain(0.001);
  env.gain.linearRampToValueAtTime(0.28,  t + 0.15);
  env.gain.setValueAtTime(0.26,           t + 1.5);
  ramp(env.gain, 0.001,                   t + dur);
  tremGain.connect(env.gain);

  fund.connect(form1); fund.connect(form2);
  harm2.connect(gH2); gH2.connect(form1);
  harm3.connect(gH3); gH3.connect(form2);
  form1.connect(env); form2.connect(env);
  env.connect(master);

  [tremLFO, fund, harm2, harm3].forEach(o => { o.start(t); o.stop(t + dur + 0.05); });
}

/**
 * WHINE — soft pleading vocalization
 * High, thin, slightly nasalized, descending pitch
 */
export function playDogWhine(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const dur = 0.8;
  const master = out();
  const p = pitch;

  const o  = osc('sine', 820 * p);
  ramp(o.frequency, 680 * p, t + 0.3);
  ramp(o.frequency, 580 * p, t + 0.7);

  const h2  = osc('sine', 1640 * p);
  ramp(h2.frequency, 1360 * p, t + 0.5);

  // Nasal resonance filter
  const nasal = bpf(1100, 4.0);
  const gH2   = gain(0.18);

  const env = gain(0.001);
  env.gain.linearRampToValueAtTime(0.20, t + 0.06);
  env.gain.setValueAtTime(0.18,          t + 0.5);
  ramp(env.gain, 0.001,                  t + dur);

  o.connect(nasal); h2.connect(gH2); gH2.connect(nasal);
  nasal.connect(env); env.connect(master);
  [o, h2].forEach(x => { x.start(t); x.stop(t + dur); });
}

/**
 * GROWL (dog) — low territorial rumble
 * Deep, sustained, with period-doubling for menace
 */
export function playDogGrowl(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const dur = 1.1;
  const master = out();
  const p = pitch;

  const fund = osc('sawtooth', 120 * p);
  ramp(fund.frequency, 90 * p, t + dur);

  const sub = osc('sawtooth', 60 * p); // sub-octave for chest
  ramp(sub.frequency, 45 * p, t + dur);

  const n    = noise(dur);
  const nFlt = bpf(280 * p, 2.0);
  const nG   = gain(0.001);
  nG.gain.linearRampToValueAtTime(0.12, t + 0.08);
  ramp(nG.gain, 0.001,                  t + dur);

  const ws  = waveshaper(22);
  const flt = lpf(500, 3.0);

  const env = gain(0.001);
  env.gain.linearRampToValueAtTime(0.28, t + 0.10);
  env.gain.setValueAtTime(0.24,          t + dur * 0.7);
  ramp(env.gain, 0.001,                  t + dur);

  const gSub = gain(0.45);
  fund.connect(ws); ws.connect(flt);
  sub.connect(gSub); gSub.connect(flt);
  flt.connect(env); env.connect(master);
  n.connect(nFlt); nFlt.connect(nG); nG.connect(master);

  n.start(t);    n.stop(t + dur);
  fund.start(t); fund.stop(t + dur);
  sub.start(t);  sub.stop(t + dur);
}

/**
 * PLAYFUL BARK — short excited yip
 * Higher pitched, faster, multiple in quick succession
 */
export function playDogYip(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const master = out();
  const p = pitch;

  // Triple yip
  [0, 0.18, 0.36].forEach(delay => {
    const ton = osc('sawtooth', 480 * p);
    ramp(ton.frequency, 680 * p, t + delay + 0.015);
    ramp(ton.frequency, 320 * p, t + delay + 0.10);

    const n   = noise(0.12);
    const nF  = bpf(900 * p, 2.0);
    const nG  = gain(0.001);
    nG.gain.linearRampToValueAtTime(0.22, t + delay + 0.010);
    ramp(nG.gain, 0.001,                  t + delay + 0.12);

    const env = gain(0.001);
    env.gain.linearRampToValueAtTime(0.25, t + delay + 0.012);
    ramp(env.gain, 0.001,                  t + delay + 0.14);

    ton.connect(env); env.connect(master);
    n.connect(nF); nF.connect(nG); nG.connect(master);

    ton.start(t + delay); ton.stop(t + delay + 0.15);
    n.start(t + delay);   n.stop(t + delay + 0.13);
  });
}

/**
 * SNIFF — the investigation sound
 * Short rhythmic noise burst mimicking nasal air intake
 */
export function playDogSniff() {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const master = out();

  // 3 sniff pulses
  [0, 0.14, 0.28].forEach((delay, i) => {
    const n   = noise(0.11);
    const hp  = hpf(200);
    const lp  = lpf(1800);
    const env = gain(0.001);
    env.gain.linearRampToValueAtTime(0.18 - i * 0.03, t + delay + 0.008);
    ramp(env.gain, 0.001,                               t + delay + 0.10);

    n.connect(hp); hp.connect(lp); lp.connect(env); env.connect(master);
    n.start(t + delay); n.stop(t + delay + 0.12);
  });
}

// ─── SHARED SOUNDS ───────────────────────────────────────────────────────────

/**
 * TREAT CHIME — ascending bell triad (C5 → E5 → G5)
 * Each note: fundamental + two inharmonic partials for bell character
 */
export function playTreatSound(pitch = 1.0) {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const master = out();
  const p = pitch;

  [[523.25, 0.00], [659.25, 0.11], [783.99, 0.22]].forEach(([freq, delay]) => {
    [[1.00, 0.20], [2.756, 0.09], [5.404, 0.04]].forEach(([ratio, amp]) => {
      const o   = osc('sine', freq * p * ratio);
      const env = gain(0.001);
      env.gain.linearRampToValueAtTime(amp, t + delay + 0.007);
      ramp(env.gain, 0.001,                 t + delay + 0.45);
      o.connect(env); env.connect(master);
      o.start(t + delay); o.stop(t + delay + 0.48);
    });
  });
}

/**
 * NOTIFICATION POP — soft UI sound
 */
export function playNotifSound() {
  if (_muted) return;
  const c = ctx();
  const t = c.currentTime;
  const master = out();

  [0, 0.09].forEach((delay, i) => {
    const o   = osc('sine', i === 0 ? 880 : 1100);
    const env = gain(0.001);
    env.gain.linearRampToValueAtTime(0.12, t + delay + 0.005);
    ramp(env.gain, 0.001,                  t + delay + 0.12);
    o.connect(env); env.connect(master);
    o.start(t + delay); o.stop(t + delay + 0.14);
  });
}

// Legacy aliases — keeps existing component imports working unchanged
export { playMeowSound as playMeowSoundLegacy };
