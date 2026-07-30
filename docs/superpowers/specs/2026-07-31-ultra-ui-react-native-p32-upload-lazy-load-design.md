# Ultra UI React Native P32 Upload And Lazy Load Design

## Goal

P32 adds the image and file workflow components that close the most important remaining media gap:

- `UPUpload`: source-style image/file picker, upload queue, progress, preview, delete, and retry surface.
- `UPLazyLoad`: React Native lazy render helper for image/content placeholders, replacing the current `UPImage.lazyLoad` no-op with an explicit component.

The phase keeps uview-plus prop and event names where practical, but treats native file selection and network upload as host-owned integration points. Picker libraries are optional peer dependencies, not hard runtime dependencies.

## Approved Decisions

- Scope is `UPUpload` plus `UPLazyLoad`.
- Prefer the upload/media chain over rich text or data-display phases.
- New dependencies are allowed when they are the right boundary.
- Add picker packages as optional peer dependencies, not direct dependencies.
- Do not hard-code authentication, signed URL, OSS/S3 multipart, or app-specific upload behavior.
- Upload execution remains adapter-owned through an explicit `uploadFile` function.

## Dependency Boundary

P32 declares these optional peers:

- `react-native-image-picker`
- `@react-native-documents/picker`

They are marked in `peerDependenciesMeta` as optional. The package does not statically import them from core component files, so consumers that only use non-upload components do not need to link native picker modules.

Default integration is exposed through documented adapter shapes and optional helper factories. Applications can wire the peer libraries in app code, or provide a completely custom adapter for Expo, enterprise file providers, existing upload SDKs, or pre-signed cloud uploads.

## Scope

### In Scope

- Add `src/components/upload`.
- Add `src/components/lazy-load`.
- Add defaults and `UP.setConfig({ props })` merge support for `upload` and `lazyLoad`.
- Export both components and their public types.
- Add optional peer dependency metadata.
- Add focused Jest tests for queue state, adapter calls, callbacks, ref methods, preview/delete behavior, error paths, lazy rendering, and config merging.
- Add compact examples to `example/App.tsx`.
- Update `README.md`, `docs/compatibility.md`, and `docs/gap-matrix.md`.

### Out of Scope

- Bundled native upload transport.
- Bundled authentication, signing, token refresh, retry policy, or cloud SDK integration.
- Implicit global `uni.chooseImage`, `uni.chooseFile`, `uni.uploadFile`, or `uni.previewImage`.
- Background upload, resumable upload, multipart upload, and request persistence.
- OS file permission UI beyond what host picker libraries provide.
- Native image compression/cropping.
- Global scroll observer for lazy loading.
- Retrofitting `UPImage.lazyLoad` to do implicit lazy loading.

## Architecture

### `UPUpload`

`UPUpload` owns the visible upload list and upload state machine. It delegates file selection and upload execution to an adapter. It never assumes that selected files are images unless `accept="image"`.

Core props:

- `fileList`
- `defaultFileList`
- `accept`
- `multiple`
- `maxCount`
- `maxSize`
- `autoUpload`
- `disabled`
- `deletable`
- `previewImage`
- `capture`
- `name`
- `url`
- `header`
- `formData`
- `uploadAdapter`
- `customStyle`
- `renderFile`
- `renderUpload`
- `beforeRead`
- `afterRead`
- `onAfterRead`
- `onBeforeRead`
- `onChooseError`
- `onUploadStart`
- `onProgress`
- `onSuccess`
- `onError`
- `onDelete`
- `onPreview`
- `onChange`
- `onUpdateFileList`

Core ref methods:

- `choose(): Promise<void>`
- `upload(index?: number): Promise<void>`
- `remove(index: number): void`
- `clear(): void`
- `retry(index: number): Promise<void>`
- `getFiles(): readonly UPUploadFile[]`

File shape:

```ts
export type UPUploadFileStatus = 'ready' | 'uploading' | 'success' | 'error';

export type UPUploadFile = {
  id?: string;
  name?: string;
  uri: string;
  type?: string;
  size?: number;
  thumb?: string;
  status?: UPUploadFileStatus;
  progress?: number;
  response?: unknown;
  error?: unknown;
  source?: unknown;
};
```

Adapter shape:

```ts
export type UPChooseFileOptions = {
  accept: 'image' | 'file' | 'all';
  capture?: boolean | 'camera' | 'album';
  count: number;
  multiple: boolean;
};

export type UPUploadRequest = {
  file: UPUploadFile;
  fileList: readonly UPUploadFile[];
  formData?: Record<string, unknown>;
  header?: Record<string, string>;
  name: string;
  url?: string;
  onProgress: (progress: number) => void;
};

export type UPUploadTask = {
  abort?: () => void;
  promise: Promise<unknown>;
};

export type UPUploadAdapter = {
  chooseFile?: (options: UPChooseFileOptions) => Promise<readonly UPUploadFile[]>;
  previewFile?: (file: UPUploadFile, fileList: readonly UPUploadFile[]) => void | Promise<void>;
  uploadFile: (request: UPUploadRequest) => Promise<unknown> | UPUploadTask;
};
```

Source callback mapping:

- Source `beforeRead` maps to `beforeRead(files)` and `onBeforeRead(files)`.
- Returning `false` or rejecting from `beforeRead` stops insertion and upload.
- Source `afterRead` maps to `afterRead(files)` and `onAfterRead(files)`.
- Upload progress emits `onProgress({ file, index, progress })`.
- Success emits `onSuccess({ file, index, response })`.
- Failure emits `onError({ file, index, error })`.
- Deletion emits `onDelete({ file, index })`.
- Preview emits `onPreview({ file, index, fileList })` and then calls adapter `previewFile` when supplied.

State behavior:

- Controlled `fileList` is never mutated internally. All changes emit `onUpdateFileList(next)` and `onChange(next)`.
- Uncontrolled mode starts from `defaultFileList` and owns local state.
- New chosen files enter as `ready`.
- `autoUpload=true` uploads new files after `afterRead`.
- Uploading a file sets `status="uploading"` and clamps progress to `0..100`.
- A successful upload sets `status="success"`, `progress=100`, and stores `response`.
- A failed upload sets `status="error"` and stores `error`.
- `retry(index)` only uploads files that still exist in the queue.
- `remove(index)` aborts an in-flight task only when the returned task exposes `abort()`.

Rendering:

- Default file cells use `UPImage` for image MIME types or URI extensions and a generic file row for other files.
- The upload entry renders as a native press target with an add icon and source-style fallback label.
- `renderFile({ file, index, actions })` replaces a file cell.
- `renderUpload({ choose, disabled, remaining })` replaces the upload entry.
- `maxCount` hides the upload entry when the queue is full.

### Optional Picker Helpers

P32 may include helper factories in `src/components/upload/adapters`:

- `createImagePickerChooseFile(launchImageLibrary, launchCamera?)`
- `createDocumentPickerChooseFile(pick)`

These helpers normalize peer-library results into `UPUploadFile`. They are imported explicitly by applications that have installed the optional peer libraries. Core `UPUpload` must not statically import native picker modules.

### `UPLazyLoad`

`UPLazyLoad` lazily renders image or arbitrary content based on explicit visibility inputs. It avoids hidden global scroll assumptions because React Native does not expose a reliable cross-screen page scroll runtime.

Core props:

- `src`
- `mode`
- `width`
- `height`
- `threshold`
- `visible`
- `scrollOffset`
- `viewport`
- `placeholder`
- `error`
- `renderContent`
- `once`
- `customStyle`
- `onVisible`
- `onLoad`
- `onError`

Core behavior:

- When `visible` is supplied, it is the source of truth.
- Without `visible`, the component measures its layout and compares it with `viewport` plus `scrollOffset`.
- `threshold` expands the viewport before deciding visibility.
- `once=true` keeps content mounted after first visibility.
- Before visible, it renders `placeholder` or a fixed-size neutral placeholder.
- Once visible, it renders `renderContent()` when supplied; otherwise it renders `UPImage` with the mapped image props.
- `onVisible` fires only on the transition from hidden to visible.

## Data Flow

1. Component props merge with `useUPConfig()` defaults.
2. `UPUpload` chooses files through the adapter, validates them, and inserts normalized files into the queue.
3. Queue mutations flow through one helper that updates local state or emits controlled updates.
4. Upload tasks update individual file status and progress.
5. `UPLazyLoad` derives visibility from controlled props or measured layout inputs, then renders placeholder or content.
6. Public callbacks emit source-compatible payloads and React Native-friendly aliases.

## Error Handling

- Missing `uploadAdapter.chooseFile` makes `choose()` emit `onChooseError` and leaves the queue unchanged.
- Missing `uploadAdapter.uploadFile` makes `upload()` emit `onError` for targeted files and marks them `error`.
- `beforeRead=false` and rejected `beforeRead` stop queue insertion without marking files failed.
- Oversized files are rejected before insertion and reported through `onChooseError`.
- Adapter upload rejection marks only the targeted file as `error`.
- Progress values are clamped to `0..100`.
- Invalid delete/retry indexes are ignored.
- `UPLazyLoad` with missing size still renders, but docs recommend explicit width and height to avoid layout jumps.

## Testing

Add focused tests:

- `tests/components/UPUpload.test.tsx`
  - renders default upload entry and existing files
  - chooses files through adapter and emits after-read/change callbacks
  - respects `beforeRead=false`
  - rejects files above `maxSize`
  - auto uploads and emits start/progress/success
  - failed upload marks file error and emits error callback
  - manual ref `upload`, `retry`, `remove`, `clear`, and `getFiles` work
  - controlled `fileList` emits updates without mutating props
  - preview and delete callbacks use source-shaped payloads
  - missing choose/upload adapters report errors without crashing
  - `UP.setConfig({ props: { upload } })` merges defaults

- `tests/components/UPLazyLoad.test.tsx`
  - renders placeholder while hidden
  - renders `UPImage` when controlled `visible=true`
  - fires `onVisible` only once per visibility transition
  - uses measured viewport/scroll inputs with threshold
  - keeps content mounted when `once=true`
  - renders custom content through `renderContent`
  - `UP.setConfig({ props: { lazyLoad } })` merges defaults

Run:

- `npm test -- --runTestsByPath tests/components/UPUpload.test.tsx tests/components/UPLazyLoad.test.tsx`
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm pack --dry-run`
- `git diff --check`

## Documentation

Update:

- `README.md`
- `example/App.tsx`
- `docs/compatibility.md`
- `docs/gap-matrix.md`

Documentation must state:

- P32 uses optional peer dependencies for picker integration.
- Applications must provide picker and upload adapters for production use.
- Upload transport, authentication, signing, retry policy, and cloud provider semantics are application-owned.
- `UPLazyLoad` is explicit and scroll-host-driven; `UPImage.lazyLoad` remains a retained compatibility prop.

## Acceptance Criteria

- `UPUpload` and `UPLazyLoad` are exported from the package.
- Defaults and `UP.setConfig({ props })` work for both components.
- Optional picker peers are declared without forcing every consumer to install native modules.
- Core upload behavior works through an explicit adapter contract.
- Focused P32 tests pass.
- Full project validation passes.
- Docs clearly describe native integration responsibilities and retained source no-ops.
