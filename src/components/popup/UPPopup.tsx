import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPOverlay } from '../../overlay';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { UPOverlay } from '../overlay';
import { UPTransition, type UPTransitionMode } from '../transition';

export type UPPopupProps = {
  show?: boolean;
  overlay?: boolean;
  mode?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  duration?: UPDimension;
  closeable?: boolean;
  overlayStyle?: StyleProp<ViewStyle>;
  closeOnClickOverlay?: boolean;
  zIndex?: number | string;
  safeAreaInsetBottom?: boolean;
  safeAreaInsetTop?: boolean;
  closeIconPos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  round?: boolean | UPDimension;
  zoom?: boolean;
  bgColor?: string;
  overlayOpacity?: number | string;
  pageInline?: boolean;
  /** @deprecated Native pan resizing is deferred; the popup remains source positioned. */
  touchable?: boolean;
  /** @deprecated Native pan resizing is deferred. */
  minHeight?: string;
  maxHeight?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  bottom?: React.ReactNode;
  /** Source `trigger` slot: rendered in place, opens the popup when pressed. */
  trigger?: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  onChangeShow?: (show: boolean) => void;
  /** Source `click` event: fires when the popup panel content is pressed. */
  onClick?: (event: GestureResponderEvent) => void;
};

let popupSequence = 0;

function transitionMode(mode: UPPopupProps['mode'], zoom: boolean): UPTransitionMode {
  if (mode === 'center') return zoom ? 'fade-zoom' : 'fade';
  if (mode === 'bottom') return 'slide-up';
  if (mode === 'top') return 'slide-down';
  if (mode === 'left') return 'slide-right';
  return 'slide-left';
}

function panelPosition(mode: NonNullable<UPPopupProps['mode']>): ViewStyle {
  if (mode === 'bottom') return { bottom: 0, left: 0, right: 0 };
  if (mode === 'top') return { left: 0, right: 0, top: 0 };
  if (mode === 'left') return { bottom: 0, left: 0, top: 0 };
  if (mode === 'right') return { bottom: 0, right: 0, top: 0 };
  return { alignSelf: 'center', maxWidth: '92%' };
}

function closePosition(position: NonNullable<UPPopupProps['closeIconPos']>): ViewStyle {
  const bottom = position.startsWith('bottom');
  const left = position.endsWith('left');
  return { [bottom ? 'bottom' : 'top']: 12, [left ? 'left' : 'right']: 12, position: 'absolute' };
}

type PopupLayerProps = {
  props: UPPopupProps;
  requestClose: () => void;
};

function PopupLayer({ props, requestClose }: PopupLayerProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const radius = props.round === false ? 0 : getPx(props.round === true ? '20px' : props.round ?? '20px');
  const paddingStyle: ViewStyle = {
    paddingBottom: props.safeAreaInsetBottom ? insets.bottom : 0,
    paddingTop: props.safeAreaInsetTop ? insets.top : 0,
  };
  const corners: ViewStyle = props.mode === 'bottom'
    ? { borderTopLeftRadius: radius, borderTopRightRadius: radius }
    : props.mode === 'top'
      ? { borderBottomLeftRadius: radius, borderBottomRightRadius: radius }
      : { borderRadius: radius };
  const panel = (
    <Pressable
      onPress={props.onClick}
      style={[
        {
          backgroundColor: props.bgColor || '#ffffff',
          maxHeight: getPx(props.maxHeight ?? '600px'),
          minHeight: props.mode === 'bottom' && props.touchable ? getPx(props.minHeight ?? '200px') : undefined,
          ...corners,
          ...paddingStyle,
          ...panelPosition(props.mode ?? 'bottom'),
        },
        props.customStyle,
      ]}
      testID="up-popup"
    >
      {props.children}
      {props.closeable ? (
        <Pressable hitSlop={8} onPress={requestClose} style={closePosition(props.closeIconPos ?? 'top-right')} testID="up-popup-close">
          <UPIcon color="#909399" name="close" size={18} />
        </Pressable>
      ) : null}
    </Pressable>
  );
  return (
    <View pointerEvents="box-none" style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}>
      {props.overlay ? (
        <UPOverlay
          customStyle={props.overlayStyle}
          onClick={props.closeOnClickOverlay ? requestClose : undefined}
          opacity={props.overlayOpacity}
          show
          testID="up-popup-overlay"
          zIndex={props.zIndex}
        />
      ) : null}
      <UPTransition
        customStyle={{ position: 'absolute', ...panelPosition(props.mode ?? 'bottom'), zIndex: getPx(props.zIndex ?? 10075) + 1 }}
        duration={props.duration}
        mode={transitionMode(props.mode, Boolean(props.zoom))}
        show
      >
        {panel}
      </UPTransition>
      {props.bottom}
    </View>
  );
}

export function UPPopup(input: UPPopupProps): React.JSX.Element | null {
  const config = useUPConfig();
  const props = { ...config.props.popup, ...input } as UPPopupProps;
  const overlay = useUPOverlay();
  const id = useRef(`up-popup-${popupSequence++}`).current;
  const shown = Boolean(props.show);
  const requestClose = () => {
    input.onChangeShow?.(false);
    input.onClose?.();
  };
  const triggerNode = input.trigger ? (
    <Pressable onPress={() => input.onChangeShow?.(true)} testID="up-popup-trigger">
      {input.trigger}
    </Pressable>
  ) : null;
  // This effect has to re-run on every render: the overlay node carries children
  // and styles that must stay current. `onOpen` must not ride along, though —
  // it announces a transition, not a state, so it is latched to the open edge.
  const announcedOpen = useRef(false);
  const onOpenRef = useRef(input.onOpen);
  onOpenRef.current = input.onOpen;

  useEffect(() => {
    if (!shown) {
      announcedOpen.current = false;
      overlay.remove(id);
      return;
    }
    if (!announcedOpen.current) {
      announcedOpen.current = true;
      onOpenRef.current?.();
    }
    overlay.add({
      id,
      node: <PopupLayer props={props} requestClose={requestClose} />,
      zIndex: getPx(props.zIndex ?? 10075),
    });
    return () => overlay.remove(id);
  }, [id, input, overlay, props, shown]);

  if (props.pageInline && shown) {
    return (
      <>
        {triggerNode}
        <PopupLayer props={props} requestClose={requestClose} />
      </>
    );
  }
  return triggerNode;
}
