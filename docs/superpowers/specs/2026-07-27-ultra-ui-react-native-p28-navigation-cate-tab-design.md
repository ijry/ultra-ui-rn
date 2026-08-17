# P28 Navigation and Cate Tab Design

**Goal:** Add source-compatible React Native implementations of `u-navbar`, `u-navbar-mini`, and `u-cate-tab` without adding package dependencies or binding the library to an application routing solution.

## Scope

This phase covers public props, defaults, controlled state, callbacks, core layout, and native scroll behavior for three upstream components:

- `UPNavbar` implements the custom top navigation bar, including safe-area insertion, fixed positioning, placeholder height, border, title, left/right text, left/right icons, and custom left/center/right render nodes.
- `UPNavbarMini` implements the compact capsule navigation control used by full-screen pages, including safe-area insertion, fixed positioning, back/home regions, divider, `homeUrl` compatibility, and custom left/center render nodes.
- `UPCateTab` implements the vertical category tab component with upstream `follow` and `tab` modes, configurable label keys, controlled current index, default category/item rendering, and render-prop replacements for Vue slots.

This phase excludes app-router integration, Web/NVue CSS class semantics, mini-program `uni.reLaunch`, background images or gradients beyond React Native color/style support, and virtualized large-list optimization. Routing remains owned by the host app through callbacks.

## Architecture

The components follow existing package patterns: each component has a focused directory, a typed props file or exported prop type, a local stylesheet via `StyleSheet.create`, a directory barrel, tests, example coverage, and exports from `src/components/index.ts`.

`UPNavbar` and `UPNavbarMini` render with React Native `View`, `Text`, `Pressable`, and existing `UPIcon`, `UPLine`, and `UPStatusBar` primitives where available. They resolve defaults from `useUPConfig().props` first and explicit component props last. Fixed positioning is expressed with absolute React Native styles. Placeholder support is implemented by rendering a spacer before the fixed inner bar.

`UPCateTab` is a dedicated composition around two vertical `ScrollView` instances: one for the left menu, one for the right page area. It keeps layout measurement and scroll coordination inside the component so callers only deal with source-like data and callbacks. Vue named slots map to render props:

- `tabItem` maps to `renderTabItem({ item, index, active })`.
- `rightTop` maps to `renderRightTop({ tabList })`.
- `itemList` maps to `renderItemList({ item, index, active })`.
- `pageItem` maps to `renderPageItem({ item, index, parent, parentIndex })`.

## `UPNavbar`

### Props and layout

`UPNavbar` supports `safeAreaInsetTop`, `placeholder`, `fixed`, `border`, `leftIcon`, `leftText`, `rightIcon`, `rightText`, `title`, `titleColor`, `bgColor`, `statusBarBgColor`, `titleWidth`, `height`, `leftIconSize`, `leftIconColor`, `autoBack`, and `titleStyle`. It also accepts React Native style escape hatches for the root, inner container, content row, title, and side regions.

The default layout matches upstream structure:

1. Optional placeholder is rendered only when both `fixed` and `placeholder` are true.
2. Optional status bar is rendered when `safeAreaInsetTop` is true.
3. Content row centers the title absolutely relative to the row while left and right areas sit at the edges.
4. The right area renders only when right text, right icon, or a custom right node exists.
5. Border is a bottom hairline using the package border color.

Height values accept numbers or source-like numeric strings with `px`/`rpx` best-effort parsing. Unsupported CSS strings are ignored rather than throwing, which is consistent with the existing React Native compatibility layer.

### Events

Left press always emits `onLeftClick(event)` first. If `autoBack` is true, the component then calls React Native `BackHandler.exitApp()`. This is intentionally opt-in because React Native core does not provide a router-agnostic `navigateBack` equivalent. Applications that use React Navigation, Expo Router, or another stack router should leave `autoBack` false and perform route back behavior in `onLeftClick`.

Right press emits `onRightClick(event)`. Callback aliases matching the package's established naming style may be supported where useful, but the primary public names are `onLeftClick` and `onRightClick`.

## `UPNavbarMini`

### Props and layout

`UPNavbarMini` supports `safeAreaInsetTop`, `placeholder`, `fixed`, `leftIcon`, `bgColor`, `height`, `iconSize`, `iconColor`, `leftIconColor`, `autoBack`, `homeUrl`, custom `renderLeft`, custom `renderCenter`, and style escape hatches.

The default capsule width, radius, horizontal padding, divider, and icon placement follow the upstream visual structure. The left region renders the back icon and the center region renders the home icon by default. Fixed positioning uses a top-left overlay style suitable for full-screen pages.

### Events

Back press emits `onLeftClick(event)` first and then applies the same `autoBack` behavior as `UPNavbar`.

Home press emits `onHomeClick({ homeUrl, event })`. `homeUrl` is preserved as a compatibility prop but never triggers routing internally. Host applications can map this payload to React Navigation, Expo Router, or any other router.

## `UPCateTab`

### Data model

`UPCateTab` accepts `tabList`, `tabKeyName`, `itemKeyName`, `current`, `defaultCurrent`, `mode`, and `height`. `tabKeyName` and `itemKeyName` default to `name`. `mode` defaults to `follow`, matching upstream.

The selected index resolves as controlled when `current` is provided; otherwise it is internal state initialized from `defaultCurrent` or `0`. Every resolved index is clamped to the available `tabList` bounds. Empty lists render stable empty containers and do not emit spurious updates.

The component emits `onUpdateCurrent(index)` and `onChange(index, item)` when the effective index changes from user interaction or right-side follow scrolling. It does not emit duplicate updates when a user presses the already active item.

### `follow` mode

`follow` mode renders all category sections in the right scroll view. Each section records its Y offset through `onLayout`. Pressing a left menu item:

1. Updates the effective current index if it changed.
2. Emits update/change callbacks once.
3. Scrolls the right pane to the measured target offset when available.
4. Scrolls the left menu so the active item is approximately centered.

Right-side scrolling is throttled and compares the scroll offset against measured section offsets. When the active section changes, the left menu highlight updates and the left menu recenters. Programmatic scrolls are guarded so a click-driven scroll does not cause duplicate callback emissions.

### `tab` mode

`tab` mode renders only the active category's content section. Left menu presses and controlled `current` changes update the displayed section but do not run right-scroll active detection. This maps upstream's single-switch mode and avoids unnecessary rendering for simple category pages.

### Default rendering

Without render props, the left menu displays `item[tabKeyName]`. The right side displays a section title and a wrapping grid of child items from `item.children`. Each child shows an optional `icon` with the existing image primitive when feasible and a label from `itemKeyName`. Missing labels render as an empty string; malformed children values are treated as an empty array.

## Styling and accessibility

All three components expose React Native style props for container-level customization while keeping source-style default colors, spacing, active states, and border treatment. Pressable regions include accessibility roles and labels derived from text props or item labels.

The implementation avoids CSS-only features that do not map to React Native. Gradients, complex background strings, scoped CSS class names, and hover classes are documented as compatibility limits. Press feedback is implemented with opacity changes where existing package patterns allow it.

## Defaults, exports, examples, and docs

Add default config entries and TypeScript types for `navbar`, `navbarMini`, and `cateTab` if the package's config map supports per-component defaults. Each new component receives a directory barrel and public exports from `src/components/index.ts`.

The example app adds a compact navigation demo and a category tab demo showing both `follow` and `tab` behavior with render props. `docs/compatibility.md` documents routing callback ownership and Vue slot replacements. `docs/gap-matrix.md` adds P28 rows for the three components and their React Native limits.

## Testing

- `UPNavbar` tests cover default title/left rendering, right rendering, fixed placeholder, border, callback ordering, and opt-in `autoBack` behavior through a mocked `BackHandler.exitApp`.
- `UPNavbarMini` tests cover capsule rendering, left/home callbacks, `homeUrl` payloads, fixed placeholder behavior, and custom left/center render nodes.
- `UPCateTab` tests cover empty data, default rendering, controlled and uncontrolled current state, left menu presses, duplicate press suppression, `tab` single-section rendering, `follow` section measurement, right-scroll active syncing, and render-prop payloads.
- Repository validation follows the existing sequence: focused component tests, full `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm pack --dry-run`, and `git diff --check`.

## Compatibility limits

No new dependency is introduced. The library will not import React Navigation, Expo Router, location APIs, browser APIs, DOM measurement, or Web-only style libraries. Application code owns route transitions and any navigation stack behavior. `UPCateTab` uses standard `ScrollView` measurement and is intended for normal category page sizes; extremely large category trees remain future work for a virtualized implementation.
