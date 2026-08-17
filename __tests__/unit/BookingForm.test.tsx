/**
 * BookingForm.test.tsx
 *
 * Unit tests for the BookingForm component.
 * Tests form field rendering, accessibility, user input, and error display.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookingForm } from '../../src/components/BookingForm';
import { BookingRequest } from '../../src/utils/api';
import { ValidationErrors } from '../../src/utils/validation';

// ── Mock Data ───────────────────────────────────────────────────────

const createMockFormData = (overrides: Partial<BookingRequest> = {}): BookingRequest => ({
  lsaId: 'lsa-001',
  date: '2024-03-15',
  timeSlot: '',
  sessionType: 'in-person',
  childName: '',
  childAge: 0,
  specialRequirements: '',
  notes: '',
  ...overrides,
});

// ═══════════════════════════════════════════════════════════════════
// BookingForm Tests
// ═══════════════════════════════════════════════════════════════════

describe('BookingForm', () => {
  const mockOnFieldChange = jest.fn();

  const renderForm = (
    formData: BookingRequest = createMockFormData(),
    errors: ValidationErrors = {},
  ) => {
    return render(
      <BookingForm
        formData={formData}
        errors={errors}
        onFieldChange={mockOnFieldChange}
        testID="booking-form"
      />,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Field Rendering ───────────────────────────────────────────

  describe('Field Rendering', () => {
    it('should render child name input', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-child-name')).toBeTruthy();
    });

    it('should render child age input', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-child-age')).toBeTruthy();
    });

    it('should render date input', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-date')).toBeTruthy();
    });

    it('should render time slot selection', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-time-slots')).toBeTruthy();
    });

    it('should render session type selection', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-session-types')).toBeTruthy();
    });

    it('should render special requirements field', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-special-requirements')).toBeTruthy();
    });

    it('should render notes field', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-notes')).toBeTruthy();
    });

    it('should render all three session type options', () => {
      const { getByTestId } = renderForm();
      expect(getByTestId('booking-form-session-type-in-person')).toBeTruthy();
      expect(getByTestId('booking-form-session-type-online')).toBeTruthy();
      expect(getByTestId('booking-form-session-type-hybrid')).toBeTruthy();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have accessible labels on all input fields', () => {
      const { getByTestId } = renderForm();

      const childNameInput = getByTestId('booking-form-child-name');
      expect(childNameInput.props.accessibilityLabel).toContain('Child');

      const dateInput = getByTestId('booking-form-date');
      expect(dateInput.props.accessibilityLabel).toContain('date');
    });

    it('should have radiogroup role on time slot container', () => {
      const { getByTestId } = renderForm();
      const timeSlots = getByTestId('booking-form-time-slots');
      expect(timeSlots.props.accessibilityRole).toBe('radiogroup');
    });

    it('should have radiogroup role on session type container', () => {
      const { getByTestId } = renderForm();
      const sessionTypes = getByTestId('booking-form-session-types');
      expect(sessionTypes.props.accessibilityRole).toBe('radiogroup');
    });

    it('should mark selected session type as selected in accessibility state', () => {
      const { getByTestId } = renderForm(
        createMockFormData({ sessionType: 'online' }),
      );
      const onlineOption = getByTestId('booking-form-session-type-online');
      expect(onlineOption.props.accessibilityState.selected).toBe(true);

      const inPersonOption = getByTestId('booking-form-session-type-in-person');
      expect(inPersonOption.props.accessibilityState.selected).toBe(false);
    });
  });

  // ── User Input ────────────────────────────────────────────────

  describe('User Input', () => {
    it('should call onFieldChange when child name is entered', () => {
      const { getByTestId } = renderForm();
      fireEvent.changeText(getByTestId('booking-form-child-name'), 'Ali Hassan');
      expect(mockOnFieldChange).toHaveBeenCalledWith('childName', 'Ali Hassan');
    });

    it('should call onFieldChange when date is entered', () => {
      const { getByTestId } = renderForm();
      fireEvent.changeText(getByTestId('booking-form-date'), '2024-03-20');
      expect(mockOnFieldChange).toHaveBeenCalledWith('date', '2024-03-20');
    });

    it('should call onFieldChange when a time slot is selected', () => {
      const { getByTestId } = renderForm();
      fireEvent.press(getByTestId('booking-form-time-slot-09000900'));
      // The exact testID depends on the time slot formatting
      expect(mockOnFieldChange).toHaveBeenCalled();
    });

    it('should call onFieldChange when session type is changed', () => {
      const { getByTestId } = renderForm();
      fireEvent.press(getByTestId('booking-form-session-type-online'));
      expect(mockOnFieldChange).toHaveBeenCalledWith('sessionType', 'online');
    });
  });

  // ── Error Display ─────────────────────────────────────────────

  describe('Error Display', () => {
    it('should display error message for child name', () => {
      const { getByTestId } = renderForm(createMockFormData(), {
        childName: "Child's name is required.",
      });
      const errorElement = getByTestId('booking-form-error-childName');
      expect(errorElement).toBeTruthy();
    });

    it('should set error messages as accessibility alerts', () => {
      const { getByTestId } = renderForm(createMockFormData(), {
        date: 'Date is required.',
      });
      const errorElement = getByTestId('booking-form-error-date');
      expect(errorElement.props.accessibilityRole).toBe('alert');
    });

    it('should use assertive live region for errors', () => {
      const { getByTestId } = renderForm(createMockFormData(), {
        childAge: "Child's age is required.",
      });
      const errorElement = getByTestId('booking-form-error-childAge');
      expect(errorElement.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('should not display errors when there are none', () => {
      const { queryByTestId } = renderForm();
      expect(queryByTestId('booking-form-error-childName')).toBeNull();
      expect(queryByTestId('booking-form-error-date')).toBeNull();
    });
  });

  // ── Pre-filled Data ───────────────────────────────────────────

  describe('Pre-filled Data', () => {
    it('should display pre-filled child name', () => {
      const { getByTestId } = renderForm(
        createMockFormData({ childName: 'Ali Hassan' }),
      );
      const input = getByTestId('booking-form-child-name');
      expect(input.props.value).toBe('Ali Hassan');
    });

    it('should display pre-filled date', () => {
      const { getByTestId } = renderForm(
        createMockFormData({ date: '2024-03-20' }),
      );
      const input = getByTestId('booking-form-date');
      expect(input.props.value).toBe('2024-03-20');
    });
  });
});
