/**
 * LSAProfileScreen.tsx
 *
 * Displays detailed information about a specific LSA including
 * qualifications, ratings, availability, and a "Book Now" action.
 *
 * Accessibility:
 * - Profile image has descriptive accessibilityLabel
 * - Star rating uses accessibilityValue for numeric rating
 * - Book button has clear label and hint
 * - Content sections use semantic headings
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { fetchLSAProfile, LSA } from '../utils/api';

type RootStackParamList = {
  Home: undefined;
  LSASearch: undefined;
  LSAProfile: { lsaId: string };
  Booking: { lsaId: string };
  Confirmation: { bookingId: string };
};

type LSAProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LSAProfile'>;
  route: RouteProp<RootStackParamList, 'LSAProfile'>;
};

export const LSAProfileScreen: React.FC<LSAProfileScreenProps> = ({ navigation, route }) => {
  const { lsaId } = route.params;
  const [lsa, setLsa] = useState<LSA | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      try {
        const profile = await fetchLSAProfile(lsaId);
        setLsa(profile);
        AccessibilityInfo.announceForAccessibility(
          `Viewing profile for ${profile.name}, ${profile.specialty} specialist.`,
        );
      } catch (error) {
        console.error('Failed to load LSA profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [lsaId]);

  const handleBookPress = (): void => {
    navigation.navigate('Booking', { lsaId });
  };

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading LSA profile"
        testID="profile-loading"
      >
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!lsa) {
    return (
      <View style={styles.errorContainer} testID="profile-error">
        <Text style={styles.errorText}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      testID="lsa-profile-screen"
    >
      {/* ── Profile Header ──────────────────────────────────────── */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: lsa.avatarUrl }}
          style={styles.avatar}
          accessibilityRole="image"
          accessibilityLabel={`Profile photo of ${lsa.name}`}
          testID="profile-avatar"
        />
        <Text
          style={styles.name}
          accessibilityRole="header"
          testID="profile-name"
        >
          {lsa.name}
        </Text>
        <Text style={styles.specialty} testID="profile-specialty">
          {lsa.specialty}
        </Text>

        {/* Star Rating */}
        <View
          style={styles.ratingContainer}
          accessibilityRole="text"
          accessibilityLabel={`Rating: ${lsa.rating} out of 5 stars, based on ${lsa.reviewCount} reviews`}
          accessibilityValue={{ min: 0, max: 5, now: lsa.rating }}
          testID="profile-rating"
        >
          <Text style={styles.ratingText}>
            {'⭐'.repeat(Math.round(lsa.rating))} {lsa.rating.toFixed(1)}
          </Text>
          <Text style={styles.reviewCount}>({lsa.reviewCount} reviews)</Text>
        </View>
      </View>

      {/* ── About Section ───────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          About
        </Text>
        <Text style={styles.sectionContent} testID="profile-bio">
          {lsa.bio}
        </Text>
      </View>

      {/* ── Qualifications Section ──────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Qualifications
        </Text>
        {lsa.qualifications.map((qual, index) => (
          <View key={index} style={styles.qualificationItem}>
            <Text style={styles.qualificationText} testID={`profile-qualification-${index}`}>
              ✓ {qual}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Availability Section ────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Availability
        </Text>
        <Text style={styles.sectionContent} testID="profile-availability">
          {lsa.availability}
        </Text>
      </View>

      {/* ── Hourly Rate ─────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Hourly Rate
        </Text>
        <Text
          style={styles.rateText}
          accessibilityLabel={`Hourly rate: ${lsa.hourlyRate} UAE Dirhams`}
          testID="profile-rate"
        >
          AED {lsa.hourlyRate}/hr
        </Text>
      </View>

      {/* ── Book Button ─────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBookPress}
        accessibilityRole="button"
        accessibilityLabel={`Book ${lsa.name} as your Learning Support Assistant`}
        accessibilityHint="Opens the booking form to select date, time, and session details"
        testID="profile-book-button"
      >
        <Text style={styles.bookButtonText}>Book This LSA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#5F6368',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#D93025',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#E8EAED',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: '#5F6368',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
  },
  reviewCount: {
    fontSize: 14,
    color: '#5F6368',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#3C4043',
    lineHeight: 24,
  },
  qualificationItem: {
    paddingVertical: 4,
  },
  qualificationText: {
    fontSize: 15,
    color: '#3C4043',
    lineHeight: 22,
  },
  rateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A73E8',
  },
  bookButton: {
    margin: 16,
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default LSAProfileScreen;
