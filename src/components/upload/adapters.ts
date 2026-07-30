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
