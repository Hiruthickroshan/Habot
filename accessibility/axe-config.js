/**
 * axe-config.js
 *
 * Configuration for axe-core accessibility testing engine.
 * Used for runtime accessibility tree validation in the CI pipeline.
 *
 * This config targets WCAG 2.1 Level AA rules specifically relevant
 * to mobile React Native applications.
 */
module.exports = {
  // ── Rules Configuration ───────────────────────────────────────
  rules: {
    // ── Enabled Rules (WCAG 2.1 AA) ────────────────────────────

    // 1.1.1 Non-text Content
    'image-alt': { enabled: true },

    // 1.3.1 Info and Relationships
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'definition-list': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },

    // 1.4.3 Contrast (Minimum)
    'color-contrast': {
      enabled: true,
      options: {
        noScroll: true,
        contrastRatio: {
          normal: { expected: 4.5 },
          large: { expected: 3.0 },
        },
      },
    },

    // 2.1.1 Keyboard
    'keyboard-access': { enabled: true },

    // 2.1.2 No Keyboard Trap
    'no-keyboard-trap': { enabled: true },

    // 2.4.1 Bypass Blocks
    'bypass': { enabled: true },

    // 2.4.2 Page Titled
    'page-has-heading-one': { enabled: true },

    // 2.4.4 Link Purpose
    'link-name': { enabled: true },

    // 2.4.6 Headings and Labels
    'empty-heading': { enabled: true },

    // 3.1.1 Language of Page
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },

    // 3.3.1 Error Identification
    'aria-alert': { enabled: true },

    // 3.3.2 Labels or Instructions
    'label': { enabled: true },

    // 4.1.1 Parsing
    'duplicate-id': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },

    // 4.1.2 Name, Role, Value
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'input-button-name': { enabled: true },

    // ── Mobile-Specific Rules ──────────────────────────────────

    // Touch target size (custom rule)
    'touch-target-size': {
      enabled: true,
      options: {
        minSize: 44, // iOS HIG minimum
      },
    },

    // Focus management
    'focus-order-semantics': { enabled: true },
    'focusable-no-name': { enabled: true },

    // ── Disabled Rules (not applicable to mobile) ──────────────

    // Table-specific rules (no HTML tables in RN)
    'td-headers-attr': { enabled: false },
    'th-has-data-cells': { enabled: false },
    'table-duplicate-name': { enabled: false },

    // Frame-specific rules (no iframes in RN)
    'frame-title': { enabled: false },
    'frame-title-unique': { enabled: false },

    // Meta tags (no HTML meta in RN)
    'meta-viewport': { enabled: false },
  },

  // ── Reporter Configuration ────────────────────────────────────
  reporter: 'v2',

  // ── Result Types ──────────────────────────────────────────────
  resultTypes: ['violations', 'incomplete'],

  // ── Locale ────────────────────────────────────────────────────
  locale: 'en',

  // ── Tags Filter ───────────────────────────────────────────────
  // Only run rules that match these WCAG tags
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
  },
};
