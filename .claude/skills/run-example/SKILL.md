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
| Android | ✅ works (emulator, built and installed) | anything scroll-container- or native-module-dependent |

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

## Sweeping every page on a device

`sweep.cjs` walks every registered demo page and records a health signal per page,
so failures get triaged instead of eyeballing 94 screenshots. It reads the
component list out of `example/pages/registry.ts`.

```bash
export PATH="$PATH:$LOCALAPPDATA/Android/Sdk/platform-tools"
export ANDROID_SERIAL=emulator-5554        # a physical phone is also on wireless adb
SHOT_DIR=/d/tmp/sweep node .claude/skills/run-example/sweep.cjs            # all 7 categories
SHOT_DIR=/d/tmp/sweep node .claude/skills/run-example/sweep.cjs advanced   # one category
ONLY_IDS=Copy,Overlay SHOT_DIR=/d/tmp/sweep node .../sweep.cjs             # a few pages
```

**Pin `ANDROID_SERIAL`** — `sweep.cjs` shells out to bare `adb`, and this machine
usually has the user's real phone attached over wireless adb as well. Put
`SHOT_DIR` on `D:`; `C:` runs out of space.

Use `ONLY_IDS` to re-verify a handful of pages instead of paying for a 10-minute
full run.

A page is flagged when navigation failed, a `ReactNativeJS` error was logged while
it was open, or the dump came back empty. Every page's screenshot lands in
`SHOT_DIR` alongside `sweep.json`.

How to read the output — every flag below has produced both a false positive and
a real bug, so triage by asking what the page *should* be doing:

- **An empty dump means "never idle", which is a false positive only if the page
  actually animates.** `uiautomator` dumps only when the window idles, so
  CountDownDemo's millisecond counters or NoticeBarDemo's marquee legitimately
  yield nothing while rendering perfectly. But ReadMoreDemo has nothing to
  animate, and its empty dump turned out to be an endless relayout loop
  (`UPReadMore` measured content *inside* the node it clamps, so each collapse
  changed the measurement that caused it). Ask "what on this page could still be
  moving?" — if the answer is nothing, you have a render/layout loop, not a
  tooling artifact. `adb exec-out uiautomator dump /dev/tty` printing
  `ERROR: could not get idle state` on a static page confirms it.
- **`LINK NOT FOUND` is usually the scroll direction, not a crash.** `tapText`
  only ever swipes *upward* (list scrolls down), so a target above the current
  scroll position is unreachable. Returning from page N leaves the list scrolled
  near N, so a page immediately *before* it can vanish while its neighbours are
  found fine — that is how PdfReader was flagged with Cropper and Poster both
  passing. Re-navigate by hand before believing it.
- **One crashed page cascades.** When SignatureDemo died, the 13 pages after it in
  that category all reported `LINK NOT FOUND` because navigation was stuck. Fix
  the first failure and re-run before counting the rest.
- **LogBox entries outlive the page that caused them.** logcat is cleared per page,
  but the on-screen red box does not reset on in-app navigation, so an error
  visible on page N may belong to page N-1.
- **Never edit source while it runs.** A save triggers a Metro reload that blanks
  whatever page is open; that invalidated an entire run here. `npm run build`
  counts too — Metro resolves `ultra-ui-rn` through `lib/commonjs`, so a rebuild
  reloads the app just like editing a demo page would.

Navigation is by the component's English id (unique). Don't switch it to the
Chinese label — `Choose` and `Picker` are both `选择器`, and matching on that
always opened Picker.

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
  against stale types and misses real prop errors. Corollary: never import
  `ultra-ui-rn/src/...` from a demo page — a deep import drags the whole library
  source tree into example's program (bypassing the built declarations, and
  pulling in files whose ambient `.d.ts` lives outside example's `include`).
  Import types from `'ultra-ui-rn'` instead.
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

### The MAX_PATH blocker (resolved — keep the workaround)

`:app:buildCMakeDebug` used to fail with `ninja: error: Stat(...
RNGestureHandlerDetectorShadowNode.cpp.o): Filename longer than 260
characters`. It builds now; the fix is a newer ninja, and it lives in
`example/android/local.properties`:

```
cmake.dir=C:/Users/Admin/AppData/Local/Android/Sdk/cmake/3.31.6
```

That CMake ships ninja 1.12.1. **ninja 1.10.2 has its own hardcoded
`> MAX_PATH` check that ignores the OS `LongPathsEnabled` flag** (which was
already 1 on this machine), so the registry setting was never the lever —
upgrading ninja was.

Measured, so nobody re-litigates the path-shortening idea:

```
ninja cwd prefix                    86
relative object path               292   <- already over 260 on its own
  of which mirrored source path    156
total                              378   (limit 260)
```

CMake mirrors the full source path under the object directory, and that
mirrored portion is 156 chars of gesture-handler's own
`shared/shadowNodes/react/renderer/components/rngesturehandler_codegen/` tree.
The relative object path alone is 292 chars, so even a one-character build root
stays over the limit; moving the whole repo to `D:\u\` only reaches ~346.

Restricting `abiFilters`/`-PreactNativeArchitectures` to `x86_64` cuts build
time roughly 4× for emulator work (12 min → ~4 min) but saves only 3
characters, so it is a speed change, not a fix.

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

