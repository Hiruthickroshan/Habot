/**
 * LSACard.tsx
 *
 * Reusable card component displaying an LSA's summary information.
 * Used in search results and featured sections.
 *
 * Accessibility:
 * - Entire card is a single focusable element (accessible={true})
 * - accessibilityLabel combines all card data for screen readers
 * - Minimum touch target 48x48dp
 * - Color contrast ratio meets WCAG AA (4.5:1 for text)
 */
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LSA } from '../utils/api';

interface LSACardProps {
  lsa: LSA;
  onPress: () => void;
  testID?: string;
}

export const LSACard: React.FC<LSACardProps> = ({ lsa, onPress, testID }) => {
  const accessibilityLabel = [
    lsa.name,
    `${lsa.specialty} specialist`,
    `Rated ${lsa.rating.toFixed(1)} out of 5 stars`,
    `${lsa.reviewCount} reviews`,
    `${lsa.hourlyRate} AED per hour`,
    lsa.isAvailable ? 'Available' : 'Currently unavailable',
  ].join(', ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Double tap to view full profile and book this LSA"
      testID={testID}
    >
      {/* ── Avatar ──────────────────────────────────────────────── */}
      <Image
        source={{ uri: lsa.avatarUrl }}
        style={styles.avatar}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
        testID={`${testID}-avatar`}
      />

      {/* ── Info Section ────────────────────────────────────────── */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {lsa.name}
        </Text>
        <Text style={styles.specialty} numberOfLines={1}>
          {lsa.specialty}
        </Text>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>
            ⭐ {lsa.rating.toFixed(1)}
          </Text>
          <Text style={styles.reviewText}>
            ({lsa.reviewCount})
          </Text>
        </View>

        {/* Rate and availability */}
        <View style={styles.bottomRow}>
          <Text style={styles.rateText}>
            AED {lsa.hourlyRate}/hr
          </Text>
          <View
            style={[
              styles.availabilityBadge,
              lsa.isAvailable ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Text
              style={[
                styles.availabilityText,
                lsa.isAvailable ? styles.availableText : styles.unavailableText,
              ]}
            >
              {lsa.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    // Elevation for Android
    elevation: 2,
    // Shadow for iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Minimum touch target
    minHeight: 48,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8EAED',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#202124',
  },
  reviewText: {
    fontSize: 13,
    color: '#5F6368',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A73E8',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: '#E6F4EA',
  },
  unavailableBadge: {
    backgroundColor: '#FEF7F7',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  availableText: {
    color: '#137333',
  },
  unavailableText: {
    color: '#D93025',
  },
});

export default LSACard;
