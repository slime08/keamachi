// client/src/components/browse/SearchHistoryAndSaved.tsx
import React from 'react';

interface SearchHistoryAndSavedProps {
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

const SearchHistoryAndSaved: React.FC<SearchHistoryAndSavedProps> = ({
  searchHistory,
  onClearSearchHistory,
  onApplySearchQuery,
  savedSearches,
  onSaveCurrentSearch,
  onApplySavedSearch,
  onDeleteSavedSearch,
}) => {
  return (
    <div className="search-history">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <strong>検索履歴</strong>
        <button className="btn btn-ghost" onClick={onClearSearchHistory}>クリア</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
        {searchHistory.length === 0 ? <span className="muted">履歴はありません</span> : searchHistory.map((h, i) => (
          <button key={i} className="btn btn-ghost" onClick={() => onApplySearchQuery(h)}>{h}</button>
        ))}
      </div>

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
};

export default SearchHistoryAndSaved;
