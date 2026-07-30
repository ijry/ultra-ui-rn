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
