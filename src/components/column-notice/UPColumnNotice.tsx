import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPColumnNoticeProps = {
  text?: readonly string[];
  icon?: string;
  mode?: '' | 'link' | 'closable' | string;
  color?: string;
  bgColor?: string;
  fontSize?: UPDimension;
  /** @deprecated Source declares this prop but does not use it. */
  speed?: UPDimension;
  step?: boolean;
  duration?: UPDimension;
  disableTouch?: boolean;
  justifyContent?: ViewStyle['justifyContent'] | string;
  iconNode?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: (index: number) => void;
  onClose?: () => void;
};

type NoticeViewport = { width: number };

function number(value: UPDimension | undefined, fallback: number): number {
  const result = Number.parseFloat(String(value ?? fallback));
  return Number.isFinite(result) ? result : fallback;
}

function clampIndex(value: number, length: number): number {
  return length > 0 ? Math.max(0, Math.min(length - 1, value)) : 0;
}

export function UPColumnNotice(input: UPColumnNoticeProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.columnNotice, ...input } as UPColumnNoticeProps;
  const texts = props.text ?? [];
  const pageHeight = 20;
  const scrollRef = useRef<ScrollView>(null);
  const [show, setShow] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewport, setViewport] = useState<NoticeViewport>({ width: 0 });
  const pageSpan = props.step ? viewport.width : pageHeight;

  const scrollToIndex = useCallback((index: number, animated = true) => {
    if (!pageSpan) return;
    scrollRef.current?.scrollTo({
      animated,
      x: props.step ? index * pageSpan : 0,
      y: props.step ? 0 : index * pageSpan,
    });
  }, [pageSpan, props.step]);

  useEffect(() => {
    setCurrentIndex(0);
    scrollToIndex(0, false);
  }, [texts]);

  useEffect(() => {
    if (texts.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex((previous) => {
        const next = (clampIndex(previous, texts.length) + 1) % texts.length;
        scrollToIndex(next);
        return next;
      });
    }, Math.max(1, number(props.duration, 1500)));
    return () => clearInterval(timer);
  }, [props.duration, scrollToIndex, texts.length]);

  if (!show) return null;

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setViewport((previous) => previous.width === width ? previous : { width });
  };
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const span = props.step
      ? event.nativeEvent.layoutMeasurement.width
      : event.nativeEvent.layoutMeasurement.height;
    const offset = props.step
      ? event.nativeEvent.contentOffset.x
      : event.nativeEvent.contentOffset.y;
    if (span) setCurrentIndex(clampIndex(Math.round(offset / span), texts.length));
  };
  const close = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setShow(false);
    input.onClose?.();
  };

  return (
    <Pressable
      accessibilityRole={input.onClick ? 'button' : undefined}
      onPress={() => input.onClick?.(currentIndex)}
      style={[
        {
          alignItems: 'center',
          backgroundColor: props.bgColor,
          flexDirection: 'row',
          overflow: 'hidden',
          justifyContent: 'space-between',
        },
        input.customStyle,
      ]}
      testID="up-column-notice"
    >
      {input.iconNode !== undefined ? input.iconNode : props.icon ? (
        <View style={{ marginRight: 5 }} testID="up-column-notice-icon">
          <UPIcon color={props.color} name={props.icon} size={19} />
        </View>
      ) : null}
      <ScrollView
        horizontal={props.step === true}
        onLayout={onLayout}
        onMomentumScrollEnd={onMomentumScrollEnd}
        pagingEnabled
        ref={scrollRef}
        scrollEnabled={!props.disableTouch}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, height: pageHeight }}
        testID="up-column-notice-scroll"
      >
        {texts.map((item, index) => (
          <View
            key={`${item}-${index}`}
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              height: pageHeight,
              justifyContent: props.justifyContent as ViewStyle['justifyContent'],
              width: props.step ? viewport.width || '100%' : '100%',
            }}
            testID={`up-column-notice-page-${index}`}
          >
            <Text numberOfLines={1} style={{ color: props.color, fontSize: getPx(props.fontSize ?? 14) }}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
      {props.mode === 'link' ? (
        <View style={{ marginLeft: 5 }}>
          <UPIcon color={props.color} name="arrow-right" size={17} />
        </View>
      ) : null}
      {props.mode === 'closable' ? (
        <Pressable
          accessibilityLabel="Close column notice"
          accessibilityRole="button"
          hitSlop={8}
          onPress={close}
          style={{ marginLeft: 5 }}
          testID="up-column-notice-close"
        >
          <UPIcon color={props.color} name="close" size={16} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
