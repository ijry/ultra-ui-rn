# React Native P11 Utility Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `u-agreement`, `u-no-network`, and `u-float-button` with source defaults, source event payloads, and explicit React Native adapters for unavailable platform behavior.

**Architecture:** `UPAgreement` is an imperative ref-driven wrapper around the existing `UPModal`, preserving the source `showModal()` contract while mapping agreement URLs to application-owned press callbacks. `UPNoNetwork` maps the source overlay to `UPOverlay`, but consumes an explicit native `connected` adapter because React Native core has no network status API. `UPFloatButton` uses absolute native layout plus core press targets to preserve source menu toggling and item payloads.

**Tech Stack:** React 19, React Native 0.86 core View/Text/Pressable, existing `UPModal`, `UPOverlay`, `UPButton`, and `UPIcon`; TypeScript 5.9; Jest; React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a worktree or commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults and use `UP*` PascalCase exports.
- Add all default tables to subscribable `UP.props` and merge overrides in `setUPConfig`, so mounted components react to `UP.setConfig()`.
- Convert source dimensions through `getPx`; retain unavailable source properties as documented no-ops.
- Do not add third-party native UI dependencies.
- `UPAgreement.showModal()` is exposed through a typed React ref; the source quit-app close action becomes an optional application callback.
- `UPNoNetwork` requires the React Native-only `connected?: boolean` adapter; the source automatic `uni` network listener is unavailable in React Native core.

---

### Task 1: Agreement Modal and Source Defaults

**Files:**
- Create: `src/components/agreement/UPAgreement.tsx`, `src/components/agreement/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPUtilitySurfaces.test.tsx`

**Interfaces:**
- Produces `UPAgreementRef` with `showModal(): void` and `close(): void`.
- Produces `UPAgreementProps` with source `urlProtocol` and `urlPrivacy`, plus `children`, `onConfirm(value: 1)`, `onClose`, `onProtocolPress(url)`, and `onPrivacyPress(url)`.
- Adds `UPProps['agreement']` with source URL defaults and a partial `UPConfigOverrides['props']['agreement']` merge path.

- [ ] **Step 1: Write the failing agreement ref/event test**

```tsx
it('opens the source agreement modal through its ref and maps agreement actions', () => {
  const ref = createRef<UPAgreementRef>();
  const onConfirm = jest.fn();
  const onProtocolPress = jest.fn();
  const screen = renderRoot(
    <UPAgreement ref={ref} onConfirm={onConfirm} onProtocolPress={onProtocolPress} />,
  );

  act(() => ref.current?.showModal());
  fireEvent.press(screen.getByTestId('up-agreement-protocol'));
  expect(onProtocolPress).toHaveBeenCalledWith('/pages/user_agreement/agreement/info?title=用户协议');
  fireEvent.press(screen.getByTestId('up-modal-confirm'));
  expect(onConfirm).toHaveBeenCalledWith(1);
  expect(screen.queryByTestId('up-modal')).toBeNull();
});
```

- [ ] **Step 2: Run the focused suite to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPUtilitySurfaces.test.tsx`

Expected: FAIL because `UPAgreement` is unavailable.

- [ ] **Step 3: Add source defaults and the ref-driven modal adapter**

```tsx
export const UPAgreement = forwardRef<UPAgreementRef, UPAgreementProps>(function UPAgreement(input, ref) {
  const props = { ...useUPConfig().props.agreement, ...input };
  const [show, setShow] = useState(false);
  const close = () => {
    setShow(false);
    input.onClose?.();
  };
  useImperativeHandle(ref, () => ({ close, showModal: () => setShow(true) }), [close]);
  return <UPModal show={show} showCancelButton onCancel={close} onConfirm={() => {
    setShow(false);
    input.onConfirm?.(1);
  }} />;
});
```

Render the source default content with native inline `Text` and two accessible press targets for protocol and privacy URLs. Do not open source route strings automatically; `onProtocolPress` and `onPrivacyPress` let the application own its React Navigation/deep-link policy. Pass React `children` through as the agreement content replacement.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPUtilitySurfaces.test.tsx && npm run typecheck`

Expected: PASS.

### Task 2: Explicit No-Network Overlay and Expandable Float Button

**Files:**
- Create: `src/components/no-network/UPNoNetwork.tsx`, `src/components/no-network/index.ts`, `src/components/float-button/UPFloatButton.tsx`, `src/components/float-button/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPUtilitySurfaces.test.tsx`

**Interfaces:**
- Produces `UPNoNetworkProps` with source `tips`, `zIndex`, `image`, React Native adapter `connected?: boolean`, and source callbacks `onRetry`, `onDisconnected`, and `onConnected`.
- Produces `UPFloatButtonItem` with source-style `name`, optional `backgroundColor`, `color`, `borderColor`, and arbitrary extra keys.
- Produces `UPFloatButtonProps` with source `backgroundColor`, `color`, `width`, `height`, `borderColor`, `right`, `top`, `bottom`, `isMenu`, `list`, `children`, `listContent`, `onClick`, and `onItemClick(itemWithIndex)`.
- Adds `UPProps['noNetwork']` and `UPProps['floatButton']`, with corresponding override merge paths.

- [ ] **Step 1: Extend the focused suite with network and menu behavior**

```tsx
it('renders an explicit disconnected source overlay and maps retry or state callbacks', () => {
  const onRetry = jest.fn();
  const onDisconnected = jest.fn();
  const screen = renderRoot(<UPNoNetwork connected={false} onDisconnected={onDisconnected} onRetry={onRetry} />);
  expect(screen.getByTestId('up-no-network')).toBeTruthy();
  expect(onDisconnected).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId('up-no-network-retry'));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it('toggles source float-button menus and emits indexed item payloads', () => {
  const onClick = jest.fn();
  const onItemClick = jest.fn();
  const screen = renderRoot(
    <UPFloatButton isMenu list={[{ name: 'edit' }, { name: 'delete' }]} onClick={onClick} onItemClick={onItemClick} />,
  );
  fireEvent.press(screen.getByTestId('up-float-button-main'));
  expect(onClick).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId('up-float-button-item-1'));
  expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ index: 1, name: 'delete' }));
});
```

- [ ] **Step 2: Run the focused suite to verify core components fail**

Run: `npm test -- --runInBand tests/components/UPUtilitySurfaces.test.tsx`

Expected: FAIL because `UPNoNetwork` and `UPFloatButton` are unavailable.

- [ ] **Step 3: Implement source surfaces and explicit native adapters**

```tsx
useEffect(() => {
  if (input.connected === false) input.onDisconnected?.();
  else input.onConnected?.();
}, [input.connected, input.onConnected, input.onDisconnected]);

const pressMain = () => {
  if (props.isMenu) setShowList((current) => !current);
  input.onClick?.();
};

const itemPayload = (item: UPFloatButtonItem, index: number) => ({ ...item, index });
```

`UPNoNetwork` renders nothing unless `connected === false`, then uses `UPOverlay` with the source white surface, image-or-`wifi-off` icon fallback, tips, and a plain mini retry button. Do not add a fake automatic network listener. `UPFloatButton` is an absolute positioned source-size circle; when `isMenu` is true it toggles its list while still emitting click. Default items render source icons and remain open after selection, matching upstream behavior. `children` replaces the default main icon and `listContent` replaces the generated item list.

- [ ] **Step 4: Run focused tests, typecheck, and lint**

Run: `npm test -- --runInBand tests/components/UPUtilitySurfaces.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

### Task 3: Documentation, Example, and Quality Gates

**Files:**
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx`
- Test: root and example suites

**Interfaces:**
- Documents agreement ref usage, application-owned URL routing, the `connected` no-network adapter, source events, float button render replacements, and retained no-op differences.

- [ ] **Step 1: Add source surface examples**

```tsx
const agreementRef = useRef<UPAgreementRef>(null);
const [connected, setConnected] = useState(false);

<UPButton text="Read agreement" onClick={() => agreementRef.current?.showModal()} />
<UPAgreement ref={agreementRef} onConfirm={() => UP.toast.success('Accepted')} />
<UPNoNetwork connected={connected} onRetry={() => setConnected(true)} />
<UPFloatButton isMenu list={[{ name: 'edit' }, { name: 'share' }]} onItemClick={trackAction} />
```

- [ ] **Step 2: Document React Native compatibility limits**

Document that `UPAgreement` maps `showModal()` to `UPAgreementRef`, source URLs are emitted to callbacks rather than navigated automatically, and its source quit-app cancel action becomes `onClose`. Document that `UPNoNetwork` requires an explicit `connected` value because core React Native has no network-status subscription. Document that `UPFloatButton` uses absolute parent-relative layout rather than CSS fixed positioning; source CSS classes and style strings are no-ops.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all commands exit zero.

- [ ] **Step 4: Run example quality gates**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: all commands exit zero.
