# Android emulator workflow for local Codex sessions

Use this when a Codex worktree needs to inspect the Expo mobile app on the
local Android emulator.

## Required host terminal environment

Run Metro from the user's host terminal, not from the sandboxed Codex session.
The sandbox can prevent Metro, Gradle, or ADB from opening local network
listeners. When that happens, run the host-terminal commands manually and let
Codex continue with repository checks.

The project expects Node 20. From the Academy worktree:

```bash
cd /tmp/brasse-bouillon-academy-content
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20

export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Start Metro from that same host terminal:

```bash
npm -w packages/mobile-app start -- --android --localhost --clear
```

If Expo reports that port `8081` is already used by another Brasse Bouillon
worktree, accept the next port, usually `8082`.

## Emulator setup

List the available AVDs:

```bash
emulator -list-avds
```

Known local AVDs:

- `bb_pixel`
- `bb_pixel_academy`

Start the Academy AVD if needed:

```bash
emulator -avd bb_pixel_academy
```

For a full reset of the Academy AVD:

```bash
adb -H 127.0.0.1 -P 5037 emu kill
emulator -avd bb_pixel_academy -wipe-data -no-snapshot-load -no-snapshot-save
```

Wait until Android has booted:

```bash
adb -H 127.0.0.1 -P 5037 wait-for-device
adb -H 127.0.0.1 -P 5037 shell getprop sys.boot_completed
```

Expected boot value:

```text
1
```

If the emulator was wiped and Expo Go is missing, reinstall it from the local
Expo cache:

```bash
adb -H 127.0.0.1 -P 5037 install -r "$HOME/.expo/android-apk-cache/Expo-Go-54.0.8.apk"
```

## Codex ADB workflow

In sandboxed Codex sessions, starting or connecting to an ADB daemon can fail
with `Operation not permitted`. Reuse the host ADB server explicitly with `-H`
and `-P`; this proved more reliable than relying only on `ADB_SERVER_SOCKET`
when the sandbox allows local socket access.

Check that Codex sees the emulator. If this fails with `Operation not
permitted`, run the same commands from the host terminal instead:

```bash
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
adb -H 127.0.0.1 -P 5037 devices
adb -H 127.0.0.1 -P 5037 shell getprop ro.build.version.release
```

Expected output includes:

```text
List of devices attached
emulator-5554    device
```

Open the Expo experience from Codex once Metro is running on the host:

```bash
adb -H 127.0.0.1 -P 5037 shell am start \
  -a android.intent.action.VIEW \
  -d exp://10.0.2.2:8082
```

Use `8081` instead of `8082` if Metro kept the default port.

Take a screenshot for visual review:

```bash
adb -H 127.0.0.1 -P 5037 exec-out screencap -p > /tmp/bb-academy-current.png
```

If ADB intermittently returns `Operation not permitted`, run the minimal device
check first, then retry the failed command as a separate command:

```bash
adb -H 127.0.0.1 -P 5037 devices
adb -H 127.0.0.1 -P 5037 shell getprop ro.build.version.release
```

## Navigation shortcuts

The local Pixel emulator is `1080x2400`. Useful bottom navigation tap targets:

```bash
# Home
adb -H 127.0.0.1 -P 5037 shell input tap 170 2185

# Brew session
adb -H 127.0.0.1 -P 5037 shell input tap 310 2185

# Recipes
adb -H 127.0.0.1 -P 5037 shell input tap 465 2185

# Scan
adb -H 127.0.0.1 -P 5037 shell input tap 610 2185

# Academy
adb -H 127.0.0.1 -P 5037 shell input tap 765 2185

# Account
adb -H 127.0.0.1 -P 5037 shell input tap 920 2185
```
