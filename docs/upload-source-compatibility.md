# UPUpload And UPLazyLoad Source Compatibility

Audited source: `uview-plus@3.8.86`

- `src/uni_modules/uview-plus/components/u-upload/u-upload.vue` (+ `props.js`, `upload.js`, `utils.js`)
- `src/uni_modules/uview-plus/components/u-lazy-load/u-lazy-load.vue`

P38 is a **dual-surface compatibility layer**: every existing React Native
prop/callback keeps its behavior, and the source-named props, event payloads,
and precedence rules are added on top. No `uni` runtime is simulated and no
Provider/global adapter is introduced.

## `u-upload` Props

| Source prop | Source default | React Native surface | P38 status | Boundary / implementation note | Test |
|---|---|---|---|---|---|
| `accept` | `'image'` | `accept` (`'image' \| 'file' \| 'all' \| 'media' \| 'video'`) | Supported | Widened to source values; video capture remains host-owned | `UPUpload.test.tsx` |
| `extension` | `[]` | `extension` | Supported | Passed through `UPChooseFileOptions` to the adapter | `UPUpload.test.tsx` |
| `capture` | `['album', 'camera']` | `capture` | Emulated | P32 default `false` retained; source parity requires the explicit array | Config defaults |
| `compressed` | `true` | `compressed` | Typed | Video-only; passed through to the adapter, host-owned | Component prop types |
| `camera` | `'back'` | `camera` | Typed | Video-only; passed through to the adapter | Component prop types |
| `maxDuration` | `60` | `maxDuration` | Typed | Video-only; passed through to the adapter | Component prop types |
| `uploadIcon` | `'camera-fill'` | `uploadIcon` | Supported | Default `camera-fill` renders on the add cell | `UPUpload.test.tsx` |
| `uploadIconColor` | `'#D3D4D6'` | `uploadIconColor` | Supported | Default `#D3D4D6` colors the add-cell icon | `UPUpload.test.tsx` |
| `useBeforeRead` | `false` | `useBeforeRead` | Emulated | When true, `onBeforeRead` becomes the gate payload with `callback(ok)` | `UPUpload.test.tsx` |
| `afterRead` / `beforeRead` | `null` | `afterRead` / `beforeRead` | Emulated | RN `beforeRead` function gate is retained for existing callers | `UPUpload.test.tsx` |
| `previewFullImage` | `true` | `previewFullImage` | Emulated | Wins over RN `previewImage` when explicitly supplied | `UPUpload.test.tsx` |
| `maxCount` | `52` | `maxCount` | Divergence | P32 default `9` retained; source parity requires `maxCount={52}` | Config defaults |
| `disabled` | `false` | `disabled` | Supported | — | `UPUpload.test.tsx` |
| `imageMode` | `'aspectFill'` | `imageMode` | Supported | Used for the default thumbnail `UPImage` | `UPUpload.test.tsx` |
| `name` | `''` | `name` | Divergence | P32 default `'file'` retained; also serves as the upload field name | Config defaults |
| `sizeType` | `['original', 'compressed']` | `sizeType` | Typed | Passed through to the adapter | Component prop types |
| `multiple` | `false` | `multiple` | Supported | — | `UPUpload.test.tsx` |
| `deletable` | `true` | `deletable` + per-item `deletable` | Emulated | Item-level `deletable` wins over the prop | `UPUpload.test.tsx` |
| `maxSize` | `Number.MAX_VALUE` | `maxSize` | Supported | — | `UPUpload.test.tsx` |
| `fileList` | `[]` | `fileList` / `defaultFileList` | Emulated | Source-shaped items (`url`, `thumb`, `size`, `name`, `type`, `message`) accepted; `url` maps to `uri` | `UPUpload.test.tsx` |
| `uploadText` | `''` | `uploadText` | Divergence | P32 default `'上传图片'` retained | Config defaults |
| `width` / `height` | `80` / `80` | `width` / `height` | Supported | Defaults `80`/`80` size the file cells and the add cell | `UPUpload.test.tsx` |
| `previewImage` | `true` | `previewImage` | Supported | RN preview gate; source `previewFullImage` wins when supplied | `UPUpload.test.tsx` |
| `autoDelete` | `false` | `autoDelete` | Emulated | Explicit value switches delete to source semantics (see precedence) | `UPUpload.test.tsx` |
| `autoUpload` | `false` | `autoUpload` | Divergence | P32 default `true` retained; source parity requires `autoUpload={false}` | Config defaults |
| `autoUploadApi` | `''` | `autoUploadApi` | Emulated | Effective upload URL is `autoUploadApi ?? url` | `UPUpload.test.tsx` |
| `autoUploadDriver` | `''` | `autoUploadDriver` | Typed | Passed to the adapter request (`'' \| 'local' \| 'oss' \| 'cos' \| 'kodo'`); transport stays host-owned | `UPUpload.test.tsx` |
| `autoUploadAuthUrl` | `''` | `autoUploadAuthUrl` | Typed | Passed to the adapter request for app-owned signing | `UPUpload.test.tsx` |
| `autoUploadHeader` | `{}` | `autoUploadHeader` | Emulated | Merged under the request header; RN `header` wins on conflict | `UPUpload.test.tsx` |
| `getVideoThumb` | `false` | `getVideoThumb` | Boundary | Typed only; canvas frame extraction is not implemented | Component prop types |
| `customAfterAutoUpload` | `false` | `customAfterAutoUpload` | Emulated | Gates the success URL through `onAfterAutoUpload` | `UPUpload.test.tsx` |
| `videoPreviewObjectFit` | `'cover'` | `videoPreviewObjectFit` | Boundary | Typed only; video preview is not implemented | Component prop types |

## `u-upload` Events

| Source event | Source payload | React Native surface | P38 status | Note | Test |
|---|---|---|---|---|---|
| `error` | error | `onError({ file, index, error, fileList })` | Emulated | Existing RN payload retained | `UPUpload.test.tsx` |
| `beforeRead` | `{ file, name, index, callback }` | `onBeforeRead` | Emulated | Gate payload only when `useBeforeRead` is true; otherwise the RN files-array event | `UPUpload.test.tsx` |
| `oversize` | `{ file, name, index }` | `onOversize` | Emulated | When supplied, an oversized file rejects the whole batch; otherwise RN filtered `onChooseError` | `UPUpload.test.tsx` |
| `afterRead` | `{ file, name, index }` | `afterRead` / `onAfterRead(files)` | Emulated | Existing RN callback retained | `UPUpload.test.tsx` |
| `delete` | `{ name, index, file }` | `onDelete` | Emulated | Source semantics only when `autoDelete` is explicitly supplied | `UPUpload.test.tsx` |
| `clickPreview` | `{ ...item, name, index }` | `onClickPreview` | Emulated | Fires on every item tap regardless of preview capability | `UPUpload.test.tsx` |
| `update:fileList` | next file list | `onUpdateFileList` | Supported | Existing RN event retained | `UPUpload.test.tsx` |
| `afterAutoUpload` | `{ ...response, callback }` | `onAfterAutoUpload` | Emulated | Only with `customAfterAutoUpload` | `UPUpload.test.tsx` |

## Explicit Precedence Rules

1. **File shape** — items may carry `url` (source) and/or `uri` (RN);
   normalization uses `uri ?? url` and retains `url` on the item.
2. **Preview control** — `previewFullImage` wins over `previewImage` when
   explicitly supplied; both default `true`.
3. **Delete** — an explicitly supplied `autoDelete` switches to source
   semantics: `true` removes and emits only `update:fileList`; `false` emits
   `onDelete({ name, index, file })` without removing. Without `autoDelete`,
   the existing RN remove-and-emit behavior is kept. The imperative
   `remove(index)` ref always removes.
4. **Before-read** — `useBeforeRead: true` turns `onBeforeRead` into the gate
   `{ file, name, index, callback }`; `callback(false)` stops the batch
   silently. Otherwise the RN `beforeRead(files)` function gate stays.
5. **Oversize** — supplying `onOversize` rejects the whole batch with
   `{ file, name, index }`; otherwise the RN filtered rejection via
   `onChooseError` (`rejected` list) stays.
6. **Upload config** — effective URL is `autoUploadApi ?? url`; request
   headers merge as `{ ...autoUploadHeader, ...header }` (RN `header` wins);
   `autoUploadDriver` and `autoUploadAuthUrl` are passed through the extended
   `UPUploadRequest`; `customAfterAutoUpload` gates the success URL through
   `onAfterAutoUpload`.
7. **Event detail** — source event payloads carry `{ name, index }`; `name`
   defaults to the configured `name` (P32 default `'file'`).

## `UPUploadRequest` (adapter contract)

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

Transport and auth remain application-owned through `uploadAdapter.uploadFile`.

## `u-lazy-load`

| Source prop/event | Source default | React Native surface | P38 status | Note | Test |
|---|---|---|---|---|---|
| `index` | — | `index` | Supported | Passed to `onClick` | `UPLazyLoad.test.tsx` |
| `image` | `''` | `image` | Emulated | Alias of RN `src`; `src` wins | `UPLazyLoad.test.tsx` |
| `imgMode` | `'widthFix'` | `imgMode` | Emulated | Alias of RN `mode`; `mode` wins | `UPLazyLoad.test.tsx` |
| `loadingImg` | base64 placeholder | `loadingImg` | Emulated | Renders as the placeholder image before visibility | `UPLazyLoad.test.tsx` |
| `errorImg` | base64 placeholder | `errorImg` | Emulated | Renders as the image error fallback | `UPLazyLoad.test.tsx` |
| `threshold` | `100` | `threshold` | Supported | Existing explicit model | `UPLazyLoad.test.tsx` |
| `duration` / `effect` / `isEffect` | `500` / `ease-in-out` / `true` | — | Boundary | Fade transition is native image behavior; not emulated | `UPLazyLoad.test.tsx` |
| `borderRadius` | `0` | `customStyle` | Boundary | Use `customStyle` for radii | Component prop types |
| `height` | `450` | `height` | Supported | Existing explicit model | `UPLazyLoad.test.tsx` |
| `click` | — | `onClick(index)` | Emulated | — | `UPLazyLoad.test.tsx` |
| `load` / `error` | — | `onLoad` / `onError` | Supported | Existing `UPImage` passthrough | `UPLazyLoad.test.tsx` |
| Implicit scroll/intersection observation | global observer | `visible` / `viewport` / `scrollOffset` | Boundary | RN has no implicit page observer; the explicit visibility model is the RN surface | `UPLazyLoad.test.tsx` |

## Explicit Boundaries

- `uni.uploadFile`, `uni.chooseImage`, `uni.chooseFile`, `uni.chooseVideo`,
  `uni.previewImage`, `uni.request`, and `uni.showToast` are not simulated.
- `wx.chooseMedia` and `wx.previewMedia` are not implemented.
- Bundled authentication, signing, OSS/COS/Kodo internals, retry policy,
  background/resumable upload, and multipart semantics remain application
  adapter code.
- Video capture/compression, `getVideoThumb` frame extraction, and
  `videoPreviewObjectFit` rendering are typed boundaries.
- `IntersectionObserver` is not polyfilled; `UPLazyLoad` keeps the explicit
  visibility model and `UPImage.lazyLoad` remains a retained no-op.
- P32 defaults (`maxCount: 9`, `autoUpload: true`, `uploadText: '上传图片'`,
  `capture: false`, `name: 'file'`) are retained; source parity requires
  explicit props.
