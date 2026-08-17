# ADR-001: Detox Over Appium for E2E Testing

## Status: Accepted

## Date: 2024-03-01

## Context

HabotConnect needs an E2E testing framework for the React Native mobile app. The primary use case is testing the parent-books-LSA journey on both iOS and Android. Historically, testing has been manual, so reliability and CI/CD integration are critical for the transition to automation.

We evaluated three options: Detox, Appium, and Maestro.

## Decision

We chose **Detox** as our E2E testing framework.

## Rationale

### 1. Grey-Box Testing Eliminates Flakiness

Detox operates as a grey-box framework — it has awareness of the app's internal state (React Native bridge, async operations, network calls). This means:
- **No `sleep()` or arbitrary waits** — Detox automatically synchronizes with pending animations, network requests, and JS thread operations.
- **Dramatic reduction in flaky tests** — The #1 cause of test flakiness in mobile E2E is timing issues. Detox solves this architecturally.

Appium is black-box — it has no visibility into the app's internals, requiring manual wait strategies that are inherently unreliable.

### 2. React Native First-Class Support

Detox was built by Wix specifically for React Native. It understands:
- React Native's bridge and JavaScript thread
- Native module lifecycle
- React Navigation transitions
- AsyncStorage operations

Appium treats React Native as a generic mobile app, losing significant testing fidelity.

### 3. CI/CD Performance

| Metric | Detox | Appium |
|--------|-------|--------|
| Avg test execution time | 2-5 min | 10-20 min |
| CI setup complexity | Low | High (server required) |
| GitHub Actions support | Native | Requires Appium server |

### 4. Developer Experience

- Detox tests are written in Jest, which our team already uses for unit tests.
- Error messages are descriptive and point to the exact UI element.
- Hot-reload support during test development.

## Consequences

- **Positive:** Reliable, fast E2E tests with zero flakiness from timing issues.
- **Positive:** Same test runner (Jest) for all test levels.
- **Negative:** Detox is React Native-specific — if we ever move to Flutter/native, tests need rewriting.
- **Negative:** Smaller ecosystem than Appium (fewer community plugins).

## Alternatives Considered

### Appium
- Rejected due to flakiness risk, slow execution, and heavy CI setup.

### Maestro
- Promising but too new for production use. Limited React Native support. YAML-based tests lack the expressiveness we need for complex flows.
