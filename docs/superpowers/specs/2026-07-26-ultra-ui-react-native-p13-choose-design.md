# React Native P13 Choose Design

## Goal

Port `u-choose` from uview-plus 3.8.86 as `UPChoose`, retaining the source
single-index selection semantics, source visual states, option-label behavior,
and callback names within the React Native public API.

## Scope

P13 adds only `UPChoose`. It does not add a generic multiselect API, a picker,
or an option virtualization layer. The source `type` property is retained but
does not extend the component beyond upstream's one-index behavior.

## Source Contract

The source component renders one `up-tag` for each `options` item and stores a
single `currentIndex`. Its watcher initializes `currentIndex` from
`modelValue`. Its click routine always receives the array index:

- when `customClick` is false, it updates `currentIndex` and emits
  `update:modelValue(index)`;
- when `customClick` is true, it emits `custom-click(index)` only;
- selected tags use `primary` with `plain=false`;
- unselected tags use `info` with `plain=true`;
- text comes from `item[labelName]`, defaulting to `title`.

Although source props include `type`, `valueName`, and allow an array value for
`modelValue`, the implementation never reads `type` or `valueName` and compares
each item only against the single index. P13 deliberately preserves this
behavior rather than introducing an incompatible multiselect interpretation.

## React Native API

```tsx
export type UPChooseOption = Record<string, unknown>;

export type UPChooseProps = {
  options?: readonly UPChooseOption[];
  modelValue?: number | string | readonly unknown[] | false;
  type?: string;
  itemWidth?: UPDimension;
  itemHeight?: UPDimension;
  itemPadding?: UPDimension;
  labelName?: string;
  valueName?: string;
  customClick?: boolean;
  wrap?: boolean;
  renderItem?: (args: {
    item: UPChooseOption;
    index: number;
    selected: boolean;
    press: () => void;
  }) => React.ReactNode;
  onUpdateModelValue?: (index: number) => void;
  onCustomClick?: (index: number) => void;
};
```

`onUpdateModelValue` maps the Vue `update:modelValue` event. `onCustomClick`
maps the source `custom-click` event. `renderItem` replaces the scoped default
slot and receives an explicit `press` callback, so applications can retain the
source event flow when providing custom native option content.

The public `modelValue` type retains source number/string/array/false input
compatibility. For selection comparison P13 uses the source expression
`index == currentIndex`, including JavaScript's coercion behavior. Therefore
`modelValue="1"` selects index `1`, `modelValue=false` selects index `0`, and
arrays follow their normal JavaScript primitive conversion. This is an upstream
compatibility behavior, not a recommended controlled-value model; presses still
emit numeric indexes back to the application.

## Rendering and State Flow

`UPChoose` merges source defaults from `useUPConfig().props.choose` with input
props. A local `currentIndex` starts from `modelValue` and synchronizes whenever
the explicit `input.modelValue` changes, exactly matching the source watcher.
An explicit `modelValue` always takes precedence over global defaults.

Each option renders inside a width-constrained native `View`:

- `wrap=true` maps source wrapping to a flex row with `flexWrap: 'wrap'`;
- `wrap=false` maps source `scroll-x` to a horizontal `ScrollView` with its
  indicator hidden;
- `itemWidth='auto'` leaves width unset; other source dimensions pass through
  `getPx`;
- `itemHeight` and `itemPadding` pass to `UPTag`, preserving source metrics;
- default output uses `UPTag` with the source `primary`/`info` and plain state.

On option press, `customClick=true` invokes only `onCustomClick(index)`. When
false, it updates local selection immediately and calls
`onUpdateModelValue(index)`. This gives source-compatible uncontrolled visual
feedback while allowing an application to control `modelValue` in the usual
React style.

`renderItem` is rendered in the same option wrapper. It receives `selected`
from the source comparison and a `press` function wired to the same source
event flow as a default `UPTag`.

## Defaults and Config Reactivity

P13 adds this data-only table to `UP.props`:

```ts
choose: Object.freeze({
  options: Object.freeze([]) as readonly UPChooseOption[],
  modelValue: false,
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

`UPChooseDefaults`, `UPProps['choose']`, `UPConfigOverrides['props']['choose']`,
`createSourceState`, and `setUPConfig` each receive matching entries. A mounted
component therefore updates after `UP.setConfig({ props: { choose: ... } })`
unless an explicit component prop overrides the changed default.

Callbacks and `renderItem` remain component props, not global defaults.

## Compatibility Limits

- React Native has no CSS class runtime; `customClass` is accepted as a typed
  deprecated no-op.
- Vue scoped slots map to `renderItem`; source slot syntax cannot be used from
  JSX.
- `type` and `valueName` remain accepted source props but are inactive because
  the upstream code never uses them for selection or emitted values.
- The source wrapper has no per-item `keyName`; React list keys use index plus
  a stable string form of the source value when available.

No native dependency is required.

## Test Plan

Add `tests/components/UPChoose.test.tsx` under `UPRoot`. Tests cover:

- source default labels, `primary`/`info`, and plain selected states, including
  the source `false`/string loose-index comparison behavior;
- model-value initialization and mounted external model-value synchronization;
- ordinary presses updating visible selection and emitting numeric indexes;
- custom-click presses emitting indexes without changing selection or emitting
  a model update;
- `labelName`, retained inactive `valueName` and `type`, source item sizing,
  and horizontal no-wrap `ScrollView` behavior;
- `renderItem` selection/press arguments;
- mounted global defaults updating option labels and the explicit-prop
  precedence path.

The completion gate runs the focused suite, root Jest suite, TypeScript, lint,
build, `npm pack --dry-run`, diff check, and the example project's TypeScript,
lint, and Jest checks.

## Documentation and Acceptance Criteria

`README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and
`example/App.tsx` add the component, source index behavior, `renderItem`
replacement, and the intentional non-multiselect limitation.

P13 is accepted when:

- package-root exports include `UPChoose`, `UPChooseProps`, and
  `UPChooseOption`;
- source defaults are readable through `UP.props.choose` and react to
  `UP.setConfig` in mounted components;
- default and custom rendering invoke the same source event behavior;
- `customClick` never changes local selection or emits a model update;
- no third-party runtime dependency is added;
- all library and example quality gates pass.
