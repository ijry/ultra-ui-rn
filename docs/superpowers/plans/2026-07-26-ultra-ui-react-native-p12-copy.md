# React Native P12 Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `u-copy` as `UPCopy` with source feedback behavior and an explicit React Native clipboard-write adapter.

**Architecture:** `UPCopy` is a native `Pressable` that reads reactive source defaults from `useUPConfig`, delegates clipboard writing to a supplied `writeText` adapter, and invokes existing host-backed toast/modal feedback. A `copy` config table is cloned and shallow-merged so unoverridden mounted instances react to `UP.setConfig()`.

**Tech Stack:** React 19, React Native 0.86 `Pressable`/`Text`, TypeScript 5.9, existing `UPRoot`/`UPModal`/`UP.toast`, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a worktree or commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults and use `UP*` PascalCase exports.
- Add source default tables to subscribable `UP.props` and merge overrides in `setUPConfig`, so mounted components react to `UP.setConfig()`.
- Do not add clipboard or other third-party runtime dependencies.
- `UPCopy.writeText(content)` is an application-owned adapter because React Native core has no clipboard-write API.
- Retain CSS class props as typed no-ops; do not represent source `uni` platform APIs as native behavior.

---

## File Structure

- `src/components/copy/UPCopy.tsx` — native press target, clipboard-adapter flow, feedback, and public props.
- `src/components/copy/index.ts` — copy component barrel export.
- `src/components/index.ts` — root component barrel export.
- `src/config/defaults.ts` — `UPCopyDefaults`, `UPProps['copy']`, and source defaults.
- `src/config/store.ts` — copy override type plus clone and merge paths.
- `tests/components/UPCopy.test.tsx` — source behavior and error-path regression coverage.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx` — usage and compatibility documentation.

### Task 1: Establish Failing `UPCopy` Behavior Tests

**Files:**
- Create: `tests/components/UPCopy.test.tsx`

**Interfaces:**
- Consumes planned `UP`, `UPCopy`, `UPRoot`, and `UPCopyWriteText` exports from `../../src`.
- Requires `UPCopyProps.content?: string | number`, `alertStyle?: string`, `notice?: string`, `children?: React.ReactNode`, `writeText?: (content: string) => void | Promise<void>`, `onSuccess?: () => void`, and deprecated `customClass?: string`.
- Requires test IDs `up-copy` and `up-copy-default-label`; `UPModal` already owns `up-modal` and `up-modal-confirm`.

- [ ] **Step 1: Write source success, modal, and empty-content tests**

```tsx
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UP, UPCopy, UPRoot, type UPCopyWriteText } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders the source label, stringifies content, and emits success after copying', async () => {
  const writeText: UPCopyWriteText = jest.fn();
  const onSuccess = jest.fn();
  const screen = renderRoot(<UPCopy content={42} onSuccess={onSuccess} writeText={writeText} />);

  expect(screen.getByTestId('up-copy-default-label').props.children).toBe('复制');
  fireEvent.press(screen.getByTestId('up-copy'));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith('42'));
  expect(onSuccess).toHaveBeenCalledTimes(1);
  expect(screen.getByText('复制成功')).toBeTruthy();
});

it('uses a source modal notice when alertStyle is modal', async () => {
  const screen = renderRoot(<UPCopy alertStyle="modal" content="invoice-7" writeText={jest.fn()} />);

  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByTestId('up-modal')).toBeTruthy());
  fireEvent.press(screen.getByTestId('up-modal-confirm'));
  expect(screen.queryByTestId('up-modal')).toBeNull();
});

it('does not invoke the adapter when source content is empty', async () => {
  const writeText = jest.fn();
  const screen = renderRoot(<UPCopy content="" writeText={writeText} />);

  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('暂无')).toBeTruthy());
  expect(writeText).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Write failure and reactive-default tests**

```tsx
it('reports adapter failures without emitting success and warns for a missing adapter', async () => {
  const throwingWriteText = jest.fn(() => {
    throw new Error('native clipboard unavailable');
  });
  const rejectingWriteText = jest.fn(() => Promise.reject(new Error('clipboard rejected')));
  const onSuccess = jest.fn();
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = renderRoot(<UPCopy content="first" onSuccess={onSuccess} writeText={throwingWriteText} />);

  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('复制失败')).toBeTruthy());
  expect(onSuccess).not.toHaveBeenCalled();

  screen.rerender(<UPRoot><UPCopy content="second" onSuccess={onSuccess} writeText={rejectingWriteText} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(rejectingWriteText).toHaveBeenCalledWith('second'));
  expect(onSuccess).not.toHaveBeenCalled();

  screen.rerender(<UPRoot><UPCopy content="third" onSuccess={onSuccess} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('复制失败')).toBeTruthy());
  expect(warning).toHaveBeenCalledWith(expect.stringContaining('writeText'));
  expect(onSuccess).not.toHaveBeenCalled();
  warning.mockRestore();
});

it('reacts to mounted global defaults while explicit props retain precedence', async () => {
  const writeText = jest.fn();
  const screen = renderRoot(<UPCopy content="receipt" writeText={writeText} />);

  act(() => {
    UP.setConfig({ props: { copy: { notice: 'Copied' } } });
  });
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('Copied')).toBeTruthy());

  screen.rerender(<UPRoot><UPCopy content="receipt" notice="Fixed message" writeText={writeText} /></UPRoot>);
  fireEvent.press(screen.getByTestId('up-copy'));
  await waitFor(() => expect(screen.getByText('Fixed message')).toBeTruthy());
});
```

- [ ] **Step 3: Run the focused suite to confirm missing exports**

Run: `npm test -- --runInBand tests/components/UPCopy.test.tsx`

Expected: FAIL because `UPCopy` and `UPCopyWriteText` are unavailable from `../../src`.

### Task 2: Add Config Defaults and Implement the Copy Adapter Surface

**Files:**
- Create: `src/components/copy/UPCopy.tsx`
- Create: `src/components/copy/index.ts`
- Modify: `src/config/defaults.ts:466-547`
- Modify: `src/config/defaults.ts:940-943`
- Modify: `src/config/store.ts:14-104`
- Modify: `src/config/store.ts:157-178`
- Modify: `src/config/store.ts:225-268`
- Modify: `src/components/index.ts`

**Interfaces:**
- Produces `UPCopyWriteText = (content: string) => void | Promise<void>`.
- Produces exported `UPCopyProps` and `UPCopy`.
- Adds `UPCopyDefaults = { content: string; alertStyle: string; notice: string }`.
- Adds `UPProps['copy']` and `UPConfigOverrides['props']['copy']` merge support.

- [ ] **Step 1: Add source defaults and all config state paths**

Add this definition immediately after `UPFloatButtonDefaults`, then add `copy`
to the `UPProps` object type:

```ts
export type UPCopyDefaults = {
  content: string;
  alertStyle: string;
  notice: string;
};

// Inside UPProps
copy: UPCopyDefaults;
```

Add the source defaults after `floatButton`:

```ts
copy: Object.freeze({
  content: '',
  alertStyle: 'toast',
  notice: '复制成功',
}),
```

Add these three matching entries alongside the existing P11 config entries:

```ts
// UPConfigOverrides['props']
copy?: Partial<UPProps['copy']>;

// createSourceState().props
copy: { ...sourceDefaults.props.copy },

// setUPConfig().props
copy: { ...state.props.copy, ...overrides.props?.copy },
```

- [ ] **Step 2: Implement native wrapper, feedback, and adapter errors**

Create `src/components/copy/UPCopy.tsx`:

```tsx
import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { toast } from '../../feedback';
import { UPModal } from '../modal';

export type UPCopyWriteText = (content: string) => void | Promise<void>;

export type UPCopyProps = {
  content?: string | number;
  alertStyle?: string;
  notice?: string;
  children?: React.ReactNode;
  writeText?: UPCopyWriteText;
  onSuccess?: () => void;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPCopy(input: UPCopyProps): React.JSX.Element {
  const props = { ...useUPConfig().props.copy, ...input } as UPCopyProps;
  const [showModal, setShowModal] = useState(false);
  const handlePress = async () => {
    const content = props.content;
    if (content === '' || content === null || content === undefined) {
      toast.default('暂无');
      return;
    }
    if (!input.writeText) {
      if (__DEV__) console.warn('UPCopy requires a writeText adapter to copy content.');
      toast.default('复制失败');
      return;
    }
    try {
      await Promise.resolve(input.writeText(String(content)));
      input.onSuccess?.();
      if (props.alertStyle === 'modal') setShowModal(true);
      else toast.default(props.notice ?? '');
    } catch {
      toast.default('复制失败');
    }
  };

  return (
    <>
      <Pressable accessibilityRole="button" onPress={handlePress} testID="up-copy">
        {input.children ?? <Text testID="up-copy-default-label">复制</Text>}
      </Pressable>
      <UPModal content={props.notice} onChangeShow={setShowModal} show={showModal} title="up.common.tip" />
    </>
  );
}
```

Create the local barrel and add it to the public component barrel:

```ts
// src/components/copy/index.ts
export * from './UPCopy';

// src/components/index.ts
export * from './copy';
```

Use `input.writeText` and `input.onSuccess` for callbacks. Presentation values
must come from merged `props`, so source config stays data-only and reactive.

- [ ] **Step 3: Run focused validation**

Run: `npm test -- --runInBand tests/components/UPCopy.test.tsx && npm run typecheck`

Expected: PASS with source labels, sync/async adapter outcomes, modal close,
and mounted `UP.setConfig()` updates.

### Task 3: Document the Adapter and Provide a Dependency-Free Example

**Files:**
- Modify: `README.md:24-67`
- Modify: `docs/compatibility.md` after the P11 utility-surfaces section
- Modify: `docs/gap-matrix.md` before `## Deferred Source Components`
- Modify: `example/App.tsx:8-87`
- Modify: `example/App.tsx:281-292`

**Interfaces:**
- Documents `writeText(content): void | Promise<void>` as an application-owned adapter.
- Documents source `success` as `onSuccess`.
- Adds no clipboard package, native module, or platform shim to the package or example.

- [ ] **Step 1: Add a P12 README link and component summary**

Insert beside existing plan links and phase summaries:

```markdown
- [P12 copy plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p12-copy.md)

P12 adds `UPCopy` with source feedback modes and an explicit application-owned
clipboard adapter.
```

- [ ] **Step 2: Add compatibility guide and matrix entries**

Append this user-facing guide section:

````markdown
## P12 copy

`UPCopy` preserves `content`, `alertStyle`, `notice`, its default child label,
and source success behavior through `onSuccess`. React Native core has no
clipboard API, so applications pass their writer via `writeText`; it may return
either `void` or a promise.

```tsx
<UPCopy content={invoiceId} writeText={clipboard.setString} onSuccess={() => UP.toast.success('Invoice ID copied')}>
  <UPText text="Copy invoice ID" />
</UPCopy>
```

Empty content reports `暂无`; missing, throwing, or rejecting writers report
`复制失败` and never call `onSuccess`. `alertStyle="modal"` maps to `UPModal`; all
other source strings use host-backed `UP.toast`. The package adds no native
clipboard dependency. Source `uni.setClipboardData`, `uni.showToast`,
`uni.showModal`, and CSS classes are not React Native core APIs.
````

Add a `## P12 Copy` matrix section before deferred components:

```markdown
| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-copy` | `content`, `alertStyle`, `notice`, default/slot label, `success` | `UPCopy`, React children, `onSuccess` | Source empty/success/failure feedback and modal-or-toast branch are preserved | Emulated | `tests/components/UPCopy.test.tsx` |
| `u-copy` | `uni.setClipboardData` | Required `writeText(content)` application adapter | Core RN has no clipboard API; missing or failing adapters report source failure feedback without success | Host adapter | `tests/components/UPCopy.test.tsx` |
| `u-copy` | `uni.showToast`, `uni.showModal`, CSS classes | `UP.toast`, `UPModal`, retained `customClass` | Native feedback surfaces replace uni APIs; CSS class resolution is unavailable | No-op retained | `src/components/copy/UPCopy.tsx` |
```

- [ ] **Step 3: Add a compile-safe demonstration adapter**

Import `UPCopy`, add `const [copiedValue, setCopiedValue] = useState('');`, and
define this function in `App`:

```tsx
const demoWriteText = (value: string) => {
  setCopiedValue(value);
};
```

Render it in the utility-surfaces example:

```tsx
<UPCopy content="INV-2026-0007" onSuccess={() => UP.toast.success('Copy adapter completed')} writeText={demoWriteText}>
  <UPButton plain text="Copy demo invoice" />
</UPCopy>
<Text>Demo adapter received: {copiedValue || 'nothing yet'}</Text>
```

Do not import a clipboard package or represent `demoWriteText` as an OS write.

- [ ] **Step 4: Run docs and example checks**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
Push-Location example
npx tsc --noEmit
npm run lint
npm test -- --runInBand
Pop-Location
```

Expected: every command exits zero.

### Task 4: Run the P12 Full Quality Gate

**Files:**
- Verify: all files from Tasks 1–3

**Interfaces:**
- Verifies the package root declaration exports both `UPCopy` and `UPCopyWriteText`.
- Verifies no new runtime package is needed for P12.

- [ ] **Step 1: Run library validation**

Run each command in order:

```powershell
npm test -- --runInBand
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: all suites and checks pass, packaging succeeds, and the diff has no
whitespace errors.

- [ ] **Step 2: Review P12 scope without disturbing pre-existing work**

Run:

```powershell
git status --short
git diff -- docs/superpowers/specs/2026-07-26-ultra-ui-react-native-p12-copy-design.md docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p12-copy.md src/components/copy src/config/defaults.ts src/config/store.ts src/components/index.ts tests/components/UPCopy.test.tsx README.md docs/compatibility.md docs/gap-matrix.md example/App.tsx
```

Expected: summarize planned P12 changes only. Do not reset, clean, or delete
the intentionally dirty project workspace.

## Plan Self-Review

- **Spec coverage:** Task 1 covers source labels, conversion, feedback mode,
  empty content, sync/async/missing adapter errors, and global default updates.
  Task 2 implements the public component and reactive config plumbing. Task 3
  documents each adapter and platform difference and gives a dependency-free
  example. Task 4 runs every acceptance gate specified by the design.
- **Placeholder scan:** Every task contains exact file paths, public interfaces,
  code values, and commands. No task relies on unspecified future work.
- **Type consistency:** `UPCopyWriteText`, `UPCopyProps`, `UPCopyDefaults`,
  `UPProps['copy']`, `UPConfigOverrides['props']['copy']`, `writeText`, and
  `onSuccess` have the same spelling and signatures throughout the plan.
