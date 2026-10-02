# Claudex — site e vídeo de apresentação

Site de apresentação do **Claudex**, o aplicativo desktop local que combina o roteador Jev com os SDKs oficiais de Claude Code e Codex. O Claudex escreve direto na pasta do projeto, com uma equipe coordenada de agentes, e não exige Git.

Este repositório contém:

1. **Um vídeo de apresentação** de 48 segundos e 8 cenas, desenhado em código num `<canvas>`, com efeitos sonoros e música de fundo gerados em Web Audio. Não usa imagens, vídeos nem arquivos de áudio.
2. **Uma landing page** logo abaixo do vídeo, com recursos, roteamento de modelos, como funciona, comparação com o fluxo tradicional, instalação e perguntas frequentes.

## Como rodar

Requisito: Node.js 20.19 ou mais novo (exigência do Vite 7).

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar, normalmente `http://localhost:5173`.

| Comando           | O que faz                                                      |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento com recarga automática.            |
| `npm run build`   | Gera o site estático na pasta `dist/` (script `scripts/build.mjs`). |
| `npm run preview` | Serve o conteúdo de `dist/` para conferir o build.             |

Também funciona `npx vite build`, que usa o build normal do Vite.

> Se o `npm install` falhar com o erro `EALLOWSCRIPTS`, o motivo costuma ser a variável de ambiente `npm_config_allow_scripts`. Rode sem ela, por exemplo `env -u npm_config_allow_scripts npm install` no Git Bash.

## O vídeo

O vídeo começa pausado, com o botão **Iniciar com som**. O clique é necessário porque os navegadores só liberam áudio depois de uma ação do usuário.

| #  | Cena                 | Conteúdo                                                                   |
| -- | -------------------- | -------------------------------------------------------------------------- |
| 1  | Claudex              | Abertura com logo animado                                                  |
| 2  | Escreva o pedido     | Janela do app, projetos, pedido digitado e sessão respondendo              |
| 3  | Jev escolhe o modelo | Pedidos roteados para Sonnet, Codex `gpt-6-sol` ou Opus                    |
| 4  | Equipe coordenada    | Coordenador e colaboradores em paralelo, com áreas reservadas              |
| 5  | Direto na sua pasta  | Arquivos novos e editados, registro compartilhado, sem worktrees ou branches |
| 6  | Terminal e controle  | Terminal por projeto, sessões por modelo e "Parar agente"                  |
| 7  | Assinatura ou API    | Uso com assinatura mensal do Claude/Codex ou com chaves de API             |
| 8  | Peça. Acompanhe.     | Fechamento com o comando de instalação                                     |

**Controles**

- Play/pausa, barra de posição, reiniciar e lista de cenas clicável.
- Botões **🔊 Som** e **🎵 Música** para ligar e desligar o áudio.
- Atalhos: `Espaço` ou `K` play/pausa, `←` e `→` voltam e avançam 5 s, `0` reinicia.
- O vídeo pausa sozinho quando sai da tela.
- Abrir a página com `?t=12` começa pausada no segundo 12, sem o botão de início.

**Exportar WebM**

O botão **Exportar WebM** grava o vídeo com áudio e baixa o arquivo `claudex-apresentacao.webm`. A gravação acontece em tempo real, então leva cerca de 48 segundos. Use Chrome ou Edge atualizados.

## Estrutura

```
index.html          Página principal
public/icon.png     Ícone do Claudex (cabeçalho, vídeo e favicon)
vite.config.js      Configuração do Vite (plugin React)
scripts/build.mjs   Build alternativo com Rollup + Babel
src/
  main.jsx          Entrada da aplicação
  App.jsx           Player, controles, exportação e página
  film.js           Cenas do vídeo desenhadas no canvas (1920×1080)
  sound.js          Efeitos sonoros e música de fundo (Web Audio)
  Landing.jsx       Conteúdo da landing page
  index.css         Estilos do player e do cabeçalho
  landing.css       Estilos da landing page
```

## Como editar

- **Textos e cenas do vídeo:** `src/film.js`. A lista `DURS` define a duração de cada cena, e cada cena é uma função `sNome(g, t)` que desenha o quadro no tempo local `t`.
- **Sons e música:** `src/sound.js`. Os efeitos ficam amarrados ao tempo de cada cena na tabela `LOCAL`; a música segue a progressão `BARS`.
- **Landing page:** `src/Landing.jsx` (textos e listas no topo do arquivo) e `src/landing.css`.

Ao mudar a duração de uma cena, ajuste também os tempos dos sons dela em `src/sound.js`.

## Publicar e SEO

- O `npm run build` **pré-renderiza** o HTML (conteúdo visível sem JavaScript, importante para buscadores). Para publicar, use sempre `npm run build`; o `npx vite build` não pré-renderiza.
- O workflow `.github/workflows/pages.yml` publica `dist/` no GitHub Pages a cada push na `main`. No repositório, em **Settings → Pages**, escolha **Source: GitHub Actions**.
- **Vercel:** o `vercel.json` já define o build. Configure `SITE_URL` (endereço final) e `GOOGLE_SITE_VERIFICATION` (código do Search Console) em Settings → Environment Variables. Passo a passo em [docs/SEO.md](docs/SEO.md#30-vercel--google-search-console-passo-a-passo).
- Sem `SITE_URL`, o build usa o domínio da Vercel ou, fora dela, `https://diegoherreradasilva.github.io/site-claudex/` (GitHub Pages).
- Metadados, dados estruturados, `robots.txt`, `sitemap.xml`, imagem de compartilhamento e o passo a passo do Search Console estão em [docs/SEO.md](docs/SEO.md).

## Sobre o Claudex

O Claudex é um aplicativo desktop local em Electron. O Jev escolhe o modelo a cada pedido, e uma equipe coordenada trabalha diretamente na pasta do projeto.

- Funciona com a **assinatura mensal** do Claude e do Codex (login oficial) ou com **chaves de API** da Anthropic e da OpenAI. A chave de API tem prioridade sobre o login e pode gerar cobrança por uso.
- Papéis padrão: mudanças simples com Claude Sonnet, implementação com Codex `gpt-6-sol` e arquitetura com Claude Opus.
- Até 4 agentes ativos e 2 níveis de delegação, com áreas de edição reservadas para evitar sobreposição.
- Terminal por projeto, sessões por modelo e botão "Parar agente".

Repositório do aplicativo: <https://github.com/DiegoHerreraDaSilva/claudex>

## Licença

O aplicativo Claudex usa a licença MIT. Este site ainda não tem arquivo de licença próprio.
