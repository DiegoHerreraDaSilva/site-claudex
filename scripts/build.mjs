import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { rollup } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { transformAsync } from '@babel/core'
import transformJsx from '@babel/plugin-transform-react-jsx'

const root = resolve(import.meta.dirname, '..')
let css = ''
const bundle = await rollup({
  input: resolve(root, 'src/main.jsx'),
  plugins: [
    {
      name: 'jsx-and-css',
      async transform(code, id) {
        if (id.endsWith('.css')) {
          css += code
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
    nodeResolve({ browser: true, extensions: ['.js', '.jsx'] }),
    commonjs(),
  ],
  onwarn(warning, defaultHandler) {
    if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') defaultHandler(warning)
  },
})

const out = resolve(root, 'dist')
await rm(out, { recursive: true, force: true })
await mkdir(resolve(out, 'assets'), { recursive: true })
await bundle.write({ file: resolve(out, 'assets/app.js'), format: 'es' })
await bundle.close()
await writeFile(resolve(out, 'assets/app.css'), css)
const html = (await readFile(resolve(root, 'index.html'), 'utf8'))
  .replace('<script type="module" src="/src/main.jsx"></script>', '<link rel="stylesheet" href="./assets/app.css" /><script type="module" src="./assets/app.js"></script>')
await writeFile(resolve(out, 'index.html'), html)
console.log('Built dist/index.html, dist/assets/app.js and dist/assets/app.css')
