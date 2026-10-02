import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: o site funciona na raiz e em subpasta (GitHub Pages: /site-claudex/).
export default defineConfig({ base: './', plugins: [react()] })
