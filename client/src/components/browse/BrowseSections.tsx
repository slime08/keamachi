// client/src/components/browse/BrowseSections.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facility } from '../../types'; // Assuming Facility type is in ../../types
import AvailabilityBadges from '../AvailabilityBadges'; // Re-using existing component

// Sub-component: BrowseHeaderSection
interface BrowseHeaderSectionProps {
  pageTitle: string;
}
export const BrowseHeaderSection: React.FC<BrowseHeaderSectionProps> = ({ pageTitle }) => (
  <h1>{pageTitle}</h1> // Assuming this is the "事業所を探す" title
);

// Sub-component: BrowseSearchSection
interface BrowseSearchSectionProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedService: string;
  onSelectedServiceChange: (service: string) => void;
  selectedLocation: string; // This is Prefecture
  onSelectedLocationChange: (location: string) => void; // This is Prefecture
  cityQuery: string; // New prop
  onCityQueryChange: (query: string) => void; // New prop
  selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  onSelectedWeekdayChange: (weekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => void;
  services: string[];
  locations: string[]; // This is JAPANESE_PREFECTURES
}
export const BrowseSearchSection: React.FC<BrowseSearchSectionProps> = ({
  searchQuery, onSearchQueryChange, selectedService, onSelectedServiceChange,
  selectedLocation, onSelectedLocationChange, cityQuery, onCityQueryChange, // Added cityQuery props
  selectedWeekday, onSelectedWeekdayChange,
  services, locations
}) => (
  <div className="filter-section">
    {/* New wrapper div for the 2:1:1 grid */}
    <div className="browse-main-search-row"> {/* New class for CSS Grid */}
      {/* Keyword Input (2fr) */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="事業所名やサービス内容で検索..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>

      {/* Prefecture Dropdown (1fr) */}
      <div className="filter-group">
        <label>地域</label> {/* Label change from エリア to 地域 */}
        <select
          value={selectedLocation}
          onChange={(e) => onSelectedLocationChange(e.target.value)}
        >
          <option value="all">すべての地域</option> {/* Placeholder change */}
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Service Type Dropdown (1fr) */}
      <div className="filter-group">
        <label>サービス種別</label>
        <select
          value={selectedService}
          onChange={(e) => onSelectedServiceChange(e.target.value)}
        >
          <option value="all">すべての種別</option>
          {services.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </div>
    </div> {/* End browse-main-search-row */}

    {/* Weekday filter remains */}
    <div className="filter-options"> {/* This div now only contains weekday filter */}
      <div className="filter-group">
        <label>曜日で絞り込む</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['all', 'すべて'], ['mon', '月'], ['tue', '火'], ['wed', '水'], ['thu', '木'], ['fri', '金'], ['sat', '土'], ['sun', '日']
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => onSelectedWeekdayChange(k as BrowseSearchSectionProps['selectedWeekday'])}
              className={selectedWeekday === k ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '6px 10px' }}
            >{label}</button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Sub-component: BrowseHistorySection (only search history part)
interface BrowseHistorySectionProps {
  searchHistory: string[];
  onClearSearchHistory: () => void;
  onApplySearchQuery: (query: string) => void;
}
export const BrowseHistorySection: React.FC<BrowseHistorySectionProps> = ({
  searchHistory, onClearSearchHistory, onApplySearchQuery
}) => (
  <div className="search-history-container"> {/* New wrapper div */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <strong>検索履歴</strong>
      <button className="btn btn-ghost" onClick={onClearSearchHistory}>クリア</button>
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
      {searchHistory.length === 0 ? <span className="muted">履歴はありません</span> : searchHistory.slice(0, 5).map((h, i) => ( // slice(0,5) applied
        <button key={i} className="btn btn-ghost" onClick={() => onApplySearchQuery(h)}>{h}</button>
      ))}
    </div>
  </div>
);

// Sub-component: BrowseSavedSearchSection (only saved searches part)
interface BrowseSavedSearchSectionProps {
  savedSearches: {
    id: string;
    name: string;
    filters: {
      searchQuery: string;
      selectedService: string;
      selectedLocation: string;
      selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    };
    facilityIds: number[];
    createdAt: string;
  }[];
  onSaveCurrentSearch: () => void;
  onApplySavedSearch: (search: {
    id: string;
    name: string;
    filters: {
      searchQuery: string;
      selectedService: string;
      selectedLocation: string;
      selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    };
    facilityIds: number[];
    createdAt: string;
  }) => void;
  onDeleteSavedSearch: (id: string) => void;
}
export const BrowseSavedSearchSection: React.FC<BrowseSavedSearchSectionProps> = ({
  savedSearches, onSaveCurrentSearch, onApplySavedSearch, onDeleteSavedSearch
}) => (
  <div className="saved-search-container"> {/* New wrapper div */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <strong>保存検索</strong>
      <button className="btn btn-primary" onClick={onSaveCurrentSearch}>この検索を保存</button>
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
      {savedSearches.length === 0 ? <span className="muted">保存された検索はありません</span> : savedSearches.map(s => (
        <div key={s.id} className="saved-search-card">
          <div className="saved-search-name">{s.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={() => onApplySavedSearch(s)}>適用</button>
            <button className="btn btn-ghost" onClick={() => onDeleteSavedSearch(s.id)}>削除</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Wrapper for combining search history and saved searches side-by-side
interface BrowseSearchHistoryAndSavedRowProps {
  searchHistory: string[];
  onClearSearchHistory: () => void;
  onApplySearchQuery: (query: string) => void;
  savedSearches: {
    id: string;
    name: string;
    filters: {
      searchQuery: string;
      selectedService: string;
      selectedLocation: string;
      selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    };
    facilityIds: number[];
    createdAt: string;
  }[];
  onSaveCurrentSearch: () => void;
  onApplySavedSearch: (search: {
    id: string;
    name: string;
    filters: {
      searchQuery: string;
      selectedService: string;
      selectedLocation: string;
      selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    };
    facilityIds: number[];
    createdAt: string;
  }) => void;
  onDeleteSavedSearch: (id: string) => void;
}
export const BrowseSearchHistoryAndSavedRow: React.FC<BrowseSearchHistoryAndSavedRowProps> = (props) => (
  <div className="browse-secondary-row container"> {/* Added container class for width */}
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

// Sub-component: BrowseResultsSection
interface BrowseResultsSectionProps {
  filteredFacilitiesCount: number;
}
export const BrowseResultsSection: React.FC<BrowseResultsSectionProps> = ({ filteredFacilitiesCount }) => (
  // "事業所一覧" の文字を「10件の事業所が見つかりました（件数表示）」の上に表示する。
  <div className="results-info">
    {/* Heading added here */}
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


// Sub-component: BrowseListSection
interface BrowseListSectionProps {
  loading: boolean;
  filteredFacilities: Facility[];
  onSelectFacility: (facilityId: number) => void;
}
export const BrowseListSection: React.FC<BrowseListSectionProps> = ({
  loading, filteredFacilities, onSelectFacility
}) => {
  if (loading) {
    return (
      <div className="loading">読み込み中...</div>
    );
  }

  if (filteredFacilities.length === 0) {
    return (
      <div className="no-results">
        <p>条件に合う事業所が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="facilities-list">
      {filteredFacilities.map(f => (
        <div key={f.id} className="card facility-card" onClick={() => onSelectFacility(f.id)}>
          <div className="facility-card-image-wrapper">
            {f.imageUrl ? (
              <img
                src={f.imageUrl}
                alt={f.name}
                className="facility-card-image"
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.onerror = null;
                  imgElement.style.display = 'none'; // Hide broken image
                }}
              />
            ) : (
              <div className="no-image-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                <span>NO IMAGE</span>
              </div>
            )}
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
      ))}
    </div>
  );
};

// Sub-component: BrowseDetailSection (equivalent to FacilityDetailView)
interface BrowseDetailSectionProps {
  facility: Facility;
  isFavorite: boolean;
  onToggleFavorite: (facilityId: number) => void;
  onBackToList: () => void;
}
export const BrowseDetailSection: React.FC<BrowseDetailSectionProps> = ({
  facility, isFavorite, onToggleFavorite, onBackToList
}) => {
  const availability = facility.availability;
  return (
    <div className="browse-page"> {/* Retain the top-level wrapper from original */}
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
                  return;
                }
                imgElement.onerror = null;
                imgElement.src = '/no-image.svg';
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
