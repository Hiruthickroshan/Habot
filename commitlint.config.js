/**
 * Commitlint Configuration
 *
 * Enforces Conventional Commits format:
 *   <type>(<scope>): <subject>
 *
 * Examples:
 *   feat(booking): add LSA time-slot selection
 *   fix(a11y): add missing aria-label to search button
 *   test(e2e): add parent booking flow E2E test
 *   ci: add accessibility audit workflow
 *   perf: reduce bundle size by 15%
 *
 * Valid types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the allowed values
    'type-enum': [
      2,
      'always',
      [
        'build',    // Changes to build system or external dependencies
        'chore',    // Maintenance tasks
        'ci',       // CI/CD configuration changes
        'docs',     // Documentation only changes
        'feat',     // New feature
        'fix',      // Bug fix
        'perf',     // Performance improvement
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'revert',   // Reverts a previous commit
        'style',    // Code style changes (formatting, semicolons, etc.)
        'test',     // Adding or correcting tests
        'a11y',     // Accessibility improvements (custom type for this project)
      ],
    ],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],
    // Subject must be sentence-case or lower-case
    'subject-case': [2, 'always', 'lower-case'],
    // Header must not exceed 100 characters
    'header-max-length': [2, 'always', 100],
    // Body lines must not exceed 100 characters
    'body-max-line-length': [2, 'always', 100],
  },
};
