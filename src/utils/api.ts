/**
 * api.ts
 *
 * API utility module for the HabotConnect Parent-LSA App.
 * Provides typed interfaces and mock API functions for:
 * - LSA search and profiles
 * - Booking creation and retrieval
 *
 * In production, these would be replaced with actual HTTP calls.
 * Mock data is used here for testing and demonstration purposes.
 */

// ── Type Definitions ────────────────────────────────────────────────

export interface LSA {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  qualifications: string[];
  availability: string;
  location: string;
  isAvailable: boolean;
}

export interface SearchFilters {
  specialty: string;
  location: string;
  minRating: number;
  availability: string;
}

export interface BookingRequest {
  lsaId: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  childName: string;
  childAge: number;
  specialRequirements: string;
  notes: string;
}

export interface BookingDetails {
  id: string;
  lsaId: string;
  lsaName: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  childName: string;
  childAge: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_LSAS: LSA[] = [
  {
    id: 'lsa-001',
    name: 'Sarah Al-Maktoum',
    specialty: 'Autism Spectrum',
    bio: 'Certified behavioral analyst with 8 years of experience working with children on the autism spectrum. Specialized in Applied Behavior Analysis (ABA) and social skills development.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 150,
    qualifications: [
      'Board Certified Behavior Analyst (BCBA)',
      'Master of Education in Special Education',
      'ABA Therapy Certification',
      'First Aid and CPR Certified',
    ],
    availability: 'Monday to Friday, 8:00 AM - 4:00 PM',
    location: 'Dubai, UAE',
    isAvailable: true,
  },
  {
    id: 'lsa-002',
    name: 'Ahmed Hassan',
    specialty: 'ADHD',
    bio: 'Learning support specialist focusing on ADHD management strategies, executive function coaching, and organizational skills development for children aged 5-16.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=ahmed',
    rating: 4.7,
    reviewCount: 89,
    hourlyRate: 130,
    qualifications: [
      'Licensed Educational Psychologist',
      'ADHD Coaching Certification',
      'Bachelor of Science in Psychology',
      'Positive Behavior Support Trained',
    ],
    availability: 'Sunday to Thursday, 9:00 AM - 5:00 PM',
    location: 'Abu Dhabi, UAE',
    isAvailable: true,
  },
  {
    id: 'lsa-003',
    name: 'Fatima Al-Rashidi',
    specialty: 'Dyslexia',
    bio: 'Orton-Gillingham trained reading specialist with expertise in dyslexia remediation. 12 years of experience in multisensory structured language education.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=fatima',
    rating: 4.8,
    reviewCount: 156,
    hourlyRate: 140,
    qualifications: [
      'Orton-Gillingham Certified Practitioner',
      'Master of Arts in Literacy Education',
      'Wilson Reading System Certified',
      'International Dyslexia Association Member',
    ],
    availability: 'Monday to Saturday, 10:00 AM - 6:00 PM',
    location: 'Sharjah, UAE',
    isAvailable: true,
  },
  {
    id: 'lsa-004',
    name: 'Khalid Al-Tamimi',
    specialty: 'Speech & Language',
    bio: 'Licensed speech-language pathologist specializing in childhood articulation disorders, language delays, and augmentative communication systems.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=khalid',
    rating: 4.6,
    reviewCount: 72,
    hourlyRate: 160,
    qualifications: [
      'Licensed Speech-Language Pathologist (SLP)',
      'Master of Science in Communication Disorders',
      'PECS (Picture Exchange Communication) Certified',
      'Hanen Certified Therapist',
    ],
    availability: 'Sunday to Wednesday, 8:00 AM - 3:00 PM',
    location: 'Dubai, UAE',
    isAvailable: false,
  },
];

// ── Simulated API Delay ─────────────────────────────────────────────

const simulateDelay = (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── API Functions ───────────────────────────────────────────────────

/**
 * Fetches featured LSAs for the home screen.
 */
export const fetchFeaturedLSAs = async (): Promise<LSA[]> => {
  await simulateDelay(300);
  return MOCK_LSAS.filter((lsa) => lsa.isAvailable).slice(0, 3);
};

/**
 * Searches LSAs based on query and filters.
 */
export const searchLSAs = async (
  query: string,
  filters: SearchFilters,
): Promise<LSA[]> => {
  await simulateDelay(500);

  let results = [...MOCK_LSAS];

  // Filter by search query
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (lsa) =>
        lsa.name.toLowerCase().includes(lowerQuery) ||
        lsa.specialty.toLowerCase().includes(lowerQuery) ||
        lsa.location.toLowerCase().includes(lowerQuery),
    );
  }

  // Filter by specialty
  if (filters.specialty) {
    results = results.filter((lsa) => lsa.specialty === filters.specialty);
  }

  // Filter by location
  if (filters.location.trim()) {
    const lowerLocation = filters.location.toLowerCase();
    results = results.filter((lsa) =>
      lsa.location.toLowerCase().includes(lowerLocation),
    );
  }

  // Filter by minimum rating
  if (filters.minRating > 0) {
    results = results.filter((lsa) => lsa.rating >= filters.minRating);
  }

  return results;
};

/**
 * Fetches a specific LSA's full profile.
 */
export const fetchLSAProfile = async (lsaId: string): Promise<LSA> => {
  await simulateDelay(400);

  const lsa = MOCK_LSAS.find((l) => l.id === lsaId);
  if (!lsa) {
    throw new Error(`LSA not found: ${lsaId}`);
  }
  return lsa;
};

/**
 * Creates a new booking.
 */
export const createBooking = async (
  request: BookingRequest,
): Promise<BookingDetails> => {
  await simulateDelay(800);

  const lsa = MOCK_LSAS.find((l) => l.id === request.lsaId);
  if (!lsa) {
    throw new Error(`LSA not found: ${request.lsaId}`);
  }

  const booking: BookingDetails = {
    id: `BK-${Date.now()}`,
    lsaId: request.lsaId,
    lsaName: lsa.name,
    date: request.date,
    timeSlot: request.timeSlot,
    sessionType: request.sessionType,
    childName: request.childName,
    childAge: request.childAge,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  return booking;
};

/**
 * Fetches booking details by ID.
 */
export const fetchBookingDetails = async (
  bookingId: string,
): Promise<BookingDetails> => {
  await simulateDelay(300);

  // Return mock booking data
  return {
    id: bookingId,
    lsaId: 'lsa-001',
    lsaName: 'Sarah Al-Maktoum',
    date: '2024-03-15',
    timeSlot: '10:00 - 11:00',
    sessionType: 'In-Person',
    childName: 'Ali',
    childAge: 8,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
};
