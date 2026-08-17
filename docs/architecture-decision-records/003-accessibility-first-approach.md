# ADR-003: Accessibility-First Development Approach

## Status: Accepted

## Date: 2024-03-01

## Context

HabotConnect serves parents of children with special educational needs — a user base that is more likely to include individuals who rely on assistive technology. Accessibility is not just a compliance checkbox; it's a core product requirement.

We needed to decide between:
1. **Retrofit approach:** Build features first, audit accessibility later
2. **Accessibility-first approach:** Bake accessibility into the development process from the start

## Decision

We adopt an **Accessibility-First Development** approach where WCAG 2.1 AA compliance is enforced at every stage of the development lifecycle.

## Implementation

### Stage 1: Code (Static Analysis)
- `eslint-plugin-jsx-a11y` — Catches missing alt text, ARIA props at lint time
- `eslint-plugin-react-native-a11y` — RN-specific a11y rules
- Husky pre-commit hook runs these rules on every commit

### Stage 2: Component (Unit Tests)
- Every component test verifies:
  - `accessibilityRole` is set correctly
  - `accessibilityLabel` is descriptive
  - `accessibilityState` reflects component state
  - Error messages use `accessibilityLiveRegion="assertive"`

### Stage 3: Flow (Integration Tests)
- Booking flow tests verify:
  - Screen reader announcements at navigation transitions
  - Error announcement sequence
  - Focus management

### Stage 4: Device (E2E Tests)
- Detox E2E tests verify:
  - All elements reachable via screen reader navigation
  - Touch targets meet 48x48dp minimum
  - Form errors announced correctly

### Stage 5: Manual (QA)
- TalkBack (Android) + VoiceOver (iOS) manual testing
- Google Accessibility Scanner + Xcode Accessibility Inspector
- Color contrast verification with Stark

### Stage 6: CI/CD Gate
- Dedicated `accessibility-audit.yml` workflow
- Blocks merge if any a11y ESLint rule fails
- Weekly scheduled full audit

## Rationale

### Why Not Retrofit?

| Approach | Cost to Fix (relative) | Risk |
|----------|----------------------|------|
| Fix at design time | 1x | Low |
| Fix at code review | 5x | Low |
| Fix at QA | 10x | Medium |
| Fix after release | 50x | High — legal, reputation |

Retrofitting accessibility is 10-50x more expensive than building it in. For a platform serving parents of children with special needs, an accessibility failure is a product failure.

### Regulatory Compliance

The UAE is increasingly aligning with international accessibility standards. The Dubai Disability Strategy 2020 and UAE Government accessibility guidelines require digital services to be accessible to all users.

## Consequences

- **Positive:** WCAG 2.1 AA compliance from day one.
- **Positive:** Better product for all users (a11y improvements benefit everyone).
- **Positive:** Lower remediation cost.
- **Positive:** Reduced legal risk.
- **Negative:** Slightly slower initial development (5-10% overhead).
- **Negative:** Developers need accessibility training.

## References

- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa)
- [React Native Accessibility Guide](https://reactnative.dev/docs/accessibility)
- [Dubai Disability Strategy 2020](https://www.moca.gov.ae)
