# React Native P17 Album Design

## Goal

Port uview-plus 3.8.86 `u-album` as `UPAlbum`. Preserve the source image-grid
contract, image-object URL resolution, single-image aspect-ratio behavior,
maximum-item overlay, and source event payloads without adding a native image
viewer dependency.

## Scope

P17 adds one display component, its public types, source defaults, exports,
tests, an example, and documentation rows. It reuses the existing `UPImage`
component and React Native core layout/image APIs. It does not add a viewer,
upload flow, caching layer, or any runtime dependency.

## Source Contract

The source component accepts a `urls` list containing strings or objects. For
objects, `keyName` identifies the URL property and falls back to `src`. A
single image has a long edge of `singleSize` and retains its source aspect
ratio; multiple images use square `multipleSize` items. Source defaults are:

```ts
{
  urls: [],
  keyName: '',
  singleSize: 180,
  multipleSize: 70,
  space: 6,
  singleMode: 'scaleToFill',
  multipleMode: 'aspectFill',
  maxCount: 9,
  previewFullImage: true,
  rowCount: 3,
  showMore: true,
  autoWrap: false,
  unit: 'px',
  stop: true,
}
```

When `autoWrap` is false, source items are divided into rows of `rowCount`
items. It renders at most `maxCount` images and shows `+N` on the last shown
item when additional URLs exist and `showMore` is true. When `autoWrap` is
true, all shown items share a wrapping row rather than fixed source rows.

Tapping an image calculates all resolved URL strings and its current index. In
the source, `previewFullImage=true` calls `uni.previewImage`; otherwise it
emits `preview({ urls, currentIndex })`. The source also emits the computed
first-row `albumWidth` value.

## React Native API

```tsx
export type UPAlbumItem = string | Record<string, unknown>;

export type UPAlbumPreviewEvent = {
  urls: string[];
  currentIndex: number;
};

export type UPAlbumProps = {
  urls?: readonly UPAlbumItem[];
  keyName?: string;
  singleSize?: UPDimension;
  multipleSize?: UPDimension;
  space?: UPDimension;
  singleMode?: string;
  multipleMode?: string;
  maxCount?: number | string;
  previewFullImage?: boolean;
  rowCount?: number | string;
  showMore?: boolean;
  shape?: 'circle' | 'square';
  radius?: UPDimension;
  autoWrap?: boolean;
  unit?: string;
  stop?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  customClass?: string;
  onPreview?: (event: UPAlbumPreviewEvent) => void;
  onAlbumWidth?: (width: number) => void;
};
```

`onPreview` is the cross-platform replacement for both source preview paths:
it receives `{ urls, currentIndex }` for every image press. The application
owns any full-screen preview UI. `previewFullImage` remains supported for API
compatibility and controls whether the source-style full-preview intent is
enabled, but it does not create an RN-native viewer or suppress the callback.

`onAlbumWidth` maps the source `albumWidth` event. It reports the first row's
calculated numeric width whenever source URLs or resolved size inputs change.

## Architecture and Layout

`UPAlbum` resolves defaults from `useUPConfig().props.album`, then applies
explicit props. It normalizes `maxCount` and `rowCount` to positive integers;
invalid or non-positive values produce no items or one item per row,
respectively, rather than an invalid React Native layout.

The component resolves image URLs once per render. It uses `keyName` only for
object entries; when that value is absent or not a string it falls back to a
string `src` property. An entry with no usable URL resolves to `''`, remains in
its source index position, and renders through `UPImage`'s standard error
state. Preview payloads therefore remain positional with the input `urls`
array, including empty-string entries.

For two or more images, each item has width and height `multipleSize`, maps
`multipleMode` to `UPImage.mode`, and uses `space` as row/column separation.
For a single image, `Image.getSize` determines its native aspect ratio. The
larger dimension becomes `singleSize`; the shorter dimension is derived from
the ratio and `singleMode` is passed to `UPImage`.

If `Image.getSize` fails or is not available, an `onLayout` measurement of the
album container supplies the source-equivalent fallback: 60% of the measured
width, constrained by the numeric `singleSize` long edge where available, is
used for both dimensions. The square fallback is required because React Native
does not provide the source `widthFix` intrinsic-height layout behavior before
image metadata is available; it avoids a zero-height or overflowing image.

The `+N` label is an absolutely positioned, semi-transparent overlay over the
last visible image. It inherits the image's circle/square border radius and
renders centered white text. It never consumes the image press, so tapping the
overlay reports that last image index exactly as the source does.

## Defaults and Config Reactivity

P17 adds an `album` entry to `UP.props`, matching the source defaults above,
plus matching types in `UPProps` and `UPConfigOverrides['props']`. `urls` is
frozen in the defaults table. Mounted components read `useUPConfig()` so
`UP.setConfig({ props: { album: ... } })` updates all unresolved values;
explicit props always retain precedence.

## Compatibility Limits

- React Native core has no system image-preview interface comparable to
  `uni.previewImage`. The package emits `onPreview` and leaves viewer selection,
  navigation, sharing, and download behavior to the host application.
- `Image.getSize` is asynchronous and may fail for local or inaccessible URLs.
  The measured-width fallback replaces source `uni.getImageInfo` and DOM-query
  behavior; exact timing and remote image metadata are platform-owned.
- React Native dimensions are numeric or percentage values. `unit` and
  non-pixel CSS unit strings are retained for type compatibility but are no-ops
  outside values the existing `getPx` utility can represent.
- `customClass`, CSS scoped styles, Vue slots, source event propagation, and
  direct `uni.previewImage` calls have no RN runtime equivalent. `customClass`
  is a deprecated typed no-op, while `customStyle` is the native replacement.

## Test Plan

Add `tests/components/UPAlbum.test.tsx` using `UPRoot`. Mock the React Native
`Image.getSize` static API deterministically so single-image ratio and failure
fallback can be tested without network access.

The suite verifies:

- string/object source resolution, including `keyName` and `src` fallback;
- source default multi-image grid, row partitioning, spacing, and item modes;
- `maxCount`, `showMore`, `+N`, and `autoWrap` behavior;
- square/circle radius mapping and single/multiple image mode selection;
- successful `Image.getSize` aspect-ratio sizing and measured fallback after a
  static lookup failure;
- `onPreview({ urls, currentIndex })` for ordinary images and the final
  overlay image, independent of `previewFullImage`;
- first-row `onAlbumWidth` values for single and multi-image arrangements;
- reactive `UP.setConfig({ props: { album } })` defaults and explicit-prop
  precedence; and
- package-root value/type exports through existing typecheck coverage.

## Documentation and Acceptance Criteria

Update `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`, and
`example/App.tsx` with an album example that logs or opens an application-owned
preview callback. State that preview UI is host-owned and no image-viewer
dependency is installed.

P17 is accepted when `UPAlbum` is publicly exported; defaults are reactive;
source grid, count, URL, callback, and single-image sizing behavior are tested;
the example compiles; and library/example typecheck, lint, Jest, build,
dry-run package, and whitespace gates pass with no new dependencies.
