// Browse.tsx
import { useState, useEffect } from 'react'
import api from '../api'
import { Facility } from '../types'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { JAPANESE_PREFECTURES } from '../constants/prefectures'; // Import constant

// Import new components from BrowseSections.tsx
import {
  BrowseSearchSection,
  BrowseResultsSection,
  BrowseListSection,
  BrowseDetailSection, // For the detail view
  BrowseSearchHistoryAndSavedRow, // New combined component
} from '../components/browse/BrowseSections';

type BrowseProps = {
  initialSearch?: string
  initialService?: string
  initialLocation?: string
  initialWeekday?: 'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'
  initialCityQuery?: string // New prop
  showControls?: boolean
}

export default function BrowseFacilities(props: BrowseProps = {}) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [cityQuery, setCityQuery] = useState(''); // New state
  const [selectedWeekday, setSelectedWeekday] = useState<'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>('all')
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const raw = safeGetJSON<any[]>('search_history', []) || []
    return raw.filter((x: any) => typeof x === 'string')
  })
  const [savedSearches, setSavedSearches] = useState<any[]>(() => {
    const raw = safeGetJSON<any[]>('saved_searches', []) || []
    return raw.filter((x: any) => x && typeof x === 'object')
  })

  const services = ['訪問介護', 'デイサービス', 'グループホーム', '老健施設', '障害福祉', '児童福祉']
  const locations = JAPANESE_PREFECTURES; // Use imported constant

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = safeGetJSON<number[]>('favorites', [])
    return saved
  })

  useEffect(() => {
    fetchFacilities()
  }, [])

  useEffect(() => {
    // persist search history when searchQuery changes
    if (!searchQuery) return
    const histRaw = safeGetJSON<any[]>('search_history', []) || []
    const hist = histRaw.filter((x: any) => typeof x === 'string')
    const next = [searchQuery, ...hist.filter(h => h !== searchQuery)].slice(0,10)
    setSearchHistory(next)
    safeSetJSON('search_history', next)
  }, [searchQuery])

  // Initialize from props when provided
  useEffect(() => {
    if (props.initialSearch !== undefined) setSearchQuery(props.initialSearch)
    if (props.initialService !== undefined) setSelectedService(props.initialService)
    if (props.initialLocation !== undefined) setSelectedLocation(props.initialLocation)
    if (props.initialWeekday !== undefined) setSelectedWeekday(props.initialWeekday)
    if (props.initialCityQuery !== undefined) setCityQuery(props.initialCityQuery) // New line
  }, [props.initialSearch, props.initialService, props.initialLocation, props.initialWeekday, props.initialCityQuery])

  useEffect(() => {
    filterFacilities()
  }, [facilities, searchQuery, selectedService, selectedLocation, selectedWeekday])

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const response = await api.get<Facility[]>('/facilities')
      // Ensure response.data is always an array
      setFacilities(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error(err)
      setFacilities([]) // Keep fallback to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filterFacilities = () => {
    let filtered = facilities; // Start with all fetched facilities

    const noActiveFilters = !searchQuery && selectedService === 'all' && selectedLocation === 'all' && selectedWeekday === 'all' && !cityQuery;

    if (noActiveFilters) {
      setFilteredFacilities(facilities); // If no filters, show all facilities
      return;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(f => {
        const name = (f.name || '').toLowerCase();
        const desc = (f.description || '').toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    if (selectedService !== 'all') {
      filtered = filtered.filter(f => f.serviceType === selectedService);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(f => f.location.includes(selectedLocation));
    }

    if (cityQuery) { // New cityQuery filter
      const q = cityQuery.toLowerCase();
      filtered = filtered.filter(f => f.location.toLowerCase().includes(q));
    }

    if (selectedWeekday !== 'all') {
      filtered = filtered.filter(f => {
        const status = f.availability && (f.availability as any)[selectedWeekday];
        // treat 'open' and 'limited' as matchable (〇 or △), 'closed' means no availability
        return status === 'open' || status === 'limited';
      });
    }

    setFilteredFacilities(filtered);
  }

  const toggleFavorite = (facilityId: number) => {
    const newFavorites = favorites.includes(facilityId)
      ? favorites.filter(id => id !== facilityId)
      : [...favorites, facilityId]
    setFavorites(newFavorites)
    safeSetJSON('favorites', newFavorites)
  }

  const saveCurrentSearch = () => {
    const filters = { searchQuery, selectedService, selectedLocation, selectedWeekday }
    const facilityIds = filteredFacilities.map(f=>f.id)
    const existing = safeGetJSON<any[]>('saved_searches', [])
    const item = { id: Math.random().toString(36).slice(2,9), name: `検索: ${searchQuery || '条件検索'}`, filters, facilityIds, createdAt: new Date().toISOString() }
    const next = [item, ...existing]
    setSavedSearches(next)
    safeSetJSON('saved_searches', next)
  }

  const applySavedSearch = (s: any) => {
    setSearchQuery(s.filters.searchQuery || '')
    setSelectedService(s.filters.selectedService || 'all')
    setSelectedLocation(s.filters.selectedLocation || 'all')
    setSelectedWeekday((s.filters.selectedWeekday as any) || 'all')
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    safeSetJSON('search_history', [])
  }

  // 詳細表示モード
  if (selectedFacility) {
    const facility = facilities.find(f => f.id === selectedFacility)
    if (facility) {
      const isFavorite = favorites.includes(facility.id)
      const availability = facility.availability
      return (
        <BrowseDetailSection
          facility={facility}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onBackToList={() => setSelectedFacility(null)}
        />
      )
    }
  }

  return (
    <div className="browse-page">
      <div className="browse-container">
        {props.showControls !== false && (
          <BrowseSearchSection
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedService={selectedService}
            onSelectedServiceChange={setSelectedService}
            selectedLocation={selectedLocation} // Prefecture
            onSelectedLocationChange={setSelectedLocation} // Prefecture
            cityQuery={cityQuery} // New prop
            onCityQueryChange={setCityQuery} // New prop
            selectedWeekday={selectedWeekday}
            onSelectedWeekdayChange={setSelectedWeekday}
            services={services}
            locations={locations} // JAPANESE_PREFECTURES
          />
        )}

        {/* 検索履歴と保存検索 */}
        <BrowseSearchHistoryAndSavedRow
          searchHistory={searchHistory}
          onClearSearchHistory={clearSearchHistory}
          onApplySearchQuery={setSearchQuery}
          savedSearches={savedSearches}
          onSaveCurrentSearch={saveCurrentSearch}
          onApplySavedSearch={applySavedSearch}
          onDeleteSavedSearch={(id) => {
            const next = savedSearches.filter((x:any)=>x.id!==id)
            setSavedSearches(next)
            safeSetJSON('saved_searches', next)
          }}
        />

        {/* 検索結果数 */}
        <BrowseResultsSection filteredFacilitiesCount={filteredFacilities.length} />

        {/* 事業所一覧 */}
        <BrowseListSection
          loading={loading}
          filteredFacilities={filteredFacilities}
          onSelectFacility={setSelectedFacility}
        />
      </div>
    </div>
  )
}