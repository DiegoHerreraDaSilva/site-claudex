// Vídeo de apresentação do Claudex, desenhado em canvas (1920x1080).
// Conteúdo baseado no README do projeto: app desktop local, Jev escolhe o modelo,
// equipe coordenada, escrita direta na pasta (sem Git), terminal por projeto.

const DURS = [5, 6, 6.5, 7, 6, 6, 6, 5.5]
export const DURATION = DURS.reduce((a, b) => a + b, 0)
const STARTS = DURS.map((_, i) => DURS.slice(0, i).reduce((a, b) => a + b, 0))
export const SCENES = [
  { label: 'Claudex' },
  { label: 'Escreva o pedido' },
  { label: 'Jev escolhe o modelo' },
  { label: 'Equipe coordenada' },
  { label: 'Direto na sua pasta' },
  { label: 'Terminal e controle' },
  { label: 'Assinatura ou API' },
  { label: 'Peça. Acompanhe.' },
].map((s, i) => ({ ...s, at: STARTS[i], dur: DURS[i] }))

const W = 1920
const H = 1080
const SANS = '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
const MONO = '"Cascadia Mono", Consolas, "SFMono-Regular", monospace'
const C = {
  bg: '#0a1012', panel: '#131d20', panel2: '#192528', line: '#2d3e3d',
  white: '#f1f5f1', mute: '#9fb2ab', dim: '#6c8179',
  accent: '#5cc4ec', mint: '#7fe0b0', blue: '#7db8ff', violet: '#c3a6ff', red: '#ff7b7b', gold: '#f2c96b',
}

// Ícone oficial do Claudex (public/icon.png). Se ainda não carregou, desenha o logo antigo.
const ICON_SRC = 'icon.png'
let iconImg = null
if (typeof Image !== 'undefined') { iconImg = new Image(); iconImg.src = ICON_SRC }
const iconReady = () => Boolean(iconImg && iconImg.complete && iconImg.naturalWidth)
const TEAL = '#46b7e4'

const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n))
const easeOut = (n) => 1 - (1 - clamp(n)) ** 3
const easeInOut = (n) => { const x = clamp(n); return x < .5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2 }
const prog = (t, a, b) => clamp((t - a) / (b - a))
const lerp = (a, b, n) => a + (b - a) * n

function rr(g, x, y, w, h, r, fill, stroke, lw = 2) {
  g.beginPath(); g.roundRect(x, y, w, h, r)
  if (fill) { g.fillStyle = fill; g.fill() }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke() }
}
function ln(g, x1, y1, x2, y2, color = C.line, w = 3) {
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = color; g.lineWidth = w; g.stroke()
}
function circle(g, x, y, r, fill, stroke, lw = 2) {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2)
  if (fill) { g.fillStyle = fill; g.fill() }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke() }
}
function tx(g, value, x, y, size = 36, color = C.white, weight = 500, align = 'left', mono = false) {
  g.font = `${weight} ${size}px ${mono ? MONO : SANS}`
  g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'
  g.fillText(value, x, y)
  g.textAlign = 'left'
}
function width(g, value, size, weight = 500, mono = false) {
  g.font = `${weight} ${size}px ${mono ? MONO : SANS}`
  return g.measureText(value).width
}
function kicker(g, value, x, y, color = C.accent, align = 'left') { tx(g, value, x, y, 24, color, 600, align, true) }
function chip(g, value, x, y, color = C.mint, size = 24, padX = 26) {
  const w = width(g, value, size, 600, true) + padX * 2
  rr(g, x, y, w, 56, 28, color + '22', color + '88', 2)
  tx(g, value, x + w / 2, y + 37, size, color, 600, 'center', true)
  return w
}
function glow(g, color, blur, fn) { g.save(); g.shadowColor = color; g.shadowBlur = blur; fn(); g.restore() }
function windowFrame(g, x, y, w, h, title) {
  glow(g, '#000c', 50, () => rr(g, x, y, w, h, 22, C.panel))
  rr(g, x, y, w, h, 22, null, C.line, 2)
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 22); g.clip()
  g.fillStyle = C.panel2; g.fillRect(x, y, w, 62)
  g.restore()
  circle(g, x + 36, y + 31, 8, C.red); circle(g, x + 64, y + 31, 8, C.gold); circle(g, x + 92, y + 31, 8, C.mint)
  if (title) tx(g, title, x + w / 2, y + 40, 22, C.mute, 500, 'center', true)
}
function typed(value, t, start, perSec = 22) {
  return value.slice(0, Math.floor(clamp((t - start) * perSec, 0, value.length)))
}

function backdrop(g, t) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H)
  const gx = 960 + Math.sin(t * .35) * 280
  const gr = g.createRadialGradient(gx, 380, 30, 960, 540, 1100)
  gr.addColorStop(0, '#1c3a37'); gr.addColorStop(1, '#0a101200')
  g.fillStyle = gr; g.fillRect(0, 0, W, H)
  g.strokeStyle = '#ffffff09'; g.lineWidth = 1
  const off = (t * 10) % 80
  for (let x = -off; x < W; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke() }
  for (let y = 0; y < H; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke() }
}
function chrome(g, t) {
  if (iconReady()) g.drawImage(iconImg, 72, 36, 52, 52)
  else { circle(g, 96, 62, 17, C.accent); tx(g, '✳', 96, 72, 24, '#102020', 700, 'center') }
  tx(g, 'CLAUDEX', 136, 70, 26, C.white, 700)
  tx(g, 'APP DESKTOP LOCAL  ·  SEM GIT', 1824, 68, 20, C.dim, 500, 'right', true)
  rr(g, 0, H - 8, W * (t / DURATION), 8, 0, C.accent)
}

function scene(g, local, dur, draw, last) {
  const inA = easeOut(local / .6)
  const outA = last ? 1 : clamp((dur - local) / .5)
  g.save()
  g.globalAlpha = Math.min(inA, outA)
  g.translate(0, (1 - inA) * 30)
  draw(local)
  g.restore()
}

// ---------- 1. Abertura ----------
function sIntro(g, t) {
  for (let i = 0; i < 26; i++) {
    const a = i * 2.399 + t * .12
    const r = 250 + (i * 37) % 420 + Math.sin(t * .6 + i) * 18
    const x = 960 + Math.cos(a) * r * 1.5
    const y = 470 + Math.sin(a) * r * .75
    circle(g, x, y, 3 + (i % 3), i % 4 === 0 ? TEAL + 'aa' : '#ffffff22')
  }
  const k = easeOut(prog(t, .2, 1.2))
  g.save(); g.translate(960, 330); g.scale(k, k); g.rotate((1 - k) * -.9)
  for (let i = 0; i < 3; i++) circle(g, 0, 0, 170 + i * 62 + Math.sin(t * 1.4 + i) * 6, null, TEAL + (i === 0 ? '88' : '33'), 2)
  if (iconReady()) glow(g, TEAL, 70, () => g.drawImage(iconImg, -130, -130, 260, 260))
  else {
    glow(g, C.accent, 60, () => circle(g, 0, 0, 108, C.accent))
    tx(g, '✳', 0, 46, 150, '#102020', 700, 'center')
  }
  g.restore()
  const w = easeOut(prog(t, .8, 1.8))
  g.save(); g.globalAlpha = w; g.translate(0, (1 - w) * 40)
  tx(g, 'CLAUDEX', 960, 678, 170, C.white, 700, 'center')
  g.restore()
  const l1 = easeOut(prog(t, 1.7, 2.5)), l2 = easeOut(prog(t, 2.3, 3.1))
  g.save(); g.globalAlpha = l1
  tx(g, 'Escreva o que você precisa.', 960, 766, 48, C.mute, 400, 'center'); g.restore()
  g.save(); g.globalAlpha = l2
  tx(g, 'Jev escolhe o modelo. Uma equipe trabalha na sua pasta.', 960, 830, 48, C.accent, 500, 'center'); g.restore()
}

// ---------- 2. Pedido ----------
function sRequest(g, t) {
  kicker(g, '01  /  ESCREVA', 120, 168)
  tx(g, 'Um campo. Um pedido.', 120, 246, 70, C.white, 700)
  const X = 120, Y = 296, WW = 1680, HH = 700
  windowFrame(g, X, Y, WW, HH, 'Claudex')
  // sidebar
  g.fillStyle = '#0f171a'; g.fillRect(X + 2, Y + 62, 360, HH - 64)
  tx(g, 'PROJETOS', X + 32, Y + 112, 20, C.dim, 600, 'left', true)
  tx(g, '+', X + 330, Y + 114, 34, C.accent, 600, 'center')
  const projs = ['meu-site', 'relatorio-vendas', 'api-pagamentos']
  projs.forEach((p, i) => {
    const y = Y + 140 + i * 74
    const on = i === 0
    if (on) rr(g, X + 18, y, 330, 58, 12, C.accent + '22', C.accent + '66')
    tx(g, '▣', X + 44, y + 38, 26, on ? C.accent : C.dim, 500, 'center')
    tx(g, p, X + 74, y + 38, 26, on ? C.white : C.mute, on ? 600 : 400)
  })
  tx(g, 'Qualquer pasta vira projeto.', X + 32, Y + HH - 60, 20, C.mute, 400)
  // request bar
  const bx = X + 400, by = Y + 98
  rr(g, bx, by, 1230, 112, 18, '#0d1517', C.line)
  const msg = 'Adicione login ao site e escreva os testes'
  const shown = typed(msg, t, 1.0, 16)
  tx(g, shown, bx + 32, by + 68, 34, C.white, 400)
  if (t < 4.1 && Math.floor(t * 2.4) % 2 === 0) rr(g, bx + 36 + width(g, shown, 34, 400), by + 30, 3, 50, 0, C.accent)
  const press = t > 3.5 && t < 3.8
  rr(g, bx + 1230 - 270, by + 22, 240, 68, 14, press ? '#a5dcf4' : C.accent)
  tx(g, 'Enviar pedido', bx + 1230 - 150, by + 66, 26, '#1b0f0b', 700, 'center')
  tx(g, 'Ctrl + Enter também envia', bx + 1230 - 30, by + 150, 20, C.dim, 400, 'right', true)
  chip(g, 'C:\\Projetos\\meu-site', bx, by + 128, C.blue, 20, 20)
  // session
  const s = easeOut(prog(t, 3.8, 4.6))
  g.save(); g.globalAlpha = s; g.translate(0, (1 - s) * 24)
  rr(g, bx, Y + 330, 1230, 330, 18, '#0e1618', C.line)
  rr(g, bx + 28, Y + 352, 300, 46, 23, C.mint + '22', C.mint + '77')
  tx(g, '● claude · sonnet', bx + 178, Y + 383, 21, C.mint, 600, 'center', true)
  const lines = [
    ['Jev', 'classificou o pedido: implementação', C.accent],
    ['ferramenta', 'Read  src/app/login.ts', C.mute],
    ['ferramenta', 'Write  src/auth/session.ts', C.mute],
    ['resultado', 'Login criado, testes adicionados.', C.mint],
  ]
  lines.forEach(([a, b, col], i) => {
    const p = easeOut(prog(t, 4.3 + i * .35, 4.9 + i * .35))
    g.save(); g.globalAlpha = p
    tx(g, a, bx + 32, Y + 450 + i * 52, 22, col, 700, 'left', true)
    tx(g, b, bx + 220, Y + 450 + i * 52, 26, C.white, 400)
    g.restore()
  })
  g.restore()
}

// ---------- 3. Jev roteia ----------
function sRouting(g, t) {
  kicker(g, '02  /  DECIDA', 120, 168)
  tx(g, 'Jev escolhe o modelo certo.', 120, 246, 70, C.white, 700)
  tx(g, 'A cada pedido, um papel. Cada papel tem seu modelo, e você pode trocá-los.', 120, 300, 32, C.mute, 400)
  const reqs = [
    ['Corrigir o texto do botão', 0, C.mint],
    ['Integrar o pagamento com a API', 1, C.blue],
    ['Investigar a lentidão do sistema', 2, C.violet],
  ]
  const idx = Math.min(2, Math.floor(t / 2.0))
  const lt = t - idx * 2.0
  const [rq, target, tcol] = reqs[idx]
  // request chip
  const rw = width(g, rq, 30, 500) + 70
  const ra = easeOut(prog(lt, 0, .4)) * (1 - prog(lt, 1.7, 2.0))
  g.save(); g.globalAlpha = ra
  rr(g, 960 - rw / 2, 350, rw, 70, 35, C.panel2, C.line)
  tx(g, rq, 960, 396, 30, C.white, 500, 'center')
  g.restore()
  // jev
  const pulse = 1
  glow(g, C.accent, 40, () => rr(g, 760, 480, 400, 110, 24, C.panel, C.accent, 3))
  circle(g, 810, 535, 14, C.accent)
  tx(g, 'JEV', 850, 551, 44 * pulse, C.white, 700)
  tx(g, 'roteador', 1010, 548, 22, C.mute, 400, 'left', true)
  // cards
  const cards = [
    ['MUDANÇAS SIMPLES', 'Claude Sonnet', 'DEFAULT_SIMPLE_MODEL', C.mint, 150],
    ['IMPLEMENTAÇÃO', 'Codex  gpt-6-sol', 'DEFAULT_COMPLEX_MODEL', C.blue, 700],
    ['ARQUITETURA', 'Claude Opus', 'DEFAULT_PLANNER_MODEL', C.violet, 1250],
  ]
  cards.forEach(([role, model, env, col, x], i) => {
    const on = i === target && lt > .9
    const y = 740
    const cx = x + 260
    ln(g, 960, 590, 960, 665, C.line, 3)
    ln(g, 960, 665, cx, 665, on ? col : C.line, on ? 5 : 3)
    ln(g, cx, 665, cx, y, on ? col : C.line, on ? 5 : 3)
    if (on) glow(g, col, 50, () => rr(g, x, y, 520, 220, 22, C.panel2, col, 4))
    else rr(g, x, y, 520, 220, 22, C.panel, C.line, 2)
    circle(g, x + 44, y + 52, 11, col)
    tx(g, role, x + 70, y + 60, 24, col, 600, 'left', true)
    tx(g, model, x + 40, y + 132, 44, C.white, 700)
    tx(g, env, x + 40, y + 182, 20, C.dim, 400, 'left', true)
  })
  // packet
  if (lt > .4 && lt < 1.2) {
    const p = easeInOut(prog(lt, .4, 1.2))
    circle(g, 960, lerp(420, 480, p), 11, tcol)
  } else if (lt >= 1.2 && lt < 1.9) {
    const p = easeInOut(prog(lt, 1.2, 1.9))
    const cx = cards[target][4] + 260
    let x, y
    if (p < .3) { x = 960; y = lerp(590, 665, p / .3) }
    else if (p < .7) { x = lerp(960, cx, (p - .3) / .4); y = 665 }
    else { x = cx; y = lerp(665, 740, (p - .7) / .3) }
    glow(g, tcol, 24, () => circle(g, x, y, 12, tcol))
  }
  tx(g, 'Sem a chave Jev, o roteamento local assume — e a interface avisa.', 960, 1022, 24, C.dim, 400, 'center')
}

// ---------- 4. Equipe ----------
function sTeam(g, t) {
  kicker(g, '03  /  COLABORE', 120, 168)
  tx(g, 'Uma equipe, em paralelo.', 120, 246, 70, C.white, 700)
  tx(g, 'O coordenador divide o trabalho. Cada colaborador reserva sua área.', 120, 300, 32, C.mute, 400)
  // coordinator
  const co = easeOut(prog(t, .3, 1))
  g.save(); g.globalAlpha = co
  glow(g, C.violet, 36, () => rr(g, 120, 520, 460, 190, 24, C.panel2, C.violet, 3))
  tx(g, 'COORDENADOR', 156, 576, 22, C.violet, 600, 'left', true)
  tx(g, 'Claude Opus', 156, 636, 46, C.white, 700)
  tx(g, 'planeja e reúne resultados', 156, 680, 22, C.mute, 400)
  g.restore()
  const subs = [
    ['Codex  gpt-6-sol', 'src/auth/**', 'Implementando login', C.blue, 372, 1.0, 3.9],
    ['Claude Sonnet', 'tests/**', 'Escrevendo testes', C.mint, 560 + 0, 1.4, 4.4],
    ['Claude Sonnet', 'docs/**', 'Atualizando docs', C.mint, 748, 1.8, 3.4],
  ]
  subs.forEach(([model, area, job, col, y, s0, s1], i) => {
    const yy = 350 + i * 190
    const a = easeOut(prog(t, s0 - .3, s0 + .4))
    g.save(); g.globalAlpha = a; g.translate((1 - a) * 40, 0)
    // link
    ln(g, 580, 615, 760, 615, C.line, 3)
    ln(g, 760, 615, 760, yy + 70, C.line, 3)
    ln(g, 760, yy + 70, 840, yy + 70, col + '99', 3)
    rr(g, 840, yy, 960, 150, 22, C.panel, col + '88', 2)
    tx(g, model, 878, yy + 56, 34, C.white, 700)
    chip(g, area, 1420, yy + 20, col, 22, 20)
    tx(g, job, 878, yy + 96, 24, C.mute, 400)
    const p = easeInOut(prog(t, s0, s1))
    rr(g, 878, yy + 114, 880, 14, 7, '#0b1214')
    if (p > 0) rr(g, 878, yy + 114, 880 * p, 14, 7, col)
    const done = p >= 1
    tx(g, done ? '✓ concluído' : Math.round(p * 100) + '%', 1758, yy + 98, 22, done ? col : C.mute, 600, 'right', true)
    g.restore()
  })
  // sub-delegation depth 2
  const d2 = easeOut(prog(t, 3.0, 3.8))
  g.save(); g.globalAlpha = d2
  rr(g, 1020, 934, 620, 56, 16, C.panel2, C.blue + '77')
  tx(g, '↳ nível 2: Codex ajusta o middleware', 1050, 970, 22, C.blue, 500, 'left', true)
  g.restore()
  // messages
  if (t > 2.2) {
    const m = (t * .7) % 1
    circle(g, 760, lerp(615, 420, m), 7, C.accent)
    circle(g, 760, lerp(615, 800, (m + .5) % 1), 7, C.accent)
  }
  // limits
  const lim = easeOut(prog(t, 4.6, 5.4))
  g.save(); g.globalAlpha = lim
  chip(g, 'até 4 agentes ativos', 120, 742, C.gold, 22, 22)
  chip(g, '2 níveis', 120, 806, C.gold, 22, 22)
  chip(g, 'áreas sem sobreposição', 120, 870, C.gold, 22, 22)
  g.restore()
  const fin = easeOut(prog(t, 5.0, 5.8))
  g.save(); g.globalAlpha = fin
  tx(g, '✓ coordenador reúne tudo', 120, 972, 28, C.mint, 600)
  tx(g, 'e responde uma vez', 156, 1012, 28, C.mint, 600)
  g.restore()
}

// ---------- 5. Pasta ----------
function sFolder(g, t) {
  kicker(g, '04  /  RECEBA', 120, 168)
  tx(g, 'As mudanças vão direto para a sua pasta.', 120, 246, 70, C.white, 700)
  // tree
  windowFrame(g, 120, 310, 900, 650, 'meu-site')
  const files = [
    ['▾ src', null, 0, 0],
    ['auth/session.ts', 'novo', 1, 0.9],
    ['app/login.ts', 'editado', 1, 1.5],
    ['▾ tests', null, 0, 0],
    ['login.test.ts', 'novo', 1, 2.1],
    ['▾ docs', null, 0, 0],
    ['README.md', 'editado', 1, 2.7],
    ['package.json', null, 0, 0],
  ]
  files.forEach(([name, tag, lvl, at], i) => {
    const y = 420 + i * 62
    const x = 164 + lvl * 44
    const hit = tag && t > at
    const flash = hit ? clamp(1 - (t - at) / 1.0) : 0
    if (flash > 0) rr(g, 150, y - 38, 840, 56, 10, (tag === 'novo' ? C.mint : C.gold) + Math.floor(flash * 60).toString(16).padStart(2, '0'))
    tx(g, name, x, y, 28, hit ? C.white : C.mute, hit ? 600 : 400, 'left', true)
    if (hit) {
      const col = tag === 'novo' ? C.mint : C.gold
      const w = width(g, tag, 20, 700, true) + 28
      rr(g, 960 - w, y - 30, w, 40, 20, col + '28', col + '99')
      tx(g, tag, 960 - w / 2, y - 2, 20, col, 700, 'center', true)
    }
  })
  // memory
  const mem = easeOut(prog(t, 3.2, 4.0))
  g.save(); g.globalAlpha = mem; g.translate((1 - mem) * 40, 0)
  rr(g, 1070, 310, 730, 330, 22, C.panel, C.line, 2)
  tx(g, 'REGISTRO COMPARTILHADO', 1106, 366, 22, C.accent, 600, 'left', true)
  ;[['pedidos e resultados', 0], ['decisões comunicadas', 1], ['caminhos alterados', 2], ['mudanças manuais detectadas', 3]].forEach(([s, i]) => {
    tx(g, '•', 1106, 436 + i * 56, 30, C.mint, 600)
    tx(g, s, 1142, 436 + i * 56, 30, C.white, 400)
  })
  g.restore()
  // crossed out
  const items = ['worktrees', 'branches', 'revisões', 'botão Aplicar']
  tx(g, 'Sem burocracia:', 1070, 706, 24, C.dim, 600, 'left', true)
  let x = 1070, y = 730
  items.forEach((s, i) => {
    const w = width(g, s, 26, 500, true) + 44
    if (x + w > 1800) { x = 1070; y += 74 }
    const a = easeOut(prog(t, 3.8 + i * .25, 4.3 + i * .25))
    g.save(); g.globalAlpha = a
    rr(g, x, y, w, 56, 28, '#ffffff0c', C.line)
    tx(g, s, x + w / 2, y + 37, 26, C.mute, 500, 'center', true)
    const k = easeOut(prog(t, 4.6 + i * .25, 5.0 + i * .25))
    ln(g, x + 18, y + 28, x + 18 + (w - 36) * k, y + 28, C.red, 4)
    g.restore()
    x += w + 16
  })
  const g2 = easeOut(prog(t, 5.2, 5.8))
  g.save(); g.globalAlpha = g2
  tx(g, 'Funciona em qualquer pasta, mesmo sem Git.', 1070, 912, 30, C.mint, 600)
  g.restore()
}

// ---------- 6. Terminal ----------
function sTerminal(g, t) {
  kicker(g, '05  /  CONTROLE', 120, 168)
  tx(g, 'Acompanhe tudo, no seu ritmo.', 120, 246, 70, C.white, 700)
  const X = 120, Y = 310, WW = 1180, HH = 660
  windowFrame(g, X, Y, WW, HH, null)
  const tabs = [['Coordenador', C.violet], ['Codex · auth', C.blue], ['Sonnet · docs', C.mint], ['Terminal', C.accent]]
  let tx0 = X + 130
  tabs.forEach(([n, col], i) => {
    const w = width(g, n, 22, 600, true) + 36
    const on = i === 3
    rr(g, tx0, Y + 12, w, 42, 12, on ? col + '2a' : null, on ? col + '99' : null)
    tx(g, n, tx0 + w / 2, Y + 40, 22, on ? col : C.dim, 600, 'center', true)
    tx0 += w + 10
  })
  g.fillStyle = '#080e10'; g.fillRect(X + 2, Y + 64, WW - 4, HH - 66)
  const cmd = 'npm test'
  const ty = typed(cmd, t, .8, 9)
  const prompt = 'PS C:\\Projetos\\meu-site> '
  tx(g, prompt, X + 36, Y + 130, 28, C.mint, 400, 'left', true)
  tx(g, ty, X + 36 + width(g, prompt, 28, 400, true), Y + 130, 28, C.white, 400, 'left', true)
  const out = [
    ['> meu-site@1.0.0 test', C.mute],
    ['PASS  tests/login.test.ts', C.mint],
    ['  ✓ cria a sessão do usuário', C.white],
    ['  ✓ recusa senha inválida', C.white],
    ['  ✓ expira a sessão', C.white],
    ['Tests: 3 passed, 3 total', C.mint],
  ]
  out.forEach(([s, col], i) => {
    const a = clamp((t - (2.0 + i * .35)) / .15)
    if (a <= 0) return
    g.save(); g.globalAlpha = a
    tx(g, s, X + 36, Y + 190 + i * 46, 28, col, 400, 'left', true)
    g.restore()
  })
  if (Math.floor(t * 2.4) % 2 === 0 && t > 4.2) rr(g, X + 36 + width(g, prompt, 28, 400, true), Y + 330 + 0, 14, 30, 0, C.white)
  // side points
  const pts = [
    ['Um terminal por projeto', 'PowerShell ou Bash, na pasta certa.', C.accent],
    ['Sessões por modelo', 'O contexto é retomado ao reabrir.', C.blue],
    ['Parar agente', 'Interrompe a equipe; arquivos ficam.', C.red],
  ]
  pts.forEach(([a, b, col], i) => {
    const p = easeOut(prog(t, 1.2 + i * .7, 1.9 + i * .7))
    g.save(); g.globalAlpha = p; g.translate((1 - p) * 40, 0)
    rr(g, 1350, 310 + i * 226, 450, 196, 22, C.panel, col + '66', 2)
    circle(g, 1392, 366 + i * 226, 9, col)
    tx(g, a, 1416, 376 + i * 226, 32, C.white, 700)
    tx(g, b, 1384, 436 + i * 226, 24, C.mute, 400)
    g.restore()
  })
}

// ---------- 7. Contas ----------
function sAccounts(g, t) {
  kicker(g, '06  /  CONECTE', 120, 168)
  tx(g, 'Use sua assinatura ou sua API.', 120, 246, 70, C.white, 700)
  tx(g, 'Em Contas e ajustes, você escolhe como conectar Claude e Codex.', 120, 300, 32, C.mute, 400)
  const cards = [
    ['ASSINATURA MENSAL', 'Claude e Codex', ['Entre com o login oficial', 'Use o plano que você já paga', 'Sem precisar de chave de API'], C.mint, 120, ['CLAUDE', 'CODEX']],
    ['CHAVE DE API', 'Anthropic e OpenAI', ['Informe sua chave no app', 'Cobrança por uso do provedor', 'Pode ser removida quando quiser'], C.blue, 1000, ['ANTHROPIC', 'OPENAI']],
  ]
  cards.forEach(([tag, title, pts, col, x, chips], i) => {
    const a = easeOut(prog(t, .6 + i * .5, 1.3 + i * .5))
    g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 40)
    glow(g, col, 30, () => rr(g, x, 380, 800, 480, 26, C.panel, col + '99', 3))
    tx(g, tag, x + 48, 450, 26, col, 600, 'left', true)
    tx(g, title, x + 48, 530, 62, C.white, 700)
    pts.forEach((s, k) => {
      const b = easeOut(prog(t, 1.4 + i * .5 + k * .35, 1.9 + i * .5 + k * .35))
      g.save(); g.globalAlpha = b
      tx(g, '✓', x + 48, 626 + k * 62, 32, col, 700)
      tx(g, s, x + 100, 626 + k * 62, 32, C.white, 400)
      g.restore()
    })
    let cx = x + 48
    chips.forEach((c) => { cx += chip(g, c, cx, 780, col, 22, 22) + 14 })
    g.restore()
  })
  const o = easeOut(prog(t, 1.6, 2.2))
  g.save(); g.globalAlpha = o
  circle(g, 960, 620, 54, C.bg, C.line, 3)
  tx(g, 'ou', 960, 634, 36, C.accent, 700, 'center', true)
  g.restore()
  const n = easeOut(prog(t, 3.6, 4.4))
  g.save(); g.globalAlpha = n
  tx(g, 'Se houver uma chave de API, ela tem prioridade sobre o login e pode gerar cobrança por uso.', 960, 950, 30, C.gold, 500, 'center')
  g.restore()
}

// ---------- 8. Final ----------
function sEnd(g, t) {
  tx(g, 'Peça.', 960, 340, 150, C.white, 700, 'center')
  const a2 = easeOut(prog(t, .5, 1.2)), a3 = easeOut(prog(t, 1.0, 1.7))
  g.save(); g.globalAlpha = a2; tx(g, 'Acompanhe.', 960, 490, 150, C.accent, 700, 'center'); g.restore()
  g.save(); g.globalAlpha = a3; tx(g, 'Pronto.', 960, 640, 150, C.white, 700, 'center'); g.restore()
  const a4 = easeOut(prog(t, 1.8, 2.5))
  g.save(); g.globalAlpha = a4
  let w1 = width(g, 'CLAUDE CODE', 24, 600, true) + 52, w2 = width(g, 'JEV', 24, 600, true) + 52, w3 = width(g, 'CODEX', 24, 600, true) + 52
  let x = 960 - (w1 + w2 + w3 + 32) / 2
  x += chip(g, 'CLAUDE CODE', x, 714, C.mint) + 16
  x += chip(g, 'JEV', x, 714, C.accent) + 16
  chip(g, 'CODEX', x, 714, C.blue)
  rr(g, 700, 810, 520, 70, 16, '#0d1517', C.line)
  tx(g, '$ npm run app', 960, 856, 32, C.white, 500, 'center', true)
  tx(g, 'github.com/DiegoHerreraDaSilva/claudex', 960, 960, 34, C.mute, 400, 'center', true)
  g.restore()
}

const drawers = [sIntro, sRequest, sRouting, sTeam, sFolder, sTerminal, sAccounts, sEnd]

export function renderFrame(canvas, time) {
  if (!canvas) return
  const g = canvas.getContext('2d')
  if (!g) return
  const t = clamp(time, 0, DURATION)
  backdrop(g, t)
  chrome(g, t)
  let i = STARTS.findLastIndex((s) => t >= s)
  if (i < 0) i = 0
  const local = Math.min(t - STARTS[i], DURS[i] - 0.001)
  scene(g, local, DURS[i], (l) => drawers[i](g, l), i === DURS.length - 1)
}
