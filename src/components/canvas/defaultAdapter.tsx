import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import Canvas, { Image as CanvasImage } from 'react-native-canvas';
import type {
  ReactNativeCanvasContext2D,
  ReactNativeCanvasElement,
} from 'react-native-canvas';
import type {
  UPCanvasAdapterComponent,
  UPCanvasAdapterHandle,
  UPCanvasDrawCommand,
  UPCanvasExportOptions,
} from './types';

async function resolveContext(canvas: ReactNativeCanvasElement) {
  return await Promise.resolve(canvas.getContext('2d'));
}

function fontFromSize(size: number) {
  return `${size}px sans-serif`;
}

async function loadCanvasImage(canvas: ReactNativeCanvasElement, source: string) {
  const image = new CanvasImage(canvas);
  await new Promise<void>((resolve, reject) => {
    image.addEventListener('load', () => resolve());
    image.addEventListener('error', () => reject(new Error(`Canvas image failed to load: ${source}`)));
    image.src = source;
  });
  return image;
}

async function executeOnContext(
  canvas: ReactNativeCanvasElement,
  context: ReactNativeCanvasContext2D,
  command: UPCanvasDrawCommand,
) {
  if (command.kind === 'set') {
    if (command.property === 'font' && typeof command.value === 'number') {
      context.font = fontFromSize(command.value);
      return;
    }
    (context as Record<string, unknown>)[command.property] = command.value;
    return;
  }

  if (command.method === 'draw') return;
  if (command.method === 'drawImage' && typeof command.args[0] === 'string') {
    if (!context.drawImage) throw new Error('Canvas method is not available: drawImage');
    const source = command.args[0];
    const rest = command.args.slice(1);
    const image = await loadCanvasImage(canvas, source);
    await Promise.resolve(context.drawImage(image, ...rest));
    return;
  }
  const callable = (context as Record<string, unknown>)[command.method];
  if (typeof callable === 'function') {
    await Promise.resolve(callable.apply(context, command.args));
    return;
  }
  throw new Error(`Canvas method is not available: ${command.method}`);
}

export const UPReactNativeCanvasAdapter: UPCanvasAdapterComponent = ({
  bgColor,
  canvasId,
  disableScroll,
  height,
  onError,
  onReady,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
  testID,
  width,
}) => {
  const contextRef = useRef<ReactNativeCanvasContext2D | null>(null);

  const handleCanvas = useCallback(
    (canvas: ReactNativeCanvasElement | null) => {
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      void resolveContext(canvas).then(
        (context) => {
          contextRef.current = context;
          const handle: UPCanvasAdapterHandle = {
            execute: async (command) => {
              if (!contextRef.current) throw new Error('Canvas context is not ready');
              await executeOnContext(canvas, contextRef.current, command);
            },
            getCanvasElement: async () => canvas,
            getRawContext: async () => contextRef.current,
            measureText: async (text) => {
              if (!contextRef.current?.measureText) return { width: text.length * 8 };
              return await Promise.resolve(contextRef.current.measureText(text));
            },
            toTempFilePath: async (options?: UPCanvasExportOptions) => {
              if (!canvas.toDataURL) throw new Error('Canvas export is not supported');
              const fileType = options?.fileType === 'jpg' || options?.fileType === 'jpeg'
                ? 'jpeg'
                : 'png';
              const dataUrl = await Promise.resolve(
                canvas.toDataURL(`image/${fileType}`, options?.quality),
              );
              return {
                dataUrl,
                height: options?.destHeight ?? options?.height ?? height,
                tempFilePath: dataUrl,
                width: options?.destWidth ?? options?.width ?? width,
              };
            },
          };
          onReady(handle);
        },
        (error: unknown) => onError?.(error instanceof Error ? error : new Error(String(error))),
      );
    },
    [height, onError, onReady, width],
  );

  return (
    <View
      nativeID={canvasId}
      onMoveShouldSetResponder={() => Boolean(disableScroll)}
      onStartShouldSetResponder={() => Boolean(disableScroll)}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      style={{ backgroundColor: bgColor, height, width }}
      testID={testID}
    >
      <Canvas
        ref={handleCanvas}
        style={{ backgroundColor: bgColor, height, width }}
      />
    </View>
  );
};
