import React, { useState } from 'react';
import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPPopup } from '../popup';

export type UPModalProps = {
  show?: boolean;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmColor?: string;
  cancelColor?: string;
  buttonReverse?: boolean;
  zoom?: boolean;
  asyncClose?: boolean;
  closeOnClickOverlay?: boolean;
  negativeTop?: UPDimension;
  width?: UPDimension;
  confirmButtonShape?: '' | 'circle' | 'square';
  duration?: number;
  contentTextAlign?: 'left' | 'center' | 'right';
  asyncCloseTip?: string;
  asyncCancelClose?: boolean;
  contentStyle?: StyleProp<TextStyle>;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  titleNode?: React.ReactNode;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  onChangeShow?: (show: boolean) => void;
  /** Source `cancelOnAsync` event: cancel pressed while an async confirm is pending. */
  onCancelOnAsync?: () => void;
};

export function UPModal(input: UPModalProps): React.JSX.Element {
  const props = { ...useUPConfig().props.modal, ...input } as UPModalProps;
  const [pendingAsync, setPendingAsync] = useState(false);
  const requestClose = () => input.onChangeShow?.(false);
  const confirm = () => {
    input.onConfirm?.();
    if (props.asyncClose) setPendingAsync(true);
    else requestClose();
  };
  const cancel = () => {
    if (props.asyncClose && pendingAsync) {
      input.onCancelOnAsync?.();
    } else if (!props.asyncCancelClose) {
      requestClose();
    }
    input.onCancel?.();
  };
  const cancelButton = props.showCancelButton && !props.confirmButtonShape ? (
    <Pressable key="cancel" onPress={cancel} style={buttonStyle} testID="up-modal-cancel"><Text style={{ color: props.cancelColor, fontSize: 16 }}>{props.cancelText}</Text></Pressable>
  ) : null;
  const confirmButton = props.showConfirmButton ? (
    <Pressable key="confirm" onPress={confirm} style={[buttonStyle, props.confirmButtonShape ? { backgroundColor: props.confirmColor, borderRadius: props.confirmButtonShape === 'circle' ? 100 : 3, margin: 16 } : null]} testID="up-modal-confirm"><Text style={{ color: props.confirmButtonShape ? '#ffffff' : props.confirmColor, fontSize: 16 }}>{props.confirmText}</Text></Pressable>
  ) : null;
  const buttons = props.buttonReverse ? [confirmButton, cancelButton] : [cancelButton, confirmButton];
  return (
    <UPPopup
      bgColor="transparent"
      closeOnClickOverlay={props.closeOnClickOverlay}
      duration={props.duration}
      mode="center"
      onChangeShow={input.onChangeShow}
      onClose={input.onClose}
      show={props.show}
      zoom={props.zoom}
    >
      <View style={[{ backgroundColor: '#ffffff', borderRadius: 6, marginTop: getPx(props.negativeTop ?? 0), overflow: 'hidden', width: getPx(props.width ?? '650rpx') }, input.customStyle]} testID="up-modal">
        {input.titleNode ?? (props.title ? <Text style={{ color: '#303133', fontSize: 17, fontWeight: '600', paddingHorizontal: 20, paddingTop: 24, textAlign: 'center' }}>{props.title}</Text> : null)}
        {input.children ?? (props.content ? <Text style={[{ color: '#606266', fontSize: 15, lineHeight: 22, paddingHorizontal: 20, paddingTop: props.title ? 12 : 24, textAlign: props.contentTextAlign }, props.contentStyle]}>{props.content}</Text> : null)}
        {props.showConfirmButton || props.showCancelButton ? <View style={{ borderTopColor: '#e4e7ed', borderTopWidth: props.confirmButtonShape ? 0 : 0.5, flexDirection: 'row', marginTop: 20 }}>{buttons}</View> : null}
      </View>
    </UPPopup>
  );
}

const buttonStyle: ViewStyle = { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 48 };
