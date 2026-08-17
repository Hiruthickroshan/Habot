/**
 * search-filter.test.tsx
 *
 * Integration tests for the search and filter interaction.
 * Tests the SearchFilter component working with LSASearchScreen.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccessibilityInfo } from 'react-native';

import { LSASearchScreen } from '../../src/screens/LSASearchScreen';
import * as api from '../../src/utils/api';

jest.mock('../../src/utils/api');
jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

const Stack = createNativeStackNavigator();

const renderSearchScreen = () => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LSASearch" component={LSASearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
};

// ── Mock Data ───────────────────────────────────────────────────────

const mockResults: api.LSA[] = [
  {
    id: 'lsa-001',
    name: 'Sarah Al-Maktoum',
    specialty: 'Autism Spectrum',
    bio: 'Specialist',
    avatarUrl: 'https://example.com/1.jpg',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 150,
    qualifications: [],
    availability: 'Mon-Fri',
    location: 'Dubai, UAE',
    isAvailable: true,
  },
  {
    id: 'lsa-002',
    name: 'Ahmed Hassan',
    specialty: 'ADHD',
    bio: 'Specialist',
    avatarUrl: 'https://example.com/2.jpg',
    rating: 4.7,
    reviewCount: 89,
    hourlyRate: 130,
    qualifications: [],
    availability: 'Sun-Thu',
    location: 'Abu Dhabi, UAE',
    isAvailable: true,
  },
];

// ═══════════════════════════════════════════════════════════════════

describe('Search and Filter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.searchLSAs as jest.Mock).mockResolvedValue(mockResults);
  });

  describe('Search Functionality', () => {
    it('should perform search on submit', async () => {
      const { getByTestId } = renderSearchScreen();

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'autism');
      fireEvent(searchInput, 'submitEditing');

      await waitFor(() => {
        expect(api.searchLSAs).toHaveBeenCalledWith('autism', expect.any(Object));
      });
    });

    it('should display results count after search', async () => {
      const { getByTestId, findByTestId } = renderSearchScreen();

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'submitEditing');

      const resultsCount = await findByTestId('search-results-count');
      expect(resultsCount).toBeTruthy();
    });

    it('should announce "no results" when search returns empty', async () => {
      (api.searchLSAs as jest.Mock).mockResolvedValue([]);

      const { getByTestId } = renderSearchScreen();

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'xyz-no-results');
      fireEvent(searchInput, 'submitEditing');

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining('No Learning Support Assistants found'),
        );
      });
    });
  });

  describe('Filter Panel', () => {
    it('should expand filter panel when toggle is pressed', async () => {
      const { getByTestId, findByTestId } = renderSearchScreen();

      fireEvent.press(getByTestId('search-filters-toggle'));

      const filterPanel = await findByTestId('search-filters-panel');
      expect(filterPanel).toBeTruthy();
    });

    it('should announce filter expansion to screen readers', async () => {
      const { getByTestId } = renderSearchScreen();

      fireEvent.press(getByTestId('search-filters-toggle'));

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          'Filters expanded',
        );
      });
    });

    it('should collapse filter panel on second toggle', async () => {
      const { getByTestId, queryByTestId } = renderSearchScreen();

      // Expand
      fireEvent.press(getByTestId('search-filters-toggle'));
      // Collapse
      fireEvent.press(getByTestId('search-filters-toggle'));

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          'Filters collapsed',
        );
      });
    });
  });

  describe('Search Input Accessibility', () => {
    it('should have search role on input', () => {
      const { getByTestId } = renderSearchScreen();
      const input = getByTestId('search-input');
      expect(input.props.accessibilityRole).toBe('search');
    });

    it('should have an accessible label', () => {
      const { getByTestId } = renderSearchScreen();
      const input = getByTestId('search-input');
      expect(input.props.accessibilityLabel).toContain('Learning Support');
    });

    it('should have results count as live region', async () => {
      const { getByTestId, findByTestId } = renderSearchScreen();

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'submitEditing');

      const resultsCount = await findByTestId('search-results-count');
      expect(resultsCount.props.accessibilityLiveRegion).toBe('polite');
    });
  });
});
