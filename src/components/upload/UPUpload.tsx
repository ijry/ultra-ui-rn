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

type ResolvedUPUploadProps = Omit<UPUploadProps, 'defaultFileList' | 'fileList'> &
  Required<Pick<UPUploadProps,
    'accept' | 'autoUpload' | 'capture' | 'deletable' | 'disabled' | 'formData' |
    'header' | 'maxCount' | 'maxSize' | 'multiple' | 'name' | 'previewImage' |
    'uploadText' | 'url'
  >> & {
    fileList: readonly UPUploadFile[];
  };

function isImageFile(file: UPUploadFile): boolean {
  return Boolean(file.type?.startsWith('image/') || file.thumb || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(file.uri));
}

function normalizeInitialFiles(files: readonly UPUploadFile[]): UPUploadFile[] {
  return files.map((file, index) => normalizeUploadFile(file, file.id ?? `initial-${index}`));
}

export const UPUpload = forwardRef<UPUploadRef, UPUploadProps>(function UPUpload(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.upload, ...input } as ResolvedUPUploadProps;
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
  }, [emitFiles, input, patchFile, props]);

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
      });
      const normalized = chosen.map((file, index) => normalizeUploadFile(file, file.id ?? `chosen-${Date.now()}-${index}`));
      input.onBeforeRead?.(normalized);
      const beforeResult = await input.beforeRead?.(normalized);
      if (beforeResult === false) return;

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
      const next = [...currentFiles, ...filtered.accepted];
      emitFiles(next);
      if (props.autoUpload) {
        await Promise.all(filtered.accepted.map((_file, offset) => uploadOne(currentFiles.length + offset, next)));
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
    input.onDelete?.({ file, fileList: next, index });
  }, [emitFiles, input]);

  const clear = useCallback(() => {
    tasks.current.forEach((task) => task.abort?.());
    tasks.current.clear();
    emitFiles([]);
  }, [emitFiles]);

  const preview = useCallback((index: number) => {
    const currentFiles = filesRef.current;
    const file = currentFiles[index];
    if (!file || !props.previewImage) return;
    input.onPreview?.({ file, fileList: currentFiles, index });
    void props.uploadAdapter?.previewFile?.(file, currentFiles);
  }, [input, props.previewImage, props.uploadAdapter]);

  useImperativeHandle(ref, () => ({
    choose,
    clear,
    getFiles: () => filesRef.current,
    remove,
    retry,
    upload,
  }), [choose, clear, remove, retry, upload]);

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
