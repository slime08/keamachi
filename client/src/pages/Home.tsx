import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import BrowseFacilities from './Browse'
import { SERVICE_OPTIONS } from '../constants/services';
import lpImage from "../assets/lp.png";
import { useAuth } from '../contexts/AuthProvider';
import { JAPANESE_PREFECTURES } from '../constants/prefectures'; // Import prefectures


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
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedWeekday, setSelectedWeekday] = useState<'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCityQuery, setCurrentCityQuery] = useState(''); // New local state for city in modal


  // For the actual search to be triggered when the button is clicked,
  // we'll manage the search state that gets passed to BrowseFacilities.
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [currentSelectedService, setCurrentSelectedService] = useState('all');
  const [currentSelectedLocation, setCurrentSelectedLocation] = useState('all');
  const [currentSelectedWeekday, setCurrentSelectedWeekday] = useState<'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>('all');

  const handleSearch = () => {
    setCurrentSearchQuery(searchQuery);
    setCurrentSelectedService(selectedService);
    setCurrentSelectedLocation(selectedLocation);
    setCurrentSelectedWeekday(selectedWeekday);
    setCurrentCityQuery(currentCityQuery); // Pass city query from modal
  };

  // Determine if any advanced filters are active (for button styling)
  const areAdvancedFiltersActive = selectedLocation !== 'all' || selectedWeekday !== 'all';

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
            {isAuthenticated ? (
              <>
                <Link to="/mypage" className="nav-login">マイページ</Link>
                <button onClick={handleLogout} className="nav-login nav-logout-button">ログアウト</button>
              </>
            ) : (
              <Link to="/login" className="nav-login">ログイン</Link>
            )}
          </div>
        </div>
      </nav>

      {/* LPと登録が一番上 (ヒーローセクション) */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1>福祉サービスと利用者を<br />つなぐモダンなマッチング</h1>
            <p>質の高い福祉サービスを、必要な人へ。事業所と利用者の最適なマッチングを、ニーズに合わせてサポートします。</p>
            <div className="hero-buttons">
              <Link to="/register?role=user" className="btn btn-primary">利用者として登録</Link>
              <Link to="/register?role=facility" className="btn btn-secondary">事業所として登録</Link>
            </div>
            <div className="registration-info">
              <p><span>利用者登録は無料です。</span></p>
              <p><span>事業所登録は、3ヶ月無料で、その翌月から500円/月、広告を消す設定にする場合は2000円/月です。</span></p>
            </div>
          </div>
          <div className="hero-illustration card">
            <img
              src={lpImage}
              alt="ケアマチの利用イメージ"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* キーワード検索、種別選択、検索ボタン */}
      <h2 className="search-section-title container">事業所を探す</h2>
      <p className="search-section-description container">地域や条件から事業所を探せます</p>
      <div className="container main-search-controls">
        <div className="search-row">
          <input type="text" placeholder="事業所名・キーワードで検索" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{flex:1}} />
          <select value={selectedService} onChange={e=>setSelectedService(e.target.value)}>
            <option value="all">すべての種別</option>
            {SERVICE_OPTIONS.map(service => (
              <option key={service.key} value={service.label}>{service.label}</option>
            ))}
          </select>
          <button className="btn btn-primary main-search-button" onClick={handleSearch}>検索</button>
        </div>
      </div>

      {/* 詳細検索ボタン */}
      <div className="container advanced-search-toggle-area">
        <button 
          className={`advanced-search-button ${areAdvancedFiltersActive ? 'filter-active' : ''}`} 
          onClick={() => setIsModalOpen(true)}
        >
          詳細検索
        </button>
      </div>



      {/* 事業所一覧の見出し */}
      <section className="container featured-section" style={{paddingTop:24}}>
        {/* 事業所ごとのDBから取得した一覧 */}
                <BrowseFacilities
                  initialSearch={currentSearchQuery}
                  initialService={currentSelectedService}
                  initialLocation={currentSelectedLocation}
                  initialWeekday={currentSelectedWeekday}
                  initialCityQuery={currentCityQuery} // New prop
                  showControls={false}
                />      </section>

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
          <div className="service-groups">
            <div className="service-group">
              <h4>訪問</h4>
              <div className="services-grid">
                {SERVICE_OPTIONS.filter(s => ['home_care', 'home_nursing', 'home_rehab'].includes(s.key)).map(service => (
                  <div key={service.key} className="service-item"><h3>{service.label}</h3></div>
                ))}
              </div>
            </div>
            <div className="service-group">
              <h4>通所</h4>
              <div className="services-grid">
                {SERVICE_OPTIONS.filter(s => ['day_service', 'day_rehab'].includes(s.key)).map(service => (
                  <div key={service.key} className="service-item"><h3>{service.label}</h3></div>
                ))}
              </div>
            </div>
            <div className="service-group">
              <h4>入居・宿泊</h4>
              <div className="services-grid">
                {SERVICE_OPTIONS.filter(s => ['short_stay', 'group_home', 'nursing_home', 'senior_housing'].includes(s.key)).map(service => (
                  <div key={service.key} className="service-item"><h3>{service.label}</h3></div>
                ))}
              </div>
            </div>
            <div className="service-group">
              <h4>障害・児童</h4>
              <div className="services-grid">
                {SERVICE_OPTIONS.filter(s => ['disability_daycare', 'after_school', 'child_development'].includes(s.key)).map(service => (
                  <div key={service.key} className="service-item"><h3>{service.label}</h3></div>
                ))}
              </div>
            </div>
            <div className="service-group">
              <h4>就労・相談</h4>
              <div className="services-grid">
                {SERVICE_OPTIONS.filter(s => ['employment_support_a', 'employment_support_b', 'consultation_support', 'care_manager'].includes(s.key)).map(service => (
                  <div key={service.key} className="service-item"><h3>{service.label}</h3></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 詳細検索モーダル */}
      {isModalOpen && (
        <div className="advanced-search-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="advanced-search-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>詳細検索</h3>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <fieldset className="filter-group">
                <legend>曜日</legend>
                <div className="weekday-checkbox-group">
                  {[['all','すべて'],['mon','月'],['tue','火'],['wed','水'],['thu','木'],['fri','金'],['sat','土'],['sun','日']].map(([k,label])=> (
                    <label key={k} className="weekday-checkbox-label">
                      <input 
                        type="radio" 
                        name="weekday"
                        value={k}
                        checked={selectedWeekday === k}
                        onChange={() => setSelectedWeekday(k as any)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="filter-group">
                <legend>地域</legend>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="modal-select-location"
                >
                  <option value="all">すべての地域</option>
                  {JAPANESE_PREFECTURES.map(pref => ( // Use JAPANESE_PREFECTURES
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </fieldset>
              <fieldset className="filter-group"> {/* New fieldset for city */}
                <legend>市区町村</legend>
                <input
                  type="text"
                  placeholder="例: 世田谷区"
                  value={currentCityQuery}
                  onChange={e => setCurrentCityQuery(e.target.value)}
                  className="modal-city-input"
                  disabled={selectedLocation === 'all'} // Disable if no prefecture selected
                />
              </fieldset>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => {
                handleSearch(); // モーダルの条件も適用する
                setIsModalOpen(false);
              }}>条件を適用</button>
            </div>
          </div>
        </div>
      )}

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