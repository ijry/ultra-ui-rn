export type UPUploadFileStatus = 'ready' | 'uploading' | 'success' | 'error';
export type UPUploadAccept = 'image' | 'file' | 'all' | 'media' | 'video';
export type UPUploadCapture = boolean | 'camera' | 'album' | readonly string[];
export type UPUploadDriver = '' | 'local' | 'oss' | 'cos' | 'kodo';

export type UPUploadFile = {
  deletable?: boolean;
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
  /** Source-shaped items carry `url`; normalized items always have `uri`. */
  uri?: string;
};

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

export type UPUploadRequest = {
  file: UPUploadFile;
  fileList: readonly UPUploadFile[];
  formData?: Record<string, unknown>;
  header?: Record<string, string>;
  name: string;
  onProgress: (progress: number) => void;
  url?: string;
  driver?: UPUploadDriver;
  authUrl?: string;
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

export type UPUploadRef = {
  choose: () => Promise<void>;
  clear: () => void;
  getFiles: () => readonly UPUploadFile[];
  remove: (index: number) => void;
  retry: (index: number) => Promise<void>;
  upload: (index?: number) => Promise<void>;
};
