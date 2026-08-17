import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPTransitionMode =
  | 'none'
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'fade-zoom';

export type UPTransitionProps = {
  show?: boolean;
  mode?: UPTransitionMode;
  duration?: UPDimension;
  timingFunction?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onBeforeEnter?: () => void;
  onEnter?: () => void;
  onAfterEnter?: () => void;
  onBeforeLeave?: () => void;
  onLeave?: () => void;
  onAfterLeave?: () => void;
  onClick?: () => void;
};

function transformForMode(mode: UPTransitionMode, progress: Animated.Value): ViewStyle['transform'] {
  const { height, width } = Dimensions.get('window');
  if (mode === 'zoom' || mode === 'fade-zoom') {
    return [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }];
  }
  if (mode.endsWith('up')) {
    return [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }];
  }
  if (mode.endsWith('down')) {
    return [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-height, 0] }) }];
  }
  if (mode.endsWith('left')) {
    return [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] }) }];
  }
  if (mode.endsWith('right')) {
    return [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }];
  }
  return undefined;
}

function fades(mode: UPTransitionMode): boolean {
  return mode === 'fade' || mode.startsWith('fade');
}

export function UPTransition(input: UPTransitionProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.transition, ...input };
  const [mounted, setMounted] = useState(props.show);
  const progress = useRef(new Animated.Value(props.show ? 1 : 0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const duration = Math.max(0, getPx(props.duration));
    if (props.show) {
      setMounted(true);
      input.onBeforeEnter?.();
      input.onEnter?.();
      Animated.timing(progress, { duration, easing: Easing.out(Easing.ease), toValue: 1, useNativeDriver: true }).start();
      timer.current = setTimeout(() => input.onAfterEnter?.(), duration);
    } else {
      input.onBeforeLeave?.();
      input.onLeave?.();
      Animated.timing(progress, { duration, easing: Easing.out(Easing.ease), toValue: 0, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        setMounted(false);
        input.onAfterLeave?.();
      }, duration);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [input, progress, props.duration, props.show]);

  if (!mounted) return null;
  const content = (
    <Animated.View
      style={[
        {
          opacity: fades(props.mode) ? progress : 1,
          transform: transformForMode(props.mode, progress),
        },
        input.customStyle,
      ]}
      testID="up-transition"
    >
      {input.children}
    </Animated.View>
  );
  return input.onClick ? <Pressable onPress={input.onClick}>{content}</Pressable> : content;
}
