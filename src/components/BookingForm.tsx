/**
 * BookingForm.tsx
 *
 * Reusable form component for booking an LSA session.
 * Contains date, time, session type, child info, and notes fields.
 *
 * Accessibility:
 * - Each field has a visible label + accessibilityLabel
 * - Error messages linked via accessibilityLiveRegion="assertive"
 * - Required fields indicated with "(required)" in label
 * - Form inputs have minimum 48dp touch targets
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BookingRequest } from '../utils/api';
import { ValidationErrors } from '../utils/validation';

interface BookingFormProps {
  formData: BookingRequest;
  errors: ValidationErrors;
  onFieldChange: (field: keyof BookingRequest, value: string | number) => void;
  testID?: string;
}

const SESSION_TYPES = [
  { value: 'in-person', label: 'In-Person' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

export const BookingForm: React.FC<BookingFormProps> = ({
  formData,
  errors,
  onFieldChange,
  testID,
}) => {
  const renderFieldError = (field: string): React.ReactNode => {
    const error = errors[field];
    if (!error) return null;
    return (
      <Text
        style={styles.fieldError}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        testID={`${testID}-error-${field}`}
      >
        {error}
      </Text>
    );
  };

  return (
    <View testID={testID}>
      {/* ── Child Name (Required) ───────────────────────────────── */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label} nativeID="label-childName">
          Child&apos;s Name (required)
        </Text>
        <TextInput
          style={[styles.input, errors.childName && styles.inputError]}
          value={formData.childName}
          onChangeText={(text) => onFieldChange('childName', text)}
          placeholder="Enter your child's name"
          placeholderTextColor="#9AA0A6"
          accessibilityLabel="Child's name, required"
          accessibilityHint="Enter the full name of the child who will receive support"
          accessibilityLabelledBy="label-childName"
          testID={`${testID}-child-name`}
        />
        {renderFieldError('childName')}
      </View>

      {/* ── Child Age (Required) ────────────────────────────────── */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label} nativeID="label-childAge">
          Child&apos;s Age (required)
        </Text>
        <TextInput
          style={[styles.input, errors.childAge && styles.inputError]}
          value={formData.childAge > 0 ? String(formData.childAge) : ''}
          onChangeText={(text) => onFieldChange('childAge', parseInt(text, 10) || 0)}
          placeholder="Enter age"
          placeholderTextColor="#9AA0A6"
          keyboardType="numeric"
          accessibilityLabel="Child's age, required"
          accessibilityHint="Enter the age of the child in years"
          accessibilityLabelledBy="label-childAge"
          testID={`${testID}-child-age`}
        />
        {renderFieldError('childAge')}
      </View>

      {/* ── Date (Required) ─────────────────────────────────────── */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label} nativeID="label-date">
          Date (required)
        </Text>
        <TextInput
          style={[styles.input, errors.date && styles.inputError]}
          value={formData.date}
          onChangeText={(text) => onFieldChange('date', text)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9AA0A6"
          accessibilityLabel="Session date, required"
          accessibilityHint="Enter the date in format year dash month dash day"
          accessibilityLabelledBy="label-date"
          testID={`${testID}-date`}
        />
        {renderFieldError('date')}
      </View>

      {/* ── Time Slot (Required) ────────────────────────────────── */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label} nativeID="label-timeSlot">
          Time Slot (required)
        </Text>
        <View
          style={styles.timeSlotGrid}
          accessibilityRole="radiogroup"
          accessibilityLabel="Select a time slot"
          testID={`${testID}-time-slots`}
        >
          {TIME_SLOTS.map((slot) => {
            const isSelected = formData.timeSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.timeSlotButton, isSelected && styles.timeSlotSelected]}
                onPress={() => onFieldChange('timeSlot', slot)}
                accessibilityRole="radio"
                accessibilityLabel={`Time slot: ${slot}`}
                accessibilityState={{ selected: isSelected }}
                testID={`${testID}-time-slot-${slot.replace(/[:\s-]/g, '')}`}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    isSelected && styles.timeSlotTextSelected,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {renderFieldError('timeSlot')}
      </View>

      {/* ── Session Type ────────────────────────────────────────── */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label} nativeID="label-sessionType">
          Session Type
        </Text>
        <View
          style={styles.sessionTypeRow}
          accessibilityRole="radiogroup"
          accessibilityLabel="Select session type"
          testID={`${testID}-session-types`}
        >
          {SESSION_TYPES.map(({ value, label }) => {
            const isSelected = formData.sessionType === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.sessionTypeButton, isSelected && styles.sessionTypeSelected]}
                onPress={() => onFieldChange('sessionType', value)}
                accessibilityRole="radio"
                accessibilityLabel={`Session type: ${label}`}
                accessibilityState={{ selected: isSelected }}
                testID={`${testID}-session-type-${value}`}
              >
                <Text
                  style={[
                    styles.sessionTypeText,
                    isSelected && styles.sessionTypeTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Special Requirements ────────────────────────────────── */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label} nativeID="label-specialRequirements">
          Special Requirements
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.specialRequirements}
          onChangeText={(text) => onFieldChange('specialRequirements', text)}
          placeholder="Describe any special needs, learning goals, or accommodations needed"
          placeholderTextColor="#9AA0A6"
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          accessibilityLabel="Special requirements"
          accessibilityHint="Describe any special needs, learning goals, or accommodations"
          accessibilityLabelledBy="label-specialRequirements"
          testID={`${testID}-special-requirements`}
        />
      </View>

      {/* ── Notes ───────────────────────────────────────────────── */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label} nativeID="label-notes">
          Additional Notes
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => onFieldChange('notes', text)}
          placeholder="Any additional information for the LSA"
          placeholderTextColor="#9AA0A6"
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
          accessibilityLabel="Additional notes"
          accessibilityHint="Enter any additional information for the Learning Support Assistant"
          accessibilityLabelledBy="label-notes"
          testID={`${testID}-notes`}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#202124',
    borderWidth: 1,
    borderColor: '#DADCE0',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#D93025',
    borderWidth: 2,
  },
  textArea: {
    minHeight: 96,
  },
  fieldError: {
    fontSize: 13,
    color: '#D93025',
    marginTop: 4,
    fontWeight: '500',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    justifyContent: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#E8F0FE',
    borderColor: '#1A73E8',
    borderWidth: 2,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#3C4043',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#1A73E8',
    fontWeight: '700',
  },
  sessionTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  sessionTypeSelected: {
    backgroundColor: '#E8F0FE',
    borderColor: '#1A73E8',
    borderWidth: 2,
  },
  sessionTypeText: {
    fontSize: 14,
    color: '#3C4043',
    fontWeight: '500',
  },
  sessionTypeTextSelected: {
    color: '#1A73E8',
    fontWeight: '700',
  },
});

export default BookingForm;
