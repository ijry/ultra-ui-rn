import React, {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPSafeBottom } from '../safe-bottom';
import {
  UPTabbarContext,
  type UPTabbarAnimationType,
  type UPTabbarContextValue,
  type UPTabbarName,
  type UPTabbarStyleType,
} from './context';

export type UPTabbarProps = {
  value?: UPTabbarName | null;
  modelValue?: UPTabbarName | null;
  defaultValue?: UPTabbarName | null;
  safeAreaInsetBottom?: boolean;
  border?: boolean;
  borderColor?: string;
  zIndex?: number | string;
  activeColor?: string;
  inactiveColor?: string;
  fixed?: boolean;
  placeholder?: boolean;
  backgroundColor?: string;
  styleType?: UPTabbarStyleType;
  animationType?: UPTabbarAnimationType;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  itemShape?: string;
  iconScale?: number;
  textMode?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onChange?: (name: UPTabbarName) => void;
  onClick?: (name: UPTabbarName) => void;
};

function numericZIndex(value: number | string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 1;
}

function tabbarSurfaceStyle(
  styleType: UPTabbarStyleType,
  itemShape: string,
): ViewStyle {
  const rounded = styleType === 'pill' || styleType === 'glow' || styleType === 'card' || styleType === 'convex';
  const padding = rounded ? 6 : 0;
  const radius = itemShape === 'round'
    ? 999
    : itemShape === 'square'
      ? 8
      : styleType === 'pill' || styleType === 'glow'
        ? 36
        : styleType === 'card'
          ? 12
          : styleType === 'convex'
            ? 16
            : 0;
  return { borderRadius: radius, paddingHorizontal: padding, paddingTop: padding };
}

export function UPTabbar(input: UPTabbarProps): React.JSX.Element {
  const props = { ...useUPConfig().props.tabbar, ...input } as UPTabbarProps;
  const controlledValue = input.value !== undefined
    ? input.value
    : input.modelValue !== undefined
      ? input.modelValue
      : undefined;
  const [selected, setSelected] = useState<UPTabbarName | null>(
    input.defaultValue ?? props.value ?? null,
  );
  const [contentHeight, setContentHeight] = useState(50);
  const value = controlledValue === undefined ? selected : controlledValue;
  const controlled = controlledValue !== undefined;

  useEffect(() => {
    if (controlledValue !== undefined) setSelected(controlledValue);
  }, [controlledValue]);

  const select = useCallback((name: UPTabbarName) => {
    if (name !== value) {
      if (!controlled) setSelected(name);
      input.onChange?.(name);
    }
    input.onClick?.(name);
  }, [controlled, input, value]);

  const context = useMemo<UPTabbarContextValue>(() => ({
    activeBackgroundColor: props.activeBackgroundColor ?? '',
    activeColor: props.activeColor ?? '#1989fa',
    animationType: (props.animationType ?? 'none') as UPTabbarAnimationType,
    iconScale: Number(props.iconScale ?? 1.1),
    inactiveBackgroundColor: props.inactiveBackgroundColor ?? '',
    inactiveColor: props.inactiveColor ?? '#7d7e80',
    itemShape: props.itemShape ?? 'default',
    select,
    styleType: (props.styleType ?? 'default') as UPTabbarStyleType,
    textMode: props.textMode ?? 'always',
    value,
  }), [props, select, value]);

  const onLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0) setContentHeight(height);
  };
  const fixed = Boolean(props.fixed);
  const placeholder = fixed && Boolean(props.placeholder);
  const surfaceStyle = tabbarSurfaceStyle(context.styleType, context.itemShape);
  const contentStyle: ViewStyle = {
    backgroundColor: props.backgroundColor || '#ffffff',
    borderTopColor: props.borderColor || '#dadbde',
    borderTopWidth: props.border ? 1 : 0,
    left: fixed ? 0 : undefined,
    position: fixed ? 'absolute' : 'relative',
    right: fixed ? 0 : undefined,
    bottom: fixed ? 0 : undefined,
    zIndex: numericZIndex(props.zIndex),
    ...surfaceStyle,
  };
  const children = Children.map(input.children, (child, index) =>
    isValidElement(child) ? cloneElement(child, { itemIndex: index } as object) : child,
  );

  return (
    <UPTabbarContext.Provider value={context}>
      <View style={input.customStyle} testID="up-tabbar">
        {placeholder ? <View style={{ height: contentHeight }} testID="up-tabbar-placeholder" /> : null}
        <View onLayout={onLayout} style={contentStyle} testID="up-tabbar-content">
          <View style={{ flexDirection: 'row', height: 50 }}>
            {children}
          </View>
          {props.safeAreaInsetBottom ? <UPSafeBottom /> : null}
        </View>
      </View>
    </UPTabbarContext.Provider>
  );
}
