# Ultra UI React Native P29 Canvas + Code Images Design

## Goal

P29 adds a canvas-based code-image family for the React Native port:

- `UPCanvas`: source-compatible drawing surface for components that need a real canvas API.
- `UPQrcode`: QR code component rendered through `UPCanvas`.
- `UPBarcode`: barcode component rendered through `UPCanvas`.

The design prioritizes uview-plus API compatibility and practical RN usage. Code images must not be implemented as large React Native `View` grids, because that path creates excessive native nodes and has poor scaling behavior for QR/barcode rendering.

## Approved Decisions

- Add `react-native-canvas` to package `dependencies`, not only as a peer dependency, so consumers get a default out-of-the-box renderer.
- Use `react-native-canvas` as the built-in default adapter for `UPCanvas`.
- Keep a `canvasAdapter` override on `UPCanvas` and a global config adapter so future native, Skia, or host-specific canvas implementations can replace the default without changing public component APIs.
- `UPQrcode` and `UPBarcode` render through `UPCanvas` by default.
- Do not add a `View` fallback renderer for QR/barcode.
- Document that the default canvas is WebView-backed. It is suitable for code images and ordinary drawing, but not a promise of high-frequency animation performance.

## Scope

### In Scope

- Add `src/components/canvas`, `src/components/qrcode`, and `src/components/barcode`.
- Export all three components from the public component barrel.
- Add default props and config merge support for `canvas`, `qrcode`, and `barcode`.
- Add `react-native-canvas` as a runtime dependency after verifying its package requirements.
- Port or adapt the upstream uview-plus QR code encoder behavior for internal matrix generation.
- Port or adapt the upstream uview-plus barcode encoder behavior for supported formats.
- Add tests for lifecycle, adapter injection, command order, invalid input handling, and public exports.
- Update example, compatibility docs, and gap matrix.

### Out of Scope

- No scanner/decoder support.
- No photo album save integration.
- No automatic preview/save claim unless the active adapter supports export.
- No browser DOM canvas assumptions beyond the adapter contract.
- No high-frequency drawing or animation performance guarantee.
- No `View`-based QR/barcode fallback.

## Dependency Strategy

`react-native-canvas` is part of `dependencies` so the package works by default after installation. During implementation, its actual peer/native dependency declarations must be inspected. If it requires additional install-time packages, only the required packages should be added or documented.

The public API must not directly expose `react-native-canvas` internals. Consumers interact with `UPCanvas`, refs, callbacks, and optional adapter overrides. This keeps the dependency replaceable later.

## Architecture

### `UPCanvas`

`UPCanvas` owns layout, canvas lifecycle, touch forwarding, and adapter orchestration. The default adapter renders a `react-native-canvas` surface and exposes a normalized command interface.

Core props:

- `canvasId`
- `width`
- `height`
- `unit`
- `useRootHeightAndWidth`
- `bgColor`
- `disableScroll`
- `customStyle`
- `canvasAdapter`
- `onReady`
- `onTouchStart`
- `onTouchMove`
- `onTouchEnd`
- `onError`

Core ref methods:

- `refresh()`
- `getWidth()`
- `getHeight()`
- `getCanvasElement()`
- `getRawContext()`
- `getCanvasContext()`
- `clearCanvas()`
- `clearRect(x, y, width, height)`
- `rect(x, y, width, height)`
- `fillRect(x, y, width, height)`
- `strokeRect(x, y, width, height)`
- `beginPath()`
- `closePath()`
- `fill()`
- `stroke()`
- `setFillStyle(color)`
- `setStrokeStyle(color)`
- `setLineWidth(width)`
- `setFontSize(size)`
- `setTextAlign(align)`
- `fillText(text, x, y, maxWidth?)`
- `measureText(text)`
- `drawImage(...)`
- `draw()`
- `toTempFilePath(options?)`

Because `react-native-canvas` is asynchronous and WebView-backed, methods that depend on readiness, context execution, measuring, or export return `Promise` values. Source-style synchronous drawing calls are emulated through an ordered command queue.

### Canvas Adapter Contract

The adapter is a small boundary with these responsibilities:

- Render the canvas surface.
- Signal when the canvas element and context are ready.
- Execute drawing commands in order.
- Forward touch events.
- Expose raw element/context access where available.
- Export an image only when supported by the adapter.
- Report adapter or drawing errors through `onError`.

The built-in adapter uses `react-native-canvas`. Tests should use a mock adapter to verify behavior without depending on WebView runtime internals.

### `UPQrcode`

`UPQrcode` converts a value into a QR matrix and draws the result on `UPCanvas`.

Source-oriented props:

- `val`
- `size`
- `unit`
- `background`
- `foreground`
- `pdground`
- `lv`
- `icon`
- `iconSize`
- `onval`
- `loadMake`
- `usingComponents`
- `showLoading`
- `loadingText`
- `allowPreview`
- `canvasId`
- `customStyle`
- `onResult`
- `onPreview`
- `onLongpressCallback`
- `onError`

Behavior:

- If `loadMake` is true, generate on mount.
- If `onval` is true, regenerate when `val` changes.
- Empty `val` produces a source-like error state and calls `onError`.
- The renderer draws background, quiet zone, modules, finder patterns, and optional center icon through `UPCanvas`.
- `toTempFilePath` delegates to the active canvas adapter. If export is unsupported, return a rejected promise and call `onError`.
- Preview and long-press callbacks are compatibility hooks; platform preview/save remains host-dependent.

### `UPBarcode`

`UPBarcode` encodes text into barcode segments and draws bars and optional labels on `UPCanvas`.

Source-oriented props:

- `value`
- `format`
- `width`
- `height`
- `displayValue`
- `text`
- `fontOptions`
- `font`
- `textAlign`
- `textPosition`
- `textMargin`
- `fontSize`
- `background`
- `lineColor`
- `margin`
- `marginTop`
- `marginBottom`
- `marginLeft`
- `marginRight`
- `useCanvas`
- `customStyle`
- `onResult`
- `onError`

Supported formats should follow uview-plus where practical:

- `auto`
- `CODE128`
- `CODE128A`
- `CODE128B`
- `CODE128C`
- `EAN13`
- `EAN8`
- `EAN5`
- `EAN2`
- `UPC`
- `UPCA`
- `UPCE`
- `CODE39`
- `ITF`
- `ITF14`
- `MSI`
- `MSI10`
- `MSI11`
- `MSI1010`
- `MSI1110`
- `pharmacode`
- `codabar`

Behavior:

- `auto` selects the first valid compatible format using the source-compatible encoder order.
- Invalid value or unsupported format shows an error state and calls `onError`.
- Bars are drawn on `UPCanvas` using calculated module widths and margins.
- Optional text is drawn with configured font, size, alignment, position, and margin.
- `useCanvas` remains as a compatibility prop. In RN P29, drawing still uses canvas; `useCanvas=false` can only render an exported image when the active adapter supports export. Otherwise it reports unsupported behavior instead of silently falling back to `View` nodes.

## Data Flow

1. Component props merge with global defaults.
2. Dimensions are normalized from `width`, `height`, `size`, and `unit`.
3. `UPCanvas` creates or receives an adapter.
4. Adapter readiness resolves the canvas element and context.
5. QR/barcode components generate draw instructions from their encoders.
6. Draw instructions enter the `UPCanvas` command queue.
7. Completion calls `onResult` when generation succeeds.
8. Invalid input, adapter failures, and unsupported export call `onError`.

## Error Handling

- Adapter initialization failure is surfaced through `onError`.
- Drawing before readiness is queued; drawing after unmount is ignored and rejected.
- Empty QR value and invalid barcode value are deterministic validation errors.
- Unsupported barcode format is a deterministic validation error.
- Export calls reject when the active adapter cannot export.
- Component-level error UI should be minimal and source-like, avoiding crashes in normal render paths.

## Testing

Add focused tests:

- `tests/components/UPCanvas.test.tsx`
  - default props and public render
  - adapter injection
  - `onReady` lifecycle
  - ordered drawing command forwarding
  - error forwarding
  - no `View` QR/barcode fallback dependency

- `tests/components/UPQrcode.test.tsx`
  - auto generation on `loadMake`
  - regeneration on `onval`
  - QR matrix draw commands
  - icon drawing path
  - empty value error
  - export unsupported error

- `tests/components/UPBarcode.test.tsx`
  - supported format encoding
  - `auto` format selection
  - margin and label drawing
  - invalid value error
  - unsupported format error
  - `useCanvas=false` unsupported-export behavior

Run the established validation sequence after implementation:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm pack --dry-run`
- `git diff --check`

## Documentation

Update:

- `example/App.tsx`
- `docs/compatibility.md`
- `docs/gap-matrix.md`

Documentation must state:

- `react-native-canvas` is bundled as a dependency for default rendering.
- The default renderer is WebView-backed.
- QR/barcode use canvas, not large `View` grids.
- Export, preview, and save features depend on adapter/platform support.
- A custom adapter can replace the default renderer.

## Acceptance Criteria

- `UPCanvas`, `UPQrcode`, and `UPBarcode` are exported from the package.
- Package installation includes the default canvas dependency.
- QR and barcode examples render through canvas.
- Mock-adapter tests verify command order without requiring a real WebView.
- Invalid inputs are reported through callbacks and do not crash render.
- Existing test, typecheck, lint, build, pack dry-run, and diff whitespace checks pass.
