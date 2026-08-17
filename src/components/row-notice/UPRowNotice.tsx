import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPRowNoticeProps = {
  text?: string;
  icon?: string;
  mode?: '' | 'link' | 'closable' | string;
  color?: string;
  bgColor?: string;
  fontSize?: UPDimension;
  speed?: UPDimension;
  iconNode?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: () => void;
  onClose?: () => void;
};

export function UPRowNotice(input: UPRowNoticeProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.rowNotice, ...input } as UPRowNoticeProps;
  const [show, setShow] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const text = typeof props.text === 'string' ? props.text : '';
  const fontSize = getPx(props.fontSize ?? 14);
  const speed = Math.max(1, getPx(props.speed ?? 80));

  useEffect(() => {
    if (!text || !containerWidth || !textWidth) {
      translateX.setValue(0);
      return undefined;
    }
    translateX.setValue(containerWidth);
    const animation = Animated.loop(
      Animated.timing(translateX, {
        duration: ((containerWidth + textWidth) / speed) * 1000,
        easing: Easing.linear,
        toValue: -textWidth,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [containerWidth, fontSize, speed, text, textWidth, translateX]);

  if (!show) return null;

  const onContentLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth((previous) => (previous === width ? previous : width));
  };
  const onMovingLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTextWidth((previous) => (previous === width ? previous : width));
  };
  const close = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setShow(false);
    input.onClose?.();
  };

  return (
    <Pressable
      accessibilityRole={input.onClick ? 'button' : undefined}
      onPress={() => input.onClick?.()}
      style={[
        {
          alignItems: 'center',
          backgroundColor: props.bgColor,
          flexDirection: 'row',
          justifyContent: 'space-between',
          overflow: 'hidden',
        },
        input.customStyle,
      ]}
      testID="up-row-notice"
    >
      {input.iconNode !== undefined ? input.iconNode : props.icon ? (
        <View style={{ marginRight: 5 }} testID="up-row-notice-icon">
          <UPIcon color={props.color} name={props.icon} size={19} />
        </View>
      ) : null}
      <View
        onLayout={onContentLayout}
        style={{ alignItems: 'center', flex: 1, flexDirection: 'row', height: fontSize + 4, overflow: 'hidden' }}
        testID="up-row-notice-content"
      >
        <Animated.View
          onLayout={onMovingLayout}
          style={{ alignSelf: 'flex-start', flexDirection: 'row', transform: [{ translateX }] }}
          testID="up-row-notice-moving"
        >
          <Text numberOfLines={1} style={{ color: props.color, fontSize }} testID="up-row-notice-text">
            {text}
          </Text>
        </Animated.View>
      </View>
      {props.mode === 'link' ? (
        <View style={{ marginLeft: 5 }}>
          <UPIcon color={props.color} name="arrow-right" size={17} />
        </View>
      ) : null}
      {props.mode === 'closable' ? (
        <Pressable
          accessibilityLabel="Close row notice"
          accessibilityRole="button"
          hitSlop={8}
          onPress={close}
          style={{ marginLeft: 5 }}
          testID="up-row-notice-close"
        >
          <UPIcon color={props.color} name="close" size={16} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
