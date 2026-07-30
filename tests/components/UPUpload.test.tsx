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
