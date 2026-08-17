# React Native P6 Display-State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port source-compatible link, alert, avatar-group, subsection, collapse, and steps display-state components without adding third-party native dependencies.

**Architecture:** Independent surfaces (`UPLink`, `UPAlert`, `UPAvatarGroup`, `UPSubsection`) resolve defaults through the subscribable `UP.props` store. Parent-child component families use React context: collapse provides controlled multi/accordion selection to `UPCollapseItem`, and steps injects source index/status data into `UPStepsItem`. All styling uses React Native core Views, Text, Pressable, and Animated-compatible visibility.

**Tech Stack:** React 19, React Native 0.86 core components, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults/events and use `UP*` PascalCase exports.
- Add all default tables to `UP.props` and merge overrides in `setUPConfig`.
- Convert source dimensions through `getPx`; retain unavailable source properties as documented no-ops.
- Do not add third-party native UI dependencies.

---

### Task 1: Link, Alert, Avatar Group, and Subsection

**Files:**
- Create: `src/components/link/UPLink.tsx`, `src/components/link/index.ts`, `src/components/alert/UPAlert.tsx`, `src/components/alert/index.ts`, `src/components/avatar-group/UPAvatarGroup.tsx`, `src/components/avatar-group/index.ts`, `src/components/subsection/UPSubsection.tsx`, `src/components/subsection/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPDisplayState.test.tsx`

**Interfaces:**
- `UPLinkProps` retains source link props and invokes `onClick` after app-owned native linking.
- `UPAlertProps` supports source `modelValue`/`value`, close lifecycle, duration, theme type/effect, and controlled callbacks.
- `UPAvatarGroupProps` supports source overlap, URL object extraction, count limit, and `onShowMore`.
- `UPSubsectionProps` supports source list keys, modes, controlled current aliases, disabled state, and `onChange`.

- [ ] **Step 1: Write failing source-behavior tests**

```tsx
fireEvent.press(screen.getByTestId('up-alert-close'));
expect(onUpdateModelValue).toHaveBeenCalledWith(false);
fireEvent.press(screen.getByTestId('up-subsection-item-1'));
expect(onChange).toHaveBeenCalledWith(1);
```

- [ ] **Step 2: Run the focused suite to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPDisplayState.test.tsx`

Expected: FAIL because P6 exports are unavailable.

- [ ] **Step 3: Implement defaults, config merge paths, components, and exports**

```tsx
const current = input.current ?? props.current;
const active = current === index;
return <Pressable disabled={props.disabled} onPress={() => input.onChange?.(index)} />;
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPDisplayState.test.tsx && npm run typecheck`

Expected: PASS.

### Task 2: Collapse Parent/Child Controls

**Files:**
- Create: `src/components/collapse/context.ts`, `src/components/collapse/UPCollapse.tsx`, `src/components/collapse/UPCollapseItem.tsx`, `src/components/collapse/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPDisplayState.test.tsx`

**Interfaces:**
- `UPCollapseProps` retains source accordion, value/modelValue, border, and change callbacks.
- `UPCollapseItemProps` retains title, name, icon, disabled, arrow, duration, and item click/change behavior.

- [ ] **Step 1: Extend the focused suite with selection cases**

```tsx
fireEvent.press(screen.getByTestId('up-collapse-item-a'));
expect(onChange).toHaveBeenCalledWith([
  { name: 'a', status: 'open' },
  { name: 'b', status: 'close' },
]);
```

- [ ] **Step 2: Run the focused suite to verify it fails**

Run: `npm test -- --runInBand tests/components/UPDisplayState.test.tsx`

Expected: FAIL because collapse components are unavailable.

- [ ] **Step 3: Implement React context selection and source presentation**

```tsx
const next = accordion ? name : selected.includes(name) ? selected.filter((value) => value !== name) : [...selected, name];
input.onChange?.(next);
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPDisplayState.test.tsx && npm run typecheck`

Expected: PASS.

### Task 3: Steps Parent/Child Status Rendering

**Files:**
- Create: `src/components/steps/context.ts`, `src/components/steps/UPSteps.tsx`, `src/components/steps/UPStepsItem.tsx`, `src/components/steps/index.ts`
- Modify: `src/config/defaults.ts`, `src/config/store.ts`, `src/components/index.ts`
- Test: `tests/components/UPDisplayState.test.tsx`

**Interfaces:**
- `UPStepsProps` retains source direction, current, active/inactive colors and icons, and dot mode.
- `UPStepsItemProps` retains source title, desc, iconSize, error, slots as React nodes, and item style.

- [ ] **Step 1: Extend focused tests with finish/process/error assertions**

```tsx
expect(screen.getByTestId('up-steps-item-0')).toHaveProp('accessibilityState', { selected: false });
expect(screen.getByTestId('up-steps-item-1-error')).toBeTruthy();
```

- [ ] **Step 2: Run the focused suite to verify it fails**

Run: `npm test -- --runInBand tests/components/UPDisplayState.test.tsx`

Expected: FAIL because step exports are unavailable.

- [ ] **Step 3: Implement source status precedence and layout direction**

```tsx
const status = item.error ? 'error' : index < current ? 'finish' : index === current ? 'process' : 'wait';
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `npm test -- --runInBand tests/components/UPDisplayState.test.tsx && npm run typecheck`

Expected: PASS.

### Task 4: Documentation, Example, and Quality Gates

**Files:**
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx`
- Test: root and example suites

- [ ] **Step 1: Add display-state reference examples**

```tsx
<UPCollapse value={openNames} onChange={setOpenNames}>
  <UPCollapseItem name="profile" title="Profile">Details</UPCollapseItem>
</UPCollapse>
<UPSteps current={1}><UPStepsItem title="Packed" /></UPSteps>
```

- [ ] **Step 2: Document React Native emulations and retained no-ops**

Document app-owned linking, transition differences, and ReactNode replacements for source slots.

- [ ] **Step 3: Run library quality gates**

Run: `npm test -- --runInBand && npm run typecheck && npm run lint && npm run build && npm pack --dry-run && git diff --check`

Expected: all commands exit zero.

- [ ] **Step 4: Run example quality gates**

Run: `npx tsc --noEmit && npm run lint && npm test -- --runInBand`

Expected: all commands exit zero.
