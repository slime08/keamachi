export interface Facility {
  id: number;
  userId?: number;
  name: string;
  description: string;
  location: string;
  serviceType: string;
  phone?: string;
  website?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
  imageUrl?: string;
  services?: string[];
  capacity?: string;
  operatingDays?: ('月' | '火' | '水' | '木' | '金' | '土' | '日')[]; // Added
  shuttleService?: boolean; // Added
  lunchProvided?: boolean; // Added
  trialBookingAvailable?: boolean; // Added
  pcWorkAvailable?: boolean; // Added
  staffCount?: string;
  operatingHours?: string;
  reviews?: number;
  availability?: {
    mon: 'open' | 'limited' | 'closed';
    tue: 'open' | 'limited' | 'closed';
    wed: 'open' | 'limited' | 'closed';
    thu: 'open' | 'limited' | 'closed';
    fri: 'open' | 'limited' | 'closed';
    sat: 'open' | 'limited' | 'closed';
    sun: 'open' | 'limited' | 'closed';
  };
}

export interface Review {
  id: string
  facilityId: number
  rating: number
  comment: string
  author?: string
  createdAt: string
}

export interface SavedSearch {
  id: string
  name: string
  filters: {
    searchQuery?: string
    selectedService?: string
    selectedLocation?: string
    selectedWeekday?: string
  }
  facilityIds: number[]
  createdAt: string
}
