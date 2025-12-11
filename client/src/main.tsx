import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import './styles.css'
import { sanitizeLocalStorage } from './utils/storage'

import { AuthProvider } from './contexts/AuthProvider'; // Import AuthProvider

// Sanitize localStorage early to avoid JSON.parse('undefined') at runtime
sanitizeLocalStorage(['token'])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap App with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
