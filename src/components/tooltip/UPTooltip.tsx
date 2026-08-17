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
  Dimensions,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { toast } from '../../feedback';
import { useUPOverlay } from '../../overlay';
import { getPx, type UPDimension } from '../../utils';
import { UPOverlay } from '../overlay';

export type UPTooltipDirection = 'top' | 'bottom' | 'left' | 'right';
export type UPTooltipTriggerMode = 'click' | 'longpress' | 'manual' | 'hover';
export type UPTooltipWriteText = (content: string) => void | Promise<void>;

export type UPTooltipRef = {
  open: () => void;
  close: () => void;
};

export type UPTooltipProps = {
  text?: string | number;
  copyText?: string | number;
  size?: UPDimension;
  color?: string;
  bgColor?: string;
  popupBgColor?: string;
  direction?: UPTooltipDirection;
  zIndex?: number | string;
  showCopy?: boolean;
  buttons?: readonly (string | number)[];
  overlay?: boolean;
  showToast?: boolean;
  triggerMode?: UPTooltipTriggerMode;
  forcePosition?: Record<string, unknown>;
  show?: boolean;
  singleton?: boolean;
  trigger?: React.ReactNode;
  content?: React.ReactNode;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Native application clipboard adapter. */
  writeText?: UPTooltipWriteText;
  /** Native testing hook; not part of the uview source API. */
  triggerTestID?: string;
  onClick?: (index: number) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onUpdateShow?: (show: boolean) => void;
};

type TooltipFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TooltipSize = {
  width: number;
  height: number;
};

type TooltipLayerProps = {
  close: () => void;
  copy: () => void;
  frame: TooltipFrame;
  onPopupLayout: (event: LayoutChangeEvent) => void;
  popupSize: TooltipSize;
  props: Required<Pick<UPTooltipProps,
    'buttons' | 'color' | 'copyText' | 'direction' | 'forcePosition' | 'overlay' | 'popupBgColor' | 'showCopy' | 'text' | 'zIndex'>> & UPTooltipProps;
  select: (index: number) => void;
};

const fallbackFrame: TooltipFrame = { height: 0, width: 1, x: 0, y: 0 };
const fallbackSize: TooltipSize = { height: 36, width: 120 };
const screenInset = 12;
const indicatorSize = 14;
let tooltipSequence = 0;
let activeSingleton: { id: string; close: () => void } | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function sourceZIndex(value: number | string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 10071;
}

function popupPosition(
  direction: UPTooltipDirection,
  frame: TooltipFrame,
  popupSize: TooltipSize,
): ViewStyle {
  const window = Dimensions.get('window');
  const width = Math.max(1, popupSize.width);
  const height = Math.max(1, popupSize.height);
  const triggerCenterX = frame.x + frame.width / 2;
  const triggerCenterY = frame.y + frame.height / 2;
  let left = triggerCenterX - width / 2;
  let top = frame.y - height - indicatorSize / 2;

  if (direction === 'bottom') top = frame.y + frame.height + indicatorSize / 2;
  if (direction === 'left') {
    left = frame.x - width - indicatorSize / 2;
    top = triggerCenterY - height / 2;
  }
  if (direction === 'right') {
    left = frame.x + frame.width + indicatorSize / 2;
    top = triggerCenterY - height / 2;
  }

  return {
    left: clamp(left, screenInset, Math.max(screenInset, window.width - width - screenInset)),
    position: 'absolute',
    top: clamp(top, screenInset, Math.max(screenInset, window.height - height - screenInset)),
  };
}

function indicatorStyle(direction: UPTooltipDirection, popupSize: TooltipSize): ViewStyle {
  const centeredLeft = Math.max(6, popupSize.width / 2 - indicatorSize / 2);
  const centeredTop = Math.max(6, popupSize.height / 2 - indicatorSize / 2);
  if (direction === 'bottom') return { left: centeredLeft, top: -indicatorSize / 2 };
  if (direction === 'left') return { right: -indicatorSize / 2, top: centeredTop };
  if (direction === 'right') return { left: -indicatorSize / 2, top: centeredTop };
  return { bottom: -indicatorSize / 2, left: centeredLeft };
}

function TooltipLayer({
  close,
  copy,
  frame,
  onPopupLayout,
  popupSize,
  props,
  select,
}: TooltipLayerProps): React.JSX.Element {
  const backgroundColor = props.popupBgColor || '#060607';
  const basePosition = popupPosition(props.direction, frame, popupSize);
  const position = { ...basePosition, ...props.forcePosition } as ViewStyle;
  const popupContent = props.content ?? (
    <View style={actionsStyle}>
      {props.showCopy ? (
        <Pressable
          accessibilityLabel="复制"
          accessibilityRole="button"
          onPress={copy}
          style={actionStyle}
          testID="up-tooltip-copy"
        >
          <Text style={actionTextStyle}>复制</Text>
        </Pressable>
      ) : null}
      {props.buttons.map((button, index) => (
        <Pressable
          accessibilityLabel={String(button)}
          accessibilityRole="button"
          key={`${String(button)}-${index}`}
          onPress={() => select(index)}
          style={actionStyle}
          testID={`up-tooltip-button-${index}`}
        >
          <Text style={actionTextStyle}>{String(button)}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View pointerEvents="box-none" style={layerStyle}>
      {props.overlay ? (
        <UPOverlay
          onClick={close}
          opacity={0}
          show
          testID="up-tooltip-overlay"
          zIndex={props.zIndex}
        />
      ) : null}
      <View
        onLayout={onPopupLayout}
        style={[popupStyle, position, { backgroundColor, zIndex: sourceZIndex(props.zIndex) + 1 }]}
        testID="up-tooltip-popup"
      >
        <View style={[indicatorBaseStyle, indicatorStyle(props.direction, popupSize), { backgroundColor }]} />
        {popupContent}
      </View>
    </View>
  );
}

export const UPTooltip = forwardRef<UPTooltipRef, UPTooltipProps>(function UPTooltip(input, ref) {
  const config = useUPConfig();
  const props = { ...config.props.tooltip, ...input } as UPTooltipProps;
  const overlay = useUPOverlay();
  const triggerRef = useRef<View>(null);
  const id = useRef(`up-tooltip-${tooltipSequence++}`).current;
  const [visible, setVisible] = useState(false);
  const [frame, setFrame] = useState<TooltipFrame>(fallbackFrame);
  const [popupSize, setPopupSize] = useState<TooltipSize>(fallbackSize);
  const visibleRef = useRef(false);

  const requestVisible = useCallback((next: boolean) => {
    if (visibleRef.current === next) return;
    visibleRef.current = next;
    setVisible(next);
    input.onUpdateShow?.(next);
    if (next) input.onOpen?.();
    else input.onClose?.();
  }, [input]);

  const close = useCallback(() => {
    if (activeSingleton?.id === id) activeSingleton = null;
    requestVisible(false);
  }, [id, requestVisible]);

  const open = useCallback(() => {
    if (props.singleton) {
      if (activeSingleton && activeSingleton.id !== id) activeSingleton.close();
      activeSingleton = { close, id };
    }
    setFrame(fallbackFrame);
    requestVisible(true);
    const node = triggerRef.current;
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x, y, width, height) => setFrame({ height, width, x, y }));
    }
  }, [close, id, props.singleton, requestVisible]);

  const select = useCallback((index: number) => {
    close();
    input.onClick?.(Boolean(props.showCopy) ? index + 1 : index);
  }, [close, input, props.showCopy]);

  const copy = useCallback(async () => {
    close();
    input.onClick?.(0);
    const content = props.copyText === '' || props.copyText === undefined
      ? props.text
      : props.copyText;
    if (!input.writeText) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('UPTooltip requires a writeText adapter to copy content.');
      }
      if (props.showToast) toast.default('复制失败');
      return;
    }
    try {
      await Promise.resolve(input.writeText(String(content)));
      if (props.showToast) toast.default('复制成功');
    } catch {
      if (props.showToast) toast.default('复制失败');
    }
  }, [close, input, props.copyText, props.showToast, props.text]);

  const onPopupLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setPopupSize((current) => (current.height === height && current.width === width ? current : { height, width }));
  }, []);

  useImperativeHandle(ref, () => ({ close, open }), [close, open]);

  useEffect(() => {
    if (props.triggerMode !== 'manual') return;
    if (props.show) open();
    else close();
  }, [close, open, props.show, props.triggerMode]);

  useEffect(() => () => {
    if (activeSingleton?.id === id) activeSingleton = null;
    overlay.remove(id);
  }, [id, overlay]);

  const layerProps = useMemo(() => ({
    ...props,
    buttons: props.buttons ?? [],
    color: props.color ?? '#606266',
    content: input.content,
    copyText: props.copyText ?? '',
    direction: props.direction ?? 'top',
    forcePosition: props.forcePosition ?? {},
    overlay: Boolean(props.overlay),
    popupBgColor: props.popupBgColor ?? '',
    showCopy: Boolean(props.showCopy),
    text: props.text ?? '',
    zIndex: props.zIndex ?? 10071,
  }), [input.content, props]);

  useEffect(() => {
    if (!visible) {
      overlay.remove(id);
      return;
    }
    overlay.add({
      id,
      node: (
        <TooltipLayer
          close={close}
          copy={copy}
          frame={frame}
          onPopupLayout={onPopupLayout}
          popupSize={popupSize}
          props={layerProps}
          select={select}
        />
      ),
      zIndex: sourceZIndex(props.zIndex),
    });
    return () => overlay.remove(id);
  }, [close, copy, frame, id, layerProps, onPopupLayout, overlay, popupSize, props.zIndex, select, visible]);

  const trigger = input.trigger ?? input.children ?? (
    <Text
      style={{
        backgroundColor: visible ? props.bgColor : 'transparent',
        color: props.color,
        fontSize: getPx(props.size ?? 14),
      }}
    >
      {props.text}
    </Text>
  );
  const triggerMode = props.triggerMode;
  const interactive = triggerMode === 'click' || triggerMode === 'longpress';
  const triggerTestID = input.triggerTestID ?? 'up-tooltip-trigger';

  return (
    <View ref={triggerRef} style={input.customStyle} testID="up-tooltip">
      {interactive ? (
        <Pressable
          accessibilityRole="button"
          onLongPress={triggerMode === 'longpress' ? open : undefined}
          onPress={triggerMode === 'click' ? open : undefined}
          testID={triggerTestID}
        >
          {trigger}
        </Pressable>
      ) : (
        <View testID={triggerTestID}>{trigger}</View>
      )}
    </View>
  );
});

const layerStyle: ViewStyle = { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 };
const popupStyle: ViewStyle = { borderRadius: 5, overflow: 'visible' };
const indicatorBaseStyle: ViewStyle = {
  borderRadius: 2,
  height: indicatorSize,
  position: 'absolute',
  transform: [{ rotate: '45deg' }],
  width: indicatorSize,
  zIndex: -1,
};
const actionsStyle: ViewStyle = { alignItems: 'center', flexDirection: 'row' };
const actionStyle: ViewStyle = { paddingHorizontal: 13, paddingVertical: 11 };
const actionTextStyle: TextStyle = { color: '#ffffff', fontSize: 13, lineHeight: 16 };
