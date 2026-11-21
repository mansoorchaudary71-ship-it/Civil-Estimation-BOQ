import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/mona-sans.css'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { initReactivity } from './lib/ReactivityEngine'
import { getBasename } from './lib/toolRoutes'
import { registerPreloadErrorHandler } from './lib/lazyWithRetry'

// Area 4 (2026-11-21): after a GitHub Pages deploy, a stale cached entry can
// request a lazy chunk by its old hash and fail with "Failed to fetch
// dynamically imported module". Reload once so the fresh index.html's chunk
// hashes are used, instead of showing the ErrorBoundary crash screen.
registerPreloadErrorHandler();

initReactivity();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      {/* basename auto-detects a GitHub Pages project-page subpath
          (e.g. /Civil-Estimation-BOQ-main) and is "" on the custom domain. */}
      <BrowserRouter basename={getBasename()}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
