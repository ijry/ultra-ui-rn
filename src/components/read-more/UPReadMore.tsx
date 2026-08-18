import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import {
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

export type UPReadMoreProps = {
  showHeight?: UPDimension;
  toggle?: boolean;
  closeText?: string;
  openText?: string;
  color?: string;
  fontSize?: UPDimension;
  /** @deprecated React Native cannot apply CSS gradient/text-indent styles to arbitrary children. */
  shadowStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native cannot apply CSS text indentation to arbitrary child content. */
  textIndent?: string;
  name?: string | number;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onOpen?: (name: string | number) => void;
  onClose?: (name: string | number) => void;
};

export type UPReadMoreRef = {
  /** Re-measure the content height (source `init`), e.g. after async content loads. */
  init: () => void;
};

export const UPReadMore = forwardRef<UPReadMoreRef, UPReadMoreProps>(function UPReadMore(input, ref) {
  const props = { ...useUPConfig().props.readMore, ...input } as UPReadMoreProps;
  const [contentHeight, setContentHeight] = useState(0);
  const [open, setOpen] = useState(false);
  const [hideToggle, setHideToggle] = useState(false);
  const isLongContent = contentHeight > getPx(props.showHeight ?? 400);
  const displayToggle = isLongContent && !hideToggle;
  const collapsed = isLongContent && !open;

  const onLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };
  const init = useCallback(() => {
    setHideToggle(false);
    setContentHeight(0);
  }, []);
  useImperativeHandle(ref, () => ({ init }), [init]);
  const toggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && !props.toggle) {
      setHideToggle(true);
    }
    if (nextOpen) {
      input.onOpen?.(props.name ?? '');
    } else {
      input.onClose?.(props.name ?? '');
    }
  };
  const fontSize = getPx(props.fontSize ?? 14);

  return (
    <View style={input.customStyle} testID="up-read-more">
      <View
        style={{ maxHeight: collapsed ? getPx(props.showHeight ?? 400) : undefined, overflow: 'hidden' }}
      >
        <View onLayout={onLayout} testID="up-read-more-content">
          {input.children}
        </View>
      </View>
      {displayToggle ? (
        <View style={[{ alignItems: 'center', marginTop: 5 }, collapsed ? input.shadowStyle : undefined]}>
          <Pressable
            accessibilityRole="button"
            onPress={toggle}
            style={{ alignItems: 'center', flexDirection: 'row' }}
            testID="up-read-more-toggle"
          >
            <Text style={{ color: props.color, fontSize, lineHeight: fontSize }}>
              {open ? props.openText : props.closeText}
            </Text>
            <View style={{ marginLeft: 5 }}>
              <UPIcon color={props.color} name={open ? 'arrow-up' : 'arrow-down'} size={fontSize + 2} />
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});
