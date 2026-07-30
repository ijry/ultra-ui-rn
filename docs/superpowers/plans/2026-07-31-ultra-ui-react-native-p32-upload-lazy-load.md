# P32 Upload And Lazy Load Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `UPUpload` and `UPLazyLoad` with source-compatible queue, upload, preview, delete, lazy-render, and configuration behavior.

**Architecture:** `UPUpload` owns normalized file-list state and delegates picker/upload work through an explicit adapter. Optional picker packages are declared as optional peers and only used through app-owned adapter helpers, so the core library does not force native modules on every consumer. `UPLazyLoad` is an explicit visibility-driven wrapper around `UPImage` or custom content, avoiding implicit global scroll assumptions.

**Tech Stack:** React, TypeScript, React Native core primitives, existing `UPImage`, existing `UPIcon`, existing config store, Jest, `@testing-library/react-native`, optional peer packages `react-native-image-picker` and `@react-native-documents/picker`.

## Global Constraints

- Scope is `UPUpload` plus `UPLazyLoad`.
- Add picker packages as optional peer dependencies, not direct dependencies.
- Do not hard-code authentication, signed URL, OSS/S3 multipart, or app-specific upload behavior.
- Upload execution remains adapter-owned through an explicit `uploadFile` function.
- Do not statically import optional native picker modules from core component files.
- Do not implement background upload, resumable upload, multipart upload, native compression, native cropping, or global scroll observation.
- Keep uview-plus prop and event names where practical.
- Preserve existing repository patterns: named exports, component folders, defaults in `src/config/defaults.ts`, config merge in `src/config/store.ts`, tests under `tests/components`.

---

## File Structure

- Modify `package.json`: add optional peer entries and metadata for picker packages.
- Modify `package-lock.json`: keep root package peer metadata synchronized with `package.json`.
- Modify `tests/config/store.test.ts`: verify new config defaults merge.
- Modify `src/config/defaults.ts`: add `UPUploadDefaults`, `UPLazyLoadDefaults`, and source defaults.
- Modify `src/config/store.ts`: add `upload` and `lazyLoad` override, initialization, and merge slots.
- Create `src/components/upload/types.ts`: shared upload file, event, adapter, ref, and render payload types.
- Create `src/components/upload/state.ts`: pure helpers for file normalization, queue updates, progress clamping, max-size filtering, and task normalization.
- Create `src/components/upload/adapters.ts`: optional helper factories that accept peer-library functions from app code.
- Create `src/components/upload/UPUpload.tsx`: UI, queue orchestration, adapter calls, callbacks, and ref methods.
- Create `src/components/upload/index.ts`: public upload exports.
- Create `tests/components/UPUpload.test.tsx`: focused upload behavior tests.
- Create `src/components/lazy-load/UPLazyLoad.tsx`: explicit lazy render component.
- Create `src/components/lazy-load/index.ts`: public lazy-load exports.
- Create `tests/components/UPLazyLoad.test.tsx`: focused lazy-load tests.
- Modify `src/components/index.ts`: export upload and lazy-load components.
- Modify `README.md`: add compact P32 usage.
- Modify `example/App.tsx`: add compact upload and lazy-load examples.
- Modify `docs/compatibility.md`: add P32 notes.
- Modify `docs/gap-matrix.md`: add P32 matrix rows.

---

### Task 1: Metadata And Config Defaults

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/store.ts`
- Modify: `tests/config/store.test.ts`

**Interfaces:**
- Produces config keys: `UPProps['upload']`, `UPProps['lazyLoad']`.
- Produces optional peer metadata for `react-native-image-picker` and `@react-native-documents/picker`.
- Consumed by later tasks through `useUPConfig().props.upload` and `useUPConfig().props.lazyLoad`.

- [ ] **Step 1: Add failing config and package metadata tests**

Append these tests to `tests/config/store.test.ts`:

```ts
import { getUPConfig, resetUPConfigForTests, setUPConfig } from '../../src/config/store';

const packageJson = jest.requireActual('../../package.json') as {
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

it('declares optional picker peers for upload integration', () => {
  expect(packageJson.peerDependencies).toEqual(
    expect.objectContaining({
      '@react-native-documents/picker': expect.any(String),
      'react-native-image-picker': expect.any(String),
    }),
  );
  expect(packageJson.peerDependenciesMeta).toEqual(
    expect.objectContaining({
      '@react-native-documents/picker': { optional: true },
      'react-native-image-picker': { optional: true },
    }),
  );
});

it('merges P32 upload and lazy-load defaults through setUPConfig', () => {
  resetUPConfigForTests();

  expect(getUPConfig().props.upload).toEqual(
    expect.objectContaining({
      accept: 'image',
      autoUpload: true,
      deletable: true,
      maxCount: 9,
      name: 'file',
      previewImage: true,
    }),
  );
  expect(getUPConfig().props.lazyLoad).toEqual(
    expect.objectContaining({
      height: 100,
      mode: 'aspectFill',
      once: true,
      threshold: 0,
      width: 100,
    }),
  );

  setUPConfig({
    props: {
      lazyLoad: { threshold: 80 },
      upload: { accept: 'all', maxCount: 3 },
    },
  });

  expect(getUPConfig().props.upload).toEqual(
    expect.objectContaining({ accept: 'all', autoUpload: true, maxCount: 3 }),
  );
  expect(getUPConfig().props.lazyLoad).toEqual(
    expect.objectContaining({ once: true, threshold: 80 }),
  );
});
```

- [ ] **Step 2: Run the config test and verify it fails**

Run:

```powershell
npm test -- --runTestsByPath tests/config/store.test.ts
```

Expected result: fail because package optional peer metadata and `upload` / `lazyLoad` config keys do not exist.

- [ ] **Step 3: Add optional peer metadata**

Modify `package.json` so the existing `peerDependencies` gains these entries:

```json
"@react-native-documents/picker": "^12.0.2",
"react-native-image-picker": "^8.2.1"
```

Add `peerDependenciesMeta` beside `peerDependencies`:

```json
"peerDependenciesMeta": {
  "@react-native-documents/picker": {
    "optional": true
  },
  "react-native-image-picker": {
    "optional": true
  }
}
```

Do not add these packages to `dependencies`; they are optional native peers.

- [ ] **Step 4: Synchronize package lock metadata**

Run:

```powershell
npm install --package-lock-only --ignore-scripts
```

Expected result: `package-lock.json` root package metadata includes the new optional peer dependency entries without installing new runtime dependencies.

- [ ] **Step 5: Add defaults types**

In `src/config/defaults.ts`, add these types near the surrounding media/list defaults:

```ts
export type UPUploadDefaults = {
  accept: 'image' | 'file' | 'all';
  autoUpload: boolean;
  capture: boolean | 'camera' | 'album';
  deletable: boolean;
  disabled: boolean;
  fileList: readonly unknown[];
  formData: Record<string, unknown>;
  header: Record<string, string>;
  maxCount: number;
  maxSize: number;
  multiple: boolean;
  name: string;
  previewImage: boolean;
  uploadText: string;
  url: string;
};

export type UPLazyLoadDefaults = {
  height: UPDimension;
  mode: string;
  once: boolean;
  threshold: number;
  width: UPDimension;
};
```

Add these keys to `UPProps`:

```ts
upload: UPUploadDefaults;
lazyLoad: UPLazyLoadDefaults;
```

- [ ] **Step 6: Add source defaults**

In `sourceDefaults.props`, add these entries near `image` / `album` / other media defaults:

```ts
upload: Object.freeze({
  accept: 'image' as const,
  autoUpload: true,
  capture: false as const,
  deletable: true,
  disabled: false,
  fileList: Object.freeze([]) as readonly unknown[],
  formData: Object.freeze({}) as Record<string, unknown>,
  header: Object.freeze({}) as Record<string, string>,
  maxCount: 9,
  maxSize: Number.POSITIVE_INFINITY,
  multiple: false,
  name: 'file',
  previewImage: true,
  uploadText: '上传图片',
  url: '',
}),
lazyLoad: Object.freeze({
  height: 100,
  mode: 'aspectFill',
  once: true,
  threshold: 0,
  width: 100,
}),
```

- [ ] **Step 7: Wire config store overrides**

In `src/config/store.ts`, add override slots:

```ts
upload?: Partial<UPProps['upload']>;
lazyLoad?: Partial<UPProps['lazyLoad']>;
```

In `createSourceState().props`, add:

```ts
upload: { ...sourceDefaults.props.upload },
lazyLoad: { ...sourceDefaults.props.lazyLoad },
```

In `setUPConfig().props`, add:

```ts
upload: { ...state.props.upload, ...overrides.props?.upload },
lazyLoad: { ...state.props.lazyLoad, ...overrides.props?.lazyLoad },
```

- [ ] **Step 8: Run the config test and verify it passes**

Run:

```powershell
npm test -- --runTestsByPath tests/config/store.test.ts
```

Expected result: pass.

- [ ] **Step 9: Commit metadata and config defaults**

Run:

```powershell
git add -- package.json package-lock.json src/config/defaults.ts src/config/store.ts tests/config/store.test.ts
git commit -m "feat: add p32 upload config defaults"
```

---

### Task 2: Upload Types, State Helpers, And Adapter Helpers

**Files:**
- Create: `src/components/upload/types.ts`
- Create: `src/components/upload/state.ts`
- Create: `src/components/upload/adapters.ts`
- Create: `src/components/upload/index.ts`
- Create: `tests/components/UPUpload.test.tsx`

**Interfaces:**
- Consumes config defaults from Task 1.
- Produces `UPUploadFile`, `UPUploadAdapter`, `UPUploadRef`, `normalizeUploadFile`, `clampUploadProgress`, `filterUploadFiles`, `updateUploadFile`, `normalizeUploadTask`, `createImagePickerChooseFile`, `createDocumentPickerChooseFile`.
- Later `UPUpload.tsx` imports these helpers.

- [ ] **Step 1: Write failing pure helper and adapter tests**

Create `tests/components/UPUpload.test.tsx` with these initial tests:

```tsx
import {
  clampUploadProgress,
  createDocumentPickerChooseFile,
  createImagePickerChooseFile,
  filterUploadFiles,
  normalizeUploadFile,
  normalizeUploadTask,
  updateUploadFile,
  type UPUploadFile,
} from '../../src';

it('normalizes selected upload files with stable source metadata', () => {
  expect(
    normalizeUploadFile(
      { fileName: 'photo.jpg', fileSize: 120, type: 'image/jpeg', uri: 'file:///photo.jpg' },
      'asset-1',
    ),
  ).toEqual({
    id: 'asset-1',
    name: 'photo.jpg',
    progress: 0,
    size: 120,
    source: { fileName: 'photo.jpg', fileSize: 120, type: 'image/jpeg', uri: 'file:///photo.jpg' },
    status: 'ready',
    thumb: 'file:///photo.jpg',
    type: 'image/jpeg',
    uri: 'file:///photo.jpg',
  });
});

it('clamps upload progress to 0..100', () => {
  expect(clampUploadProgress(-10)).toBe(0);
  expect(clampUploadProgress(42.4)).toBe(42);
  expect(clampUploadProgress(150)).toBe(100);
});

it('filters max count and max size before queue insertion', () => {
  const files: UPUploadFile[] = [
    { name: 'a.jpg', size: 10, uri: 'file:///a.jpg' },
    { name: 'b.jpg', size: 100, uri: 'file:///b.jpg' },
    { name: 'c.jpg', size: 20, uri: 'file:///c.jpg' },
  ];

  const result = filterUploadFiles(files, { currentCount: 1, maxCount: 3, maxSize: 50 });

  expect(result.accepted.map((file) => file.name)).toEqual(['a.jpg', 'c.jpg']);
  expect(result.rejected.map((item) => item.file.name)).toEqual(['b.jpg']);
  expect(result.rejected[0]?.reason).toBe('size');
});

it('updates one upload file without mutating the source list', () => {
  const source = [
    { name: 'a.jpg', uri: 'file:///a.jpg' },
    { name: 'b.jpg', uri: 'file:///b.jpg' },
  ];

  const next = updateUploadFile(source, 1, { progress: 70, status: 'uploading' });

  expect(next).toEqual([
    { name: 'a.jpg', uri: 'file:///a.jpg' },
    { name: 'b.jpg', progress: 70, status: 'uploading', uri: 'file:///b.jpg' },
  ]);
  expect(source[1]).toEqual({ name: 'b.jpg', uri: 'file:///b.jpg' });
});

it('normalizes upload tasks from promises and abortable task objects', async () => {
  const promiseTask = normalizeUploadTask(Promise.resolve('done'));
  await expect(promiseTask.promise).resolves.toBe('done');
  expect(promiseTask.abort).toBeUndefined();

  const abort = jest.fn();
  const objectTask = normalizeUploadTask({ abort, promise: Promise.resolve('ok') });
  objectTask.abort?.();
  await expect(objectTask.promise).resolves.toBe('ok');
  expect(abort).toHaveBeenCalledTimes(1);
});

it('creates image-picker choose helper without importing native modules directly', async () => {
  const launchImageLibrary = jest.fn(async () => ({
    assets: [{ fileName: 'photo.jpg', fileSize: 120, type: 'image/jpeg', uri: 'file:///photo.jpg' }],
  }));
  const choose = createImagePickerChooseFile(launchImageLibrary);

  await expect(choose({ accept: 'image', count: 1, multiple: false })).resolves.toEqual([
    expect.objectContaining({ name: 'photo.jpg', type: 'image/jpeg', uri: 'file:///photo.jpg' }),
  ]);
  expect(launchImageLibrary).toHaveBeenCalledWith(expect.objectContaining({ mediaType: 'photo', selectionLimit: 1 }));
});

it('creates document-picker choose helper from an injected pick function', async () => {
  const pick = jest.fn(async () => [
    { name: 'report.pdf', size: 200, type: 'application/pdf', uri: 'file:///report.pdf' },
  ]);
  const choose = createDocumentPickerChooseFile(pick);

  await expect(choose({ accept: 'file', count: 2, multiple: true })).resolves.toEqual([
    expect.objectContaining({ name: 'report.pdf', type: 'application/pdf', uri: 'file:///report.pdf' }),
  ]);
  expect(pick).toHaveBeenCalledWith(expect.objectContaining({ allowMultiSelection: true }));
});
```

- [ ] **Step 2: Run upload helper tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
```

Expected result: fail because upload exports do not exist.

- [ ] **Step 3: Create upload public types**

Create `src/components/upload/types.ts`:

```ts
export type UPUploadFileStatus = 'ready' | 'uploading' | 'success' | 'error';
export type UPUploadAccept = 'image' | 'file' | 'all';
export type UPUploadCapture = boolean | 'camera' | 'album';

export type UPUploadFile = {
  error?: unknown;
  id?: string;
  name?: string;
  progress?: number;
  response?: unknown;
  size?: number;
  source?: unknown;
  status?: UPUploadFileStatus;
  thumb?: string;
  type?: string;
  uri: string;
};

export type UPChooseFileOptions = {
  accept: UPUploadAccept;
  capture?: UPUploadCapture;
  count: number;
  multiple: boolean;
};

export type UPUploadRequest = {
  file: UPUploadFile;
  fileList: readonly UPUploadFile[];
  formData?: Record<string, unknown>;
  header?: Record<string, string>;
  name: string;
  onProgress: (progress: number) => void;
  url?: string;
};

export type UPUploadTask = {
  abort?: () => void;
  promise: Promise<unknown>;
};

export type UPUploadAdapter = {
  chooseFile?: (options: UPChooseFileOptions) => Promise<readonly UPUploadFile[]>;
  previewFile?: (file: UPUploadFile, fileList: readonly UPUploadFile[]) => void | Promise<void>;
  uploadFile?: (request: UPUploadRequest) => Promise<unknown> | UPUploadTask;
};

export type UPUploadRejectedFile = {
  file: UPUploadFile;
  reason: 'count' | 'size';
};

export type UPUploadActions = {
  choose: () => Promise<void>;
  preview: (index: number) => void;
  remove: (index: number) => void;
  retry: (index: number) => Promise<void>;
  upload: (index?: number) => Promise<void>;
};

export type UPUploadRenderPayload = {
  actions: UPUploadActions;
  file: UPUploadFile;
  index: number;
};

export type UPUploadRenderUploadPayload = {
  choose: () => Promise<void>;
  disabled: boolean;
  remaining: number;
};

export type UPUploadEventPayload = {
  file: UPUploadFile;
  fileList?: readonly UPUploadFile[];
  index: number;
};

export type UPUploadProgressPayload = UPUploadEventPayload & {
  progress: number;
};

export type UPUploadSuccessPayload = UPUploadEventPayload & {
  response: unknown;
};

export type UPUploadErrorPayload = UPUploadEventPayload & {
  error: unknown;
};

export type UPUploadChooseErrorPayload = {
  error: unknown;
  rejected?: readonly UPUploadRejectedFile[];
};

export type UPUploadRef = {
  choose: () => Promise<void>;
  clear: () => void;
  getFiles: () => readonly UPUploadFile[];
  remove: (index: number) => void;
  retry: (index: number) => Promise<void>;
  upload: (index?: number) => Promise<void>;
};
```

- [ ] **Step 4: Create upload state helpers**

Create `src/components/upload/state.ts`:

```ts
import type {
  UPUploadFile,
  UPUploadRejectedFile,
  UPUploadTask,
} from './types';

type LooseSelectedFile = Partial<UPUploadFile> & {
  fileName?: string;
  fileSize?: number;
  name?: string;
  size?: number;
  type?: string;
  uri?: string;
};

export function clampUploadProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeUploadFile(input: LooseSelectedFile, fallbackId: string): UPUploadFile {
  const uri = String(input.uri ?? '');
  const type = input.type;
  const name = input.name ?? input.fileName ?? uri.split('/').pop() ?? fallbackId;
  const size = input.size ?? input.fileSize;
  const thumb = type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(uri) ? uri : undefined;

  return {
    id: input.id ?? fallbackId,
    name,
    progress: clampUploadProgress(input.progress ?? 0),
    size,
    source: input,
    status: input.status ?? 'ready',
    thumb,
    type,
    uri,
  };
}

export function filterUploadFiles(
  files: readonly UPUploadFile[],
  options: { currentCount: number; maxCount: number; maxSize: number },
): { accepted: UPUploadFile[]; rejected: UPUploadRejectedFile[] } {
  const accepted: UPUploadFile[] = [];
  const rejected: UPUploadRejectedFile[] = [];
  const remaining = Math.max(0, options.maxCount - options.currentCount);

  files.forEach((file) => {
    if (file.size !== undefined && file.size > options.maxSize) {
      rejected.push({ file, reason: 'size' });
      return;
    }
    if (accepted.length >= remaining) {
      rejected.push({ file, reason: 'count' });
      return;
    }
    accepted.push(file);
  });

  return { accepted, rejected };
}

export function updateUploadFile(
  files: readonly UPUploadFile[],
  index: number,
  patch: Partial<UPUploadFile>,
): UPUploadFile[] {
  return files.map((file, currentIndex) => (
    currentIndex === index ? { ...file, ...patch } : file
  ));
}

export function normalizeUploadTask(task: Promise<unknown> | UPUploadTask): UPUploadTask {
  if ('promise' in task) return task;
  return { promise: task };
}
```

- [ ] **Step 5: Create optional picker adapter helpers**

Create `src/components/upload/adapters.ts`:

```ts
import { normalizeUploadFile } from './state';
import type { UPChooseFileOptions, UPUploadFile } from './types';

type ImagePickerAsset = {
  fileName?: string;
  fileSize?: number;
  type?: string;
  uri?: string;
};

type ImagePickerResponse = {
  assets?: readonly ImagePickerAsset[];
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
};

type LaunchImageLibrary = (options: Record<string, unknown>) => Promise<ImagePickerResponse>;
type LaunchCamera = (options: Record<string, unknown>) => Promise<ImagePickerResponse>;

type DocumentPickerFile = {
  name?: string;
  size?: number;
  type?: string;
  uri?: string;
};

type DocumentPick = (options: Record<string, unknown>) => Promise<readonly DocumentPickerFile[]>;

function mediaTypeForAccept(accept: UPChooseFileOptions['accept']): 'mixed' | 'photo' {
  return accept === 'image' ? 'photo' : 'mixed';
}

function assertUri(uri: string | undefined): uri is string {
  return Boolean(uri);
}

export function createImagePickerChooseFile(
  launchImageLibrary: LaunchImageLibrary,
  launchCamera?: LaunchCamera,
): (options: UPChooseFileOptions) => Promise<readonly UPUploadFile[]> {
  return async (options) => {
    const pickerOptions = {
      mediaType: mediaTypeForAccept(options.accept),
      selectionLimit: options.multiple ? options.count : 1,
    };
    const response = options.capture === 'camera' && launchCamera
      ? await launchCamera(pickerOptions)
      : await launchImageLibrary(pickerOptions);

    if (response.didCancel) return [];
    if (response.errorCode || response.errorMessage) {
      throw new Error(response.errorMessage ?? response.errorCode ?? 'Image picker failed');
    }

    return (response.assets ?? [])
      .filter((asset) => assertUri(asset.uri))
      .map((asset, index) => normalizeUploadFile(asset, `image-${Date.now()}-${index}`));
  };
}

export function createDocumentPickerChooseFile(
  pick: DocumentPick,
): (options: UPChooseFileOptions) => Promise<readonly UPUploadFile[]> {
  return async (options) => {
    const files = await pick({
      allowMultiSelection: options.multiple,
      type: options.accept === 'image' ? ['image/*'] : ['*/*'],
    });

    return files
      .filter((file) => assertUri(file.uri))
      .slice(0, options.count)
      .map((file, index) => normalizeUploadFile(file, `document-${Date.now()}-${index}`));
  };
}
```

- [ ] **Step 6: Export upload helpers**

Create `src/components/upload/index.ts`:

```ts
export * from './adapters';
export * from './state';
export * from './types';
```

Temporarily add the upload barrel to `src/components/index.ts` so helper tests can import from `../../src`:

```ts
export * from './upload';
```

- [ ] **Step 7: Run upload helper tests and verify they pass**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
```

Expected result: pass.

- [ ] **Step 8: Commit upload helpers**

Run:

```powershell
git add -- src/components/index.ts src/components/upload tests/components/UPUpload.test.tsx
git commit -m "feat: add upload adapter helpers"
```

---

### Task 3: UPUpload Component

**Files:**
- Create: `src/components/upload/UPUpload.tsx`
- Modify: `src/components/upload/index.ts`
- Modify: `tests/components/UPUpload.test.tsx`

**Interfaces:**
- Consumes from Task 2: `UPUploadFile`, `UPUploadAdapter`, `UPUploadRef`, `filterUploadFiles`, `normalizeUploadTask`, `updateUploadFile`, `clampUploadProgress`.
- Produces component: `UPUpload`.
- Public ref: `choose`, `upload`, `remove`, `clear`, `retry`, `getFiles`.

- [ ] **Step 1: Add failing component tests**

Append these tests to `tests/components/UPUpload.test.tsx`:

```tsx
import React, { createRef } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { UP, UPRoot, UPUpload, type UPUploadAdapter, type UPUploadRef } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function adapter(files = [{ name: 'photo.jpg', size: 120, type: 'image/jpeg', uri: 'file:///photo.jpg' }]): UPUploadAdapter {
  return {
    chooseFile: jest.fn(async () => files),
    previewFile: jest.fn(),
    uploadFile: jest.fn(({ onProgress }) => {
      onProgress(35);
      return Promise.resolve({ ok: true });
    }),
  };
}

it('renders upload entry and existing files', () => {
  const screen = renderRoot(
    <UPUpload defaultFileList={[{ name: 'old.jpg', uri: 'file:///old.jpg', status: 'success' }]} />,
  );

  expect(screen.getByText('old.jpg')).toBeTruthy();
  expect(screen.getByTestId('up-upload-add')).toBeTruthy();
});

it('chooses files through adapter and emits after-read and change callbacks', async () => {
  const uploadAdapter = adapter();
  const onAfterRead = jest.fn();
  const onChange = jest.fn();
  const screen = renderRoot(
    <UPUpload autoUpload={false} onAfterRead={onAfterRead} onChange={onChange} uploadAdapter={uploadAdapter} />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(uploadAdapter.chooseFile).toHaveBeenCalledWith(
    expect.objectContaining({ accept: 'image', count: 9, multiple: false }),
  );
  expect(onAfterRead).toHaveBeenCalledWith([expect.objectContaining({ name: 'photo.jpg' })]);
  expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'photo.jpg', status: 'ready' })]);
  expect(screen.getByText('photo.jpg')).toBeTruthy();
});

it('stops insertion when beforeRead returns false', async () => {
  const uploadAdapter = adapter();
  const screen = renderRoot(
    <UPUpload beforeRead={() => false} uploadAdapter={uploadAdapter} />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(screen.queryByText('photo.jpg')).toBeNull();
});

it('rejects files above maxSize and emits choose error', async () => {
  const uploadAdapter = adapter([{ name: 'big.mov', size: 1000, type: 'video/quicktime', uri: 'file:///big.mov' }]);
  const onChooseError = jest.fn();
  const screen = renderRoot(
    <UPUpload maxSize={50} onChooseError={onChooseError} uploadAdapter={uploadAdapter} />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(onChooseError).toHaveBeenCalledWith(expect.objectContaining({
    rejected: [expect.objectContaining({ reason: 'size' })],
  }));
  expect(screen.queryByText('big.mov')).toBeNull();
});

it('auto uploads and emits start progress success callbacks', async () => {
  const uploadAdapter = adapter();
  const onProgress = jest.fn();
  const onSuccess = jest.fn();
  const onUploadStart = jest.fn();
  const screen = renderRoot(
    <UPUpload
      onProgress={onProgress}
      onSuccess={onSuccess}
      onUploadStart={onUploadStart}
      uploadAdapter={uploadAdapter}
      url="https://upload.example"
    />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ response: { ok: true } }));
  });
  expect(onUploadStart).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ progress: 35 }));
  expect(screen.getByTestId('up-upload-file-0').props.accessibilityState).toEqual(
    expect.objectContaining({ busy: false }),
  );
});

it('failed upload marks file error and emits error callback', async () => {
  const uploadAdapter: UPUploadAdapter = {
    chooseFile: jest.fn(async () => [{ name: 'bad.jpg', uri: 'file:///bad.jpg' }]),
    uploadFile: jest.fn(() => Promise.reject(new Error('network'))),
  };
  const onError = jest.fn();
  const screen = renderRoot(<UPUpload onError={onError} uploadAdapter={uploadAdapter} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  await waitFor(() => {
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Error) }));
  });
  expect(screen.getByText('上传失败')).toBeTruthy();
});

it('ref upload retry remove clear and getFiles work', async () => {
  const uploadAdapter = adapter();
  const ref = createRef<UPUploadRef>();
  const screen = renderRoot(
    <UPUpload autoUpload={false} ref={ref} uploadAdapter={uploadAdapter} />,
  );

  await act(async () => {
    await ref.current?.choose();
  });
  expect(ref.current?.getFiles()).toHaveLength(1);

  await act(async () => {
    await ref.current?.upload(0);
  });
  expect(uploadAdapter.uploadFile).toHaveBeenCalledTimes(1);

  await act(async () => {
    await ref.current?.retry(0);
  });
  expect(uploadAdapter.uploadFile).toHaveBeenCalledTimes(2);

  act(() => {
    ref.current?.remove(0);
  });
  expect(screen.queryByText('photo.jpg')).toBeNull();

  act(() => {
    ref.current?.clear();
  });
  expect(ref.current?.getFiles()).toEqual([]);
});

it('controlled fileList emits updates without mutating props', async () => {
  const uploadAdapter = adapter();
  const fileList = [{ name: 'old.jpg', uri: 'file:///old.jpg' }];
  const onUpdateFileList = jest.fn();
  const screen = renderRoot(
    <UPUpload autoUpload={false} fileList={fileList} onUpdateFileList={onUpdateFileList} uploadAdapter={uploadAdapter} />,
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });

  expect(onUpdateFileList).toHaveBeenCalledWith([
    fileList[0],
    expect.objectContaining({ name: 'photo.jpg' }),
  ]);
  expect(fileList).toEqual([{ name: 'old.jpg', uri: 'file:///old.jpg' }]);
});

it('preview and delete callbacks use source-shaped payloads', () => {
  const uploadAdapter = adapter();
  const onDelete = jest.fn();
  const onPreview = jest.fn();
  const screen = renderRoot(
    <UPUpload
      defaultFileList={[{ name: 'old.jpg', uri: 'file:///old.jpg' }]}
      onDelete={onDelete}
      onPreview={onPreview}
      uploadAdapter={uploadAdapter}
    />,
  );

  fireEvent.press(screen.getByTestId('up-upload-preview-0'));
  expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  expect(uploadAdapter.previewFile).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'old.jpg' }),
    [expect.objectContaining({ name: 'old.jpg' })],
  );

  fireEvent.press(screen.getByTestId('up-upload-delete-0'));
  expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  expect(screen.queryByText('old.jpg')).toBeNull();
});

it('missing choose and upload adapters report errors without crashing', async () => {
  const onChooseError = jest.fn();
  const onError = jest.fn();
  const ref = createRef<UPUploadRef>();
  renderRoot(
    <UPUpload
      defaultFileList={[{ name: 'old.jpg', uri: 'file:///old.jpg' }]}
      onChooseError={onChooseError}
      onError={onError}
      ref={ref}
      uploadAdapter={{}}
    />,
  );

  await act(async () => {
    await ref.current?.choose();
    await ref.current?.upload(0);
  });

  expect(onChooseError).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Error) }));
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Error), index: 0 }));
});

it('uses render hooks and merges UP.setConfig upload defaults', async () => {
  const uploadAdapter = adapter();
  act(() => {
    UP.setConfig({ props: { upload: { uploadText: '添加附件', maxCount: 1 } } });
  });
  const screen = renderRoot(
    <UPUpload
      autoUpload={false}
      renderFile={({ file }) => <Text>{`custom-${file.name}`}</Text>}
      uploadAdapter={uploadAdapter}
    />,
  );

  expect(screen.getByText('添加附件')).toBeTruthy();
  await act(async () => {
    fireEvent.press(screen.getByTestId('up-upload-add'));
  });
  expect(screen.getByText('custom-photo.jpg')).toBeTruthy();
  expect(screen.queryByTestId('up-upload-add')).toBeNull();
});
```

- [ ] **Step 2: Run upload component tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
```

Expected result: fail because `UPUpload` is not implemented.

- [ ] **Step 3: Implement UPUpload props and component shell**

Create `src/components/upload/UPUpload.tsx` with imports, props, state, and ref shell:

```tsx
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPImage } from '../image';
import { UPIcon } from '../icon';
import {
  clampUploadProgress,
  filterUploadFiles,
  normalizeUploadFile,
  normalizeUploadTask,
  updateUploadFile,
} from './state';
import type {
  UPUploadAccept,
  UPUploadAdapter,
  UPUploadChooseErrorPayload,
  UPUploadErrorPayload,
  UPUploadEventPayload,
  UPUploadFile,
  UPUploadProgressPayload,
  UPUploadRef,
  UPUploadRenderPayload,
  UPUploadRenderUploadPayload,
  UPUploadSuccessPayload,
  UPUploadTask,
} from './types';

export type UPUploadProps = {
  accept?: UPUploadAccept;
  afterRead?: (files: readonly UPUploadFile[]) => void | Promise<void>;
  autoUpload?: boolean;
  beforeRead?: (files: readonly UPUploadFile[]) => boolean | void | Promise<boolean | void>;
  capture?: boolean | 'camera' | 'album';
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  defaultFileList?: readonly UPUploadFile[];
  deletable?: boolean;
  disabled?: boolean;
  fileList?: readonly UPUploadFile[];
  formData?: Record<string, unknown>;
  header?: Record<string, string>;
  maxCount?: number;
  maxSize?: number;
  multiple?: boolean;
  name?: string;
  previewImage?: boolean;
  renderFile?: (payload: UPUploadRenderPayload) => React.ReactNode;
  renderUpload?: (payload: UPUploadRenderUploadPayload) => React.ReactNode;
  uploadAdapter?: UPUploadAdapter;
  uploadText?: string;
  url?: string;
  onAfterRead?: (files: readonly UPUploadFile[]) => void;
  onBeforeRead?: (files: readonly UPUploadFile[]) => void;
  onChange?: (files: readonly UPUploadFile[]) => void;
  onChooseError?: (payload: UPUploadChooseErrorPayload) => void;
  onDelete?: (payload: UPUploadEventPayload) => void;
  onError?: (payload: UPUploadErrorPayload) => void;
  onPreview?: (payload: UPUploadEventPayload) => void;
  onProgress?: (payload: UPUploadProgressPayload) => void;
  onSuccess?: (payload: UPUploadSuccessPayload) => void;
  onUpdateFileList?: (files: readonly UPUploadFile[]) => void;
  onUploadStart?: (payload: UPUploadEventPayload) => void;
};
```

- [ ] **Step 4: Implement controlled queue helpers**

Inside `UPUpload.tsx`, add the component implementation:

```tsx
function isImageFile(file: UPUploadFile): boolean {
  return Boolean(file.type?.startsWith('image/') || file.thumb || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(file.uri));
}

function normalizeInitialFiles(files: readonly UPUploadFile[]): UPUploadFile[] {
  return files.map((file, index) => normalizeUploadFile(file, file.id ?? `initial-${index}`));
}

export const UPUpload = forwardRef<UPUploadRef, UPUploadProps>(function UPUpload(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.upload, ...input };
  const controlled = input.fileList !== undefined;
  const [localFiles, setLocalFiles] = useState<UPUploadFile[]>(() => normalizeInitialFiles(input.defaultFileList ?? props.fileList));
  const files = controlled ? normalizeInitialFiles(input.fileList ?? []) : localFiles;
  const tasks = useRef(new Map<number, UPUploadTask>());

  const emitFiles = useCallback((next: readonly UPUploadFile[]) => {
    if (!controlled) setLocalFiles([...next]);
    input.onUpdateFileList?.(next);
    input.onChange?.(next);
  }, [controlled, input]);

  const patchFile = useCallback((index: number, patch: Partial<UPUploadFile>) => {
    const next = updateUploadFile(files, index, patch);
    emitFiles(next);
    return next;
  }, [emitFiles, files]);
```

Keep the function open for the next steps.

- [ ] **Step 5: Implement upload flow**

Continue inside `UPUpload.tsx`:

```tsx
  const uploadOne = useCallback(async (index: number, sourceFiles = files) => {
    const file = sourceFiles[index];
    if (!file) return;
    if (!props.uploadAdapter?.uploadFile) {
      const error = new Error('UPUpload requires uploadAdapter.uploadFile');
      const next = updateUploadFile(sourceFiles, index, { error, status: 'error' });
      emitFiles(next);
      input.onError?.({ error, file, fileList: next, index });
      return;
    }

    const uploading = updateUploadFile(sourceFiles, index, { progress: 0, status: 'uploading' });
    emitFiles(uploading);
    input.onUploadStart?.({ file, fileList: uploading, index });

    try {
      const task = normalizeUploadTask(props.uploadAdapter.uploadFile({
        file,
        fileList: uploading,
        formData: props.formData,
        header: props.header,
        name: props.name,
        url: props.url,
        onProgress: (progress) => {
          const clamped = clampUploadProgress(progress);
          const next = patchFile(index, { progress: clamped, status: 'uploading' });
          input.onProgress?.({ file: next[index] ?? file, fileList: next, index, progress: clamped });
        },
      }));
      tasks.current.set(index, task);
      const response = await task.promise;
      tasks.current.delete(index);
      const next = patchFile(index, { progress: 100, response, status: 'success' });
      input.onSuccess?.({ file: next[index] ?? file, fileList: next, index, response });
    } catch (error) {
      tasks.current.delete(index);
      const next = patchFile(index, { error, status: 'error' });
      input.onError?.({ error, file: next[index] ?? file, fileList: next, index });
    }
  }, [emitFiles, files, input, patchFile, props]);
```

- [ ] **Step 6: Implement choose flow, preview, delete, and ref**

Add these callbacks inside the component before `return`:

```tsx
  const choose = useCallback(async () => {
    if (props.disabled) return;
    if (!props.uploadAdapter?.chooseFile) {
      input.onChooseError?.({ error: new Error('UPUpload requires uploadAdapter.chooseFile') });
      return;
    }

    try {
      const remaining = Math.max(0, Number(props.maxCount) - files.length);
      const chosen = await props.uploadAdapter.chooseFile({
        accept: props.accept,
        capture: props.capture,
        count: remaining,
        multiple: props.multiple,
      });
      const normalized = chosen.map((file, index) => normalizeUploadFile(file, file.id ?? `chosen-${Date.now()}-${index}`));
      input.onBeforeRead?.(normalized);
      const beforeResult = await input.beforeRead?.(normalized);
      if (beforeResult === false) return;

      const filtered = filterUploadFiles(normalized, {
        currentCount: files.length,
        maxCount: Number(props.maxCount),
        maxSize: Number(props.maxSize),
      });
      if (filtered.rejected.length > 0) {
        input.onChooseError?.({ error: new Error('Some files were rejected'), rejected: filtered.rejected });
      }
      if (filtered.accepted.length === 0) return;

      await input.afterRead?.(filtered.accepted);
      input.onAfterRead?.(filtered.accepted);
      const next = [...files, ...filtered.accepted];
      emitFiles(next);
      if (props.autoUpload) {
        await Promise.all(filtered.accepted.map((_file, offset) => uploadOne(files.length + offset, next)));
      }
    } catch (error) {
      input.onChooseError?.({ error });
    }
  }, [emitFiles, files, input, props, uploadOne]);

  const upload = useCallback(async (index?: number) => {
    if (index !== undefined) {
      await uploadOne(index);
      return;
    }
    await Promise.all(files.map((_file, currentIndex) => uploadOne(currentIndex)));
  }, [files, uploadOne]);

  const retry = useCallback(async (index: number) => {
    await uploadOne(index);
  }, [uploadOne]);

  const remove = useCallback((index: number) => {
    const file = files[index];
    if (!file) return;
    tasks.current.get(index)?.abort?.();
    tasks.current.delete(index);
    const next = files.filter((_item, currentIndex) => currentIndex !== index);
    emitFiles(next);
    input.onDelete?.({ file, fileList: next, index });
  }, [emitFiles, files, input]);

  const clear = useCallback(() => {
    tasks.current.forEach((task) => task.abort?.());
    tasks.current.clear();
    emitFiles([]);
  }, [emitFiles]);

  const preview = useCallback((index: number) => {
    const file = files[index];
    if (!file || !props.previewImage) return;
    input.onPreview?.({ file, fileList: files, index });
    void props.uploadAdapter?.previewFile?.(file, files);
  }, [files, input, props.previewImage, props.uploadAdapter]);

  useImperativeHandle(ref, () => ({
    choose,
    clear,
    getFiles: () => files,
    remove,
    retry,
    upload,
  }), [choose, clear, files, remove, retry, upload]);
```

- [ ] **Step 7: Implement upload rendering**

Add render helpers and `return` inside the component:

```tsx
  const actions = useMemo(() => ({ choose, preview, remove, retry, upload }), [choose, preview, remove, retry, upload]);
  const remaining = Math.max(0, Number(props.maxCount) - files.length);

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, input.customStyle]} testID="up-upload">
      {files.map((file, index) => {
        const payload = { actions, file, index };
        const busy = file.status === 'uploading';
        const content = input.renderFile?.(payload) ?? (
          <View style={{ borderColor: '#e5e6eb', borderRadius: 4, borderWidth: 1, minHeight: 88, padding: 8, width: 88 }}>
            <Pressable disabled={!props.previewImage} onPress={() => preview(index)} testID={`up-upload-preview-${index}`}>
              {isImageFile(file) ? (
                <UPImage height={56} mode="aspectFill" src={file.thumb ?? file.uri} width={56} />
              ) : (
                <UPIcon name="file-text" size={28} />
              )}
              <Text numberOfLines={1}>{file.name ?? file.uri}</Text>
            </Pressable>
            {file.status === 'uploading' ? <Text>{`${file.progress ?? 0}%`}</Text> : null}
            {file.status === 'error' ? <Text>上传失败</Text> : null}
            {props.deletable && !props.disabled ? (
              <Pressable accessibilityRole="button" onPress={() => remove(index)} testID={`up-upload-delete-${index}`}>
                <Text>删除</Text>
              </Pressable>
            ) : null}
          </View>
        );

        return (
          <View
            accessibilityState={{ busy }}
            key={file.id ?? `${file.uri}-${index}`}
            testID={`up-upload-file-${index}`}
          >
            {content}
          </View>
        );
      })}
      {remaining > 0 ? (
        input.renderUpload?.({ choose, disabled: Boolean(props.disabled), remaining }) ?? (
          <Pressable
            accessibilityRole="button"
            disabled={props.disabled}
            onPress={choose}
            style={{ alignItems: 'center', borderColor: '#e5e6eb', borderRadius: 4, borderWidth: 1, height: 88, justifyContent: 'center', width: 88 }}
            testID="up-upload-add"
          >
            <UPIcon name="plus" size={24} />
            <Text>{props.uploadText}</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
});
```

- [ ] **Step 8: Export UPUpload**

Modify `src/components/upload/index.ts`:

```ts
export * from './UPUpload';
export * from './adapters';
export * from './state';
export * from './types';
```

- [ ] **Step 9: Run upload component tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx
```

Expected result: pass.

- [ ] **Step 10: Run typecheck for upload**

Run:

```powershell
npm run typecheck
```

Expected result: pass.

- [ ] **Step 11: Commit UPUpload**

Run:

```powershell
git add -- src/components/upload tests/components/UPUpload.test.tsx
git commit -m "feat: add UPUpload"
```

---

### Task 4: UPLazyLoad Component

**Files:**
- Create: `src/components/lazy-load/UPLazyLoad.tsx`
- Create: `src/components/lazy-load/index.ts`
- Create: `tests/components/UPLazyLoad.test.tsx`
- Modify: `src/components/index.ts`

**Interfaces:**
- Consumes `useUPConfig().props.lazyLoad`, `UPImage`, and `getPx`.
- Produces component `UPLazyLoad` and type `UPLazyLoadProps`.

- [ ] **Step 1: Write failing lazy-load tests**

Create `tests/components/UPLazyLoad.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { UP, UPLazyLoad, UPRoot } from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

it('renders placeholder while hidden', () => {
  const screen = renderRoot(
    <UPLazyLoad placeholder={<Text>waiting</Text>} src="https://example.com/a.jpg" visible={false} />,
  );

  expect(screen.getByText('waiting')).toBeTruthy();
  expect(screen.queryByTestId('up-image-native')).toBeNull();
});

it('renders UPImage when controlled visible is true', () => {
  const screen = renderRoot(
    <UPLazyLoad src="https://example.com/a.jpg" visible />,
  );

  expect(screen.getByTestId('up-lazy-load-content')).toBeTruthy();
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('fires onVisible only on hidden to visible transition', () => {
  const onVisible = jest.fn();
  const screen = renderRoot(
    <UPLazyLoad onVisible={onVisible} src="https://example.com/a.jpg" visible={false} />,
  );

  screen.rerender(
    <UPRoot>
      <UPLazyLoad onVisible={onVisible} src="https://example.com/a.jpg" visible />
    </UPRoot>,
  );
  screen.rerender(
    <UPRoot>
      <UPLazyLoad onVisible={onVisible} src="https://example.com/a.jpg" visible />
    </UPRoot>,
  );

  expect(onVisible).toHaveBeenCalledTimes(1);
});

it('uses measured viewport and scroll inputs with threshold', () => {
  const screen = renderRoot(
    <UPLazyLoad
      height={100}
      placeholder={<Text>waiting</Text>}
      scrollOffset={0}
      src="https://example.com/a.jpg"
      threshold={20}
      viewport={{ height: 200, width: 300 }}
      width={100}
    />,
  );

  act(() => {
    screen.getByTestId('up-lazy-load').props.onLayout({
      nativeEvent: { layout: { height: 100, width: 100, x: 0, y: 210 } },
    });
  });
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('keeps content mounted when once is true', () => {
  const screen = renderRoot(
    <UPLazyLoad once src="https://example.com/a.jpg" visible />,
  );

  expect(screen.getByTestId('up-image-native')).toBeTruthy();
  screen.rerender(
    <UPRoot>
      <UPLazyLoad once src="https://example.com/a.jpg" visible={false} />
    </UPRoot>,
  );
  expect(screen.getByTestId('up-image-native')).toBeTruthy();
});

it('renders custom content through renderContent', () => {
  const screen = renderRoot(
    <UPLazyLoad renderContent={() => <Text>loaded custom content</Text>} visible />,
  );

  expect(screen.getByText('loaded custom content')).toBeTruthy();
});

it('merges UP.setConfig lazy-load defaults', () => {
  act(() => {
    UP.setConfig({ props: { lazyLoad: { threshold: 60, width: 120 } } });
  });

  const screen = renderRoot(
    <UPLazyLoad height={80} placeholder={<Text>waiting</Text>} src="https://example.com/a.jpg" visible={false} />,
  );

  expect(screen.getByTestId('up-lazy-load').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 80, width: 120 })]),
  );
});
```

- [ ] **Step 2: Run lazy-load tests and verify they fail**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPLazyLoad.test.tsx
```

Expected result: fail because `UPLazyLoad` does not exist.

- [ ] **Step 3: Implement UPLazyLoad**

Create `src/components/lazy-load/UPLazyLoad.tsx`:

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPImage, type UPImageProps } from '../image';

export type UPLazyLoadViewport = {
  height: number;
  width: number;
};

export type UPLazyLoadProps = {
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  error?: UPImageProps['error'];
  height?: UPDimension;
  mode?: string;
  once?: boolean;
  placeholder?: React.ReactNode;
  renderContent?: () => React.ReactNode;
  scrollOffset?: number;
  src?: string;
  threshold?: number;
  viewport?: UPLazyLoadViewport;
  visible?: boolean;
  width?: UPDimension;
  onError?: UPImageProps['onError'];
  onLoad?: UPImageProps['onLoad'];
  onVisible?: () => void;
};

function resolveSize(value: UPDimension): ViewStyle['width'] {
  return String(value).includes('%')
    ? (String(value) as `${number}%`)
    : getPx(value);
}

function computeVisible(options: {
  layoutY?: number;
  scrollOffset?: number;
  threshold: number;
  viewport?: UPLazyLoadViewport;
}): boolean {
  if (!options.viewport || options.layoutY === undefined) return false;
  const top = options.layoutY - (options.scrollOffset ?? 0);
  return top <= options.viewport.height + options.threshold;
}

export function UPLazyLoad(input: UPLazyLoadProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.lazyLoad, ...input };
  const visibleRef = useRef(false);
  const [layoutY, setLayoutY] = useState<number | undefined>(undefined);
  const derivedVisible = input.visible ?? computeVisible({
    layoutY,
    scrollOffset: props.scrollOffset,
    threshold: Number(props.threshold),
    viewport: props.viewport,
  });
  const [hasMountedContent, setHasMountedContent] = useState(Boolean(derivedVisible));
  const shouldRenderContent = Boolean(derivedVisible || (props.once && hasMountedContent));

  useEffect(() => {
    if (derivedVisible && !visibleRef.current) {
      input.onVisible?.();
    }
    visibleRef.current = Boolean(derivedVisible);
    if (derivedVisible) setHasMountedContent(true);
  }, [derivedVisible, input]);

  const onLayout = (event: LayoutChangeEvent) => {
    setLayoutY(event.nativeEvent.layout.y);
  };

  const frameStyle = useMemo<ViewStyle>(() => ({
    height: resolveSize(props.height),
    overflow: 'hidden',
    width: resolveSize(props.width),
  }), [props.height, props.width]);

  const content = shouldRenderContent ? (
    <View testID="up-lazy-load-content">
      {props.renderContent ? props.renderContent() : (
        <UPImage
          error={props.error}
          height={props.height}
          mode={props.mode}
          src={props.src}
          width={props.width}
          onError={props.onError}
          onLoad={props.onLoad as (event: NativeSyntheticEvent<unknown>) => void}
        />
      )}
    </View>
  ) : (
    props.placeholder ?? <View style={{ backgroundColor: '#f3f4f6', flex: 1 }} testID="up-lazy-load-placeholder" />
  );

  return (
    <View onLayout={onLayout} style={[frameStyle, input.customStyle]} testID="up-lazy-load">
      {content}
    </View>
  );
}
```

- [ ] **Step 4: Export UPLazyLoad**

Create `src/components/lazy-load/index.ts`:

```ts
export * from './UPLazyLoad';
```

Modify `src/components/index.ts`:

```ts
export * from './lazy-load';
```

- [ ] **Step 5: Run lazy-load tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPLazyLoad.test.tsx
```

Expected result: pass.

- [ ] **Step 6: Run typecheck for lazy-load**

Run:

```powershell
npm run typecheck
```

Expected result: pass.

- [ ] **Step 7: Commit UPLazyLoad**

Run:

```powershell
git add -- src/components/index.ts src/components/lazy-load tests/components/UPLazyLoad.test.tsx
git commit -m "feat: add UPLazyLoad"
```

---

### Task 5: Docs, Examples, And Compatibility Matrix

**Files:**
- Modify: `README.md`
- Modify: `example/App.tsx`
- Modify: `docs/compatibility.md`
- Modify: `docs/gap-matrix.md`

**Interfaces:**
- Consumes public exports from Tasks 3 and 4.
- Produces user-facing examples and documented compatibility limits.

- [ ] **Step 1: Add README P32 usage**

Add a compact section to `README.md` near the component examples:

````md
### Upload and Lazy Load

`UPUpload` keeps file-list state and delegates picker/upload work to the host application.
Install picker peers only when the app needs the default picker bridge:

```sh
npm install react-native-image-picker @react-native-documents/picker
```

```tsx
import { UPUpload, createImagePickerChooseFile } from 'ultra-ui-rn';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const uploadAdapter = {
  chooseFile: createImagePickerChooseFile(launchImageLibrary, launchCamera),
  uploadFile: async ({ file, onProgress }) => {
    onProgress(50);
    return appUploadFile(file);
  },
};

<UPUpload uploadAdapter={uploadAdapter} />
```

`UPLazyLoad` is explicit. Pass `visible`, or provide scroll/viewport inputs from the screen that owns scrolling.

```tsx
<UPLazyLoad src={imageUrl} visible={isImageVisible} width="100%" height={180} />
```
````

- [ ] **Step 2: Add compact example app usage**

Modify `example/App.tsx` imports from `../src` to include:

```tsx
UPLazyLoad,
UPUpload,
type UPUploadAdapter,
```

Inside the example screen component, add:

```tsx
const uploadAdapter = React.useMemo<UPUploadAdapter>(() => ({
  chooseFile: async () => [
    { name: 'demo-image.jpg', size: 128, type: 'image/jpeg', uri: 'https://picsum.photos/seed/upload/300/300' },
  ],
  previewFile: async (file) => {
    console.log('preview file', file.uri);
  },
  uploadFile: async ({ file, onProgress }) => {
    onProgress(45);
    console.log('upload file', file.uri);
    return { demo: true };
  },
}), []);
```

Add these components inside an existing example section:

```tsx
<UPUpload uploadAdapter={uploadAdapter} />
<UPLazyLoad
  height={120}
  src="https://picsum.photos/seed/lazy-load/600/240"
  visible
  width="100%"
/>
```

- [ ] **Step 3: Update compatibility docs**

Append to `docs/compatibility.md`:

```md
## P32 upload and lazy load

`UPUpload` provides the native file-list, progress, preview, delete, and retry surface. Picker packages are optional peers: `react-native-image-picker` and `@react-native-documents/picker`. Applications provide `uploadAdapter.chooseFile` and `uploadAdapter.uploadFile`, so authentication, signed URLs, cloud SDKs, retry policy, and request cancellation remain host-owned.

`UPLazyLoad` replaces implicit source lazy loading with explicit React Native visibility inputs. Use controlled `visible`, or pass `viewport` and `scrollOffset` from the screen that owns scrolling. `UPImage.lazyLoad` remains a retained compatibility prop and does not start global lazy loading.
```

- [ ] **Step 4: Update gap matrix**

Insert a P32 section before `Deferred Source Components` in `docs/gap-matrix.md`:

```md
## P32 Upload And Lazy Load

| Component | Source API | React Native API | Default / behavior | Status | Test |
|---|---|---|---|---|---|
| `u-upload` | file list, image/file selection, before/after read, progress, success/error, preview, delete, manual upload | `UPUpload`, `UPUploadRef`, `UPUploadAdapter` | Queue state is native; picker and upload execution are explicit host adapters with optional peer helper factories | Host adapter / Emulated | `tests/components/UPUpload.test.tsx` |
| `u-upload` | implicit `uni.chooseImage`, `uni.chooseFile`, `uni.uploadFile`, auth/signing/cloud details, background/resumable upload | Optional picker peers and `uploadFile` adapter | Applications own native picker installation, upload transport, auth, retry policy, and provider-specific request formats | Host adapter / Deferred | Component prop types |
| `u-lazy-load` | source lazy image visibility and placeholder behavior | `UPLazyLoad` | Explicit `visible` or host scroll/viewport inputs render placeholders before mounting `UPImage` or custom content | Emulated | `tests/components/UPLazyLoad.test.tsx` |
| `u-image` lazy loading | `lazyLoad` prop | Use `UPLazyLoad` wrapper | `UPImage.lazyLoad` remains a typed compatibility prop; implicit global lazy loading is not provided | No-op retained | `src/components/image/UPImage.tsx` |
```

- [ ] **Step 5: Run docs-related checks**

Run:

```powershell
npm run typecheck
git diff --check
```

Expected result: pass.

- [ ] **Step 6: Commit docs and examples**

Run:

```powershell
git add -- README.md example/App.tsx docs/compatibility.md docs/gap-matrix.md
git commit -m "docs: add p32 upload lazy load guidance"
```

---

### Task 6: Full Validation

**Files:**
- Test all files touched by P32.

**Interfaces:**
- Consumes all components, exports, config defaults, docs, and package metadata from previous tasks.
- Produces validation evidence for handoff.

- [ ] **Step 1: Run focused P32 tests**

Run:

```powershell
npm test -- --runTestsByPath tests/components/UPUpload.test.tsx tests/components/UPLazyLoad.test.tsx tests/config/store.test.ts
```

Expected result: pass.

- [ ] **Step 2: Run full test suite**

Run:

```powershell
npm test
```

Expected result: pass.

- [ ] **Step 3: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected result: pass.

- [ ] **Step 4: Run lint**

Run:

```powershell
npm run lint
```

Expected result: pass.

- [ ] **Step 5: Run package build**

Run:

```powershell
npm run build
```

Expected result: pass.

- [ ] **Step 6: Run package dry run**

Run:

```powershell
npm pack --dry-run
```

Expected result: pass and include P32 source, generated build files, docs, README, and package metadata.

- [ ] **Step 7: Run whitespace check**

Run:

```powershell
git diff --check
```

Expected result: pass.

- [ ] **Step 8: Inspect git status**

Run:

```powershell
git status --short
```

Expected result: only intended P32 modifications remain uncommitted, or no P32 modifications remain if all task commits were made. Pre-existing unrelated untracked files may still appear in this repository and must not be reverted.

- [ ] **Step 9: Record validation output for handoff**

Final implementation response must report:

```md
- Focused P32 tests: pass
- `npm test`: pass
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run build`: pass
- `npm pack --dry-run`: pass
- `git diff --check`: pass
- Git staging/commits: task commits performed only for intended P32 files
```
