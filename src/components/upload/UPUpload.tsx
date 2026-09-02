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
import { UPIcon } from '../icon';
import { UPImage } from '../image';
import {
  buildUploadDetail,
  clampUploadProgress,
  filterUploadFiles,
  normalizeUploadFile,
  normalizeUploadTask,
  updateUploadFile,
} from './state';
import { getPx, type UPDimension } from '../../utils';
import type {
  UPUploadAccept,
  UPUploadAdapter,
  UPUploadAfterAutoUploadPayload,
  UPUploadBeforeReadPayload,
  UPUploadChooseErrorPayload,
  UPUploadClickPreviewPayload,
  UPUploadDetail,
  UPUploadDriver,
  UPUploadErrorPayload,
  UPUploadEventPayload,
  UPUploadFile,
  UPUploadOversizePayload,
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
  autoDelete?: boolean;
  autoUpload?: boolean;
  autoUploadApi?: string;
  autoUploadAuthUrl?: string;
  autoUploadDriver?: UPUploadDriver;
  autoUploadHeader?: Record<string, string>;
  beforeRead?: (files: readonly UPUploadFile[]) => boolean | void | Promise<boolean | void>;
  camera?: string;
  capture?: boolean | 'camera' | 'album' | readonly string[];
  compressed?: boolean;
  customAfterAutoUpload?: boolean;
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  defaultFileList?: readonly UPUploadFile[];
  deletable?: boolean;
  disabled?: boolean;
  extension?: readonly string[];
  fileList?: readonly UPUploadFile[];
  formData?: Record<string, unknown>;
  getVideoThumb?: boolean;
  header?: Record<string, string>;
  height?: UPDimension;
  imageMode?: string;
  maxCount?: number;
  maxDuration?: number;
  maxSize?: number;
  multiple?: boolean;
  name?: string;
  previewFullImage?: boolean;
  previewImage?: boolean;
  renderFile?: (payload: UPUploadRenderPayload) => React.ReactNode;
  renderUpload?: (payload: UPUploadRenderUploadPayload) => React.ReactNode;
  /** Source `playIcon` slot: overlays a successfully uploaded video thumbnail. */
  playIconNode?: React.ReactNode;
  sizeType?: readonly string[];
  uploadAdapter?: UPUploadAdapter;
  uploadIcon?: string;
  uploadIconColor?: string;
  uploadText?: string;
  url?: string;
  useBeforeRead?: boolean;
  videoPreviewObjectFit?: string;
  width?: UPDimension;
  onAfterAutoUpload?: (payload: UPUploadAfterAutoUploadPayload) => void;
  onAfterRead?: (files: readonly UPUploadFile[]) => void;
  onBeforeRead?: (payload: UPUploadBeforeReadPayload | readonly UPUploadFile[]) => void;
  onChange?: (files: readonly UPUploadFile[]) => void;
  onChooseError?: (payload: UPUploadChooseErrorPayload) => void;
  onClickPreview?: (payload: UPUploadClickPreviewPayload) => void;
  onDelete?: (payload: UPUploadEventPayload & UPUploadDetail) => void;
  onError?: (payload: UPUploadErrorPayload) => void;
  onOversize?: (payload: UPUploadOversizePayload) => void;
  onPreview?: (payload: UPUploadEventPayload & UPUploadDetail) => void;
  onProgress?: (payload: UPUploadProgressPayload) => void;
  onSuccess?: (payload: UPUploadSuccessPayload) => void;
  onUpdateFileList?: (files: readonly UPUploadFile[]) => void;
  onUploadStart?: (payload: UPUploadEventPayload) => void;
};

type ResolvedUPUploadProps = Omit<UPUploadProps, 'defaultFileList' | 'fileList'> &
  Required<Pick<UPUploadProps,
    'accept' | 'autoDelete' | 'autoUpload' | 'autoUploadApi' | 'autoUploadAuthUrl' |
    'autoUploadDriver' | 'autoUploadHeader' | 'camera' | 'capture' | 'compressed' |
    'customAfterAutoUpload' | 'deletable' | 'disabled' | 'extension' | 'formData' |
    'header' | 'height' | 'imageMode' | 'maxCount' | 'maxDuration' | 'maxSize' |
    'multiple' | 'name' | 'previewFullImage' | 'previewImage' | 'sizeType' |
    'uploadIcon' | 'uploadIconColor' | 'uploadText' | 'url' | 'useBeforeRead' | 'width'
  >> & {
    fileList: readonly UPUploadFile[];
  };

function isImageFile(file: UPUploadFile): boolean {
  const src = file.uri || file.url || '';
  return Boolean(
    file.type === 'image' ||
    file.type?.startsWith('image/') ||
    file.thumb ||
    /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(src),
  );
}

function isVideoFile(file: UPUploadFile): boolean {
  const src = file.uri || file.url || '';
  return Boolean(
    file.type === 'video' ||
    file.type?.startsWith('video/') ||
    /\.(mp4|mov|m4v|avi|mkv|webm)$/i.test(src),
  );
}

function normalizeInitialFiles(files: readonly UPUploadFile[]): UPUploadFile[] {
  return files.map((file, index) => normalizeUploadFile(file, file.id ?? `initial-${index}`));
}

export const UPUpload = forwardRef<UPUploadRef, UPUploadProps>(function UPUpload(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.upload, ...input } as ResolvedUPUploadProps;
  const previewEnabled = input.previewFullImage ?? props.previewImage;
  const sourceDeleteMode = input.autoDelete !== undefined;
  const uploadUrl = props.autoUploadApi || props.url;
  const controlled = input.fileList !== undefined;
  const initialFiles = normalizeInitialFiles(input.defaultFileList ?? props.fileList);
  const [localFiles, setLocalFiles] = useState<UPUploadFile[]>(() => initialFiles);
  const files = controlled ? [...(input.fileList ?? [])] : localFiles;
  const filesRef = useRef<UPUploadFile[]>(files);
  const tasks = useRef(new Map<number, UPUploadTask>());
  filesRef.current = files;

  const emitFiles = useCallback((next: readonly UPUploadFile[]) => {
    const normalized = [...next];
    filesRef.current = normalized;
    if (!controlled) setLocalFiles(normalized);
    input.onUpdateFileList?.(normalized);
    input.onChange?.(normalized);
  }, [controlled, input]);

  const patchFile = useCallback((index: number, patch: Partial<UPUploadFile>) => {
    const next = updateUploadFile(filesRef.current, index, patch);
    emitFiles(next);
    return next;
  }, [emitFiles]);

  const uploadOne = useCallback(async (index: number, sourceFiles = filesRef.current) => {
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
        header: { ...props.autoUploadHeader, ...props.header },
        name: props.name,
        url: uploadUrl,
        driver: props.autoUploadDriver,
        authUrl: props.autoUploadAuthUrl,
        onProgress: (progress) => {
          const clamped = clampUploadProgress(progress);
          const next = patchFile(index, { progress: clamped, status: 'uploading' });
          input.onProgress?.({ file: next[index] ?? file, fileList: next, index, progress: clamped });
        },
      }));
      tasks.current.set(index, task);
      const response = await task.promise;
      tasks.current.delete(index);

      let successUrl: string | undefined;
      if (props.customAfterAutoUpload && input.onAfterAutoUpload) {
        const result = await new Promise<{ url?: string; thumb?: string } | undefined>((resolve) => {
          input.onAfterAutoUpload?.({ ...(response as Record<string, unknown>), callback: resolve });
        });
        if (typeof result?.url === 'string' && result.url.length > 0) successUrl = result.url;
      }
      const next = patchFile(index, successUrl
        ? { progress: 100, response, status: 'success', url: successUrl, uri: successUrl }
        : { progress: 100, response, status: 'success' });
      input.onSuccess?.({ file: next[index] ?? file, fileList: next, index, response });
    } catch (error) {
      tasks.current.delete(index);
      const next = patchFile(index, { error, status: 'error' });
      input.onError?.({ error, file: next[index] ?? file, fileList: next, index });
    }
  }, [emitFiles, input, patchFile, props, uploadUrl]);

  const choose = useCallback(async () => {
    if (props.disabled) return;
    if (!props.uploadAdapter?.chooseFile) {
      input.onChooseError?.({ error: new Error('UPUpload requires uploadAdapter.chooseFile') });
      return;
    }

    try {
      const currentFiles = filesRef.current;
      const remaining = Math.max(0, Number(props.maxCount) - currentFiles.length);
      const chosen = await props.uploadAdapter.chooseFile({
        accept: props.accept,
        capture: props.capture,
        count: remaining,
        multiple: props.multiple,
        compressed: props.compressed,
        camera: props.camera,
        extension: props.extension,
        maxDuration: props.maxDuration,
        sizeType: props.sizeType,
      });
      const normalized = chosen.map((file, index) => normalizeUploadFile(file, file.id ?? `chosen-${Date.now()}-${index}`));

      if (props.useBeforeRead) {
        if (input.onBeforeRead) {
          const detail = buildUploadDetail(props.name, currentFiles.length);
          const ok = await new Promise<boolean>((resolve) => {
            input.onBeforeRead?.({ file: normalized, ...detail, callback: (pass) => resolve(pass) });
          });
          if (!ok) return;
        }
      } else {
        input.onBeforeRead?.(normalized);
        const beforeResult = await input.beforeRead?.(normalized);
        if (beforeResult === false) return;
      }

      const anyOversize = normalized.some((file) => (
        file.size !== undefined && file.size > Number(props.maxSize)
      ));
      if (anyOversize && input.onOversize) {
        input.onOversize?.({ file: normalized, ...buildUploadDetail(props.name, currentFiles.length) });
        return;
      }

      const filtered = filterUploadFiles(normalized, {
        currentCount: currentFiles.length,
        maxCount: Number(props.maxCount),
        maxSize: Number(props.maxSize),
      });
      if (filtered.rejected.length > 0) {
        input.onChooseError?.({ error: new Error('Some files were rejected'), rejected: filtered.rejected });
      }
      if (filtered.accepted.length === 0) return;

      await input.afterRead?.(filtered.accepted);
      input.onAfterRead?.(filtered.accepted);
      const inserted = props.autoUpload
        ? filtered.accepted.map((file) => ({ ...file, message: '上传中', progress: 0, status: 'uploading' as const }))
        : filtered.accepted;
      const next = [...currentFiles, ...inserted];
      emitFiles(next);
      if (props.autoUpload) {
        await Promise.all(inserted.map((_file, offset) => uploadOne(currentFiles.length + offset, next)));
      }
    } catch (error) {
      input.onChooseError?.({ error });
    }
  }, [emitFiles, input, props, uploadOne]);

  const upload = useCallback(async (index?: number) => {
    if (index !== undefined) {
      await uploadOne(index);
      return;
    }
    await Promise.all(filesRef.current.map((_file, currentIndex) => uploadOne(currentIndex)));
  }, [uploadOne]);

  const retry = useCallback(async (index: number) => {
    await uploadOne(index);
  }, [uploadOne]);

  const remove = useCallback((index: number) => {
    const currentFiles = filesRef.current;
    const file = currentFiles[index];
    if (!file) return;
    tasks.current.get(index)?.abort?.();
    tasks.current.delete(index);
    const next = currentFiles.filter((_item, currentIndex) => currentIndex !== index);
    emitFiles(next);
    input.onDelete?.({ file, fileList: next, ...buildUploadDetail(props.name, index) });
  }, [emitFiles, input, props.name]);

  const handleDelete = useCallback((index: number) => {
    const currentFiles = filesRef.current;
    const file = currentFiles[index];
    if (!file) return;
    if (sourceDeleteMode) {
      if (props.autoDelete) {
        tasks.current.get(index)?.abort?.();
        tasks.current.delete(index);
        const next = currentFiles.filter((_item, currentIndex) => currentIndex !== index);
        emitFiles(next);
      } else {
        input.onDelete?.({ file, fileList: currentFiles, ...buildUploadDetail(props.name, index) });
      }
      return;
    }
    remove(index);
  }, [emitFiles, input, props.autoDelete, props.name, remove, sourceDeleteMode]);

  const clear = useCallback(() => {
    tasks.current.forEach((task) => task.abort?.());
    tasks.current.clear();
    emitFiles([]);
  }, [emitFiles]);

  const preview = useCallback((index: number) => {
    const currentFiles = filesRef.current;
    const file = currentFiles[index];
    if (!file) return;
    const detail = buildUploadDetail(props.name, index);
    input.onClickPreview?.({ ...file, ...detail });
    if (!previewEnabled) return;
    input.onPreview?.({ file, fileList: currentFiles, ...detail });
    void props.uploadAdapter?.previewFile?.(file, currentFiles);
  }, [input, previewEnabled, props.name, props.uploadAdapter]);

  useImperativeHandle(ref, () => ({
    afterRead: (file, lists) => input.onAfterRead?.(lists ?? [file]),
    beforeRead: (file, lists, name) => input.onBeforeRead?.({ callback: () => true, file, index: 0, name: name ?? '' }),
    choose,
    chooseFile: choose,
    clear,
    getFiles: () => filesRef.current,
    remove,
    retry,
    upload,
  }), [choose, clear, input.onAfterRead, input.onBeforeRead, remove, retry, upload]);

  const actions = useMemo(() => ({ choose, preview, remove, retry, upload }), [choose, preview, remove, retry, upload]);
  const remaining = Math.max(0, Number(props.maxCount) - files.length);

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, input.customStyle]} testID="up-upload">
      {files.map((file, index) => {
        const payload = { actions, file, index };
        const busy = file.status === 'uploading';
        const itemDeletable = typeof file.deletable === 'boolean' ? file.deletable : props.deletable;
        const content = input.renderFile?.(payload) ?? (
          <View style={{ borderColor: '#e5e6eb', borderRadius: 4, borderWidth: 1, minHeight: getPx(props.height), padding: 8, width: getPx(props.width) }}>
            <Pressable disabled={!previewEnabled} onPress={() => preview(index)} testID={`up-upload-preview-${index}`}>
              {isImageFile(file) ? (
                <UPImage height={56} mode={props.imageMode} src={file.thumb ?? file.url ?? file.uri} width={56} />
              ) : (
                <UPIcon name={isVideoFile(file) ? 'movie' : 'file-text'} size={28} />
              )}
              {isVideoFile(file) && file.status === 'success' ? (
                input.playIconNode ?? <UPIcon name="play-right" size={22} />
              ) : null}
              <Text numberOfLines={1}>{file.name ?? file.url ?? file.uri}</Text>
            </Pressable>
            {file.status === 'uploading' ? <Text>{`${file.progress ?? 0}%`}</Text> : null}
            {file.status === 'error' ? <Text>上传失败</Text> : null}
            {itemDeletable && !props.disabled ? (
              <Pressable accessibilityRole="button" onPress={() => handleDelete(index)} testID={`up-upload-delete-${index}`}>
                <Text>删除</Text>
              </Pressable>
            ) : null}
          </View>
        );

        return (
          <View
            accessibilityState={{ busy }}
            key={file.id ?? `${file.uri || file.url}-${index}`}
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
            style={{ alignItems: 'center', borderColor: '#e5e6eb', borderRadius: 4, borderWidth: 1, height: getPx(props.height), justifyContent: 'center', width: getPx(props.width) }}
            testID="up-upload-add"
          >
            <UPIcon color={props.uploadIconColor} name={props.uploadIcon} size={24} />
            <Text>{props.uploadText}</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
});
