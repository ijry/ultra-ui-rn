import React, { createRef } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  UP,
  UPRoot,
  UPUpload,
  clampUploadProgress,
  createDocumentPickerChooseFile,
  createImagePickerChooseFile,
  filterUploadFiles,
  normalizeUploadFile,
  normalizeUploadTask,
  updateUploadFile,
  type UPUploadAdapter,
  type UPUploadFile,
  type UPUploadRef,
} from '../../src';

function renderRoot(node: React.ReactElement) {
  return render(<UPRoot>{node}</UPRoot>);
}

function adapter(
  files = [{ name: 'photo.jpg', size: 120, type: 'image/jpeg', uri: 'file:///photo.jpg' }],
): UPUploadAdapter {
  return {
    chooseFile: jest.fn(async () => files),
    previewFile: jest.fn(),
    uploadFile: jest.fn(({ onProgress }) => {
      onProgress(35);
      return Promise.resolve({ ok: true });
    }),
  };
}

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
