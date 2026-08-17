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

export type UPToolbarProps = {
  show?: boolean;
  cancelText?: string;
  confirmText?: string;
  cancelColor?: string;
  confirmColor?: string;
  title?: string;
  rightSlot?: boolean;
  right?: React.ReactNode;
  titleStyle?: StyleProp<TextStyle>;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

export function UPToolbar(input: UPToolbarProps): React.JSX.Element | null {
  const config = useUPConfig();
  const props = { ...config.props.toolbar, ...input };
  if (!props.show) {
    return null;
  }
  const confirmColor = props.confirmColor || config.color.primary;
  return (
    <View
      style={[{ alignItems: 'center', flexDirection: 'row', height: 42, justifyContent: 'space-between' }, input.customStyle]}
      testID="up-toolbar"
    >
      <Pressable
        accessibilityLabel={props.cancelText}
        accessibilityRole="button"
        hitSlop={8}
        onPress={input.onCancel}
        style={{ alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44, paddingHorizontal: 15 }}
        testID="up-toolbar-cancel"
      >
        <Text style={{ color: props.cancelColor, fontSize: 15 }}>{props.cancelText}</Text>
      </Pressable>
      {props.title ? <Text numberOfLines={1} style={[{ color: config.color.mainColor, flex: 1, fontSize: 16, fontWeight: '700', paddingHorizontal: 30, textAlign: 'center' }, input.titleStyle]}>{props.title}</Text> : <View style={{ flex: 1 }} />}
      {props.rightSlot ? (
        <View style={{ alignItems: 'flex-end', minHeight: 44, minWidth: 44 }}>{input.right}</View>
      ) : (
        <Pressable
          accessibilityLabel={props.confirmText}
          accessibilityRole="button"
          hitSlop={8}
          onPress={input.onConfirm}
          style={{ alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44, paddingHorizontal: 15 }}
          testID="up-toolbar-confirm"
        >
          <Text style={{ color: confirmColor, fontSize: 15 }}>{props.confirmText}</Text>
        </Pressable>
      )}
    </View>
  );
}
