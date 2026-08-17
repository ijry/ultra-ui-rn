import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPOverlayProps = {
  show?: boolean;
  zIndex?: number | string;
  duration?: UPDimension;
  opacity?: number | string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  /** Native testing/customization hook; not part of the uview source API. */
  testID?: string;
  onClick?: () => void;
};

export function UPOverlay(input: UPOverlayProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.overlay, ...input };
  if (!props.show) return null;

  const opacity = Number(props.opacity);
  return (
    <Pressable
      onPress={input.onClick}
      style={[
        {
          backgroundColor: `rgba(0, 0, 0, ${Number.isFinite(opacity) ? opacity : 0.5})`,
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: getPx(props.zIndex),
        },
        input.customStyle,
      ]}
      testID={input.testID ?? 'up-overlay'}
    >
      {input.children}
    </Pressable>
  );
}
