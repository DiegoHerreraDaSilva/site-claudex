# SEO do site do Claudex

Este documento descreve a arquitetura de SEO do site, o que já está implementado no código e o que precisa ser feito fora dele (publicação, Search Console, divulgação).

URL considerada canônica: **https://diegoherreradasilva.github.io/site-claudex/** (GitHub Pages do repositório `site-claudex`). Se o site for publicado em outro endereço ou ganhar domínio próprio, troque essa URL em todos os pontos listados em [Onde a URL aparece](#onde-a-url-aparece).

---

## 1. Objetivo e público

| Item | Definição |
| --- | --- |
| Objetivo | Ser encontrado por quem procura o Claudex pelo nome e por quem procura uma forma de orquestrar Claude Code e Codex. Levar essas pessoas ao repositório do app. |
| Público | Pessoas desenvolvedoras de língua portuguesa que já usam Claude Code ou Codex, ou que avaliam agentes de IA para programar. |
| Conversão principal | Clique em **VER NO GITHUB** ou nos comandos de instalação. |
| Idioma | `pt-BR` (página única, sem versão em inglês por enquanto). |

### Palavras-chave

| Tipo | Termos | Onde estão na página |
| --- | --- | --- |
| Marca | claudex, claudex app, claudex github | `<title>`, H1, rodapé, JSON-LD |
| Principal | equipe de agentes de IA, agentes de IA para programação, orquestrar Claude Code e Codex | `<title>`, description, H1, manifesto |
| Secundárias | Claude Code com assinatura, Codex com assinatura ou API, Claude Sonnet / Opus e Codex juntos, IA que edita arquivos sem Git | seções Recursos, Assinatura ou API, Modelos e FAQ |
| Cauda longa (perguntas) | "preciso pagar API para usar Claude Code?", "como usar Claude Code e Codex juntos", "agente de IA sem Git" | FAQ (também em JSON-LD `FAQPage`) |

---

## 2. Arquitetura técnica

### 2.1 Conteúdo indexável sem JavaScript (pré-renderização)

O site é React e o vídeo é desenhado num `<canvas>`. Sem tratamento, o HTML entregue ficaria com `<div id="root"></div>` vazio, e redes sociais e buscadores que não executam JS não veriam nada.

- `npm run build` (`scripts/build.mjs`) gera um bundle de servidor a partir de `src/entry-server.jsx`, roda `renderToString(<App />)` e injeta o HTML dentro de `#root` em `dist/index.html`.
- `src/main.jsx` usa `hydrateRoot` quando o HTML já veio pré-renderizado, e `createRoot` no `npm run dev`.
- `App.jsx` não acessa `window` durante o render, o que é necessário para o SSR funcionar.
- As animações de entrada da landing (`[data-reveal]`) só escondem o conteúdo quando a classe `js` está no `<html>`. Essa classe é adicionada por um script inline no `<head>`, então sem JS o texto fica visível.
- O `npx vite build` continua funcionando, mas **não** pré-renderiza. Para publicar, use `npm run build`.

### 2.2 Metadados (`index.html`)

- `<title>` com marca e proposta, com cerca de 70 caracteres.
- `meta description` com cerca de 230 caracteres. O Google costuma mostrar de 150 a 160, e a parte que importa está no começo.
- `link rel="canonical"`, `hreflang` `pt-BR` e `x-default`, e `meta robots` com `max-image-preview:large`.
- Open Graph e Twitter Card com a imagem `og-image.png` (1200×630).
- `theme-color`, `color-scheme`, favicon, `apple-touch-icon` e `site.webmanifest`.
- `<noscript>` com o link para o repositório.

### 2.3 Dados estruturados (schema.org, JSON-LD)

| Tipo | Onde | Observação |
| --- | --- | --- |
| `WebSite` | `index.html` | Nome do site, idioma e publicador. |
| `Person` | `index.html` | Autor: Diego Herrera da Silva (GitHub). |
| `SoftwareApplication` | `index.html` | Categoria `DeveloperApplication`, gratuito (`offers` com preço 0), licença MIT, repositório e imagem. |
| `FAQPage` | gerado em `src/Landing.jsx` | Montado do mesmo array `FAQ` que aparece na tela, então nunca ficam diferentes. |

> O Google hoje só mostra o resultado rico de FAQ para sites de governo e saúde, e o de `SoftwareApplication` exige avaliações (`aggregateRating`). Os dados continuam úteis para o entendimento da página, para o Bing e para buscadores com IA, mas não espere estrelas ou FAQ expandido no resultado.

### 2.4 Semântica e acessibilidade (também contam para SEO)

- Um único `<h1>` descritivo: "Claudex: uma equipe de IA direto na sua pasta."
- Cada seção da landing tem `<h2>` com `aria-labelledby`, e os cards e passos usam `<h3>`.
- **Transcrição do vídeo** (`<details>` abaixo do player): o texto das 8 cenas em HTML. O canvas não é lido por buscadores nem por leitores de tela.
- Links externos com `rel="noopener noreferrer"`. Ícones decorativos com `alt=""`.
- Âncoras estáveis para links diretos: `#video`, `#recursos`, `#contas`, `#modelos`, `#como-funciona`, `#comecar`, `#faq`.

### 2.5 Arquivos de rastreamento (`public/`)

| Arquivo | Função |
| --- | --- |
| `robots.txt` | Libera tudo e aponta o sitemap. |
| `sitemap.xml` | Uma URL (a página única), com `lastmod`. Atualize a data quando o conteúdo mudar. |
| `site.webmanifest` | Nome, cores e ícone para instalação e para a aba do navegador. |
| `og-image.png` | Imagem de compartilhamento. A fonte está em `scripts/og/og-image.html`. |

> **Limitação do GitHub Pages em subpasta:** buscadores só leem `robots.txt` na raiz do domínio (`diegoherreradasilva.github.io/robots.txt`), não em `/site-claudex/robots.txt`. Por isso o sitemap precisa ser **enviado manualmente** no Search Console (passo 3.2). Com domínio próprio, essa limitação some.

### 2.6 Desempenho (Core Web Vitals)

- Sem fontes externas nem imagens pesadas na primeira dobra. O vídeo é desenhado por código.
- O JS principal tem cerca de 80 kB com gzip.
- O vídeo começa pausado e só anima quando está visível. Ao sair da tela, ele pausa, o que reduz trabalho de CPU.
- Melhorias possíveis: dividir o `film.js` e o `sound.js` em um chunk carregado depois da primeira pintura, e colocar `width`/`height` no canvas via CSS `aspect-ratio`, que já existe, para evitar CLS.

### Regerar a imagem de compartilhamento

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --screenshot="C:\\caminho\\para\\teste\\public\\og-image.png" \
  "file:///C:/caminho/para/teste/scripts/og/og-image.html"
```

Rode com `timeout 45` na frente, porque o Edge sem tela às vezes trava.

---

## 3. Fora do código: publicação e acompanhamento

### 3.0 Vercel + Google Search Console (passo a passo)

O projeto já está preparado: `vercel.json` (comando de build, pasta `dist`, cabeçalhos de segurança) e um `scripts/build.mjs` que ajusta o endereço do site, o `sitemap.xml` e a verificação do Google na hora do build.

**1. Publicar na Vercel**

1. Em vercel.com, **Add New → Project**, importe o repositório `site-claudex`. A Vercel lê o `vercel.json`: Build Command `npm run build`, Output Directory `dist`. Não precisa mudar nada.
2. Em **Settings → Environment Variables** (Production), defina:

| Variável | Para quê | Exemplo |
| --- | --- | --- |
| `SITE_URL` | Endereço final do site. Vira `canonical`, `og:url`, `og:image`, JSON-LD, `sitemap.xml` e `robots.txt`. | `https://claudex.com.br` |
| `GOOGLE_SITE_VERIFICATION` | Código da meta tag de verificação do Search Console (só o valor de `content`). | `aBc123...` |
| `BING_SITE_VERIFICATION` | Opcional. Código do Bing Webmaster (`msvalidate.01`). | `1A2B3C...` |

   Se você **não** definir `SITE_URL`, o build usa o domínio de produção da Vercel (`VERCEL_PROJECT_PRODUCTION_URL`, algo como `claudex-site.vercel.app`). Para o Google, **o `SITE_URL` precisa ser o endereço que você vai cadastrar no Search Console**, senão o `canonical` aponta para outro lugar.
3. Se tiver domínio próprio, adicione em **Settings → Domains** e use esse endereço no `SITE_URL`. Depois de mudar variáveis, faça um **Redeploy** (elas só entram no build).
4. Abra `https://SEU-SITE/sitemap.xml`, `/robots.txt` e `/og-image.png` para conferir que respondem 200 e que mostram o endereço certo.

> Previews da Vercel (`*-git-branch-*.vercel.app`) recebem `X-Robots-Tag: noindex` automaticamente, então não competem com o site principal.

**2. Google Search Console**

1. Em search.google.com/search-console, **Adicionar propriedade**.
   - Com domínio próprio, prefira **Domínio** (verifica por DNS).
   - Em `*.vercel.app`, use **Prefixo do URL** com o endereço completo, com `https://` e barra final.
2. Método de verificação **Tag HTML**: copie só o valor de `content="..."`, coloque em `GOOGLE_SITE_VERIFICATION` na Vercel, faça **Redeploy** e clique em **Verificar**.
   - Alternativa: baixar o arquivo `googleXXXXXXXX.html` e colocá-lo em `public/` (é copiado para a raiz do site).
3. Em **Sitemaps**, envie `sitemap.xml`.
4. Em **Inspeção de URL**, cole a página inicial e clique em **Solicitar indexação**.
5. Depois de alguns dias, veja **Páginas** e **Desempenho** (impressões e cliques para "claudex").

**3. Checklist depois do ar**

- [ ] Página abre, o vídeo toca depois do clique e o ícone aparece na aba.
- [ ] Código-fonte da página (Ctrl+U) mostra o `<h1>` e o texto da landing.
- [ ] `canonical` e `og:url` mostram o endereço final (não o do GitHub Pages).
- [ ] [Teste de Resultados Rich](https://search.google.com/test/rich-results) reconhece `SoftwareApplication` e `FAQPage`.
- [ ] Prévia de compartilhamento correta em [opengraph.xyz](https://www.opengraph.xyz/) e no WhatsApp.
- [ ] PageSpeed Insights (mobile e desktop) sem alertas graves.

### 3.0.1 Outras opções de publicação

O workflow `.github/workflows/pages.yml` continua publicando no GitHub Pages. Para usar só a Vercel, apague esse arquivo, para não existirem dois sites com o mesmo conteúdo (conteúdo duplicado atrapalha o ranqueamento).


### 3.1 Publicar

1. Enviar o código ao repositório `site-claudex` (branch `main`). O workflow `.github/workflows/pages.yml` roda `npm run build` e publica `dist/` no GitHub Pages. Em Settings → Pages, escolha **Source: GitHub Actions**.
2. Conferir que `https://diegoherreradasilva.github.io/site-claudex/og-image.png` e `/sitemap.xml` abrem.

### 3.2 Google Search Console e Bing Webmaster Tools

1. Adicionar a propriedade de prefixo de URL `https://diegoherreradasilva.github.io/site-claudex/`. A verificação pode ser feita por meta tag no `<head>` ou por arquivo HTML em `public/`.
2. Enviar o sitemap `https://diegoherreradasilva.github.io/site-claudex/sitemap.xml`.
3. Usar **Inspeção de URL → Solicitar indexação**.
4. No Bing, importar a propriedade direto do Search Console. O Bing também alimenta o Copilot e o DuckDuckGo.

### 3.3 Validar

- [Teste de resultados avançados](https://search.google.com/test/rich-results) e [validador do schema.org](https://validator.schema.org/): conferir `SoftwareApplication` e `FAQPage`.
- Prévia de compartilhamento: [opengraph.xyz](https://www.opengraph.xyz/), Post Inspector do LinkedIn e o envio do link para si mesmo no WhatsApp.
- PageSpeed Insights (mobile e desktop): metas de LCP abaixo de 2,5 s, CLS abaixo de 0,1 e INP abaixo de 200 ms.

### 3.4 Autoridade (links de entrada)

- No repositório `claudex`, colocar o link do site no campo **Website** do "About" e no topo do README.
- Adicionar tópicos no GitHub: `claude-code`, `codex`, `ai-agents`, `electron`, `multi-agent`.
- Divulgar com o link do site, que puxa a `og-image`, em: LinkedIn, X, comunidades brasileiras de dev (TabNews, Dev.to em português, Discords de IA) e um post de lançamento no Show HN ou no Reddit (`r/ClaudeAI`, `r/programming`).

### 3.5 Roteiro de conteúdo (próximas páginas)

Uma página única tem pouco espaço para ranquear em vários termos. Páginas novas, cada uma com seu `<title>`, H1 e entrada no `sitemap.xml`:

1. `/como-usar-claude-code-e-codex-juntos/`: tutorial passo a passo.
2. `/assinatura-ou-api/`: diferença de custo e configuração entre login por assinatura e chave de API.
3. `/novidades/`: changelog das versões do Claudex. Gera conteúdo novo de forma recorrente.
4. Versão em inglês (`/en/`) com `hreflang`, para alcançar o público global de Claude Code e Codex.

> O site hoje é uma página só, sem roteador. Adicionar páginas exige pré-renderizar cada rota no `scripts/build.mjs`, da mesma forma que a página principal.

### 3.6 Métrica

- Search Console: impressões e cliques para "claudex" e para os termos principais, e a posição média.
- Para medir os cliques em **VER NO GITHUB**, use uma ferramenta de analytics leve e sem cookies (por exemplo Plausible ou Umami). Com Google Analytics, é preciso aviso de cookies por causa da LGPD.

---

## Onde a URL aparece

O endereço padrão vem de `scripts/build.mjs` (`DEFAULT_SITE_URL`) e é trocado no build pela variável `SITE_URL` (ver 3.0). Os arquivos-fonte ainda trazem o endereço padrão em:

- `index.html`: canonical, hreflang, `og:url`, `og:image`, `twitter:image` e JSON-LD;
- `public/robots.txt`;
- `public/sitemap.xml`.
