/**
 * memory-leak-detector.js
 *
 * Node.js script that monitors the HabotConnect app for memory leaks.
 * Connects to the app via adb and samples memory usage over time,
 * then analyzes the trend to detect potential leaks.
 *
 * Usage:
 *   node performance/scripts/memory-leak-detector.js
 *
 * What it does:
 *   1. Samples memory usage every 5 seconds for 2 minutes
 *   2. Calculates the memory growth trend
 *   3. Flags if memory grows steadily (potential leak)
 *   4. Saves results to performance/logs/
 *
 * Requirements:
 *   - adb installed and in PATH
 *   - Device/emulator connected
 *   - App running on device
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Configuration ───────────────────────────────────────────────────

const CONFIG = {
  packageName: 'com.habotconnect.app',
  sampleIntervalMs: 5000,       // Sample every 5 seconds
  durationMs: 120000,           // Monitor for 2 minutes
  maxAcceptableGrowthMB: 20,    // Max acceptable memory growth
  warningGrowthMB: 10,         // Warning threshold
  logDir: path.join(__dirname, '..', 'logs'),
};

// ── Helpers ─────────────────────────────────────────────────────────

function getMemoryUsage(packageName) {
  try {
    const output = execSync(
      `adb shell dumpsys meminfo ${packageName} | grep "TOTAL PSS"`,
      { encoding: 'utf-8', timeout: 10000 },
    );

    // Parse "TOTAL PSS:    123456"
    const match = output.match(/TOTAL PSS:\s+(\d+)/);
    if (match) {
      return parseInt(match[1], 10); // Returns KB
    }

    // Fallback: try "TOTAL:" line
    const fallbackOutput = execSync(
      `adb shell dumpsys meminfo ${packageName} | grep "TOTAL:"`,
      { encoding: 'utf-8', timeout: 10000 },
    );
    const fallbackMatch = fallbackOutput.match(/TOTAL:\s+(\d+)/);
    if (fallbackMatch) {
      return parseInt(fallbackMatch[1], 10);
    }

    return null;
  } catch (error) {
    console.error(`Failed to get memory info: ${error.message}`);
    return null;
  }
}

function checkDeviceConnected() {
  try {
    const output = execSync('adb devices', { encoding: 'utf-8', timeout: 5000 });
    const devices = output.split('\n').filter((line) => line.includes('device') && !line.includes('List'));
    return devices.length > 0;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateLinearRegression(samples) {
  const n = samples.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = samples[i].elapsedSec;
    const y = samples[i].memoryMB;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² (coefficient of determination)
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * samples[i].elapsedSec + intercept;
    ssRes += Math.pow(samples[i].memoryMB - predicted, 2);
    ssTot += Math.pow(samples[i].memoryMB - yMean, 2);
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  HabotConnect — Memory Leak Detector');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Check device connection
  if (!checkDeviceConnected()) {
    console.error('❌ No Android device/emulator connected.');
    process.exit(1);
  }
  console.log('✅ Device connected');

  // Check app is running
  const initialMemory = getMemoryUsage(CONFIG.packageName);
  if (!initialMemory) {
    console.error(`❌ Could not read memory for ${CONFIG.packageName}.`);
    console.error('   Make sure the app is running on the device.');
    process.exit(1);
  }

  console.log(`📱 Package: ${CONFIG.packageName}`);
  console.log(`⏱️  Duration: ${CONFIG.durationMs / 1000}s`);
  console.log(`📊 Sample interval: ${CONFIG.sampleIntervalMs / 1000}s`);
  console.log(`📏 Max acceptable growth: ${CONFIG.maxAcceptableGrowthMB} MB`);
  console.log('');
  console.log('Sampling memory usage...');
  console.log('');

  // ── Collect Samples ─────────────────────────────────────────────

  const samples = [];
  const startTime = Date.now();
  const totalSamples = Math.floor(CONFIG.durationMs / CONFIG.sampleIntervalMs);

  for (let i = 0; i < totalSamples; i++) {
    const elapsed = Date.now() - startTime;
    const memory = getMemoryUsage(CONFIG.packageName);

    if (memory !== null) {
      const sample = {
        sampleIndex: i + 1,
        elapsedSec: Math.round(elapsed / 1000),
        memoryKB: memory,
        memoryMB: Math.round((memory / 1024) * 100) / 100,
        timestamp: new Date().toISOString(),
      };

      samples.push(sample);
      const bar = '█'.repeat(Math.min(Math.round(sample.memoryMB / 5), 40));
      console.log(
        `  [${String(i + 1).padStart(2)}/${totalSamples}] ` +
        `${sample.elapsedSec}s → ${sample.memoryMB} MB ${bar}`,
      );
    }

    if (i < totalSamples - 1) {
      await sleep(CONFIG.sampleIntervalMs);
    }
  }

  console.log('');

  // ── Analyze Results ─────────────────────────────────────────────

  if (samples.length < 2) {
    console.error('❌ Not enough samples collected for analysis.');
    process.exit(1);
  }

  const firstMemory = samples[0].memoryMB;
  const lastMemory = samples[samples.length - 1].memoryMB;
  const growth = lastMemory - firstMemory;
  const regression = calculateLinearRegression(samples);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Analysis Results');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Initial memory:    ${firstMemory} MB`);
  console.log(`  Final memory:      ${lastMemory} MB`);
  console.log(`  Growth:            ${growth.toFixed(2)} MB`);
  console.log(`  Growth rate:       ${(regression.slope * 60).toFixed(2)} MB/min`);
  console.log(`  Trend R²:         ${regression.r2.toFixed(4)}`);
  console.log(`  Samples:          ${samples.length}`);
  console.log('');

  // ── Verdict ─────────────────────────────────────────────────────

  let status;
  let exitCode;

  if (growth > CONFIG.maxAcceptableGrowthMB && regression.r2 > 0.7) {
    status = 'FAIL';
    exitCode = 1;
    console.log(`❌ POTENTIAL MEMORY LEAK DETECTED`);
    console.log(`   Memory grew by ${growth.toFixed(2)} MB with a strong upward trend (R²=${regression.r2.toFixed(2)}).`);
    console.log(`   Threshold: ${CONFIG.maxAcceptableGrowthMB} MB`);
  } else if (growth > CONFIG.warningGrowthMB) {
    status = 'WARNING';
    exitCode = 0;
    console.log(`⚠️  MEMORY GROWTH WARNING`);
    console.log(`   Memory grew by ${growth.toFixed(2)} MB. Monitor closely.`);
  } else {
    status = 'PASS';
    exitCode = 0;
    console.log(`✅ NO MEMORY LEAK DETECTED`);
    console.log(`   Memory growth (${growth.toFixed(2)} MB) is within acceptable range.`);
  }

  // ── Save Results ────────────────────────────────────────────────

  if (!fs.existsSync(CONFIG.logDir)) {
    fs.mkdirSync(CONFIG.logDir, { recursive: true });
  }

  const logFile = path.join(
    CONFIG.logDir,
    `memory-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );

  const report = {
    metric: 'memory_leak_detection',
    package: CONFIG.packageName,
    timestamp: new Date().toISOString(),
    duration_seconds: CONFIG.durationMs / 1000,
    sample_count: samples.length,
    initial_memory_mb: firstMemory,
    final_memory_mb: lastMemory,
    growth_mb: Math.round(growth * 100) / 100,
    growth_rate_mb_per_min: Math.round(regression.slope * 60 * 100) / 100,
    trend_r2: Math.round(regression.r2 * 10000) / 10000,
    threshold_mb: CONFIG.maxAcceptableGrowthMB,
    status,
    samples,
  };

  fs.writeFileSync(logFile, JSON.stringify(report, null, 2));
  console.log('');
  console.log(`📄 Report saved to: ${logFile}`);

  process.exit(exitCode);
}

main().catch((error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
