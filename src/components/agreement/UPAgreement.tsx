import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPModal } from '../modal';

export type UPAgreementRef = {
  close: () => void;
  showModal: () => void;
};

export type UPAgreementProps = {
  urlProtocol?: string;
  urlPrivacy?: string;
  customStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<TextStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onConfirm?: (value: 1) => void;
  onClose?: () => void;
  onProtocolPress?: (url: string) => void;
  onPrivacyPress?: (url: string) => void;
};

export const UPAgreement = forwardRef<UPAgreementRef, UPAgreementProps>(function UPAgreement(input, ref) {
  const props = { ...useUPConfig().props.agreement, ...input } as UPAgreementProps;
  const [show, setShow] = useState(false);
  const close = useCallback(() => {
    setShow(false);
    input.onClose?.();
  }, [input]);
  const confirm = () => {
    setShow(false);
    input.onConfirm?.(1);
  };
  useImperativeHandle(ref, () => ({ close, showModal: () => setShow(true) }), [close]);
  const defaultContent = (
    <View style={input.customStyle} testID="up-agreement">
      <Text style={[{ color: '#303133', fontSize: 15, lineHeight: 23 }, input.contentStyle]}>
        我们非常重视您的个人信息和隐私保护。为了更好地保障您的个人权益，在您使用我们的产品前，请务必审慎阅读《
      </Text>
      <Pressable accessibilityRole="link" onPress={() => input.onProtocolPress?.(props.urlProtocol ?? '')} testID="up-agreement-protocol">
        <Text style={{ color: '#2979ff', fontSize: 15 }}>用户协议</Text>
      </Pressable>
      <Text style={[{ color: '#303133', fontSize: 15, lineHeight: 23 }, input.contentStyle]}>》和《</Text>
      <Pressable accessibilityRole="link" onPress={() => input.onPrivacyPress?.(props.urlPrivacy ?? '')} testID="up-agreement-privacy">
        <Text style={{ color: '#2979ff', fontSize: 15 }}>隐私政策</Text>
      </Pressable>
      <Text style={[{ color: '#303133', fontSize: 15, lineHeight: 23 }, input.contentStyle]}>》内的所有条款。</Text>
    </View>
  );

  return (
    <UPModal
      confirmText="阅读并同意"
      onCancel={close}
      onChangeShow={(nextShow) => {
        if (!nextShow) close();
      }}
      onConfirm={confirm}
      show={show}
      showCancelButton
    >
      {input.children ?? defaultContent}
    </UPModal>
  );
});
