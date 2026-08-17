import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
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
import { useUPOverlay } from '../../overlay';

export type UPGuidePage = {
  backgroundColor?: string;
  desc?: string;
  image?: string;
  title?: string;
  [key: string]: unknown;
};

export type UPGuideChangeEvent = { current: number };

export type UPGuideStorage = {
  getItem: (
    key: string,
  ) => boolean | number | string | null | undefined | Promise<boolean | number | string | null | undefined>;
  removeItem: (key: string) => void | Promise<void>;
  setItem: (key: string, value: string) => void | Promise<void>;
};

export type UPGuideRef = {
  close: (remember?: boolean) => void;
  open: () => void;
  reset: () => Promise<void>;
};

export type UPGuideRenderPayload = {
  current: number;
  item: UPGuidePage;
  total: number;
};

export type UPGuideProps = {
  bgColor?: string;
  customClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  finishText?: string;
  indicator?: boolean;
  list?: readonly UPGuidePage[];
  nextText?: string;
  once?: boolean;
  renderPage?: (payload: UPGuideRenderPayload) => React.ReactNode;
  show?: boolean;
  showSkip?: boolean;
  skipText?: string;
  storage?: UPGuideStorage;
  storageKey?: string;
  zIndex?: number | string;
  onChange?: (event: UPGuideChangeEvent) => void;
  onClose?: () => void;
  onFinish?: () => void;
  onSkip?: () => void;
  onUpdateShow?: (show: boolean) => void;
};

let guideSequence = 0;

function remembered(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

function numericZIndex(value: number | string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 10075;
}

export const UPGuide = forwardRef<UPGuideRef, UPGuideProps>(function UPGuide(input, ref) {
  const config = useUPConfig();
  const overlay = useUPOverlay();
  const props = {
    ...config.props.guide,
    ...input,
  } as UPGuideProps & Required<
    Pick<
      UPGuideProps,
      'bgColor' | 'finishText' | 'indicator' | 'list' | 'nextText' | 'once' | 'show' | 'showSkip' | 'skipText' | 'storageKey' | 'zIndex'
    >
  >;
  const list = props.list;
  const id = useRef(`up-guide-${guideSequence++}`).current;
  const scrollRef = useRef<ScrollView>(null);
  const initialVisible = Boolean(props.show) && list.length > 0;
  const visibleRef = useRef(initialVisible);
  const [visible, setVisible] = useState(initialVisible);
  const [current, setCurrent] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const zIndex = numericZIndex(props.zIndex);
  const onUpdateShow = input.onUpdateShow;
  const onClose = input.onClose;
  const onChange = input.onChange;
  const onFinish = input.onFinish;
  const onSkip = input.onSkip;

  const setVisibleState = useCallback((next: boolean) => {
    if (visibleRef.current === next) return;
    visibleRef.current = next;
    setVisible(next);
    onUpdateShow?.(next);
    if (!next) onClose?.();
  }, [onClose, onUpdateShow]);

  const checkRemembered = useCallback(async () => {
    if (!props.once || !props.storage) return false;
    try {
      const value = await props.storage.getItem(props.storageKey);
      return remembered(value);
    } catch {
      return false;
    }
  }, [props.once, props.storage, props.storageKey]);

  const remember = useCallback(async () => {
    if (!props.once || !props.storage) return;
    try {
      await props.storage.setItem(props.storageKey, '1');
    } catch {
      return;
    }
  }, [props.once, props.storage, props.storageKey]);

  const close = useCallback((rememberClose = false) => {
    if (rememberClose) void remember();
    setVisibleState(false);
  }, [remember, setVisibleState]);

  const open = useCallback(() => {
    setCurrent(0);
    setVisibleState(list.length > 0);
    void checkRemembered().then((done) => {
      if (done) {
        setVisibleState(false);
      }
    });
  }, [checkRemembered, list.length, setVisibleState]);

  const reset = useCallback(async () => {
    try {
      await props.storage?.removeItem(props.storageKey);
    } catch {
      return;
    }
  }, [props.storage, props.storageKey]);

  useImperativeHandle(ref, () => ({ close, open, reset }), [close, open, reset]);

  useEffect(() => {
    if (props.show) open();
    else close(false);
  }, [close, open, props.show]);

  useEffect(() => () => overlay.remove(id), [id, overlay]);

  const changeTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(list.length - 1, next));
    setCurrent(clamped);
    onChange?.({ current: clamped });
    scrollRef.current?.scrollTo({ animated: true, x: clamped * screenWidth, y: 0 });
  }, [list.length, onChange, screenWidth]);

  const next = useCallback(() => {
    if (current >= list.length - 1) {
      onFinish?.();
      close(true);
      return;
    }
    changeTo(current + 1);
  }, [changeTo, close, current, list.length, onFinish]);

  const skip = useCallback(() => {
    onSkip?.();
    close(true);
  }, [close, onSkip]);

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (nextIndex !== current) changeTo(nextIndex);
  }, [changeTo, current, screenWidth]);

  const layer = useMemo(() => {
    if (!visible || list.length === 0) return null;
    return (
      <View
        style={[
          {
            backgroundColor: props.bgColor,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex,
          },
          input.customStyle,
        ]}
        testID="up-guide"
      >
        {props.showSkip ? (
          <Pressable
            accessibilityLabel={props.skipText}
            accessibilityRole="button"
            onPress={skip}
            style={{ padding: 16, position: 'absolute', right: 16, top: 32, zIndex: zIndex + 1 }}
            testID="up-guide-skip"
          >
            <Text style={{ color: '#ffffff' }}>{props.skipText}</Text>
          </Pressable>
        ) : null}
        <ScrollView
          horizontal
          onMomentumScrollEnd={onMomentumScrollEnd}
          pagingEnabled
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          testID="up-guide-scroll"
        >
          {list.map((item, index) => (
            <View
              key={`${item.title ?? item.image ?? 'page'}-${index}`}
              style={{
                alignItems: 'center',
                backgroundColor: item.backgroundColor ?? props.bgColor,
                flex: 1,
                justifyContent: 'center',
                paddingHorizontal: 32,
                width: screenWidth,
              }}
              testID={`up-guide-page-${index}`}
            >
              {props.renderPage ? props.renderPage({ current: index, item, total: list.length }) : (
                <>
                  {item.image ? <Image source={{ uri: item.image }} style={{ height: 160, marginBottom: 24, width: 160 }} /> : null}
                  {item.title ? <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>{item.title}</Text> : null}
                  {item.desc ? <Text style={{ color: '#dcdfe6', fontSize: 15, textAlign: 'center' }}>{item.desc}</Text> : null}
                </>
              )}
            </View>
          ))}
        </ScrollView>
        {props.indicator ? (
          <View
            style={{ alignSelf: 'center', bottom: 88, flexDirection: 'row', gap: 6, position: 'absolute' }}
            testID="up-guide-indicator"
          >
            {list.map((_item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: current === index ? '#ffffff' : 'rgba(255,255,255,0.35)',
                  borderRadius: 4,
                  height: 8,
                  width: current === index ? 18 : 8,
                }}
                testID={`up-guide-dot-${index}`}
              />
            ))}
          </View>
        ) : null}
        <Pressable
          accessibilityLabel={current >= list.length - 1 ? props.finishText : props.nextText}
          accessibilityRole="button"
          onPress={next}
          style={{
            alignSelf: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 22,
            bottom: 32,
            minWidth: 132,
            paddingHorizontal: 24,
            paddingVertical: 12,
            position: 'absolute',
          }}
          testID={current >= list.length - 1 ? 'up-guide-finish' : 'up-guide-next'}
        >
          <Text style={{ color: props.bgColor, fontSize: 15, textAlign: 'center' }}>
            {current >= list.length - 1 ? props.finishText : props.nextText}
          </Text>
        </Pressable>
      </View>
    );
  }, [current, input.customStyle, list, next, onMomentumScrollEnd, props, screenWidth, skip, visible, zIndex]);

  useLayoutEffect(() => {
    overlay.add({ id, node: layer, zIndex });
  }, [id, layer, overlay, zIndex]);

  return null;
});
