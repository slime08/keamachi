// client/src/components/browse/FacilitiesList.tsx
import React from 'react';
import { Facility } from '../../types'; // Assuming Facility type is in ../../types
import AvailabilityBadges from '../AvailabilityBadges'; // Assuming AvailabilityBadges is in ../AvailabilityBadges

interface FacilitiesListProps {
  loading: boolean;
  filteredFacilities: Facility[];
  onSelectFacility: (facilityId: number) => void;
}

const FacilitiesList: React.FC<FacilitiesListProps> = ({
  loading,
  filteredFacilities,
  onSelectFacility,
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

export default FacilitiesList;
