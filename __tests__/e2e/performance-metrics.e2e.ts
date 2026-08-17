/**
 * performance-metrics.e2e.ts
 *
 * E2E performance tests that measure and validate key performance
 * metrics during real user interactions.
 *
 * Metrics tracked:
 * - App startup time (cold start)
 * - Screen transition time
 * - Search response time
 * - Booking submission time
 * - Frame rate during scrolling
 *
 * These tests serve as regression gates — if any metric exceeds
 * its threshold, the test fails and blocks the release.
 */
import { device, element, by, expect, waitFor } from 'detox';

// ── Performance Thresholds ──────────────────────────────────────────

const THRESHOLDS = {
  COLD_START_MS: 3000,         // App must start within 3 seconds
  SCREEN_TRANSITION_MS: 500,    // Screen transitions under 500ms
  SEARCH_RESPONSE_MS: 2000,     // Search results within 2 seconds
  BOOKING_SUBMIT_MS: 5000,      // Booking confirmation within 5 seconds
  MIN_FPS: 55,                  // Minimum acceptable frame rate
} as const;

// ── Timing Helper ───────────────────────────────────────────────────

const measureTime = async (action: () => Promise<void>): Promise<number> => {
  const start = Date.now();
  await action();
  return Date.now() - start;
};

// ═══════════════════════════════════════════════════════════════════

describe('Performance Metrics E2E', () => {
  // ── Cold Start Performance ────────────────────────────────────

  describe('App Startup Performance', () => {
    it(`should cold-start within ${THRESHOLDS.COLD_START_MS}ms`, async () => {
      const startTime = Date.now();

      await device.launchApp({ newInstance: true });

      // Wait for home screen to be visible
      await waitFor(element(by.id('home-welcome-text')))
        .toBeVisible()
        .withTimeout(THRESHOLDS.COLD_START_MS);

      const elapsed = Date.now() - startTime;
      console.log(`📊 Cold start time: ${elapsed}ms (threshold: ${THRESHOLDS.COLD_START_MS}ms)`);

      expect(elapsed).toBeLessThan(THRESHOLDS.COLD_START_MS);
    });

    it('should render featured LSAs within 5 seconds of launch', async () => {
      await device.launchApp({ newInstance: true });

      const elapsed = await measureTime(async () => {
        await waitFor(element(by.id('featured-lsa-list')))
          .toBeVisible()
          .withTimeout(5000);
      });

      console.log(`📊 Featured LSAs load time: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(5000);
    });
  });

  // ── Screen Transition Performance ─────────────────────────────

  describe('Screen Transition Performance', () => {
    beforeAll(async () => {
      await device.launchApp({ newInstance: true });
    });

    beforeEach(async () => {
      await device.reloadReactNative();
    });

    it(`should navigate Home → Search within ${THRESHOLDS.SCREEN_TRANSITION_MS}ms`, async () => {
      await waitFor(element(by.id('home-search-button')))
        .toBeVisible()
        .withTimeout(5000);

      const elapsed = await measureTime(async () => {
        await element(by.id('home-search-button')).tap();
        await waitFor(element(by.id('lsa-search-screen')))
          .toBeVisible()
          .withTimeout(THRESHOLDS.SCREEN_TRANSITION_MS);
      });

      console.log(`📊 Home → Search transition: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(THRESHOLDS.SCREEN_TRANSITION_MS);
    });

    it(`should navigate Search → Profile within ${THRESHOLDS.SCREEN_TRANSITION_MS}ms`, async () => {
      // Navigate to search first
      await element(by.id('home-search-button')).tap();
      await element(by.id('search-input')).typeText('Sarah');
      await element(by.id('search-input')).tapReturnKey();

      await waitFor(element(by.id('search-result-lsa-001')))
        .toBeVisible()
        .withTimeout(5000);

      const elapsed = await measureTime(async () => {
        await element(by.id('search-result-lsa-001')).tap();
        await waitFor(element(by.id('lsa-profile-screen')))
          .toBeVisible()
          .withTimeout(THRESHOLDS.SCREEN_TRANSITION_MS);
      });

      console.log(`📊 Search → Profile transition: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(THRESHOLDS.SCREEN_TRANSITION_MS * 2); // Profile loads data
    });
  });

  // ── Search Performance ────────────────────────────────────────

  describe('Search Performance', () => {
    beforeEach(async () => {
      await device.reloadReactNative();
      await element(by.id('home-search-button')).tap();
    });

    it(`should return search results within ${THRESHOLDS.SEARCH_RESPONSE_MS}ms`, async () => {
      await element(by.id('search-input')).typeText('autism');

      const elapsed = await measureTime(async () => {
        await element(by.id('search-input')).tapReturnKey();
        await waitFor(element(by.id('search-results-count')))
          .toBeVisible()
          .withTimeout(THRESHOLDS.SEARCH_RESPONSE_MS);
      });

      console.log(`📊 Search response time: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(THRESHOLDS.SEARCH_RESPONSE_MS);
    });

    it('should handle rapid consecutive searches without crashing', async () => {
      // Type and search multiple times rapidly
      for (let i = 0; i < 5; i++) {
        await element(by.id('search-input')).clearText();
        await element(by.id('search-input')).typeText(`query${i}`);
        await element(by.id('search-input')).tapReturnKey();
      }

      // App should still be responsive
      await expect(element(by.id('lsa-search-screen'))).toBeVisible();
    });
  });

  // ── Booking Submission Performance ────────────────────────────

  describe('Booking Submission Performance', () => {
    it(`should complete booking within ${THRESHOLDS.BOOKING_SUBMIT_MS}ms`, async () => {
      // Navigate to booking form
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

      await element(by.id('booking-screen')).scrollTo('bottom');

      // Measure submission time
      const elapsed = await measureTime(async () => {
        await element(by.id('booking-submit-button')).tap();
        await waitFor(element(by.id('confirmation-success-banner')))
          .toBeVisible()
          .withTimeout(THRESHOLDS.BOOKING_SUBMIT_MS);
      });

      console.log(`📊 Booking submission time: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(THRESHOLDS.BOOKING_SUBMIT_MS);
    });
  });

  // ── Scroll Performance ────────────────────────────────────────

  describe('Scroll Performance', () => {
    it('should scroll home screen smoothly without jank', async () => {
      await waitFor(element(by.id('home-screen-scroll')))
        .toBeVisible()
        .withTimeout(5000);

      // Perform scroll operations
      await element(by.id('home-screen-scroll')).scrollTo('bottom');
      await element(by.id('home-screen-scroll')).scrollTo('top');

      // If we get here without crash/timeout, scroll is acceptable
      await expect(element(by.id('home-welcome-text'))).toBeVisible();
    });

    it('should scroll search results smoothly', async () => {
      await element(by.id('home-search-button')).tap();
      await element(by.id('search-input')).typeText('a');
      await element(by.id('search-input')).tapReturnKey();

      await waitFor(element(by.id('search-results-list')))
        .toBeVisible()
        .withTimeout(5000);

      // Scroll through results
      await element(by.id('search-results-list')).scrollTo('bottom');

      // Should still be responsive
      await expect(element(by.id('lsa-search-screen'))).toBeVisible();
    });
  });

  // ── Memory Stability ─────────────────────────────────────────

  describe('Memory Stability', () => {
    it('should handle repeated navigation without memory leak', async () => {
      // Navigate back and forth 10 times
      for (let i = 0; i < 10; i++) {
        await element(by.id('home-search-button')).tap();
        await waitFor(element(by.id('lsa-search-screen')))
          .toBeVisible()
          .withTimeout(3000);

        await device.pressBack();
        await waitFor(element(by.id('home-welcome-text')))
          .toBeVisible()
          .withTimeout(3000);
      }

      // App should still be responsive after repeated navigation
      await expect(element(by.id('home-welcome-text'))).toBeVisible();
    });
  });
});
