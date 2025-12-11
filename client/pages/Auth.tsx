import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Assuming you have an api.ts for axios instance

interface AuthPageProps {
  mode: 'login' | 'register';
}

export default function AuthPage({ mode }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'facility'
  const [facilityName, setFacilityName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Redirect to dashboard or home
        navigate('/dashboard'); 
      } else {
        // Register
        const registrationData: any = { email, password, name, role };
        if (role === 'facility') {
          registrationData.facility_name = facilityName;
        }
        const response = await api.post('/auth/register', registrationData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Redirect to dashboard or home
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || '認証に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2>{isLogin ? 'ログイン' : '新規登録'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">氏名/担当者名</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">登録区分</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">利用者</option>
                  <option value="facility">事業所</option>
                </select>
              </div>
              {role === 'facility' && (
                <div className="form-group">
                  <label htmlFor="facilityName">事業所名</label>
                  <input
                    type="text"
                    id="facilityName"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録')}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? 'アカウントをお持ちではありませんか？' : 'すでにアカウントをお持ちですか？'}
          <button type="button" className="btn btn-link" onClick={() => navigate(isLogin ? '/register' : '/login')}>
            {isLogin ? '新規登録' : 'ログイン'}
          </button>
        </p>
      </div>
    </div>
  );
}