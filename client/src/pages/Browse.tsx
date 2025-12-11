import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Facility } from '../types'
import AvailabilityBadges from '../components/AvailabilityBadges'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

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
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const raw = safeGetJSON<any[]>('search_history', []) || []
    return raw.filter((x: any) => typeof x === 'string')
  })
  const [savedSearches, setSavedSearches] = useState<any[]>(() => {
    const raw = safeGetJSON<any[]>('saved_searches', []) || []
    return raw.filter((x: any) => x && typeof x === 'object')
  })

  const services = ['訪問介護', 'デイサービス', 'グループホーム', '老健施設', '障害福祉', '児童福祉']
  const locations = ['東京都', '神奈川県', '埼玉県', '千葉県', '大阪府']

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = safeGetJSON<number[]>('favorites', [])
    return saved
  })

  useEffect(() => {
    fetchFacilities()
  }, [])

  useEffect(() => {
    // persist search history when searchQuery changes
    if (!searchQuery) return
    const histRaw = safeGetJSON<any[]>('search_history', []) || []
    const hist = histRaw.filter((x: any) => typeof x === 'string')
    const next = [searchQuery, ...hist.filter(h => h !== searchQuery)].slice(0,10)
    setSearchHistory(next)
    safeSetJSON('search_history', next)
  }, [searchQuery])

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
      const response = await api.get<Facility[]>('/facilities')
      // Ensure response.data is always an array
      setFacilities(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error(err)
      setFacilities([]) // Keep fallback to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filterFacilities = () => {
    let filtered = facilities

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(f => {
        const name = (f.name || '').toLowerCase()
        const desc = (f.description || '').toLowerCase()
        return name.includes(q) || desc.includes(q)
      })
    }

    if (selectedService !== 'all') {
      filtered = filtered.filter(f => f.serviceType === selectedService)
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(f => f.location.includes(selectedLocation))
    }

    if (selectedWeekday !== 'all') {
      filtered = filtered.filter(f => {
        const status = f.availability && (f.availability as any)[selectedWeekday]
        // treat 'open' and 'limited' as matchable (〇 or △), 'closed' means no availability
        return status === 'open' || status === 'limited'
      })
    }

    setFilteredFacilities(filtered)
  }

  const toggleFavorite = (facilityId: number) => {
    const newFavorites = favorites.includes(facilityId)
      ? favorites.filter(id => id !== facilityId)
      : [...favorites, facilityId]
    setFavorites(newFavorites)
    safeSetJSON('favorites', newFavorites)
  }

  const saveCurrentSearch = async () => {
    const filters = { searchQuery, selectedService, selectedLocation, selectedWeekday }
    const facilityIds = filteredFacilities.map(f=>f.id)
    const existing = safeGetJSON<any[]>('saved_searches', [])
    const item = { id: Math.random().toString(36).slice(2,9), name: `検索: ${searchQuery || '条件検索'}`, filters, facilityIds, createdAt: new Date().toISOString() }
    const next = [item, ...existing]
    setSavedSearches(next)
    safeSetJSON('saved_searches', next)
  }

  const applySavedSearch = (s: any) => {
    setSearchQuery(s.filters.searchQuery || '')
    setSelectedService(s.filters.selectedService || 'all')
    setSelectedLocation(s.filters.selectedLocation || 'all')
    setSelectedWeekday((s.filters.selectedWeekday as any) || 'all')
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    safeSetJSON('search_history', [])
  }

  // 詳細表示モード
  if (selectedFacility) {
    const facility = facilities.find(f => f.id === selectedFacility)
    if (facility) {
      const isFavorite = favorites.includes(facility.id)
      const availability = facility.availability
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
                {facility.imageUrl ? (
                  <img src={facility.imageUrl || ''} alt={facility.name} className="facility-main-image" />
                ) : (
                  <div className="no-image-placeholder">
                    <span className="no-image-icon">🖼️</span>
                    <p>No Image</p>
                  </div>
                )}
                <button
                  className={`favorite-button ${isFavorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(facility.id)}
                  title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  {isFavorite ? '❤️' : '♡'}
                </button>
              </div>

              <div className="detail-header-section">
                <h1>{facility.name}</h1>
                <div className="rating-section">
                  <span className="stars">⭐{facility.rating}</span>
                  <span className="review-count">レビュー {facility.reviews}件</span>
                </div>
              </div>

              {/* 営業時間表示 (DBのavailabilityをそのまま利用) */}
              {availability && (
                <div className="availability-section">
                  <h3>営業時間</h3>
                  <AvailabilityBadges availability={availability} />
                </div>
              )}

              <div className="facility-info">
                <div className="info-grid">
                  <div className="info-item">
                    <label>サービス種別</label>
                    <p>{facility.serviceType}</p>
                  </div>
                  <div className="info-item">
                    <label>所在地</label>
                    <p>{facility.location}</p>
                  </div>
                  <div className="info-item">
                    <label>定員</label>
                    <p>{facility.capacity || '未設定'}</p>
                  </div>
                  <div className="info-item">
                    <label>電話番号</label>
                    <p>{facility.phone || '未設定'}</p>
                  </div>
                  <div className="info-item">
                    <label>メールアドレス</label>
                    <p>{facility.email || '未設定'}</p>
                  </div>
                  {facility.website && (
                    <div className="info-item">
                      <label>ウェブサイト</label>
                      <p>
                        <a href={facility.website} target="_blank" rel="noopener noreferrer" className="website-link">
                          {facility.website}
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
                    この事業所に問い合わせる
                  </Link>
                  <p className="note">※問い合わせにはログインが必要です</p>
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
        <h1>事業所を探す</h1>

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

        {/* 検索履歴と保存検索 */}
        <div className="search-history">
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
            <strong>検索履歴</strong>
            <button className="btn btn-ghost" onClick={clearSearchHistory}>クリア</button>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
            {searchHistory.length === 0 ? <span className="muted">履歴はありません</span> : searchHistory.map((h,i) => (
              <button key={i} className="btn btn-ghost" onClick={() => setSearchQuery(h)}>{h}</button>
            ))}
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12}}>
            <strong>保存検索</strong>
            <button className="btn btn-primary" onClick={saveCurrentSearch}>この検索を保存</button>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
            {savedSearches.length === 0 ? <span className="muted">保存された検索はありません</span> : savedSearches.map(s => (
              <div key={s.id} className="saved-search-card">
                <div className="saved-search-name">{s.name}</div>
                <div style={{display:'flex',gap:6,marginTop:6}}>
                  <button className="btn btn-ghost" onClick={() => applySavedSearch(s)}>適用</button>
                  <button className="btn btn-ghost" onClick={() => {
                    const next = savedSearches.filter((x:any)=>x.id!==s.id)
                    setSavedSearches(next)
                    safeSetJSON('saved_searches', next)
                  }}>削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  <p className="muted">{f.location} - {f.serviceType}</p>
                  <p className="desc">{f.description || 'N/A'}</p>

                  <div style={{marginTop:8}}>
                    <AvailabilityBadges availability={f.availability} />
                  </div>

                  <div className="meta" style={{marginTop:10}}>
                    <span className="rating">⭐{f.rating}</span>
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