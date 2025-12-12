// client/src/components/browse/ResultsInfo.tsx
import React from 'react';

interface ResultsInfoProps {
  filteredFacilitiesCount: number;
}

const ResultsInfo: React.FC<ResultsInfoProps> = ({ filteredFacilitiesCount }) => {
  return (
    <div className="results-info">
      <div className="availability-legend">
        <span>凡例:</span>
        <span className="badge-legend open">○</span> 空きあり
        <span className="badge-legend limited">△</span>残りわずか
        <span className="badge-legend closed">×</span> 空きなし
      </div>
      <p>{filteredFacilitiesCount}件の事業所が見つかりました</p>
    </div>
  );
};

export default ResultsInfo;
