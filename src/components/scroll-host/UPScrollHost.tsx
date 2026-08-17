import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type UPScrollHostController = Pick<ScrollView, 'scrollTo'>;

export type UPScrollHostRef = {
  scrollToTop: (duration?: number) => void;
};

export type UPStickyOverlay = {
  id: string;
  content: React.ReactNode;
  height: number;
  width: number;
  x: number;
  top: number;
  zIndex: number;
  bgColor: string;
  customStyle?: StyleProp<ViewStyle>;
};

export type UPScrollHostContextValue = {
  scrollY: number;
  scrollToTop: (duration?: number) => void;
  setStickyOverlay: (id: string, overlay: UPStickyOverlay | null) => void;
};

const ScrollHostContext = createContext<UPScrollHostContextValue | null>(null);

export function useUPScrollHost(): UPScrollHostContextValue | null {
  return useContext(ScrollHostContext);
}

export type UPScrollHostProps = Omit<ScrollViewProps, 'children' | 'onScroll' | 'ref'> & {
  children?: React.ReactNode;
  overlay?: React.ReactNode;
  scrollRef?: React.RefObject<UPScrollHostController | null>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export const UPScrollHost = forwardRef<UPScrollHostRef, UPScrollHostProps>(function UPScrollHost(
  input,
  ref,
): React.JSX.Element {
  const internalRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const [stickyOverlays, setStickyOverlays] = useState<Record<string, UPStickyOverlay>>({});
  const {
    children,
    contentContainerStyle,
    onScroll: inputOnScroll,
    overlay,
    scrollRef,
    scrollEventThrottle,
    style,
    ...scrollProps
  } = input;
  const controller = scrollRef ?? internalRef;

  const scrollToTop = useCallback(
    (duration = 0) => {
      controller.current?.scrollTo({ animated: duration > 0, y: 0 });
    },
    [controller],
  );
  const setStickyOverlay = useCallback((id: string, overlayEntry: UPStickyOverlay | null) => {
    setStickyOverlays((current) => {
      if (!overlayEntry) {
        if (!(id in current)) {
          return current;
        }
        const remaining = { ...current };
        delete remaining[id];
        return remaining;
      }
      const previous = current[id];
      if (previous === overlayEntry) {
        return current;
      }
      return { ...current, [id]: overlayEntry };
    });
  }, []);
  const context = useMemo(
    () => ({ scrollY, scrollToTop, setStickyOverlay }),
    [scrollToTop, scrollY, setStickyOverlay],
  );

  useImperativeHandle(ref, () => ({ scrollToTop }), [scrollToTop]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
    inputOnScroll?.(event);
  };

  return (
    <ScrollHostContext.Provider value={context}>
      <View style={[{ flex: 1, position: 'relative' }, style]}>
        <ScrollView
          {...scrollProps}
          contentContainerStyle={contentContainerStyle}
          onScroll={onScroll}
          ref={controller as React.RefObject<ScrollView | null>}
          scrollEventThrottle={scrollEventThrottle ?? 16}
          testID="up-scroll-host"
        >
          {children}
        </ScrollView>
        <View pointerEvents="box-none" style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}>
          {Object.values(stickyOverlays).map((sticky) => (
            <View
              key={sticky.id}
              style={[
                {
                  backgroundColor: sticky.bgColor,
                  height: sticky.height,
                  left: sticky.x,
                  position: 'absolute',
                  top: sticky.top,
                  width: sticky.width || undefined,
                  zIndex: sticky.zIndex,
                },
                sticky.customStyle,
              ]}
              testID="up-sticky-fixed"
            >
              {sticky.content}
            </View>
          ))}
          {overlay}
        </View>
      </View>
    </ScrollHostContext.Provider>
  );
});
