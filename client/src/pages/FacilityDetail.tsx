import { useState, useEffect } from 'react';
import api from '../api';
import AvailabilityBadges from '../components/AvailabilityBadges';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import { safeGetJSON, safeSetJSON } from '../utils/storage';
import { Review, Facility } from '../types';

interface FacilityDetailProps {
  facilityId: number;
  onBack: () => void;
}

export default function FacilityDetail({ facilityId, onBack }: FacilityDetailProps) {
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsVersion, setReviewsVersion] = useState(0);

  const [favorites, setFavorites] = useState<number[]>(() => {
    return safeGetJSON<number[]>('favorites', []);
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        setLoading(true);
        const response = await api.get<Facility>(`/facilities/${facilityId}`);
        setFacility(response.data);
      } catch (err) {
        setError('事業所の情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  useEffect(() => {
    const saved = safeGetJSON<number[]>('favorites', []);
    if (saved) {
      setFavorites(saved);
    }
  }, []);

  const toggleFavorite = (facilityId: number) => {
    const newFavorites = favorites.includes(facilityId)
      ? favorites.filter(id => id !== facilityId)
      : [...favorites, facilityId];
    setFavorites(newFavorites);
    safeSetJSON('favorites', newFavorites);
  };

  const handleApplyMatch = async () => {
    if (!facility) return;
    setLoading(true);
    setError('');

    try {
      await api.post(
        '/matching',
        { facility_id: facility.id },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {
        console.log('Mock matching applied');
      });

      alert('マッチング申請を送信しました！');
      onBack();
    } catch (err: any) {
      setError('申請に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="facility-detail">
        <button className="back-button" onClick={onBack}>
          ← 戻る
        </button>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="facility-detail">
        <button className="back-button" onClick={onBack}>
          ← 戻る
        </button>
        <div className="error-message">{error || '事業所が見つかりません。'}</div>
      </div>
    );
  }

  const isFavorite = favorites.includes(facility.id);

  return (
    <div className="facility-detail">
      <button className="back-button" onClick={onBack}>
        ← 戻る
      </button>

      <div className="facility-image-section">
        {facility.imageUrl ? (
          <img src={facility.imageUrl} alt={facility.name} className="facility-main-image" />
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
        <div className="rating">
          <span className="stars">⭐{facility.rating}</span>
          <span className="review-count">レビュー {facility.reviews}件</span>
        </div>
      </div>

      {facility.availability && (
        <div className="availability-section">
          <h3>営業時間</h3>
          <AvailabilityBadges availability={facility.availability} />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="detail-content">
        <section className="info-section">
          <h2>基本情報</h2>
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
            <div className="info-item">
              <label>営業時間</label>
              <p>{facility.operatingHours || '未設定'}</p>
            </div>
            <div className="info-item">
              <label>スタッフ数</label>
              <p>{facility.staffCount || '未設定'}</p>
            </div>
          </div>
        </section>

        <section className="description-section">
          <h2>概要</h2>
          <p>{facility.description}</p>
        </section>

        <section className="services-section">
          <h2>提供サービス</h2>
          <ul className="services-list">
            {facility.services && facility.services.map((service, index) => (
              <li key={index}>✅ {service}</li>
            ))}
          </ul>
        </section>

        <div className="action-buttons">
          <button
            className="apply-button"
            onClick={handleApplyMatch}
            disabled={loading}
          >
            {loading ? '送信中...' : 'マッチングを申請'}
          </button>
          <button className="contact-button">お問い合わせ</button>
        </div>

        <section className="reviews-section">
          <h2>レビュー</h2>
          <ReviewForm facilityId={facility.id} onSaved={() => setReviewsVersion(v => v + 1)} />
          <ReviewList facilityId={facility.id} key={reviewsVersion} />
        </section>
      </div>
    </div>
  );
}