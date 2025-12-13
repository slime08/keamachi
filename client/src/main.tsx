// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import './styles.css'
import { sanitizeLocalStorage } from './utils/storage'
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter for client/src/main.tsx

import { AuthProvider } from './contexts/AuthProvider'; // Import AuthProvider

// Sanitize localStorage early to avoid JSON.parse('undefined') at runtime
sanitizeLocalStorage(['token', 'user'])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter> {/* Wrap App with BrowserRouter */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
