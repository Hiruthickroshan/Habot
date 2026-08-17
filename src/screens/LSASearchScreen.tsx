/**
 * LSASearchScreen.tsx
 *
 * Search screen allowing parents to find LSAs by specialty, location,
 * availability, and rating. Implements accessible search with live
 * region announcements for results count.
 *
 * Accessibility:
 * - Search input has accessibilityLabel and accessibilityHint
 * - Filter controls use accessible roles (adjustable, checkbox)
 * - Results count announced via accessibilityLiveRegion="polite"
 * - Keyboard-dismissible on scroll
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LSACard } from '../components/LSACard';
import { SearchFilter } from '../components/SearchFilter';
import { searchLSAs, LSA, SearchFilters } from '../utils/api';

type RootStackParamList = {
  Home: undefined;
  LSASearch: undefined;
  LSAProfile: { lsaId: string };
  Booking: { lsaId: string };
  Confirmation: { bookingId: string };
};

type LSASearchScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LSASearch'>;
};

export const LSASearchScreen: React.FC<LSASearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LSA[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: '',
    location: '',
    minRating: 0,
    availability: 'any',
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setHasSearched(true);

    try {
      const searchResults = await searchLSAs(searchQuery, filters);
      setResults(searchResults);

      // Announce results count to screen readers
      const resultCount = searchResults.length;
      const announcement =
        resultCount === 0
          ? 'No Learning Support Assistants found. Try adjusting your filters.'
          : `Found ${resultCount} Learning Support Assistant${resultCount !== 1 ? 's' : ''}.`;
      AccessibilityInfo.announceForAccessibility(announcement);
    } catch (error) {
      console.error('Search failed:', error);
      AccessibilityInfo.announceForAccessibility('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  const handleFilterChange = useCallback((newFilters: SearchFilters): void => {
    setFilters(newFilters);
  }, []);

  const handleLSAPress = useCallback(
    (lsaId: string): void => {
      navigation.navigate('LSAProfile', { lsaId });
    },
    [navigation],
  );

  const renderLSAItem = useCallback(
    ({ item }: { item: LSA }) => (
      <LSACard
        lsa={item}
        onPress={() => handleLSAPress(item.id)}
        testID={`search-result-${item.id}`}
      />
    ),
    [handleLSAPress],
  );

  const renderEmptyState = (): React.ReactElement => (
    <View
      style={styles.emptyState}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      testID="search-empty-state"
    >
      <Text style={styles.emptyStateText}>
        {hasSearched
          ? 'No LSAs found. Try adjusting your search or filters.'
          : 'Search for Learning Support Assistants by name, specialty, or location.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container} testID="lsa-search-screen">
      {/* ── Search Input ────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholder="Search by name, specialty, or location..."
          placeholderTextColor="#9AA0A6"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityRole="search"
          accessibilityLabel="Search for Learning Support Assistants"
          accessibilityHint="Enter a name, specialty, or location and press search"
          testID="search-input"
        />
      </View>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <SearchFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleSearch}
        testID="search-filters"
      />

      {/* ── Results Count (Live Region) ─────────────────────────── */}
      {hasSearched && (
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="text"
          testID="search-results-count"
        >
          <Text style={styles.resultsCount}>
            {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
          </Text>
        </View>
      )}

      {/* ── Results List ────────────────────────────────────────── */}
      <FlatList
        data={results}
        renderItem={renderLSAItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        accessibilityRole="list"
        accessibilityLabel="Search results list"
        testID="search-results-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#202124',
    borderWidth: 1,
    borderColor: '#DADCE0',
    // Minimum height for touch target (WCAG 2.5.5)
    minHeight: 48,
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default LSASearchScreen;
