/**
 * parent-booking-lsa.e2e.ts
 *
 * End-to-End test for the core user journey:
 * Parent searches for, selects, and books a Learning Support Assistant.
 *
 * This is the critical path test — the single most important flow
 * in the HabotConnect Parent-LSA App.
 *
 * Flow: Launch → Home → Search → Profile → Booking → Confirmation
 *
 * Uses Detox's grey-box testing for reliable synchronization
 * (no arbitrary waits or sleep calls).
 */
import { device, element, by, expect, waitFor } from 'detox';

describe('Parent Booking LSA - E2E Journey', () => {
  // ── Setup ───────────────────────────────────────────────────────
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // ═══════════════════════════════════════════════════════════════
  // Step 1: Home Screen
  // ═══════════════════════════════════════════════════════════════

  describe('Step 1: Home Screen', () => {
    it('should display the welcome message', async () => {
      await expect(element(by.id('home-welcome-text'))).toBeVisible();
      await expect(element(by.text('Welcome to HabotConnect'))).toBeVisible();
    });

    it('should display the search button', async () => {
      await expect(element(by.id('home-search-button'))).toBeVisible();
    });

    it('should display featured LSA cards', async () => {
      await waitFor(element(by.id('featured-lsa-list')))
        .toBeVisible()
        .withTimeout(5000);

      // At least one featured LSA should be visible
      await expect(element(by.id('lsa-card-lsa-001'))).toBeVisible();
    });

    it('should display quick action buttons', async () => {
      await expect(element(by.id('home-my-bookings-button'))).toBeVisible();
      await expect(element(by.id('home-favorites-button'))).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Step 2: Navigate to Search
  // ═══════════════════════════════════════════════════════════════

  describe('Step 2: Search for an LSA', () => {
    beforeEach(async () => {
      await element(by.id('home-search-button')).tap();
    });

    it('should navigate to search screen', async () => {
      await expect(element(by.id('lsa-search-screen'))).toBeVisible();
    });

    it('should have a functional search input', async () => {
      await element(by.id('search-input')).typeText('Sarah');
      await element(by.id('search-input')).tapReturnKey();

      // Wait for results to load
      await waitFor(element(by.id('search-results-count')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show search results after query', async () => {
      await element(by.id('search-input')).typeText('Autism');
      await element(by.id('search-input')).tapReturnKey();

      await waitFor(element(by.id('search-result-lsa-001')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show filter panel when toggled', async () => {
      await element(by.id('search-filters-toggle')).tap();
      await expect(element(by.id('search-filters-panel'))).toBeVisible();
    });

    it('should filter by specialty', async () => {
      await element(by.id('search-filters-toggle')).tap();
      await element(by.id('search-filters-specialty-autism-spectrum')).tap();
      await element(by.id('search-filters-apply-button')).tap();

      await waitFor(element(by.id('search-results-count')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Step 3: View LSA Profile
  // ═══════════════════════════════════════════════════════════════

  describe('Step 3: View LSA Profile', () => {
    beforeEach(async () => {
      // Navigate: Home → Search → Tap first result
      await element(by.id('home-search-button')).tap();
      await element(by.id('search-input')).typeText('Sarah');
      await element(by.id('search-input')).tapReturnKey();

      await waitFor(element(by.id('search-result-lsa-001')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('search-result-lsa-001')).tap();
    });

    it('should display LSA profile details', async () => {
      await waitFor(element(by.id('profile-name')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Sarah Al-Maktoum'))).toBeVisible();
    });

    it('should display rating and reviews', async () => {
      await waitFor(element(by.id('profile-rating')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display qualifications', async () => {
      await waitFor(element(by.id('profile-qualification-0')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display the Book button', async () => {
      await expect(element(by.id('profile-book-button'))).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Step 4: Complete Booking Form
  // ═══════════════════════════════════════════════════════════════

  describe('Step 4: Complete Booking', () => {
    beforeEach(async () => {
      // Navigate: Home → Search → Profile → Book
      await element(by.id('home-search-button')).tap();
      await element(by.id('search-input')).typeText('Sarah');
      await element(by.id('search-input')).tapReturnKey();

      await waitFor(element(by.id('search-result-lsa-001')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('search-result-lsa-001')).tap();

      await waitFor(element(by.id('profile-book-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('profile-book-button')).tap();
    });

    it('should display the booking form', async () => {
      await expect(element(by.id('booking-form'))).toBeVisible();
    });

    it('should show validation errors for empty submission', async () => {
      await element(by.id('booking-submit-button')).tap();

      await waitFor(element(by.id('booking-error-summary')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should successfully submit a valid booking', async () => {
      // Fill in the form
      await element(by.id('booking-form-child-name')).typeText('Ali Hassan');
      await element(by.id('booking-form-child-age')).typeText('8');
      await element(by.id('booking-form-date')).typeText('2024-03-20');

      // Select time slot
      await element(by.id('booking-form-time-slots')).scrollTo('right');
      await element(by.id('booking-form-time-slot-10001100')).tap();

      // Select session type
      await element(by.id('booking-form-session-type-in-person')).tap();

      // Scroll down and submit
      await element(by.id('booking-screen')).scrollTo('bottom');
      await element(by.id('booking-submit-button')).tap();

      // Should navigate to confirmation
      await waitFor(element(by.id('confirmation-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Step 5: Booking Confirmation
  // ═══════════════════════════════════════════════════════════════

  describe('Step 5: Booking Confirmation', () => {
    // This test assumes successful booking from Step 4
    it('should display success banner after booking', async () => {
      // Navigate through full flow
      await element(by.id('home-search-button')).tap();
      await element(by.id('search-input')).typeText('Sarah');
      await element(by.id('search-input')).tapReturnKey();

      await waitFor(element(by.id('search-result-lsa-001')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('search-result-lsa-001')).tap();

      await waitFor(element(by.id('profile-book-button')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('profile-book-button')).tap();

      // Fill form
      await element(by.id('booking-form-child-name')).typeText('Ali');
      await element(by.id('booking-form-child-age')).typeText('8');
      await element(by.id('booking-form-date')).typeText('2024-03-20');
      await element(by.id('booking-form-time-slot-10001100')).tap();
      await element(by.id('booking-form-session-type-in-person')).tap();

      await element(by.id('booking-screen')).scrollTo('bottom');
      await element(by.id('booking-submit-button')).tap();

      // Verify confirmation
      await waitFor(element(by.id('confirmation-success-banner')))
        .toBeVisible()
        .withTimeout(10000);

      await expect(element(by.text('Booking Confirmed!'))).toBeVisible();
      await expect(element(by.id('confirmation-booking-id'))).toBeVisible();
      await expect(element(by.id('confirmation-lsa-name'))).toBeVisible();
    });

    it('should navigate back to home when Done is pressed', async () => {
      // Assuming we're on confirmation screen
      await element(by.id('confirmation-done-button')).tap();

      await waitFor(element(by.id('home-welcome-text')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
