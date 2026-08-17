# Ultra UI React Native P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first runnable `ultra-ui-rn` package: source-compatible configuration, units and theme, root overlay infrastructure, `UPIcon`, `UPButton`, an Android/iOS example app, and automated tests.

**Architecture:** The repository root is a TypeScript React Native library built with `react-native-builder-bob`; its sole public entrypoint is `src/index.ts`. `UPRoot` supplies safe-area, gesture, theme, and portal infrastructure, while source-derived component code is isolated in `src/components/<component>`. P0 copies the uview-plus icon font and generates a checked-in TypeScript glyph map so builds do not reference the source repository at runtime.

**Tech Stack:** React 19.2.8, React Native 0.86.0, TypeScript 5.9.x, Jest 29.7, React Native Testing Library 13.3.3, React Native Builder Bob 0.43.0, Safe Area Context 5.8.0, Gesture Handler 3.1.0, Reanimated 4.5.3.

## Global Constraints

- Source of truth is `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus` at version 3.8.86.
- Support React Native CLI applications on Android and iOS; Expo managed workflow is unsupported.
- Public component names use `UP*` PascalCase and package name is `ultra-ui-rn`.
- Retain every public source prop in a completed component's TypeScript interface. Mark React Native-unavailable source props with `@deprecated React Native no-op` rather than deleting them.
- Source props retain their names and defaults; Vue events map to `onClick` and `onChange`; source `v-model` maps to controlled `value` plus `onChange`.
- The 750rpx design baseline is mandatory: `rpx * currentWindowWidth / 750`.
- All components resolve colors and z-index through the `UPThemeProvider`/config layer. `customStyle` is applied last. `customClass` is a retained no-op.
- P0 light-theme colors are `primary #3c9cff`, `success #5ac725`, `warning #f9ae3d`, `error #f56c6c`, `info #909399`, `mainColor #303133`, `contentColor #606266`, `tipsColor #909399`, `lightColor #c0c4cc`, `borderColor #dadbde`, `bgColor #f3f4f6`, and `disabledColor #c8c9cc`.
- Preserve source overlay levels: `toast 10090`, `popup 10075`, `mask 10070`, `navbar 980`, `topTips 975`, `sticky 970`, `indexListSticky 965`.
- Use Jest with `@react-native/jest-preset` and React Native Testing Library. Do not add Vitest.
- Do not create git commits unless the user explicitly requests them. Run `git diff --check` before handoff.

---

## Planned File Structure

| Path | Responsibility |
|---|---|
| `package.json`, `package-lock.json` | Published library metadata, resolved dependencies, build/lint/test/typecheck scripts. |
| `react-native.config.js` | Auto-link the packaged `uicon-iconfont.ttf` asset. |
| `tsconfig.json`, `babel.config.js`, `metro.config.js`, `jest.config.js`, `eslint.config.mjs` | TypeScript, compilation, Metro asset lookup, test, and lint configuration. |
| `src/config/colors.ts` | Source light token values and source-compatible token type. |
| `src/config/z-index.ts` | Source z-index table. |
| `src/config/defaults.ts` | Immutable source defaults for P0 component props and shared config. |
| `src/config/store.ts` | `UP.setConfig` merge/reset behavior, external-store subscription, and strongly typed config access. |
| `src/utils/dimensions.ts` | `getPx`, `rpx2px`, and `range`. |
| `src/utils/timing.ts` | Per-function debounce/throttle implementations and `sleep`. |
| `src/utils/color.ts` | Hex/RGB/RGBA/gradient helpers used by later components. |
| `src/theme/UPThemeProvider.tsx` | Theme context, overrides, `useUPTheme`, and resolved type colors. |
| `src/overlay/OverlayProvider.tsx` | Ordered portal renderer plus add/remove overlay API. |
| `src/overlay/UPRoot.tsx` | Required root composition and development-only missing-root warning channel. |
| `src/icons/upicon-map.ts` | Generated checked-in name-to-Unicode map from upstream `icons.js`. |
| `src/icons/uicon-iconfont.ttf` | MIT-licensed upstream font asset copied verbatim under the source font family name. |
| `src/components/icon/UPIcon.tsx` | Font/image icon, labels, theme colors, press output. |
| `src/components/button/UPButton.tsx` | Source-compatible button states and source prop preservation. |
| `src/index.ts` | All P0 public exports and `UP` namespace. |
| `tests/**/*.test.tsx` | Unit and component behavior tests. |
| `example/` | React Native CLI showcase app linked to the local package. |
| `docs/gap-matrix.md` | P0 source API-to-RN API status, defaults, no-ops, and tests. |
| `docs/compatibility.md` | Application installation, `UPRoot`, and P0 API migration guide. |

## Task 1: Create the React Native library and test foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `babel.config.js`
- Create: `metro.config.js`
- Create: `jest.config.js`
- Create: `eslint.config.mjs`
- Create: `react-native.config.js`
- Create: `.gitignore`
- Create: `.npmignore`
- Create: `tests/setup.ts`
- Create: `tests/public-entry.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: Node `20.20.2`, npm `10.8.2`, and React Native `0.86.0`.
- Produces: `npm run build`, `npm test`, `npm run typecheck`, `npm run lint`, and a testable package entrypoint at `src/index.ts`.

- [ ] **Step 1: Write the failing public-entry test**

```tsx
// tests/public-entry.test.tsx
import { UP } from '../src';

describe('public entrypoint', () => {
  it('exposes the UP namespace', () => {
    expect(UP).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails before an entrypoint exists**

Run: `npm test -- --runInBand tests/public-entry.test.tsx`

Expected: FAIL with `Cannot find module '../src'`.

- [ ] **Step 3: Create the library configuration and minimal entrypoint**

```json
// package.json
{
  "name": "ultra-ui-rn",
  "version": "0.1.0",
  "description": "React Native port of uview-plus with UP-prefixed components.",
  "license": "MIT",
  "main": "./lib/commonjs/index.js",
  "module": "./lib/module/index.js",
  "types": "./lib/typescript/src/index.d.ts",
  "react-native": "./src/index.ts",
  "source": "./src/index.ts",
  "files": ["src", "lib", "react-native.config.js", "README.md", "LICENSE"],
  "scripts": {
    "build": "bob build",
    "clean": "bob clean",
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"src/**/*.{ts,tsx}\" \"tests/**/*.{ts,tsx}\"",
    "test": "jest --runInBand",
    "prepare": "npm run build"
  },
  "peerDependencies": {
    "react": "^19.2.3",
    "react-native": "^0.86.0"
  },
  "dependencies": {
    "react-native-gesture-handler": "^3.1.0",
    "react-native-reanimated": "^4.5.3",
    "react-native-safe-area-context": "^5.8.0"
  },
  "devDependencies": {
    "@react-native/jest-preset": "0.86.0",
    "@react-native/babel-preset": "0.86.1",
    "@react-native/metro-config": "0.86.1",
    "@react-native/typescript-config": "0.86.1",
    "@testing-library/react-native": "13.3.3",
    "@types/jest": "^29.5.14",
    "@types/react": "^19.2.17",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0",
    "react": "19.2.8",
    "react-native": "0.86.0",
    "react-native-builder-bob": "0.43.0",
    "react-native-worklets": "^0.11.0",
    "react-test-renderer": "19.2.8",
    "typescript": "^5.9.0"
  },
  "react-native-builder-bob": {
    "source": "src",
    "output": "lib",
    "targets": [["commonjs", {"esm": true}], ["typescript", {"project": "tsconfig.json"}]]
  }
}
```

```json
// tsconfig.json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "jsx": "react-jsx",
    "rootDir": ".",
    "strict": true
  },
  "include": ["src", "tests"]
}
```

```js
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};

// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');
module.exports = getDefaultConfig(__dirname);

// jest.config.js
module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testPathIgnorePatterns: ['/example/', '/lib/'],
};

// eslint.config.mjs
import parser from '@typescript-eslint/parser';
import plugin from '@typescript-eslint/eslint-plugin';

export default [
  { ignores: ['lib/**', 'coverage/**', 'example/**'] },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: { afterEach: 'readonly', describe: 'readonly', expect: 'readonly', it: 'readonly', jest: 'readonly' },
    },
    plugins: { '@typescript-eslint': plugin },
    rules: { ...plugin.configs.recommended.rules },
  },
];

// react-native.config.js
module.exports = {
  assets: ['./src/icons'],
};
```

```ts
// tests/setup.ts
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock'),
);
```

```ts
// src/index.ts
export const UP = {};
```

```gitignore
# .gitignore
node_modules/
lib/
coverage/
example/node_modules/
example/android/.gradle/
example/android/app/build/
example/ios/Pods/
example/ios/build/
*.log
```

Add a concise `README.md` title, source link, Node 20.19+ prerequisite, and the commands `npm install`, `npm test`, and `npm run build`. Add `.npmignore` with `tests/`, `example/`, `docs/`, and `coverage/`.

- [ ] **Step 4: Install dependencies and verify test, typecheck, lint, and build**

Run: `npm install && npm test -- --runInBand tests/public-entry.test.tsx && npm run typecheck && npm run lint && npm run build`

Expected: All commands exit `0`; test reports `1 passed`.

- [ ] **Step 5: Check the package boundary**

Run: `npm pack --dry-run`

Expected: package contains `lib/`, `src/`, `README.md`, `LICENSE`, and `react-native.config.js`, but excludes `tests/`, `example/`, `docs/`, and `coverage/`.

## Task 2: Implement source-derived config, dimensions, timing, and color utilities

**Files:**
- Create: `src/config/colors.ts`
- Create: `src/config/z-index.ts`
- Create: `src/config/defaults.ts`
- Create: `src/config/store.ts`
- Create: `src/utils/dimensions.ts`
- Create: `src/utils/timing.ts`
- Create: `src/utils/color.ts`
- Create: `src/utils/index.ts`
- Create: `tests/config/store.test.ts`
- Create: `tests/utils/dimensions.test.ts`
- Create: `tests/utils/timing.test.ts`
- Create: `tests/utils/color.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Task 1's build/test setup and source values from `libs/config/color.js`, `libs/config/config.js`, `libs/config/zIndex.js`, and `libs/function/index.js`.
- Produces: `UP.setConfig`, `UP.config`, `UP.color`, `UP.zIndex`, `UP.props`, `UP.getPx`, `UP.rpx2px`, `UP.range`, `UP.sleep`, `UP.debounce`, `UP.throttle`, and color helpers.

- [ ] **Step 1: Write failing tests for source values and utility semantics**

```ts
// tests/utils/dimensions.test.ts
import { getPx, range, rpx2px } from '../../src/utils/dimensions';

describe('dimensions', () => {
  it('converts rpx values using a 750-wide baseline', () => {
    expect(rpx2px(375, 375)).toBe(187.5);
    expect(getPx('20rpx', 375)).toBe(10);
  });

  it('normalizes px values and clamps source ranges', () => {
    expect(getPx('12px', 375)).toBe(12);
    expect(getPx(8, 375)).toBe(8);
    expect(range(0, 10, 12)).toBe(10);
  });
});
```

```ts
// tests/config/store.test.ts
import { getUPConfig, setUPConfig } from '../../src/config/store';

it('merges a color override without losing source defaults', () => {
  setUPConfig({ color: { primary: '#000000' } });
  expect(getUPConfig().color.primary).toBe('#000000');
  expect(getUPConfig().color.error).toBe('#f56c6c');
});
```

```ts
// tests/utils/timing.test.ts
import { debounce, throttle } from '../../src/utils/timing';

jest.useFakeTimers();

it('debounces independently created functions', () => {
  const first = jest.fn();
  const second = jest.fn();
  const debounceFirst = debounce(first, 100);
  const debounceSecond = debounce(second, 100);
  debounceFirst(); debounceFirst(); debounceSecond();
  jest.advanceTimersByTime(100);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
});

it('throttles a button callback at the leading edge', () => {
  const callback = jest.fn();
  const throttled = throttle(callback, 100);
  throttled(); throttled();
  expect(callback).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(100);
  throttled();
  expect(callback).toHaveBeenCalledTimes(2);
});
```

```ts
// tests/utils/color.test.ts
import { colorToRgba, hexToRgb, rgbToHex } from '../../src/utils/color';

it('converts source-supported colors', () => {
  expect(hexToRgb('#3c9cff')).toBe('rgb(60,156,255)');
  expect(rgbToHex('rgb(60,156,255)')).toBe('#3c9cff');
  expect(colorToRgba('#3c9cff', 0.5)).toBe('rgba(60,156,255,0.5)');
});
```

- [ ] **Step 2: Run utility tests to verify they fail**

Run: `npm test -- --runInBand tests/config/store.test.ts tests/utils/dimensions.test.ts tests/utils/timing.test.ts tests/utils/color.test.ts`

Expected: FAIL because the config and utility modules do not exist.

- [ ] **Step 3: Implement immutable defaults and pure utilities**

```ts
// src/config/colors.ts
export type UPColorTokens = {
  primary: string; success: string; warning: string; error: string; info: string;
  mainColor: string; contentColor: string; tipsColor: string; lightColor: string;
  borderColor: string; bgColor: string; disabledColor: string;
};

export const sourceLightColors: Readonly<UPColorTokens> = Object.freeze({
  primary: '#3c9cff', success: '#5ac725', warning: '#f9ae3d', error: '#f56c6c',
  info: '#909399', mainColor: '#303133', contentColor: '#606266',
  tipsColor: '#909399', lightColor: '#c0c4cc', borderColor: '#dadbde',
  bgColor: '#f3f4f6', disabledColor: '#c8c9cc',
});
```

```ts
// src/config/z-index.ts
export const sourceZIndex = Object.freeze({
  toast: 10090, noNetwork: 10080, popup: 10075, mask: 10070,
  navbar: 980, topTips: 975, sticky: 970, indexListSticky: 965,
});
```

```ts
// src/config/defaults.ts
import { sourceLightColors } from './colors';
import { sourceZIndex } from './z-index';

export const sourceDefaults = Object.freeze({
  config: { version: '3', unit: 'px' as const, iconUrl: 'https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf' },
  color: sourceLightColors,
  zIndex: sourceZIndex,
  props: {
    button: { hairline: false, type: 'info', size: 'normal', shape: 'square', plain: false, disabled: false, loading: false, loadingText: '', loadingMode: 'spinner', loadingSize: 15, openType: '', formType: '', appParameter: '', hoverStopPropagation: true, lang: 'en', sessionFrom: '', sendMessageTitle: '', sendMessagePath: '', sendMessageImg: '', showMessageCard: false, dataName: '', throttleTime: 0, hoverStartTime: 0, hoverStayTime: 200, text: '', icon: '', iconColor: '', color: '', stop: true },
    icon: { name: '', color: sourceLightColors.contentColor, size: '16px', bold: false, index: '', hoverClass: '', customPrefix: 'uicon', label: '', labelPos: 'right', labelSize: '15px', labelColor: sourceLightColors.contentColor, space: '3px', imgMode: '', width: '', height: '', top: 0, stop: false },
  },
});
```

```ts
// src/config/store.ts
import { sourceDefaults } from './defaults';
import type { UPColorTokens } from './colors';

export type UPConfig = typeof sourceDefaults.config;
export type UPProps = typeof sourceDefaults.props;
export type UPConfigState = { config: UPConfig; color: UPColorTokens; zIndex: typeof sourceDefaults.zIndex; props: UPProps };
let state: UPConfigState = structuredClone(sourceDefaults);
const listeners = new Set<() => void>();

function publish(): void { listeners.forEach((listener) => listener()); }

export function setUPConfig(overrides: Partial<{ config: Partial<UPConfig>; color: Partial<UPColorTokens>; zIndex: Partial<UPConfigState['zIndex']>; props: Partial<UPProps> }>): void {
  state = {
    config: { ...state.config, ...overrides.config },
    color: { ...state.color, ...overrides.color },
    zIndex: { ...state.zIndex, ...overrides.zIndex },
    props: { ...state.props, ...overrides.props },
  };
  publish();
}
export function getUPConfig(): Readonly<UPConfigState> { return state; }
export function subscribeUPConfig(listener: () => void): () => void { listeners.add(listener); return () => listeners.delete(listener); }
export function resetUPConfigForTests(): void { state = structuredClone(sourceDefaults); publish(); }
```

```ts
// src/utils/dimensions.ts
import { Dimensions } from 'react-native';
const numeric = (value: number | string): number => Number.parseFloat(String(value)) || 0;
export function rpx2px(value: number, width = Dimensions.get('window').width): number { return numeric(value) * width / 750; }
export function getPx(value: number | string, width = Dimensions.get('window').width): number {
  const text = String(value); return /(rpx|upx)$/.test(text) ? rpx2px(numeric(text), width) : numeric(text);
}
export function range(min = 0, max = 0, value = 0): number { return Math.max(min, Math.min(max, Number(value))); }
```

```ts
// src/utils/timing.ts
export const sleep = (milliseconds = 30) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
export function debounce<T extends (...args: never[]) => void>(callback: T, wait = 500, immediate = false) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => { const callNow = immediate && !timer; if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = undefined; if (!immediate) callback(...args); }, wait); if (callNow) callback(...args); };
}
export function throttle<T extends (...args: never[]) => void>(callback: T, wait = 500, immediate = true) {
  let blocked = false;
  return (...args: Parameters<T>) => { if (blocked) return; blocked = true; if (immediate) callback(...args); setTimeout(() => { blocked = false; if (!immediate) callback(...args); }, wait); };
}
```

Implement `hexToRgb`, `rgbToHex`, `colorToRgba`, and `colorGradient` in `src/utils/color.ts`; reject malformed color input by returning the original input, matching the source's tolerant behavior. Re-export all utility symbols from `src/utils/index.ts`.

- [ ] **Step 4: Wire the namespace and pass tests**

```ts
// src/index.ts
import { getUPConfig, setUPConfig } from './config/store';
import * as utils from './utils';

export const UP = {
  setConfig: setUPConfig,
  get config() { return getUPConfig().config; },
  get color() { return getUPConfig().color; },
  get zIndex() { return getUPConfig().zIndex; },
  get props() { return getUPConfig().props; },
  ...utils,
};
export * from './config/colors';
export * from './utils';
```

Run: `npm test -- --runInBand tests/config/store.test.ts tests/utils/dimensions.test.ts tests/utils/timing.test.ts tests/utils/color.test.ts && npm run typecheck`

Expected: all utility tests pass and TypeScript exits `0`.

- [ ] **Step 5: Add reset isolation and validate the full test suite**

Add `afterEach(resetUPConfigForTests)` to `tests/setup.ts` after exporting the reset helper, then run: `npm test -- --runInBand && npm run lint && npm run build`.

Expected: no test can observe another test's config override; all commands exit `0`.

## Task 3: Add theme context, root composition, and ordered overlay portal

**Files:**
- Create: `src/theme/UPThemeProvider.tsx`
- Create: `src/theme/index.ts`
- Create: `src/overlay/OverlayProvider.tsx`
- Create: `src/overlay/UPRoot.tsx`
- Create: `src/overlay/index.ts`
- Create: `tests/theme/UPThemeProvider.test.tsx`
- Create: `tests/overlay/OverlayProvider.test.tsx`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: config values from Task 2 and `react-native-safe-area-context`, `react-native-gesture-handler`.
- Produces: `<UPThemeProvider>`, `useUPTheme()`, `<UPRoot>`, `useUPOverlay()`, and `UPOverlayEntry`.

- [ ] **Step 1: Write failing theme and overlay-order tests**

```tsx
// tests/theme/UPThemeProvider.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { UP, UPThemeProvider, useUPTheme } from '../../src';

function TokenProbe() { return <Text testID="primary">{useUPTheme().colors.primary}</Text>; }

it('merges provider overrides over source colors', () => {
  const screen = render(<UPThemeProvider colors={{ primary: '#000000' }}><TokenProbe /></UPThemeProvider>);
  expect(screen.getByTestId('primary').props.children).toBe('#000000');
});

it('reacts to a global UP.setConfig color update', () => {
  const screen = render(<UPThemeProvider><TokenProbe /></UPThemeProvider>);
  UP.setConfig({ color: { primary: '#111111' } });
  expect(screen.getByTestId('primary').props.children).toBe('#111111');
});
```

```tsx
// tests/overlay/OverlayProvider.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { OverlayProvider, useUPOverlay } from '../../src/overlay';

function Probe() {
  const overlay = useUPOverlay();
  return <Text testID="add" onPress={() => { overlay.add({ id: 'popup', zIndex: 10075, node: <Text>popup</Text> }); overlay.add({ id: 'toast', zIndex: 10090, node: <Text>toast</Text> }); }}>add</Text>;
}

it('renders overlays in ascending z-index order', () => {
  const screen = render(<OverlayProvider><Probe /></OverlayProvider>);
  act(() => screen.getByTestId('add').props.onPress());
  expect(screen.getAllByText(/popup|toast/).map((node) => node.props.children)).toEqual(['popup', 'toast']);
});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- --runInBand tests/theme/UPThemeProvider.test.tsx tests/overlay/OverlayProvider.test.tsx`

Expected: FAIL because theme and overlay exports do not exist.

- [ ] **Step 3: Implement the provider and portal contracts**

```tsx
// src/theme/UPThemeProvider.tsx
import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import type { PropsWithChildren } from 'react';
import type { UPColorTokens } from '../config/colors';
import { getUPConfig, subscribeUPConfig } from '../config/store';

type UPThemeValue = { colors: UPColorTokens; mode: 'light' | 'dark' };
const ThemeContext = createContext<UPThemeValue | null>(null);
export function UPThemeProvider({ children, colors, mode = 'light' }: PropsWithChildren<{ colors?: Partial<UPColorTokens>; mode?: 'light' | 'dark' }>) {
  const globalConfig = useSyncExternalStore(subscribeUPConfig, getUPConfig, getUPConfig);
  const value = useMemo(() => ({ colors: { ...globalConfig.color, ...colors }, mode }), [globalConfig.color, colors, mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useUPTheme(): UPThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useUPTheme must be used inside UPThemeProvider or UPRoot.');
  return value;
}
```

```tsx
// src/overlay/OverlayProvider.tsx
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import type { PropsWithChildren, ReactNode } from 'react';

export type UPOverlayEntry = { id: string; zIndex: number; node: ReactNode };
type StoredEntry = UPOverlayEntry & { sequence: number };
type UPOverlayApi = { add(entry: UPOverlayEntry): void; remove(id: string): void };
const OverlayContext = createContext<UPOverlayApi | null>(null);

export function OverlayProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<StoredEntry[]>([]); const sequence = useRef(0);
  const add = useCallback((entry: UPOverlayEntry) => setEntries((current) => [...current.filter((item) => item.id !== entry.id), { ...entry, sequence: sequence.current++ }]), []);
  const remove = useCallback((id: string) => setEntries((current) => current.filter((item) => item.id !== id)), []);
  const api = useMemo(() => ({ add, remove }), [add, remove]);
  const orderedEntries = [...entries].sort((left, right) => left.zIndex - right.zIndex || left.sequence - right.sequence);
  return <OverlayContext.Provider value={api}>{children}<View pointerEvents="box-none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>{orderedEntries.map((entry) => <View key={entry.id} style={{ zIndex: entry.zIndex }}>{entry.node}</View>)}</View></OverlayContext.Provider>;
}
export function useUPOverlay(): UPOverlayApi { const api = useContext(OverlayContext); if (!api) throw new Error('useUPOverlay must be used inside UPRoot.'); return api; }
```

```tsx
// src/overlay/UPRoot.tsx
import React from 'react';
import type { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OverlayProvider } from './OverlayProvider';
import { UPThemeProvider } from '../theme/UPThemeProvider';

export function UPRoot({ children }: PropsWithChildren) {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><UPThemeProvider><OverlayProvider>{children}</OverlayProvider></UPThemeProvider></SafeAreaProvider></GestureHandlerRootView>;
}
```

Create barrel exports from `src/theme/index.ts` and `src/overlay/index.ts`; export them from `src/index.ts`.

- [ ] **Step 4: Pass provider and overlay tests**

Run: `npm test -- --runInBand tests/theme/UPThemeProvider.test.tsx tests/overlay/OverlayProvider.test.tsx && npm run typecheck`

Expected: both tests pass; entries with z-index `10075` and `10090` render as popup then toast.

- [ ] **Step 5: Add missing-root behavior test and harden the developer error**

Add a test that renders a `useUPOverlay` consumer outside `OverlayProvider` and expects the exact error `useUPOverlay must be used inside UPRoot.`. Run: `npm test -- --runInBand tests/overlay/OverlayProvider.test.tsx`.

Expected: the error explains the required root without an opaque React context failure.

## Task 4: Generate and package the source icon font and implement `UPIcon`

**Files:**
- Create: `scripts/generate-upicon-map.mjs`
- Create: `src/icons/upicon.ttf`
- Create: `src/icons/upicon-map.ts`
- Create: `src/icons/index.ts`
- Create: `src/components/icon/UPIcon.tsx`
- Create: `src/components/icon/index.ts`
- Create: `tests/icons/upicon-map.test.ts`
- Create: `tests/components/UPIcon.test.tsx`
- Modify: `src/index.ts`
- Create: `docs/source-assets.md`

**Interfaces:**
- Consumes: `UPThemeProvider`, `getPx`, source `components/u-icon/icons.js`, source `upicon.ttf`, and source defaults under `sourceDefaults.props.icon`.
- Produces: `<UPIcon {...props} />`, `UPIconProps`, `upiconGlyphs`, and an asset provenance record.

- [ ] **Step 1: Write failing glyph-map and icon behavior tests**

```tsx
// tests/icons/upicon-map.test.ts
import { upiconGlyphs } from '../../src/icons';
it('contains source glyph mappings', () => {
  expect(upiconGlyphs.search).toBe('\ue62a');
  expect(upiconGlyphs.checkmark).toBe('\ue6a8');
});
```

```tsx
// tests/components/UPIcon.test.tsx
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { UPIcon, UPRoot } from '../../src';

it('uses themed glyph colors and emits the source index', () => {
  const onClick = jest.fn();
  const screen = render(<UPRoot><UPIcon name="search" color="primary" index="3" label="Find" onClick={onClick} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-icon'));
  expect(onClick).toHaveBeenCalledWith('3', expect.anything());
  expect(StyleSheet.flatten(screen.getByTestId('up-icon-glyph').props.style)).toEqual(expect.objectContaining({ color: '#3c9cff' }));
});

it('uses Image when source name contains a path separator', () => {
  const screen = render(<UPRoot><UPIcon name="https://cdn.example/icon.png" size="24px" /></UPRoot>);
  expect(screen.getByTestId('up-icon-image').props.source).toEqual({ uri: 'https://cdn.example/icon.png' });
});
```

- [ ] **Step 2: Run the icon tests to verify failure**

Run: `npm test -- --runInBand tests/icons/upicon-map.test.ts tests/components/UPIcon.test.tsx`

Expected: FAIL because no icon asset, map, or component exists.

- [ ] **Step 3: Generate the checked-in glyph map and copy the font**

```js
// scripts/generate-upicon-map.mjs
import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('D:/Repos/xyito/open/uview-plus/src/uni_modules/uview-plus/components/u-icon/icons.js', 'utf8');
const entries = [...source.matchAll(/'uicon-([^']+)':\s*'(\\u[0-9a-f]{4})'/gi)]
  .map(([, name, glyph]) => [name, JSON.parse(`"${glyph}"`)]);
if (entries.length < 100) throw new Error(`Expected at least 100 upstream icon glyphs, got ${entries.length}.`);
const output = `// Generated by scripts/generate-upicon-map.mjs from uview-plus 3.8.86.\nexport const upiconGlyphs = Object.freeze(${JSON.stringify(Object.fromEntries(entries), null, 2)} as const);\nexport type UPIconName = keyof typeof upiconGlyphs;\n`;
await writeFile('src/icons/upicon-map.ts', output);
```

Run: `Copy-Item 'D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus\components\u-icon\upicon.ttf' 'src\icons\uicon-iconfont.ttf'; node scripts/generate-upicon-map.mjs`

Create `src/icons/index.ts` with `export * from './upicon-map';`.

Add `docs/source-assets.md` stating that `src/icons/uicon-iconfont.ttf` is copied verbatim from the source package under its upstream family name `uicon-iconfont`, the root `LICENSE` is MIT, the map was generated from `components/u-icon/icons.js`, and regeneration command is `node scripts/generate-upicon-map.mjs`.

- [ ] **Step 4: Implement `UPIcon` with source prop preservation**

```tsx
// src/components/icon/UPIcon.tsx
import React from 'react';
import { Image, Pressable, Text, View, type ImageStyle, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { sourceDefaults } from '../../config/defaults';
import { getPx } from '../../utils/dimensions';
import { upiconGlyphs, type UPIconName } from '../../icons';
import { useUPTheme } from '../../theme';

export type UPIconProps = {
  name?: UPIconName | string; color?: string; size?: number | string; bold?: boolean; index?: string | number; /** @deprecated React Native no-op */ hoverClass?: string; customPrefix?: string;
  label?: string | number; labelPos?: 'left' | 'right' | 'top' | 'bottom'; labelSize?: number | string; labelColor?: string; space?: number | string;
  imgMode?: 'cover' | 'contain' | 'stretch' | 'center'; width?: number | string; height?: number | string; top?: number | string; /** @deprecated React Native no-op */ stop?: boolean;
  customStyle?: StyleProp<TextStyle | ImageStyle>; /** @deprecated React Native no-op */ customClass?: string; onClick?: (index: string | number, event: unknown) => void;
};

const themeColor = (color: string, colors: ReturnType<typeof useUPTheme>['colors']) => color in colors ? colors[color as keyof typeof colors] : color;

export function UPIcon(input: UPIconProps) {
  const props = { ...sourceDefaults.props.icon, ...input }; const { colors } = useUPTheme();
  const isImage = props.name.includes('/'); const size = getPx(props.size); const color = themeColor(props.color, colors);
  const labelDirection: Record<NonNullable<UPIconProps['labelPos']>, ViewStyle['flexDirection']> = { right: 'row', left: 'row-reverse', bottom: 'column', top: 'column-reverse' };
  const content = isImage ? <Image testID="up-icon-image" source={{ uri: props.name }} resizeMode={props.imgMode || 'contain'} style={[{ width: getPx(props.width || size), height: getPx(props.height || size) }, props.customStyle as StyleProp<ImageStyle>]} /> : <Text testID="up-icon-glyph" style={[{ fontFamily: props.customPrefix === 'uicon' ? 'uicon-iconfont' : props.customPrefix, fontSize: size, lineHeight: size, fontWeight: props.bold ? '700' : '400', color, top: getPx(props.top) }, props.customStyle as StyleProp<TextStyle>]}>{props.customPrefix === 'uicon' ? upiconGlyphs[props.name as UPIconName] || props.name : props.name}</Text>;
  const margin = getPx(props.space); const labelStyle = props.labelPos === 'left' ? { marginRight: margin } : props.labelPos === 'right' ? { marginLeft: margin } : props.labelPos === 'top' ? { marginBottom: margin } : { marginTop: margin };
  return <Pressable testID="up-icon" disabled={!props.onClick} onPress={(event) => props.onClick?.(props.index, event)}><View style={{ flexDirection: labelDirection[props.labelPos], alignItems: 'center' }}>{content}{props.label !== '' ? <Text style={[{ color: themeColor(props.labelColor, colors), fontSize: getPx(props.labelSize), lineHeight: getPx(props.labelSize) }, labelStyle]}>{props.label}</Text> : null}</View></Pressable>;
}
```

Export `UPIcon` and `UPIconProps` from the component barrel and package entrypoint. Document `hoverClass` and `customClass` as RN no-ops in the prop JSDoc, retain `imgMode` through React Native `resizeMode`, and preserve `stop` as a no-op because React Native press propagation differs from uni-app.

- [ ] **Step 5: Run icon tests, typecheck, and asset-link verification**

Run: `node scripts/generate-upicon-map.mjs && npm test -- --runInBand tests/icons/upicon-map.test.ts tests/components/UPIcon.test.tsx && npx react-native config && npm run typecheck`

Expected: map test finds `search` and `checkmark`, icon tests pass, and the config output lists `src/icons/uicon-iconfont.ttf` as a project asset.

## Task 5: Implement source-compatible `UPButton`

**Files:**
- Create: `src/components/button/UPButton.tsx`
- Create: `src/components/button/index.ts`
- Create: `tests/components/UPButton.test.tsx`
- Modify: `src/index.ts`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes: `UPIcon`, `getPx`, `throttle`, source defaults, source theme tokens, and root theme context.
- Produces: `<UPButton />`, `UPButtonProps`, default/pressed/disabled/loading/plain state behavior, and explicit no-op documentation for mini-program-only props.

- [ ] **Step 1: Write failing behavior and style tests**

```tsx
// tests/components/UPButton.test.tsx
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { UPButton, UPRoot } from '../../src';

const renderButton = (node: React.ReactElement) => render(<UPRoot>{node}</UPRoot>);

it('uses source normal-info metrics and dispatches clicks', () => {
  const onClick = jest.fn();
  const screen = renderButton(<UPButton text="Save" onClick={onClick} />);
  fireEvent.press(screen.getByTestId('up-button'));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(screen.getByTestId('up-button').props.style({ pressed: false }))).toEqual(expect.objectContaining({ height: 40, paddingHorizontal: 12, backgroundColor: '#ffffff', borderColor: '#dadbde' }));
});

it('prevents clicks while disabled or loading', () => {
  const onClick = jest.fn();
  const disabled = renderButton(<UPButton text="Disabled" disabled onClick={onClick} />);
  fireEvent.press(disabled.getByTestId('up-button'));
  const loading = renderButton(<UPButton text="Loading" loading onClick={onClick} />);
  fireEvent.press(loading.getByTestId('up-button'));
  expect(onClick).not.toHaveBeenCalled();
  expect(loading.getByTestId('up-button-loading')).toBeTruthy();
});

it('uses source primary plain colors and preserves a custom color', () => {
  const plain = renderButton(<UPButton text="Plain" plain type="primary" />);
  expect(StyleSheet.flatten(plain.getByTestId('up-button').props.style({ pressed: false }))).toEqual(expect.objectContaining({ backgroundColor: '#ffffff', borderColor: '#3c9cff' }));
  const custom = renderButton(<UPButton text="Custom" color="#123456" />);
  expect(StyleSheet.flatten(custom.getByTestId('up-button').props.style({ pressed: false }))).toEqual(expect.objectContaining({ backgroundColor: '#123456', borderColor: '#123456' }));
});
```

- [ ] **Step 2: Run button tests to verify failure**

Run: `npm test -- --runInBand tests/components/UPButton.test.tsx`

Expected: FAIL because `UPButton` is not exported.

- [ ] **Step 3: Implement source defaults, style metrics, and click guard**

```tsx
// src/components/button/UPButton.tsx
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { sourceDefaults } from '../../config/defaults';
import { throttle } from '../../utils/timing';
import { UPIcon } from '../icon';
import { useUPTheme } from '../../theme';

export type UPButtonType = 'info' | 'primary' | 'success' | 'warning' | 'error';
export type UPButtonProps = {
  hairline?: boolean; type?: UPButtonType; size?: 'large' | 'normal' | 'small' | 'mini'; shape?: 'circle' | 'square'; plain?: boolean; disabled?: boolean; loading?: boolean;
  loadingText?: string | number; /** @deprecated React Native no-op */ loadingMode?: string; loadingSize?: string | number; text?: string | number; icon?: string; iconColor?: string; color?: string; throttleTime?: string | number; /** @deprecated React Native no-op */ stop?: boolean;
  customStyle?: StyleProp<ViewStyle>; customClass?: string; children?: React.ReactNode; onClick?: (event: unknown) => void;
  /** @deprecated React Native no-op */ openType?: string; /** @deprecated React Native no-op */ formType?: string; /** @deprecated React Native no-op */ appParameter?: string;
  /** @deprecated React Native no-op */ hoverStopPropagation?: boolean; /** @deprecated React Native no-op */ lang?: string; /** @deprecated React Native no-op */ sessionFrom?: string;
  /** @deprecated React Native no-op */ sendMessageTitle?: string; /** @deprecated React Native no-op */ sendMessagePath?: string; /** @deprecated React Native no-op */ sendMessageImg?: string;
  /** @deprecated React Native no-op */ showMessageCard?: boolean; /** @deprecated React Native no-op */ dataName?: string; /** @deprecated React Native no-op */ hoverStartTime?: string | number;
  /** @deprecated React Native no-op */ hoverStayTime?: string | number; /** @deprecated React Native no-op */ onGetphonenumber?: (event: unknown) => void;
  /** @deprecated React Native no-op */ onGetuserinfo?: (event: unknown) => void; /** @deprecated React Native no-op */ onError?: (event: unknown) => void; /** @deprecated React Native no-op */ onOpensetting?: (event: unknown) => void;
  /** @deprecated React Native no-op */ onLaunchapp?: (event: unknown) => void; /** @deprecated React Native no-op */ onAgreeprivacyauthorization?: (event: unknown) => void;
};

const dimensions = { large: { height: 50, padding: 15, fontSize: 16, width: '100%' as const }, normal: { height: 40, padding: 12, fontSize: 14 }, small: { height: 30, padding: 8, fontSize: 12, minWidth: 60 }, mini: { height: 22, padding: 8, fontSize: 10, minWidth: 50 } };

export function UPButton(input: UPButtonProps) {
  const props = { ...sourceDefaults.props.button, ...input }; const { colors } = useUPTheme(); const metric = dimensions[props.size as keyof typeof dimensions];
  const typeColor = colors[props.type as UPButtonType]; const custom = props.color || typeColor; const plain = props.plain;
  const containerStyle = { height: metric.height, minWidth: metric.minWidth, width: metric.width, paddingHorizontal: metric.padding, borderRadius: props.shape === 'circle' ? 100 : 3, borderWidth: props.hairline ? 0.5 : 1, opacity: props.disabled ? 0.5 : 1, backgroundColor: plain ? '#ffffff' : (props.color || (props.type === 'info' ? '#ffffff' : typeColor)), borderColor: props.color || (props.type === 'info' ? colors.borderColor : typeColor) };
  const textColor = plain ? custom : (props.color || props.type !== 'info' ? '#ffffff' : colors.mainColor);
  const click = useMemo(() => throttle((event: unknown) => { if (!props.disabled && !props.loading) props.onClick?.(event); }, Number(props.throttleTime)), [props.disabled, props.loading, props.onClick, props.throttleTime]);
  const label = props.loading ? (props.loadingText || props.text) : props.text;
  return <Pressable testID="up-button" accessibilityRole="button" accessibilityState={{ disabled: props.disabled || props.loading, busy: props.loading }} disabled={props.disabled || props.loading} onPress={click} style={({ pressed }) => [containerStyle, pressed && !props.disabled && !props.loading ? { opacity: 0.85 } : null, props.customStyle]}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>{props.loading ? <ActivityIndicator testID="up-button-loading" size={Number(props.loadingSize) * 1.15} color={plain ? custom : (props.type === 'info' ? '#c9c9c9' : '#c8c8c8')} /> : props.icon ? <UPIcon name={props.icon} color={props.iconColor || textColor} size={metric.fontSize * 1.35} /> : null}{props.children || label !== '' ? <Text style={{ marginLeft: props.loading || props.icon ? 4 : 0, fontSize: metric.fontSize, lineHeight: metric.fontSize, color: textColor }}>{props.children || label}</Text> : null}</View></Pressable>;
}
```

Export the component and type through `src/components/button/index.ts` and `src/index.ts`. For a CSS `linear-gradient(...)` color, resolve `const gradientColor = props.color.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/)?.[0] ?? typeColor;` before computing `custom`, render that first stop, and emit `console.warn('UPButton: CSS gradients are emulated with their first color stop in P0.')` only when `__DEV__` is true. Do not pass CSS gradient text into a React Native style.

- [ ] **Step 4: Pass tests and verify public TypeScript props**

Run: `npm test -- --runInBand tests/components/UPButton.test.tsx && npm run typecheck`

Expected: all button tests pass; all retained mini-program props compile without being rendered as native props.

- [ ] **Step 5: Create the P0 gap matrix entry**

Create `docs/gap-matrix.md` with the table below, then run `npm run lint && npm test -- --runInBand`.

```markdown
# React Native Compatibility Matrix

Source: `uview-plus` 3.8.86. Status values: Supported, Emulated, No-op retained, Host adapter, Deferred.

## P0

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-button` | visual props `hairline`, `type`, `size`, `shape`, `plain`, `disabled`, `loading`, `loadingText`, `loadingSize`, `text`, `icon`, `iconColor`, `color`, `throttleTime`, `customStyle` | identical `UPButtonProps` | Source 3.8.86 defaults; all except gradients rendered natively | Supported | `tests/components/UPButton.test.tsx` |
| `u-button` | CSS gradient `color` | first color fallback | Development warning; native gradient is P1 | Emulated | `tests/components/UPButton.test.tsx` |
| `u-button` | `openType`, `formType`, mini-program metadata and open-capability events | retained deprecated props | Accepted, not rendered or invoked on RN | No-op retained | `tests/components/UPButton.test.tsx` |
| `u-icon` | `name`, colors, font/image size, labels, `index`, `onClick`, `customStyle` | identical `UPIconProps` | Built-in font map and image URI handling | Supported | `tests/components/UPIcon.test.tsx` |
| `u-icon` | `hoverClass`, `customClass`, `stop` | retained deprecated props | React Native has no class/uni propagation equivalent | No-op retained | `tests/components/UPIcon.test.tsx` |
```

## Task 6: Build the React Native CLI example and P0 documentation

**Files:**
- Create: `example/` through the React Native Community CLI template
- Modify: `example/package.json`
- Modify: `example/App.tsx`
- Create: `example/metro.config.js`
- Modify: `README.md`
- Create: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes: package root `UPRoot`, `UPButton`, `UPIcon`, local TypeScript source, and native dependencies.
- Produces: a native Android/iOS app that shows required P0 states and documentation that tells consumers how to integrate the library.

- [ ] **Step 1: Generate the bare React Native example application**

Run from repository root:

```powershell
npx @react-native-community/cli@20.2.0 init UltraUiExample --version 0.86.0 --directory example --skip-install
```

Expected: `example/android`, `example/ios`, and `example/App.tsx` exist; do not overwrite root package files.

- [ ] **Step 2: Configure local linking and write the P0 showcase**

```json
// example/package.json additions
{
  "dependencies": {
    "ultra-ui-rn": "file:.."
  }
}
```

```js
// example/metro.config.js
const path = require('node:path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

module.exports = mergeConfig(getDefaultConfig(projectRoot), {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules'), path.resolve(workspaceRoot, 'node_modules')],
    disableHierarchicalLookup: true,
  },
});
```

```tsx
// example/App.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UPButton, UPIcon, UPRoot } from 'ultra-ui-rn';

export default function App() {
  const [clicks, setClicks] = useState(0);
  return <UPRoot><SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>ultra-ui-rn / uview-plus P0</Text>
    <Text style={styles.section}>Buttons</Text>
    <View style={styles.row}><UPButton text="Info" onClick={() => setClicks((value) => value + 1)} /><UPButton text="Primary" type="primary" /><UPButton text="Plain" type="success" plain /></View>
    <View style={styles.row}><UPButton text="Disabled" disabled /><UPButton text="Loading" loading loadingText="Loading" type="warning" /></View>
    <Text testID="click-count">Clicks: {clicks}</Text>
    <Text style={styles.section}>Icons</Text>
    <View style={styles.row}><UPIcon name="search" color="primary" label="Search" /><UPIcon name="checkmark-circle-fill" color="success" label="Done" /><UPIcon name="error-circle-fill" color="error" label="Error" /></View>
  </ScrollView></SafeAreaView></UPRoot>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#f3f4f6' }, content: { padding: 16, gap: 16 }, title: { color: '#303133', fontSize: 22, fontWeight: '700' }, section: { color: '#606266', fontSize: 16, fontWeight: '600' }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' } });
```

- [ ] **Step 3: Install root/example dependencies and run the example**

Run: `npm install; Push-Location example; npm install; Pop-Location; npm run build; Push-Location example; npm run android; Pop-Location`

Expected: Android app starts and displays info/primary/plain/disabled/loading buttons, icon glyphs, and incrementing click count. On macOS additionally run `cd example && bundle exec pod install && npm run ios`; expected result is the identical P0 showcase on iOS.

- [ ] **Step 4: Document installation and API conversion explicitly**

Add the following to `docs/compatibility.md` and link it from `README.md`:

```md
# P0 Compatibility

## Installation

```sh
npm install ultra-ui-rn react-native-safe-area-context react-native-gesture-handler react-native-reanimated
npx react-native-asset
```

Wrap the application once:

```tsx
import { UPRoot } from 'ultra-ui-rn';

export function App() {
  return <UPRoot>{/* application */}</UPRoot>;
}
```

## Vue-to-React Native conversion

`<u-button text="Save" @click="save" />` becomes `<UPButton text="Save" onClick={save} />`.

`<u-icon name="search" color="primary" />` becomes `<UPIcon name="search" color="primary" />`.

Vue slots become `children` or named `ReactNode` props. `customStyle` accepts React Native styles. `customClass` is accepted but has no effect. Mini-program-only button attributes are retained as no-ops and appear in the compatibility matrix.
```

- [ ] **Step 5: Perform P0 release checks**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check && git status --short`

Expected: all root checks succeed; package contents exclude tests/example/docs; no whitespace errors; only intended P0 source, test, example, and documentation changes appear.

## Task 7: Add native smoke-test automation and final P0 acceptance record

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `tests/e2e/README.md`
- Modify: `docs/gap-matrix.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: example application and root package scripts from Tasks 1–6.
- Produces: CI gates for the JavaScript library and reproducible Android/iOS manual smoke instructions; does not add Detox until a physical/macOS runner is available.

- [ ] **Step 1: Write the CI workflow**

```yaml
# .github/workflows/ci.yml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  library:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.20.2
          cache: npm
      - run: npm ci
      - run: npm test -- --runInBand
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - run: npm pack --dry-run
      - run: git diff --check
```

- [ ] **Step 2: Add reproducible native smoke instructions**

```md
<!-- tests/e2e/README.md -->
# P0 Native Smoke Tests

1. Run `npm install` in the repository root and `npm install` in `example/`.
2. Start Android with `cd example && npm run android`; on macOS run `bundle exec pod install && npm run ios`.
3. Verify the Info button increments `Clicks` exactly once per press.
4. Verify Disabled and Loading buttons do not increment `Clicks`.
5. Verify Primary is `#3c9cff`, success Plain has a white background with `#5ac725` border, and icon colors match their token.
6. Verify font glyphs render for Search, Done, and Error without fallback rectangles.
```

- [ ] **Step 3: Add matrix verification references and the P0 acceptance note**

Append to `docs/gap-matrix.md`:

```md
## P0 Acceptance

| Requirement | Evidence |
|---|---|
| JS utilities and component behavior | `npm test -- --runInBand` |
| Public types | `npm run typecheck` |
| Package build and contents | `npm run build && npm pack --dry-run` |
| Android/iOS smoke behavior | `tests/e2e/README.md` |
| Source prop/event coverage | P0 component rows above |
```

Add a `P0 status` section to `README.md` linking the design, implementation plan, compatibility guide, gap matrix, and smoke instructions.

- [ ] **Step 4: Run release-equivalent verification**

Run: `npm ci && npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: command exits `0`; CI can execute the same root checks on Node `20.20.2`.

- [ ] **Step 5: Record the outcome without committing**

Run: `git status --short`

Expected: inspect the complete intended diff with the user. Do not run `git commit`; repository policy requires explicit user approval before any commit.

## Completion Criteria

- The library builds and exposes `UP`, `UPRoot`, `UPThemeProvider`, `UPIcon`, `UPButton`, and documented utility functions from `src/index.ts`.
- `UP.setConfig` merges source-default colors, z-index values, and P0 props without cross-test leakage.
- `UPIcon` renders packaged font glyphs and URI images; its source labels and `index` callback semantics are tested.
- `UPButton` matches source P0 metrics: normal 40dp/14dp/12dp horizontal padding, large 50dp/full width, small 30dp/min 60dp, mini 22dp/min 50dp; disabled opacity is 0.5 and shape radii are 3dp/100dp.
- The example launches on Android and iOS (where the host supports each platform) and demonstrates every P0 visual/interaction state.
- `docs/gap-matrix.md` classifies every P0 prop/event/method as Supported, Emulated, or No-op retained and points to its test.
- Root tests, typecheck, lint, build, package dry run, and `git diff --check` pass.
