// client/src/components/browse/BrowseControls.tsx
import React from 'react';

interface BrowseControlsProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedService: string;
  onSelectedServiceChange: (service: string) => void;
  selectedLocation: string;
  onSelectedLocationChange: (location: string) => void;
  selectedWeekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  onSelectedWeekdayChange: (weekday: 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => void;
  services: string[];
  locations: string[];
}

const BrowseControls: React.FC<BrowseControlsProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedService,
  onSelectedServiceChange,
  selectedLocation,
  onSelectedLocationChange,
  selectedWeekday,
  onSelectedWeekdayChange,
  services,
  locations,
}) => {
  return (
    <div className="filter-section">
      <div className="search-bar">
        <input
          type="text"
          placeholder="事業所名やサービス内容で検索..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>

      <div className="filter-options">
        <div className="filter-group">
          <label>サービス種別</label>
          <select
            value={selectedService}
            onChange={(e) => onSelectedServiceChange(e.target.value)}
          >
            <option value="all">すべて</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>エリア</label>
          <select
            value={selectedLocation}
            onChange={(e) => onSelectedLocationChange(e.target.value)}
          >
            <option value="all">すべて</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>曜日で絞り込む</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['all', 'すべて'], ['mon', '月'], ['tue', '火'], ['wed', '水'], ['thu', '木'], ['fri', '金'], ['sat', '土'], ['sun', '日']
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => onSelectedWeekdayChange(k as 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')}
                className={selectedWeekday === k ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ padding: '6px 10px' }}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseControls;
