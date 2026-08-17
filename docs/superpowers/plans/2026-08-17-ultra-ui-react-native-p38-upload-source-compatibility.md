# P38 Upload Source Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `UPUpload` and `UPLazyLoad` with the verified `uview-plus@3.8.86` `u-upload` / `u-lazy-load` interfaces through a dual-surface compatibility layer: keep every existing React Native prop/callback and its behavior, add the source-named fields, source event payloads, and explicit precedence rules, and internally keep the existing queue and the explicit visibility model. No `uni` runtime is simulated and no Provider/global adapter is added.

**Architecture:** `UPUpload` gains source-shaped file normalization, source props, source events, and deterministic precedence over the existing RN surface while the existing `uploadAdapter` contract, queue, and ref methods stay unchanged. `UPLazyLoad` keeps the explicit visibility model and gains source prop aliases (`image`, `imgMode`, `loadingImg`, `errorImg`, `index`, `onClick`).

**Tech Stack:** TypeScript, React, React Native, Jest, `@testing-library/react-native`, existing config store, existing upload/lazy-load components and tests.

## Global Constraints

- Source compatibility is audited against `uview-plus@3.8.86` `src/uni_modules/uview-plus/components/u-upload/u-upload.vue` and `u-lazy-load/u-lazy-load.vue`.
- Do not simulate `uni.uploadFile`, `uni.chooseImage`, `uni.chooseFile`, `uni.chooseVideo`, `uni.previewImage`, `uni.request`, `uni.showToast`, or `wx.*` APIs.
- Do not add a Provider/global adapter or any new runtime layer.
- Keep every existing P32 prop, callback, default, and test unchanged.
- Keep P32 defaults (`maxCount: 9`, `autoUpload: true`, `uploadText: '上传图片'`, `capture: false`); source parity requires explicit props.
- Upload transport and auth stay application-owned through `uploadAdapter.uploadFile`.
- `UPLazyLoad` keeps the explicit visibility model (`visible`/`viewport`/`scrollOffset`/`threshold`/`once`); implicit global observation is a documented boundary.
- Every precedence rule is deterministic, documented, and covered by a focused test.
- Use `apply_patch` for manual edits. Work on the current `main` workspace and do not revert unrelated untracked files.
- Every implementation task ends with focused tests; commits contain only that task's files.

---

## File Structure

- Modify: `src/config/defaults.ts` — extend `UPUploadDefaults` and `UPLazyLoadDefaults` with source keys.
- Modify: `src/components/upload/types.ts` — source file fields, widened `accept`, source props, source payloads, extended `UPUploadRequest`.
- Modify: `src/components/upload/state.ts` — `url`-aware normalization and source payload helpers.
- Modify: `src/components/upload/UPUpload.tsx` — precedence rules and source flows.
- Modify: `tests/components/UPUpload.test.tsx` — source dual-surface tests.
- Modify: `src/components/lazy-load/UPLazyLoad.tsx` — source prop aliases.
- Modify: `tests/components/UPLazyLoad.test.tsx` — alias tests.
- Create: `docs/upload-source-compatibility.md` — audited source/RN matrix with precedence table.
- Modify: `README.md`, `docs/compatibility.md`, `docs/gap-matrix.md`.

---

## Task 1: Defaults And Public Types

**Files:**
- Modify: `src/config/defaults.ts`
- Modify: `src/components/upload/types.ts`
- Modify: `src/components/upload/state.ts`
- Modify: `tests/components/UPUpload.test.tsx`

**Interfaces:**
- Consumes: existing `UPUploadProps`, `UPUploadFile`, `UPChooseFileOptions`, `UPUploadAdapter`.
- Produces: source-shaped file fields, source props/events, extended adapter request, `url`-aware normalization helpers.

- [ ] **Step 1: Add failing pure-helper and type tests**

Append to `tests/components/UPUpload.test.tsx`:

```tsx
it('normalizes source-shaped files that use url instead of uri', () => {
  const file = normalizeUploadFile(
    { url: 'https://cdn.example/a.jpg', name: 'a.jpg', size: 100, thumb: 'https://cdn.example/a.jpg', type: 'image' },
    'source-1',
  );

  expect(file.uri).toBe('https://cdn.example/a.jpg');
  expect(file.url).toBe('https://cdn.example/a.jpg');
  expect(file.name).toBe('a.jpg');
  expect(file.size).toBe(100);
});

it('keeps uri as the source when both url and uri are present', () => {
  const file = normalizeUploadFile(
    { url: 'https://cdn.example/a.jpg', uri: 'file:///local.jpg' },
    'both',
  );

  expect(file.uri).toBe('file:///local.jpg');
  expect(file.url).toBe('https://cdn.example/a.jpg');
});

it('builds source detail payloads with name and index', () => {
  expect(buildUploadDetail('form-avatar', 3)).toEqual({ name: 'form-avatar', index: 3 });
});
```

- [ ] **Step 2: Run the focused test and verify the failures**

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
```

Expected: existing tests pass; new tests fail because the helpers and fields do not exist.

- [ ] **Step 3: Extend the upload defaults**

In `src/config/defaults.ts`, extend `UPUploadDefaults` with source keys (keep every existing key and value):

```ts
export type UPUploadDefaults = {
  accept: 'image' | 'file' | 'all' | 'media' | 'video';
  autoDelete: boolean;
  autoUpload: boolean;
  autoUploadApi: string;
  autoUploadAuthUrl: string;
  autoUploadDriver: '' | 'local' | 'oss' | 'cos' | 'kodo';
  autoUploadHeader: Record<string, string>;
  camera: string;
  capture: boolean | 'camera' | 'album' | readonly string[];
  compressed: boolean;
  customAfterAutoUpload: boolean;
  deletable: boolean;
  disabled: boolean;
  extension: readonly string[];
  fileList: readonly unknown[];
  formData: Record<string, unknown>;
  header: Record<string, string>;
  height: number;
  imageMode: string;
  maxCount: number;
  maxDuration: number;
  maxSize: number;
  multiple: boolean;
  name: string;
  previewFullImage: boolean;
  previewImage: boolean;
  sizeType: readonly string[];
  uploadIcon: string;
  uploadIconColor: string;
  uploadText: string;
  url: string;
  useBeforeRead: boolean;
  width: number;
};
```

In `sourceDefaults.props.upload`, keep every P32 value and add the source keys:

```ts
autoDelete: false,
autoUploadApi: '',
autoUploadAuthUrl: '',
autoUploadDriver: '' as const,
autoUploadHeader: Object.freeze({}) as Record<string, string>,
camera: 'back',
compressed: true,
customAfterAutoUpload: false,
extension: Object.freeze([]) as readonly string[],
height: 80,
imageMode: 'aspectFill',
maxDuration: 60,
previewFullImage: true,
sizeType: Object.freeze(['original', 'compressed']) as readonly string[],
uploadIcon: 'camera-fill',
uploadIconColor: '#D3D4D6',
useBeforeRead: false,
width: 80,
```

`src/config/store.ts` needs no structural change; the `upload` merge already spreads generically.

- [ ] **Step 4: Extend the upload types**

In `src/components/upload/types.ts`:

```ts
export type UPUploadAccept = 'image' | 'file' | 'all' | 'media' | 'video';
export type UPUploadCapture = boolean | 'camera' | 'album' | readonly string[];
export type UPUploadDriver = '' | 'local' | 'oss' | 'cos' | 'kodo';

export type UPUploadFile = {
  error?: unknown;
  id?: string;
  message?: string;
  name?: string;
  progress?: number;
  response?: unknown;
  size?: number;
  source?: unknown;
  status?: UPUploadFileStatus;
  thumb?: string;
  type?: string;
  url?: string;
  uri: string;
};
```

Add source detail payloads:

```ts
export type UPUploadDetail = {
  name: string;
  index: number;
};

export type UPUploadOversizePayload = UPUploadDetail & {
  file: UPUploadFile | readonly UPUploadFile[];
};

export type UPUploadClickPreviewPayload = UPUploadFile & UPUploadDetail;

export type UPUploadBeforeReadPayload = UPUploadDetail & {
  file: UPUploadFile | readonly UPUploadFile[];
  callback: (ok: boolean) => void;
};

export type UPUploadAfterAutoUploadPayload = {
  callback: (result?: { url?: string; thumb?: string }) => void;
} & Record<string, unknown>;
```

Extend `UPChooseFileOptions` with the source selection options:

```ts
export type UPChooseFileOptions = {
  accept: UPUploadAccept;
  capture?: UPUploadCapture;
  count: number;
  multiple: boolean;
  compressed?: boolean;
  camera?: string;
  extension?: readonly string[];
  maxDuration?: number;
  sizeType?: readonly string[];
};
```

Extend `UPUploadRequest` with the source upload options:

```ts
export type UPUploadRequest = {
  file: UPUploadFile;
  fileList: readonly UPUploadFile[];
  url?: string;
  header?: Record<string, string>;
  formData?: Record<string, unknown>;
  name: string;
  driver?: UPUploadDriver;
  authUrl?: string;
  onProgress: (progress: number) => void;
};
```

Add the source props to `UPUploadProps` (all optional):

```ts
sourceCompatible?: never; // reserved: strict mode is NOT part of P38
useBeforeRead?: boolean;
autoDelete?: boolean;
previewFullImage?: boolean;
autoUploadApi?: string;
autoUploadDriver?: UPUploadDriver;
autoUploadAuthUrl?: string;
autoUploadHeader?: Record<string, string>;
customAfterAutoUpload?: boolean;
extension?: readonly string[];
sizeType?: readonly string[];
camera?: string;
compressed?: boolean;
maxDuration?: number;
imageMode?: string;
width?: UPDimension;
height?: UPDimension;
uploadIcon?: string;
uploadIconColor?: string;
getVideoThumb?: boolean;
videoPreviewObjectFit?: string;
onOversize?: (payload: UPUploadOversizePayload) => void;
onClickPreview?: (payload: UPUploadClickPreviewPayload) => void;
onAfterAutoUpload?: (payload: UPUploadAfterAutoUploadPayload) => void;
```

Do not add a `sourceCompatible` flag; the dual surface is always active and
precedence is explicit. Import `UPDimension` from `../../utils`.

- [ ] **Step 5: Add `url`-aware normalization helpers**

In `src/components/upload/state.ts`:

```ts
import type { UPUploadDetail } from './types';

export function buildUploadDetail(
  fileList: readonly UPUploadFile[],
  name: string,
  index: number,
): UPUploadDetail {
  return { name, index };
}
```

In `normalizeUploadFile`, accept the source `url` field:

```ts
const uri = String(input.uri ?? input.url ?? '');
```

and retain the source `url` on the output item:

```ts
return {
  id: input.id ?? fallbackId,
  name,
  progress: clampUploadProgress(input.progress ?? 0),
  size,
  source: input,
  status: input.status ?? 'ready',
  thumb,
  type,
  url: input.url,
  uri,
};
```

- [ ] **Step 6: Run focused tests, typecheck, lint**

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
npm run typecheck
npx eslint src/components/upload/types.ts src/components/upload/state.ts src/config/defaults.ts tests/components/UPUpload.test.tsx
```

Expected: pass.

- [ ] **Step 7: Commit the public contract and helpers**

```powershell
git add src/config/defaults.ts src/components/upload/types.ts src/components/upload/state.ts tests/components/UPUpload.test.tsx
git commit -m "fix: add upload source field and payload contracts"
```

---

## Task 2: UPUpload Precedence And Source Flows

**Files:**
- Modify: `src/components/upload/UPUpload.tsx`
- Modify: `tests/components/UPUpload.test.tsx`

**Interfaces:**
- Consumes: the types and helpers from Task 1.
- Produces: deterministic precedence for source-vs-RN props, source event flows, and the extended adapter request.

- [ ] **Step 1: Add failing dual-surface component tests**

Append to `tests/components/UPUpload.test.tsx`:

```tsx
it('renders and previews source-shaped fileList items', () => {
  const uploadAdapter = adapter();
  const screen = renderRoot(
    <UPUpload
      defaultFileList={[{ name: 'cdn.jpg', thumb: 'https://cdn.example/cdn.jpg', type: 'image', url: 'https://cdn.example/cdn.jpg' }]}
      uploadAdapter={uploadAdapter}
    />,
  );

  expect(screen.getByText('cdn.jpg')).toBeTruthy();
  fireEvent.press(screen.getByTestId('up-upload-preview-0'));
  expect(uploadAdapter.previewFile).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'cdn.jpg', url: 'https://cdn.example/cdn.jpg' }),
    expect.any(Array),
  );
});

it('gates insertion through onBeforeRead callback when useBeforeRead is true', async () => {
  const uploadAdapter = adapter();
  const onBeforeRead = jest.fn(({ callback }) => callback(false));
  const screen = renderRoot(
    <UPUpload autoUpload={false} onBeforeRead={onBeforeRead as never} uploadAdapter={uploadAdapter} useBeforeRead />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(onBeforeRead).toHaveBeenCalledWith(expect.objectContaining({
    callback: expect.any(Function),
    index: 0,
    name: '',
  }));
  expect(screen.queryByText('photo.jpg')).toBeNull();
});

it('removes only when autoDelete is true and emits delete detail otherwise', () => {
  const uploadAdapter = adapter();
  const onDelete = jest.fn();
  const onUpdateFileList = jest.fn();
  const screen = renderRoot(
    <UPUpload
      autoDelete={false}
      defaultFileList={[{ name: 'old.jpg', uri: 'file:///old.jpg' }]}
      onDelete={onDelete}
      onUpdateFileList={onUpdateFileList}
      uploadAdapter={uploadAdapter}
    />,
  );

  fireEvent.press(screen.getByTestId('up-upload-delete-0'));
  expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ index: 0, name: '' }));
  expect(screen.getByText('old.jpg')).toBeTruthy();
  expect(onUpdateFileList).not.toHaveBeenCalled();

  screen.rerender(
    <UPRoot>
      <UPUpload
        autoDelete
        defaultFileList={[{ name: 'old.jpg', uri: 'file:///old.jpg' }]}
        onDelete={onDelete}
        onUpdateFileList={onUpdateFileList}
        uploadAdapter={uploadAdapter}
      />
    </UPRoot>,
  );

  fireEvent.press(screen.getByTestId('up-upload-delete-0'));
  expect(screen.queryByText('old.jpg')).toBeNull();
  expect(onUpdateFileList).toHaveBeenCalledWith([]);
});

it('rejects the whole batch through onOversize and emits source detail', async () => {
  const uploadAdapter = adapter([{ name: 'big.mov', size: 1000, type: 'video/quicktime', uri: 'file:///big.mov' }]);
  const onOversize = jest.fn();
  const screen = renderRoot(
    <UPUpload maxSize={50} onOversize={onOversize} uploadAdapter={uploadAdapter} />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(onOversize).toHaveBeenCalledWith(expect.objectContaining({
    file: expect.arrayContaining([expect.objectContaining({ name: 'big.mov' })]),
    index: 0,
    name: '',
  }));
  expect(screen.queryByText('big.mov')).toBeNull();
});

it('emits clickPreview with source detail on every item tap', () => {
  const uploadAdapter = adapter();
  const onClickPreview = jest.fn();
  const screen = renderRoot(
    <UPUpload
      defaultFileList={[{ name: 'old.jpg', uri: 'file:///old.jpg' }]}
      name="avatar"
      onClickPreview={onClickPreview}
      uploadAdapter={uploadAdapter}
    />,
  );

  fireEvent.press(screen.getByTestId('up-upload-preview-0'));
  expect(onClickPreview).toHaveBeenCalledWith(expect.objectContaining({
    index: 0,
    name: 'avatar',
    uri: 'file:///old.jpg',
  }));
});

it('routes source upload config through the adapter request', async () => {
  const uploadAdapter = adapter();
  const screen = renderRoot(
    <UPUpload
      autoUploadApi="https://api.example/upload"
      autoUploadDriver="local"
      autoUploadHeader={{ 'X-Api-Key': 'k1' }}
      autoUploadAuthUrl="https://api.example/sign"
      header={{ 'X-Extra': 'e1' }}
      uploadAdapter={uploadAdapter}
    />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(uploadAdapter.uploadFile).toHaveBeenCalledWith(expect.objectContaining({
    authUrl: 'https://api.example/sign',
    driver: 'local',
    header: { 'X-Api-Key': 'k1', 'X-Extra': 'e1' },
    url: 'https://api.example/upload',
  }));
});

it('resolves the success url through customAfterAutoUpload', async () => {
  const uploadAdapter = adapter();
  const onAfterAutoUpload = jest.fn(({ callback }) => callback({ url: 'https://cdn.example/ok.jpg' }));
  const screen = renderRoot(
    <UPUpload
      customAfterAutoUpload
      onAfterAutoUpload={onAfterAutoUpload as never}
      uploadAdapter={uploadAdapter}
    />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(onAfterAutoUpload).toHaveBeenCalledWith(expect.objectContaining({ callback: expect.any(Function) }));
  await waitFor(() => {
    expect(uploadAdapter.uploadFile).toHaveBeenCalledTimes(1);
  });
  expect(screen.getByTestId('up-upload-file-0').props.accessibilityState).toEqual(
    expect.objectContaining({ busy: false }),
  );
});
```

- [ ] **Step 2: Run the tests and verify the failures**

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
```

- [ ] **Step 3: Implement precedence resolution helpers**

In `src/components/upload/UPUpload.tsx`, add resolved values:

```tsx
const previewEnabled = input.previewFullImage !== undefined
  ? input.previewFullImage
  : props.previewImage;
const sourceDeleteMode = input.autoDelete !== undefined;
const uploadUrl = props.autoUploadApi || props.url;
```

- [ ] **Step 4: Implement the strict read/before-read/oversize flow**

Rework `choose` so that after normalization:

1. `input.onBeforeRead` fires with the RN files array when `useBeforeRead` is
   false (existing behavior).
2. When `useBeforeRead` is true, build the gate payload with
   `buildUploadDetail(filesRef.current, props.name, filesRef.current.length)`
   and await `callback`; `false` stops the batch silently. Without a
   listener, continue.
3. Oversize: when `input.onOversize` exists and any file is oversized, emit
   `onOversize({ file: normalized, ...detail })` and return without inserting.
   Otherwise keep the existing filtered `onChooseError` path.
4. Keep the existing `beforeRead` function gate (`beforeResult === false`
   stops) and the existing insertion/auto-upload order for non-strict callers.

- [ ] **Step 5: Implement source delete semantics**

In `remove`/`onDelete` handling:

- When `sourceDeleteMode` is true, delete follows source semantics:
  - `autoDelete === true`: abort the task, remove, emit only
    `onUpdateFileList(next)` (no `onDelete` event).
  - `autoDelete === false`: emit
    `onDelete({ file, ...buildUploadDetail(files, props.name, index) })` and
    do NOT remove.
- When `sourceDeleteMode` is false, keep the existing RN remove-and-emit
  behavior with the extended `name` field added to the payload.
- The imperative `remove(index)` ref always removes.

- [ ] **Step 6: Implement click-preview and preview routing**

In `preview`:

```tsx
input.onClickPreview?.({ ...file, ...buildUploadDetail(currentFiles, props.name, index) });
input.onPreview?.({ file, fileList: currentFiles, index });
if (previewEnabled && props.uploadAdapter?.previewFile) {
  void props.uploadAdapter.previewFile(file, currentFiles);
}
```

`onClickPreview` always fires; built-in preview stays adapter-owned through
`previewFile`.

- [ ] **Step 7: Implement the source upload request and after-auto-upload**

In `uploadOne`, extend the adapter request:

```tsx
const task = normalizeUploadTask(props.uploadAdapter.uploadFile({
  file,
  fileList: uploading,
  url: uploadUrl,
  header: { ...props.autoUploadHeader, ...props.header },
  formData: props.formData,
  name: props.name,
  driver: props.autoUploadDriver,
  authUrl: props.autoUploadAuthUrl,
  onProgress,
}));
```

On success, when `customAfterAutoUpload` and `input.onAfterAutoUpload` are
both present:

```tsx
const result = await new Promise<{ url?: string; thumb?: string } | undefined>((resolve) => {
  input.onAfterAutoUpload?.({ ...(response as Record<string, unknown>), callback: resolve });
});
const successUrl = typeof result?.url === 'string' ? result.url : undefined;
```

Mark the file `success` with `progress: 100`, set `url`/`uri` to `successUrl`
when present, and store `response`. Without `customAfterAutoUpload`, keep the
existing success path.

- [ ] **Step 8: Render source cell defaults**

Replace the hardcoded cell constants with `getPx(props.width)` /
`getPx(props.height)` and `props.imageMode`; use `props.uploadIcon` /
`props.uploadIconColor` for the add cell (defaults `camera-fill` /
`#D3D4D6`). Honor per-item `deletable` when it is a boolean.

- [ ] **Step 9: Run focused tests, typecheck, lint**

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
npm run typecheck
npx eslint src/components/upload/UPUpload.tsx tests/components/UPUpload.test.tsx
```

Expected: all pass.

- [ ] **Step 10: Commit the component implementation**

```powershell
git add src/components/upload/UPUpload.tsx tests/components/UPUpload.test.tsx
git commit -m "fix: align upload dual-surface precedence and source flows"
```

---

## Task 3: UPLazyLoad Source Aliases

**Files:**
- Modify: `src/components/lazy-load/UPLazyLoad.tsx`
- Modify: `tests/components/UPLazyLoad.test.tsx`

**Interfaces:**
- Consumes: existing explicit visibility model and `UPImage`.
- Produces: source prop aliases (`image`, `imgMode`, `loadingImg`, `errorImg`, `index`, `onClick`) without changing the visibility model.

- [ ] **Step 1: Add failing alias tests**

Append to `tests/components/UPLazyLoad.test.tsx`:

```tsx
it('maps source image and imgMode aliases onto the RN surface', () => {
  const screen = renderRoot(
    <UPLazyLoad height={100} image="https://example.com/b.jpg" imgMode="widthFix" visible width={100} />,
  );

  expect(screen.getByTestId('up-lazy-load-content')).toBeTruthy();
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('renders a loading image placeholder from loadingImg', () => {
  const screen = renderRoot(
    <UPLazyLoad
      height={100}
      loadingImg="https://example.com/placeholder.png"
      src="https://example.com/a.jpg"
      visible={false}
      width={100}
    />,
  );

  expect(screen.getByTestId('up-lazy-load-placeholder-image')).toBeTruthy();
});

it('emits click with the source index', () => {
  const onClick = jest.fn();
  const screen = renderRoot(
    <UPLazyLoad
      height={100}
      index="card-1"
      onClick={onClick}
      src="https://example.com/a.jpg"
      visible
      width={100}
    />,
  );

  fireEvent.press(screen.getByTestId('up-lazy-load-content'));
  expect(onClick).toHaveBeenCalledWith('card-1');
});
```

- [ ] **Step 2: Run the tests and verify the failures**

```powershell
npm test -- --runTestsByPath tests/components/UPLazyLoad.test.tsx
```

- [ ] **Step 3: Implement the aliases**

In `src/components/lazy-load/UPLazyLoad.tsx`:

```tsx
export type UPLazyLoadProps = {
  // existing props unchanged
  image?: string;
  imgMode?: string;
  loadingImg?: string;
  errorImg?: string;
  index?: string | number;
  onClick?: (index?: string | number) => void;
};
```

Resolve aliases with RN props winning:

```tsx
const src = input.src ?? props.image;
const mode = input.mode ?? props.imgMode;
```

Render `loadingImg` as a placeholder image when supplied:

```tsx
props.loadingImg ? (
  <UPImage height={props.height} mode="aspectFill" src={props.loadingImg} testID="up-lazy-load-placeholder-image" width={props.width} />
) : (props.placeholder ?? <View ... testID="up-lazy-load-placeholder" />)
```

Pass `errorImg` through to `UPImage` `error` when `src` is absent. Wrap the
content in a `Pressable` with `onPress={() => props.onClick?.(props.index)}`
and `testID="up-lazy-load-content"`.

- [ ] **Step 4: Run the tests, typecheck, lint**

```powershell
npm test -- --runTestsByPath tests/components/UPLazyLoad.test.tsx
npm run typecheck
npx eslint src/components/lazy-load tests/components/UPLazyLoad.test.tsx
```

- [ ] **Step 5: Commit the lazy-load aliases**

```powershell
git add src/components/lazy-load tests/components/UPLazyLoad.test.tsx
git commit -m "feat: add lazy-load source prop aliases"
```

---

## Task 4: Source Matrix And User Documentation

**Files:**
- Create: `docs/upload-source-compatibility.md`
- Modify: `README.md`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes: the final public contracts and tests from Tasks 1-3.
- Produces: a source-audited matrix with the precedence table and explicit boundaries.

- [ ] **Step 1: Write the dedicated source matrix**

Create `docs/upload-source-compatibility.md` covering every audited
`u-upload` and `u-lazy-load` prop/event with the React Native surface, status
(Supported / Emulated / Boundary), the P38 precedence table, and explicit
boundary notes for `uni.*`, `wx.*`, video capture, cloud drivers,
`getVideoThumb`, and implicit lazy observation.

- [ ] **Step 2: Update README**

Add a compact P38 block: source-shaped `fileList` (`url`), source events
(`oversize`, `clickPreview`, `beforeRead`/`useBeforeRead`, `delete`/
`autoDelete`, `afterAutoUpload`), source upload config
(`autoUploadApi`/`autoUploadHeader`/`autoUploadDriver`), and the precedence
note that explicit source props win over the RN surface.

- [ ] **Step 3: Update the compatibility guide**

Replace/extend the P32 upload text in `docs/compatibility.md` with the P38
dual-surface behavior and boundary list, including `UPLazyLoad` aliases.

- [ ] **Step 4: Update the gap matrix**

Add the P38 rows to `docs/gap-matrix.md`.

- [ ] **Step 5: Check documentation claims**

```powershell
rg -n -i "uni\.(uploadFile|chooseImage|chooseFile|chooseVideo|previewImage|request|showToast)|IntersectionObserver|wx\.chooseMedia|wx\.previewMedia" README.md docs
git diff --check
```

Expected: every match is an explicit limitation or boundary; no unsupported
API is presented as implemented.

- [ ] **Step 6: Commit the documentation**

```powershell
git add docs/upload-source-compatibility.md README.md docs/compatibility.md docs/gap-matrix.md
git commit -m "docs: finalize p38 upload source compatibility"
```

---

## Task 5: Run Full Quality Gates And Review The Public Diff

**Files:**
- Read: `src/components/upload/*`, `src/components/lazy-load/UPLazyLoad.tsx`, `src/config/defaults.ts`, tests, docs.

**Interfaces:**
- Consumes: the complete P38 implementation from Tasks 1-4.
- Produces: passing focused and repository gates and a verified public diff.

- [ ] **Step 1: Run focused suites**

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx tests/components/UPLazyLoad.test.tsx
```

- [ ] **Step 2: Run the complete repository test suite**

```powershell
npm test
```

- [ ] **Step 3: Run static, build, and whitespace checks**

```powershell
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
git diff --check
```

- [ ] **Step 4: Review the public API diff**

```powershell
git diff HEAD~N..HEAD -- src/components/upload src/components/lazy-load src/config README.md docs
rg -n -i "uni\.(uploadFile|chooseImage|chooseFile|chooseVideo|previewImage|request|showToast)|IntersectionObserver" src README.md docs
git status --short
```

Confirm the only new public surfaces are the source props/events and payload
types; every `uni`/`IntersectionObserver` match is a documented boundary.
`git status --short` may still show unrelated pre-existing untracked files;
leave them untouched.

- [ ] **Step 5: Commit only final P38 corrections**

If the review identifies a P38-only defect, add a focused regression test and
fix, rerun the affected gates, then commit only the P38 files. Do not create
a no-op verification commit.

## Execution Notes

- Execute Tasks 1-4 in order, then Task 5.
- Use `superpowers:executing-plans` for inline execution or `superpowers:subagent-driven-development` for delegated execution.
- Do not simulate `uni` globals, do not add a runtime layer, and do not polyfill `IntersectionObserver`.
- Keep every emitted array and modified file item immutable.
- Report focused tests, full tests, typecheck, lint, build, pack dry-run, diff check, and untouched pre-existing worktree files in the handoff.
