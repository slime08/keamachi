import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import FacilityDetail from './FacilityDetail'
import MatchingManager from './MatchingManager'
import Messaging from './Messaging'

interface Facility {
  id: number
  name: string
  description: string
  location: string
  service_type: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [activeTab, setActiveTab] = useState('explore')
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.role || 'user'

  useEffect(() => {
    if (activeTab === 'explore') {
      fetchFacilities()
    }
  }, [activeTab])

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/facilities').catch(() => ({
        data: [
          { id: 1, name: 'サンシャイン福祉センター', location: '東京都渋谷区', service_type: '訪問介護', description: '訪問介護を中心に安心サポート。' },
          { id: 2, name: 'ケアホーム山田', location: '東京都新宿区', service_type: 'グループホーム', description: '家庭的なグループホームで専門ケア。' },
          { id: 3, name: 'デイサービス太陽', location: '東京都渋谷区', service_type: 'デイサービス', description: '日中の介護・リハビリを提供。' },
          { id: 4, name: '介護老健施設 希望', location: '神奈川県横浜市', service_type: '老健施設', description: '医療と福祉が連携したリハビリ施設。' },
          { id: 5, name: '障害者支援センター ライト', location: '埼玉県さいたま市', service_type: '障害福祉', description: '就労支援と自立支援を実施。' },
          { id: 6, name: '児童発達支援 キッズホーム', location: '千葉県船橋市', service_type: '児童福祉', description: '成長発達を支援しご家族と伴走。' },
          { id: 7, name: 'ナイトケアつばさ', location: '東京都港区', service_type: '訪問介護', description: '夜間にも対応する訪問介護。' },
          { id: 8, name: 'ひかりデイセンター', location: '神奈川県川崎市', service_type: 'デイサービス', description: '地域密着型のデイサービス。' },
          { id: 9, name: 'サンデーケア虹', location: '千葉県千葉市', service_type: 'グループホーム', description: '週末ケアプログラムを提供。' },
          { id: 10, name: 'みどり在宅ケアステーション', location: '東京都世田谷区', service_type: '訪問介護', description: '在宅生活をリハビリと看護で支援。' }
        ]
      }))
      setFacilities(response.data)
    } catch (err: any) {
      setError('事業所の読み込みに失敗しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  // Show facility detail if selected
  if (selectedFacility) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>ケアマチ</h1>
          <div className="user-info">
            <span>{user.name}さん</span>
            <button onClick={handleLogout}>ログアウト</button>
          </div>
        </header>
        <FacilityDetail
          facilityId={selectedFacility}
          onBack={() => {
            setSelectedFacility(null)
            setActiveTab('explore')
          }}
        />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ケアマチ - 福祉マッチングアプリ</h1>
        <div className="user-info">
          <span>こんにちは、{user.name}さん</span>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      </header>

      <div className="dashboard-tabs">
        {role === 'user' && (
          <>
            <button className={activeTab === 'explore' ? 'active' : ''} onClick={() => setActiveTab('explore')}>🔍 事業所を探す</button>
            <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>📋 マッチング</button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>💬 メッセージ</button>
          </>
        )}

        {role === 'facility' && (
          <>
            <button className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>🏢 事業所管理</button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>💬 メッセージ</button>
          </>
        )}

        {(role === 'planner' || role === 'care_manager') && (
          <>
            <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>👥 クライアント管理</button>
            <button className={activeTab === 'cases' ? 'active' : ''} onClick={() => setActiveTab('cases')}>🗂 案件管理</button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>💬 メッセージ</button>
          </>
        )}

        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 プロフィール</button>
      </div>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'explore' && role === 'user' && (
          <div className="explore-section">
            <h2>利用できる福祉事業所</h2>
            {loading ? (
              <p>読み込み中...</p>
            ) : (
              <div className="facilities-grid">
                {facilities.map(facility => (
                  <div
                    key={facility.id}
                    className="facility-card"
                    onClick={() => setSelectedFacility(facility.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3>{facility.name}</h3>
                    <p className="location">📍 {facility.location}</p>
                    <p className="service-type">サービス: {facility.service_type}</p>
                    <p className="description">{facility.description}</p>
                    <button className="detail-button">詳細を見る →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && role === 'user' && <MatchingManager />}

        {activeTab === 'messages' && <Messaging />}

        {activeTab === 'clients' && (role === 'planner' || role === 'care_manager') && (
          <div className="clients-section">
            <h2>クライアント管理</h2>
            <p>計画相談員・ケアマネジャー向けのクライアントリストと相談管理インターフェース（ダミー）。</p>
          </div>
        )}

        {activeTab === 'cases' && (role === 'planner' || role === 'care_manager') && (
          <div className="cases-section">
            <h2>案件管理</h2>
            <p>ケアプラン・訪問計画などの案件管理ビュー（ダミー表示）。</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>プロフィール</h2>
            <div className="profile-info">
              <div className="profile-item">
                <label>名前</label>
                <p>{user.name}</p>
              </div>
              <div className="profile-item">
                <label>メール</label>
                <p>{user.email}</p>
              </div>
              <div className="profile-item">
                <label>ユーザータイプ</label>
                <p>{user.role === 'facility' ? '福祉事業所' : 'サービス利用者'}</p>
              </div>
              {user.facility_name && (
                <div className="profile-item">
                  <label>事業所名</label>
                  <p>{user.facility_name}</p>
                </div>
              )}
            </div>
            <button className="edit-profile-button">プロフィールを編集</button>
          </div>
        )}
      </div>
    </div>
  )
}
