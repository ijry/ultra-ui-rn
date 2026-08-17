# Ultra UI React Native P38 Upload Source Compatibility Design

## Goal

Align `UPUpload` and `UPLazyLoad` with the verified `uview-plus@3.8.86`
`u-upload` / `u-lazy-load` interfaces through a **dual-surface
compatibility layer**.

The current React Native props and callbacks stay untouched and keep their
behavior. On top of them P38 adds the source-named fields, source event
payloads, and explicit precedence rules. Internally the components keep the
existing queue and the explicit visibility model — no `uni` runtime is
simulated and no Provider/global adapter is introduced.

Approved decision: **option 1 — dual-surface compatibility layer**. The
source's implicit global capabilities (`uni.uploadFile`,
`uni.chooseImage`/`chooseFile`/`chooseVideo`, `uni.previewImage`,
`IntersectionObserver`-style lazy observation) are NOT emulated; they are
documented as explicit React Native boundaries or mapped onto the existing
adapter/visibility surfaces.

## Source Baseline

Audited source: `uview-plus@3.8.86`

- `src/uni_modules/uview-plus/components/u-upload/u-upload.vue`
  (+ `props.js`, `upload.js`, `utils.js`)
- `src/uni_modules/uview-plus/components/u-lazy-load/u-lazy-load.vue`

### `u-upload` Props

`accept` (`'image'`, supports `all`/`media`/`image`/`file`/`video`),
`extension`, `capture` (`['album', 'camera']`), `compressed`, `camera`,
`maxDuration`, `uploadIcon` (`'camera-fill'`), `uploadIconColor`
(`'#D3D4D6'`), `useBeforeRead`, `afterRead`, `beforeRead`,
`previewFullImage` (`true`), `maxCount` (`52`), `disabled`, `imageMode`
(`'aspectFill'`), `name` (`''`), `sizeType`, `multiple`, `deletable`,
`maxSize` (`Number.MAX_VALUE`), `fileList`, `uploadText` (`''`), `width`
(`80`), `height` (`80`), `previewImage` (`true`), `autoDelete` (`false`),
`autoUpload` (`false`), `autoUploadApi` (`''`), `autoUploadDriver` (`''`;
`local`/`oss`/`cos`/`kodo`), `autoUploadAuthUrl` (`''`),
`autoUploadHeader` (`{}`), `getVideoThumb` (`false`),
`customAfterAutoUpload` (`false`), `videoPreviewObjectFit` (`'cover'`).

### `u-upload` Events

`error`, `beforeRead`, `oversize`, `afterRead`, `delete`, `clickPreview`,
`update:fileList`, `afterAutoUpload`.

### `u-upload` Behavior Notes

- Chosen files normalize to `{ url, thumb, size, name, type, ... }`; items
  use `url`, not `uri`.
- `beforeRead(file, { name, index })` transforms files; `useBeforeRead`
  emits `beforeRead` with a `callback(ok)` gate; rejection stops silently.
- Oversize stops the whole batch: toast + `oversize` emit, nothing inserted.
- `autoUpload` pushes items with `status: 'uploading'` and uploads each via
  `uni.uploadFile` (`name: 'file'`, `header: autoUploadHeader`) to
  `autoUploadApi`, or through the OSS signature flow when
  `autoUploadDriver === 'oss'`.
- `deleteItem` removes immediately only when `autoDelete` is true; otherwise
  it emits `delete` with `{ name, index, file }` and leaves the queue to the
  parent.
- `onClickPreview` always emits `{ ...item, name, index }`; image preview
  additionally calls `uni.previewImage({ urls, current })` when
  `previewFullImage` is true.

### `u-lazy-load` Props And Events

`index`, `image`, `imgMode` (`'widthFix'`), `loadingImg` (placeholder image),
`errorImg`, `threshold` (`100`), `duration` (`500`), `effect`, `isEffect`,
`borderRadius`, `height` (`450`); events `click`, `load`, `error`.
Visibility is detected through an implicit global scroll/intersection
observer, which React Native does not provide.

## Scope

### In Scope

- `UPUpload` dual surface:
  - source-shaped `fileList` items (`url`, `thumb`, `size`, `name`, `type`,
    `message`) accepted and normalized;
  - widened `accept` (`all`/`media`/`image`/`file`/`video`);
  - source props added as typed aliases/behaviors: `useBeforeRead`,
    `autoDelete`, `previewFullImage`, `autoUploadApi`, `autoUploadDriver`,
    `autoUploadAuthUrl`, `autoUploadHeader`, `customAfterAutoUpload`,
    `extension`, `sizeType`, `camera`, `compressed`, `maxDuration`,
    `imageMode`, `width`, `height`, `uploadIcon`, `uploadIconColor`,
    `getVideoThumb`, `videoPreviewObjectFit`;
  - source events: `onOversize`, `onClickPreview`, `onAfterAutoUpload`,
    source `onBeforeRead` gate, source `onDelete` payload with `name`;
  - explicit precedence rules (below);
  - the existing queue, adapter contract, ref methods, and RN callbacks stay
    unchanged.
- `UPLazyLoad` dual surface:
  - keep the explicit visibility model (`visible`, `viewport`,
    `scrollOffset`, `threshold`, `once`);
  - add source prop aliases: `image` (alias of `src`), `imgMode` (alias of
    `mode`), `loadingImg` (image placeholder), `errorImg`, `index`;
  - add the source `click` event as `onClick`;
  - implicit global observation stays a documented boundary.
- Defaults: extend `UPUploadDefaults` with the new source keys (source
  defaults), keep every P32 default.
- Docs: `docs/upload-source-compatibility.md` matrix, README,
  `docs/compatibility.md`, `docs/gap-matrix.md`.
- Focused Jest tests.

### Out of Scope

- `uni.uploadFile`, `uni.chooseImage`, `uni.chooseFile`,
  `uni.chooseVideo`, `uni.previewImage`, `uni.request`,
  `uni.showToast`, `wx.chooseMedia`, `wx.previewMedia`.
- A Provider/global adapter or any new runtime layer.
- Bundled authentication, signing, OSS/COS/Kodo internals, retry policy,
  background/resumable upload.
- `IntersectionObserver` polyfill or implicit global lazy observation.
- Video capture/compression, `getVideoThumb` canvas extraction, and
  `videoPreviewObjectFit` rendering; these props are typed and documented
  boundaries.
- Changing P32 defaults (`maxCount: 9`, `autoUpload: true`,
  `uploadText: '上传图片'`, `capture: false`); source parity requires
  explicit props.

## Explicit Precedence Rules (`UPUpload`)

1. **File shape** — items may carry `url` (source) and/or `uri` (RN);
   normalization uses `uri ?? url` and retains `url` on the item.
2. **Preview control** — `previewFullImage` (source) wins over
   `previewImage` (RN) when explicitly supplied; both default `true`.
3. **Delete** — when `autoDelete` is explicitly supplied, source semantics
   apply: `true` removes and emits only `update:fileList`; `false` emits
   `onDelete({ name, index, file })` without removing. When `autoDelete` is
   not supplied, the existing RN remove-and-emit behavior is kept.
4. **Before-read** — `useBeforeRead: true` turns `onBeforeRead` into the
   source gate `{ file, name, index, callback }`; `callback(false)` stops the
   batch silently. Otherwise the existing RN `beforeRead(files)` function
   gate stays.
5. **Oversize** — when `onOversize` is supplied, an oversized file rejects
   the whole batch with `{ file, name, index }` (source semantics).
   Otherwise the existing RN filtered rejection via `onChooseError`
   (`rejected` list) is kept.
6. **Upload config** — effective upload URL is `autoUploadApi ?? url`;
   request headers merge as `{ ...autoUploadHeader, ...header }` (RN `header`
   wins); `autoUploadDriver` and `autoUploadAuthUrl` are passed through the
   extended adapter request so app adapters can implement signing;
   `customAfterAutoUpload` gates the success URL through
   `onAfterAutoUpload({ ...response, callback })`.
7. **Event detail** — source event payloads carry `{ name, index }`; `name`
   defaults to `''` (source default) and is included in `onDelete`,
   `onPreview`, `onClickPreview`, and `onOversize`.

All precedence rules are deterministic and documented; both surfaces can be
used together, and every rule is covered by a focused test.

## `UPUploadRequest` Extension

The existing adapter contract gains optional source fields (backward
compatible):

```ts
type UPUploadRequest = {
  file: UPUploadFile;
  fileList: readonly UPUploadFile[];
  url?: string;                       // effective autoUploadApi ?? url
  header?: Record<string, string>;    // merged autoUploadHeader + header
  formData?: Record<string, unknown>;
  name: string;
  driver?: '' | 'local' | 'oss' | 'cos' | 'kodo';
  authUrl?: string;
  onProgress: (progress: number) => void;
};
```

Applications keep owning transport and auth through `uploadAdapter.uploadFile`.

## Testing

- `tests/components/UPUpload.test.tsx` (added): source-shaped `fileList`
  normalization, `url`/`uri` precedence, `useBeforeRead` gate, `autoDelete`
  both branches, `onOversize` batch rejection, `onClickPreview` payload,
  `autoUploadApi`/`autoUploadHeader`/`driver`/`authUrl` request routing,
  `customAfterAutoUpload` success URL, `previewFullImage` routing, and
  `name` in payloads. Existing P32 tests must stay green.
- `tests/components/UPLazyLoad.test.tsx` (added): `image`/`imgMode`
  aliases, `loadingImg` placeholder, `index` + `onClick`, explicit model
  unchanged.
- Full gates: `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run build`, `git diff --check`.

## Documentation

- New `docs/upload-source-compatibility.md` source matrix with the
  precedence table and the explicit RN boundaries.
- `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md` P38 updates.
- Design and plan docs in `docs/superpowers`.

## Acceptance Criteria

- Every P32 RN prop/callback keeps its behavior; all existing tests pass
  unchanged.
- Source-named props and event payloads compile and behave per the precedence
  table.
- Source-shaped `fileList` items render and upload through the existing
  adapter without conversion code in the app.
- `UPLazyLoad` keeps the explicit visibility model and accepts source prop
  aliases.
- No `uni` global, runtime layer, or implicit observer is added; every
  boundary is documented in the matrix.
- All quality gates pass.
