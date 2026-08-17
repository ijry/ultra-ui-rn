import React, { useState } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils';
import { UPIcon } from '../icon';
import { UPLine } from '../line';
import { UPStatusBar } from '../status-bar';
import type { UPNavbarMiniPressEvent, UPNavbarMiniProps } from './types';

export type { UPNavbarMiniHomePayload, UPNavbarMiniProps } from './types';

export function UPNavbarMini(input: UPNavbarMiniProps): React.JSX.Element {
  const props = { ...useUPConfig().props.navbarMini, ...input } as UPNavbarMiniProps;
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(getPx(props.height ?? 32));
  const height = getPx(props.height ?? 32);
  const fixed = Boolean(props.fixed);
  const placeholder = fixed && Boolean(props.placeholder);
  const iconColor = props.leftIconColor || props.iconColor || '#fff';
  const innerStyle: ViewStyle = {
    left: fixed ? 20 : undefined,
    overflow: 'hidden',
    position: fixed ? 'absolute' : 'relative',
    top: fixed ? 10 : undefined,
    width: 90,
    zIndex: fixed ? 11 : undefined,
  };
  const onLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };
  const onLeftPress = (event: UPNavbarMiniPressEvent) => {
    input.onLeftClick?.(event);
    if (props.autoBack) BackHandler.exitApp();
  };
  const onHomePress = (event: UPNavbarMiniPressEvent) => {
    input.onHomeClick?.({ event, homeUrl: props.homeUrl ?? '' });
  };

  return (
    <View style={input.customStyle} testID="up-navbar-mini">
      {placeholder ? (
        <View
          style={{ height: contentHeight + statusBarHeight }}
          testID="up-navbar-mini-placeholder"
        />
      ) : null}
      <View
        onLayout={onLayout}
        style={[innerStyle, input.innerStyle]}
        testID="up-navbar-mini-inner"
      >
        {props.safeAreaInsetTop ? (
          <UPStatusBar bgColor="transparent" onUpdateHeight={setStatusBarHeight} />
        ) : null}
        <View
          style={[styles.content, { backgroundColor: props.bgColor, height }, input.contentStyle]}
          testID="up-navbar-mini-content"
        >
          <Pressable
            accessibilityLabel="返回"
            accessibilityRole="button"
            onPress={onLeftPress}
            style={[styles.region, input.leftStyle]}
            testID="up-navbar-mini-left"
          >
            {input.renderLeft?.() ?? input.left ?? (
              <UPIcon color={iconColor} name={props.leftIcon} size={props.iconSize} />
            )}
          </Pressable>
          <View style={styles.dividerWrap} testID="up-navbar-mini-divider">
            <UPLine color="#fff" direction="col" length="16px" />
          </View>
          <Pressable
            accessibilityLabel="首页"
            accessibilityRole="button"
            onPress={onHomePress}
            style={[styles.region, input.centerStyle]}
            testID="up-navbar-mini-home"
          >
            {input.renderCenter?.() ?? input.center ?? (
              <UPIcon color={props.iconColor} name="home" size={props.iconSize} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  dividerWrap: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  region: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
