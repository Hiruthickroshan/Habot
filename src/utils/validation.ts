/**
 * validation.ts
 *
 * Form validation utilities for the HabotConnect booking flow.
 * Provides client-side validation with clear, accessible error messages.
 */
import { BookingRequest } from './api';

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validates the booking form data and returns field-level errors.
 * Returns an empty object if all fields are valid.
 */
export const validateBookingForm = (formData: BookingRequest): ValidationErrors => {
  const errors: ValidationErrors = {};

  // ── Child Name Validation ──────────────────────────────────────
  if (!formData.childName.trim()) {
    errors.childName = "Child's name is required.";
  } else if (formData.childName.trim().length < 2) {
    errors.childName = "Child's name must be at least 2 characters.";
  } else if (formData.childName.trim().length > 100) {
    errors.childName = "Child's name must be less than 100 characters.";
  }

  // ── Child Age Validation ───────────────────────────────────────
  if (!formData.childAge || formData.childAge <= 0) {
    errors.childAge = "Child's age is required.";
  } else if (formData.childAge < 2) {
    errors.childAge = 'Child must be at least 2 years old.';
  } else if (formData.childAge > 18) {
    errors.childAge = 'Child must be 18 years old or younger.';
  } else if (!Number.isInteger(formData.childAge)) {
    errors.childAge = 'Age must be a whole number.';
  }

  // ── Date Validation ────────────────────────────────────────────
  if (!formData.date.trim()) {
    errors.date = 'Date is required.';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      errors.date = 'Date must be in YYYY-MM-DD format.';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        errors.date = 'Please enter a valid date.';
      } else if (selectedDate < today) {
        errors.date = 'Date cannot be in the past.';
      } else {
        // Check if date is not more than 90 days in the future
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 90);
        if (selectedDate > maxDate) {
          errors.date = 'Date cannot be more than 90 days in the future.';
        }
      }
    }
  }

  // ── Time Slot Validation ───────────────────────────────────────
  if (!formData.timeSlot.trim()) {
    errors.timeSlot = 'Please select a time slot.';
  }

  // ── LSA ID Validation ─────────────────────────────────────────
  if (!formData.lsaId.trim()) {
    errors.lsaId = 'LSA selection is required.';
  }

  return errors;
};

/**
 * Validates an email address format.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a UAE phone number format.
 * Accepts formats: +971XXXXXXXXX, 05XXXXXXXX, 971XXXXXXXXX
 */
export const validateUAEPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+?971|0)5[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Sanitizes user input to prevent XSS.
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validates that a date string is a valid future date.
 */
export const isValidFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !isNaN(date.getTime()) && date >= today;
};
