export interface Facility {
  id: number
  name: string
  description: string
  location: string
  service_type: string
  rating?: number
  reviews?: number
  imageUrl?: string
  availability?: {
    mon: 'open' | 'limited' | 'closed'
    tue: 'open' | 'limited' | 'closed'
    wed: 'open' | 'limited' | 'closed'
    thu: 'open' | 'limited' | 'closed'
    fri: 'open' | 'limited' | 'closed'
    sat: 'open' | 'limited' | 'closed'
    sun: 'open' | 'limited' | 'closed'
  }
  // Properties specific to FacilityDetail.tsx mock data, making them optional for broader use
  phone?: string
  email?: string
  website?: string
  services?: string[]
  capacity?: string
  staffCount?: string
  operatingHours?: string
}
