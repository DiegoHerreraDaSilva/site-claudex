import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Com ?t= o estado inicial difere do HTML pré-renderizado (t=0), então renderiza do zero em vez de hidratar.
const startsAtTime = new URLSearchParams(window.location.search).has('t')

if (root.hasChildNodes() && !startsAtTime) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
