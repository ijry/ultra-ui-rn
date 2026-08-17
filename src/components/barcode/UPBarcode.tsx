import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils/dimensions';
import { UPCanvas, type UPCanvasAdapterComponent, type UPCanvasExportResult, type UPCanvasRef } from '../canvas';
import { encodeBarcode, type UPBarcodeEncoding, type UPBarcodeFormat } from './barcodeEncoder';

export type UPBarcodeResult = {
  canvasId: string;
  format: Exclude<UPBarcodeFormat, 'auto'>;
  tempFilePath: string | null;
  text: string;
};

export type UPBarcodeRef = {
  render: () => Promise<UPBarcodeResult>;
  toTempFilePath: () => Promise<UPCanvasExportResult>;
};

export type UPBarcodeProps = {
  value?: string | number;
  format?: UPBarcodeFormat;
  width?: number | string;
  height?: number | string;
  displayValue?: boolean;
  text?: string;
  fontOptions?: string;
  font?: string;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'top' | 'bottom';
  textMargin?: number | string;
  fontSize?: number | string;
  background?: string;
  lineColor?: string;
  margin?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  useCanvas?: boolean;
  canvasId?: string;
  customStyle?: StyleProp<ViewStyle>;
  canvasAdapter?: UPCanvasAdapterComponent;
  onResult?: (result: UPBarcodeResult) => void;
  onError?: (error: Error) => void;
};

type RequiredBarcodeProps = {
  background: string;
  displayValue: boolean;
  font: string;
  fontOptions: string;
  fontSize: number | string;
  height: number | string;
  lineColor: string;
  margin: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  marginTop?: number | string;
  text?: string;
  textAlign: 'left' | 'center' | 'right';
  textMargin: number | string;
  textPosition: 'top' | 'bottom';
  width: number | string;
};

type NormalizedBarcodeOptions = {
  background: string;
  displayValue: boolean;
  font: string;
  fontOptions: string;
  fontSize: number;
  height: number;
  lineColor: string;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  text: string;
  textAlign: 'left' | 'center' | 'right';
  textMargin: number;
  textPosition: 'top' | 'bottom';
  width: number;
};

type ResolvedBarcodeProps = UPBarcodeProps &
  RequiredBarcodeProps & {
    format: UPBarcodeFormat;
    useCanvas: boolean;
    value: string | number;
  };

function normalizeBarcodeOptions(props: RequiredBarcodeProps): NormalizedBarcodeOptions {
  const margin = getPx(props.margin);
  return {
    background: props.background,
    displayValue: props.displayValue,
    font: props.font,
    fontOptions: props.fontOptions,
    fontSize: getPx(props.fontSize),
    height: getPx(props.height),
    lineColor: props.lineColor,
    marginBottom: props.marginBottom === undefined ? margin : getPx(props.marginBottom),
    marginLeft: props.marginLeft === undefined ? margin : getPx(props.marginLeft),
    marginRight: props.marginRight === undefined ? margin : getPx(props.marginRight),
    marginTop: props.marginTop === undefined ? margin : getPx(props.marginTop),
    text: props.text ?? '',
    textAlign: props.textAlign,
    textMargin: getPx(props.textMargin),
    textPosition: props.textPosition,
    width: getPx(props.width),
  };
}

function getBarcodeCanvasSize(options: NormalizedBarcodeOptions) {
  const textHeight = options.displayValue ? options.fontSize + options.textMargin : 0;
  return {
    canvasHeight:
      options.height + options.marginTop + options.marginBottom + textHeight,
    canvasWidth: options.width + options.marginLeft + options.marginRight,
    textHeight,
  };
}

async function drawBarcode(canvas: UPCanvasRef, encoding: UPBarcodeEncoding, options: NormalizedBarcodeOptions) {
  const { canvasHeight, canvasWidth, textHeight } = getBarcodeCanvasSize(options);
  const contentWidth = options.width;
  const contentHeight = options.height;
  const barY = options.marginTop + (options.displayValue && options.textPosition === 'top' ? textHeight : 0);
  const moduleWidth = contentWidth / encoding.binary.length;

  await canvas.setFillStyle(options.background);
  await canvas.fillRect(0, 0, canvasWidth, canvasHeight);
  await canvas.setFillStyle(options.lineColor);

  for (let index = 0; index < encoding.binary.length;) {
    if (encoding.binary[index] !== '1') {
      index += 1;
      continue;
    }
    const start = index;
    while (index < encoding.binary.length && encoding.binary[index] === '1') {
      index += 1;
    }
    await canvas.fillRect(
      options.marginLeft + start * moduleWidth,
      barY,
      Math.max(1, (index - start) * moduleWidth),
      contentHeight,
    );
  }

  if (options.displayValue) {
    const label = options.text || encoding.text;
    const x = options.textAlign === 'left'
      ? options.marginLeft
      : options.textAlign === 'right'
        ? canvasWidth - options.marginRight
        : canvasWidth / 2;
    const y = options.textPosition === 'top'
      ? options.marginTop + options.fontSize
      : barY + contentHeight + options.textMargin + options.fontSize;
    await canvas.setFillStyle(options.lineColor);
    await canvas.setFont(
      [options.fontOptions, `${options.fontSize}px`, options.font]
        .filter(Boolean)
        .join(' '),
    );
    await canvas.setTextAlign(options.textAlign);
    await canvas.fillText(label, x, y);
  }

  await canvas.draw();
  return { canvasHeight, canvasWidth };
}

export const UPBarcode = forwardRef<UPBarcodeRef, UPBarcodeProps>(function UPBarcode(input, ref) {
  const props = {
    ...useUPConfig().props.barcode,
    ...input,
  } as ResolvedBarcodeProps;
  const canvasRef = useRef<UPCanvasRef>(null);
  const resultRef = useRef<UPBarcodeResult | null>(null);
  const generatedCanvasIdRef = useRef(
    `up-barcode-${Math.random().toString(36).slice(2, 11)}`,
  );
  const canvasId = props.canvasId ?? generatedCanvasIdRef.current;
  const [canvasReady, setCanvasReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [imagePath, setImagePath] = useState('');
  const reportedErrorsRef = useRef(new WeakSet<Error>());

  const reportError = useCallback((caught: unknown) => {
    const normalized = caught instanceof Error ? caught : new Error(String(caught));
    if (!reportedErrorsRef.current.has(normalized)) {
      reportedErrorsRef.current.add(normalized);
      props.onError?.(normalized);
    }
    return normalized;
  }, [props.onError]);

  const options = useMemo(() => normalizeBarcodeOptions(props), [
    props.background,
    props.displayValue,
    props.font,
    props.fontOptions,
    props.fontSize,
    props.height,
    props.lineColor,
    props.margin,
    props.marginBottom,
    props.marginLeft,
    props.marginRight,
    props.marginTop,
    props.text,
    props.textAlign,
    props.textMargin,
    props.textPosition,
    props.width,
  ]);
  const { canvasHeight, canvasWidth } = getBarcodeCanvasSize(options);

  const exportCanvas = useCallback(async () => {
    const exported = await canvasRef.current?.toTempFilePath();
    if (!exported) throw new Error('Barcode canvas is not ready');
    setImagePath(exported.tempFilePath);
    if (resultRef.current) {
      resultRef.current = {
        ...resultRef.current,
        tempFilePath: exported.tempFilePath,
      };
    }
    return exported;
  }, []);

  const toTempFilePath = useCallback(async () => {
    try {
      return await exportCanvas();
    } catch (caught) {
      const normalized = reportError(caught);
      setError(normalized);
      throw normalized;
    }
  }, [exportCanvas, reportError]);

  const renderBarcode = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw reportError(new Error('Barcode canvas is not ready'));
    setError(null);
    setImagePath('');
    try {
      const encoding = encodeBarcode(props.value, props.format);
      await drawBarcode(canvas, encoding, options);
      let tempFilePath: string | null = null;
      if (!props.useCanvas) {
        const exported = await exportCanvas();
        tempFilePath = exported.tempFilePath;
      }
      const result: UPBarcodeResult = {
        canvasId,
        format: encoding.format,
        tempFilePath,
        text: encoding.text,
      };
      resultRef.current = result;
      props.onResult?.(result);
      return result;
    } catch (caught) {
      const normalized = reportError(caught);
      setError(normalized);
      throw normalized;
    }
  }, [
    canvasId,
    exportCanvas,
    options,
    props.format,
    props.onResult,
    props.useCanvas,
    props.value,
    reportError,
  ]);

  useEffect(() => {
    if (canvasReady) void renderBarcode().catch(() => undefined);
  }, [canvasReady, renderBarcode]);

  useImperativeHandle(ref, () => ({
    render: renderBarcode,
    toTempFilePath,
  }), [renderBarcode, toTempFilePath]);

  const handleCanvasReady = useCallback(() => setCanvasReady(true), []);

  return (
    <View
      style={[{ height: canvasHeight, width: canvasWidth }, props.customStyle]}
      testID="up-barcode"
    >
      <UPCanvas
        bgColor={options.background}
        canvasAdapter={props.canvasAdapter}
        canvasId={canvasId}
        customStyle={
          props.useCanvas
            ? undefined
            : { height: canvasHeight, opacity: 0, position: 'absolute', width: canvasWidth }
        }
        height={canvasHeight}
        onError={reportError}
        onReady={handleCanvasReady}
        ref={canvasRef}
        width={canvasWidth}
      />
      {!props.useCanvas && imagePath ? (
        <Image
          resizeMode="contain"
          source={{ uri: imagePath }}
          style={{ height: canvasHeight, width: canvasWidth }}
          testID="up-barcode-image"
        />
      ) : null}
      {error ? (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: options.background,
            bottom: 0,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <Text style={{ color: '#fa3534', fontSize: 12 }} testID="up-barcode-error">
            {error.message}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
