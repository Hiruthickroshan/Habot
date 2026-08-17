# Presentation Notes — HabotConnect QA Architecture (15 Slides)

Use these notes to build your Google Slides or PDF presentation.

---

## Slide 1: Title Slide

**Title:** HabotConnect Parent-LSA App — Mobile-First QA Architecture

**Subtitle:** Automated Testing · Accessibility Compliance · CI/CD Pipeline · Performance Profiling

**Contact Info:**
- **Full Legal Name:** Hiruthickroshan E
- **Email Address:** hiruthick1947@gmail.com
- **Phone Number:** +91 9159257419

---

## Slide 2: Video Demo

**Title:** Project Walkthrough Demo

**Content:**
- Embed a 2-3 minute Loom or Google Drive video link here
- The video should demonstrate:
  1. Repository structure walkthrough
  2. ESLint a11y rules running
  3. Test suite execution (unit + integration)
  4. CI/CD pipeline YAML walkthrough
  5. Performance metrics and baseline data

---

## Slide 3: Project Context

**Title:** The Challenge

**Content:**
- HabotConnect connects parents with Learning Support Assistants (LSAs) for children with special educational needs
- Current state: Fragmented UI, manual testing only
- Preparing for a major platform update
- **Goal:** Transition to scalable automated QA with WCAG 2.1 AA compliance

**Key Stat:** "Testing has historically been manual — we need to automate E2E and integration testing for the core user journey: Parent booking an LSA."

---

## Slide 4: Solution Overview (Architecture Diagram)

**Title:** Four-Pillar QA Architecture

**Content (visual diagram):**

```
┌─────────────────────────────────────────────────────────┐
│                   QA Architecture                        │
├──────────┬──────────┬──────────────┬───────────────────┤
│ Automated│ WCAG 2.1 │   CI/CD      │  Performance      │
│ Test     │ AA       │   Pipeline   │  Profiling         │
│ Suite    │ Audit    │              │                    │
├──────────┼──────────┼──────────────┼───────────────────┤
│ Detox    │ axe-core │ GitHub       │ Flipper            │
│ Jest     │ Stark    │ Actions      │ Systrace           │
│ RNTL     │ Scanner  │ Fastlane     │ Instruments        │
│          │ TalkBack │ Husky        │ Custom scripts     │
└──────────┴──────────┴──────────────┴───────────────────┘
```

---

## Slide 5: Test Automation Strategy — Testing Pyramid

**Title:** Automated Test Suite Design

**Content:**
- **Static Analysis (ESLint + TypeScript):** Catches bugs before runtime
- **Unit Tests (Jest):** 80%+ coverage, validation logic, component rendering
- **Integration Tests (Jest + RNTL):** Booking flow, search interactions
- **E2E Tests (Detox):** Parent-books-LSA critical path on real devices

**Key Decision:** Detox over Appium — grey-box testing eliminates flaky tests

---

## Slide 6: Why Detox Over Appium

**Title:** Tool Selection Rationale — E2E Framework

**Table:**
| Factor | Detox ✅ | Appium ❌ |
|--------|---------|----------|
| React Native support | First-class (grey-box) | Generic (black-box) |
| Synchronization | Automatic | Manual sleeps |
| Speed | Fast | Slow |
| CI/CD integration | Native | Heavy setup |
| Flaky tests | Eliminated | Common |

**Bottom Line:** Detox provides architectural reliability that Appium cannot match for React Native apps.

---

## Slide 7: Core User Journey Test (E2E)

**Title:** E2E Test — Parent Booking an LSA

**Flow:**
1. **Home Screen** → Displays featured LSAs ✅
2. **Search** → Parent searches by specialty ✅
3. **Profile** → View LSA qualifications, rating ✅
4. **Booking** → Fill form, select time/date ✅
5. **Confirmation** → Booking confirmed ✅

**Code Snippet:** Show key Detox test from `parent-booking-lsa.e2e.ts`

---

## Slide 8: Accessibility Audit Plan

**Title:** WCAG 2.1 AA Compliance Strategy

**Five-Phase Approach:**
1. **Automated static analysis** — ESLint a11y rules (every commit)
2. **Runtime scanning** — Google Accessibility Scanner, Xcode Inspector
3. **Assistive tech testing** — TalkBack + VoiceOver manual verification
4. **Color contrast audit** — All pairs verified ≥ 4.5:1
5. **Design review** — Color blindness simulation with Stark

**Result:** 97.5% compliance (39/40 applicable criteria)

---

## Slide 9: Accessibility Implementation Details

**Title:** How Accessibility Is Built Into Code

**Examples:**
- Every button has `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
- Form errors use `accessibilityLiveRegion="assertive"` for instant screen reader notification
- Touch targets enforce 48x48dp minimum (WCAG 2.5.5)
- Search results announce count: "Found 3 Learning Support Assistants"
- Color is never the sole indicator — badges have text + color

---

## Slide 10: CI/CD Pipeline Architecture

**Title:** CI/CD Pipeline — GitHub Actions + Fastlane + Husky

**Pipeline Diagram:**
```
Push/PR → Lint → Unit Tests → Integration Tests → E2E (iOS + Android) → Build Verify → ✅ Merge
```

**Components:**
- **Husky:** Pre-commit (ESLint + Prettier), Pre-push (unit tests), Commitlint
- **GitHub Actions:** 4 workflow files (CI, A11y Audit, Performance, Release)
- **Fastlane:** Automated TestFlight + Play Store deployment

---

## Slide 11: Git Governance & Code Quality

**Title:** Git Governance Strategy

**Enforcement Layers:**
1. **Husky pre-commit:** ESLint + Prettier + TypeScript check
2. **Husky pre-push:** Unit tests with 80% coverage threshold
3. **Commitlint:** Conventional commits enforced (feat, fix, test, a11y, ...)
4. **Branch protection:** Require passing CI + 1 reviewer before merge
5. **CODEOWNERS:** Automatic review assignment for critical paths

**Custom commit type:** `a11y:` for accessibility-specific changes

---

## Slide 12: Performance Profiling Methodology

**Title:** Performance Profiling & Optimization

**Five KPIs:**
| Metric | Target | CI Gate |
|--------|--------|---------|
| Cold start | < 2s | 3s |
| Time-to-Interactive | < 3s | 5s |
| Frame rate | 60 FPS | 55 FPS |
| Memory usage | < 150 MB | 250 MB |
| Bundle size | < 5 MB | 8 MB |

**Tools:** Flipper, Android Systrace, iOS Instruments, custom measurement scripts

---

## Slide 13: Performance Baseline Results

**Title:** Baseline Performance Metrics

**Results (from baseline-metrics.json):**
- Cold start: iOS 1.45s ✅, Android 1.82s ✅
- FPS: iOS 59.8 ✅, Android 58.5 ✅
- Memory: iOS 128 MB peak ✅, Android 155 MB peak ✅
- Bundle: 3.8 MB (APK) ✅

**All metrics pass CI gates.**

---

## Slide 14: Repository Structure

**Title:** Project Repository Overview

**Show tree structure:**
- `/src/` — Mock app (5 screens, 4 components) with full a11y annotations
- `/__tests__/` — Unit (3), Integration (2), E2E (3 + Detox config)
- `/accessibility/` — Audit plan, WCAG checklist, axe config, sample report
- `/performance/` — Methodology, scripts (3), baseline metrics
- `/.github/workflows/` — CI, Accessibility, Performance, Release
- `/fastlane/` — Fastfile, Appfile, Matchfile
- `/.husky/` — Pre-commit, pre-push hooks

---

## Slide 15: Values Reflection

**Title:** Alignment with HabotConnect's Core Values & Leadership Principles

**VAP (Vitality and Prosperity):**
- This architecture ensures the app is **vital** (high-quality, accessible, performant) and creates **prosperity** for all users — especially parents of children with special needs who rely on assistive technology.

**Unified Marketing Philosophy (Everything Matters):**
- By integrating accessibility, testing, performance, and CI/CD into a single architecture, we embody the belief that **every touchpoint matters** — from the code commit to the user's screen reader experience.

**Relationship-Focused Growth:**
- Automated testing and accessibility compliance build **trust** with parents. A reliable, inclusive app drives long-term Customer Lifetime Value through positive experiences and word-of-mouth.

**Ethical Standards & Transparency:**
- WCAG 2.1 AA compliance goes beyond legal requirements — it's an ethical commitment to ensuring no parent is excluded from accessing support for their child.

**Scalability:**
- The CI/CD pipeline and testing framework are designed to scale with the platform's growth — from the current LSA matching feature to future expansions.
