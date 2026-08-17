import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { useUPSwipeActionContext, type UPSwipeActionItemHandle } from './context';

export type UPSwipeActionOption = {
  text?: string;
  icon?: string;
  iconSize?: UPDimension;
  style?: StyleProp<ViewStyle & TextStyle>;
};

export type UPSwipeActionItemProps = {
  show?: boolean;
  closeOnClick?: boolean;
  name?: string | number;
  disabled?: boolean;
  /** @deprecated Source child auto-close is controlled by the parent. */
  autoClose?: boolean;
  threshold?: UPDimension;
  options?: readonly UPSwipeActionOption[];
  /** @deprecated ReanimatedSwipeable has no per-item transition duration API. */
  duration?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: (event: { index: number; name: string | number }) => void;
  onOpen?: (name: string | number) => void;
  onClose?: (name: string | number) => void;
  onUpdateShow?: (show: boolean) => void;
};

export function UPSwipeActionItem(input: UPSwipeActionItemProps): React.JSX.Element {
  const props = { ...useUPConfig().props.swipeActionItem, ...input } as UPSwipeActionItemProps;
  const parent = useUPSwipeActionContext();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [open, setOpen] = useState(Boolean(props.show));
  const controlled = input.show !== undefined;
  const name = props.name ?? '';

  const close = useCallback(() => swipeableRef.current?.close(), []);
  const handle = useMemo<UPSwipeActionItemHandle>(() => ({ close }), [close]);

  useEffect(() => parent?.register(handle), [handle, parent]);

  useEffect(() => {
    if (!controlled) return;
    if (props.show) swipeableRef.current?.openRight();
    else swipeableRef.current?.close();
  }, [controlled, props.show]);

  const handleWillOpen = () => parent?.notifyOpen(handle);
  const handleOpen = () => {
    if (!open) setOpen(true);
    input.onUpdateShow?.(true);
    input.onOpen?.(name);
  };
  const handleClose = () => {
    if (open) setOpen(false);
    input.onUpdateShow?.(false);
    input.onClose?.(name);
    parent?.notifyClose(handle);
  };

  const renderRightActions = () => (
    <View style={{ flexDirection: 'row' }} testID="up-swipe-action-options">
      {(props.options ?? []).map((option, index) => {
        const optionStyle = StyleSheet.flatten(option.style) ?? {};
        const color = typeof optionStyle.color === 'string' ? optionStyle.color : '#ffffff';
        const fontSize = optionStyle.fontSize === undefined
          ? 16
          : getPx(optionStyle.fontSize as UPDimension);
        const iconSize = option.iconSize === undefined
          ? optionStyle.fontSize === undefined ? 17 : fontSize * 1.2
          : getPx(option.iconSize);
        return (
          <Pressable
            key={`${String(name)}-${index}`}
            onPress={() => {
              input.onClick?.({ index, name });
              if (props.closeOnClick) close();
            }}
            style={[
              {
                alignItems: 'center',
                backgroundColor: '#C7C6CD',
                justifyContent: 'center',
                paddingHorizontal: 15,
              },
              optionStyle,
            ]}
            testID={`up-swipe-action-option-${index}`}
          >
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              {option.icon ? (
                <UPIcon
                  color={color}
                  customStyle={option.text ? { marginRight: 2 } : undefined}
                  name={option.icon}
                  size={iconSize}
                />
              ) : null}
              {option.text ? <Text style={{ color, fontSize, lineHeight: fontSize }}>{option.text}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={input.customStyle} testID="up-swipe-action-item">
      <ReanimatedSwipeable
        enabled={!props.disabled}
        onSwipeableClose={handleClose}
        onSwipeableOpen={handleOpen}
        onSwipeableWillOpen={handleWillOpen}
        overshootRight={false}
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={getPx(props.threshold ?? 20)}
        testID="up-swipe-action-native"
      >
        {input.children}
      </ReanimatedSwipeable>
    </View>
  );
}
