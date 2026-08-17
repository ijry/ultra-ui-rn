import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range, type UPDimension } from '../../utils';
import { UPImage } from '../image';
import type { UPCateTabItem, UPCateTabProps } from './types';

export type { UPCateTabProps } from './types';

function labelOf(item: UPCateTabItem, keyName: string): string {
  return String(item[keyName] ?? '');
}

function childrenOf(item: UPCateTabItem): readonly UPCateTabItem[] {
  return Array.isArray(item.children) ? item.children : [];
}

function heightStyle(value: UPDimension): ViewStyle['height'] {
  const text = String(value).trim();
  return text.includes('%') ? (text as `${number}%`) : getPx(value);
}

export function UPCateTab(input: UPCateTabProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.cateTab, ...input } as UPCateTabProps;
  const tabs = props.tabList ?? [];
  const controlled = input.current !== undefined;
  const configuredCurrent = Number(props.current ?? 0);
  const [innerCurrent, setInnerCurrent] = useState(
    input.defaultCurrent ?? configuredCurrent,
  );
  const resolvedCurrent = range(
    0,
    Math.max(0, tabs.length - 1),
    controlled ? Number(input.current) : innerCurrent,
  );
  const currentRef = useRef(resolvedCurrent);
  const menuRef = useRef<ScrollView>(null);
  const rightRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef(new Map<number, number>());
  const menuFrames = useRef(new Map<number, { height: number; y: number }>());
  const menuViewportHeight = useRef(0);
  const rightProgrammaticScroll = useRef(false);
  const pendingControlledScroll = useRef<number | null>(
    controlled ? resolvedCurrent : null,
  );

  useEffect(() => {
    currentRef.current = resolvedCurrent;
  }, [resolvedCurrent]);

  useEffect(() => {
    if (input.current === undefined && input.defaultCurrent === undefined) {
      setInnerCurrent(configuredCurrent);
    }
  }, [configuredCurrent, input.current, input.defaultCurrent]);

  const centerMenu = useCallback((index: number) => {
    const frame = menuFrames.current.get(index);
    if (!frame) return;
    const viewport = menuViewportHeight.current || 360;
    menuRef.current?.scrollTo({
      animated: props.animated !== false,
      y: Math.max(0, frame.y + frame.height / 2 - viewport / 2),
    });
  }, [props.animated]);

  const scrollRightTo = useCallback((index: number) => {
    const target = sectionOffsets.current.get(index);
    if (target === undefined) return false;
    rightProgrammaticScroll.current = true;
    rightRef.current?.scrollTo({
      animated: props.animated !== false,
      y: target,
    });
    setTimeout(() => {
      rightProgrammaticScroll.current = false;
    }, 120);
    return true;
  }, [props.animated]);

  const activate = useCallback((rawIndex: number, source: 'menu' | 'scroll') => {
    if (!tabs.length) return;
    const index = range(0, tabs.length - 1, rawIndex);
    if (index === currentRef.current) return;
    currentRef.current = index;
    if (!controlled) setInnerCurrent(index);
    input.onUpdateCurrent?.(index);
    input.onChange?.(index, tabs[index]!);
    centerMenu(index);
    if (source === 'menu' && props.mode !== 'tab') {
      scrollRightTo(index);
    }
  }, [centerMenu, controlled, input, props.mode, scrollRightTo, tabs]);

  useEffect(() => {
    if (!controlled || props.mode === 'tab') return;
    pendingControlledScroll.current = resolvedCurrent;
    if (scrollRightTo(resolvedCurrent)) {
      pendingControlledScroll.current = null;
    }
    centerMenu(resolvedCurrent);
  }, [centerMenu, controlled, props.mode, resolvedCurrent, scrollRightTo]);

  const onRightScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (props.mode !== 'follow' || rightProgrammaticScroll.current) return;
    const target = event.nativeEvent.contentOffset.y + 1;
    let nextIndex = 0;
    [...sectionOffsets.current.entries()]
      .sort((first, second) => first[1] - second[1])
      .forEach(([index, y]) => {
        if (y <= target) nextIndex = index;
      });
    activate(nextIndex, 'scroll');
  };

  const renderSection = (
    item: UPCateTabItem,
    index: number,
    active: boolean,
  ) => {
    const customList = input.renderItemList?.({ active, index, item });
    const children = childrenOf(item);
    return (
      <View
        key={`${labelOf(item, props.tabKeyName ?? 'name')}-${index}`}
        onLayout={(event: LayoutChangeEvent) => {
          if (props.mode !== 'follow') return;
          sectionOffsets.current.set(index, event.nativeEvent.layout.y);
          if (pendingControlledScroll.current === index && scrollRightTo(index)) {
            pendingControlledScroll.current = null;
          }
        }}
        style={[styles.section, input.sectionStyle]}
        testID={`up-cate-tab-section-${index}`}
      >
        {customList ?? (
          <>
            <Text style={[styles.sectionTitle, input.titleStyle]}>
              {labelOf(item, props.tabKeyName ?? 'name')}
            </Text>
            <View style={styles.itemContainer}>
              {children.map((child, childIndex) => (
                <View
                  key={`${labelOf(child, props.itemKeyName ?? 'name')}-${childIndex}`}
                  style={styles.thumbBox}
                  testID={`up-cate-tab-page-item-${index}-${childIndex}`}
                >
                  {input.renderPageItem?.({
                    index: childIndex,
                    item: child,
                    parent: item,
                    parentIndex: index,
                  }) ?? (
                    <>
                      {child.icon ? (
                        <UPImage
                          height={50}
                          mode="aspectFill"
                          src={String(child.icon)}
                          width={50}
                        />
                      ) : null}
                      <Text style={[styles.thumbName, input.itemTextStyle]}>
                        {labelOf(child, props.itemKeyName ?? 'name')}
                      </Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  const visibleSections = props.mode === 'tab'
    ? tabs[resolvedCurrent]
      ? [{ index: resolvedCurrent, item: tabs[resolvedCurrent]! }]
      : []
    : tabs.map((item, index) => ({ index, item }));

  return (
    <View
      style={[styles.root, { height: heightStyle(props.height ?? '100%') }, input.customStyle]}
      testID="up-cate-tab"
    >
      <View style={styles.wrap}>
        <ScrollView
          onLayout={(event) => {
            menuViewportHeight.current = event.nativeEvent.layout.height;
          }}
          ref={menuRef}
          style={[styles.menu, input.menuStyle]}
          testID="up-cate-tab-menu-scroll"
        >
          {tabs.map((item, index) => {
            const active = index === resolvedCurrent;
            const label = labelOf(item, props.tabKeyName ?? 'name');
            return (
              <Pressable
                accessibilityLabel={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={`${label}-${index}`}
                onLayout={(event: LayoutChangeEvent) => {
                  menuFrames.current.set(index, event.nativeEvent.layout);
                }}
                onPress={() => activate(index, 'menu')}
                style={[
                  styles.menuItem,
                  active ? styles.menuItemActive : null,
                  input.menuItemStyle,
                  active ? input.activeMenuItemStyle : null,
                ]}
                testID={`up-cate-tab-menu-item-${index}`}
              >
                {active ? <View style={styles.activeBar} /> : null}
                {input.renderTabItem?.({ active, index, item }) ?? (
                  <Text
                    numberOfLines={1}
                    style={[styles.menuText, active ? styles.menuTextActive : null]}
                  >
                    {label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView
          onMomentumScrollEnd={() => {
            rightProgrammaticScroll.current = false;
          }}
          onScroll={onRightScroll}
          onScrollEndDrag={() => {
            rightProgrammaticScroll.current = false;
          }}
          ref={rightRef}
          scrollEventThrottle={16}
          style={[styles.right, input.rightStyle]}
          testID="up-cate-tab-right-scroll"
        >
          {input.renderRightTop?.({ tabList: tabs })}
          {visibleSections.map(({ index, item }) => (
            renderSection(item, index, index === resolvedCurrent)
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeBar: {
    backgroundColor: '#3c9cff',
    bottom: 8,
    left: 0,
    position: 'absolute',
    top: 8,
    width: 3,
  },
  itemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  menu: {
    backgroundColor: '#f6f6f6',
    width: 90,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 8,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#ffffff',
  },
  menuText: {
    color: '#303133',
    fontSize: 14,
  },
  menuTextActive: {
    color: '#3c9cff',
    fontWeight: '600',
  },
  right: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  root: {
    backgroundColor: '#ffffff',
  },
  section: {
    paddingBottom: 16,
  },
  sectionTitle: {
    color: '#303133',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  thumbBox: {
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 6,
    width: '33.3333%',
  },
  thumbName: {
    color: '#606266',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  wrap: {
    flex: 1,
    flexDirection: 'row',
  },
});
