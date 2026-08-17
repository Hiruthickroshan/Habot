# Performance Profiling Methodology — HabotConnect Parent-LSA App

## 1. Overview

This document outlines our methodology for identifying and resolving performance bottlenecks in the HabotConnect mobile app. We measure five key performance indicators (KPIs) and enforce automated regression gates in CI/CD.

---

## 2. Key Performance Indicators (KPIs)

| Metric | Target | Critical Threshold | Tool |
|--------|--------|-------------------|------|
| **Cold Start Time** | < 2s | 3s (CI gate) | Custom timer + Flipper |
| **Time-to-Interactive (TTI)** | < 3s | 5s (CI gate) | React Native Performance API |
| **Frame Rate (FPS)** | 60 FPS | < 55 FPS (CI gate) | Flipper + Systrace |
| **Memory Usage** | < 150 MB | 250 MB (warning) | Flipper + Instruments |
| **Bundle Size** | < 5 MB | 8 MB (CI gate) | `react-native-bundle-analyzer` |

---

## 3. Profiling Toolchain

### 3.1 Flipper (Primary Profiler)

**Purpose:** Real-time performance monitoring for React Native apps.

**Plugins Used:**
- **React DevTools** — Component re-render tracking
- **Network Inspector** — API call latency monitoring
- **Databases** — AsyncStorage/SQLite query performance
- **Hermes Profiler** — JavaScript thread CPU profiling
- **Layout Inspector** — Unnecessary re-layouts detection

**Setup:**
```bash
# Install Flipper SDK (already in devDependencies)
npm install react-native-flipper

# Launch Flipper
npx react-native-flipper
```

### 3.2 Android Systrace

**Purpose:** System-level trace of CPU, GPU, and I/O activity.

```bash
# Capture 5-second trace
python $ANDROID_HOME/platform-tools/systrace/systrace.py \
  --time=5 \
  -o trace.html \
  sched gfx view wm am app
```

**What We Look For:**
- Long frames (> 16.67ms = below 60 FPS)
- Excessive garbage collection pauses
- Main thread JavaScript execution blocking UI thread
- Slow layout passes

### 3.3 iOS Instruments

**Purpose:** Xcode Instruments for iOS-specific profiling.

**Templates Used:**
- **Time Profiler** — CPU usage by function
- **Allocations** — Memory allocation tracking
- **Core Animation** — Frame rate monitoring
- **Energy Log** — Battery impact

### 3.4 React Native Performance API

```typescript
// Custom performance marks
import { PerformanceObserver, performance } from 'perf_hooks';

// Mark screen load start
performance.mark('screen-load-start');

// ... screen renders ...

// Mark screen load end
performance.mark('screen-load-end');

// Measure
performance.measure('screen-load', 'screen-load-start', 'screen-load-end');
```

---

## 4. Profiling Methodology

### 4.1 Baseline Measurement

Before any optimization, establish baseline metrics:

1. Run app on reference devices (iPhone 12 / Pixel 6)
2. Execute standard user flow 3 times
3. Record metrics for each run
4. Average the results

### 4.2 Bottleneck Identification

**Step 1: Frame Rate Analysis**
- Run Flipper's React DevTools with "Highlight Updates" enabled
- Identify components that re-render unnecessarily
- Use `React.memo()` and `useMemo()` for expensive computations

**Step 2: JavaScript Thread Profiling**
- Use Hermes CPU profiler to capture a trace during user flow
- Identify functions taking > 16ms on the JS thread
- Optimize or move to native modules

**Step 3: Network Waterfall**
- Use Flipper Network Inspector to view API call sequence
- Identify serial API calls that could be parallelized
- Measure response times per endpoint

**Step 4: Memory Profiling**
- Monitor memory in Flipper during repeated navigation
- Look for steadily increasing memory (leak indicator)
- Use Instruments Allocations to find retained objects

### 4.3 Optimization Techniques

| Problem | Solution | Impact |
|---------|----------|--------|
| Unnecessary re-renders | `React.memo`, `useMemo`, `useCallback` | 20-40% FPS improvement |
| Large list scrolling jank | `FlatList` with `getItemLayout`, `windowSize` | 30-50% FPS improvement |
| Slow screen transitions | `react-native-screens` native stack | 50% faster transitions |
| Large bundle size | Code splitting, lazy imports, tree shaking | 20-30% size reduction |
| Image loading jank | `react-native-fast-image`, caching | Eliminates image jank |
| Memory leaks | Cleanup in `useEffect` return | Prevents OOM crashes |

### 4.4 Regression Testing

After each optimization:
1. Re-run baseline measurements
2. Compare before/after metrics
3. Verify no regressions in other areas
4. Update baseline if improvements confirmed

---

## 5. CI/CD Performance Gates

Performance is enforced automatically in the CI pipeline:

```yaml
# From .github/workflows/performance-check.yml
- name: Check Bundle Size
  run: |
    BUNDLE_SIZE=$(stat -f%z android/app/build/outputs/bundle/release/app.aab)
    MAX_SIZE=8388608  # 8 MB in bytes
    if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
      echo "❌ Bundle size ($BUNDLE_SIZE bytes) exceeds limit ($MAX_SIZE bytes)"
      exit 1
    fi
```

### Gates:
- ❌ **Block release** if cold start > 3s
- ❌ **Block release** if FPS < 55 during scroll
- ❌ **Block release** if bundle > 8 MB
- ⚠️ **Warning** if memory > 200 MB
- ⚠️ **Warning** if any API call > 2s

---

## 6. Performance Monitoring Schedule

| Activity | Frequency | Owner |
|----------|----------|-------|
| Automated CI performance check | Every pull request | CI Pipeline |
| Flipper profiling session | Weekly | Dev Team |
| Full Instruments/Systrace audit | Pre-release | QA Team |
| Baseline update | Monthly | Tech Lead |
| Performance review meeting | Bi-weekly | Full Team |

---

## 7. Reference Devices

Performance must be validated on these reference devices (representing our user base):

| Device | Operating System | Category |
|--------|-----------------|----------|
| iPhone 12 | iOS 16+ | Mid-range iOS |
| iPhone 15 Pro | iOS 17+ | High-end iOS |
| Pixel 6 | Android 13+ | Mid-range Android |
| Samsung Galaxy S23 | Android 14+ | High-end Android |
| Samsung Galaxy A54 | Android 13+ | Budget Android |
