import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils/dimensions';
import { UPReactNativeCanvasAdapter } from './defaultAdapter';
import type {
  UPCanvasAdapterHandle,
  UPCanvasDrawCommand,
  UPCanvasExportOptions,
  UPCanvasProps,
  UPCanvasRef,
  UPCanvasUnit,
} from './types';

type QueueEntry = {
  command: UPCanvasDrawCommand;
  reject: (error: Error) => void;
  resolve: () => void;
};

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function commandCall(method: string, args: unknown[] = []): UPCanvasDrawCommand {
  return { args, kind: 'call', method };
}

function resolveCanvasDimension(value: number | string, unit: UPCanvasUnit) {
  if (typeof value === 'number' && /^(rpx|upx)$/i.test(unit)) {
    return getPx(`${value}${unit}`);
  }
  return getPx(value);
}

export const UPCanvas = forwardRef<UPCanvasRef, UPCanvasProps>(function UPCanvas(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.canvas, ...input } as UPCanvasProps;
  const generatedCanvasIdRef = useRef(
    `up-canvas-${Math.random().toString(36).slice(2, 11)}`,
  );
  const canvasId = props.canvasId ?? generatedCanvasIdRef.current;
  const unit = props.unit ?? 'px';
  const configuredWidth = resolveCanvasDimension(props.width ?? 300, unit);
  const configuredHeight = resolveCanvasDimension(props.height ?? 150, unit);
  const [rootSize, setRootSize] = useState<{ height: number; width: number } | null>(null);
  const width = props.useRootHeightAndWidth && rootSize ? rootSize.width : configuredWidth;
  const height = props.useRootHeightAndWidth && rootSize ? rootSize.height : configuredHeight;
  const Adapter = props.canvasAdapter ?? config.props.canvas.canvasAdapter ?? UPReactNativeCanvasAdapter;
  const adapterRef = useRef<UPCanvasAdapterHandle | null>(null);
  const queueRef = useRef<QueueEntry[]>([]);
  const chainRef = useRef(Promise.resolve());
  const mountedRef = useRef(true);
  const publicRef = useRef<UPCanvasRef | null>(null);
  const onError = props.onError;
  const onReady = props.onReady;

  const reportError = useCallback((error: unknown) => {
    const normalized = toError(error);
    if (mountedRef.current) onError?.(normalized);
    return normalized;
  }, [onError]);

  const executeNow = useCallback((command: UPCanvasDrawCommand) => {
    if (!mountedRef.current) throw new Error('Canvas has been unmounted');
    const adapter = adapterRef.current;
    if (!adapter) throw new Error('Canvas adapter is not ready');
    return adapter.execute(command);
  }, []);

  const enqueue = useCallback((command: UPCanvasDrawCommand) => {
    return new Promise<void>((resolve, reject) => {
      if (!mountedRef.current) {
        reject(new Error('Canvas has been unmounted'));
        return;
      }
      const run = () => {
        chainRef.current = chainRef.current
          .then(() => executeNow(command))
          .then(() => resolve())
          .catch((error: unknown) => {
            const normalized = reportError(error);
            reject(normalized);
          });
      };

      if (adapterRef.current) run();
      else queueRef.current.push({ command, reject, resolve });
    });
  }, [executeNow, reportError]);

  const flushQueue = useCallback(() => {
    const entries = queueRef.current.splice(0);
    entries.forEach((entry) => {
      void enqueue(entry.command).then(entry.resolve, entry.reject);
    });
  }, [enqueue]);

  const handleReady = useCallback((handle: UPCanvasAdapterHandle) => {
    if (!mountedRef.current) return;
    adapterRef.current = handle;
    flushQueue();
    if (publicRef.current) onReady?.(publicRef.current);
  }, [flushQueue, onReady]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    if (!props.useRootHeightAndWidth) return;
    const { height: measuredHeight, width: measuredWidth } = event.nativeEvent.layout;
    if (measuredHeight <= 0 || measuredWidth <= 0) return;
    setRootSize((current) =>
      current?.height === measuredHeight && current.width === measuredWidth
        ? current
        : { height: measuredHeight, width: measuredWidth },
    );
  }, [props.useRootHeightAndWidth]);

  useEffect(() => () => {
    mountedRef.current = false;
    adapterRef.current = null;
    const error = new Error('Canvas has been unmounted');
    queueRef.current.splice(0).forEach((entry) => entry.reject(error));
  }, []);

  const api = useMemo<UPCanvasRef>(() => ({
    beginPath: () => enqueue(commandCall('beginPath')),
    clearCanvas: async () => {
      await enqueue(commandCall('clearRect', [0, 0, width, height]));
      if (props.bgColor && props.bgColor !== 'transparent') {
        await enqueue({ kind: 'set', property: 'fillStyle', value: props.bgColor });
        await enqueue(commandCall('fillRect', [0, 0, width, height]));
      }
    },
    clearRect: (x, y, clearWidth, clearHeight) => enqueue(commandCall('clearRect', [x, y, clearWidth, clearHeight])),
    closePath: () => enqueue(commandCall('closePath')),
    draw: () => enqueue(commandCall('draw')),
    drawImage: (...args) => enqueue(commandCall('drawImage', args)),
    fill: () => enqueue(commandCall('fill')),
    fillRect: (x, y, rectWidth, rectHeight) => enqueue(commandCall('fillRect', [x, y, rectWidth, rectHeight])),
    fillText: (text, x, y, maxWidth) => enqueue(commandCall('fillText', maxWidth === undefined ? [text, x, y] : [text, x, y, maxWidth])),
    getCanvasContext: async () => adapterRef.current?.getRawContext?.() ?? null,
    getCanvasElement: async () => adapterRef.current?.getCanvasElement?.() ?? null,
    getHeight: () => height,
    getRawContext: async () => adapterRef.current?.getRawContext?.() ?? null,
    getWidth: () => width,
    lineTo: (x, y) => enqueue(commandCall('lineTo', [x, y])),
    measureText: async (text) => adapterRef.current?.measureText?.(text) ?? { width: text.length * 8 },
    moveTo: (x, y) => enqueue(commandCall('moveTo', [x, y])),
    rect: (x, y, rectWidth, rectHeight) => enqueue(commandCall('rect', [x, y, rectWidth, rectHeight])),
    refresh: async () => {
      await adapterRef.current?.refresh?.();
    },
    setFillStyle: (color) => enqueue({ kind: 'set', property: 'fillStyle', value: color }),
    setFont: (font) => enqueue({ kind: 'set', property: 'font', value: font }),
    setFontSize: (size) => enqueue({ kind: 'set', property: 'font', value: size }),
    setLineWidth: (lineWidth) => enqueue({ kind: 'set', property: 'lineWidth', value: lineWidth }),
    setStrokeStyle: (color) => enqueue({ kind: 'set', property: 'strokeStyle', value: color }),
    setTextAlign: (align) => enqueue({ kind: 'set', property: 'textAlign', value: align }),
    stroke: () => enqueue(commandCall('stroke')),
    strokeRect: (x, y, rectWidth, rectHeight) => enqueue(commandCall('strokeRect', [x, y, rectWidth, rectHeight])),
    toTempFilePath: async (options?: UPCanvasExportOptions) => {
      const adapter = adapterRef.current;
      if (!adapter?.toTempFilePath) throw reportError(new Error('Canvas export is not supported'));
      return adapter.toTempFilePath(options);
    },
  }), [enqueue, height, props.bgColor, reportError, width]);

  publicRef.current = api;
  useImperativeHandle(ref, () => api, [api]);
  const shouldRenderAdapter = !props.useRootHeightAndWidth || rootSize !== null;

  return (
    <View
      onLayout={handleLayout}
      style={[
        { backgroundColor: props.bgColor },
        props.useRootHeightAndWidth ? null : { height, width },
        props.customStyle,
      ]}
      testID="up-canvas"
    >
      {shouldRenderAdapter ? (
        <Adapter
          bgColor={props.bgColor}
          canvasId={canvasId}
          disableScroll={props.disableScroll}
          height={height}
          onError={props.onError}
          onReady={handleReady}
          onTouchEnd={(event) => { props.onTouchEnd?.(event); props.onTouchend?.(event); }}
          onTouchMove={(event) => { props.onTouchMove?.(event); props.onTouchmove?.(event); }}
          onTouchStart={(event) => { props.onTouchStart?.(event); props.onTouchstart?.(event); }}
          testID={`up-canvas-${canvasId}`}
          width={width}
        />
      ) : null}
    </View>
  );
});
