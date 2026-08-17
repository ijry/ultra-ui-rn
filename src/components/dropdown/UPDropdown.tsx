import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPOverlay } from '../../overlay';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { UPOverlay } from '../overlay';
import { UPTransition } from '../transition';
import {
  UPDropdownContext,
  type UPDropdownContextValue,
  type UPDropdownRegistration,
} from './context';

export type UPDropdownRef = {
  open: (index: number) => void;
  close: () => void;
  highlight: (index?: number | readonly number[]) => void;
};

export type UPDropdownProps = {
  activeColor?: string;
  inactiveColor?: string;
  closeOnClickMask?: boolean;
  closeOnClickSelf?: boolean;
  duration?: UPDimension;
  height?: UPDimension;
  borderBottom?: boolean;
  titleSize?: UPDimension;
  borderRadius?: UPDimension;
  menuIcon?: string;
  menuIconSize?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onOpen?: (index: number) => void;
  onClose?: (index: number) => void;
};

type DropdownFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DropdownLayerProps = {
  close: () => void;
  entry: UPDropdownRegistration;
  frame: DropdownFrame;
  props: UPDropdownProps;
};

let dropdownSequence = 0;

function fallbackFrame(height: UPDimension | undefined): DropdownFrame {
  return {
    height: getPx(height ?? 40),
    width: Dimensions.get('window').width,
    x: 0,
    y: 0,
  };
}

function DropdownLayer({ close, entry, frame, props }: DropdownLayerProps): React.JSX.Element {
  const closeOnMask = Boolean(props.closeOnClickMask) && entry.closeOnClickOverlay;
  const radius = getPx(props.borderRadius ?? 0);

  return (
    <View pointerEvents="box-none" style={layerStyle}>
      <UPOverlay
        customStyle={{ top: frame.y + frame.height }}
        onClick={closeOnMask ? close : undefined}
        opacity={0.3}
        show
        testID="up-dropdown-mask"
        zIndex={10070}
      />
      <UPTransition
        customStyle={{
          left: frame.x,
          position: 'absolute',
          top: frame.y + frame.height,
          width: frame.width,
          zIndex: 10071,
        }}
        duration={props.duration}
        mode="slide-down"
        show
      >
        <View
          style={{
            backgroundColor: '#ffffff',
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
            overflow: 'hidden',
          }}
          testID="up-dropdown-panel"
        >
          {entry.node}
        </View>
      </UPTransition>
    </View>
  );
}

export const UPDropdown = forwardRef<UPDropdownRef, UPDropdownProps>(function UPDropdown(input, ref) {
  const props = { ...useUPConfig().props.dropdown, ...input } as UPDropdownProps;
  const overlay = useUPOverlay();
  const menuRef = useRef<View>(null);
  const id = useRef(`up-dropdown-${dropdownSequence++}`).current;
  const entriesRef = useRef(new Map<string, UPDropdownRegistration>());
  const activeIndexRef = useRef<number | null>(null);
  const callbacksRef = useRef({ onClose: input.onClose, onOpen: input.onOpen });
  const [registrationVersion, setRegistrationVersion] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [highlightedIndexes, setHighlightedIndexes] = useState<readonly number[]>([]);
  const [frame, setFrame] = useState<DropdownFrame>(() => fallbackFrame(props.height));

  callbacksRef.current = { onClose: input.onClose, onOpen: input.onOpen };

  const entries = useMemo(
    () => Array.from(entriesRef.current.values()).sort((left, right) => left.index - right.index),
    [registrationVersion],
  );
  const activeEntry = activeIndex === null ? undefined : entries.find((entry) => entry.index === activeIndex);

  const setCurrentActiveIndex = useCallback((next: number | null) => {
    activeIndexRef.current = next;
    setActiveIndex(next);
  }, []);

  const close = useCallback(() => {
    const index = activeIndexRef.current;
    if (index === null) return;
    callbacksRef.current.onClose?.(index);
    setCurrentActiveIndex(null);
  }, [setCurrentActiveIndex]);

  const measure = useCallback(() => {
    setFrame(fallbackFrame(props.height));
    const node = menuRef.current;
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x, y, width, height) => {
        setFrame({ height, width, x, y });
      });
    }
  }, [props.height]);

  const open = useCallback((index: number) => {
    const entry = Array.from(entriesRef.current.values()).find((item) => item.index === index);
    if (!entry || entry.disabled) return;
    if (activeIndexRef.current === index) {
      if (props.closeOnClickSelf) close();
      return;
    }
    measure();
    setCurrentActiveIndex(index);
    callbacksRef.current.onOpen?.(index);
  }, [close, measure, props.closeOnClickSelf, setCurrentActiveIndex]);

  const highlight = useCallback((index?: number | readonly number[]) => {
    if (index === undefined) {
      setHighlightedIndexes([]);
      return;
    }
    setHighlightedIndexes(Array.isArray(index) ? index : [index]);
  }, []);

  const register = useCallback((entry: UPDropdownRegistration) => {
    entriesRef.current.set(entry.id, entry);
    setRegistrationVersion((value) => value + 1);
    return () => {
      if (entriesRef.current.get(entry.id) !== entry) return;
      entriesRef.current.delete(entry.id);
      setRegistrationVersion((value) => value + 1);
    };
  }, []);

  useImperativeHandle(ref, () => ({ close, highlight, open }), [close, highlight, open]);

  useEffect(() => () => overlay.remove(id), [id, overlay]);

  useEffect(() => {
    if (!activeEntry) {
      overlay.remove(id);
      return;
    }
    overlay.add({
      id,
      node: <DropdownLayer close={close} entry={activeEntry} frame={frame} props={props} />,
      zIndex: 10070,
    });
    return () => overlay.remove(id);
  }, [activeEntry, close, frame, id, overlay, props]);

  const context = useMemo<UPDropdownContextValue>(() => ({
    activeColor: props.activeColor ?? '#2979ff',
    activeIndex,
    close,
    inactiveColor: props.inactiveColor ?? '#606266',
    register,
  }), [activeIndex, close, props.activeColor, props.inactiveColor, register]);

  const renderedChildren = Children.map(input.children, (child, index) =>
    isValidElement(child) ? cloneElement(child, { itemIndex: index } as object) : child,
  );

  return (
    <UPDropdownContext.Provider value={context}>
      <View style={input.customStyle} testID="up-dropdown">
        <View
          onLayout={measure}
          ref={menuRef}
          style={{
            borderBottomColor: props.borderBottom ? '#e4e7ed' : 'transparent',
            borderBottomWidth: props.borderBottom ? 1 : 0,
            flexDirection: 'row',
            height: getPx(props.height ?? 40),
          }}
        >
          {entries.map((entry) => {
            const active = entry.index === activeIndex;
            const highlighted = highlightedIndexes.includes(entry.index);
            const disabled = entry.disabled;
            const color = disabled
              ? '#c0c4cc'
              : active || highlighted
                ? props.activeColor
                : props.inactiveColor;
            return (
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                key={entry.id}
                onPress={() => open(entry.index)}
                style={{ alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'center' }}
                testID={`up-dropdown-menu-${entry.index}`}
              >
                <Text style={{ color, fontSize: getPx(props.titleSize ?? 14) }} testID={`up-dropdown-title-${entry.index}`}>
                  {String(entry.title)}
                </Text>
                <View style={{ marginLeft: 5, transform: [{ rotate: active ? '180deg' : '0deg' }] }} testID={`up-dropdown-icon-${entry.index}`}>
                  <UPIcon
                    color={disabled ? '#c0c4cc' : active || highlighted ? props.activeColor : '#c0c4cc'}
                    name={props.menuIcon}
                    size={props.menuIconSize}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
        {renderedChildren}
      </View>
    </UPDropdownContext.Provider>
  );
});

const layerStyle: ViewStyle = { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 };
