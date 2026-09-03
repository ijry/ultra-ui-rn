---
name: run-example
description: Launch and drive the ultra-ui-rn example app to see a change actually render. Use when asked to run/start/screenshot the example app, or to confirm a component change works in the real app rather than only in tests. Covers the working H5 path (Vite + react-native-web + headless Chrome over CDP) and records the state of the Android path.
---

# Running the ultra-ui-rn example app

Two targets. **Use H5 unless you specifically need native** — it starts in
under a second and needs no build step.

| Target | State | Use for |
|---|---|---|
| H5 (`npm run web`) | ✅ works | layout, slots, props, interaction, console errors |
| Android | ⚠️ blocked on Windows MAX_PATH, see below | anything scroll-container- or native-module-dependent |

## H5: launch

```bash
cd example && npm run web          # Vite, port 3000
timeout 60 bash -c 'until curl -sf http://localhost:3000 >/dev/null 2>&1; do sleep 1; done'
```

Vite aliases `ultra-ui-rn` → `../src`, so it reads library **source** directly;
no `npm run build` needed for the H5 preview.

Stop it by killing the port's listener, not with a broad `pkill`:

```bash
pid=$(netstat -ano | grep LISTENING | grep ':3000 ' | awk '{print $NF}' | head -1)
[ -n "$pid" ] && taskkill //PID $pid //F
```

## H5: drive it

`chromium-cli` is not available here. Launch Chrome yourself and drive it with
the bundled `cdp.cjs` (a minimal CDP driver over `ws`):

```bash
"C:/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new --disable-gpu --no-first-run \
  --remote-debugging-port=9222 \
  --user-data-dir="$TEMP/rn-verify/profile" \
  --window-size=390,844 http://localhost:3000 &
sleep 4

export NODE_PATH="<repo>/example/node_modules"   # cdp.cjs needs `ws`
SHOT_DIR="$TEMP/rn-verify/shots" node .claude/skills/run-example/cdp.cjs <<'EOF'
nav http://localhost:3000
sleep 2500
wait-for 组件示例
click-text 高级组件
click-text 富文本解析
sleep 1500
screenshot parse
console-errors
EOF
```

Commands: `nav`, `wait-for <text>`, `click-text <text>`, `click-testid <id>`,
`scroll-x <text> <dx>`, `screenshot <name>`, `eval <js>`, `console-errors`,
`sleep <ms>`. `click-*` scrolls the match into view first — CDP dispatches at
viewport coordinates, so an off-screen element would otherwise get a stray
click at a bogus position.

**Then look at the screenshot** with the Read tool. A blank frame means the app
never mounted.

## Navigating to a demo page

No URL deep links — navigation is in-app state. Always: 组件 tab (default) →
category (`高级组件` / `表单组件` / …) → component (Chinese name, e.g. `优惠券`).
`nav` reloads back to the category index, which is the cheapest way to reset.

## Gotchas that cost real time

- **Stale HMR errors.** After editing a file, `console-errors` can report an
  exception from the pre-edit module (its URL carries a `?t=<timestamp>`).
  Re-run the driver in a fresh session before believing it.
- **`example/node_modules/ultra-ui-rn` is a junction** to the repo root and has
  gone missing before. When it does, `cd example && npx tsc` fails wholesale
  with `Cannot find module 'ultra-ui-rn'` and every demo page's props silently
  degrade to `any`. Recreate it:
  `New-Item -ItemType Junction -Path example/node_modules/ultra-ui-rn -Target <repo root>`
- **example typecheck reads `lib/typescript/`, not `src/`.** After changing the
  library you must `npm run build` at the root, or `example`'s `tsc` checks
  against stale types and misses real prop errors.
- **`react-native-web` is not native.** The parse/scroll containers are not the
  scrolling element under RNW, so `ScrollView.scrollTo` has no observable
  effect. Anything that depends on a ScrollView actually scrolling has to be
  checked on Android.
- **`npm install` in `example` needs `--legacy-peer-deps`**
  (`react-native-web@0.19.13` peers on react ^18; the project uses 19.2.8).

## Android

The JS side is fixed and the bundle builds; the blocker is a Windows path
limit in the native build.

```bash
cd example && npx react-native start                    # Metro
curl -s -o /dev/null -w '%{http_code}\n' \
  "http://localhost:8081/index.bundle?platform=android&dev=true"   # expect 200
```

Emulator (`ultra_ui_test` AVD exists):

```bash
export PATH="$PATH:$LOCALAPPDATA/Android/Sdk/emulator:$LOCALAPPDATA/Android/Sdk/platform-tools"
emulator -avd ultra_ui_test -no-snapshot-save -gpu swiftshader_indirect -no-audio &
timeout 300 bash -c 'until [ "$(adb shell getprop sys.boot_completed | tr -d "\r")" = 1 ]; do sleep 5; done'
adb reverse tcp:8081 tcp:8081
adb shell am start -n com.ultrauiexample/.MainActivity
adb exec-out screencap -p > shot.png
adb logcat -d -t 200 | grep -iE "ReactNativeJS|fatal|Exception"
```

**Gradle needs JDK 17+.** The machine's `JAVA_HOME` points at JDK 1.8, so set it
per-invocation — don't change the system value:

```bash
export JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"   # OpenJDK 21
export PATH="$JAVA_HOME/bin:$PATH"
cd example/android && ./gradlew installDebug --console=plain
```

### Known blocker

`:app:buildCMakeDebug[arm64-v8a]` fails with
`ninja: error: Stat(...RNGestureHandlerDetectorShadowNode.cpp.o): Filename
longer than 260 characters`.

Measured, so nobody re-litigates it:

```
ninja cwd prefix                    86
relative object path               292   <- already over 260 on its own
  of which mirrored source path    156
total                              378   (limit 260)
```

CMake mirrors the full source path under the object directory, and that
mirrored portion is 156 chars of gesture-handler's own
`shared/shadowNodes/react/renderer/components/rngesturehandler_codegen/` tree.

**Path shortening cannot fix this.** The relative object path alone is 292
chars, so even a one-character build root leaves it over the limit; relocating
the native build dir gets to ~322, and moving the whole repo to `D:\u\` only
reaches ~346.

The one real fix is enabling Windows long paths (`LongPathsEnabled`) —
system-wide and needs admin, so ask before doing it. CMake 3.22 and ninja both
honour it once the OS flag is set.

reanimated, worklets and gesture-handler all compile fine on their own —
autolinking is working. Only the app module's codegen step trips the limit.

Restricting `abiFilters` to `x86_64` cuts build time roughly 4× for emulator
work but saves only 3 characters, so it is a speed change, not a fix.

### If you touch the native setup

Four things had to be true for the bundle to build at all; keep them that way:

- `metro.config.js` must **not** set `disableHierarchicalLookup` — it hides
  nested private deps such as reanimated's own `semver@7`
- `babel.config.js` must keep `react-native-worklets/plugin` last (reanimated 4
  requirement; without it `ultra-ui-rn` evaluates to `undefined` at runtime)
- `example/package.json` must declare the 5 native peers at pinned versions —
  autolinking only scans the example's own dependency graph, and caret ranges
  drift into a reanimated/worklets conflict
- `jest.config.js` must map those packages' **subpaths** to the root copy, or
  the second copy under `example/node_modules` yields two module instances and
  the jestSetup native mocks stop applying

