// AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

type AuthContextType = {
  session: Session | null; // SupabaseのSessionは使わないが型定義は残す
  user: DummyUser | null;       // SupabaseのUserは使わないが型定義は残す
  loading: boolean;
  isAuthenticated: boolean; // ログイン状態かどうか
  login: (email: string, password: string) => Promise<void>; // loginメソッドを追加
  logout: () => void;      // signOutをlogoutにリネーム
};

// 開発用のダミーUser型
interface DummyUser {
  id: string;
  email: string;
  role: 'user' | 'facility';
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // sessionとuserはsupabase依存しないダミーログイン用に修正
  const [session, setSession] = useState<Session | null>(null); // ダミーログインでは使用しない
  const [user, setUser] = useState<DummyUser | null>(null);
  const [loading, setLoading] = useState(true);

  // isAuthenticatedを明示的に計算
  const isAuthenticated = !!user;

  useEffect(() => {
    // localStorageからログイン情報を復元
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        // ダミーなのでSessionは再構築しない
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);

    // Supabaseの認証状態変化はダミーログインでは不要なのでコメントアウトまたは削除
    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //   (_event, session) => {
    //     setSession(session);
    //     setUser(session?.user ?? null);
    //     setLoading(false);
    //   }
    // );
    // return () => {
    //   authListener?.subscription.unsubscribe();
    // };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    let role: 'user' | 'facility' | null = null;
    let name: string = '';

    if (email === 'a@a' && password === 'a') {
      role = 'user';
      name = '利用者A';
    } else if (email === 'b@b' && password === 'b') {
      role = 'facility';
      name = '事業所B';
    } else {
      setLoading(false);
      throw new Error('Invalid email or password');
    }

    const dummyUser: DummyUser = { id: email, email, role, name };
    const dummyToken = `dummy-token-${role}-${Math.random().toString(36).substring(2, 9)}`;

    localStorage.setItem('user', JSON.stringify(dummyUser));
    localStorage.setItem('token', dummyToken);
    setUser(dummyUser);
    setSession(null); // ダミーなのでSessionはnull

    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setSession(null); // ダミーなのでSessionはnull
  };

  const value = {
    session,
    user,
    loading,
    isAuthenticated, // isAuthenticatedを追加
    login, // loginメソッドを追加
    logout, // signOutをlogoutにリネーム
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth was called outside of AuthProvider. Falling back to guest mode.');
    // 「未ログイン扱い」で動く安全なデフォルト値を返す
    return {
      session: null,
      user: null,
      loading: false,
      isAuthenticated: false, // ダミーなのでfalse
      login: async () => { throw new Error('Auth not initialized'); }, // ダミーlogin
      logout: () => { /* 何もしないダミー */ },
    };
  }
  return context;
};
