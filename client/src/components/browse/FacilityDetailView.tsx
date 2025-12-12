// client/src/components/browse/FacilityDetailView.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facility } from '../../types'; // Assuming Facility type is in ../../types
import AvailabilityBadges from '../AvailabilityBadges'; // Assuming AvailabilityBadges is in ../AvailabilityBadges

interface FacilityDetailViewProps {
  facility: Facility;
  isFavorite: boolean;
  onToggleFavorite: (facilityId: number) => void;
  onBackToList: () => void;
}

const FacilityDetailView: React.FC<FacilityDetailViewProps> = ({
  facility,
  isFavorite,
  onToggleFavorite,
  onBackToList,
}) => {
  const availability = facility.availability;

  return (
    <div className="browse-page">
      <div className="facility-detail-page">
        <div className="detail-container">
          <button
            className="back-button"
            onClick={onBackToList}
          >
            ← 一覧に戻る
          </button>

          {/* 画像セクション */}
          <div className="facility-image-section">
            <img
              src={facility.imageUrl || '/no-image.svg'}
              alt={facility.name}
              className="facility-main-image"
              onError={(e) => {
                const imgElement = e.target as HTMLImageElement;
                if (imgElement.src.endsWith('/no-image.svg')) {
                  return; // Already showing no-image, prevent infinite loop
                }
                imgElement.onerror = null; // Prevent subsequent errors
                imgElement.src = '/no-image.svg'; // Fallback to a no-image SVG
              }}
            />
            <button
              className={`favorite-button ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(facility.id)}
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
  );
};

export default FacilityDetailView;
