// Efeitos sonoros sintetizados com Web Audio (sem arquivos de áudio).
// Os "cues" ficam amarrados aos mesmos tempos das animações em film.js.
import { SCENES } from './film.js'

let ctx = null
let bus = null          // mistura de todos os sons
let speaker = null      // saída para os alto-falantes (respeita o mudo)
let recordDest = null   // saída para a gravação (sempre com som)
let muted = false
let musicBus = null
let musicOn = true

export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    bus = ctx.createGain(); bus.gain.value = 0.9
    const comp = ctx.createDynamicsCompressor()
    speaker = ctx.createGain(); speaker.gain.value = muted ? 0 : 1
    recordDest = ctx.createMediaStreamDestination()
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(bus)
    bus.connect(comp); comp.connect(speaker); comp.connect(recordDest)
    speaker.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}
export function setMuted(value) {
  muted = value
  if (speaker && ctx) speaker.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.02)
}
export function setMusic(value) { musicOn = value }

export function recordingTrack() {
  unlockAudio()
  return recordDest ? recordDest.stream.getAudioTracks()[0] : null
}

// ---------- síntese ----------
function env(g, t0, attack, dur, peak) {
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
}
function tone(freq, dur, { type = 'sine', gain = 0.2, to = null, delay = 0, attack = 0.005, out = null } = {}) {
  const t0 = ctx.currentTime + delay
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  env(g, t0, attack, dur, gain)
  o.connect(g); g.connect(out || bus)
  o.start(t0); o.stop(t0 + dur + 0.05)
}
let noiseBuf = null
function noise(dur, { type = 'bandpass', f0 = 1000, f1 = null, q = 1, gain = 0.2, delay = 0, attack = 0.005, out = null } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const t0 = ctx.currentTime + delay
  const s = ctx.createBufferSource(); s.buffer = noiseBuf
  const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q
  f.frequency.setValueAtTime(f0, t0)
  if (f1) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur)
  const g = ctx.createGain()
  env(g, t0, attack, dur, gain)
  s.connect(f); f.connect(g); g.connect(out || bus)
  s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05)
}

const NOTE = { c5: 523.25, e5: 659.25, g5: 783.99, a5: 880, c6: 1046.5, e6: 1318.5, g4: 392, c4: 261.63 }

const SFX = {
  key(v = 0) { noise(0.03, { type: 'highpass', f0: 2500, gain: 0.07 }); tone(1500 + v * 140, 0.035, { type: 'square', gain: 0.025 }) },
  click() { tone(900, 0.06, { to: 380, gain: 0.16, type: 'triangle' }); noise(0.03, { type: 'highpass', f0: 3000, gain: 0.08 }) },
  tick() { tone(1350, 0.05, { gain: 0.07, type: 'triangle' }) },
  pop() { tone(480, 0.13, { to: 780, gain: 0.17 }) },
  blip() { tone(880, 0.09, { type: 'triangle', gain: 0.13 }) },
  whoosh() { noise(0.55, { f0: 250, f1: 2600, q: 0.8, gain: 0.2, attack: 0.18 }) },
  swoosh() { noise(0.4, { f0: 3000, f1: 400, q: 0.7, gain: 0.1, attack: 0.1 }) },
  riser() { tone(160, 1.1, { to: 900, gain: 0.1, type: 'sawtooth', attack: 0.7 }); noise(1.0, { f0: 400, f1: 4000, gain: 0.07, attack: 0.8 }) },
  hit() { tone(130, 0.7, { to: 42, gain: 0.5 }); noise(0.25, { type: 'lowpass', f0: 1800, f1: 200, gain: 0.25 }) },
  note(f = NOTE.c5) { tone(f, 0.45, { gain: 0.14 }); tone(f * 2, 0.3, { gain: 0.04 }) },
  chimeMint() { SFX.note(NOTE.e5) },
  chimeBlue() { SFX.note(NOTE.g5) },
  chimeViolet() { SFX.note(NOTE.c6) },
  done() { tone(NOTE.e5, 0.2, { gain: 0.13 }); tone(NOTE.a5, 0.35, { gain: 0.13, delay: 0.1 }) },
  write() { tone(620, 0.07, { type: 'triangle', gain: 0.1 }); tone(930, 0.09, { type: 'triangle', gain: 0.07, delay: 0.05 }) },
  strike() { noise(0.18, { type: 'highpass', f0: 1800, f1: 6000, gain: 0.14, attack: 0.02 }) },
  warn() { tone(330, 0.3, { type: 'triangle', gain: 0.12 }); tone(247, 0.4, { type: 'triangle', gain: 0.1, delay: 0.12 }) },
  success() { [NOTE.c5, NOTE.e5, NOTE.g5, NOTE.c6].forEach((f, i) => tone(f, 0.5, { gain: 0.12, delay: i * 0.09 })) },
  finale() {
    ;[NOTE.c4, NOTE.g4, NOTE.c5, NOTE.e5, NOTE.g5].forEach((f, i) => tone(f, 1.6, { gain: 0.1, type: 'triangle', delay: i * 0.05 }))
    tone(NOTE.c6, 1.8, { gain: 0.08, delay: 0.2 })
  },
}


// ---------- música de fundo (gerada em código, sincronizada com o tempo do vídeo) ----------
const BPM = 96
const EIGHTH = 60 / BPM / 2
const midi = (n) => 440 * 2 ** ((n - 69) / 12)
// Am – F – C – G (tom de A menor, clima calmo e tecnológico)
const BARS = [
  { bass: 45, chord: [57, 60, 64] },
  { bass: 41, chord: [53, 57, 60] },
  { bass: 48, chord: [55, 60, 64] },
  { bass: 43, chord: [55, 59, 62] },
]
const ARP = [0, 1, 2, 1, 2, 1, 0, 1]
const MUSIC_LEVEL = 0.5
let scheduledUntil = 0
let musicRunning = false

function musicLevel(t, total) {
  return Math.min(1, t / 1.5) * Math.min(1, Math.max(0, (total - t) / 2.5))
}
function musicStep(k, delay, lvl) {
  const bar = Math.floor(k / 8)
  const w = k % 8
  const { bass, chord } = BARS[bar % 4]
  const o = { out: musicBus, delay }
  if (w === 0) {
    chord.forEach((n) => tone(midi(n), EIGHTH * 8.2, { ...o, type: 'triangle', gain: 0.05 * lvl, attack: 0.5 }))
    tone(midi(bass), EIGHTH * 3.5, { ...o, gain: 0.2 * lvl, attack: 0.02 })
  }
  if (w === 4) tone(midi(bass), EIGHTH * 3, { ...o, gain: 0.14 * lvl, attack: 0.02 })
  if (bar >= 1) tone(midi(chord[ARP[w]] + 12), EIGHTH * 2.2, { ...o, type: 'triangle', gain: 0.06 * lvl, attack: 0.004 })
  if (bar >= 3 && (w === 0 || w === 4)) tone(95, 0.22, { ...o, to: 42, gain: 0.22 * lvl })
  if (bar >= 2 && w % 2 === 1) noise(0.04, { ...o, type: 'highpass', f0: 7000, gain: 0.05 * lvl })
}

// Chame a cada quadro: agenda as notas dos próximos 0,4 s enquanto o vídeo toca.
export function advanceMusic(prev, now, playing, total) {
  if (!ctx || !musicBus || ctx.state !== 'running') return
  const active = playing && musicOn
  musicBus.gain.setTargetAtTime(active ? MUSIC_LEVEL : 0, ctx.currentTime, active ? 0.08 : 0.03)
  if (!active) { musicRunning = false; return }
  const dt = now - prev
  if (!musicRunning || dt <= 0 || dt > 0.35) { scheduledUntil = now; musicRunning = true }
  const horizon = Math.min(now + 0.4, total)
  let k = Math.ceil(scheduledUntil / EIGHTH - 1e-9)
  for (; k * EIGHTH < horizon; k++) {
    const t = k * EIGHTH
    if (t < now - 0.05) continue
    musicStep(k, Math.max(0, t - now), musicLevel(t, total))
  }
  scheduledUntil = Math.max(scheduledUntil, k * EIGHTH)
}

// ---------- cues por cena (tempo local, em segundos) ----------
const LOCAL = [
  // 0 abertura
  [[0.2, 'riser'], [0.95, 'hit'], [1.75, 'tick'], [2.35, 'tick']],
  // 1 pedido
  [[0, 'swoosh'], ...Array.from({ length: 41 }, (_, i) => [1.0 + i / 16, 'key', i % 5]), [3.5, 'click'], [3.8, 'whoosh'],
    [4.3, 'pop'], [4.65, 'pop'], [5.0, 'pop'], [5.35, 'done']],
  // 2 jev
  [[0, 'swoosh'],
    ...[0, 1, 2].flatMap((i) => [[i * 2 + 0.05, 'pop'], [i * 2 + 0.45, 'blip'], [i * 2 + 0.95, ['chimeMint', 'chimeBlue', 'chimeViolet'][i]]])],
  // 3 equipe
  [[0, 'swoosh'], [0.3, 'pop'], [0.95, 'pop'], [1.35, 'pop'], [1.75, 'pop'], [3.0, 'blip'],
    [3.4, 'done'], [3.9, 'done'], [4.4, 'done'], [4.6, 'pop'], [5.0, 'success']],
  // 4 pasta
  [[0, 'swoosh'], [0.9, 'write'], [1.5, 'write'], [2.1, 'write'], [2.7, 'write'], [3.2, 'whoosh'],
    ...[0, 1, 2, 3].flatMap((i) => [[3.8 + i * 0.25, 'pop'], [4.6 + i * 0.25, 'strike']]), [5.2, 'success']],
  // 5 terminal
  [[0, 'swoosh'], ...Array.from({ length: 8 }, (_, i) => [0.8 + i / 9, 'key', i % 5]), [1.8, 'click'],
    ...Array.from({ length: 6 }, (_, i) => [2.0 + i * 0.35, 'tick']), [4.1, 'done'],
    [1.2, 'pop'], [1.9, 'pop'], [2.6, 'pop']],
  // 6 contas
  [[0, 'swoosh'], [0.6, 'whoosh'], [1.1, 'whoosh'], [1.6, 'pop'],
    ...[0, 1].flatMap((i) => [0, 1, 2].map((k) => [1.4 + i * 0.5 + k * 0.35 + 0.1, 'tick'])), [3.6, 'warn']],
  // 7 final
  [[0, 'hit'], [0.5, 'chimeViolet'], [1.0, 'hit'], [1.8, 'pop'], [2.5, 'finale']],
]
const CUES = LOCAL.flatMap((list, i) => list.map(([t, name, v]) => ({ at: SCENES[i].at + t, name, v })))
  .sort((a, b) => a.at - b.at)

// Chame a cada quadro com o tempo anterior e o atual. Só toca em reprodução contínua.
export function advanceSound(prev, now, playing) {
  if (!ctx || !playing || ctx.state !== 'running') return
  const dt = now - prev
  if (dt <= 0 || dt > 0.35) return
  for (const cue of CUES) {
    if (cue.at > now) break
    if (cue.at > prev) SFX[cue.name]?.(cue.v)
  }
}
