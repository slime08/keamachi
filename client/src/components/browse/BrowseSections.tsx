// client/src/components/browse/BrowseSections.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Facility } from '../../types';
import AvailabilityBadges from '../AvailabilityBadges';

// =========================
// Shared: Image fallback
// =========================
const FALLBACK_SRC = '/no-image.svg';

function resolveImageSrc(imageUrl?: string | null) {
  if (typeof imageUrl !== 'string') return FALLBACK_SRC;
  const trimmed = imageUrl.trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_SRC;
}

// =========================
// BrowseHeaderSection
// =========================
interface BrowseHeaderSectionProps {
  pageTitle: string;
}
export const BrowseHeaderSection: React.FC<BrowseHeaderSectionProps> = ({ pageTitle }) => (
  <h1>{pageTitle}</h1>
);

// =========================
// BrowseSearchSection
// =========================
interface BrowseSearchSectionProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedService: string;
  onSelectedServiceChange: (service: string) => void;
  selectedLocation: string; // Prefecture
  onSelectedLocationChange: (location: string) => void; // Prefecture
  cityQuery: string;
  onCityQueryChange: (query: string) => void;
  selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  onSelectedWeekdayChange: (weekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => void;
  services: string[];
  locations: string[];
}

export const BrowseSearchSection: React.FC<BrowseSearchSectionProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedService,
  onSelectedServiceChange,
  selectedLocation,
  onSelectedLocationChange,
  cityQuery,
  onCityQueryChange,
  selectedWeekday,
  onSelectedWeekdayChange,
  services,
  locations,
}) => (
  <div className="filter-section">
    <div className="browse-main-search-row">
      <div className="search-bar">
        <input
          type="text"
          placeholder="事業所名やサービス内容で検索..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>地域</label>
        <select value={selectedLocation} onChange={(e) => onSelectedLocationChange(e.target.value)}>
          <option value="all">すべての地域</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>サービス種別</label>
        <select value={selectedService} onChange={(e) => onSelectedServiceChange(e.target.value)}>
          <option value="all">すべての種別</option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* cityQuery（詳細検索） */}
    <div className="filter-options">
      <div className="filter-group">
        <label>市区町村で絞り込む</label>
        <input
          type="text"
          placeholder="例: 世田谷区 / 横浜市 / 札幌市..."
          value={cityQuery}
          onChange={(e) => onCityQueryChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>曜日で絞り込む</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['all', 'すべて'],
            ['mon', '月'],
            ['tue', '火'],
            ['wed', '水'],
            ['thu', '木'],
            ['fri', '金'],
            ['sat', '土'],
            ['sun', '日'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => onSelectedWeekdayChange(k as BrowseSearchSectionProps['selectedWeekday'])}
              className={selectedWeekday === k ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '6px 10px' }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// =========================
// BrowseHistorySection
// =========================
interface BrowseHistorySectionProps {
  searchHistory: string[];
  onClearSearchHistory: () => void;
  onApplySearchQuery: (query: string) => void;
}
export const BrowseHistorySection: React.FC<BrowseHistorySectionProps> = ({
  searchHistory,
  onClearSearchHistory,
  onApplySearchQuery,
}) => (
  <div className="search-history-container">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <strong>検索履歴</strong>
      <button className="btn btn-ghost" onClick={onClearSearchHistory} type="button">
        クリア
      </button>
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
      {searchHistory.length === 0 ? (
        <span className="muted">履歴はありません</span>
      ) : (
        searchHistory.slice(0, 5).map((h, i) => (
          <button key={i} className="btn btn-ghost" onClick={() => onApplySearchQuery(h)} type="button">
            {h}
          </button>
        ))
      )}
    </div>
  </div>
);

// =========================
// BrowseSavedSearchSection
// =========================
interface SavedSearch {
  id: string;
  name: string;
  filters: {
    searchQuery: string;
    selectedService: string;
    selectedLocation: string;
    selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    cityQuery?: string; // 既存データ互換
  };
  facilityIds: number[];
  createdAt: string;
}

interface BrowseSavedSearchSectionProps {
  savedSearches: SavedSearch[];
  onSaveCurrentSearch: () => void;
  onApplySavedSearch: (search: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
}

export const BrowseSavedSearchSection: React.FC<BrowseSavedSearchSectionProps> = ({
  savedSearches,
  onSaveCurrentSearch,
  onApplySavedSearch,
  onDeleteSavedSearch,
}) => (
  <div className="saved-search-container">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <strong>保存検索</strong>
      <button className="btn btn-primary" onClick={onSaveCurrentSearch} type="button">
        この検索を保存
      </button>
    </div>

    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
      {savedSearches.length === 0 ? (
        <span className="muted">保存された検索はありません</span>
      ) : (
        savedSearches.map((s) => (
          <div key={s.id} className="saved-search-card">
            <div className="saved-search-name">{s.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button className="btn btn-ghost" onClick={() => onApplySavedSearch(s)} type="button">
                適用
              </button>
              <button className="btn btn-ghost" onClick={() => onDeleteSavedSearch(s.id)} type="button">
                削除
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// =========================
// BrowseSearchHistoryAndSavedRow
// =========================
interface BrowseSearchHistoryAndSavedRowProps {
  searchHistory: string[];
  onClearSearchHistory: () => void;
  onApplySearchQuery: (query: string) => void;
  savedSearches: SavedSearch[];
  onSaveCurrentSearch: () => void;
  onApplySavedSearch: (search: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
}

export const BrowseSearchHistoryAndSavedRow: React.FC<BrowseSearchHistoryAndSavedRowProps> = (props) => (
  <div className="browse-secondary-row container">
    <BrowseHistorySection
      searchHistory={props.searchHistory}
      onClearSearchHistory={props.onClearSearchHistory}
      onApplySearchQuery={props.onApplySearchQuery}
    />
    <BrowseSavedSearchSection
      savedSearches={props.savedSearches}
      onSaveCurrentSearch={props.onSaveCurrentSearch}
      onApplySavedSearch={props.onApplySavedSearch}
      onDeleteSavedSearch={props.onDeleteSavedSearch}
    />
  </div>
);

// =========================
// BrowseResultsSection
// =========================
interface BrowseResultsSectionProps {
  filteredFacilitiesCount: number;
}
export const BrowseResultsSection: React.FC<BrowseResultsSectionProps> = ({ filteredFacilitiesCount }) => (
  <div className="results-info">
    <h2 style={{ textAlign: 'center', fontSize: '44px' }}>事業所一覧</h2>
    <div className="availability-legend">
      <span>凡例:</span>
      <span className="badge-legend open">○</span> 空きあり
      <span className="badge-legend limited">△</span>残りわずか
      <span className="badge-legend closed">×</span> 空きなし
    </div>
    <p>{filteredFacilitiesCount}件の事業所が見つかりました</p>
  </div>
);

// =========================
// BrowseListSection  ← ここが “一覧の NO IMAGE を消す本体”
// =========================
interface BrowseListSectionProps {
  loading: boolean;
  filteredFacilities: Facility[];
  onSelectFacility: (facilityId: number) => void;
}

export const BrowseListSection: React.FC<BrowseListSectionProps> = ({
  loading,
  filteredFacilities,
  onSelectFacility,
}) => {
  if (loading) return <div className="loading">読み込み中...</div>;

  if (filteredFacilities.length === 0) {
    return (
      <div className="no-results">
        <p>条件に合う事業所が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="facilities-list">
      {filteredFacilities.map((f) => {
        const src = resolveImageSrc(f.imageUrl);

        return (
          <div
            key={f.id}
            className="card facility-card"
            onClick={() => onSelectFacility(f.id)}
          >
            <div className="facility-card-image-wrapper">
              <img
                src={src}
                alt={f.name}
                className="facility-card-image"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;

                  if (img.getAttribute('data-fallback') === '1') return;

                  console.error('[FacilityImage] load failed -> fallback', {
                    facilityId: f.id,
                    facilityName: f.name,
                    originalSrc: src,
                    imageUrl: f.imageUrl,
                  });

                  img.setAttribute('data-fallback', '1');
                  img.src = FALLBACK_SRC;
                }}
              />
            </div>

            <div className="card-body">
              <h3 className="facility-name">{f.name}</h3>
              <p className="facility-meta-info">{f.location}</p>

              <div className="facility-tags">
                <span className="tag-badge">{f.serviceType}</span>
              </div>

              <div className="facility-availability">
                <AvailabilityBadges availability={f.availability} />
              </div>

              <span className="details-link">詳細を見る</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// =========================
// BrowseDetailSection  ← これが export されてないと Browse.tsx が死ぬ
// =========================
interface BrowseDetailSectionProps {
  facility: Facility;
  isFavorite: boolean;
  onToggleFavorite: (facilityId: number) => void;
  onBackToList: () => void;
}

export const BrowseDetailSection: React.FC<BrowseDetailSectionProps> = ({
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
          <button className="back-button" onClick={onBackToList} type="button">
            ← 一覧に戻る
          </button>

          <div className="facility-image-section">
            <img
              src={resolveImageSrc(facility.imageUrl)}
              alt={facility.name}
              className="facility-main-image"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.getAttribute('data-fallback') === '1') return;

                console.error('[FacilityImage:detail] load failed -> fallback', {
                  facilityId: facility.id,
                  facilityName: facility.name,
                  originalSrc: img.src,
                  imageUrl: facility.imageUrl,
                });

                img.setAttribute('data-fallback', '1');
                img.src = FALLBACK_SRC;
              }}
            />

            <button
              className={`favorite-button ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(facility.id)}
              title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              type="button"
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
