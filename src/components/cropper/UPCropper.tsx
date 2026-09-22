import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Image, PanResponder, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range } from '../../utils';

export type UPCropperConfirmData = {
  x: number;
  y: number;
  width: number;
  height: number;
  destWidth: number;
  destHeight: number;
};

export type UPCropperConfirmPayload = {
  avatar: string;
  path: string | null;
  index?: string | number;
  data: UPCropperConfirmData;
};

/** Per-call options for `chooseImage`, mirroring the source method's second arg. */
export type UPCropperChooseOptions = {
  imageSrc?: string;
  index?: string | number;
  canChangeSize?: boolean;
  inner?: boolean;
  areaWidth?: string;
  areaHeight?: string;
  exportWidth?: string;
  exportHeight?: string;
};

export type UPCropperHandle = {
  /** Source `chooseImage(index, options)`: resolve an image (via `options.imageSrc`
   *  or the injected `imagePickerAdapter`) and open it for cropping with per-call
   *  overrides. Resolves once the image is set; a null pick is a no-op (cancel). */
  chooseImage: (index?: string | number, options?: UPCropperChooseOptions) => Promise<void>;
};

export type UPCropperProps = {
  imageSrc?: string;
  minScale?: number;
  maxScale?: number;
  canScale?: boolean;
  canRotate?: boolean;
  lockWidth?: string;
  lockHeight?: string;
  stretch?: string;
  lock?: string;
  noTab?: boolean;
  inner?: boolean;
  quality?: number | string;
  index?: string | number;
  canChangeSize?: boolean;
  areaWidth?: string;
  areaHeight?: string;
  exportWidth?: string;
  exportHeight?: string;
  fillColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Native image-picker boundary: inject a picker (e.g. react-native-image-picker)
   *  that resolves the chosen image URI, or null if the user cancelled. Source
   *  drives this through `uni.chooseImage`; `chooseImage()` calls it when no
   *  `imageSrc` is supplied. */
  imagePickerAdapter?: (options?: UPCropperChooseOptions) => Promise<string | null>;
  /** Source `avtinit` event: fires when the cropper is initialized. */
  onAvtinit?: () => void;
  /** Source `confirm` event: fires with crop params on confirm.
   *  React Native boundary: `path` is null unless a native cropper adapter is injected. */
  onConfirm?: (payload: UPCropperConfirmPayload) => void;
  /** Source `cancel` event. */
  onCancel?: () => void;
};

const AREA = 280;

export const UPCropper = forwardRef<UPCropperHandle, UPCropperProps>(function UPCropper(input, ref) {
  const props = { ...useUPConfig().props.cropper, ...input } as UPCropperProps;
  // A chooseImage() call layers its own imageSrc + crop options over the props,
  // the way the source method's second arg overrides the component config.
  const [chosen, setChosen] = useState<UPCropperChooseOptions | null>(null);
  const resolved = { ...props, ...(chosen ?? {}) } as UPCropperProps & UPCropperChooseOptions;
  const imageSrc = resolved.imageSrc;
  const area = getPx(resolved.areaWidth ?? '300rpx');
  const [box, setBox] = useState({ x: (AREA - area) / 2, y: (AREA - area) / 2, size: area });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    input.onAvtinit?.();
  }, []);

  useImperativeHandle(ref, () => ({
    chooseImage: async (index, options = {}) => {
      const picked = options.imageSrc ?? (await input.imagePickerAdapter?.(options)) ?? null;
      if (picked === null) return; // cancelled — leave the current image untouched
      setChosen({ ...options, imageSrc: picked, index: options.index ?? index });
    },
  }));

  const moveResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      const next = {
        ...box,
        x: range(0, AREA - box.size, box.x + gesture.dx),
        y: range(0, AREA - box.size, box.y + gesture.dy),
      };
      setBox(next);
    },
  });

  const scaleResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      const nextScale = range(props.minScale ?? 0.3, props.maxScale ?? 4, scale + gesture.dy / 200);
      setScale(nextScale);
      const nextSize = range(40, AREA, area * nextScale);
      setBox({ ...box, size: nextSize });
    },
  });

  const confirm = () => {
    input.onConfirm?.({
      avatar: imageSrc ?? '',
      path: null,
      index: resolved.index,
      data: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.size),
        height: Math.round(box.size),
        destWidth: Math.round(getPx(resolved.exportWidth ?? '260rpx')),
        destHeight: Math.round(getPx(resolved.exportHeight ?? '260rpx')),
      },
    });
  };

  return (
    <View style={[{ alignItems: 'center' }, input.customStyle]} testID="up-cropper">
      <View
        style={{
          backgroundColor: '#000000',
          borderRadius: 8,
          height: AREA,
          overflow: 'hidden',
          position: 'relative',
          width: AREA,
        }}
        testID="up-cropper-stage"
      >
        {imageSrc ? (
          <Image
            resizeMode="contain"
            source={{ uri: imageSrc }}
            style={{ height: AREA, width: AREA }}
            testID="up-cropper-image"
          />
        ) : (
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: '#909399', fontSize: 13 }}>请提供 imageSrc</Text>
          </View>
        )}
        {/* crop box */}
        <View
          {...moveResponder.panHandlers}
          style={{
            borderColor: '#ffffff',
            borderWidth: 2,
            height: box.size,
            left: box.x,
            position: 'absolute',
            top: box.y,
            width: box.size,
          }}
          testID="up-cropper-box"
        >
          {props.canScale ? (
            <View
              {...scaleResponder.panHandlers}
              style={{
                backgroundColor: '#2979ff',
                borderRadius: 6,
                bottom: -6,
                height: 12,
                position: 'absolute',
                right: -6,
                width: 12,
              }}
              testID="up-cropper-resize"
            />
          ) : null}
        </View>
      </View>
      {!props.noTab && props.canScale ? (
        <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
          <Pressable
            onPress={() => {
              const nextScale = range(props.minScale ?? 0.3, props.maxScale ?? 4, scale - 0.2);
              setScale(nextScale);
              setBox({ ...box, size: range(40, AREA, area * nextScale) });
            }}
            style={{ backgroundColor: '#f2f3f5', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 6 }}
            testID="up-cropper-zoom-out"
          >
            <Text style={{ color: '#303133', fontSize: 14 }}>缩小</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const nextScale = range(props.minScale ?? 0.3, props.maxScale ?? 4, scale + 0.2);
              setScale(nextScale);
              setBox({ ...box, size: range(40, AREA, area * nextScale) });
            }}
            style={{ backgroundColor: '#f2f3f5', borderRadius: 4, marginLeft: 8, paddingHorizontal: 12, paddingVertical: 6 }}
            testID="up-cropper-zoom-in"
          >
            <Text style={{ color: '#303133', fontSize: 14 }}>放大</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Pressable
          onPress={input.onCancel}
          style={{ backgroundColor: '#f2f3f5', borderRadius: 4, marginRight: 10, paddingHorizontal: 24, paddingVertical: 8 }}
          testID="up-cropper-cancel"
        >
          <Text style={{ color: '#606266', fontSize: 15 }}>取消</Text>
        </Pressable>
        <Pressable
          onPress={confirm}
          style={{ backgroundColor: '#2979ff', borderRadius: 4, paddingHorizontal: 24, paddingVertical: 8 }}
          testID="up-cropper-confirm"
        >
          <Text style={{ color: '#ffffff', fontSize: 15 }}>确定</Text>
        </Pressable>
      </View>
    </View>
  );
});
