# React Native P13 Choose Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `u-choose` as `UPChoose` with source-compatible single-index selection, tag rendering, custom-click behavior, and reactive source defaults.

**Architecture:** `UPChoose` owns a local source-style `currentIndex`, synchronizes it from merged `modelValue`, and renders default choices with the existing `UPTag`. Wrapped choices use a flex `View`; no-wrap choices use a core horizontal `ScrollView`. The selected predicate deliberately uses upstream's `index == currentIndex` coercion semantics rather than a strict comparison.

**Tech Stack:** React 19, React Native 0.86 `View`/`ScrollView`/`Pressable`, existing `UPTag`, TypeScript 5.9, Jest, React Native Testing Library.

## Global Constraints

- Work directly on `main`; the user explicitly granted this authorization. Do not create a worktree or commit.
- Source of truth: uview-plus 3.8.86 at `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus`.
- Preserve source props/defaults and use `UP*` PascalCase exports.
- Add source default tables to subscribable `UP.props` and merge overrides in `setUPConfig`, so mounted components react to `UP.setConfig()`.
- Preserve upstream `index == currentIndex` coercion: `modelValue="1"` selects index `1`, and `modelValue=false` selects index `0`.
- Do not reinterpret `type` or `valueName` as multiselect behavior; retain them as source-compatible inactive props.
- Do not add third-party native UI dependencies. React `renderItem` replaces the Vue scoped slot.
- Retain CSS class props as typed no-ops; do not commit, reset, clean, or delete pre-existing worktree files.

---

## File Structure

- `src/components/choose/UPChoose.tsx` — public props, source selection state, default `UPTag` rendering, native no-wrap scroll, and render callback adapter.
- `src/components/choose/index.ts` — local export barrel.
- `src/components/index.ts` — public package export.
- `src/config/defaults.ts` — `UPChooseOption`, `UPChooseDefaults`, `UPProps['choose']`, source defaults.
- `src/config/store.ts` — override type plus source-state copy and merge paths.
- `tests/components/UPChoose.test.tsx` — source-selection and rendering regression tests.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, `example/App.tsx` — public API, constraints, and native usage example.

### Task 1: Establish Failing Source-Compatibility Tests

**Files:**
- Create: `tests/components/UPChoose.test.tsx`

**Interfaces:**
- Consumes planned package exports `UP`, `UPChoose`, `UPChooseOption`, and `UPRoot` from `../../src`.
- Requires test IDs `up-choose`, `up-choose-option-{index}`, `up-choose-scroll`, and `up-choose-item-{index}`.
- Requires `UPChooseProps` fields `options`, `modelValue`, `type`, `itemWidth`, `itemHeight`, `itemPadding`, `labelName`, `valueName`, `customClick`, `wrap`, `renderItem`, `onUpdateModelValue`, and `onCustomClick`.

- [ ] **Step 1: Write source selected-state and ordinary-click tests**

```tsx
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { UP, UPChoose, UPRoot, type UPChooseOption } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

const options: readonly UPChooseOption[] = [
  { title: 'One', value: 'one' },
  { title: 'Two', value: 'two' },
  { title: 'Three', value: 'three' },
];

it('renders source tags and preserves loose current-index comparison', () => {
  const screen = renderRoot(<UPChoose modelValue={false} options={options} />);

  expect(screen.getByText('One')).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#ffffff' }),
  );

  screen.rerender(<UPRoot><UPChoose modelValue="1" options={options} /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );

  screen.rerender(<UPRoot><UPChoose modelValue={['1']} options={options} /></UPRoot>);
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-1').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
});

it('updates local source selection and emits the numeric index on ordinary presses', () => {
  const onUpdateModelValue = jest.fn();
  const screen = renderRoot(<UPChoose modelValue={0} onUpdateModelValue={onUpdateModelValue} options={options} />);

  fireEvent.press(screen.getByTestId('up-choose-option-2'));

  expect(onUpdateModelValue).toHaveBeenCalledWith(2);
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-2').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
});
```

- [ ] **Step 2: Add custom-click, custom rendering, and source layout tests**

```tsx
it('emits custom-click without changing local selection or a model callback', () => {
  const onCustomClick = jest.fn();
  const onUpdateModelValue = jest.fn();
  const screen = renderRoot(
    <UPChoose customClick modelValue={0} onCustomClick={onCustomClick} onUpdateModelValue={onUpdateModelValue} options={options} />,
  );

  fireEvent.press(screen.getByTestId('up-choose-option-1'));

  expect(onCustomClick).toHaveBeenCalledWith(1);
  expect(onUpdateModelValue).not.toHaveBeenCalled();
  expect(StyleSheet.flatten(screen.getByTestId('up-choose-option-0').props.style)).toEqual(
    expect.objectContaining({ backgroundColor: '#3c9cff' }),
  );
});

it('maps label/layout props, ignores inactive value props, and exposes render-item press state', () => {
  const onUpdateModelValue = jest.fn();
  const renderItem = jest.fn(({ index, press, selected }) => (
    <Text onPress={press} testID={`custom-${index}`}>{`${index}:${selected}`}</Text>
  ));
  const screen = renderRoot(
    <UPChoose
      itemHeight="40px"
      itemPadding="6px"
      itemWidth="120px"
      labelName="label"
      modelValue="1"
      options={[{ label: 'Alpha', value: 99 }, { label: 'Beta', value: 1 }]}
      renderItem={renderItem}
      type="checkbox"
      valueName="value"
      wrap={false}
      onUpdateModelValue={onUpdateModelValue}
    />,
  );

  expect(screen.getByTestId('up-choose-scroll')).toBeTruthy();
  expect(renderItem).toHaveBeenCalledWith(expect.objectContaining({ index: 1, selected: true }));
  fireEvent.press(screen.getByTestId('custom-0'));
  expect(onUpdateModelValue).toHaveBeenCalledWith(0);
});

it('reacts to mounted source defaults while explicit props retain precedence', () => {
  const screen = renderRoot(<UPChoose />);

  act(() => {
    UP.setConfig({ props: { choose: { options: [{ title: 'Configured' }], itemHeight: '36px' } } });
  });
  expect(screen.getByText('Configured')).toBeTruthy();

  screen.rerender(<UPRoot><UPChoose options={[{ title: 'Explicit' }]} /></UPRoot>);
  expect(screen.getByText('Explicit')).toBeTruthy();
});
```

Import `Text` from `react-native` in the test. The style assertions inspect the
underlying `UPTag` pressable after `UPChoose` forwards `testID` to it; add a
small `testID?: string` prop to `UPTag` only if this is required for observability
and update its own props tests accordingly.

- [ ] **Step 3: Run the focused suite to verify missing exports**

Run: `npm test -- --runInBand tests/components/UPChoose.test.tsx`

Expected: FAIL because `UPChoose` and `UPChooseOption` are not exported from `../../src`.

### Task 2: Add Source Defaults and Implement `UPChoose`

**Files:**
- Create: `src/components/choose/UPChoose.tsx`
- Create: `src/components/choose/index.ts`
- Modify: `src/components/tag/UPTag.tsx`
- Modify: `src/config/defaults.ts:470-550`
- Modify: `src/config/defaults.ts:945-946`
- Modify: `src/config/store.ts:91-95`
- Modify: `src/config/store.ts:178-182`
- Modify: `src/config/store.ts:270-274`
- Modify: `src/components/index.ts`
- Modify: `tests/components/UPTag.test.tsx`

**Interfaces:**
- Produces config types `UPChooseOption = Record<string, unknown>` and `UPChooseModelValue = number | string | readonly unknown[] | false`.
- Produces `UPChooseDefaults`, `UPProps['choose']`, `UPConfigOverrides['props']['choose']`, `UPChooseProps`, and `UPChoose`.
- Extends `UPTagProps` with optional `testID?: string`, forwarding it to the inner pressable while preserving the default `up-tag` ID.

- [ ] **Step 1: Add source data defaults and merge entries**

Add these declarations after `UPCopyDefaults` in `src/config/defaults.ts`:

```ts
export type UPChooseOption = Record<string, unknown>;
export type UPChooseModelValue = number | string | readonly unknown[] | false;
export type UPChooseDefaults = {
  options: readonly UPChooseOption[];
  modelValue: UPChooseModelValue;
  type: string;
  itemWidth: string;
  itemHeight: string;
  itemPadding: string;
  labelName: string;
  valueName: string;
  customClick: boolean;
  wrap: boolean;
};
```

Add `choose: UPChooseDefaults;` after `copy` in `UPProps`. Add this frozen
source table after `copy` in `sourceDefaults.props`:

```ts
choose: Object.freeze({
  options: Object.freeze([]) as readonly UPChooseOption[],
  modelValue: false as const,
  type: 'radio',
  itemWidth: 'auto',
  itemHeight: '50px',
  itemPadding: '8px',
  labelName: 'title',
  valueName: 'value',
  customClick: false,
  wrap: true,
}),
```

Add these matching entries in `src/config/store.ts` beside P12 `copy`:

```ts
// UPConfigOverrides['props']
choose?: Partial<UPProps['choose']>;

// createSourceState().props
choose: { ...sourceDefaults.props.choose },

// setUPConfig().props
choose: { ...state.props.choose, ...overrides.props?.choose },
```

- [ ] **Step 2: Make tag press targets addressable by callers**

Extend `UPTagProps` and its pressable attribute:

```tsx
export type UPTagProps = {
  // Existing props...
  testID?: string;
};

<Pressable
  // Existing attributes...
  testID={input.testID ?? 'up-tag'}
>
```

Add this test to `tests/components/UPTag.test.tsx`:

```tsx
it('allows composed components to supply a distinct tag test ID', () => {
  const screen = renderTag(<UPTag testID="composed-tag" text="Composed" />);

  expect(screen.getByTestId('composed-tag')).toBeTruthy();
  expect(screen.queryByTestId('up-tag')).toBeNull();
});
```

- [ ] **Step 3: Implement source state and native rendering**

Create `src/components/choose/UPChoose.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import type { UPChooseModelValue, UPChooseOption } from '../../config';
import { getPx, type UPDimension } from '../../utils';
import { UPTag } from '../tag';

export type UPChooseRenderItemArgs = {
  item: UPChooseOption;
  index: number;
  selected: boolean;
  press: () => void;
};

export type UPChooseProps = {
  options?: readonly UPChooseOption[];
  modelValue?: UPChooseModelValue;
  type?: string;
  itemWidth?: UPDimension;
  itemHeight?: UPDimension;
  itemPadding?: UPDimension;
  labelName?: string;
  valueName?: string;
  customClick?: boolean;
  wrap?: boolean;
  renderItem?: (args: UPChooseRenderItemArgs) => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onUpdateModelValue?: (index: number) => void;
  onCustomClick?: (index: number) => void;
};

function sourceSelected(index: number, currentIndex: UPChooseModelValue): boolean {
  return index == (currentIndex as unknown as number);
}

export function UPChoose(input: UPChooseProps): React.JSX.Element {
  const props = { ...useUPConfig().props.choose, ...input } as UPChooseProps;
  const [currentIndex, setCurrentIndex] = useState<UPChooseModelValue>(props.modelValue ?? false);
  useEffect(() => {
    setCurrentIndex(props.modelValue ?? false);
  }, [props.modelValue]);
  const width = props.itemWidth === 'auto' || props.itemWidth === undefined ? undefined : getPx(props.itemWidth);
  const press = (index: number) => {
    if (props.customClick) {
      input.onCustomClick?.(index);
      return;
    }
    setCurrentIndex(index);
    input.onUpdateModelValue?.(index);
  };
  const choices = (props.options ?? []).map((item, index) => {
    const selected = sourceSelected(index, currentIndex);
    const itemPress = () => press(index);
    const node = input.renderItem?.({ item, index, press: itemPress, selected }) ?? (
      <UPTag
        customStyle={{ ...(width === undefined ? {} : { width }), padding: getPx(props.itemPadding ?? '8px') }}
        height={props.itemHeight}
        plain={!selected}
        size="large"
        text={String(item[props.labelName ?? 'title'] ?? '')}
        testID={`up-choose-option-${index}`}
        type={selected ? 'primary' : 'info'}
        onClick={itemPress}
      />
    );
    const sourceId = item.id;
    const key = typeof sourceId === 'string' || typeof sourceId === 'number' ? String(sourceId) : String(index);
    return <View key={key} style={width === undefined ? undefined : { width }} testID={`up-choose-item-${index}`}>{node}</View>;
  });
  const content = <View style={props.wrap ? { flexDirection: 'row', flexWrap: 'wrap' } : { flexDirection: 'row' }}>{choices}</View>;
  return <View style={input.customStyle} testID="up-choose">{props.wrap ? content : <ScrollView horizontal showsHorizontalScrollIndicator={false} testID="up-choose-scroll">{content}</ScrollView>}</View>;
}
```

Do not add checkbox/multiselect branches. `type` and `valueName` remain in the
public props but are intentionally unused, matching source behavior. The
`sourceSelected` implementation must retain `==` with the `never` cast so
TypeScript permits the complete source union while JavaScript preserves source
coercion at runtime.

Create `src/components/choose/index.ts`:

```ts
export * from './UPChoose';
```

Add `export * from './choose';` to `src/components/index.ts` beside the other
component barrels.

- [ ] **Step 4: Run focused component and type validation**

Run: `npm test -- --runInBand tests/components/UPChoose.test.tsx tests/components/UPTag.test.tsx && npm run typecheck`

Expected: PASS. The default tags expose unique IDs, `false` and string indexes
use source loose matching, `customClick` does not mutate selection, `renderItem`
receives source state, and `UP.setConfig` updates mounted defaults.

### Task 3: Document Source Index Semantics and Add an Example

**Files:**
- Modify: `README.md:24-72`
- Modify: `docs/compatibility.md` after `## P12 copy`
- Modify: `docs/gap-matrix.md` before `## Deferred Source Components`
- Modify: `example/App.tsx:8-96`
- Modify: `example/App.tsx` near the layout or input examples

**Interfaces:**
- Documents `UPChoose` as source-compatible one-index selection, not a multiselect component.
- Documents `onUpdateModelValue(index)` and `onCustomClick(index)` as numeric-index callbacks.
- Documents `renderItem({ item, index, selected, press })` as the React replacement for the Vue scoped slot.

- [ ] **Step 1: Add P13 to README status**

Insert this plan link after P12 and append the matching phase summary:

```markdown
- [P13 choose plan](docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p13-choose.md)

P13 adds `UPChoose`, preserving source index selection, tag appearance, custom
click callbacks, native wrapping, and horizontal no-wrap scrolling.
```

- [ ] **Step 2: Add the compatibility guide section and matrix rows**

Append this section after P12 in `docs/compatibility.md`:

````markdown
## P13 choose

`UPChoose` maps the source tag chooser to `UPTag` instances. It preserves the
source index model: `modelValue` identifies an option array index and normal
presses emit `onUpdateModelValue(index)`. Use `customClick` with
`onCustomClick(index)` when the application owns selection changes.

```tsx
const [choice, setChoice] = useState(0);

<UPChoose
  modelValue={choice}
  options={[{ title: 'Daily' }, { title: 'Weekly' }, { title: 'Monthly' }]}
  onUpdateModelValue={setChoice}
/>
```

`wrap={false}` maps to a horizontal native `ScrollView`; the default maps to a
wrapping row. `renderItem({ item, index, selected, press })` replaces the Vue
scoped slot. Upstream uses `index == currentIndex`, so strings, `false`, and
arrays follow JavaScript coercion; this is preserved for compatibility. `type`
and `valueName` remain accepted but do not create multiselect/value-based
behavior because source code never reads them. CSS classes and Vue slot syntax
remain unavailable on React Native.
````

Add this `## P13 Choose` matrix section before deferred components:

```markdown
| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-choose` | options, modelValue, index tag state, custom-click, wrap | `UPChoose`, `onUpdateModelValue`, `onCustomClick`, `wrap` | Reuses native `UPTag`; source local index updates and loose `index == currentIndex` behavior are preserved | Emulated | `tests/components/UPChoose.test.tsx` |
| `u-choose` | Vue scoped slot | `renderItem({ item, index, selected, press })` | React render callback replaces source option slot while preserving the same index press flow | Emulated | `tests/components/UPChoose.test.tsx` |
| `u-choose` | type/valueName multiselect semantics, CSS classes | Retained `type`, `valueName`, `customClass` props | Source implementation never consumes type/valueName for selection; CSS class runtime is unavailable | No-op retained | `src/components/choose/UPChoose.tsx` |
```

- [ ] **Step 3: Add a controlled source-index example**

Import `UPChoose`, add this state inside `App`, and render the example near
other selection controls:

```tsx
const [chooseIndex, setChooseIndex] = useState(0);
```

```tsx
<UPChoose
  modelValue={chooseIndex}
  options={[{ title: 'Daily' }, { title: 'Weekly' }, { title: 'Monthly' }]}
  onUpdateModelValue={setChooseIndex}
/>
<Text>Selected chooser index: {chooseIndex}</Text>
```

Do not represent `type="checkbox"` as an active multiselect feature in the
example.

- [ ] **Step 4: Run documentation and example quality checks**

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

Expected: all commands exit zero.

### Task 4: Run the P13 Full Quality Gate

**Files:**
- Verify: all P13 source, test, documentation, example, spec, and plan files.

**Interfaces:**
- Verifies package-root exports for `UPChoose`, `UPChooseProps`, `UPChooseOption`, and `UPChooseModelValue`.
- Verifies P13 needs no added runtime dependency and leaves no package archive behind.

- [ ] **Step 1: Run complete library validation**

Run each command in order:

```powershell
npm test -- --runInBand
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

Expected: all Jest suites, TypeScript, lint, build, packaging, and whitespace
checks exit zero.

- [ ] **Step 2: Confirm scope and package artefact cleanliness**

Run:

```powershell
git status --short
git diff -- README.md docs/compatibility.md docs/gap-matrix.md docs/superpowers/specs/2026-07-26-ultra-ui-react-native-p13-choose-design.md docs/superpowers/plans/2026-07-26-ultra-ui-react-native-p13-choose.md example/App.tsx src/components/choose src/components/index.ts src/components/tag/UPTag.tsx src/config/defaults.ts src/config/store.ts tests/components/UPChoose.test.tsx tests/components/UPTag.test.tsx
if (Test-Path 'ultra-ui-rn-0.1.0.tgz') { throw 'npm pack --dry-run must not leave a tarball.' }
```

Expected: report P13 files only, retain the intentionally dirty workspace, and
verify no dry-run package archive exists.

## Plan Self-Review

- **Spec coverage:** Task 1 locks default tag states, all source coercion paths
  (`false`, string, and array), press events, custom-click non-mutation,
  label/layout values, render callbacks, and live config defaults. Task 2 adds
  all config and export layers plus native rendering. Task 3 explains source
  quirks and adds a controlled example. Task 4 executes every library and
  example acceptance gate.
- **Placeholder scan:** Every task has concrete files, public interfaces, code
  blocks, expected test outcomes, and commands. No unspecified future work is
  required.
- **Type consistency:** `UPChooseOption`, `UPChooseModelValue`,
  `UPChooseDefaults`, `UPChooseProps`, `UPChooseRenderItemArgs`,
  `onUpdateModelValue`, `onCustomClick`, and `renderItem` have matching names
  and signatures throughout the plan.
