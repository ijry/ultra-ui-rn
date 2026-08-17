import React, { useState } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme/UPThemeProvider';
import { getPx } from '../../utils';
import { UPIcon } from '../icon';
import { UPStatusBar } from '../status-bar';
import type { UPNavbarPressEvent, UPNavbarProps } from './types';

export type { UPNavbarProps } from './types';

function flattenTitleStyle(value: UPNavbarProps['titleStyle']): TextStyle | undefined {
  return typeof value === 'string' ? undefined : StyleSheet.flatten(value);
}

export function UPNavbar(input: UPNavbarProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.navbar, ...input } as UPNavbarProps;
  const { colors } = useUPTheme();
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(getPx(props.height ?? 44));
  const height = getPx(props.height ?? 44);
  const titleWidth = getPx(props.titleWidth ?? 0);
  const bgColor = props.bgColor || '#ffffff';
  const titleColor = props.titleColor || colors.mainColor;
  const leftColor = props.leftIconColor || colors.mainColor;
  const fixed = Boolean(props.fixed);
  const placeholder = fixed && Boolean(props.placeholder);
  const leftContent = input.renderLeft?.() ?? input.left ?? (
    <>
      {props.leftIcon ? (
        <UPIcon color={leftColor} name={props.leftIcon} size={props.leftIconSize} />
      ) : null}
      {props.leftText ? (
        <Text style={[styles.leftText, { color: leftColor }]}>{props.leftText}</Text>
      ) : null}
    </>
  );
  const centerContent = input.renderCenter?.() ?? input.center ?? (
    <Text
      numberOfLines={1}
      style={[
        styles.title,
        { color: titleColor, width: titleWidth || undefined },
        flattenTitleStyle(props.titleStyle),
        input.titleTextStyle,
      ]}
      testID="up-navbar-title"
    >
      {String(props.title ?? '')}
    </Text>
  );
  const rightVisible = Boolean(input.renderRight || input.right || props.rightIcon || props.rightText);
  const rightContent = input.renderRight?.() ?? input.right ?? (
    <>
      {props.rightIcon ? (
        <UPIcon color={colors.mainColor} name={props.rightIcon} size={20} />
      ) : null}
      {props.rightText ? (
        <Text style={[styles.rightText, { color: colors.mainColor }]}>{props.rightText}</Text>
      ) : null}
    </>
  );
  const onInnerLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };
  const onLeftPress = (event: UPNavbarPressEvent) => {
    input.onLeftClick?.(event);
    if (props.autoBack) BackHandler.exitApp();
  };
  const innerStyle: ViewStyle = {
    backgroundColor: bgColor,
    left: fixed ? 0 : undefined,
    position: fixed ? 'absolute' : 'relative',
    right: fixed ? 0 : undefined,
    top: fixed ? 0 : undefined,
    zIndex: fixed ? 11 : undefined,
  };

  return (
    <View style={input.customStyle} testID="up-navbar">
      {placeholder ? (
        <View
          style={{ height: contentHeight + statusBarHeight }}
          testID="up-navbar-placeholder"
        />
      ) : null}
      <View
        onLayout={onInnerLayout}
        style={[innerStyle, input.innerStyle]}
        testID="up-navbar-inner"
      >
        {props.safeAreaInsetTop ? (
          <UPStatusBar
            bgColor={props.statusBarBgColor || bgColor}
            onUpdateHeight={setStatusBarHeight}
          />
        ) : null}
        <View
          style={[
            styles.content,
            {
              borderBottomColor: colors.borderColor,
              borderBottomWidth: props.border ? 1 : 0,
              height,
            },
            input.contentStyle,
          ]}
          testID="up-navbar-content"
        >
          <Pressable
            accessibilityLabel={props.leftText || '返回'}
            accessibilityRole="button"
            onPress={onLeftPress}
            style={[styles.left, input.leftStyle]}
            testID="up-navbar-left"
          >
            {leftContent}
          </Pressable>
          {centerContent}
          {rightVisible ? (
            <Pressable
              accessibilityLabel={props.rightText || '右侧操作'}
              accessibilityRole="button"
              onPress={input.onRightClick}
              style={[styles.right, input.rightStyle]}
              testID="up-navbar-right"
            >
              {rightContent}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const UPNavigationBar = UPNavbar;

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  left: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    paddingHorizontal: 13,
    position: 'absolute',
    top: 0,
  },
  leftText: {
    fontSize: 15,
    marginLeft: 3,
  },
  right: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 13,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  rightText: {
    fontSize: 15,
    marginLeft: 3,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
});
