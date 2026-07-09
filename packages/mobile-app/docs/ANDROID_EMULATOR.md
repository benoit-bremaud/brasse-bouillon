# Android emulator workflow for local Codex sessions

Use this when a Codex worktree needs to inspect the Expo mobile app on the
local Android emulator.

## Required environment

The project expects Node 20:

```bash
cd /tmp/brasse-bouillon-academy-content
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20
```

Expose the Android SDK tools:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

## Important: reuse the host ADB server

In sandboxed Codex sessions, starting a new ADB daemon can fail with
`Operation not permitted`. If the emulator is already visible from the user's
terminal, reuse that host ADB server:

```bash
export ADB_SERVER_SOCKET=tcp:127.0.0.1:5037
adb devices
```

Expected output:

```text
List of devices attached
emulator-5554    device
```

## Start the Academy worktree app

From the Codex worktree:

```bash
cd /tmp/brasse-bouillon-academy-content
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
export ADB_SERVER_SOCKET=tcp:127.0.0.1:5037

npm -w packages/mobile-app start -- --android
```

If the emulator is not running, the available AVDs can be listed from the
user's terminal:

```bash
emulator -list-avds
emulator -avd bb_pixel_academy
```
