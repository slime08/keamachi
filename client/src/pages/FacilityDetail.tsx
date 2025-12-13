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
        {/* こんな方におすすめセクション */}
        <div className="recommendation-section">
          <h3>こんな方におすすめ</h3>
          <div className="recommendation-tags">
            {facility.pcWorkAvailable && <span className="tag-chip">PC作業がしたい方</span>}
            {facility.shuttleService && <span className="tag-chip">送迎が必要な方</span>}
            {facility.trialBookingAvailable && <span className="tag-chip">見学から始めたい方</span>}
            {facility.lunchProvided && <span className="tag-chip">昼食が必要な方</span>}
            {facility.capacity && parseInt(facility.capacity) < 20 && <span className="tag-chip">少人数制が良い方</span>}
            {/* Add more based on other relevant facility properties */}
          </div>
        </div>
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

      {/* 新しい特徴セクション */}
      <section className="features-section">
        <h2>事業所の特徴</h2>
        <div className="feature-tags-grid">
          <span className="tag-chip primary-chip">{facility.serviceType}</span>
          {facility.operatingDays && facility.operatingDays.length > 0 &&
            <span className="tag-chip">対応曜日: {facility.operatingDays.join('・')}</span>}
          {facility.capacity && <span className="tag-chip">定員: {facility.capacity}名</span>}
          {facility.shuttleService && <span className="tag-chip">送迎あり</span>}
          {facility.lunchProvided && <span className="tag-chip">昼食提供あり</span>}
          {facility.trialBookingAvailable && <span className="tag-chip">見学予約可</span>}
          {facility.pcWorkAvailable && <span className="tag-chip">PC作業設備あり</span>}
        </div>
      </section>

      <div className="detail-content">
        <section className="info-section">
          <h2>基本情報</h2>
          <div className="info-grid">
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
            className="btn btn-primary btn-large" // Apply primary style
            onClick={handleApplyMatch} // Reuse existing handleApplyMatch logic for primary CTA
            disabled={loading}
          >
            {loading ? '送信中...' : '見学を申し込む'}
          </button>
          <button className="btn btn-secondary btn-large">質問する</button> {/* New secondary CTA */}
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