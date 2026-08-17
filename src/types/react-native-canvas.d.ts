declare module 'react-native-canvas' {
  import type { ComponentType, Ref } from 'react';
  import type { ViewProps } from 'react-native';

  export type ReactNativeCanvasContext2D = {
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    font?: string;
    textAlign?: 'left' | 'right' | 'center' | 'start' | 'end';
    beginPath?: () => void;
    closePath?: () => void;
    rect?: (x: number, y: number, width: number, height: number) => void;
    clearRect?: (x: number, y: number, width: number, height: number) => void;
    fillRect?: (x: number, y: number, width: number, height: number) => void;
    strokeRect?: (x: number, y: number, width: number, height: number) => void;
    fill?: () => void;
    stroke?: () => void;
    fillText?: (text: string, x: number, y: number, maxWidth?: number) => void;
    measureText?: (text: string) => Promise<{ width: number }> | { width: number };
    drawImage?: (...args: unknown[]) => void | Promise<void>;
  };

  export type ReactNativeCanvasElement = {
    width?: number;
    height?: number;
    getContext: (type: '2d') => ReactNativeCanvasContext2D | Promise<ReactNativeCanvasContext2D>;
    toDataURL?: (type?: string, encoderOptions?: number) => string | Promise<string>;
  };

  export class Image {
    constructor(canvas: ReactNativeCanvasElement, width?: number, height?: number);
    src?: string;
    addEventListener: (
      type: 'load' | 'error',
      callback: (event?: unknown) => void,
    ) => void;
  }

  export type ReactNativeCanvasProps = ViewProps & {
    ref?: Ref<ReactNativeCanvasElement>;
  };

  const Canvas: ComponentType<ReactNativeCanvasProps>;
  export default Canvas;
}
