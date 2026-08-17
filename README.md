# HabotConnect Parent-LSA App — Mobile-First QA Architecture

> **Candidate:** Hiruthickroshan E
> **Email:** hiruthick1947@gmail.com
> **Phone:** +91 9159257419

---

## 📋 Project Overview

A comprehensive blueprint detailing a **mobile-first automated testing strategy**, an **accessibility compliance plan**, and a **CI/CD pipeline flow** tailored for the HabotConnect mobile app — a digital platform connecting parents with Learning Support Assistants (LSAs) for children with special educational needs.

### Deliverables

| # | Deliverable | Documentation |
|---|-------------|--------------|
| 1 | **Automated Test Suite** | [Test Strategy](docs/test-strategy.md) • [Unit Tests](__tests__/unit/) • [Integration Tests](__tests__/integration/) • [E2E Tests](__tests__/e2e/) |
| 2 | **Accessibility Audit Plan** | [Audit Plan](accessibility/audit-plan.md) • [WCAG Checklist](accessibility/wcag-checklist.md) • [Sample Report](accessibility/reports/sample-audit-report.md) |
| 3 | **CI/CD Pipeline** | [CI Workflow](.github/workflows/ci.yml) • [Release Workflow](.github/workflows/release.yml) • [Fastlane Config](fastlane/) |
| 4 | **Performance Profiling** | [Methodology](performance/profiling-methodology.md) • [Scripts](performance/scripts/) • [Baseline Metrics](performance/logs/baseline-metrics.json) |

---

## 🏗️ Repository Structure

```
habotconnect-qa-architecture/
├── README.md                              # This file
├── package.json                           # Dependencies and scripts
├── tsconfig.json                          # TypeScript configuration
├── .eslintrc.js                           # ESLint with a11y rules
├── .prettierrc                            # Code formatting
├── commitlint.config.js                   # Conventional commit enforcement
│
├── .husky/                                # Git hooks (pre-commit, pre-push)
│   ├── pre-commit                         # Lint + type-check
│   └── pre-push                           # Unit + integration tests
│
├── src/                                   # Mock app source
│   ├── screens/                           # 5 screens with full a11y
│   │   ├── HomeScreen.tsx
│   │   ├── LSASearchScreen.tsx
│   │   ├── LSAProfileScreen.tsx
│   │   ├── BookingScreen.tsx
│   │   └── ConfirmationScreen.tsx
│   ├── components/                        # 4 reusable components
│   │   ├── LSACard.tsx
│   │   ├── BookingForm.tsx
│   │   ├── AccessibleButton.tsx
│   │   └── SearchFilter.tsx
│   └── utils/
│       ├── api.ts                         # Mock API with typed interfaces
│       └── validation.ts                  # Form validation with error messages
│
├── __tests__/
│   ├── unit/                              # Unit tests (Jest)
│   │   ├── validation.test.ts             # 30+ test cases
│   │   ├── LSACard.test.tsx               # Rendering + a11y + snapshots
│   │   └── BookingForm.test.tsx           # Form fields + errors + input
│   ├── integration/                       # Integration tests
│   │   ├── booking-flow.test.tsx          # Full booking journey
│   │   └── search-filter.test.tsx         # Search + filter interaction
│   └── e2e/                               # E2E tests (Detox)
│       ├── detox.config.js                # iOS + Android configurations
│       ├── parent-booking-lsa.e2e.ts      # Critical path E2E
│       ├── accessibility-check.e2e.ts     # WCAG verification on device
│       └── performance-metrics.e2e.ts     # Performance regression gates
│
├── accessibility/
│   ├── audit-plan.md                      # 5-phase audit methodology
│   ├── wcag-checklist.md                  # All 45 WCAG 2.1 AA criteria
│   ├── axe-config.js                      # axe-core configuration
│   └── reports/
│       └── sample-audit-report.md         # Screen-by-screen audit results
│
├── performance/
│   ├── profiling-methodology.md           # KPIs, tools, optimization guide
│   ├── scripts/
│   │   ├── measure-startup.sh             # Cold start measurement
│   │   ├── measure-ttl.sh                 # Time-to-Load per screen
│   │   └── memory-leak-detector.js        # Memory trend analysis
│   └── logs/
│       └── baseline-metrics.json          # Reference performance data
│
├── .github/workflows/
│   ├── ci.yml                             # Main CI (lint → test → E2E → build)
│   ├── accessibility-audit.yml            # Scheduled + PR-triggered a11y
│   ├── performance-check.yml              # Bundle size + startup + memory
│   └── release.yml                        # Fastlane → TestFlight/Play Store
│
├── fastlane/
│   ├── Fastfile                           # iOS + Android build/deploy lanes
│   ├── Appfile                            # App identifiers
│   └── Matchfile                          # Code signing management
│
└── docs/
    ├── test-strategy.md                   # Testing pyramid and philosophy
    ├── presentation-notes.md              # Content for 15-slide presentation
    └── architecture-decision-records/
        ├── 001-detox-over-appium.md       # Why Detox
        ├── 002-github-actions-over-bitrise.md  # Why GitHub Actions
        └── 003-accessibility-first-approach.md # Why a11y-first
```

---

## 🧪 Test Automation Strategy

### Testing Pyramid

| Level | Tool | Coverage | Files |
|-------|------|----------|-------|
| **Static Analysis** | ESLint + TypeScript + jsx-a11y | 100% | `.eslintrc.js`, `tsconfig.json` |
| **Unit Tests** | Jest + React Native Testing Library | 80%+ | `__tests__/unit/` |
| **Integration Tests** | Jest + RNTL + Navigation | Core flows | `__tests__/integration/` |
| **E2E Tests** | Detox (grey-box) | Critical path | `__tests__/e2e/` |

### Why Detox Over Appium?

- **Grey-box testing:** Automatic synchronization with React Native bridge — no flaky `sleep()` calls
- **Speed:** 2-5 min vs 10-20 min for Appium
- **React Native native:** Built by Wix specifically for RN
- **CI reliability:** No Appium server required

See [ADR-001](docs/architecture-decision-records/001-detox-over-appium.md) for full rationale.

---

## ♿ Accessibility Compliance (WCAG 2.1 AA)

### Five-Phase Audit Approach

1. **Static analysis** — ESLint `jsx-a11y` + `react-native-a11y` rules on every commit
2. **Runtime scanning** — Google Accessibility Scanner + Xcode Inspector
3. **Assistive tech** — TalkBack (Android) + VoiceOver (iOS) manual testing
4. **Color contrast** — All text meets 4.5:1 minimum ratio
5. **Design review** — Color blindness simulation with Stark

### Compliance Result: **97.5%** (39/40 applicable WCAG 2.1 AA criteria)

See [WCAG Checklist](accessibility/wcag-checklist.md) and [Audit Report](accessibility/reports/sample-audit-report.md).

---

## 🔄 CI/CD Pipeline

### Pipeline Flow

```
Push/PR → Lint + Type Check → Unit Tests → Integration Tests → E2E (iOS + Android) → Build Verify → ✅ Ready
```

### Quality Gates

| Gate | Tool | Threshold |
|------|------|-----------|
| Lint (a11y included) | ESLint | 0 errors |
| Unit test coverage | Jest | 80% min |
| Bundle size | Custom | < 8 MB |
| Cold start | Detox | < 3s |
| Frame rate | Detox | > 55 FPS |

### Git Governance

- **Husky pre-commit:** ESLint + Prettier + TypeScript
- **Husky pre-push:** Unit tests with coverage
- **Commitlint:** Conventional commits enforced
- **Branch protection:** CI pass + reviewer required

See [ADR-002](docs/architecture-decision-records/002-github-actions-over-bitrise.md).

---

## 📊 Performance Profiling

### Key Metrics

| Metric | iOS Baseline | Android Baseline | Target |
|--------|-------------|-----------------|--------|
| Cold start | 1.45s | 1.82s | < 2s |
| FPS (scroll) | 59.8 | 58.5 | 60 |
| Memory (peak) | 128 MB | 155 MB | < 150 MB |
| Bundle size | 4.2 MB | 3.8 MB | < 5 MB |

### Tools

- **Flipper** — React Native profiler (re-renders, network, Hermes CPU)
- **Android Systrace** — System-level frame analysis
- **iOS Instruments** — Time Profiler, Allocations, Core Animation
- **Custom scripts** — `measure-startup.sh`, `measure-ttl.sh`, `memory-leak-detector.js`

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run linting (includes accessibility rules)
npm run lint

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm test

# Build and run E2E tests (iOS)
npm run test:e2e:build
npm run test:e2e

# Check accessibility rules
npm run a11y:lint

# Format code
npm run format
```

---

## 📎 Submission Links

1. **Presentation:** [Google Slides / PDF Link — Add Here]
2. **Repository:** [https://github.com/Hiruthickroshan/Habot](https://github.com/Hiruthickroshan/Habot)

---

## 📝 License

This project is submitted as part of the HabotConnect hiring process.
