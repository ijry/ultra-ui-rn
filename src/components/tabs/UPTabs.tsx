import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range, type UPDimension } from '../../utils';
import { UPBadge } from '../badge';
import { UPIcon } from '../icon';

export type UPTabItem = {
  disabled?: boolean;
  icon?: string;
  badge?: Record<string, unknown>;
  [key: string]: unknown;
};

export type UPTabsProps = {
  duration?: number;
  list?: readonly UPTabItem[];
  lineColor?: string;
  activeStyle?: StyleProp<TextStyle>;
  inactiveStyle?: StyleProp<TextStyle>;
  lineWidth?: UPDimension;
  lineHeight?: UPDimension;
  /** @deprecated React Native does not support CSS background-size for a line image. */
  lineBgSize?: string;
  itemStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  current?: number | string;
  keyName?: string;
  iconStyle?: StyleProp<TextStyle>;
  shapeMode?: '' | 'capsule' | 'card' | 'pill-arrow' | 'tag' | string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  renderIcon?: (item: UPTabItem, index: number) => React.ReactNode;
  renderItem?: (item: UPTabItem, index: number) => React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: (item: UPTabItem & { index: number }, index: number) => void;
  onLongPress?: (item: UPTabItem & { index: number }) => void;
  onChange?: (item: UPTabItem & { index: number }, index: number) => void;
  onUpdateCurrent?: (index: number) => void;
};

type TabFrame = { width: number; x: number };

function itemLabel(item: UPTabItem, keyName: string): string {
  return String(item[keyName] ?? '');
}

function shapeStyle(shapeMode: UPTabsProps['shapeMode'], active: boolean): ViewStyle {
  if (shapeMode === 'capsule') return { backgroundColor: active ? '#ffffff' : 'transparent', borderRadius: 999, minHeight: 30 };
  if (shapeMode === 'card') return { backgroundColor: active ? '#f6f8fb' : 'transparent', borderRadius: 10, minHeight: 34 };
  if (shapeMode === 'pill-arrow') return { backgroundColor: active ? '#ff3b30' : '#e8e8e8', borderRadius: 8, minHeight: 32 };
  if (shapeMode === 'tag') return { backgroundColor: active ? '#3c9cff' : '#edf0f5', borderRadius: 4, minHeight: 28 };
  return {};
}

export function UPTabs(input: UPTabsProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.tabs, ...input } as UPTabsProps;
  const items = props.list ?? [];
  const externalCurrent = Number(input.current ?? props.current ?? 0);
  const current = range(0, Math.max(0, items.length - 1), externalCurrent);
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [frames, setFrames] = useState<Record<number, TabFrame>>({});
  const activeFrame = frames[current];
  const lineWidth = getPx(props.lineWidth ?? 20);
  const lineHeight = getPx(props.lineHeight ?? 3);
  const activeStyle = StyleSheet.flatten(props.activeStyle) ?? {};
  const inactiveStyle = StyleSheet.flatten(props.inactiveStyle) ?? {};

  useEffect(() => {
    if (!props.scrollable || !activeFrame || !containerWidth) return;
    const targetX = Math.max(0, activeFrame.x + activeFrame.width / 2 - containerWidth / 2);
    scrollRef.current?.scrollTo({ animated: true, x: targetX });
  }, [activeFrame, containerWidth, current, props.scrollable]);

  const onContainerLayout = (event: LayoutChangeEvent) => setContainerWidth(event.nativeEvent.layout.width);
  const onItemLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    setFrames((previous) => previous[index]?.width === width && previous[index]?.x === x ? previous : { ...previous, [index]: { width, x } });
  };
  const activate = (item: UPTabItem, index: number) => {
    const payload = { ...item, index };
    input.onClick?.(payload, index);
    if (item.disabled || index === current) return;
    input.onUpdateCurrent?.(index);
    input.onChange?.(payload, index);
  };
  const content = (
    <View style={{ flexDirection: 'row', position: 'relative' }}>
      {items.map((item, index) => {
        const active = current === index;
        const textStyle = [
          { color: item.disabled ? config.color.disabledColor : active ? config.color.mainColor : config.color.contentColor, fontSize: 15 },
          active ? activeStyle : inactiveStyle,
          active && (props.shapeMode === 'pill-arrow' || props.shapeMode === 'tag') && !activeStyle.color ? { color: '#ffffff' } : null,
        ];
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ disabled: Boolean(item.disabled), selected: active }}
            key={`${itemLabel(item, props.keyName ?? 'name')}-${index}`}
            onLayout={onItemLayout(index)}
            onLongPress={() => input.onLongPress?.({ ...item, index })}
            onPress={() => activate(item, index)}
            style={[
              { alignItems: 'center', flex: props.scrollable ? undefined : 1, flexDirection: 'row', justifyContent: 'center', minHeight: 44, paddingHorizontal: 11 },
              shapeStyle(props.shapeMode, active),
              props.itemStyle,
            ]}
            testID={`up-tabs-item-${index}`}
          >
            {input.renderIcon?.(item, index) ?? (item.icon ? <View style={{ marginRight: 4 }}><UPIcon customStyle={props.iconStyle} name={item.icon} /></View> : null)}
            {input.renderItem?.(item, index) ?? <Text style={textStyle} testID={`up-tabs-item-text-${index}`}>{itemLabel(item, props.keyName ?? 'name')}</Text>}
            {item.badge ? <UPBadge {...item.badge} customStyle={{ marginLeft: 4 }} /> : null}
          </Pressable>
        );
      })}
      {activeFrame && !['capsule', 'pill-arrow', 'tag'].includes(props.shapeMode ?? '') ? (
        <View style={{ backgroundColor: props.lineColor || config.color.primary, borderRadius: 100, bottom: 2, height: lineHeight, left: activeFrame.x + (activeFrame.width - lineWidth) / 2, position: 'absolute', width: lineWidth }} testID="up-tabs-line" />
      ) : null}
    </View>
  );
  const navStyle: ViewStyle = props.shapeMode === 'capsule' ? { backgroundColor: '#edf0f5', borderRadius: 999, padding: 3 } : props.shapeMode === 'card' ? { backgroundColor: '#9ccde5', borderRadius: 10 } : {};

  return (
    <View style={input.customStyle} testID="up-tabs">
      <View style={{ alignItems: 'center', flexDirection: 'row' }}>
        {input.left}
        <View onLayout={onContainerLayout} style={{ flex: 1 }}>
          {props.scrollable ? <ScrollView horizontal ref={scrollRef} showsHorizontalScrollIndicator={false}><View style={navStyle}>{content}</View></ScrollView> : <View style={navStyle}>{content}</View>}
        </View>
        {input.right}
      </View>
    </View>
  );
}
