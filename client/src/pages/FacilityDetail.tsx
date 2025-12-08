import { useState, useEffect } from 'react'
import axios from 'axios'

interface FacilityDetailProps {
  facilityId: number
  onBack: () => void
}

export default function FacilityDetail({ facilityId, onBack }: FacilityDetailProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })
  const token = localStorage.getItem('token')

  useEffect(() => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }, [])

  const toggleFavorite = (facilityId: number) => {
    const newFavorites = favorites.includes(facilityId)
      ? favorites.filter(id => id !== facilityId)
      : [...favorites, facilityId]
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  // Mock facility data
  const facilityData = {
    1: {
      id: 1,
      name: 'サンシャイン福祉センター',
      location: '東京都渋谷区神宮前1-1-1',
      service_type: '訪問介護',
      phone: '03-1234-5678',
      email: 'info@sunshine-care.jp',
      website: 'https://sunshine-care.jp',
      imageUrl: '/1.png',
      description: '高齢者向けの訪問介護サービスを提供しています。経験豊富なスタッフが利用者様のニーズに合わせたサービスを提供いたします。',
      services: ['身体介護', '生活援助', '相談・支援'],
      capacity: '利用者50名',
      staffCount: '25名',
      operatingHours: '9:00～18:00',
      rating: 4.8,
      reviews: 24,
      availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' }
    },
    2: {
      id: 2,
      name: 'ケアホーム山田',
      location: '東京都新宿区西新宿2-1-1',
      service_type: 'グループホーム',
      phone: '03-2345-6789',
      email: 'contact@carehome-yamada.jp',
      website: 'https://carehome-yamada.jp',
      imageUrl: '/2.png',
      description: '認知症対応のグループホームです。家庭的な雰囲気の中で、専門的なケアを提供しています。',
      services: ['24時間体制の介護', '医療管理', 'レクリエーション'],
      capacity: '利用者9名',
      staffCount: '8名',
      operatingHours: '24時間',
      rating: 4.6,
      reviews: 18,
      availability: { mon: 'closed', tue: 'limited', wed: 'open', thu: 'open', fri: 'open', sat: 'limited', sun: 'closed' }
    },
    3: {
      id: 3,
      name: 'デイサービス太陽',
      location: '東京都渋谷区代々木1-1-1',
      service_type: 'デイサービス',
      phone: '03-3456-7890',
      email: 'info@dayservice-taiyou.jp',
      website: 'https://dayservice-taiyou.jp',
      imageUrl: '/3.png',
      description: '日中の介護・リハビリサービスを提供しています。利用者様の機能維持と生きがいづくりをサポートします。',
      services: ['日中の介護', 'リハビリテーション', '栄養管理'],
      capacity: '利用者30名',
      staffCount: '15名',
      operatingHours: '8:30～17:30',
      rating: 4.9,
      reviews: 32,
      availability: { mon: 'open', tue: 'limited', wed: 'open', thu: 'closed', fri: 'open', sat: 'closed', sun: 'closed' }
    },
    4: {
      id: 4,
      name: '介護老健施設 希望',
      location: '神奈川県横浜市南区1-2-3',
      service_type: '老健施設',
      phone: '045-1111-2222',
      email: 'info@kibou-rehab.jp',
      website: 'https://kibou-rehab.jp',
      imageUrl: '/4.png',
      description: '医療と福祉が統合されたリハビリ施設。短期入所にも対応。',
      services: ['リハビリ', '短期入所', '栄養・口腔ケア'],
      capacity: '利用者80名',
      staffCount: '45名',
      operatingHours: '8:00～19:00',
      rating: 4.5,
      reviews: 15,
      availability: { mon: 'open', tue: 'closed', wed: 'open', thu: 'limited', fri: 'open', sat: 'open', sun: 'closed' }
    },
    5: {
      id: 5,
      name: '障害者支援センター ライト',
      location: '埼玉県さいたま市中央区3-2-1',
      service_type: '障害福祉',
      phone: '048-2222-3333',
      email: 'support@light-center.jp',
      website: 'https://light-center.jp',
      imageUrl: '/5.png',
      description: '就労支援と社会復帰をサポート。個別計画で伴走します。',
      services: ['就労支援', '生活訓練', '相談支援'],
      capacity: '利用者40名',
      staffCount: '18名',
      operatingHours: '9:00～18:00',
      rating: 4.7,
      reviews: 12,
      availability: { mon: 'open', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' }
    },
    6: {
      id: 6,
      name: '児童発達支援 キッズホーム',
      location: '千葉県船橋市前原西2-8-5',
      service_type: '児童福祉',
      phone: '047-3333-4444',
      email: 'kids@kidshome.jp',
      website: 'https://kidshome.jp',
      imageUrl: '/6.png',
      description: '発達支援プログラムと家族支援を一体で提供。',
      services: ['個別療育', 'グループ療育', '保護者支援'],
      capacity: '利用児25名',
      staffCount: '14名',
      operatingHours: '9:00～17:00',
      rating: 4.8,
      reviews: 20,
      availability: { mon: 'closed', tue: 'closed', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' }
    },
    7: {
      id: 7,
      name: 'ナイトケアつばさ',
      location: '東京都港区芝公園1-1-1',
      service_type: '訪問介護',
      phone: '03-4444-5555',
      email: 'night@tsubasa-care.jp',
      website: 'https://tsubasa-care.jp',
      imageUrl: '/7.png',
      description: '夜間帯の訪問介護に特化し、急なサポートにも対応。',
      services: ['夜間巡回', '排泄・体位変換', '見守り'],
      capacity: '訪問枠 40件/日',
      staffCount: '22名',
      operatingHours: '18:00～7:00',
      rating: 4.2,
      reviews: 8,
      availability: { mon: 'limited', tue: 'open', wed: 'limited', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' }
    },
    8: {
      id: 8,
      name: 'ひかりデイセンター',
      location: '神奈川県川崎市中原区2-4-6',
      service_type: 'デイサービス',
      phone: '044-5555-6666',
      email: 'day@hikari-center.jp',
      website: 'https://hikari-center.jp',
      imageUrl: '/8.png',
      description: 'リハビリとレクリエーションを備えた地域密着型デイ。',
      services: ['機能訓練', '送迎', '入浴支援'],
      capacity: '利用者45名',
      staffCount: '20名',
      operatingHours: '8:30～17:30',
      rating: 4.4,
      reviews: 10,
      availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'limited', sat: 'closed', sun: 'closed' }
    },
    9: {
      id: 9,
      name: 'サンデーケア虹',
      location: '千葉県千葉市中央区7-3-2',
      service_type: 'グループホーム',
      phone: '043-6666-7777',
      email: 'info@sunday-niji.jp',
      website: 'https://sunday-niji.jp',
      imageUrl: '/gazo1.png',
      description: '週末ケアプログラムと家族参加イベントが充実。',
      services: ['24時間介護', '週末リフレッシュ', '家族相談'],
      capacity: '利用者12名',
      staffCount: '10名',
      operatingHours: '24時間',
      rating: 4.3,
      reviews: 6,
      availability: { mon: 'closed', tue: 'closed', wed: 'limited', thu: 'open', fri: 'open', sat: 'limited', sun: 'open' }
    },
    10: {
      id: 10,
      name: 'みどり在宅ケアステーション',
      location: '東京都世田谷区駒沢4-5-6',
      service_type: '訪問介護',
      phone: '03-7777-8888',
      email: 'home@midoricare.jp',
      website: 'https://midoricare.jp',
      imageUrl: '/gazo1.png',
      description: '在宅生活をトータルサポート。リハビリと看護の連携で安心を届けます。',
      services: ['訪問介護', '訪問看護連携', 'リハビリ相談'],
      capacity: '訪問枠 60件/日',
      staffCount: '28名',
      operatingHours: '8:00～20:00',
      rating: 4.7,
      reviews: 14,
      availability: { mon: 'open', tue: 'open', wed: 'open', thu: 'open', fri: 'open', sat: 'closed', sun: 'closed' }
    }
  }

  const facility = facilityData[facilityId as keyof typeof facilityData] || facilityData[1]
  const availability = (facility as any).availability

  const handleApplyMatch = async () => {
    setLoading(true)
    setError('')

    try {
      await axios.post(
        '/api/matching',
        { facility_id: facilityId },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {
        // Mock success for demo
        console.log('Mock matching applied')
      })

      alert('マッチング申し込みを送信しました！')
      onBack()
    } catch (err: any) {
      setError('申し込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const isFavorite = favorites.includes(facility.id)

  return (
    <div className="facility-detail">
      <button className="back-button" onClick={onBack}>
        ← 戻る
      </button>

      {/* 画像セクション */}
      <div className="facility-image-section">
        {facility.imageUrl ? (
          <img src={facility.imageUrl} alt={facility.name} className="facility-main-image" />
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
        <div className="rating">
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

      {error && <div className="error-message">{error}</div>}

      <div className="detail-content">
        <section className="info-section">
          <h2>基本情報</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>サービス種類</label>
              <p>{facility.service_type}</p>
            </div>
            <div className="info-item">
              <label>住所</label>
              <p>{facility.location}</p>
            </div>
            <div className="info-item">
              <label>定員</label>
              <p>{facility.capacity}</p>
            </div>
            <div className="info-item">
              <label>電話番号</label>
              <p>{facility.phone}</p>
            </div>
            <div className="info-item">
              <label>メールアドレス</label>
              <p>{facility.email}</p>
            </div>
            {facility.website && (
              <div className="info-item">
                <label>ウェブページ</label>
                <p>
                  <a href={facility.website} target="_blank" rel="noopener noreferrer" className="website-link">
                    {facility.website}
                  </a>
                </p>
              </div>
            )}
            <div className="info-item">
              <label>営業時間</label>
              <p>{facility.operatingHours}</p>
            </div>
            <div className="info-item">
              <label>スタッフ数</label>
              <p>{facility.staffCount}</p>
            </div>
          </div>
        </section>

        <section className="description-section">
          <h2>について</h2>
          <p>{facility.description}</p>
        </section>

        <section className="services-section">
          <h2>提供サービス</h2>
          <ul className="services-list">
            {facility.services.map((service, index) => (
              <li key={index}>✓ {service}</li>
            ))}
          </ul>
        </section>

        <div className="action-buttons">
          <button
            className="apply-button"
            onClick={handleApplyMatch}
            disabled={loading}
          >
            {loading ? '送信中...' : 'マッチングを申し込む'}
          </button>
          <button className="contact-button">お問い合わせ</button>
        </div>
      </div>
    </div>
  )
}
