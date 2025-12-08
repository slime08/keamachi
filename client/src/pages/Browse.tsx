import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

interface Facility {
  id: number
  name: string
  description: string
  location: string
  service_type: string
  rating?: number
  reviews?: number
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

type BrowseProps = {
  initialSearch?: string
  initialService?: string
  initialLocation?: string
  initialWeekday?: 'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'
  showControls?: boolean
}

export default function BrowseFacilities(props: BrowseProps = {}) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedWeekday, setSelectedWeekday] = useState<'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>('all')

  const services = ['訪問介護', 'デイサービス', 'グループホーム', '老健施設', '障害福祉', '児童福祉']
  const locations = ['東京都', '神奈川県', '埼玉県', '千葉県', '全国']

  useEffect(() => {
    fetchFacilities()
  }, [])

  // Initialize from props when provided
  useEffect(() => {
    if (props.initialSearch !== undefined) setSearchQuery(props.initialSearch)
    if (props.initialService !== undefined) setSelectedService(props.initialService)
    if (props.initialLocation !== undefined) setSelectedLocation(props.initialLocation)
    if (props.initialWeekday !== undefined) setSelectedWeekday(props.initialWeekday)
  }, [props.initialSearch, props.initialService, props.initialLocation, props.initialWeekday])

  useEffect(() => {
    filterFacilities()
  }, [facilities, searchQuery, selectedService, selectedLocation, selectedWeekday])

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const response = await axios.get<Facility[]>('/api/facilities').catch(() => ({
        data: generateMockFacilities()
      }))

      const apiData: Facility[] = response.data || []
      const mockData: Facility[] = [
        { id: 1, name: 'サンシャイン福祉センター', description: '訪問介護サービスを提供', location: '東京都渋谷区', service_type: '訪問介護', rating: 4.8, reviews: 24, imageUrl: '/1.png', availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' } },
        { id: 2, name: 'ケアホーム山田', description: 'グループホーム', location: '東京都新宿区', service_type: 'グループホーム', rating: 4.6, reviews: 18, imageUrl: '/2.png', availability: { mon: 'closed', tue: 'limited', wed: 'open', thu: 'open', fri: 'open', sat: 'limited', sun: 'closed' } },
        { id: 3, name: 'デイサービス太陽', description: 'デイサービス', location: '東京都渋谷区', service_type: 'デイサービス', rating: 4.9, reviews: 32, imageUrl: '/3.png', availability: { mon: 'open', tue: 'limited', wed: 'open', thu: 'closed', fri: 'open', sat: 'closed', sun: 'closed' } },
        { id: 4, name: '介護老健施設 希望', description: '老健施設', location: '神奈川県横浜市', service_type: '老健施設', rating: 4.5, reviews: 15, imageUrl: '/4.png', availability: { mon: 'open', tue: 'closed', wed: 'open', thu: 'limited', fri: 'open', sat: 'open', sun: 'closed' } },
        { id: 5, name: '障害者支援センター ライト', description: '障害福祉', location: '埼玉県さいたま市', service_type: '障害福祉', rating: 4.7, reviews: 12, imageUrl: '/5.png', availability: { mon: 'open', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' } },
        { id: 6, name: '児童発達支援 キッズホーム', description: '児童福祉', location: '千葉県船橋市', service_type: '児童福祉', rating: 4.8, reviews: 20, imageUrl: '/6.png', availability: { mon: 'closed', tue: 'closed', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' } },
        { id: 7, name: 'ナイトケアつばさ', description: '夜間訪問介護', location: '東京都港区', service_type: '訪問介護', rating: 4.2, reviews: 8, imageUrl: '/7.png', availability: { mon: 'limited', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' } },
        { id: 8, name: 'ひかりデイセンター', description: '地域密着型デイサービス', location: '神奈川県川崎市', service_type: 'デイサービス', rating: 4.4, reviews: 10, imageUrl: '/8.png', availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' } },
        { id: 9, name: 'サンデーケア虹', description: '週末ケア', location: '千葉県千葉市', service_type: 'グループホーム', rating: 4.3, reviews: 6, imageUrl: '/gazo1.png', availability: { mon: 'closed', tue: 'closed', wed: 'limited', thu: 'open', fri: 'open', sat: 'limited', sun: 'open' } },
        { id: 10, name: 'みどり在宅ケアステーション', description: '在宅トータルサポート', location: '東京都世田谷区', service_type: '訪問介護', rating: 4.7, reviews: 14, imageUrl: '/gazo1.png', availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' } }
      ]

      // If API returns too few, append mock (dedupe by id)
      const combined = apiData.length >= 10
        ? apiData
        : [
            ...apiData,
            ...mockData.filter(m => !apiData.some(a => a.id === m.id))
          ]

      setFacilities(combined)
    } catch (err) {
      console.error(err)
      setFacilities(generateMockFacilities())
    } finally {
      setLoading(false)
    }
  }

  const generateMockFacilities = (): Facility[] => [
    {
      id: 1,
      name: 'サンシャイン福祉センター',
      location: '東京都渋谷区',
      service_type: '訪問介護',
      description: '高齢者向けの訪問介護サービスを提供。経験豊富なスタッフが利用者様のニーズに合わせたサービスを提供いたします。',
      rating: 4.8,
      reviews: 24,
      imageUrl: '/1.png'
      , availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' }
    },
    {
      id: 2,
      name: 'ケアホーム山田',
      location: '東京都新宿区',
      service_type: 'グループホーム',
      description: '認知症対応のグループホーム。家庭的な雰囲気の中で、専門的なケアを提供しています。',
      rating: 4.6,
      reviews: 18,
      imageUrl: '/2.png'
      , availability: { mon: 'closed', tue: 'limited', wed: 'open', thu: 'open', fri: 'open', sat: 'limited', sun: 'closed' }
    },
    {
      id: 3,
      name: 'デイサービス太陽',
      location: '東京都渋谷区',
      service_type: 'デイサービス',
      description: '日中の介護・リハビリサービス。利用者様の機能維持と生きがいづくりをサポートします。',
      rating: 4.9,
      reviews: 32,
      imageUrl: '/3.png'
      , availability: { mon: 'open', tue: 'limited', wed: 'open', thu: 'closed', fri: 'open', sat: 'closed', sun: 'closed' }
    },
    {
      id: 4,
      name: '介護老健施設 希望',
      location: '神奈川県横浜市',
      service_type: '老健施設',
      description: 'リハビリと介護の総合施設。医療と福祉が統合されたサービスを提供します。',
      rating: 4.5,
      reviews: 15,
      imageUrl: '/4.png'
      , availability: { mon: 'open', tue: 'closed', wed: 'open', thu: 'limited', fri: 'open', sat: 'open', sun: 'closed' }
    },
    {
      id: 5,
      name: '障害者支援センター ライト',
      location: '埼玉県さいたま市',
      service_type: '障害福祉',
      description: '障害者の社会復帰と就労支援に特化。個別対応で最適なサポートを実施します。',
      rating: 4.7,
      reviews: 12,
      imageUrl: '/5.png'
      , availability: { mon: 'open', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' }
    },
    {
      id: 6,
      name: '児童発達支援 キッズホーム',
      location: '千葉県船橋市',
      service_type: '児童福祉',
      description: '子どもの成長発達を支援。親御さんとの連携も大切にしています。',
      rating: 4.8,
      reviews: 20,
      imageUrl: '/6.png'
      , availability: { mon: 'closed', tue: 'closed', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' }
    }
    ,{
      id: 7,
      name: 'ナイトケアつばさ',
      location: '東京都港区',
      service_type: '訪問介護',
      description: '夜間対応の訪問介護サービスを行います。',
      rating: 4.2,
      reviews: 8,
      imageUrl: '/7.png',
      availability: { mon: 'limited', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' }
    },
    {
      id: 8,
      name: 'ひかりデイセンター',
      location: '神奈川県川崎市',
      service_type: 'デイサービス',
      description: '地域密着型の日中サービス。',
      rating: 4.4,
      reviews: 10,
      imageUrl: '/8.png',
      availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' }
    }
    ,{
      id: 9,
      name: 'サンデーケア虹',
      location: '千葉県千葉市',
      service_type: 'グループホーム',
      description: '日曜も対応する週末ケアプログラムを提供。',
      rating: 4.3,
      reviews: 6,
      imageUrl: '/gazo1.png',
      availability: { mon: 'closed', tue: 'closed', wed: 'limited', thu: 'open', fri: 'open', sat: 'limited', sun: 'open' }
    },
    {
      id: 10,
      name: 'みどり在宅ケアステーション',
      location: '東京都世田谷区',
      service_type: '訪問介護',
      description: '在宅生活をトータルサポート。リハビリと看護の連携で安心を届けます。',
      rating: 4.7,
      reviews: 14,
      imageUrl: '/gazo1.png',
      availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'limited', sun: 'closed' }
    }
  ]

  const filterFacilities = () => {
    let filtered = facilities

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedService !== 'all') {
      filtered = filtered.filter(f => f.service_type === selectedService)
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(f => f.location.includes(selectedLocation))
    }

    if (selectedWeekday !== 'all') {
      filtered = filtered.filter(f => {
        const status = f.availability && (f.availability as any)[selectedWeekday]
        // treat 'open' and 'limited' as matchable (◯ or △), 'closed' means no availability
        return status === 'open' || status === 'limited'
      })
    }

    setFilteredFacilities(filtered)
  }

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  const toggleFavorite = (facilityId: number) => {
    const newFavorites = favorites.includes(facilityId)
      ? favorites.filter(id => id !== facilityId)
      : [...favorites, facilityId]
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const getFacilityDetail = (id: number) => {
    const details: any = {
      1: { location: '東京都渋谷区神宮前1-1-1', capacity: '利用者50名', phone: '03-1234-5678', email: 'info@sunshine-care.jp', website: 'https://sunshine-care.jp', availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' } },
      2: { location: '東京都新宿区西新宿2-1-1', capacity: '利用者9名', phone: '03-2345-6789', email: 'contact@carehome-yamada.jp', website: 'https://carehome-yamada.jp', availability: { mon: 'closed', tue: 'limited', wed: 'open', thu: 'open', fri: 'open', sat: 'limited', sun: 'closed' } },
      3: { location: '東京都渋谷区代々木1-1-1', capacity: '利用者30名', phone: '03-3456-7890', email: 'info@dayservice-taiyou.jp', website: 'https://dayservice-taiyou.jp', availability: { mon: 'open', tue: 'limited', wed: 'open', thu: 'closed', fri: 'open', sat: 'closed', sun: 'closed' } },
      4: { location: '神奈川県横浜市南区1-2-3', capacity: '利用者80名', phone: '045-1111-2222', email: 'info@kibou-rehab.jp', website: 'https://kibou-rehab.jp', availability: { mon: 'open', tue: 'closed', wed: 'open', thu: 'limited', fri: 'open', sat: 'open', sun: 'closed' } },
      5: { location: '埼玉県さいたま市中央区3-2-1', capacity: '利用者40名', phone: '048-2222-3333', email: 'support@light-center.jp', website: 'https://light-center.jp', availability: { mon: 'open', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' } },
      6: { location: '千葉県船橋市前原西2-8-5', capacity: '利用児25名', phone: '047-3333-4444', email: 'kids@kidshome.jp', website: 'https://kidshome.jp', availability: { mon: 'closed', tue: 'closed', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' } },
      7: { location: '東京都港区芝公園1-1-1', capacity: '訪問枠 40件/日', phone: '03-4444-5555', email: 'night@tsubasa-care.jp', website: 'https://tsubasa-care.jp', availability: { mon: 'limited', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' } },
      8: { location: '神奈川県川崎市中原区2-4-6', capacity: '利用者45名', phone: '044-5555-6666', email: 'day@hikari-center.jp', website: 'https://hikari-center.jp', availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' } },
      9: { location: '千葉県千葉市中央区7-3-2', capacity: '利用者12名', phone: '043-6666-7777', email: 'info@sunday-niji.jp', website: 'https://sunday-niji.jp', availability: { mon: 'closed', tue: 'closed', wed: 'limited', thu: 'open', fri: 'open', sat: 'limited', sun: 'open' } },
      10: { location: '東京都世田谷区駒沢4-5-6', capacity: '訪問枠 60件/日', phone: '03-7777-8888', email: 'home@midoricare.jp', website: 'https://midoricare.jp', availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'limited', sun: 'closed' } }
    }
    return details[id] || {}
  }

  if (selectedFacility) {
    const facility = facilities.find(f => f.id === selectedFacility)
    if (facility) {
      const isFavorite = favorites.includes(facility.id)
      const facilityDetail = getFacilityDetail(facility.id)
      // モックデータの空き状況を優先（トップページと一致させるため）
      const availability = facilityDetail.availability || facility.availability
      
      return (
        <div className="browse-page">
          <div className="facility-detail-page">
            <div className="detail-container">
              <button 
                className="back-button"
                onClick={() => setSelectedFacility(null)}
              >
                ← 一覧に戻る
              </button>
              
              {/* 画像セクション */}
              <div className="facility-image-section">
                {facilityDetail.imageUrl ? (
                  <img src={facilityDetail.imageUrl} alt={facility.name} className="facility-main-image" />
                ) : (
                  <div className="no-image-placeholder">
                    <span className="no-image-icon">📷</span>
                    <p>No Image</p>
                  </div>
                )}
                <button 
                  className={`favorite-button ${isFavorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(facility.id)}
                  title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="detail-header-section">
                <h1>{facility.name}</h1>
                <div className="rating-section">
                  <span className="stars">★ {facility.rating}</span>
                  <span className="review-count">レビュー {facility.reviews}件</span>
                </div>
              </div>

              {/* 空き状況表示 */}
              {availability && (
                <div className="availability-section">
                  <h3>空き状況</h3>
                  <div className="availability-grid">
                    {['mon','tue','wed','thu','fri','sat','sun'].map((d) => {
                      const labels: any = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' }
                      const status: any = availability && (availability as any)[d]
                      const symbol = status === 'open' ? '◯' : status === 'limited' ? '△' : '✕'
                      const cls = status ? status : 'closed'
                      return (
                        <div key={d} className={`availability-item ${cls}`}>
                          <div className="availability-day">{labels[d]}</div>
                          <div className={`availability-badge ${cls}`}>{symbol}</div>
                          <div className="availability-status">
                            {status === 'open' ? '空きあり' : status === 'limited' ? '空きわずか' : '空きなし'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="facility-info">
                <div className="info-grid">
                  <div className="info-item">
                    <label>サービス種別</label>
                    <p>{facility.service_type}</p>
                  </div>
                  <div className="info-item">
                    <label>住所</label>
                    <p>{facilityDetail.location || facility.location}</p>
                  </div>
                  <div className="info-item">
                    <label>定員</label>
                    <p>{facilityDetail.capacity || '未設定'}</p>
                  </div>
                  <div className="info-item">
                    <label>電話番号</label>
                    <p>{facilityDetail.phone || '未設定'}</p>
                  </div>
                  <div className="info-item">
                    <label>メールアドレス</label>
                    <p>{facilityDetail.email || '未設定'}</p>
                  </div>
                  {facilityDetail.website && (
                    <div className="info-item">
                      <label>ウェブページ</label>
                      <p>
                        <a href={facilityDetail.website} target="_blank" rel="noopener noreferrer" className="website-link">
                          {facilityDetail.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
                <div className="description">
                  <h3>について</h3>
                  <p>{facility.description}</p>
                </div>
                <div className="cta-section">
                  <Link to="/register" className="btn btn-primary btn-large">
                    この事業所に申し込む
                  </Link>
                  <p className="note">※申し込みにはログインが必要です</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="browse-page">
      <div className="browse-container">
        <h1>福祉事業所を探す</h1>

        {/* 検索フィルター */}
        {props.showControls !== false && (
        <div className="filter-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="事業所名やサービス内容で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <label>サービス種別</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="all">すべて</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>エリア</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">すべて</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>曜日で絞り込む</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {[
                  ['all','すべて'],['mon','月'],['tue','火'],['wed','水'],['thu','木'],['fri','金'],['sat','土'],['sun','日']
                ].map(([k,label])=> (
                  <button
                    key={k}
                    onClick={() => setSelectedWeekday(k as any)}
                    className={selectedWeekday===k ? 'btn btn-primary' : 'btn btn-ghost'}
                    style={{padding:'6px 10px'}}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 検索結果数 */}
        <div className="results-info">
          <p>{filteredFacilities.length}件の事業所が見つかりました</p>
        </div>

        {/* 事業所一覧 */}
        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : filteredFacilities.length === 0 ? (
          <div className="no-results">
            <p>条件に合う事業所が見つかりませんでした</p>
          </div>
        ) : (
          <div className="facilities-list">
            {filteredFacilities.map(f => (
              <div key={f.id} className="card facility-card" onClick={() => setSelectedFacility(f.id)}>
                <div className="facility-card-image-wrapper">
                  {f.imageUrl ? (
                    <img src={f.imageUrl} alt={f.name} className="facility-card-image" />
                  ) : (
                    <div className="no-image-placeholder-card">
                      <span className="no-image-icon">🖼️</span>
                      <p>No Image</p>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h3>{f.name}</h3>
                  <p className="muted">{f.location} • {f.service_type}</p>
                  <p className="desc">{f.description}</p>

                  <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
                    {['月','火','水','木','金','土','日'].map(label => (
                      <div key={label} className="weekday-label">{label}</div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
                    {['mon','tue','wed','thu','fri','sat','sun'].map((d)=>{
                      const labels: any = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' }
                      const status: any = f.availability && (f.availability as any)[d]
                      const symbol = status === 'open' ? '◯' : status === 'limited' ? '△' : '✕'
                      const cls = status ? status : 'closed'
                      return (
                        <div key={d} title={`${labels[d]}: ${status ?? 'closed'}`} className={`weekday-badge ${cls}`}>
                          {symbol}
                        </div>
                      )
                    })}
                  </div>

                  <div className="meta" style={{marginTop:10}}>
                    <span className="rating">⭐ {f.rating}</span>
                    <span className="reviews">({f.reviews})</span>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFacility(f.id)
                      }}
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
