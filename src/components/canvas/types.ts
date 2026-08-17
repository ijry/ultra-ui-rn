import type { ComponentType } from 'react';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

export type UPCanvasTextAlign = 'left' | 'right' | 'center' | 'start' | 'end';
export type UPCanvasUnit = 'px' | 'rpx' | 'upx' | string;

export type UPCanvasDrawCommand =
  | {
      kind: 'set';
      property: 'fillStyle' | 'strokeStyle' | 'lineWidth' | 'font' | 'textAlign';
      value: string | number;
    }
  | { kind: 'call'; method: string; args: unknown[] };

export type UPCanvasExportOptions = {
  width?: number;
  height?: number;
  destWidth?: number;
  destHeight?: number;
  fileType?: 'png' | 'jpg' | 'jpeg';
  quality?: number;
};

export type UPCanvasExportResult = {
  tempFilePath: string;
  dataUrl?: string;
  width: number;
  height: number;
};

export type UPCanvasAdapterHandle = {
  execute: (command: UPCanvasDrawCommand) => Promise<unknown>;
  getCanvasElement?: () => unknown | Promise<unknown>;
  getRawContext?: () => unknown | Promise<unknown>;
  measureText?: (text: string) => Promise<{ width: number }>;
  toTempFilePath?: (options?: UPCanvasExportOptions) => Promise<UPCanvasExportResult>;
  refresh?: () => Promise<void>;
};

export type UPCanvasAdapterProps = {
  canvasId: string;
  width: number;
  height: number;
  bgColor?: string;
  disableScroll?: boolean;
  testID: string;
  onReady: (handle: UPCanvasAdapterHandle) => void;
  onError?: (error: Error) => void;
  onTouchStart?: (event: GestureResponderEvent) => void;
  onTouchMove?: (event: GestureResponderEvent) => void;
  onTouchEnd?: (event: GestureResponderEvent) => void;
};

export type UPCanvasAdapterComponent = ComponentType<UPCanvasAdapterProps>;

export type UPCanvasProps = {
  canvasId?: string;
  width?: number | string;
  height?: number | string;
  unit?: UPCanvasUnit;
  useRootHeightAndWidth?: boolean;
  bgColor?: string;
  disableScroll?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  canvasAdapter?: UPCanvasAdapterComponent;
  onReady?: (ref: UPCanvasRef) => void;
  onError?: (error: Error) => void;
  onTouchStart?: (event: GestureResponderEvent) => void;
  onTouchMove?: (event: GestureResponderEvent) => void;
  onTouchEnd?: (event: GestureResponderEvent) => void;
};

export type UPCanvasRef = {
  refresh: () => Promise<void>;
  getWidth: () => number;
  getHeight: () => number;
  getCanvasElement: () => Promise<unknown>;
  getRawContext: () => Promise<unknown>;
  getCanvasContext: () => Promise<unknown>;
  clearCanvas: () => Promise<void>;
  clearRect: (x: number, y: number, width: number, height: number) => Promise<void>;
  rect: (x: number, y: number, width: number, height: number) => Promise<void>;
  fillRect: (x: number, y: number, width: number, height: number) => Promise<void>;
  strokeRect: (x: number, y: number, width: number, height: number) => Promise<void>;
  beginPath: () => Promise<void>;
  closePath: () => Promise<void>;
  fill: () => Promise<void>;
  stroke: () => Promise<void>;
  setFillStyle: (color: string) => Promise<void>;
  setStrokeStyle: (color: string) => Promise<void>;
  setLineWidth: (width: number) => Promise<void>;
  setFont: (font: string) => Promise<void>;
  setFontSize: (size: number) => Promise<void>;
  setTextAlign: (align: UPCanvasTextAlign) => Promise<void>;
  fillText: (text: string, x: number, y: number, maxWidth?: number) => Promise<void>;
  measureText: (text: string) => Promise<{ width: number }>;
  drawImage: (...args: unknown[]) => Promise<void>;
  lineTo: (x: number, y: number) => Promise<void>;
  moveTo: (x: number, y: number) => Promise<void>;
  draw: () => Promise<void>;
  toTempFilePath: (options?: UPCanvasExportOptions) => Promise<UPCanvasExportResult>;
};
