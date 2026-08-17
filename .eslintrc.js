module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'react-native/react-native': true,
    jest: true,
    es2021: true,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'react-native-a11y',
    'jsx-a11y',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:jsx-a11y/strict',
    'plugin:react-native-a11y/all',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // ── TypeScript ──────────────────────────────────────────────
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',

    // ── React ───────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript for prop types
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── React Native ────────────────────────────────────────────
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'error',
    'react-native/sort-styles': 'off',

    // ── Accessibility (WCAG 2.1 AA Enforcement) ─────────────────
    // These rules enforce accessibility at the code level, catching
    // violations before they ever reach QA or production.

    // All interactive elements MUST have accessible labels
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',

    // Clickable elements must be focusable and have semantic meaning
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',

    // Form controls must have associated labels
    'jsx-a11y/label-has-associated-control': 'error',

    // Heading hierarchy must be logical
    'jsx-a11y/heading-has-content': 'error',

    // Images must have alt text
    'jsx-a11y/img-redundant-alt': 'error',

    // React Native specific accessibility
    'react-native-a11y/has-accessibility-hint': 'warn',
    'react-native-a11y/has-accessibility-props': 'error',
    'react-native-a11y/has-valid-accessibility-actions': 'error',
    'react-native-a11y/has-valid-accessibility-role': 'error',
    'react-native-a11y/has-valid-accessibility-state': 'error',
    'react-native-a11y/has-valid-accessibility-value': 'error',
    'react-native-a11y/no-nested-touchables': 'error',
    'react-native-a11y/has-valid-accessibility-live-region': 'warn',
    'react-native-a11y/has-valid-important-for-accessibility': 'warn',
  },
  overrides: [
    {
      // Relaxed rules for test files
      files: ['**/__tests__/**/*', '**/*.test.{ts,tsx}', '**/*.e2e.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react-native-a11y/has-accessibility-hint': 'off',
      },
    },
  ],
};
