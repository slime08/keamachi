import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import BrowseFacilities from './Browse'

interface Facility {
  id: number
  name: string
  description: string
  location: string
  service_type: string
  rating?: number
  reviews?: number
  imageUrl?: string
  availability?: {
    mon: 'open' | 'limited' | 'closed'
    tue: 'open' | 'limited' | 'closed'
    wed: 'open' | 'limited' | 'closed'
    thu: 'open' | 'limited' | 'closed'
    fri: 'open' | 'limited' | 'closed'
    sat: 'open' | 'limited' | 'closed'
    sun: 'open' | 'limited' | 'closed'
  }
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedWeekday, setSelectedWeekday] = useState<'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>('all')

  return (
    <div className="home-page">
      {/* ナビゲーションバー */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">❤️</span>
            <span className="logo-text">ケアマチ</span>
          </div>
          <div className="nav-links">
            <a href="#features">特徴</a>
            <a href="#services">サービス</a>
            <a href="#contact">お問い合わせ</a>
            <Link to="/login" className="nav-login">ログイン</Link>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1>福祉サービスと利用者を<br />つなぐモダンなマッチング</h1>
            <p>質の高い福祉サービスを、必要な人へ。事業所と利用者の最適なマッチングを、シンプルで直感的な体験でサポートします。</p>
            <div className="hero-buttons">
              <Link to="/register?role=user" className="btn btn-primary">利用者として登録</Link>
              <Link to="/register?role=facility" className="btn btn-secondary">事業所として登録</Link>
            </div>
          </div>
          <div className="hero-illustration card">
            <img
              src="/keamachi/LP.png"
              alt="ケアマチの利用イメージ"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Search card overlapping hero */}
      <div className="container search-card">
        <div className="search-row">
          <input type="text" placeholder="事業所名・住所で検索" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{flex:1}} />
          <select value={selectedService} onChange={e=>setSelectedService(e.target.value)}>
            <option value="all">すべての種別</option>
            <option value="訪問介護">訪問介護</option>
            <option value="デイサービス">デイサービス</option>
            <option value="グループホーム">グループホーム</option>
            <option value="老健施設">老健施設</option>
            <option value="障害福祉">障害福祉</option>
            <option value="児童福祉">児童福祉</option>
          </select>
          <button className="btn btn-primary">検索</button>
        </div>
        <div className="weekday-toggle weekday-filter">
          {[['all','すべて'],['mon','月'],['tue','火'],['wed','水'],['thu','木'],['fri','金'],['sat','土'],['sun','日']].map(([k,label])=> (
            <button key={k} onClick={()=>setSelectedWeekday(k as any)} className={selectedWeekday===k ? 'btn btn-primary' : 'btn btn-ghost'}>{label}</button>
          ))}
        </div>
      </div>
      
          {/* 事業所一覧（ホームで表示） */}
          <section className="container featured-section" style={{paddingTop:24}}>
            <h2>事業所一覧</h2>
            <BrowseFacilities initialSearch={searchQuery} initialService={selectedService} initialLocation={selectedLocation} initialWeekday={selectedWeekday} showControls={false} />
          </section>

      {/* 特徴セクション */}
      <section id="features" className="features">
        <div className="container">
          <h2>ケアマチの特徴</h2>
          <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>簡単検索</h3>
            <p>住所、サービス種別など、様々な条件から<br />
               あなたに合った事業所を簡単に検索できます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>信頼できる評価</h3>
            <p>実際の利用者による詳細なレビューで、<br />
               事業所の特徴が一目瞭然です。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>直接やりとり</h3>
            <p>アプリ内メッセージで事業所と<br />
               直接コミュニケーションできます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>安全で確実</h3>
            <p>すべての情報は暗号化され、<br />
               個人情報の保護に万全を尽くしています。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>マッチング支援</h3>
            <p>AIが最適な事業所を推奨し、<br />
               効率的なマッチングをサポートします。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>24/7 利用可能</h3>
            <p>いつでも、どこでも、スマートフォンから<br />
               事業所情報を確認できます。</p>
          </div>
          </div>
        </div>
      </section>

      {/* サービス種別セクション */}
      <section id="services" className="services">
        <div className="container">
          <h2>提供サービス</h2>
          <div className="services-grid">
          <div className="service-item">
            <h3>訪問介護</h3>
            <p>自宅での生活援助や身体介護</p>
            <span className="badge">人気</span>
          </div>
          <div className="service-item">
            <h3>デイサービス</h3>
            <p>日中の介護・リハビリサービス</p>
          </div>
          <div className="service-item">
            <h3>グループホーム</h3>
            <p>認知症対応の共同生活支援</p>
          </div>
          <div className="service-item">
            <h3>老健施設</h3>
            <p>リハビリと介護の総合施設</p>
          </div>
          <div className="service-item">
            <h3>障害福祉と児童福祉</h3>
            <p>障害者支援と児童発達支援</p>
          </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="cta">
        <div className="container">
          <h2>今すぐケアマチを始めましょう</h2>
          <p>質の高い福祉サービスとのマッチングは、ケアマチで。</p>
          <div className="cta-buttons">
            <a href="/browse" className="btn btn-large btn-primary">事業所を探す</a>
            <a href="/register" className="btn btn-large btn-secondary">新規登録</a>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="footer">
        <div className="footer-content container">
          <div className="footer-section">
            <h4>ケアマチについて</h4>
            <ul>
              <li><a href="#">運営会社</a></li>
              <li><a href="#">ニュース</a></li>
              <li><a href="#">ブログ</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>利用者向け</h4>
            <ul>
              <li><a href="#">よくある質問</a></li>
              <li><a href="#">使い方</a></li>
              <li><a href="#">レビュー方法</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>事業所向け</h4>
            <ul>
              <li><a href="#">掲載方法</a></li>
              <li><a href="#">料金</a></li>
              <li><a href="#">サポート</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>法務</h4>
            <ul>
              <li><a href="#">プライバシー</a></li>
              <li><a href="#">利用規約</a></li>
              <li><a href="#">特定商取引法</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ケアマチ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}