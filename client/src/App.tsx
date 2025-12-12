import { useEffect } from 'react'
import api from './api';
import { Routes, Route, Navigate } from 'react-router-dom' // Removed BrowserRouter as Router
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import MyPage from './pages/MyPage' // MyPageをインポート
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
          console.warn('警告：Backend server may not be running. Using mock data.')
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
    <div className="app"> {/* Router element removed */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/mypage" element={<ProtectedRoute element={<MyPage />} />} /> {/* マイページルートを追加 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
