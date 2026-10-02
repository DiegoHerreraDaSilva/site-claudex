import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rollup } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { transformAsync } from '@babel/core'
import transformJsx from '@babel/plugin-transform-react-jsx'

const root = resolve(import.meta.dirname, '..')
let css = ''
const createBundle = (entry, server = false) => rollup({
  input: resolve(root, entry),
  plugins: [
    {
      name: 'jsx-and-css',
      async transform(code, id) {
        if (id.endsWith('.css')) {
          if (!server) css += code
          return { code: '', moduleSideEffects: false }
        }
        const source = code.replaceAll('process.env.NODE_ENV', '"production"')
        if (!id.endsWith('.jsx')) return source === code ? null : { code: source, map: null }
        const result = await transformAsync(source, {
          filename: id,
          babelrc: false,
          configFile: false,
          plugins: [[transformJsx, { runtime: 'automatic' }]],
        })
        return { code: result.code, map: result.map }
      },
    },
    nodeResolve({ browser: !server, extensions: ['.js', '.jsx'] }),
    commonjs(),
  ],
  onwarn(warning, defaultHandler) {
    if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') defaultHandler(warning)
  },
})

const bundle = await createBundle('src/main.jsx')
const out = resolve(root, 'dist')
await rm(out, { recursive: true, force: true })
await mkdir(resolve(out, 'assets'), { recursive: true })
await bundle.write({ file: resolve(out, 'assets/app.js'), format: 'es' })
await bundle.close()
await writeFile(resolve(out, 'assets/app.css'), css)
const ssrDir = resolve(out, '.ssr')
let renderedHtml
try {
  const serverBundle = await createBundle('src/entry-server.jsx', true)
  const serverEntry = resolve(ssrDir, 'entry-server.mjs')
  try {
    await serverBundle.write({ file: serverEntry, format: 'es' })
  } finally {
    await serverBundle.close()
  }
  const { render } = await import(pathToFileURL(serverEntry).href)
  renderedHtml = render()
} finally {
  await rm(ssrDir, { recursive: true, force: true })
}
const template = await readFile(resolve(root, 'index.html'), 'utf8')
const rootPlaceholder = '<div id="root"></div>'
if (!template.includes(rootPlaceholder)) {
  throw new Error(`Missing prerender placeholder: ${rootPlaceholder}`)
}
const html = template
  .replace(rootPlaceholder, () => `<div id="root">${renderedHtml}</div>`)
  .replace('<script type="module" src="/src/main.jsx"></script>', '<link rel="stylesheet" href="./assets/app.css" /><script type="module" src="./assets/app.js"></script>')
await writeFile(resolve(out, 'index.html'), html)
await cp(resolve(root, 'public'), out, { recursive: true }).catch(() => {})

// ---- URL do site, datas e verificação dos buscadores (configurável por variável de ambiente) ----
// O endereço padrão é o do site na Vercel. Se ligar um domínio próprio, defina SITE_URL (ex.: https://claudex.com.br).
const DEFAULT_SITE_URL = 'https://site-claudex.vercel.app/'
const withSlash = (url) => (url.endsWith('/') ? url : `${url}/`)
const siteUrl = withSlash((process.env.SITE_URL || DEFAULT_SITE_URL).trim())
const today = new Date().toISOString().slice(0, 10)

const verification = []
if (process.env.GOOGLE_SITE_VERIFICATION) verification.push(`<meta name="google-site-verification" content="${process.env.GOOGLE_SITE_VERIFICATION}" />`)
if (process.env.BING_SITE_VERIFICATION) verification.push(`<meta name="msvalidate.01" content="${process.env.BING_SITE_VERIFICATION}" />`)

for (const file of ['index.html', 'sitemap.xml', 'robots.txt']) {
  const path = resolve(out, file)
  let text
  try { text = await readFile(path, 'utf8') } catch { continue }
  text = text.replaceAll(DEFAULT_SITE_URL, siteUrl)
  if (file === 'sitemap.xml') text = text.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
  if (file === 'index.html' && verification.length) {
    // não duplica uma meta tag que já esteja escrita no index.html
    const missing = verification.filter((tag) => !text.includes(tag.match(/name="[^"]+"/)[0]))
    const tags = missing.map((tag) => `    ${tag}\n`).join('')
    text = text.replace('</head>', () => `${tags}  </head>`)
  }
  await writeFile(path, text)
}
console.log(`Site URL: ${siteUrl}${verification.length ? ` (verificação: ${verification.length} meta tag(s))` : ''}`)
console.log('Built prerendered dist/index.html, dist/assets/app.js and dist/assets/app.css')
