import { useEffect, useRef, useState } from 'react'
import { DURATION, SCENES, renderFrame } from './film.js'
import Landing from './Landing.jsx'
import { advanceMusic, advanceSound, recordingTrack, setMuted as setAudioMuted, setMusic, unlockAudio } from './sound.js'

export default function App() {
  const canvasRef = useRef(null)
  const startAt = Number(new URLSearchParams(window.location.search).get('t')) || 0
  const clockRef = useRef({ time: startAt, playing: false, last: 0 })
  const [time, setTime] = useState(startAt)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(Boolean(startAt))
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [muted, setMuted] = useState(false)
  const [music, setMusicState] = useState(true)

  useEffect(() => {
    let raf
    const tick = (now) => {
      const clock = clockRef.current
      const before = clock.time
      if (clock.playing && clock.last) {
        clock.time = Math.min(DURATION, clock.time + (now - clock.last) / 1000)
        if (clock.time >= DURATION) {
          clock.playing = false
          setPlaying(false)
        }
      }
      clock.last = now
      advanceSound(before, clock.time, clock.playing)
      advanceMusic(before, clock.time, clock.playing, DURATION)
      renderFrame(canvasRef.current, clock.time)
      setTime(clock.time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Navegadores só liberam o áudio depois de um gesto do usuário.
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock) }
  }, [])
  const toggleMusic = () => { setMusic(!music); setMusicState(!music) }
  const toggleMute = () => { setAudioMuted(!muted); setMuted(!muted) }

  // Pausa sozinho quando o player sai da tela (economiza CPU ao rolar a landing).
  const playerRef = useRef(null)
  const exportingRef = useRef(false)
  useEffect(() => { exportingRef.current = exporting }, [exporting])
  useEffect(() => {
    const el = playerRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => {
      const clock = clockRef.current
      if (!entry.isIntersecting && clock.playing && !exportingRef.current) {
        clock.playing = false
        setPlaying(false)
      }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Atalhos: espaço/K = play/pausa, ←/→ = 5 s, 0 = reiniciar.
  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.('input, textarea, button, summary, a') && event.key === ' ') return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const rect = playerRef.current?.getBoundingClientRect()
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return
      const clock = clockRef.current
      if (event.key === ' ' || event.key === 'k') { event.preventDefault(); togglePlayRef.current() }
      else if (event.key === 'ArrowRight') { event.preventDefault(); seek(Math.min(DURATION, clock.time + 5)) }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); seek(Math.max(0, clock.time - 5)) }
      else if (event.key === '0' || event.key === 'Home') { seek(0) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const seek = (value) => {
    clockRef.current.time = Number(value)
    clockRef.current.last = performance.now()
    setTime(Number(value))
  }

  const togglePlay = () => {
    unlockAudio()
    setStarted(true)
    const clock = clockRef.current
    if (clock.time >= DURATION) clock.time = 0
    clock.playing = !clock.playing
    clock.last = performance.now()
    setPlaying(clock.playing)
  }
  const togglePlayRef = useRef(togglePlay)
  togglePlayRef.current = togglePlay

  const exportVideo = () => {
    if (!window.MediaRecorder || !canvasRef.current?.captureStream) {
      setError('Este navegador não oferece gravação de canvas. Abra no Chrome ou Edge atualizado.')
      return
    }
    const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      .find((type) => MediaRecorder.isTypeSupported(type))
    if (!mimeType) {
      setError('A exportação WebM não é compatível com este navegador.')
      return
    }
    setError('')
    const chunks = []
    unlockAudio()
    const stream = canvasRef.current.captureStream(30)
    const audioTrack = recordingTrack()
    if (audioTrack) stream.addTrack(audioTrack)
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 })
    clockRef.current.time = 0
    clockRef.current.playing = true
    clockRef.current.last = performance.now()
    setPlaying(true)
    setExporting(true)
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    recorder.onerror = () => {
      setError('Não foi possível gravar o vídeo. Tente novamente.')
      setExporting(false)
      stream.getTracks().forEach((track) => track.stop())
    }
    recorder.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks, { type: mimeType }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'claudex-apresentacao.webm'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 60000)
      stream.getTracks().forEach((track) => track.stop())
      setExporting(false)
    }
    recorder.start(1000)
    setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, (DURATION + 0.25) * 1000)
  }

  const ended = !playing && !exporting && time >= DURATION - 0.01
  const current = SCENES.findLast((scene) => time >= scene.at - 0.001) || SCENES[0]

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#video" aria-label="Claudex, voltar ao topo"><span className="brand-mark">✳</span><span>CLAUDEX</span></a>
        <nav className="topnav" aria-label="Seções">
          <a href="#video">Vídeo</a>
          <a href="#recursos">Recursos</a>
          <a href="#modelos">Modelos</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#faq">FAQ</a>
          <a className="topnav-cta" href="#comecar">COMEÇAR</a>
        </nav>
      </header>
      <div className="content" id="video">
        <div className="project-header">
          <div><div className="eyebrow">PROJETO / 01</div><h1>Claudex <span>em movimento.</span></h1><p>Escreva o pedido, o Jev escolhe o modelo e uma equipe trabalha direto na sua pasta.</p></div>
          <a className="repo-link" href="https://github.com/DiegoHerreraDaSilva/claudex" target="_blank" rel="noreferrer">VER REPOSITÓRIO ↗</a>
        </div>
        <section className="player" ref={playerRef} aria-label="Vídeo de apresentação do Claudex">
          <canvas ref={canvasRef} width="1920" height="1080" aria-label={`Cena: ${current.label}`} />
          <div className="player-tag">CLAUDEX / FILM 01</div>
          {!started && (
            <button className="player-start" onClick={togglePlay} aria-label="Iniciar vídeo com som">
              <span className="player-start-icon">▶</span>
              <span>INICIAR COM SOM</span>
              <small>Efeitos e música ligados</small>
            </button>
          )}
          {ended && (
            <div className="player-end">
              <button className="end-replay" onClick={togglePlay}>↺ ASSISTIR DE NOVO</button>
              <a className="end-next" href="#recursos">CONHEÇA O CLAUDEX ↓</a>
            </div>
          )}
          <div className="player-scene">{String(SCENES.indexOf(current) + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')} &nbsp; {current.label}</div>
        </section>
        <div className="controls">
          <button className="play-button" onClick={togglePlay} aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}>{playing ? 'Ⅱ' : '▶'}</button>
          <div className="timecode">{formatTime(time)} <span>/ {formatTime(DURATION)}</span></div>
          <input className="scrubber" aria-label="Posição do vídeo" type="range" min="0" max={DURATION} step="0.01" value={time} onChange={(event) => seek(event.target.value)} style={{ '--progress': `${time / DURATION * 100}%` }} />
          <button className="text-button" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? 'Ativar som' : 'Silenciar som'}>{muted ? '🔇' : '🔊'} <span>{muted ? 'MUDO' : 'SOM'}</span></button>
          <button className="text-button" onClick={toggleMusic} aria-pressed={music} aria-label={music ? 'Desligar música' : 'Ligar música'}>{music ? '🎵' : '🔕'} <span>{music ? 'MÚSICA' : 'SEM MÚSICA'}</span></button>
          <button className="text-button" onClick={() => seek(0)}>↺ <span>REINICIAR</span></button>
          <button className="export-button" onClick={exportVideo} disabled={exporting}>{exporting ? '● GRAVANDO...' : '↓ EXPORTAR WEBM'}</button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="timeline-heading"><span>ROTEIRO</span><span>{String(SCENES.length).padStart(2, '0')} CENAS · {Math.round(DURATION)} SEGUNDOS</span></div>
        <nav className="scene-list" aria-label="Cenas do vídeo">
          {SCENES.map((scene, index) => (
            <button key={scene.at} className={current === scene ? 'scene active' : 'scene'} onClick={() => seek(scene.at)}>
              <span className="scene-number">{String(index + 1).padStart(2, '0')}</span><span className="scene-title">{scene.label}</span><span className="scene-time">{formatTime(scene.at)}</span>
            </button>
          ))}
        </nav>
        <p className="shortcuts">ATALHOS: <kbd>Espaço</kbd> play/pausa · <kbd>←</kbd> <kbd>→</kbd> 5 s · <kbd>0</kbd> reiniciar</p>
        <a className="scroll-hint" href="#recursos">ROLE PARA CONHECER O CLAUDEX ↓</a>
      </div>
      <Landing />
    </main>
  )
}

function formatTime(seconds) {
  const s = Math.floor(seconds)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
