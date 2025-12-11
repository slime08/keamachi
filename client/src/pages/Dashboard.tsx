import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { safeGetJSON } from '../utils/storage'
import FacilityDetail from './FacilityDetail'
import MatchingManager from './MatchingManager'
import Messaging from './Messaging'
import { Facility } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [activeTab, setActiveTab] = useState('explore')
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const user = safeGetJSON<any>('user', {})
  const role = (user && user.role) ? user.role : 'user'

  useEffect(() => {
    if (activeTab === 'explore') {
      fetchFacilities()
    }
  }, [activeTab])

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const response = await api.get<Facility[]>('/facilities')
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
        <h1>ケアマチ - 福祉マッチングプラットフォーム</h1>
        <div className="user-info">
          <span>こんにちは、{user.name}さん</span>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      </header>

      <div className="dashboard-tabs">
        {role === 'user' && (
          <>
            <button className={activeTab === 'explore' ? 'active' : ''} onClick={() => setActiveTab('explore')}>事業所を探す</button>
            <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>マッチング</button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>メッセージ</button>
          </>
        )}

        {role === 'facility' && (
          <>
            <button className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>事業所管理</button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>メッセージ</button>
          </>
        )}

        {(role === 'planner' || role === 'care_manager') && (
          <>
            <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>クライアント管理</button>
            <button className={activeTab === 'cases' ? 'active' : ''} onClick={() => setActiveTab('cases')}>ケース管理</button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>メッセージ</button>
          </>
        )}

        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>プロフィール</button>
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
                    <p className="location">場所: {facility.location}</p>
                    <p className="service-type">サービス種別: {facility.serviceType}</p>
                    <p className="description">{facility.description}</p>
                    <button className="detail-button">詳細を見る</button>
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
            <p>承認済みクライアントのリストと、承認/拒否のオプションを表示します。</p>
          </div>
        )}

        {activeTab === 'cases' && (role === 'planner' || role === 'care_manager') && (
          <div className="cases-section">
            <h2>ケース管理</h2>
            <p>ケアプラン、医療記録などのケース管理インターフェースを表示します。</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>プロフィール</h2>
            <div className="profile-info">
              <div className="profile-item">
                <label>氏名</label>
                <p>{user.name}</p>
              </div>
              <div className="profile-item">
                <label>メール</label>
                <p>{user.email}</p>
              </div>
              <div className="profile-item">
                <label>ユーザー種別</label>
                <p>{user.role === 'facility' ? '事業所' : 'サービス利用者'}</p>
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