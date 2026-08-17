# React Native P12 Copy Design

## Goal

Port `u-copy` from uview-plus 3.8.86 as `UPCopy`, preserving its source
content, feedback, child-content, and success-event behavior while exposing an
explicit React Native clipboard adapter.

## Scope

P12 adds only `UPCopy`. Index lists, native navigation, upload, picker, and
other deferred source components are out of scope.

## Source Contract

The source `u-copy` component renders a clickable wrapper around its default
`复制` label or slot content. It accepts:

- `content`, defaulting to an empty string;
- `alertStyle`, defaulting to `toast`, with `modal` selecting modal feedback;
- `notice`, defaulting to `复制成功`;
- a `success` event after clipboard writing succeeds.

When `content` is empty, source behavior shows `暂无` and stops. For non-empty
input it converts the value to a string, calls the platform clipboard API, then
shows either a toast or modal. Clipboard failures show `复制失败` and do not emit
the success event.

## React Native API

`UPCopy` exposes source-compatible names in PascalCase React conventions:

```tsx
export type UPCopyWriteText = (content: string) => void | Promise<void>;

export type UPCopyProps = {
  content?: string | number;
  alertStyle?: string;
  notice?: string;
  children?: React.ReactNode;
  writeText?: UPCopyWriteText;
  onSuccess?: () => void;
};
```

`writeText` is the explicit React Native adapter. React Native core 0.86 has no
clipboard-writing API, so applications supply their chosen clipboard library's
write operation per component:

```tsx
<UPCopy content={invoiceId} writeText={clipboard.setString}>
  <UPText text="Copy invoice ID" />
</UPCopy>
```

The adapter remains optional in the type so the component can render during
migration. Pressing a component without it follows the failure path instead of
claiming to have copied content; development builds issue a warning naming the
missing adapter.

`alertStyle` accepts the source string shape. Only exactly `modal` chooses
modal feedback; all other values use toast feedback, matching the upstream
branch.

## Rendering and Data Flow

`UPCopy` renders a native `Pressable`. `children` replaces the source default
label; without children the component renders `复制` in a native `Text` node.
Source `customClass` is retained as a typed CSS-runtime no-op. Native wrapper
styling is intentionally minimal because upstream has no component-specific
CSS.

On press, the component performs this sequence:

1. Resolve `{ ...useUPConfig().props.copy, ...input }`.
2. Treat `''`, `null`, and `undefined` content as empty; call
   `UP.toast.default('暂无')` and return without invoking an adapter.
3. Convert all other content values with `String(content)`.
4. Require `writeText`, invoke it, and await its result through
   `Promise.resolve`.
5. On success, invoke `onSuccess()` once, then show `notice` with
   `UP.toast.default` unless `alertStyle === 'modal'`.
6. For modal feedback, set internal visibility and render `UPModal` with a
   single confirm action. Confirming or closing the modal clears that local
   visibility.
7. On a missing adapter, synchronous exception, or rejected promise, emit one
   development warning for the missing adapter when applicable and call
   `UP.toast.default('复制失败')`. Do not call `onSuccess` or open a success
   modal.

The source uses `uni.showModal({ title: 'up.common.tip' })`; P12 renders the
same literal source title for the success modal rather than inventing a locale
runtime not present in this package.

## Defaults and Config Reactivity

`sourceDefaults.props.copy` and the public `UPProps['copy']` table contain:

```ts
copy: Object.freeze({
  content: '',
  alertStyle: 'toast',
  notice: '复制成功',
})
```

`createSourceState` and `setUPConfig` clone and shallow-merge this table, like
all other component defaults. `UPCopy` uses `useUPConfig`, so a mounted
component updates its source defaults after:

```ts
UP.setConfig({ props: { copy: { notice: 'Copied' } } });
```

Explicit component props continue to take precedence over global defaults.

## Error Handling and Feedback Constraints

The component delegates toast presentation to the existing host-backed
`UP.toast` API. Consequently, a visible toast requires an ancestor `UPRoot`;
before a root mounts, feedback follows the library-wide safe no-op behavior.
The modal likewise requires the overlay provider supplied by `UPRoot`.

No clipboard dependency will be added. No fallback writes to a text input,
Linking API, or undocumented native module will be attempted. This prevents a
successful callback or notice from misrepresenting a failed copy operation.

## Test Plan

Add `tests/components/UPCopy.test.tsx` using `UPRoot` and a mocked `writeText`.
Tests cover:

- default child label and source defaults;
- stringification, adapter invocation, success toast, and one `onSuccess` call;
- `modal` success feedback and its native close action;
- empty-content early return without adapter invocation;
- synchronous adapter exception and rejected adapter promise showing failure
  feedback without a success event;
- missing-adapter failure behavior and development warning;
- an already-mounted instance updating its default `notice` after
  `UP.setConfig`.

The implementation gate runs the focused suite, the complete Jest suite,
TypeScript, lint, build, package dry run, diff check, and the example's
TypeScript, lint, and Jest checks.

## Documentation and Compatibility Record

`README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and `example/App.tsx`
will add `UPCopy` and show a simple application-owned `writeText` adapter.
The compatibility matrix will mark source props and outcomes as emulated and
record the adapter requirement, unavailable `uni.setClipboardData`, source CSS
classes, and non-native `uni.showToast` / `uni.showModal` APIs as explicit
React Native differences.

## Acceptance Criteria

- `UPCopy` is exported through the package root and uses the `UP*` convention.
- Source defaults and `UP.setConfig({ props: { copy } })` are reactive.
- No adapter invocation occurs for empty content.
- A successful adapter call emits `onSuccess` exactly once and shows the
  requested feedback mode.
- Missing, throwing, and rejecting adapters never emit success feedback or
  `onSuccess`.
- No new runtime dependency is introduced.
- All documented quality gates pass.
