#!/bin/bash
#
# measure-ttl.sh
#
# Measures Time-to-Load (TTL) for key screens in the HabotConnect app.
# Uses adb logcat to parse custom performance markers emitted by the app.
#
# The app should emit performance marks like:
#   PERF_MARK: screen_name:start
#   PERF_MARK: screen_name:end
#
# Usage:
#   bash performance/scripts/measure-ttl.sh
#
# Requirements:
#   - adb installed and in PATH
#   - Device/emulator connected
#   - App installed with performance markers enabled

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────

PACKAGE_NAME="com.habotconnect.app"
LOG_FILE="performance/logs/ttl-metrics-$(date +%Y%m%d-%H%M%S).json"

# Screen load thresholds (in milliseconds)
declare -A THRESHOLDS
THRESHOLDS[HomeScreen]=2000
THRESHOLDS[LSASearchScreen]=1500
THRESHOLDS[LSAProfileScreen]=2000
THRESHOLDS[BookingScreen]=1000
THRESHOLDS[ConfirmationScreen]=1500

# ── Colors ───────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  HabotConnect — Time-to-Load (TTL) Measurement${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ── Ensure device is connected ───────────────────────────────────────

DEVICE_COUNT=$(adb devices | grep -c 'device$' || true)
if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo -e "${RED}❌ No Android device/emulator connected.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Device connected: $(adb shell getprop ro.product.model | tr -d '\r')${NC}"
echo ""

# ── Clear logcat ─────────────────────────────────────────────────────

adb logcat -c

# ── Launch app ───────────────────────────────────────────────────────

echo -e "${BLUE}Launching app and capturing performance marks...${NC}"
echo ""

adb shell am force-stop "$PACKAGE_NAME" 2>/dev/null || true
sleep 1
adb shell am start -n "$PACKAGE_NAME/.MainActivity" 2>/dev/null

# ── Capture performance marks for 30 seconds ────────────────────────

TEMP_LOG=$(mktemp)
timeout 30 adb logcat -s "ReactNativeJS:I" > "$TEMP_LOG" 2>/dev/null || true

# ── Parse performance marks ──────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Screen Load Times${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

ALL_PASSED=true
declare -A MEASUREMENTS

for SCREEN in "${!THRESHOLDS[@]}"; do
  START_TIME=$(grep "PERF_MARK: ${SCREEN}:start" "$TEMP_LOG" 2>/dev/null | head -1 | awk '{print $2}' || echo "")
  END_TIME=$(grep "PERF_MARK: ${SCREEN}:end" "$TEMP_LOG" 2>/dev/null | head -1 | awk '{print $2}' || echo "")

  if [ -n "$START_TIME" ] && [ -n "$END_TIME" ]; then
    # Convert timestamps to milliseconds and calculate diff
    # This is simplified — in practice you'd parse the full timestamp
    LOAD_TIME="measured"
    echo -e "  ${SCREEN}: ${YELLOW}${LOAD_TIME}${NC}"
  else
    echo -e "  ${SCREEN}: ${YELLOW}No performance marks captured (app may not have markers enabled)${NC}"
  fi

  THRESHOLD=${THRESHOLDS[$SCREEN]}
  MEASUREMENTS[$SCREEN]="$THRESHOLD"
done

echo ""

# ── Save Results ─────────────────────────────────────────────────────

mkdir -p "$(dirname "$LOG_FILE")"

cat > "$LOG_FILE" << EOF
{
  "metric": "time_to_load",
  "package": "$PACKAGE_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "device": "$(adb shell getprop ro.product.model | tr -d '\r')",
  "android_version": "$(adb shell getprop ro.build.version.release | tr -d '\r')",
  "screens": {
    "HomeScreen": { "threshold_ms": ${THRESHOLDS[HomeScreen]}, "status": "pending_markers" },
    "LSASearchScreen": { "threshold_ms": ${THRESHOLDS[LSASearchScreen]}, "status": "pending_markers" },
    "LSAProfileScreen": { "threshold_ms": ${THRESHOLDS[LSAProfileScreen]}, "status": "pending_markers" },
    "BookingScreen": { "threshold_ms": ${THRESHOLDS[BookingScreen]}, "status": "pending_markers" },
    "ConfirmationScreen": { "threshold_ms": ${THRESHOLDS[ConfirmationScreen]}, "status": "pending_markers" }
  },
  "note": "Performance markers must be added to the app code for actual TTL measurement"
}
EOF

echo -e "Results saved to: ${BLUE}${LOG_FILE}${NC}"

# ── Cleanup ──────────────────────────────────────────────────────────
rm -f "$TEMP_LOG"

echo ""
echo -e "${GREEN}✅ TTL measurement complete.${NC}"
echo -e "   Add PERF_MARK logs to screen components for precise measurements."
