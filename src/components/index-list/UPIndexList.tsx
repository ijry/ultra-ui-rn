import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIndexListContext } from './context';

export type UPIndexValue = string | number | { key?: string | number; name?: string };

export type UPIndexListProps = {
  inactiveColor?: string;
  activeColor?: string;
  indexList?: readonly UPIndexValue[];
  sticky?: boolean;
  customNavHeight?: UPDimension;
  /** @deprecated React Native core does not infer source safe-area spacing. */
  safeBottomFix?: boolean;
  itemMargin?: UPDimension;
  height?: UPDimension;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onSelect?: (index: UPIndexValue) => void;
};

const alphabet = Array.from({ length: 26 }, (_value, index) => String.fromCharCode(65 + index));

export function getUPIndexValueKey(value: UPIndexValue): string {
  if (typeof value !== 'object' || value === null) {
    return String(value);
  }
  if (value.key !== undefined && value.key !== null) {
    return String(value.key);
  }
  return value.name ?? '';
}

export function UPIndexList(input: UPIndexListProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.indexList, ...input } as UPIndexListProps;
  const sourceValues = props.indexList ?? [];
  const values = sourceValues.length ? sourceValues : alphabet;
  const scrollRef = useRef<ScrollView>(null);
  const railRef = useRef<View>(null);
  const positions = useRef(new Map<string, number>());
  const activeKeyRef = useRef<string | null>(null);
  const draggingRef = useRef(false);
  const railHeightRef = useRef(0);
  const railWindowYRef = useRef<number | null>(null);
  const railItemLayouts = useRef(new Map<number, { height: number; y: number }>());
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const customNavHeight = getPx(props.customNavHeight ?? 0);
  const itemMargin = getPx(props.itemMargin ?? '0rpx');
  const railKeys = useMemo(() => new Set(values.map(getUPIndexValueKey)), [values]);

  const registerItem = useCallback((key: string, y: number) => {
    positions.current.set(key, y);
  }, []);
  const unregisterItem = useCallback((key: string) => {
    positions.current.delete(key);
  }, []);
  const setActive = useCallback((key: string | null) => {
    activeKeyRef.current = key;
    setActiveKey(key);
  }, []);
  const context = useMemo(() => ({
    activeKey,
    itemMargin,
    registerItem,
    sticky: props.sticky !== false,
    unregisterItem,
  }), [activeKey, itemMargin, props.sticky, registerItem, unregisterItem]);

  const activateIndex = useCallback((index: number, animated: boolean, emitWhenActive: boolean) => {
    if (!values.length) return;
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    const value = values[clampedIndex];
    const key = getUPIndexValueKey(value);
    if (activeKeyRef.current === key && !emitWhenActive) return;
    setActive(key);
    input.onSelect?.(value);
    const y = positions.current.get(key);
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ animated, y: Math.max(0, y - customNavHeight) });
    }
  }, [customNavHeight, input, setActive, values]);

  const indexAtRailY = useCallback((locationY: number) => {
    const measured = [...railItemLayouts.current.entries()].sort(([first], [second]) => first - second);
    if (measured.length === values.length) {
      for (let index = 0; index < measured.length; index += 1) {
        const [, layout] = measured[index];
        if (locationY <= layout.y + layout.height / 2) return index;
      }
      return values.length - 1;
    }
    const pitch = railHeightRef.current > 0 ? railHeightRef.current / values.length : 18;
    return Math.max(0, Math.min(values.length - 1, Math.floor(locationY / Math.max(1, pitch))));
  }, [values.length]);

  const updateRailWindowPosition = useCallback(() => {
    const node = railRef.current;
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((_x, y) => {
        railWindowYRef.current = y;
      });
    }
  }, []);

  const railLocalY = useCallback((event: { nativeEvent: { locationY: number; pageY?: number } }) => {
    const pageY = event.nativeEvent.pageY;
    const railWindowY = railWindowYRef.current;
    if (pageY !== undefined && railWindowY !== null) return pageY - railWindowY;
    return event.nativeEvent.locationY;
  }, []);

  const railResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponderCapture: (_event, gesture) => (
      Math.abs(gesture.dy) > 2 && Math.abs(gesture.dy) >= Math.abs(gesture.dx)
    ),
    onPanResponderGrant: (event) => {
      draggingRef.current = true;
      updateRailWindowPosition();
      activateIndex(indexAtRailY(railLocalY(event)), false, false);
    },
    onPanResponderMove: (event) => {
      activateIndex(indexAtRailY(railLocalY(event)), false, false);
    },
    onPanResponderRelease: () => { draggingRef.current = false; },
    onPanResponderTerminate: () => { draggingRef.current = false; },
  }), [activateIndex, indexAtRailY, railLocalY, updateRailWindowPosition]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (draggingRef.current) return;
    const target = event.nativeEvent.contentOffset.y + customNavHeight;
    const ordered = [...positions.current.entries()].sort((first, second) => first[1] - second[1]);
    let nextActiveKey: string | null = null;
    ordered.forEach(([key, y]) => {
      if (y <= target) {
        nextActiveKey = key;
      }
    });
    setActive(nextActiveKey && railKeys.has(nextActiveKey) ? nextActiveKey : null);
  };

  return (
    <UPIndexListContext.Provider value={context}>
      <View style={[{ position: 'relative' }, input.customStyle]} testID="up-index-list">
        <ScrollView
          onScroll={onScroll}
          ref={scrollRef}
          scrollEventThrottle={16}
          style={{ height: props.height === undefined ? undefined : getPx(props.height) }}
          testID="up-index-scroll"
        >
          {input.header}
          {input.children}
          {input.footer}
        </ScrollView>
        <View
          {...railResponder.panHandlers}
          ref={railRef}
          onLayout={(event) => {
            railHeightRef.current = event.nativeEvent.layout.height;
            updateRailWindowPosition();
          }}
          style={{ alignItems: 'center', position: 'absolute', right: 0, top: 0 }}
          testID="up-index-rail"
        >
          {values.map((value, index) => {
            const key = getUPIndexValueKey(value);
            const active = activeKey === key;
            return (
              <Pressable
                accessibilityLabel={`Jump to ${key}`}
                accessibilityRole="button"
                key={`${key}-${index}`}
                onLayout={(event) => {
                  railItemLayouts.current.set(index, event.nativeEvent.layout);
                }}
                onPress={() => activateIndex(index, true, true)}
                style={{
                  alignItems: 'center',
                  backgroundColor: active ? props.activeColor : 'transparent',
                  borderRadius: 100,
                  height: 16,
                  justifyContent: 'center',
                  marginVertical: 1,
                  width: 16,
                }}
                testID={`up-index-rail-${index}`}
              >
                <Text
                  style={{ color: active ? '#ffffff' : props.inactiveColor, fontSize: 12, lineHeight: 12 }}
                  testID={`up-index-rail-text-${index}`}
                >
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </UPIndexListContext.Provider>
  );
}
