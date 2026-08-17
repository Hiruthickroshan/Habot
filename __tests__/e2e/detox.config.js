/**
 * Detox Configuration
 *
 * Configures Detox for E2E testing on both iOS and Android.
 * Includes configurations for debug and release builds.
 */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: '__tests__/e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },

  apps: {
    // ── iOS Configurations ─────────────────────────────────────
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/HabotConnect.app',
      build:
        'xcodebuild -workspace ios/HabotConnect.xcworkspace -scheme HabotConnect -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/HabotConnect.app',
      build:
        'xcodebuild -workspace ios/HabotConnect.xcworkspace -scheme HabotConnect -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },

    // ── Android Configurations ─────────────────────────────────
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },

  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_34',
      },
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
  },

  configurations: {
    // ── iOS ─────────────────────────────────────────────────────
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },

    // ── Android ─────────────────────────────────────────────────
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
    },
  },

  // ── Behavior ────────────────────────────────────────────────────
  behavior: {
    init: {
      exposeGlobals: true,
    },
    launchApp: 'auto',
    cleanup: {
      shutdownDevice: false,
    },
  },

  // ── Artifacts ───────────────────────────────────────────────────
  artifacts: {
    rootDir: '.artifacts',
    plugins: {
      instruments: { enabled: false },
      log: { enabled: true },
      uiHierarchy: 'enabled',
      screenshot: {
        shouldTakeAutomaticSnapshots: true,
        keepOnlyFailedTestsArtifacts: true,
        takeWhen: {
          testStart: false,
          testDone: true,
        },
      },
      video: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: true,
      },
    },
  },
};
