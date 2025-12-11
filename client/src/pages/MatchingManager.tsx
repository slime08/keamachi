import { useState, useEffect } from 'react'
import axios from 'axios'

interface Matching {
  id: number
  facilityId: number
  facilityName: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: string
  respondedDate?: string
}

export default function MatchingManager() {
  const [matches, setMatches] = useState<Matching[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    try {
      // Mock data for demo
      const mockMatches: Matching[] = [
        {
          id: 1,
          facilityId: 1,
          facilityName: 'オンライン福祉センター',
          status: 'accepted',
          appliedDate: '2025-12-01',
          respondedDate: '2025-12-02'
        },
        {
          id: 2,
          facilityId: 2,
          facilityName: 'ケアマチ山手',
          status: 'pending',
          appliedDate: '2025-12-05'
        },
        {
          id: 3,
          facilityId: 3,
          facilityName: 'デイサービス港',
          status: 'accepted',
          appliedDate: '2025-12-03',
          respondedDate: '2025-12-04'
        }
      ]

      setMatches(mockMatches)
    } catch (err) {
      console.error('Failed to fetch matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelMatch = async (matchId: number) => {
    if (confirm('このマッチング申請をキャンセルしますか？')) {
      try {
        await axios.put(
          `/api/matching/${matchId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {
          // Mock success
          console.log('Mock cancel')
        })

        setMatches(matches.filter(m => m.id !== matchId))
        alert('キャンセルしました')
      } catch (err) {
        alert('キャンセルに失敗しました')
      }
    }
  }

  const filteredMatches = matches.filter(m => {
    if (filter === 'all') return true
    return m.status === filter
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: '申請中', className: 'badge-pending' },
      accepted: { label: '承認済み', className: 'badge-accepted' },
      rejected: { label: '却下', className: 'badge-rejected' }
    }
    const { label, className } = statusMap[status] || { label: status, className: '' }
    return <span className={`badge ${className}`}>{label}</span>
  }

  return (
    <div className="matching-manager">
      <h2>マッチング管理</h2>

      <div className="filter-tabs">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map(tab => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'all' && 'すべて'}
            {tab === 'pending' && '申請中'}
            {tab === 'accepted' && '承認済み'}
            {tab === 'rejected' && '却下'}
            <span className="count">
              {matches.filter(m => tab === 'all' || m.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="empty-state">
          <p>マッチング申請はありません</p>
        </div>
      ) : (
        <div className="matches-list">
          {filteredMatches.map(match => (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <h3>{match.facilityName}</h3>
                {getStatusBadge(match.status)}
              </div>
              <div className="match-details">
                <div className="detail-item">
                  <span className="label">申請日</span>
                  <span className="value">{match.appliedDate}</span>
                </div>
                {match.respondedDate && (
                  <div className="detail-item">
                    <span className="label">返答日</span>
                    <span className="value">{match.respondedDate}</span>
                  </div>
                )}
              </div>
              <div className="match-actions">
                {match.status === 'pending' && (
                  <button
                    className="cancel-button"
                    onClick={() => handleCancelMatch(match.id)}
                  >
                    キャンセル
                  </button>
                )}
                {match.status === 'accepted' && (
                  <button className="message-button">
                    メッセージを送る
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}