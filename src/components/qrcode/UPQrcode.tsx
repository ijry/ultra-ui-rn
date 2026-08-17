import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils/dimensions';
import { UPCanvas, type UPCanvasAdapterComponent, type UPCanvasExportResult, type UPCanvasRef } from '../canvas';
import { UPLoadingIcon } from '../loading-icon';
import { encodeQrMatrix, type UPQrCorrectLevel, type UPQrMatrix } from './qrEncoder';

export type UPQrcodeResult = {
  canvasId: string;
  matrixSize: number;
  tempFilePath: string | null;
  value: string;
};

export type UPQrcodeRef = {
  makeCode: () => Promise<UPQrcodeResult>;
  clearCode: () => Promise<void>;
  toTempFilePath: () => Promise<UPCanvasExportResult>;
  preview: () => Promise<void>;
  longpress: () => Promise<void>;
};

export type UPQrcodeProps = {
  cid?: string;
  canvasId?: string;
  size?: number | string;
  unit?: string;
  show?: boolean;
  val?: string;
  background?: string;
  foreground?: string;
  pdground?: string;
  icon?: string;
  iconSize?: number | string;
  lv?: UPQrCorrectLevel | number;
  quietZone?: number | string;
  onval?: boolean;
  loadMake?: boolean;
  usingComponents?: boolean;
  showLoading?: boolean;
  loadingText?: string;
  allowPreview?: boolean;
  useRootHeightAndWidth?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  canvasAdapter?: UPCanvasAdapterComponent;
  onResult?: (result: UPQrcodeResult) => void;
  onPreview?: (result: UPQrcodeResult | null) => void;
  onLongpressCallback?: (tempFilePath: string) => void;
  onError?: (error: Error) => void;
};

type RequiredQrDrawProps = {
  background: string;
  foreground: string;
  icon: string;
  iconSize: number | string;
  lv: UPQrCorrectLevel | number;
  pdground: string;
  quietZone: number | string;
  size: number | string;
  unit: string;
  useRootHeightAndWidth: boolean;
  val: string;
};

type ResolvedQrcodeProps = UPQrcodeProps &
  RequiredQrDrawProps & {
    allowPreview: boolean;
    loadMake: boolean;
    loadingText: string;
    onval: boolean;
    showLoading: boolean;
  };

function isFinderCore(row: number, col: number, count: number) {
  const inCore = (value: number, origin: number) =>
    value >= origin + 2 && value <= origin + 4;
  return (
    (inCore(row, 0) && inCore(col, 0)) ||
    (inCore(row, count - 7) && inCore(col, 0)) ||
    (inCore(row, 0) && inCore(col, count - 7))
  );
}

function resolveQrDimension(value: number | string, unit: string) {
  if (typeof value === 'number' && /^(rpx|upx)$/i.test(unit)) {
    return getPx(`${value}${unit}`);
  }
  return getPx(value);
}

async function drawQr(canvas: UPCanvasRef, props: RequiredQrDrawProps): Promise<UPQrMatrix> {
  const size = props.useRootHeightAndWidth
    ? Math.min(canvas.getWidth(), canvas.getHeight())
    : resolveQrDimension(props.size, props.unit);
  const quietZone = Math.max(0, Math.floor(Number(props.quietZone) || 0));
  const matrix = encodeQrMatrix(props.val, { correctLevel: props.lv });
  const renderCount = matrix.size + quietZone * 2;
  const moduleSize = size / renderCount;

  await canvas.setFillStyle(props.background);
  await canvas.fillRect(0, 0, size, size);
  let activeColor = '';

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (matrix.modules[row][col]) {
        const color = isFinderCore(row, col, matrix.size)
          ? props.pdground
          : props.foreground;
        if (color !== activeColor) {
          await canvas.setFillStyle(color);
          activeColor = color;
        }
        await canvas.fillRect(
          Math.round((quietZone + col) * moduleSize),
          Math.round((quietZone + row) * moduleSize),
          Math.ceil(moduleSize),
          Math.ceil(moduleSize),
        );
      }
    }
  }

  if (props.icon) {
    const iconSize = resolveQrDimension(props.iconSize, props.unit);
    const iconX = (size - iconSize) / 2;
    const iconY = (size - iconSize) / 2;
    await canvas.drawImage(props.icon, iconX, iconY, iconSize, iconSize);
  }

  await canvas.draw();
  return matrix;
}

export const UPQrcode = forwardRef<UPQrcodeRef, UPQrcodeProps>(function UPQrcode(input, ref) {
  const props = {
    ...useUPConfig().props.qrcode,
    ...input,
  } as ResolvedQrcodeProps;
  const reportedErrorsRef = useRef(new WeakSet<Error>());
  const [canvasReady, setCanvasReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<UPCanvasRef>(null);
  const generatedCanvasIdRef = useRef(
    `up-qrcode-${Math.random().toString(36).slice(2, 11)}`,
  );
  const canvasId = props.canvasId ?? props.cid ?? generatedCanvasIdRef.current;
  const generatedRef = useRef(false);
  const previousValueRef = useRef(props.val);
  const resultRef = useRef<UPQrcodeResult | null>(null);

  const reportError = useCallback((caught: unknown) => {
    const normalized = caught instanceof Error ? caught : new Error(String(caught));
    if (!reportedErrorsRef.current.has(normalized)) {
      reportedErrorsRef.current.add(normalized);
      props.onError?.(normalized);
    }
    return normalized;
  }, [props.onError]);

  const normalizedDrawProps = useMemo<RequiredQrDrawProps>(() => ({
    background: props.background,
    foreground: props.foreground,
    icon: props.icon,
    iconSize: props.iconSize,
    lv: props.lv,
    pdground: props.pdground,
    quietZone: props.quietZone,
    size: props.size,
    unit: props.unit,
    useRootHeightAndWidth: props.useRootHeightAndWidth,
    val: props.val,
  }), [
    props.background,
    props.foreground,
    props.icon,
    props.iconSize,
    props.lv,
    props.pdground,
    props.quietZone,
    props.size,
    props.unit,
    props.useRootHeightAndWidth,
    props.val,
  ]);

  const makeCode = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw reportError(new Error('QR canvas is not ready'));
    setLoading(true);
    try {
      const matrix = await drawQr(canvas, normalizedDrawProps);
      const result: UPQrcodeResult = {
        canvasId,
        matrixSize: matrix.size,
        tempFilePath: null,
        value: props.val,
      };
      resultRef.current = result;
      props.onResult?.(result);
      return result;
    } catch (error) {
      throw reportError(error);
    } finally {
      setLoading(false);
    }
  }, [canvasId, normalizedDrawProps, props.onResult, props.val, reportError]);

  useEffect(() => {
    if (!canvasReady) return;
    const changed = previousValueRef.current !== props.val;
    previousValueRef.current = props.val;
    if (!generatedRef.current) {
      generatedRef.current = true;
      if (props.loadMake) void makeCode().catch(() => undefined);
      return;
    }
    if (changed && props.onval) void makeCode().catch(() => undefined);
  }, [canvasReady, makeCode, props.loadMake, props.onval, props.val]);

  const toTempFilePath = useCallback(async () => {
    try {
      const exported = await canvasRef.current?.toTempFilePath();
      if (!exported) throw new Error('QR canvas is not ready');
      if (resultRef.current) {
        resultRef.current = {
          ...resultRef.current,
          tempFilePath: exported.tempFilePath,
        };
      }
      return exported;
    } catch (error) {
      throw reportError(error);
    }
  }, [reportError]);

  const clearCode = useCallback(async () => {
    await canvasRef.current?.clearCanvas();
    resultRef.current = null;
  }, []);

  const preview = useCallback(async () => {
    if (props.allowPreview) await toTempFilePath();
    props.onPreview?.(resultRef.current);
  }, [props.allowPreview, props.onPreview, toTempFilePath]);

  const longpress = useCallback(async () => {
    const exported = await toTempFilePath();
    props.onLongpressCallback?.(exported.tempFilePath);
  }, [props.onLongpressCallback, toTempFilePath]);

  useImperativeHandle(ref, () => ({
    clearCode,
    longpress,
    makeCode,
    preview,
    toTempFilePath,
  }), [clearCode, longpress, makeCode, preview, toTempFilePath]);

  const handleCanvasReady = useCallback(() => setCanvasReady(true), []);
  const size = resolveQrDimension(props.size, props.unit);

  if (props.show === false) return null;

  return (
    <Pressable
      onLongPress={() => void longpress().catch(() => undefined)}
      onPress={() => void preview().catch(() => undefined)}
      style={[
        { position: 'relative' },
        props.useRootHeightAndWidth ? null : { height: size, width: size },
        props.customStyle,
      ]}
      testID="up-qrcode-content"
    >
      <UPCanvas
        bgColor="transparent"
        canvasAdapter={props.canvasAdapter}
        canvasId={canvasId}
        height={size}
        onError={reportError}
        onReady={handleCanvasReady}
        ref={canvasRef}
        unit={props.unit}
        useRootHeightAndWidth={props.useRootHeightAndWidth}
        width={size}
      />
      {props.showLoading && loading ? (
        <View
          pointerEvents="none"
          style={{
            alignItems: 'center',
            backgroundColor: '#f7f7f7',
            bottom: 0,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
          testID="up-qrcode-loading"
        >
          <UPLoadingIcon text={props.loadingText} vertical />
        </View>
      ) : null}
    </Pressable>
  );
});
