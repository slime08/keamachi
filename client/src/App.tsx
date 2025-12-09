import { useEffect } from 'react'
import api from './api'; // api.ts からインポートを追加
// App.css is imported centrally in main.tsx to control load order
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import { useAuth } from './hooks/useAuth'

function App() {
  const { token } = useAuth()

  useEffect(() => {
    // Check if server is running
    const checkServer = async () => {
      try {
        const response = await api.get('/health').catch(() => null)
        
        if (!response || response.status !== 200) { // response.ok の代わりに status をチェック
          console.warn('⚠️ Backend server may not be running. Using mock data.')
        }
      } catch (error) {
        console.warn('Backend connection check failed:', error)
      }
    }
    checkServer()
  }, [])

  // Protected route wrapper
  const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
    return token ? element : <Navigate to="/login" replace />
  }

  return (
    <Router basename="/keamachi">
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Home />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App