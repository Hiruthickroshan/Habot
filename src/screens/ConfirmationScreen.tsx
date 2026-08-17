/**
 * ConfirmationScreen.tsx
 *
 * Displays booking confirmation details after a successful booking.
 * Shows booking ID, LSA name, date/time, and session details.
 *
 * Accessibility:
 * - Success state announced via AccessibilityInfo on mount
 * - All details have semantic labels
 * - Action buttons (Add to Calendar, Done) have clear labels and hints
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { fetchBookingDetails, BookingDetails } from '../utils/api';

type RootStackParamList = {
  Home: undefined;
  LSASearch: undefined;
  LSAProfile: { lsaId: string };
  Booking: { lsaId: string };
  Confirmation: { bookingId: string };
};

type ConfirmationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Confirmation'>;
  route: RouteProp<RootStackParamList, 'Confirmation'>;
};

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async (): Promise<void> => {
      try {
        const details = await fetchBookingDetails(bookingId);
        setBooking(details);
        AccessibilityInfo.announceForAccessibility(
          `Booking confirmed! Your session with ${details.lsaName} is scheduled for ${details.date} at ${details.timeSlot}.`,
        );
      } catch (error) {
        console.error('Failed to load booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleDone = (): void => {
    navigation.popToTop();
  };

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading booking confirmation"
        testID="confirmation-loading"
      >
        <Text style={styles.loadingText}>Loading confirmation...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer} testID="confirmation-error">
        <Text style={styles.errorText}>Could not load booking details.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      testID="confirmation-screen"
    >
      {/* ── Success Banner ──────────────────────────────────────── */}
      <View
        style={styles.successBanner}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        testID="confirmation-success-banner"
      >
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your LSA session has been successfully booked.
        </Text>
      </View>

      {/* ── Booking Details ─────────────────────────────────────── */}
      <View style={styles.detailsCard} testID="confirmation-details">
        <Text style={styles.detailsTitle} accessibilityRole="header">
          Booking Details
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booking ID</Text>
          <Text
            style={styles.detailValue}
            accessibilityLabel={`Booking ID: ${booking.id}`}
            testID="confirmation-booking-id"
          >
            {booking.id}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>LSA Name</Text>
          <Text
            style={styles.detailValue}
            accessibilityLabel={`Learning Support Assistant: ${booking.lsaName}`}
            testID="confirmation-lsa-name"
          >
            {booking.lsaName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text
            style={styles.detailValue}
            accessibilityLabel={`Date: ${booking.date}`}
            testID="confirmation-date"
          >
            {booking.date}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text
            style={styles.detailValue}
            accessibilityLabel={`Time: ${booking.timeSlot}`}
            testID="confirmation-time"
          >
            {booking.timeSlot}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Session Type</Text>
          <Text
            style={styles.detailValue}
            accessibilityLabel={`Session type: ${booking.sessionType}`}
            testID="confirmation-session-type"
          >
            {booking.sessionType}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Child Name</Text>
          <Text
            style={styles.detailValue}
            testID="confirmation-child-name"
          >
            {booking.childName}
          </Text>
        </View>
      </View>

      {/* ── Action Buttons ──────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.calendarButton}
        accessibilityRole="button"
        accessibilityLabel="Add to calendar"
        accessibilityHint="Adds this booking to your device calendar"
        testID="confirmation-add-calendar-button"
      >
        <Text style={styles.calendarButtonText}>📅 Add to Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleDone}
        accessibilityRole="button"
        accessibilityLabel="Done"
        accessibilityHint="Returns to the home screen"
        testID="confirmation-done-button"
      >
        <Text style={styles.doneButtonText}>Done</Text>
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
    padding: 16,
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
  successBanner: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#E6F4EA',
    borderRadius: 16,
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#137333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#137333',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  detailLabel: {
    fontSize: 15,
    color: '#5F6368',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#202124',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  calendarButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A73E8',
    marginBottom: 12,
  },
  calendarButtonText: {
    color: '#1A73E8',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
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
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ConfirmationScreen;
