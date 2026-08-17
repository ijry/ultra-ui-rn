import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  UPTooltip,
  type UPTooltipDirection,
  type UPTooltipRef,
  type UPTooltipTriggerMode,
} from '../tooltip';

export type UPPopoverRef = {
  open: () => void;
  close: () => void;
};

export type UPPopoverProps = {
  text?: string | number;
  color?: string;
  bgColor?: string;
  popupBgColor?: string;
  placement?: UPTooltipDirection;
  triggerMode?: UPTooltipTriggerMode;
  show?: boolean;
  zIndex?: number | string;
  forcePosition?: Record<string, unknown>;
  direction?: UPTooltipDirection;
  trigger?: React.ReactNode;
  content?: React.ReactNode;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: (index: number) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onUpdateShow?: (show: boolean) => void;
};

export const UPPopover = forwardRef<UPPopoverRef, UPPopoverProps>(function UPPopover(input, ref) {
  const tooltipRef = useRef<UPTooltipRef>(null);
  const props = {
    bgColor: '#f7f7f7',
    color: '#333',
    direction: 'top' as const,
    forcePosition: {},
    placement: 'top' as const,
    popupBgColor: '#f7f7f7',
    show: false,
    triggerMode: 'click' as const,
    zIndex: 10070,
    ...input,
  };

  useImperativeHandle(ref, () => ({
    close: () => tooltipRef.current?.close(),
    open: () => tooltipRef.current?.open(),
  }), []);

  const content = input.content ?? <Text>{props.text}</Text>;
  return (
    <UPTooltip
      bgColor={props.bgColor}
      color={props.color}
      content={<View style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>{content}</View>}
      direction={props.direction}
      forcePosition={props.forcePosition}
      onClick={input.onClick}
      onClose={input.onClose}
      onOpen={input.onOpen}
      onUpdateShow={input.onUpdateShow}
      popupBgColor={props.popupBgColor}
      ref={tooltipRef}
      show={props.show}
      text={props.text}
      trigger={input.trigger ?? input.children}
      triggerMode={props.triggerMode}
      triggerTestID="up-popover-trigger"
      zIndex={props.zIndex}
    />
  );
});
