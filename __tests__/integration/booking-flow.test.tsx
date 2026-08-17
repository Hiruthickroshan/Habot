/**
 * booking-flow.test.tsx
 *
 * Integration tests for the complete Parent-books-LSA user journey.
 * Tests the interaction between multiple screens and components
 * working together through the booking flow.
 *
 * Flow: Home → Search → Profile → Booking → Confirmation
 */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccessibilityInfo } from 'react-native';

import { HomeScreen } from '../../src/screens/HomeScreen';
import { LSASearchScreen } from '../../src/screens/LSASearchScreen';
import { LSAProfileScreen } from '../../src/screens/LSAProfileScreen';
import { BookingScreen } from '../../src/screens/BookingScreen';
import { ConfirmationScreen } from '../../src/screens/ConfirmationScreen';
import * as api from '../../src/utils/api';

// ── Mock API Module ─────────────────────────────────────────────────
jest.mock('../../src/utils/api');

// ── Mock AccessibilityInfo ──────────────────────────────────────────
jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

// ── Navigation Setup ────────────────────────────────────────────────

type RootStackParamList = {
  Home: undefined;
  LSASearch: undefined;
  LSAProfile: { lsaId: string };
  Booking: { lsaId: string };
  Confirmation: { bookingId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const TestNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LSASearch" component={LSASearchScreen} />
      <Stack.Screen name="LSAProfile" component={LSAProfileScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

// ── Mock Data ───────────────────────────────────────────────────────

const mockLSA: api.LSA = {
  id: 'lsa-001',
  name: 'Sarah Al-Maktoum',
  specialty: 'Autism Spectrum',
  bio: 'Certified behavioral analyst.',
  avatarUrl: 'https://example.com/avatar.jpg',
  rating: 4.9,
  reviewCount: 127,
  hourlyRate: 150,
  qualifications: ['BCBA', 'Master of Education'],
  availability: 'Monday to Friday, 8:00 AM - 4:00 PM',
  location: 'Dubai, UAE',
  isAvailable: true,
};

const mockBooking: api.BookingDetails = {
  id: 'BK-123456',
  lsaId: 'lsa-001',
  lsaName: 'Sarah Al-Maktoum',
  date: '2024-03-15',
  timeSlot: '10:00 - 11:00',
  sessionType: 'In-Person',
  childName: 'Ali',
  childAge: 8,
  status: 'confirmed',
  createdAt: '2024-03-10T10:00:00.000Z',
};

// ═══════════════════════════════════════════════════════════════════
// Integration Tests: Booking Flow
// ═══════════════════════════════════════════════════════════════════

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.fetchFeaturedLSAs as jest.Mock).mockResolvedValue([mockLSA]);
    (api.searchLSAs as jest.Mock).mockResolvedValue([mockLSA]);
    (api.fetchLSAProfile as jest.Mock).mockResolvedValue(mockLSA);
    (api.createBooking as jest.Mock).mockResolvedValue(mockBooking);
    (api.fetchBookingDetails as jest.Mock).mockResolvedValue(mockBooking);
  });

  // ── Home Screen Tests ─────────────────────────────────────────

  describe('Step 1: Home Screen', () => {
    it('should load and display featured LSAs', async () => {
      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('featured-lsa-list')).toBeTruthy();
      });

      expect(api.fetchFeaturedLSAs).toHaveBeenCalledTimes(1);
    });

    it('should announce screen to accessibility services on mount', async () => {
      render(<TestNavigator />);

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining('Welcome'),
        );
      });
    });

    it('should navigate to search screen when search button is pressed', async () => {
      const { getByTestId, findByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('home-search-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('home-search-button'));

      await waitFor(() => {
        expect(findByTestId('lsa-search-screen')).toBeTruthy();
      });
    });
  });

  // ── Search → Profile Flow ─────────────────────────────────────

  describe('Step 2: Search to Profile', () => {
    it('should display search results after entering a query', async () => {
      const { getByTestId, findByTestId } = render(<TestNavigator />);

      // Navigate to search
      await waitFor(() => expect(getByTestId('home-search-button')).toBeTruthy());
      fireEvent.press(getByTestId('home-search-button'));

      // Enter search query
      const searchInput = await findByTestId('search-input');
      fireEvent.changeText(searchInput, 'Sarah');
      fireEvent(searchInput, 'submitEditing');

      // Verify results
      await waitFor(() => {
        expect(api.searchLSAs).toHaveBeenCalledWith('Sarah', expect.any(Object));
      });
    });

    it('should announce result count to screen readers', async () => {
      const { getByTestId, findByTestId } = render(<TestNavigator />);

      await waitFor(() => expect(getByTestId('home-search-button')).toBeTruthy());
      fireEvent.press(getByTestId('home-search-button'));

      const searchInput = await findByTestId('search-input');
      fireEvent.changeText(searchInput, 'Sarah');
      fireEvent(searchInput, 'submitEditing');

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining('Found'),
        );
      });
    });
  });

  // ── Profile → Booking Flow ────────────────────────────────────

  describe('Step 3: Profile to Booking', () => {
    it('should fetch and display LSA profile', async () => {
      (api.fetchLSAProfile as jest.Mock).mockResolvedValue(mockLSA);

      // Directly test LSAProfileScreen with navigation params
      const { findByTestId } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="LSAProfile"
              component={LSAProfileScreen}
              initialParams={{ lsaId: 'lsa-001' }}
            />
          </Stack.Navigator>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(api.fetchLSAProfile).toHaveBeenCalledWith('lsa-001');
      });

      const profileName = await findByTestId('profile-name');
      expect(profileName).toBeTruthy();
    });
  });

  // ── Booking Submission Flow ───────────────────────────────────

  describe('Step 4: Booking Submission', () => {
    it('should show validation errors for empty form submission', async () => {
      const { findByTestId } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              initialParams={{ lsaId: 'lsa-001' }}
            />
          </Stack.Navigator>
        </NavigationContainer>,
      );

      const submitButton = await findByTestId('booking-submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining('error'),
        );
      });
    });
  });

  // ── Confirmation Screen ───────────────────────────────────────

  describe('Step 5: Confirmation', () => {
    it('should display booking confirmation details', async () => {
      const { findByTestId } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Confirmation"
              component={ConfirmationScreen}
              initialParams={{ bookingId: 'BK-123456' }}
            />
          </Stack.Navigator>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(api.fetchBookingDetails).toHaveBeenCalledWith('BK-123456');
      });

      const successBanner = await findByTestId('confirmation-success-banner');
      expect(successBanner).toBeTruthy();
    });

    it('should announce booking success to screen readers', async () => {
      render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Confirmation"
              component={ConfirmationScreen}
              initialParams={{ bookingId: 'BK-123456' }}
            />
          </Stack.Navigator>
        </NavigationContainer>,
      );

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining('confirmed'),
        );
      });
    });
  });
});
