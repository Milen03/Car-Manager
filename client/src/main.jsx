import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, MemoryRouter } from 'react-router'
import DemoBanner from './demo/DemoBanner.jsx'
import { demoAlert } from './demo/dialogs.js'

const isDemo = import.meta.env.VITE_DEMO === 'true'

// The demo is published as a single page inside a frame, where the URL path
// can't change and alert() is never shown.
if (isDemo) {
    window.alert = demoAlert
}

const Router = isDemo ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
    <Router>
    <App />
    {isDemo && <DemoBanner />}
    </Router>
  
)
