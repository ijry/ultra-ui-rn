# P23 Code Countdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a source-compatible, headless `UPCode` verification-code countdown with imperative controls and optional application-owned persistence.

**Architecture:** `UPCode` is a `forwardRef` component that renders `null` and drives application text exclusively through callbacks. It maintains an absolute deadline in refs, derives each tick with `Math.ceil((deadlineMs - Date.now()) / 1000)`, and exposes `start`/`reset`. An optional `UPCodeStorage` adapter persists the source-compatible deadline key only when `keepRunning` and `uniqueKey` are configured.

**Tech Stack:** TypeScript, React 19 hooks and refs, JavaScript timers, existing reactive `UP` configuration store, `@testing-library/react-native`, Jest fake timers.

## Global Constraints

- Work directly in `D:\Repos\xyito\open\ultra-ui-rn` on `main`; do not create branches, worktrees, commits, resets, cleans, or dependency changes.
- Port source `u-code` from uview-plus 3.8.86 as a headless logic component; it must render `null` and must not create its own button or label.
- Public names use `UP*`: `UPCode`, `UPCodeProps`, `UPCodeRef`, and `UPCodeStorage`.
- Preserve `seconds`, `startText`, `changeText`, `endText`, `keepRunning`, `uniqueKey`, `onStart`, `onChange`, and `onEnd` semantics.
- `changeText` replaces only the first lowercase or uppercase `x`; source Chinese defaults are `获取验证码`, `X秒重新获取`, and `重新获取`.
- Use no `AsyncStorage`, clipboard package, native module, or new dependency. Persistence is only an optional application-supplied adapter.
- Persist with the exact source suffix `${uniqueKey}_$uCountDownTimestamp`; swallow adapter failures and continue in memory.
- Explicit props override reactive `UP.setConfig({ props: { code } })` defaults.

---

## File Structure

- `src/components/code/UPCode.tsx` provides the public types, absolute-deadline countdown, persistence adapter handling, and imperative ref methods.
- `src/components/code/index.ts` exports the code component module.
- `src/components/index.ts` exposes `UPCode` through the package public component barrel.
- `src/config/defaults.ts` declares the source code defaults and adds `code` to `UPProps`.
- `src/config/store.ts` clones and reactively merges `props.code`.
- `tests/components/UPCode.test.tsx` provides focused fake-timer, ref, default, persistence, and failure-path regression coverage.
- `tests/config/store.test.ts` proves `code` override merging retains source defaults.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and `example/App.tsx` document and demonstrate the headless API.

## Task 1: Lock the Headless Countdown Contract

**Files:**
- Create: `tests/components/UPCode.test.tsx`
- Modify: `tests/config/store.test.ts`

**Interfaces:**
- Consumes: future public `UPCode`, `UPCodeRef`, `UPCodeStorage`, `UP`, and `UPRoot` exports.
- Produces: focused regression contracts for source callback order, formatting, refs, zero duration, reactive defaults, persistence, and adapter failure fallback.

- [ ] **Step 1: Add fake-timer setup and source callback tests**

```tsx
import React, { createRef } from 'react';
import { act, render } from '@testing-library/react-native';
import { UP, UPCode, UPRoot, type UPCodeRef, type UPCodeStorage } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

afterEach(() => {
  jest.useRealTimers();
});

it('is headless and emits source countdown text through an imperative ref', () => {
  jest.useFakeTimers();
  const ref = createRef<UPCodeRef>();
  const onChange = jest.fn();
  const onEnd = jest.fn();
  const screen = renderRoot(
    <UPCode
      changeText="Retry X/x"
      endText="Retry now"
      onChange={onChange}
      onEnd={onEnd}
      ref={ref}
      seconds={3}
      startText="Send code"
    />,
  );

  expect(screen.toJSON()).toBeNull();
  expect(onChange).toHaveBeenLastCalledWith('Send code');
  act(() => ref.current?.start());
  expect(onChange).toHaveBeenLastCalledWith('Retry 3/x');
  act(() => jest.advanceTimersByTime(1_000));
  expect(onChange).toHaveBeenLastCalledWith('Retry 2/x');
  act(() => jest.advanceTimersByTime(2_000));
  expect(onChange).toHaveBeenLastCalledWith('Retry now');
  expect(onEnd).toHaveBeenCalledTimes(1);
});
```

Add cases proving `start()` while active restarts at the full duration, `reset()` emits `endText` without `onEnd`, and `seconds={0}` emits the formatted zero text then ends only after one 1-second scheduled tick. Assert unmount clears its timer by advancing fake time after `unmount()` and checking no later callbacks occur.

- [ ] **Step 2: Add defaults and persistence contract cases**

Create a synchronous adapter helper:

```tsx
function storage(initial: Record<string, string | null> = {}): UPCodeStorage & {
  values: Record<string, string | null>;
} {
  const values = { ...initial };
  return {
    getItem: jest.fn((key: string) => values[key] ?? null),
    removeItem: jest.fn((key: string) => { delete values[key]; }),
    setItem: jest.fn((key: string, value: string) => { values[key] = value; }),
    values,
  };
}
```

With `jest.useFakeTimers()` and `jest.setSystemTime(100_000)`, assert `start()` with `keepRunning`, `uniqueKey="signup"`, and this adapter writes `signup_$uCountDownTimestamp` with `103_000` for `seconds={3}`. Unmount without reset leaves the key. A new component with the same adapter restores `Retry 3` without `onStart`; at completion it removes the key and emits `onEnd`. Assert `reset()` removes a running key immediately.

Add an async adapter with `getItem: jest.fn().mockResolvedValue('102000')`; flush it through `await act(async () => { await Promise.resolve(); })` and assert restored text. Add rejected `getItem`, `setItem`, and `removeItem` mocks and assert initial/start/end callbacks complete without an unhandled rejection. Add a `UP.setConfig({ props: { code: { seconds: 2, changeText: 'Configured X' } } })` test that verifies reactive defaults and explicit `seconds={4}` precedence.

- [ ] **Step 3: Add the config store contract**

Append this case to `tests/config/store.test.ts`:

```tsx
it('merges code prop overrides without losing source code defaults', () => {
  setUPConfig({ props: { code: { changeText: 'Again X', keepRunning: true } } });

  expect(getUPConfig().props.code.changeText).toBe('Again X');
  expect(getUPConfig().props.code.keepRunning).toBe(true);
  expect(getUPConfig().props.code.seconds).toBe(60);
  expect(getUPConfig().props.code.endText).toBe('重新获取');
});
```

- [ ] **Step 4: Run tests before implementation**

Run: `npm test -- --runInBand tests/components/UPCode.test.tsx tests/config/store.test.ts`

Expected: FAIL because `UPCode` and `props.code` are not exported or configured.

## Task 2: Add Source Defaults and Public Module Surface

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Create: `src/components/code/index.ts`
- Modify: `src/components/index.ts`
- Test: `tests/config/store.test.ts`

**Interfaces:**
- Consumes: existing immutable `sourceDefaults`, `UPProps`, store cloning, and component barrel patterns.
- Produces: `UPCodeDefaults`, `UPProps['code']`, reactive `getUPConfig().props.code`, and a public module placeholder for the implementation task.

- [ ] **Step 1: Declare the code default type and prop map member**

Add beside `UPCodeInputDefaults`:

```ts
export type UPCodeDefaults = {
  seconds: number;
  startText: string;
  changeText: string;
  endText: string;
  keepRunning: boolean;
  uniqueKey: string;
};
```

Add `code: UPCodeDefaults;` adjacent to `codeInput` in `UPProps`.

- [ ] **Step 2: Add frozen source defaults and store merge paths**

Insert this immutable default beside `codeInput`:

```ts
code: Object.freeze({
  seconds: 60,
  startText: '获取验证码',
  changeText: 'X秒重新获取',
  endText: '重新获取',
  keepRunning: false,
  uniqueKey: '',
}),
```

In both `createSourceState()` and `setUPConfig()`, add the existing shallow clone/merge form:

```ts
code: { ...sourceDefaults.props.code },
// and later
code: { ...state.props.code, ...overrides.props?.code },
```

- [ ] **Step 3: Add component barrel wiring**

Create `src/components/code/index.ts` with:

```ts
export * from './UPCode';
```

Add `export * from './code';` immediately after the existing `code-input` export in `src/components/index.ts`.

- [ ] **Step 4: Run the config contract**

Run: `npm test -- --runInBand tests/config/store.test.ts`

Expected: config merge test passes; the component test remains the only expected failure until Task 3 creates `UPCode.tsx`.

## Task 3: Implement the Headless Absolute-Deadline Countdown

**Files:**
- Create: `src/components/code/UPCode.tsx`
- Test: `tests/components/UPCode.test.tsx`

**Interfaces:**
- Consumes: `useUPConfig().props.code`, React `forwardRef`, and JavaScript timer/date APIs.
- Produces: exported `UPCode`, `UPCodeProps`, `UPCodeRef`, `UPCodeStorage`, no rendered host element, and source-compatible callback behavior.

- [ ] **Step 1: Define public types and pure helper functions**

```tsx
export type UPCodeStorage = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

export type UPCodeRef = { start: () => void; reset: () => void };

export type UPCodeProps = {
  seconds?: string | number;
  startText?: string;
  changeText?: string;
  endText?: string;
  keepRunning?: boolean;
  uniqueKey?: string;
  storage?: UPCodeStorage;
  onStart?: () => void;
  onChange?: (text: string) => void;
  onEnd?: () => void;
};

function wholeSeconds(value: string | number | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function textFor(changeText: string, seconds: number): string {
  return changeText.replace(/[xX]/, String(seconds));
}
```

Add `storageKey(props)` that returns `${props.uniqueKey}_$uCountDownTimestamp` only when `keepRunning`, `storage`, and a nonempty `uniqueKey` are all present; otherwise it returns `null`.

- [ ] **Step 2: Create timer, persistence, and callback primitives**

Use refs for the latest merged props, `running`, `deadlineMs`, a `setInterval` handle, and a `runVersion` counter. Define these callbacks in this order:

```tsx
const clearTimer = useCallback(() => {
  if (timerRef.current) clearInterval(timerRef.current);
  timerRef.current = null;
}, []);

const emit = useCallback((text: string) => {
  propsRef.current.onChange?.(text);
}, []);

const removeDeadline = useCallback(() => {
  const current = propsRef.current;
  const key = storageKey(current);
  if (key) void Promise.resolve(current.storage?.removeItem(key)).catch(() => {});
}, []);

const saveDeadline = useCallback((deadlineMs: number, version: number) => {
  const current = propsRef.current;
  const key = storageKey(current);
  if (!key) return;
  void Promise.resolve(current.storage?.setItem(key, String(deadlineMs)))
    .then(() => {
      if (version !== runVersionRef.current) removeDeadline();
    })
    .catch(() => {});
}, [removeDeadline]);
```

The post-write version check prevents a delayed `setItem` from restoring a key after `reset()` or a later run has invalidated it.

- [ ] **Step 3: Implement completion, schedule, and `start`/`reset` methods**

```tsx
const finish = useCallback(() => {
  if (!runningRef.current) return;
  runningRef.current = false;
  deadlineRef.current = 0;
  clearTimer();
  removeDeadline();
  emit(propsRef.current.endText ?? '重新获取');
  propsRef.current.onEnd?.();
}, [clearTimer, emit, removeDeadline]);

const tick = useCallback(() => {
  if (!runningRef.current) return;
  const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1_000));
  if (remaining <= 0) finish();
  else emit(textFor(propsRef.current.changeText ?? 'X秒重新获取', remaining));
}, [emit, finish]);

const begin = useCallback((deadlineMs: number, emitStart: boolean, persist: boolean) => {
  clearTimer();
  runningRef.current = true;
  deadlineRef.current = deadlineMs;
  const remaining = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1_000));
  if (emitStart) propsRef.current.onStart?.();
  emit(textFor(propsRef.current.changeText ?? 'X秒重新获取', remaining));
  if (persist) saveDeadline(deadlineMs, runVersionRef.current);
  timerRef.current = setInterval(tick, 1_000);
}, [clearTimer, emit, saveDeadline, tick]);

const start = useCallback(() => {
  runVersionRef.current += 1;
  const seconds = wholeSeconds(propsRef.current.seconds);
  begin(Date.now() + seconds * 1_000, true, true);
}, [begin]);

const reset = useCallback(() => {
  runVersionRef.current += 1;
  runningRef.current = false;
  deadlineRef.current = 0;
  clearTimer();
  removeDeadline();
  emit(propsRef.current.endText ?? '重新获取');
}, [clearTimer, emit, removeDeadline]);
```

Expose `{ start, reset }` with `useImperativeHandle`. Zero seconds receives an active `0` text from `begin`, then `finish` runs on the next 1-second interval.

- [ ] **Step 4: Restore persisted deadlines and clean up safely**

Add one mount/update effect that performs the following exact sequence:

1. Increment `runVersionRef` and capture it as `restoreVersion`; set `alive = true`.
2. Read `storageKey(propsRef.current)`. When it is absent, emit `startText` and return cleanup that sets `alive = false` and clears the timer.
3. Resolve `storage.getItem(key)`, parse a finite numeric deadline, and return without state changes if `!alive` or `restoreVersion !== runVersionRef.current`.
4. If deadline is greater than `Date.now()`, call `begin(deadline, false, false)`; otherwise call `removeDeadline()` and emit `startText`.
5. On read failure emit `startText`; do not throw.
6. Cleanup sets `alive = false` and clears the timer without removing a valid active deadline, so `keepRunning` can restore after remount.

Use a ref for props so callbacks always observe current explicit/config values. Return `null` from the component body.

- [ ] **Step 5: Run focused contracts and static checks**

Run:

```powershell
npm test -- --runInBand tests/components/UPCode.test.tsx tests/config/store.test.ts
npm run typecheck
npm run lint
```

Expected: all commands exit `0`; storage failures produce no console errors or rejected promises, and the rendered tree is null.

## Task 4: Document and Demonstrate `UPCode`

**Files:**
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`
- Modify: `example/App.tsx`

**Interfaces:**
- Consumes: public `UPCode`/`UPCodeRef` API from Task 3 and existing `UPCodeInput` example state.
- Produces: user-visible headless usage documentation, persistence limitation disclosure, and an interactive example.

- [ ] **Step 1: Add README delivery summary and plan link**

Add the P23 plan link after P22. Append a status paragraph stating that P23 adds the headless `UPCode` countdown, ref controls, source messages, and optional host-owned persistence.

- [ ] **Step 2: Add a P23 compatibility section**

Add this focused example after P21:

```tsx
const codeRef = useRef<UPCodeRef>(null);
const [codeText, setCodeText] = useState('获取验证码');

<UPButton onClick={() => codeRef.current?.start()} text={codeText} />
<UPCode ref={codeRef} seconds={60} onChange={setCodeText} />
```

State that `UPCode` is intentionally headless; apps render the control and call `start`. Document source text callbacks, restart/reset semantics, and `changeText` first-marker replacement. Explain that `keepRunning` needs the optional `storage` adapter because React Native core has no `uni` or built-in persistence equivalent; absent or failed storage safely stays in memory.

- [ ] **Step 3: Add P23 matrix rows**

Insert before deferred components:

```markdown
## P23 Code Countdown

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-code` | seconds/texts, start/reset, start/change/end callbacks | `UPCode`, `UPCodeRef`, source callbacks | Headless absolute-deadline countdown preserves source text replacement and imperative lifecycle | Emulated | `tests/components/UPCode.test.tsx` |
| `u-code` | `keepRunning`, `uniqueKey`, uni storage | `keepRunning`, `uniqueKey`, optional `UPCodeStorage` | Host adapter stores the source-compatible deadline key; absent/failed storage remains in memory | Host adapter | `tests/components/UPCode.test.tsx` |
| `u-code` | Vue visual shell and source i18n runtime | No visual output; explicit text props | Application owns UI and localization; React Native package has fixed source Chinese defaults | No-op retained | `src/components/code/UPCode.tsx` |
```

- [ ] **Step 4: Extend the example verification-code flow**

Add `UPCode`, `UPCodeRef`, and `useRef` imports when not already present. Add these state/ref declarations beside the current `UPCodeInput` state:

```tsx
const codeRef = useRef<UPCodeRef>(null);
const [codePrompt, setCodePrompt] = useState('获取验证码');
```

Render a `UPButton` whose `text={codePrompt}` calls `codeRef.current?.start()`, plus:

```tsx
<UPCode
  changeText="X秒后重新获取"
  endText="重新获取验证码"
  onChange={setCodePrompt}
  ref={codeRef}
  seconds={10}
  startText="获取验证码"
/>
```

Place both next to the current `UPCodeInput`, then update the adjacent summary text to include `Code prompt: {codePrompt}`.

- [ ] **Step 5: Build and validate the example**

Run:

```powershell
npm run build
Push-Location example
npx tsc --noEmit
npm run lint
npm test -- --runInBand
Pop-Location
```

Expected: all commands exit `0`.

## Task 5: Complete Package Release Gate

**Files:**
- Verify only: all P23 source, test, docs, and example files

**Interfaces:**
- Consumes: completed Tasks 1–4.
- Produces: release-ready P23 without package artifact or dependency changes.

- [ ] **Step 1: Run the full validation commands**

Run these commands in order: `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check`.

Expected: every command exits `0`.

- [ ] **Step 2: Confirm package hygiene**

Run: `Test-Path ultra-ui-rn-0.1.0.tgz`, `rg -n -i 'async-storage|clipboard|u-code|UPCode' package.json package-lock.json`, and `git status --short`.

Expected: the tarball check is `False`; no `async-storage` or clipboard dependency appears; `UPCode` does not require a package entry; only expected existing dirty files and P23 work appear.

## Plan Self-Review

- Spec coverage: Tasks 1 and 3 cover source formatting, callback order, restart/reset, zero duration, unmount, ref methods, timer drift resistance, and persistence success/failure. Task 2 provides reactive defaults and exports. Task 4 documents headless ownership and adapter limitations. Task 5 runs full release gates.
- Placeholder scan: no `TODO`, `TBD`, or generic implementation instruction remains.
- Type consistency: `UPCodeStorage`, `UPCodeRef`, `UPCodeProps`, `storageKey`, `begin`, `start`, and `reset` are defined before use and retain the names used by tests and documentation.
