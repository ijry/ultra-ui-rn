import type {
  UPUploadDetail,
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
  url?: string;
};

export function clampUploadProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeUploadFile(input: LooseSelectedFile, fallbackId: string): UPUploadFile {
  const uri = String(input.uri ?? input.url ?? '');
  const type = input.type;
  const name = input.name ?? input.fileName ?? uri.split('/').pop() ?? fallbackId;
  const size = input.size ?? input.fileSize;
  const thumb = input.thumb ?? (type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(uri) ? uri : undefined);

  return {
    id: input.id ?? fallbackId,
    message: input.message,
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
}

export function buildUploadDetail(name: string, index: number): UPUploadDetail {
  return { name, index };
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
  if (typeof task === 'object' && task !== null && 'promise' in task) return task;
  return { promise: task };
}
