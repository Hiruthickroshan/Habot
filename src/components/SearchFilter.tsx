/**
 * SearchFilter.tsx
 *
 * Filter panel for LSA search results.
 * Provides controls for specialty, location, minimum rating, and availability.
 *
 * Accessibility:
 * - Collapsible panel uses accessibilityState.expanded
 * - Filter controls use appropriate roles (adjustable for slider, checkbox, etc.)
 * - Filter changes announced to screen readers
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { SearchFilters } from '../utils/api';

interface SearchFilterProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onApply: () => void;
  testID?: string;
}

const SPECIALTIES = [
  'All Specialties',
  'Autism Spectrum',
  'ADHD',
  'Dyslexia',
  'Speech & Language',
  'Behavioral Support',
  'Physical Therapy',
  'Occupational Therapy',
];

const AVAILABILITY_OPTIONS = [
  { value: 'any', label: 'Any Time' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'weekend', label: 'Weekends' },
] as const;

const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5] as const;

export const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onFilterChange,
  onApply,
  testID,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (): void => {
    setIsExpanded(!isExpanded);
    AccessibilityInfo.announceForAccessibility(
      isExpanded ? 'Filters collapsed' : 'Filters expanded',
    );
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ): void => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* ── Toggle Button ───────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel="Filters"
        accessibilityHint={isExpanded ? 'Collapse filter options' : 'Expand filter options'}
        accessibilityState={{ expanded: isExpanded }}
        testID={`${testID}-toggle`}
      >
        <Text style={styles.toggleText}>
          {isExpanded ? '▲ Hide Filters' : '▼ Show Filters'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.filtersContainer} testID={`${testID}-panel`}>
          {/* ── Specialty Filter ─────────────────────────────────── */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel} nativeID="label-specialty">
              Specialty
            </Text>
            <View
              style={styles.chipContainer}
              accessibilityRole="radiogroup"
              accessibilityLabel="Filter by specialty"
            >
              {SPECIALTIES.map((specialty) => {
                const value = specialty === 'All Specialties' ? '' : specialty;
                const isSelected = filters.specialty === value;
                return (
                  <TouchableOpacity
                    key={specialty}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => updateFilter('specialty', value)}
                    accessibilityRole="radio"
                    accessibilityLabel={specialty}
                    accessibilityState={{ selected: isSelected }}
                    testID={`${testID}-specialty-${specialty.replace(/\s/g, '-').toLowerCase()}`}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {specialty}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Location Filter ──────────────────────────────────── */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel} nativeID="label-location">
              Location
            </Text>
            <TextInput
              style={styles.input}
              value={filters.location}
              onChangeText={(text) => updateFilter('location', text)}
              placeholder="City or area..."
              placeholderTextColor="#9AA0A6"
              accessibilityLabel="Filter by location"
              accessibilityHint="Enter a city or area to filter results"
              accessibilityLabelledBy="label-location"
              testID={`${testID}-location-input`}
            />
          </View>

          {/* ── Rating Filter ────────────────────────────────────── */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel} nativeID="label-rating">
              Minimum Rating
            </Text>
            <View
              style={styles.ratingOptions}
              accessibilityRole="radiogroup"
              accessibilityLabel="Filter by minimum rating"
            >
              {RATING_OPTIONS.map((rating) => {
                const isSelected = filters.minRating === rating;
                const label = rating === 0 ? 'Any' : `${rating}+`;
                return (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.ratingButton, isSelected && styles.ratingButtonSelected]}
                    onPress={() => updateFilter('minRating', rating)}
                    accessibilityRole="radio"
                    accessibilityLabel={rating === 0 ? 'Any rating' : `${rating} stars and above`}
                    accessibilityState={{ selected: isSelected }}
                    testID={`${testID}-rating-${rating}`}
                  >
                    <Text
                      style={[styles.ratingButtonText, isSelected && styles.ratingButtonTextSelected]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Availability Filter ──────────────────────────────── */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel} nativeID="label-availability">
              Availability
            </Text>
            <View
              style={styles.chipContainer}
              accessibilityRole="radiogroup"
              accessibilityLabel="Filter by availability"
            >
              {AVAILABILITY_OPTIONS.map(({ value, label }) => {
                const isSelected = filters.availability === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => updateFilter('availability', value)}
                    accessibilityRole="radio"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: isSelected }}
                    testID={`${testID}-availability-${value}`}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Apply Button ─────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onApply}
            accessibilityRole="button"
            accessibilityLabel="Apply filters"
            accessibilityHint="Applies the selected filters and refreshes search results"
            testID={`${testID}-apply-button`}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  toggleButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A73E8',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    minHeight: 36,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#E8F0FE',
    borderColor: '#1A73E8',
  },
  chipText: {
    fontSize: 13,
    color: '#3C4043',
  },
  chipTextSelected: {
    color: '#1A73E8',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#202124',
    borderWidth: 1,
    borderColor: '#DADCE0',
    minHeight: 44,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    minHeight: 44,
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#E8F0FE',
    borderColor: '#1A73E8',
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#3C4043',
    fontWeight: '500',
  },
  ratingButtonTextSelected: {
    color: '#1A73E8',
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SearchFilter;
