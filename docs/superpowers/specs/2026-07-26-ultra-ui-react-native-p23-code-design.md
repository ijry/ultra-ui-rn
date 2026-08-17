# P23 Code Countdown Design

**Goal:** Port uview-plus `u-code` as a headless React Native `UPCode` countdown component that preserves source callbacks, imperative controls, formatting, and optional continuity across remounts.

## Scope

- Add `UPCode`, `UPCodeProps`, `UPCodeRef`, and a small optional host storage adapter type.
- Preserve source `seconds`, `startText`, `changeText`, `endText`, `keepRunning`, `uniqueKey`, `onStart`, `onChange`, and `onEnd` behavior.
- Add reactive defaults through `UP.setConfig({ props: { code } })`.
- Add focused tests, documentation, a compatibility matrix row, and an example that combines `UPCode` with the existing `UPCodeInput`.
- Do not add a visual button, a clipboard integration, an `AsyncStorage` dependency, or any platform-specific native module.

## Public API

```tsx
export type UPCodeStorage = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

export type UPCodeRef = {
  start: () => void;
  reset: () => void;
};

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
```

`UPCode` renders `null`; applications own the control that calls `ref.current?.start()` and render the latest `onChange` text. `changeText` replaces its first `x` or `X` with the remaining whole seconds, matching the source replacement behavior.

## Countdown State Machine

The component begins idle and immediately emits `startText` after its initial persistence check. Calling `start()` always replaces a prior interval, resets the countdown from the latest `seconds` prop, emits `onStart`, and synchronously emits the formatted starting value. It then computes every remaining value from an absolute `deadlineMs`, not repeated decrement state, so timer delays cannot extend the countdown.

At the first tick after the deadline, the component clears its timer, removes the persisted deadline, emits `endText`, restores the initial seconds for a future run, and emits `onEnd`. `reset()` clears any timer and saved deadline, restores initial seconds, emits `endText`, and never emits `onEnd`. Calling `start()` while active starts a fresh full-duration countdown, just as the source clears its prior interval before starting again.

Inputs are normalized to a non-negative whole number. A zero-second start emits the initial formatted value, then completes on the next scheduled tick; this preserves source interval ordering without creating a busy loop.

## Persistence Adapter

The source uses `uni` storage with a `${uniqueKey}_$uCountDownTimestamp` key. React Native Core has no persistence API, so P23 accepts the optional application-owned `storage` adapter and uses the same suffix key.

When `keepRunning`, `uniqueKey`, and `storage` are all supplied, mount reads the stored absolute deadline. If it is still in the future, `UPCode` starts from the derived remaining seconds without emitting `onStart`; it immediately emits the formatted active text and continues toward that stored deadline. Expired, invalid, missing, or adapter-failed values are removed when possible and fall back to `startText` without throwing.

Starting a countdown writes the deadline asynchronously without blocking callbacks. Unmounting an active countdown retains its deadline; completion and `reset()` remove it. If `keepRunning` is true but `storage` or `uniqueKey` is absent, the component remains an in-memory countdown and does not warn or throw.

## React Lifecycle and Error Handling

All interval handles are held in refs and cleared on replacement, completion, reset, and unmount. Async storage effects use an `alive` flag so a late read cannot update an unmounted component. Storage errors are intentionally swallowed: persistence is an optional portability layer and must not compromise source countdown behavior.

Explicit props override reactive configured defaults. Changes to `seconds` while idle update the next start duration; changes while running do not mutate the active absolute deadline. Callback props are read from the latest render through refs so interval ticks do not call stale callbacks.

## Test Strategy

- Use Jest fake timers to assert initial, active, each-second, complete, restart, reset, and unmount cleanup semantics.
- Verify `changeText` substitutes both lowercase and uppercase markers once.
- Verify `UPCodeRef` methods and no visual host node requirement.
- Verify `UP.setConfig` defaults remain reactive and explicit props win.
- Verify async storage restores a still-active deadline, retains state across unmount, removes expired/completed/reset keys, and safely ignores adapter failures.
- Run focused tests, package typecheck/lint/build, example typecheck/lint/render test, full package tests, `npm pack --dry-run`, and `git diff --check`.
