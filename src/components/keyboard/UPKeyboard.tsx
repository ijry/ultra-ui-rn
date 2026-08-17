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
import { UPCarKeyboard } from '../car-keyboard';
import { UPNumberKeyboard, type UPNumberKeyboardValue } from '../number-keyboard';
import { UPPopup } from '../popup';

export type UPKeyboardMode = 'number' | 'card' | 'car';
export type UPKeyboardValue = UPNumberKeyboardValue | string | number;

export type UPKeyboardProps = {
  mode?: UPKeyboardMode;
  dotDisabled?: boolean;
  tooltip?: boolean;
  showTips?: boolean;
  tips?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
  random?: boolean;
  safeAreaInsetBottom?: boolean;
  closeOnClickOverlay?: boolean;
  show?: boolean;
  overlay?: boolean;
  zIndex?: number | string;
  cancelText?: string;
  confirmText?: string;
  autoChange?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onChange?: (value: UPKeyboardValue) => void;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onBackspace?: () => void;
  onChangeShow?: (show: boolean) => void;
};

function defaultTip(mode: UPKeyboardMode): string {
  if (mode === 'card') return '身份证键盘';
  if (mode === 'car') return '车牌号键盘';
  return '数字键盘';
}

export function UPKeyboard(input: UPKeyboardProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.keyboard, ...input } as UPKeyboardProps;
  const mode = props.mode ?? 'number';
  const tip = props.tips || defaultTip(mode);

  return (
    <UPPopup
      bgColor="rgb(214, 218, 220)"
      closeOnClickOverlay={props.closeOnClickOverlay}
      mode="bottom"
      onChangeShow={input.onChangeShow}
      onClose={input.onClose}
      overlay={props.overlay}
      round={false}
      safeAreaInsetBottom={props.safeAreaInsetBottom}
      show={props.show}
      zIndex={props.zIndex}
    >
      <View style={input.customStyle} testID="up-keyboard">
        {input.children}
        {props.tooltip ? (
          <View style={toolbarStyle} testID="up-keyboard-toolbar">
            {props.showCancel ? (
              <Pressable
                accessibilityLabel={props.cancelText}
                accessibilityRole="button"
                onPress={input.onCancel}
                style={[toolbarItemStyle, { alignItems: 'flex-start' }]}
                testID="up-keyboard-cancel"
              >
                <Text style={cancelTextStyle}>{props.cancelText}</Text>
              </Pressable>
            ) : <View style={toolbarItemStyle} />}
            <View style={[toolbarItemStyle, { alignItems: 'center' }]}>
              {props.showTips ? <Text style={tipsTextStyle}>{tip}</Text> : null}
            </View>
            {props.showConfirm ? (
              <Pressable
                accessibilityLabel={props.confirmText}
                accessibilityRole="button"
                onPress={input.onConfirm}
                style={[toolbarItemStyle, { alignItems: 'flex-end' }]}
                testID="up-keyboard-confirm"
              >
                <Text style={[confirmTextStyle, { color: config.color.primary }]}>{props.confirmText}</Text>
              </Pressable>
            ) : <View style={toolbarItemStyle} />}
          </View>
        ) : null}
        {mode === 'car' ? (
          <UPCarKeyboard
            autoChange={props.autoChange}
            onBackspace={input.onBackspace}
            onChange={input.onChange}
            random={props.random}
          />
        ) : (
          <UPNumberKeyboard
            dotDisabled={props.dotDisabled}
            mode={mode}
            onBackspace={input.onBackspace}
            onChange={input.onChange}
            random={props.random}
          />
        )}
      </View>
    </UPPopup>
  );
}

const toolbarStyle: ViewStyle = {
  backgroundColor: '#ffffff',
  flexDirection: 'row',
  paddingHorizontal: 12,
  paddingVertical: 14,
};

const toolbarItemStyle: ViewStyle = { flex: 1 };
const cancelTextStyle: TextStyle = { color: '#909399', fontSize: 15 };
const tipsTextStyle: TextStyle = { color: '#909399', fontSize: 15 };
const confirmTextStyle: TextStyle = { fontSize: 15 };
