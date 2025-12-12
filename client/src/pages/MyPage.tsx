// client/src/pages/MyPage.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Linkをインポート
import { useAuth } from '../contexts/AuthProvider'; // AuthProviderからuseAuthをインポート

const MyPage = () => {
  const { user, loading } = useAuth(); // userとloadingのみを取得。logoutはグローバルナビへ移動
  const navigate = useNavigate();

  if (loading) {
    return <div className="mypage-container loading">Loading...</div>;
  }

  if (!user) {
    // 未ログインの場合はログインページにリダイレクト
    navigate('/login', { replace: true });
    return null; // リダイレクト後なので何も表示しない
  }

  const roleSpecificContent = user.role === 'user' ? (
    <>
      <div className="card summary-card">
        <h3>こんにちは、{user.name || '利用者さん'}！</h3>
        <p>{user.email}</p>
        <p className="status">事業所を探しています。</p>
      </div>

      <section className="main-actions-section">
        <h2>次の行動</h2>
        <div className="actions-grid">
          <Link to="/browse" className="btn btn-primary btn-large action-card">
            事業所を探す
          </Link>
          <Link to="/favorites" className="btn btn-secondary btn-large action-card">
            お気に入り
            <span className="badge">準備中</span>
          </Link>
          <Link to="/inquiries" className="btn btn-secondary btn-large action-card">
            問い合わせ履歴
            <span className="badge">準備中</span>
          </Link>
        </div>
      </section>

      <section className="settings-section">
        <h2>設定</h2>
        <div className="settings-grid">
          <Link to="/profile" className="btn btn-ghost setting-item">
            プロフィール編集
            <span className="badge">準備中</span>
          </Link>
          <Link to="/password" className="btn btn-ghost setting-item">
            パスワード変更
            <span className="badge">準備中</span>
          </Link>
        </div>
      </section>
    </>
  ) : (
    <>
      <div className="card summary-card">
        <h3>{user.name || '事業所'}様</h3>
        <p>{user.email}</p>
        <p className="status">公開中</p>
      </div>

      <section className="main-actions-section">
        <h2>事業所管理</h2>
        <div className="actions-grid">
          <Link to="/facility/edit" className="btn btn-primary btn-large action-card">
            事業所情報を編集
            <span className="badge">準備中</span>
          </Link>
          <Link to="/facility/availability" className="btn btn-secondary btn-large action-card">
            空き状況を更新
            <span className="badge">準備中</span>
          </Link>
          <Link to="/facility/inquiries" className="btn btn-secondary btn-large action-card">
            問い合わせ一覧
            <span className="badge">準備中</span>
          </Link>
          <Link to={`/facility/${user.id}`} className="btn btn-secondary btn-large action-card">
            公開ページを確認
            <span className="badge">準備中</span>
          </Link>
        </div>
      </section>

      <section className="settings-section">
        <h2>設定</h2>
        <div className="settings-grid">
          <Link to="/settings" className="btn btn-ghost setting-item">
            アカウント設定
            <span className="badge">準備中</span>
          </Link>
        </div>
      </section>
    </>
  );

  return (
    <div className="mypage-container container">
      <h1 className="page-title">マイページ</h1>
      {roleSpecificContent}
    </div>
  );
};

export default MyPage;