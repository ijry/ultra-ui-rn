import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPNoticeBarProps = {
  text?: string | readonly string[];
  direction?: 'row' | 'column' | string;
  step?: boolean;
  icon?: string;
  mode?: '' | 'link' | 'closable' | string;
  color?: string;
  bgColor?: string;
  speed?: UPDimension;
  fontSize?: UPDimension;
  duration?: UPDimension;
  disableTouch?: boolean;
  /** @deprecated Navigation is application-owned in React Native. */
  url?: string;
  /** @deprecated Navigation is application-owned in React Native. */
  linkType?: string;
  justifyContent?: ViewStyle['justifyContent'] | string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: (index?: number) => void;
  onClose?: () => void;
};

function noticeTexts(text: string | readonly string[], rowMode: boolean): readonly string[] {
  if (rowMode) {
    return [typeof text === 'string' ? text : text.join('')];
  }
  return typeof text === 'string' ? [text] : text;
}

export function UPNoticeBar(input: UPNoticeBarProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.noticeBar, ...input } as UPNoticeBarProps;
  const [show, setShow] = useState(true);
  const [index, setIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const rowMode = props.direction === 'row' && !props.step;
  const texts = useMemo(
    () => noticeTexts(props.text ?? [], rowMode),
    [props.text, rowMode],
  );
  const currentIndex = texts.length ? Math.min(index, texts.length - 1) : 0;

  useEffect(() => {
    setIndex(0);
  }, [props.text]);

  useEffect(() => {
    if (rowMode || texts.length < 2) {
      return undefined;
    }
    const delay = Math.max(1, getPx(props.duration ?? 2000));
    const timer = setInterval(() => {
      setIndex((previous) => (previous + 1) % texts.length);
    }, delay);
    return () => clearInterval(timer);
  }, [props.duration, rowMode, texts.length]);

  useEffect(() => {
    if (!rowMode || !containerWidth || !contentWidth) {
      return undefined;
    }
    const speed = Math.max(1, getPx(props.speed ?? 80));
    translateX.setValue(containerWidth);
    const animation = Animated.loop(
      Animated.timing(translateX, {
        duration: ((containerWidth + contentWidth) / speed) * 1000,
        easing: Easing.linear,
        toValue: -contentWidth,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [containerWidth, contentWidth, props.speed, rowMode, translateX]);

  if (!show) {
    return null;
  }

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };
  const handleTextLayout = (event: LayoutChangeEvent) => {
    setContentWidth(event.nativeEvent.layout.width);
  };
  const close = () => {
    setShow(false);
    input.onClose?.();
  };

  return (
    <Pressable
      accessibilityRole={input.onClick ? 'button' : undefined}
      onPress={() => input.onClick?.(rowMode ? undefined : currentIndex)}
      style={[
        {
          alignItems: 'center',
          backgroundColor: props.bgColor,
          flexDirection: 'row',
          overflow: 'hidden',
          paddingHorizontal: 12,
          paddingVertical: 9,
        },
        input.customStyle,
      ]}
      testID="up-notice-bar"
    >
      {props.icon ? <View style={{ marginRight: 5 }}><UPIcon color={props.color} name={props.icon} size={19} /></View> : null}
      <View
        onLayout={rowMode ? handleContainerLayout : undefined}
        style={{ flex: 1, height: getPx(props.fontSize ?? 14) + 4, justifyContent: props.justifyContent as ViewStyle['justifyContent'], overflow: 'hidden' }}
      >
        {rowMode ? (
          <Animated.View style={{ alignSelf: 'flex-start', transform: [{ translateX }] }}>
            <Text
              numberOfLines={1}
              onLayout={handleTextLayout}
              style={{ color: props.color, fontSize: getPx(props.fontSize ?? 14) }}
            >
              {texts[0]}
            </Text>
          </Animated.View>
        ) : (
          <Text numberOfLines={1} style={{ color: props.color, fontSize: getPx(props.fontSize ?? 14) }}>
            {texts[currentIndex]}
          </Text>
        )}
      </View>
      {props.mode === 'link' ? <View style={{ marginLeft: 5 }}><UPIcon color={props.color} name="arrow-right" size={17} /></View> : null}
      {props.mode === 'closable' ? (
        <Pressable
          accessibilityLabel="Close notice"
          accessibilityRole="button"
          hitSlop={8}
          onPress={close}
          style={{ marginLeft: 5 }}
          testID="up-notice-bar-close"
        >
          <UPIcon color={props.color} name="close" size={16} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
