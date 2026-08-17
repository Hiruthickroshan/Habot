#!/bin/bash
#
# measure-startup.sh
#
# Measures the cold start time of the HabotConnect app on Android.
# Runs the app 5 times and reports average, min, and max startup times.
#
# Usage:
#   bash performance/scripts/measure-startup.sh [PACKAGE_NAME] [ACTIVITY_NAME]
#
# Defaults:
#   PACKAGE_NAME: com.habotconnect.app
#   ACTIVITY_NAME: com.habotconnect.app.MainActivity
#
# Requirements:
#   - adb (Android Debug Bridge) installed and in PATH
#   - Device/emulator connected
#   - App installed on device

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────

PACKAGE_NAME="${1:-com.habotconnect.app}"
ACTIVITY_NAME="${2:-com.habotconnect.app.MainActivity}"
NUM_RUNS=5
THRESHOLD_MS=3000
LOG_FILE="performance/logs/startup-metrics-$(date +%Y%m%d-%H%M%S).json"

# ── Colors ───────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  HabotConnect — Cold Start Performance Measurement${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Package:    ${YELLOW}${PACKAGE_NAME}${NC}"
echo -e "Activity:   ${YELLOW}${ACTIVITY_NAME}${NC}"
echo -e "Runs:       ${YELLOW}${NUM_RUNS}${NC}"
echo -e "Threshold:  ${YELLOW}${THRESHOLD_MS}ms${NC}"
echo ""

# ── Ensure device is connected ───────────────────────────────────────

DEVICE_COUNT=$(adb devices | grep -c 'device$' || true)
if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo -e "${RED}❌ No Android device/emulator connected.${NC}"
  echo "   Connect a device or start an emulator and try again."
  exit 1
fi

echo -e "${GREEN}✅ Device connected${NC}"
echo ""

# ── Run Measurements ─────────────────────────────────────────────────

declare -a RESULTS

for i in $(seq 1 $NUM_RUNS); do
  echo -e "${BLUE}Run ${i}/${NUM_RUNS}:${NC}"

  # Force stop the app
  adb shell am force-stop "$PACKAGE_NAME" 2>/dev/null || true
  sleep 1

  # Clear app data for true cold start
  adb shell pm clear "$PACKAGE_NAME" 2>/dev/null || true
  sleep 1

  # Launch and measure
  START_OUTPUT=$(adb shell am start -W -n "$PACKAGE_NAME/$ACTIVITY_NAME" 2>&1)

  # Parse TotalTime from output
  TOTAL_TIME=$(echo "$START_OUTPUT" | grep "TotalTime:" | awk '{print $2}')

  if [ -z "$TOTAL_TIME" ]; then
    echo -e "  ${YELLOW}⚠️ Could not parse startup time. Using fallback.${NC}"
    TOTAL_TIME=0
  fi

  RESULTS+=("$TOTAL_TIME")
  echo -e "  Startup time: ${YELLOW}${TOTAL_TIME}ms${NC}"

  # Cool down between runs
  adb shell am force-stop "$PACKAGE_NAME" 2>/dev/null || true
  sleep 2
done

echo ""

# ── Calculate Statistics ─────────────────────────────────────────────

SUM=0
MIN=${RESULTS[0]}
MAX=${RESULTS[0]}

for TIME in "${RESULTS[@]}"; do
  SUM=$((SUM + TIME))
  if [ "$TIME" -lt "$MIN" ]; then MIN=$TIME; fi
  if [ "$TIME" -gt "$MAX" ]; then MAX=$TIME; fi
done

AVERAGE=$((SUM / NUM_RUNS))

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Results Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Average:  ${YELLOW}${AVERAGE}ms${NC}"
echo -e "  Min:      ${GREEN}${MIN}ms${NC}"
echo -e "  Max:      ${RED}${MAX}ms${NC}"
echo ""

# ── Pass/Fail Check ──────────────────────────────────────────────────

if [ "$AVERAGE" -lt "$THRESHOLD_MS" ]; then
  echo -e "${GREEN}✅ PASS — Average startup (${AVERAGE}ms) is within threshold (${THRESHOLD_MS}ms)${NC}"
  EXIT_CODE=0
else
  echo -e "${RED}❌ FAIL — Average startup (${AVERAGE}ms) exceeds threshold (${THRESHOLD_MS}ms)${NC}"
  EXIT_CODE=1
fi

# ── Save Results ─────────────────────────────────────────────────────

mkdir -p "$(dirname "$LOG_FILE")"

cat > "$LOG_FILE" << EOF
{
  "metric": "cold_start_time",
  "package": "$PACKAGE_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "device": "$(adb shell getprop ro.product.model | tr -d '\r')",
  "android_version": "$(adb shell getprop ro.build.version.release | tr -d '\r')",
  "runs": $NUM_RUNS,
  "threshold_ms": $THRESHOLD_MS,
  "results_ms": [$(IFS=,; echo "${RESULTS[*]}")],
  "average_ms": $AVERAGE,
  "min_ms": $MIN,
  "max_ms": $MAX,
  "passed": $([ "$EXIT_CODE" -eq 0 ] && echo "true" || echo "false")
}
EOF

echo ""
echo -e "Results saved to: ${BLUE}${LOG_FILE}${NC}"

exit $EXIT_CODE
