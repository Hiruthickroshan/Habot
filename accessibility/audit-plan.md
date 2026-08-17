# Accessibility Audit Plan — HabotConnect Parent-LSA App

## 1. Audit Overview

| Field | Detail |
|-------|--------|
| **Application** | HabotConnect Parent-LSA Mobile App |
| **Standard** | WCAG 2.1 Level AA |
| **Platforms** | iOS 15+, Android 12+ |
| **Scope** | All screens in the Parent booking flow |
| **Audit Frequency** | Every sprint + pre-release gate |

## 2. Audit Phases

### Phase 1: Automated Static Analysis (CI/CD)

**Tools:**
- `eslint-plugin-jsx-a11y` — Catches missing alt text, ARIA props, click handlers
- `eslint-plugin-react-native-a11y` — React Native specific checks (accessibilityLabel, role, etc.)
- `axe-core` (via `react-native-a11y-engine`) — Runtime accessibility tree validation

**What It Catches:**
- Missing `accessibilityLabel` on interactive elements
- Invalid `accessibilityRole` values
- Missing ARIA properties
- Nested touchables (causing focus traps)
- Images without alt text equivalents

**Integration:** Runs on every commit via Husky pre-commit hook and in CI pipeline.

---

### Phase 2: Automated Runtime Scanning

**Tools:**
- **Google Accessibility Scanner** (Android) — Device-level scan of rendered UI
- **Xcode Accessibility Inspector** (iOS) — Verify VoiceOver tree

**Process:**
1. Build and install the app on test device/simulator
2. Run Accessibility Scanner on each screen
3. Export scan reports as JSON/screenshots
4. File issues for any violations found

**Scheduling:** Run after each sprint's feature freeze.

---

### Phase 3: Manual Assistive Technology Testing

**Tools:**
- **TalkBack** (Android) — Screen reader testing
- **VoiceOver** (iOS) — Screen reader testing
- **Switch Access** (Android) — Motor impairment testing
- **Voice Control** (iOS) — Motor impairment testing

**Test Protocol:**

| Screen | TalkBack Test | VoiceOver Test | Actions to Verify |
|--------|--------------|----------------|-------------------|
| Home | ✅ | ✅ | Navigate featured LSAs, tap search, tap quick actions |
| Search | ✅ | ✅ | Enter query, expand filters, select filter, navigate results |
| Profile | ✅ | ✅ | Read name/rating/bio, navigate qualifications, tap Book |
| Booking | ✅ | ✅ | Fill all fields, select time slot/session type, submit, hear errors |
| Confirmation | ✅ | ✅ | Read booking details, tap Add to Calendar, tap Done |

**Key Checks Per Screen:**
1. All elements are reachable by swipe navigation
2. Correct reading order (top-to-bottom, left-to-right)
3. Interactive elements announce role ("button", "search field")
4. State changes announced ("selected", "expanded", "disabled")
5. Error messages announced immediately (assertive live region)
6. No focus traps — user can always navigate away

---

### Phase 4: Color Contrast & Visual Audit

**Tools:**
- **Stark** — Figma/Sketch plugin for contrast checking
- **Colour Contrast Analyser (CCA)** — Standalone tool for measuring ratios
- Manual device testing with display settings adjusted

**Minimum Contrast Ratios (WCAG 2.1 AA):**

| Element Type | Required Ratio | Our Target |
|-------------|---------------|------------|
| Normal text (< 18px) | 4.5:1 | 5.0:1+ |
| Large text (≥ 18px or 14px bold) | 3:1 | 4.0:1+ |
| UI components & graphics | 3:1 | 3.5:1+ |
| Focus indicators | 3:1 | 4.5:1+ |

**Verified Color Pairs:**

| Foreground | Background | Ratio | Status |
|-----------|-----------|-------|--------|
| #FFFFFF | #1A73E8 | 4.56:1 | ✅ Pass |
| #202124 | #FFFFFF | 16.75:1 | ✅ Pass |
| #5F6368 | #FFFFFF | 5.92:1 | ✅ Pass |
| #137333 | #E6F4EA | 5.19:1 | ✅ Pass |
| #D93025 | #FFFFFF | 5.73:1 | ✅ Pass |
| #1A73E8 | #E8F0FE | 4.56:1 | ✅ Pass |

---

### Phase 5: Design Review

**Tools:**
- **Stark** — Design accessibility review
- **Color Oracle** — Color blindness simulation

**Checks:**
1. Test with Protanopia (red-blind) simulation
2. Test with Deuteranopia (green-blind) simulation
3. Test with Tritanopia (blue-blind) simulation
4. Verify information is not conveyed by color alone
5. Check that status badges have text labels (not just color)
6. Verify focus states are visible

---

## 3. Remediation Process

```
Discovery → Log Issue → Prioritize → Fix → Re-test → Close
```

**Priority Matrix:**

| Severity | WCAG Level | Impact | Fix Deadline |
|----------|-----------|--------|-------------|
| Critical (P0) | A | Blocks access for any user | Same sprint |
| High (P1) | AA | Significant barrier | Next sprint |
| Medium (P2) | AA | Usable but difficult | Within 2 sprints |
| Low (P3) | AAA (nice-to-have) | Enhancement | Backlog |

---

## 4. Compliance Sign-off

Before each release, the following sign-off checklist must pass:

- [ ] All automated ESLint a11y rules pass (0 errors)
- [ ] Accessibility Scanner reports: 0 critical issues
- [ ] TalkBack full-flow test: Pass
- [ ] VoiceOver full-flow test: Pass
- [ ] Color contrast audit: All ratios meet AA
- [ ] Error handling is accessible (assertive announcements)
- [ ] Touch targets meet 48x48dp minimum
- [ ] No focus traps detected
- [ ] Screen reader reading order is logical
- [ ] Form labels are programmatically associated

---

## 5. Ongoing Monitoring

- **Sprint Reviews:** Accessibility demo in every sprint review
- **CI/CD Gate:** ESLint a11y rules block merge on failure
- **Quarterly:** Full manual audit with TalkBack + VoiceOver
- **User Feedback:** Accessibility feedback channel for parents
