import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/mona-sans.css'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { initReactivity } from './lib/ReactivityEngine'
import { getBasename } from './lib/toolRoutes'

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
