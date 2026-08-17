# Ultra UI React Native Design

Date: 2026-07-25  
Source of truth: `D:\Repos\xyito\open\uview-plus\src\uni_modules\uview-plus` (uview-plus 3.8.86)  
Target repository: `D:\Repos\xyito\open\ultra-ui-rn`

## Goal

Build a React Native UI library that preserves the public uview-plus component API as closely as React Native allows and reproduces the source library's default visual design on Android and iOS. Public components use the `UP` prefix, for example `UPButton` and `UPPopup`.

The end state is full source-component coverage. Delivery is staged so each phase is a usable, publishable library increment rather than a collection of incomplete component shells.

## Decisions

- Approach: source-driven port. Props, default values, events, styles, token values, and utility semantics are derived from uview-plus rather than from a third-party React Native UI kit.
- Runtime: React Native CLI with TypeScript on Android and iOS. Expo managed workflow is not a supported target.
- Naming: package name `ultra-ui-rn`; public React components use `UP*` PascalCase names.
- Compatibility priority: public prop names and defaults, runtime behavior, visual metrics, then idiomatic React Native implementation details.
- Source platform APIs that do not exist in React Native are represented in the public TypeScript types. Their behavior is either a documented no-op or a host-injected implementation; no completed component silently removes a source public prop.
- All default style values come from the source theme, component SCSS, and computed component styles. React Native platform rasterization differences are acceptable; dimensions, colors, spacing, radii, and state treatment are not.

## Repository Structure

```text
ultra-ui-rn/
  src/
    index.ts
    config/
      defaults.ts
      colors.ts
      z-index.ts
      props.ts
    theme/
      UPThemeProvider.tsx
      tokens.ts
      useUPTheme.ts
    utils/
      dimensions.ts
      color.ts
      validation.ts
      timing.ts
      index.ts
    overlay/
      UPRoot.tsx
      OverlayProvider.tsx
      overlay-store.ts
    components/
      button/
      icon/
      ...
    native/
      contracts.ts
  example/
  tests/
  docs/
    gap-matrix.md
    compatibility.md
```

`src/index.ts` is the only supported package entrypoint. Component directories own their implementation, public props, source-default table, styles, and focused tests. Shared facilities do not import individual components, preventing circular dependencies.

## Core Architecture

### Config, utilities, and units

The library exposes a `UP` utility namespace analogous to `uni.$u`:

```ts
UP.setConfig({ config, color, zIndex, props });
UP.config;
UP.color;
UP.zIndex;
UP.props;
UP.rpx2px(24);
UP.getPx('24rpx');
UP.range(0, 100, value);
UP.debounce(fn, 300);
UP.throttle(fn, 300);
```

`rpx2px` uses the uview 750-wide design baseline and React Native's current window width: `rpx * width / 750`. Inputs that source components accept as `number`, `"12px"`, or `"24rpx"` are normalized by `getPx` before entering a native style.

The initial utility surface includes range, sleep, test validators, debounce, throttle, color conversion, color alpha conversion, and color gradients. Route, HTTP, and uni host simulation are excluded from the first release because React Native applications already select their own navigation and networking stacks; their compatibility status remains explicitly documented.

### Theme and default styles

`UPThemeProvider` owns light/dark token state and accepts source-compatible color overrides. `useUPTheme` returns fully resolved component tokens. Initial light values match uview-plus defaults:

| Token | Value |
|---|---|
| primary | `#3c9cff` |
| success | `#5ac725` |
| warning | `#f9ae3d` |
| error | `#f56c6c` |
| info | `#909399` |
| mainColor | `#303133` |
| contentColor | `#606266` |
| tipsColor | `#909399` |
| lightColor | `#c0c4cc` |
| borderColor | `#dadbde` |
| bgColor | `#f3f4f6` |
| disabledColor | `#c8c9cc` |

Components resolve colors and z-index values through this layer. They accept `customStyle` as a React Native `StyleProp`, applied after source-derived defaults, and `customClass` only as a retained, documented no-op because React Native has no CSS class runtime.

### Root overlays and imperative feedback

`UPRoot` composes `SafeAreaProvider`, `GestureHandlerRootView`, `UPThemeProvider`, and `OverlayProvider`. It must wrap each application once to support fixed overlays, Toast, Notify, Modal, ActionSheet, Popup, LoadingPage, and root z-index ordering.

The overlay store assigns a declaration sequence number and orders visible entries by numeric source-compatible `zIndex`, then by sequence for equal values. It renders through a root portal so masks and panels are not clipped by ancestor layout.

`UPToast` and `UPNotify` have both declarative components and imperative APIs. Imperative calls fail with a descriptive development warning if no `UPRoot` is mounted; production calls are safe no-ops rather than throwing from UI event handlers.

### Component compatibility mapping

React Native cannot use Vue custom tags, directives, or slots. Each completed component uses the following stable conversion rules:

| uview-plus construct | React Native API |
|---|---|
| `<u-button text="Save" />` | `<UPButton text="Save" />` |
| `@click` / `@change` | `onClick` / `onChange` |
| `v-model` / `modelValue` | controlled `value` plus `onChange`; optional `defaultValue` for uncontrolled use |
| default / named slots | `children` and documented `ReactNode` props such as `icon`, `title`, and `footer` |
| `customStyle` | `StyleProp<ViewStyle | TextStyle | ImageStyle>` according to component surface |
| `customClass` | accepted and documented as no-op |
| `ref` methods | `forwardRef` and typed imperative handles matching source method names where meaningful |

Source prop names remain unchanged where they are valid TypeScript identifiers. Props that collide with React Native's host API are preserved on the `UP*` component interface and translated internally. Source events whose names use Vue's `update:*` convention are represented by the equivalent controlled callback, for example `onUpdateShow` is retained as an alias for `onChangeShow` on visibility components.

### Native capability contracts

The core package does not hard-code a media, PDF, location, or image-picker vendor. `src/native/contracts.ts` defines typed adapters registered through `UP.setConfig` for capabilities that cannot be implemented by React Native core:

- image preview, picking, compression, crop and save
- QR/barcode scanning and image export
- PDF viewer
- video player
- location and connectivity
- clipboard, share, haptic feedback, and permission requests

Components use a supplied adapter when one exists. If a capability is unavailable, they expose the source-compatible props and callbacks but report a documented `unsupported` result or no-op according to the gap matrix. This keeps the base package installable while allowing native applications to select platform-compliant dependencies.

## Delivery Phases

| Phase | Deliverable | Components / capabilities | Completion condition |
|---|---|---|---|
| P0 | Package foundation | TypeScript package setup, exports, config, units, theme, icon map, `UPRoot`, overlay store, `UPIcon`, `UPButton` | Example application runs on Android and iOS; defaults and button states are tested |
| P1 | Display and layout | Text, Tag, Badge, Cell, CellGroup, Image, Avatar, Card, Empty, Skeleton, Gap, Line, Divider, Row, Col, Grid, GridItem, Section, Title, View, Box | Default styles and responsive 750rpx metrics match source reference states |
| P2 | Inputs and forms | Input, Textarea, Search, Switch, Checkbox, Radio, Rate, Slider, NumberBox, CodeInput, Form, FormItem, Keyboard variants | Controlled/uncontrolled values, validation, disabled states, and imperative handles are tested |
| P3 | Feedback and navigation | Overlay, Popup, Modal, Toast, Notify, ActionSheet, Loading, Navbar, Tabs, Tabbar, Steps, Sticky, Transition, NoticeBar, Tooltip | Overlay ordering, gestures, accessibility focus, and navigation-state callbacks work on both platforms |
| P4 | Lists and data selection | List, Loadmore, Swiper, Picker, DatetimePicker, Calendar, Cascader, Dropdown, Pagination, IndexList, Collapse, SwipeAction, PullRefresh, VirtualList, Waterfall | Large data lists, gestures, selection output, and source callback payloads are verified |
| P5 | Advanced and native-assisted components | Upload, Album, Cropper, Signature, Canvas, QRCode, Barcode, Parse, Markdown, PDFReader, ShortVideo, Poster, Tree, Table, Table2, GoodsSku, remaining source components | Every source component has a status and all supported/emulated API surface is documented and tested |

The end state also includes remaining source components not named in the phase table. `docs/gap-matrix.md` lists every component and every public prop/event/method, so phase planning cannot hide omissions.

## Compatibility Matrix Policy

Every source public API entry is classified independently:

1. **Supported**: equivalent React Native behavior implemented and tested.
2. **Emulated**: closest behavior implemented; exact difference documented.
3. **No-op retained**: accepted by the public type, intentionally ignored on React Native; reason documented.
4. **Host adapter**: public API is implemented when the application registers the required native adapter.
5. **Deferred**: not yet in the current release; assigned to a delivery phase.

No completed phase may leave an undocumented API omission. The matrix records source file, source default, React Native prop or method, status, behavior note, and test location.

## Error Handling and Accessibility

- Invalid values follow source defaults where the source tolerates them; invalid values that would crash a native style are normalized or ignored with a development-only warning.
- Missing required native adapters never crash render. Components produce the documented unavailable state and invoke an error callback where the source exposes one.
- Interactive controls provide accessibility role, label, state, and disabled semantics. Popup-like overlays trap accessibility focus while visible and restore focus to the trigger on close when a trigger ref exists.
- Press targets match source visual dimensions but never fall below the platform's practical minimum touch target through invisible `hitSlop` where necessary.

## Verification

- Jest with the React Native preset runs unit tests for dimensions, token merging, default prop tables, utility functions, and overlay ordering.
- Component tests use React Native Testing Library for rendered states, controlled callbacks, disabled/loading behavior, form validation, and imperative handles.
- Android and iOS screenshot regression tests cover source default styles and key states: normal, active/pressed, disabled, loading, selected, and error where relevant.
- Detox exercises overlay stacking, scrolling, gestures, picker/calendar interaction, upload adapter contracts, and a core form flow on both platforms.
- The example app displays each supported component in source-equivalent reference states for manual comparison with uview-plus demos.
- Each release updates `docs/gap-matrix.md`, and CI fails when a new exported component has no matrix entry or source-default test.

## Non-Goals for P0

- Full i18n runtime parity.
- Route and HTTP wrapper parity.
- Pixel parity for dark mode.
- Mini-program host simulation, including `openType`, share cards, and `uni.*` APIs.
- Bundling a single mandatory implementation for crop, PDF, maps, video, or scanner capabilities.

These are not excluded from the end-state compatibility matrix. They simply do not block the P0 publishable foundation.
