/**
 * validation.test.ts
 *
 * Unit tests for the booking form validation utility.
 * Tests cover all validation rules including edge cases,
 * boundary values, and error message accuracy.
 */
import {
  validateBookingForm,
  validateEmail,
  validateUAEPhone,
  sanitizeInput,
  isValidFutureDate,
} from '../../src/utils/validation';
import { BookingRequest } from '../../src/utils/api';

// ── Helper: Create valid form data ──────────────────────────────────

const createValidFormData = (overrides: Partial<BookingRequest> = {}): BookingRequest => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const dateStr = futureDate.toISOString().split('T')[0];

  return {
    lsaId: 'lsa-001',
    date: dateStr,
    timeSlot: '10:00 - 11:00',
    sessionType: 'in-person',
    childName: 'Ali Hassan',
    childAge: 8,
    specialRequirements: '',
    notes: '',
    ...overrides,
  };
};

// ═══════════════════════════════════════════════════════════════════
// validateBookingForm
// ═══════════════════════════════════════════════════════════════════

describe('validateBookingForm', () => {
  // ── Valid Form ─────────────────────────────────────────────────

  it('should return no errors for valid form data', () => {
    const formData = createValidFormData();
    const errors = validateBookingForm(formData);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  // ── Child Name Validation ─────────────────────────────────────

  describe('childName validation', () => {
    it('should require child name', () => {
      const errors = validateBookingForm(createValidFormData({ childName: '' }));
      expect(errors.childName).toBe("Child's name is required.");
    });

    it('should reject whitespace-only child name', () => {
      const errors = validateBookingForm(createValidFormData({ childName: '   ' }));
      expect(errors.childName).toBe("Child's name is required.");
    });

    it('should require minimum 2 characters', () => {
      const errors = validateBookingForm(createValidFormData({ childName: 'A' }));
      expect(errors.childName).toBe("Child's name must be at least 2 characters.");
    });

    it('should accept 2-character names', () => {
      const errors = validateBookingForm(createValidFormData({ childName: 'Al' }));
      expect(errors.childName).toBeUndefined();
    });

    it('should reject names longer than 100 characters', () => {
      const longName = 'A'.repeat(101);
      const errors = validateBookingForm(createValidFormData({ childName: longName }));
      expect(errors.childName).toBe("Child's name must be less than 100 characters.");
    });

    it('should accept names with exactly 100 characters', () => {
      const name = 'A'.repeat(100);
      const errors = validateBookingForm(createValidFormData({ childName: name }));
      expect(errors.childName).toBeUndefined();
    });
  });

  // ── Child Age Validation ──────────────────────────────────────

  describe('childAge validation', () => {
    it('should require child age', () => {
      const errors = validateBookingForm(createValidFormData({ childAge: 0 }));
      expect(errors.childAge).toBe("Child's age is required.");
    });

    it('should reject negative ages', () => {
      const errors = validateBookingForm(createValidFormData({ childAge: -1 }));
      expect(errors.childAge).toBe("Child's age is required.");
    });

    it('should require minimum age of 2', () => {
      const errors = validateBookingForm(createValidFormData({ childAge: 1 }));
      expect(errors.childAge).toBe('Child must be at least 2 years old.');
    });

    it('should accept age of 2', () => {
      const errors = validateBookingForm(createValidFormData({ childAge: 2 }));
      expect(errors.childAge).toBeUndefined();
    });

    it('should reject ages over 18', () => {
      const errors = validateBookingForm(createValidFormData({ childAge: 19 }));
      expect(errors.childAge).toBe('Child must be 18 years old or younger.');
    });

    it('should accept age of 18', () => {
      const errors = validateBookingForm(createValidFormData({ childAge: 18 }));
      expect(errors.childAge).toBeUndefined();
    });

    it('should reject decimal ages', () => {
      const errors = validateBookingForm(createValidFormData({ childAge: 7.5 }));
      expect(errors.childAge).toBe('Age must be a whole number.');
    });
  });

  // ── Date Validation ───────────────────────────────────────────

  describe('date validation', () => {
    it('should require a date', () => {
      const errors = validateBookingForm(createValidFormData({ date: '' }));
      expect(errors.date).toBe('Date is required.');
    });

    it('should require YYYY-MM-DD format', () => {
      const errors = validateBookingForm(createValidFormData({ date: '15/03/2024' }));
      expect(errors.date).toBe('Date must be in YYYY-MM-DD format.');
    });

    it('should reject past dates', () => {
      const errors = validateBookingForm(createValidFormData({ date: '2020-01-01' }));
      expect(errors.date).toBe('Date cannot be in the past.');
    });

    it('should reject dates more than 90 days in the future', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 91);
      const dateStr = farFuture.toISOString().split('T')[0];
      const errors = validateBookingForm(createValidFormData({ date: dateStr }));
      expect(errors.date).toBe('Date cannot be more than 90 days in the future.');
    });

    it('should accept a valid future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().split('T')[0];
      const errors = validateBookingForm(createValidFormData({ date: dateStr }));
      expect(errors.date).toBeUndefined();
    });
  });

  // ── Time Slot Validation ──────────────────────────────────────

  describe('timeSlot validation', () => {
    it('should require a time slot', () => {
      const errors = validateBookingForm(createValidFormData({ timeSlot: '' }));
      expect(errors.timeSlot).toBe('Please select a time slot.');
    });

    it('should accept a valid time slot', () => {
      const errors = validateBookingForm(createValidFormData({ timeSlot: '09:00 - 10:00' }));
      expect(errors.timeSlot).toBeUndefined();
    });
  });

  // ── Multiple Errors ───────────────────────────────────────────

  describe('multiple errors', () => {
    it('should return all field errors simultaneously', () => {
      const errors = validateBookingForm({
        lsaId: '',
        date: '',
        timeSlot: '',
        sessionType: 'in-person',
        childName: '',
        childAge: 0,
        specialRequirements: '',
        notes: '',
      });

      expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4);
      expect(errors.childName).toBeDefined();
      expect(errors.childAge).toBeDefined();
      expect(errors.date).toBeDefined();
      expect(errors.timeSlot).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// validateEmail
// ═══════════════════════════════════════════════════════════════════

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@gmail.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user @domain.com')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// validateUAEPhone
// ═══════════════════════════════════════════════════════════════════

describe('validateUAEPhone', () => {
  it('should accept valid UAE phone numbers', () => {
    expect(validateUAEPhone('+971501234567')).toBe(true);
    expect(validateUAEPhone('0501234567')).toBe(true);
    expect(validateUAEPhone('971501234567')).toBe(true);
    expect(validateUAEPhone('+971 50 123 4567')).toBe(true);
  });

  it('should reject invalid UAE phone numbers', () => {
    expect(validateUAEPhone('')).toBe(false);
    expect(validateUAEPhone('12345')).toBe(false);
    expect(validateUAEPhone('+1234567890')).toBe(false);
    expect(validateUAEPhone('+971601234567')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// sanitizeInput
// ═══════════════════════════════════════════════════════════════════

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('should escape ampersands', () => {
    expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape single quotes', () => {
    expect(sanitizeInput("it's")).toBe("it&#x27;s");
  });

  it('should not modify safe strings', () => {
    expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
  });
});

// ═══════════════════════════════════════════════════════════════════
// isValidFutureDate
// ═══════════════════════════════════════════════════════════════════

describe('isValidFutureDate', () => {
  it('should accept valid future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    expect(isValidFutureDate(futureDate.toISOString().split('T')[0])).toBe(true);
  });

  it('should reject past dates', () => {
    expect(isValidFutureDate('2020-01-01')).toBe(false);
  });

  it('should reject invalid date strings', () => {
    expect(isValidFutureDate('not-a-date')).toBe(false);
  });

  it('should accept today as a valid date', () => {
    const today = new Date();
    expect(isValidFutureDate(today.toISOString().split('T')[0])).toBe(true);
  });
});
