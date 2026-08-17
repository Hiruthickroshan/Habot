/**
 * HomeScreen.tsx
 *
 * The main landing screen for the HabotConnect Parent-LSA App.
 * Displays a welcome message, featured LSAs, and quick-action buttons.
 *
 * Accessibility:
 * - All interactive elements have accessibilityLabel and accessibilityHint
 * - Semantic roles are assigned (button, header, image)
 * - Screen reader announcement on mount via accessibilityLiveRegion
 * - Minimum touch target size: 48x48dp (WCAG 2.1 AA — 2.5.5 Target Size)
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LSACard } from '../components/LSACard';
import { fetchFeaturedLSAs, LSA } from '../utils/api';

type RootStackParamList = {
  Home: undefined;
  LSASearch: undefined;
  LSAProfile: { lsaId: string };
  Booking: { lsaId: string };
  Confirmation: { bookingId: string };
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [featuredLSAs, setFeaturedLSAs] = useState<LSA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Announce screen to screen readers
    AccessibilityInfo.announceForAccessibility('Welcome to HabotConnect. Find and book a Learning Support Assistant.');

    const loadFeaturedLSAs = async (): Promise<void> => {
      try {
        const lsas = await fetchFeaturedLSAs();
        setFeaturedLSAs(lsas);
      } catch (error) {
        console.error('Failed to load featured LSAs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedLSAs();
  }, []);

  const handleSearchPress = (): void => {
    navigation.navigate('LSASearch');
  };

  const handleLSAPress = (lsaId: string): void => {
    navigation.navigate('LSAProfile', { lsaId });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      accessibilityRole="scrollbar"
      testID="home-screen-scroll"
    >
      {/* ── Header Section ──────────────────────────────────────── */}
      <View
        style={styles.header}
        accessibilityRole="header"
        accessible={true}
      >
        <Text
          style={styles.welcomeText}
          accessibilityRole="header"
          testID="home-welcome-text"
        >
          Welcome to HabotConnect
        </Text>
        <Text
          style={styles.subtitleText}
          testID="home-subtitle-text"
        >
          Find the perfect Learning Support Assistant for your child
        </Text>
      </View>

      {/* ── Search Button ───────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearchPress}
        accessibilityRole="button"
        accessibilityLabel="Search for Learning Support Assistants"
        accessibilityHint="Opens the search screen to find available LSAs by specialty, location, and availability"
        testID="home-search-button"
      >
        <Text style={styles.searchButtonText}>🔍 Find an LSA</Text>
      </TouchableOpacity>

      {/* ── Featured LSAs Section ───────────────────────────────── */}
      <View style={styles.featuredSection}>
        <Text
          style={styles.sectionTitle}
          accessibilityRole="header"
          testID="featured-section-title"
        >
          Featured Learning Support Assistants
        </Text>

        {loading ? (
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Loading featured Learning Support Assistants"
            accessibilityLiveRegion="polite"
            testID="home-loading-indicator"
          >
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <View
            accessibilityLiveRegion="polite"
            testID="featured-lsa-list"
          >
            {featuredLSAs.map((lsa) => (
              <LSACard
                key={lsa.id}
                lsa={lsa}
                onPress={() => handleLSAPress(lsa.id)}
                testID={`lsa-card-${lsa.id}`}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── Quick Actions ───────────────────────────────────────── */}
      <View
        style={styles.quickActions}
        accessibilityRole="toolbar"
        accessibilityLabel="Quick actions"
        testID="home-quick-actions"
      >
        <TouchableOpacity
          style={styles.quickActionButton}
          accessibilityRole="button"
          accessibilityLabel="View my bookings"
          accessibilityHint="Navigate to view your current and past LSA bookings"
          testID="home-my-bookings-button"
        >
          <Text style={styles.quickActionText}>📅 My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          accessibilityRole="button"
          accessibilityLabel="View my favorites"
          accessibilityHint="Navigate to view your saved favorite LSAs"
          testID="home-favorites-button"
        >
          <Text style={styles.quickActionText}>⭐ Favorites</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    backgroundColor: '#1A73E8',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#E8F0FE',
    lineHeight: 22,
  },
  searchButton: {
    margin: 16,
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    // Minimum touch target: 48x48dp (WCAG 2.5.5)
    minHeight: 48,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  featuredSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
    padding: 32,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    // Minimum touch target: 48x48dp (WCAG 2.5.5)
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A73E8',
  },
});

export default HomeScreen;
