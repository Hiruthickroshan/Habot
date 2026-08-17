/**
 * BookingScreen.tsx
 *
 * The booking form for scheduling an LSA session.
 * Parents select date, time slot, session type, and provide notes.
 *
 * Accessibility:
 * - Form fields have accessibilityLabel and accessibilityHint
 * - Error messages announced via accessibilityLiveRegion="assertive"
 * - Date/time pickers have accessible value descriptions
 * - Submit button disabled state communicated via accessibilityState
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BookingForm } from '../components/BookingForm';
import { createBooking, BookingRequest } from '../utils/api';
import { validateBookingForm, ValidationErrors } from '../utils/validation';

type RootStackParamList = {
  Home: undefined;
  LSASearch: undefined;
  LSAProfile: { lsaId: string };
  Booking: { lsaId: string };
  Confirmation: { bookingId: string };
};

type BookingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Booking'>;
  route: RouteProp<RootStackParamList, 'Booking'>;
};

export const BookingScreen: React.FC<BookingScreenProps> = ({ navigation, route }) => {
  const { lsaId } = route.params;
  const [formData, setFormData] = useState<BookingRequest>({
    lsaId,
    date: '',
    timeSlot: '',
    sessionType: 'in-person',
    childName: '',
    childAge: 0,
    specialRequirements: '',
    notes: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = useCallback((field: keyof BookingRequest, value: string | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    // Validate form
    const validationErrors = validateBookingForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Announce first error to screen reader
      const firstError = Object.values(validationErrors)[0];
      AccessibilityInfo.announceForAccessibility(`Form error: ${firstError}`);
      return;
    }

    setSubmitting(true);

    try {
      const booking = await createBooking(formData);
      AccessibilityInfo.announceForAccessibility('Booking confirmed successfully!');
      navigation.navigate('Confirmation', { bookingId: booking.id });
    } catch (error) {
      console.error('Booking failed:', error);
      Alert.alert(
        'Booking Failed',
        'Unable to complete your booking. Please try again.',
        [{ text: 'OK' }],
      );
      AccessibilityInfo.announceForAccessibility('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [formData, navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode="on-drag"
      testID="booking-screen"
    >
      <Text
        style={styles.title}
        accessibilityRole="header"
        testID="booking-title"
      >
        Book a Session
      </Text>

      <Text style={styles.subtitle} testID="booking-subtitle">
        Fill in the details below to schedule your LSA session.
      </Text>

      {/* ── Booking Form Component ──────────────────────────────── */}
      <BookingForm
        formData={formData}
        errors={errors}
        onFieldChange={handleFormChange}
        testID="booking-form"
      />

      {/* ── Error Summary (for screen readers) ──────────────────── */}
      {Object.keys(errors).length > 0 && (
        <View
          style={styles.errorSummary}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          testID="booking-error-summary"
        >
          <Text style={styles.errorSummaryTitle}>
            Please fix the following errors:
          </Text>
          {Object.entries(errors).map(([field, message]) => (
            <Text key={field} style={styles.errorSummaryItem}>
              • {message}
            </Text>
          ))}
        </View>
      )}

      {/* ── Submit Button ───────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel={submitting ? 'Submitting booking' : 'Confirm booking'}
        accessibilityHint="Submits the booking form and confirms your LSA session"
        accessibilityState={{ disabled: submitting, busy: submitting }}
        testID="booking-submit-button"
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Booking...' : 'Confirm Booking'}
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F6368',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorSummary: {
    backgroundColor: '#FEF7F7',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  errorSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D93025',
    marginBottom: 8,
  },
  errorSummaryItem: {
    fontSize: 14,
    color: '#D93025',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#A8C7FA',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default BookingScreen;
