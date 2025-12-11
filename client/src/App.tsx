import { useEffect } from 'react'
import api from './api';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import { useAuth } from './hooks/useAuth' // Re-import useAuth

function App() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if server is running
    const checkServer = async () => {
      try {
        const response = await api.get('/health').catch(() => null)
        
        if (!response || response.status !== 200) {
          console.warn('笞・・Backend server may not be running. Using mock data.')
        }
      } catch (error) {
        console.warn('Backend connection check failed:', error)
      }
    }
    checkServer()
  }, [])

  // Protected route wrapper
  const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
    if (loading) {
      return <div className="loading-spinner">Loading authentication...</div>;
    }
    return isAuthenticated ? element : <Navigate to="/login" replace />
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
