import { useEffect, useRef, useState } from 'react'
import './landing.css'

const REPO = 'https://github.com/DiegoHerreraDaSilva/claudex'

const FEATURES = [
  {
    tag: '01',
    title: 'Um campo. Um pedido.',
    text: 'Qualquer pasta vira projeto. Você escreve o que precisa em linguagem natural e envia, com o botão ou Ctrl + Enter.',
    accent: 'brand',
  },
  {
    tag: '02',
    title: 'O Jev escolhe o modelo',
    text: 'Cada pedido recebe um papel, e cada papel tem seu modelo. Ajustes simples, implementação e arquitetura vão para modelos diferentes.',
    accent: 'mint',
  },
  {
    tag: '03',
    title: 'Uma equipe em paralelo',
    text: 'Um coordenador divide o trabalho e cada colaborador reserva sua área. São até 4 agentes ativos e 2 níveis de delegação, sem um mexer no arquivo do outro.',
    accent: 'violet',
  },
  {
    tag: '04',
    title: 'Direto na sua pasta',
    text: 'As mudanças são gravadas onde você já trabalha. Não há worktree, branch nem botão Aplicar. Funciona em qualquer pasta, mesmo sem Git.',
    accent: 'blue',
  },
  {
    tag: '05',
    title: 'Terminal por projeto',
    text: 'PowerShell ou Bash, já aberto na pasta certa. Você roda testes e scripts sem sair do app.',
    accent: 'gold',
  },
  {
    tag: '06',
    title: 'Controle o tempo todo',
    text: 'Cada modelo tem sua sessão, e o contexto volta quando você reabre o projeto. "Parar agente" interrompe a equipe e mantém os arquivos.',
    accent: 'red',
  },
]

const ACCOUNTS = [
  { tag: 'ASSINATURA', title: 'Claude e Codex pelo plano mensal', text: 'Entre com os comandos de login oficiais e use a assinatura que você já tem. Não é preciso criar chave de API.', accent: 'mint' },
  { tag: 'API', title: 'Chaves da Anthropic e da OpenAI', text: 'Prefere pagar por uso? Configure sua chave de API em Contas e ajustes e remova quando quiser.', accent: 'blue' },
]

const ROUTES = [
  { role: 'Mudanças simples', example: 'Corrigir o texto do botão', model: 'Claude Sonnet', env: 'DEFAULT_SIMPLE_MODEL', accent: 'mint' },
  { role: 'Implementação', example: 'Integrar o pagamento com a API', model: 'Codex · gpt-6-sol', env: 'DEFAULT_COMPLEX_MODEL', accent: 'blue' },
  { role: 'Arquitetura', example: 'Investigar a lentidão do sistema', model: 'Claude Opus', env: 'DEFAULT_PLANNER_MODEL', accent: 'violet' },
]

const STEPS = [
  ['Abra uma pasta', 'Escolha qualquer pasta do seu computador. Ela vira um projeto na barra lateral.'],
  ['Escreva o pedido', '"Adicione login ao site e escreva os testes." Basta uma frase.'],
  ['Acompanhe a equipe', 'Veja cada agente, a ferramenta que ele está usando e o progresso em abas separadas.'],
  ['Receba o resultado', 'O coordenador reúne tudo e responde uma vez. Os arquivos já estão na pasta.'],
]

const FAQ = [
  ['Preciso usar Git?', 'Não. O Claudex escreve direto na pasta escolhida, com ou sem repositório Git. O registro compartilhado guarda pedidos, resultados e os caminhos alterados.'],
  ['Preciso pagar por API?', 'Não necessariamente. Você pode entrar com a assinatura mensal do Claude e do Codex, usando o login oficial, ou configurar chaves de API da Anthropic e da OpenAI. Se houver uma chave de API, ela tem prioridade sobre o login e pode gerar cobrança por uso; você pode removê-la no app.'],
  ['E se eu não tiver a chave do Jev?', 'O roteamento local assume a escolha do modelo, e a interface avisa que isso aconteceu.'],
  ['Posso trocar os modelos?', 'Pode. Cada papel lê o modelo de uma variável: DEFAULT_SIMPLE_MODEL, DEFAULT_COMPLEX_MODEL e DEFAULT_PLANNER_MODEL.'],
  ['Os agentes não conflitam entre si?', 'Cada colaborador reserva caminhos exclusivos antes de editar, e o coordenador só responde depois de reunir os resultados. Edições manuais feitas na pasta também são detectadas.'],
  ['Consigo interromper no meio?', 'Sim. "Parar agente" interrompe a equipe na hora, e o que já foi escrito continua nos arquivos.'],
]

const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'pt-BR',
  mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
}).replace(/</g, '\\u003c')

const INSTALL = `git clone ${REPO}.git
cd claudex
npm install
npm run app`

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = root.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function Landing() {
  const ref = useReveal()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="landing" ref={ref}>
      {/* FAQPage em JSON-LD gerado do mesmo conteúdo do FAQ visível, para nunca ficarem diferentes. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />
      {/* Manifesto */}
      <section className="lp-section lp-manifesto" aria-labelledby="manifesto-title">
        <p className="lp-kicker" data-reveal>POR QUE CLAUDEX</p>
        <h2 id="manifesto-title" data-reveal>
          Você descreve o que quer. <em>Uma equipe de IA</em> faz na sua pasta, e você acompanha cada passo.
        </h2>
        <div className="lp-stats" data-reveal>
          <div><strong>1</strong><span>campo de pedido</span></div>
          <div><strong>3</strong><span>papéis com modelos próprios</span></div>
          <div><strong>4</strong><span>agentes em paralelo</span></div>
          <div><strong>0</strong><span>branches para revisar</span></div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="lp-section" aria-labelledby="recursos-title">
        <header className="lp-head" data-reveal>
          <p className="lp-kicker">RECURSOS</p>
          <h2 id="recursos-title">Tudo o que o vídeo mostrou, <span>em detalhe.</span></h2>
        </header>
        <div className="lp-features">
          {FEATURES.map((f, i) => (
            <article key={f.tag} className={`lp-card accent-${f.accent}`} data-reveal style={{ '--d': `${i * 60}ms` }}>
              <span className="lp-card-tag">{f.tag}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Contas */}
      <section id="contas" className="lp-section" aria-labelledby="contas-title">
        <header className="lp-head" data-reveal>
          <p className="lp-kicker">CONTAS</p>
          <h2 id="contas-title">Sua assinatura <span>ou sua API.</span></h2>
          <p className="lp-lead">Em Contas e ajustes, conecte Claude e Codex do jeito que for melhor para você.</p>
        </header>
        <div className="lp-features lp-two" data-reveal>
          {ACCOUNTS.map((a) => (
            <article key={a.tag} className={`lp-card accent-${a.accent}`}>
              <span className="lp-card-tag">{a.tag}</span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </article>
          ))}
        </div>
        <p className="lp-note" data-reveal>Uma chave de API tem prioridade sobre o login por assinatura e pode gerar cobrança por uso. O app permite removê-la.</p>
      </section>

      {/* Roteamento */}
      <section id="modelos" className="lp-section lp-split" aria-labelledby="modelos-title">
        <header className="lp-head" data-reveal>
          <p className="lp-kicker">ROTEAMENTO</p>
          <h2 id="modelos-title">O modelo certo <span>para cada pedido.</span></h2>
          <p className="lp-lead">O Jev lê o pedido e define o papel. Cada papel aponta para um modelo, e você pode trocar qualquer um deles.</p>
        </header>
        <div className="lp-routes" data-reveal>
          {ROUTES.map((r) => (
            <div key={r.env} className={`lp-route accent-${r.accent}`}>
              <div className="lp-route-req">
                <span className="lp-route-role">{r.role}</span>
                <span className="lp-route-ex">“{r.example}”</span>
              </div>
              <span className="lp-route-arrow" aria-hidden="true">→</span>
              <div className="lp-route-model">
                <strong>{r.model}</strong>
                <code>{r.env}</code>
              </div>
            </div>
          ))}
          <p className="lp-note">Sem a chave do Jev, o roteamento local assume e a interface avisa.</p>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="lp-section" aria-labelledby="como-title">
        <header className="lp-head" data-reveal>
          <p className="lp-kicker">COMO FUNCIONA</p>
          <h2 id="como-title">Do pedido ao arquivo <span>em quatro passos.</span></h2>
        </header>
        <ol className="lp-steps">
          {STEPS.map(([title, text], i) => (
            <li key={title} data-reveal style={{ '--d': `${i * 80}ms` }}>
              <span className="lp-step-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Comparação */}
      <section className="lp-section lp-compare" aria-labelledby="compare-title">
        <header className="lp-head" data-reveal>
          <p className="lp-kicker">SEM BUROCRACIA</p>
          <h2 id="compare-title">Menos cerimônia, <span>mais resultado.</span></h2>
        </header>
        <div className="lp-compare-grid" data-reveal>
          <div className="lp-compare-col is-old">
            <h3>O fluxo de sempre</h3>
            <ul>
              <li>Criar uma worktree</li>
              <li>Abrir uma branch por tarefa</li>
              <li>Revisar o diff de cada agente</li>
              <li>Clicar em Aplicar e resolver conflitos</li>
            </ul>
          </div>
          <div className="lp-compare-col is-new">
            <h3>Com o Claudex</h3>
            <ul>
              <li>Escreve direto na pasta</li>
              <li>Áreas reservadas, sem sobreposição</li>
              <li>Registro compartilhado de decisões e caminhos</li>
              <li>Uma resposta final, com os arquivos prontos</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Começar */}
      <section id="comecar" className="lp-section lp-start" aria-labelledby="start-title">
        <header className="lp-head" data-reveal>
          <p className="lp-kicker">COMEÇAR</p>
          <h2 id="start-title">Rodando em <span>quatro comandos.</span></h2>
          <p className="lp-lead">O Claudex é um app desktop local. Clone o repositório, instale as dependências e abra o app.</p>
        </header>
        <div className="lp-terminal" data-reveal>
          <div className="lp-terminal-bar">
            <span className="dot r" /><span className="dot y" /><span className="dot g" />
            <span className="lp-terminal-title">terminal</span>
            <button className="lp-copy" onClick={copy} aria-live="polite">{copied ? '✓ COPIADO' : 'COPIAR'}</button>
          </div>
          <pre><code>{INSTALL.split('\n').map((line) => (
            <span key={line} className="lp-line"><span className="lp-prompt">$</span> {line}{'\n'}</span>
          ))}</code></pre>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lp-section lp-faq" aria-labelledby="faq-title">
        <header className="lp-head" data-reveal>
          <p className="lp-kicker">PERGUNTAS FREQUENTES</p>
          <h2 id="faq-title">Dúvidas <span>comuns.</span></h2>
        </header>
        <div className="lp-faq-list" data-reveal>
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span aria-hidden="true">+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="lp-cta" aria-labelledby="cta-title" data-reveal>
        <h2 id="cta-title">Peça. <span>Acompanhe.</span> Pronto.</h2>
        <p>Abra uma pasta e escreva o primeiro pedido.</p>
        <div className="lp-cta-actions">
          <a className="lp-btn primary" href={REPO} target="_blank" rel="noopener noreferrer">VER NO GITHUB ↗</a>
          <a className="lp-btn ghost" href="#comecar">COMO INSTALAR</a>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="brand"><img className="brand-icon" src="icon.png" alt="" width="32" height="32" /><span>CLAUDEX</span></div>
        <nav aria-label="Rodapé">
          <a href="#video">Vídeo</a>
          <a href="#recursos">Recursos</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#faq">FAQ</a>
          <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
        <span className="lp-footer-note">VÍDEO GERADO EM CANVAS + REACT · SEM ASSETS EXTERNOS</span>
      </footer>
    </div>
  )
}
