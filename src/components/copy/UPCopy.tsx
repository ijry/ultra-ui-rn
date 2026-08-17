import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { toast } from '../../feedback';
import { UPModal } from '../modal';

export type UPCopyWriteText = (content: string) => void | Promise<void>;

export type UPCopyProps = {
  content?: string | number;
  alertStyle?: string;
  notice?: string;
  children?: React.ReactNode;
  /** React Native adapter supplied by the application clipboard integration. */
  writeText?: UPCopyWriteText;
  onSuccess?: () => void;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPCopy(input: UPCopyProps): React.JSX.Element {
  const props = { ...useUPConfig().props.copy, ...input } as UPCopyProps;
  const [showModal, setShowModal] = useState(false);

  const handlePress = async () => {
    const content = props.content;
    if (content === '' || content === null || content === undefined) {
      toast.default('暂无');
      return;
    }
    if (!input.writeText) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('UPCopy requires a writeText adapter to copy content.');
      }
      toast.default('复制失败');
      return;
    }
    try {
      await Promise.resolve(input.writeText(String(content)));
      input.onSuccess?.();
      if (props.alertStyle === 'modal') setShowModal(true);
      else toast.default(props.notice ?? '');
    } catch {
      toast.default('复制失败');
    }
  };

  return (
    <>
      <Pressable accessibilityRole="button" onPress={handlePress} testID="up-copy">
        {input.children ?? <Text testID="up-copy-default-label">复制</Text>}
      </Pressable>
      <UPModal
        content={props.notice}
        onChangeShow={setShowModal}
        show={showModal}
        title="up.common.tip"
      />
    </>
  );
}
