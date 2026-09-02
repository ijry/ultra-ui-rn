import React from 'react';
import { Pressable, ScrollView, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPPopup } from '../popup';

export type UPActionSheetAction = Record<string, unknown> & {
  color?: string;
  disabled?: boolean;
  loading?: boolean;
};

export type UPActionSheetProps = {
  show?: boolean;
  title?: string;
  description?: string;
  actions?: readonly UPActionSheetAction[];
  nameKey?: string;
  subnameKey?: string;
  cancelText?: string;
  closeOnClickAction?: boolean;
  safeAreaInsetBottom?: boolean;
  /** @deprecated Mini-program open capability is unavailable in React Native. */
  openType?: string;
  closeOnClickOverlay?: boolean;
  round?: boolean | UPDimension;
  wrapMaxHeight?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  /** Source default slot: replaces the built-in action list. */
  children?: React.ReactNode;
  onClose?: () => void;
  onSelect?: (action: UPActionSheetAction) => void;
  onChangeShow?: (show: boolean) => void;
};

export function UPActionSheet(input: UPActionSheetProps): React.JSX.Element {
  const props = { ...useUPConfig().props.actionSheet, ...input } as UPActionSheetProps;
  const close = () => {
    input.onChangeShow?.(false);
    input.onClose?.();
  };
  return (
    <UPPopup
      closeOnClickOverlay={props.closeOnClickOverlay}
      onChangeShow={input.onChangeShow}
      onClose={input.onClose}
      round={props.round}
      safeAreaInsetBottom={props.safeAreaInsetBottom}
      show={props.show}
    >
      <View style={input.customStyle} testID="up-action-sheet">
        {props.title ? <Text style={headingStyle}>{props.title}</Text> : null}
        {props.description ? <Text style={descriptionStyle}>{props.description}</Text> : null}
        {input.children ?? (
        <ScrollView style={{ maxHeight: getPx(props.wrapMaxHeight ?? '600px') }}>
          {props.actions?.map((action, index) => {
            const label = String(action[props.nameKey ?? 'name'] ?? '');
            const subname = String(action[props.subnameKey ?? 'subnameKey'] ?? '');
            const disabled = Boolean(action.disabled || action.loading);
            return (
              <Pressable
                disabled={disabled}
                key={`${label}-${index}`}
                onPress={() => {
                  if (disabled) return;
                  input.onSelect?.(action);
                  if (props.closeOnClickAction) close();
                }}
                style={{ alignItems: 'center', borderTopColor: '#f3f4f6', borderTopWidth: 0.5, minHeight: 54, justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}
                testID={`up-action-sheet-action-${index}`}
              >
                <Text style={{ color: typeof action.color === 'string' ? action.color : '#303133', fontSize: 16 }}>{label}</Text>
                {subname ? <Text style={{ color: '#909399', fontSize: 12, marginTop: 3 }}>{subname}</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
        )}
        {props.cancelText ? <Pressable onPress={close} style={{ alignItems: 'center', borderTopColor: '#f3f4f6', borderTopWidth: 6, height: 54, justifyContent: 'center' }} testID="up-action-sheet-cancel"><Text style={{ color: '#303133', fontSize: 16 }}>{props.cancelText}</Text></Pressable> : null}
      </View>
    </UPPopup>
  );
}

const headingStyle: TextStyle = { color: '#303133', fontSize: 16, fontWeight: '600', paddingHorizontal: 16, paddingTop: 20, textAlign: 'center' };
const descriptionStyle: TextStyle = { color: '#909399', fontSize: 13, paddingHorizontal: 16, paddingVertical: 10, textAlign: 'center' };
