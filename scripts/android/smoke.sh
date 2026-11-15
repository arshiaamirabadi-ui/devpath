#!/usr/bin/env bash
set -euo pipefail
mkdir -p android-smoke
adb wait-for-device
adb shell svc wifi disable
adb shell svc data disable
adb install -r "${APK_UNDER_TEST:-android/app/build/outputs/apk/debug/app-debug.apk}"
adb logcat -c
adb shell am start -W -n io.github.arshiaamirabadi.devpath/.MainActivity
for attempt in $(seq 1 18); do
  sleep 3
  adb shell uiautomator dump /sdcard/devpath-ui.xml >/dev/null 2>&1 || true
  adb pull /sdcard/devpath-ui.xml android-smoke/ui.xml >/dev/null 2>&1 || true
  if grep -q 'DevPath' android-smoke/ui.xml 2>/dev/null; then break; fi
done
adb exec-out screencap -p > android-smoke/launch.png
adb logcat -d > android-smoke/logcat.txt
grep -q 'DevPath' android-smoke/ui.xml
if grep -E 'FATAL EXCEPTION|Unable to start activity|net::ERR_FILE_NOT_FOUND' android-smoke/logcat.txt; then exit 1; fi
if grep -E 'Webpage not available|ERR_INTERNET_DISCONNECTED' android-smoke/ui.xml; then exit 1; fi
printf 'Offline Android launch verified.\n'
