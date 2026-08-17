import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import {
  UPCanvas,
  type UPCanvasExportResult,
  type UPCanvasProps,
  type UPCanvasRef,
} from '../canvas';
import { UPIcon } from '../icon';
import { UPSlider } from '../slider';

export type UPSignaturePoint = {
  color: string;
  type: 'move' | 'start';
  width: number;
  x: number;
  y: number;
};

export type UPSignaturePath = readonly UPSignaturePoint[];

export type UPSignatureRef = {
  clear: () => void;
  confirm: () => Promise<void>;
  getPaths: () => readonly UPSignaturePath[];
  isEmpty: () => boolean;
  undo: () => void;
};

export type UPSignatureProps = {
  bgColor?: string;
  canvasProps?: Omit<
    UPCanvasProps,
    'bgColor' | 'height' | 'onTouchEnd' | 'onTouchMove' | 'onTouchStart' | 'width'
  >;
  color?: string;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  height?: UPDimension;
  presetColors?: readonly string[];
  showToolbar?: boolean;
  thickness?: number;
  width?: UPDimension;
  onClear?: () => void;
  onConfirm?: (result: UPCanvasExportResult) => void;
  onError?: (error: Error) => void;
};

type ResolvedUPSignatureProps = UPSignatureProps & {
  bgColor: string;
  color: string;
  height: UPDimension;
  presetColors: readonly string[];
  showToolbar: boolean;
  thickness: number;
  width: UPDimension;
};

function eventPoint(event: GestureResponderEvent): Pick<UPSignaturePoint, 'x' | 'y'> {
  const native = event.nativeEvent as {
    locationX?: number;
    locationY?: number;
    pageX?: number;
    pageY?: number;
  };
  return {
    x: Number(native.locationX ?? native.pageX ?? 0),
    y: Number(native.locationY ?? native.pageY ?? 0),
  };
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export const UPSignature = forwardRef<UPSignatureRef, UPSignatureProps>(function UPSignature(input, ref) {
  const config = useUPConfig();
  const props = {
    ...config.props.signature,
    ...input,
  } as ResolvedUPSignatureProps;
  const canvasRef = useRef<UPCanvasRef>(null);
  const pathsRef = useRef<UPSignaturePath[]>([]);
  const currentPathRef = useRef<UPSignaturePoint[]>([]);
  const [pathsVersion, setPathsVersion] = useState(0);
  const [color, setColor] = useState(props.color);
  const [thickness, setThickness] = useState(props.thickness);
  const width = getPx(props.width);
  const height = getPx(props.height);

  useEffect(() => setColor(props.color), [props.color]);
  useEffect(() => setThickness(props.thickness), [props.thickness]);

  const refreshPaths = useCallback(() => setPathsVersion((value) => value + 1), []);

  const redraw = useCallback(async (paths: readonly UPSignaturePath[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await canvas.clearCanvas();
    for (const path of paths) {
      if (path.length === 0) continue;
      const [start, ...moves] = path;
      await canvas.setStrokeStyle(start.color);
      await canvas.setLineWidth(start.width);
      await canvas.beginPath();
      await canvas.moveTo(start.x, start.y);
      for (const point of moves) {
        await canvas.lineTo(point.x, point.y);
      }
      await canvas.stroke();
      await canvas.closePath();
    }
    await canvas.draw();
  }, []);

  const start = useCallback((event: GestureResponderEvent) => {
    const canvas = canvasRef.current;
    const point = {
      ...eventPoint(event),
      color,
      type: 'start' as const,
      width: thickness,
    };
    currentPathRef.current = [point];
    void canvas?.setStrokeStyle(color);
    void canvas?.setLineWidth(thickness);
    void canvas?.beginPath();
    void canvas?.moveTo(point.x, point.y);
  }, [color, thickness]);

  const move = useCallback((event: GestureResponderEvent) => {
    const canvas = canvasRef.current;
    if (currentPathRef.current.length === 0) return;
    const point = {
      ...eventPoint(event),
      color,
      type: 'move' as const,
      width: thickness,
    };
    currentPathRef.current.push(point);
    void canvas?.lineTo(point.x, point.y);
    void canvas?.stroke();
    void canvas?.draw();
  }, [color, thickness]);

  const end = useCallback(() => {
    const path = currentPathRef.current;
    currentPathRef.current = [];
    if (path.length === 0) return;
    pathsRef.current = [...pathsRef.current, path];
    refreshPaths();
    void canvasRef.current?.closePath();
  }, [refreshPaths]);

  const clear = useCallback(() => {
    currentPathRef.current = [];
    pathsRef.current = [];
    refreshPaths();
    void canvasRef.current?.clearCanvas();
    input.onClear?.();
  }, [input, refreshPaths]);

  const undo = useCallback(() => {
    const next = pathsRef.current.slice(0, -1);
    pathsRef.current = next;
    refreshPaths();
    void redraw(next);
  }, [redraw, refreshPaths]);

  const confirm = useCallback(async () => {
    if (pathsRef.current.length === 0) return;
    try {
      const result = await canvasRef.current?.toTempFilePath({ fileType: 'png', quality: 1 });
      if (result) input.onConfirm?.(result);
    } catch (error) {
      input.onError?.(toError(error));
    }
  }, [input]);

  useImperativeHandle(ref, () => ({
    clear,
    confirm,
    getPaths: () => pathsRef.current,
    isEmpty: () => pathsRef.current.length === 0 && currentPathRef.current.length === 0,
    undo,
  }), [clear, confirm, undo]);

  const toolbar = useMemo(() => {
    if (!props.showToolbar) return null;
    return (
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 8 }} testID="up-signature-toolbar">
        <Pressable accessibilityRole="button" onPress={undo} testID="up-signature-undo">
          <UPIcon name="reload" size={18} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={clear} testID="up-signature-clear">
          <Text>清除</Text>
        </Pressable>
        {props.presetColors.map((item, index) => (
          <Pressable
            accessibilityRole="button"
            key={`${item}-${index}`}
            onPress={() => setColor(item)}
            style={{
              backgroundColor: item,
              borderColor: color === item ? '#303133' : '#dcdfe6',
              borderRadius: 8,
              borderWidth: 1,
              height: 16,
              width: 16,
            }}
            testID={`up-signature-color-${index}`}
          />
        ))}
        <UPSlider
          max={10}
          min={1}
          onChange={setThickness}
          showValue
          step={1}
          value={thickness}
        />
      </View>
    );
  }, [clear, color, props.presetColors, props.showToolbar, thickness, undo]);

  return (
    <View style={input.customStyle} testID="up-signature">
      <UPCanvas
        {...input.canvasProps}
        bgColor={props.bgColor}
        disableScroll
        height={height}
        onError={input.onError}
        onTouchEnd={end}
        onTouchMove={move}
        onTouchStart={start}
        ref={canvasRef}
        width={width}
      />
      {toolbar}
      <Text style={{ display: 'none' }}>{pathsVersion}</Text>
    </View>
  );
});
