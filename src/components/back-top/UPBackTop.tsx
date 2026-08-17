import React from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { useUPScrollHost } from '../scroll-host';

export type UPBackTopProps = {
  mode?: 'circle' | 'square' | string;
  icon?: string;
  text?: string;
  /** @deprecated React Native ScrollView supports animated scrolling but not an exact duration. */
  duration?: UPDimension;
  scrollTop?: UPDimension;
  top?: UPDimension;
  bottom?: UPDimension;
  right?: UPDimension;
  zIndex?: UPDimension;
  iconStyle?: StyleProp<TextStyle>;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

export function UPBackTop(input: UPBackTopProps): React.JSX.Element | null {
  const config = useUPConfig();
  const props = { ...config.props.backtop, ...input } as UPBackTopProps;
  const host = useUPScrollHost();
  const scrollTop = input.scrollTop === undefined ? host?.scrollY ?? getPx(props.scrollTop ?? 0) : getPx(input.scrollTop);
  const visible = scrollTop > getPx(props.top ?? 400);

  if (!visible) {
    return null;
  }

  const onPress = () => {
    host?.scrollToTop(getPx(props.duration ?? 0));
    input.onClick?.();
  };
  const radius = props.mode === 'circle' ? 100 : 4;
  return (
    <Pressable
      accessibilityLabel="Back to top"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={[
        {
          alignItems: 'center',
          backgroundColor: '#E1E1E1',
          borderRadius: radius,
          bottom: getPx(props.bottom ?? 100),
          height: 40,
          justifyContent: 'center',
          position: 'absolute',
          right: getPx(props.right ?? 20),
          width: 40,
          zIndex: getPx(props.zIndex ?? config.zIndex.sticky),
        },
        input.customStyle,
      ]}
      testID="up-back-top"
    >
      {input.children ?? (
        <View style={{ alignItems: 'center' }}>
          <UPIcon customStyle={props.iconStyle} name={props.icon} />
          {props.text ? <Text style={{ fontSize: 12, transform: [{ scale: 0.8 }] }}>{props.text}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}
