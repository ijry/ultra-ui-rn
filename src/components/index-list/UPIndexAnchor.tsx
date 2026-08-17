import React, { useEffect } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { useUPIndexItemContext, useUPIndexListContext } from './context';

export type UPIndexAnchorProps = {
  text?: string | number | { name?: string };
  color?: string;
  size?: UPDimension;
  bgColor?: string;
  height?: UPDimension;
  sticky?: boolean;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

function labelFor(text: UPIndexAnchorProps['text']): string {
  if (typeof text === 'object' && text !== null) {
    return text.name ?? '';
  }
  return text === undefined ? '' : String(text);
}

export function UPIndexAnchor(input: UPIndexAnchorProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.indexAnchor, ...input } as UPIndexAnchorProps;
  const list = useUPIndexListContext();
  const item = useUPIndexItemContext();
  const label = labelFor(props.text);
  const sticky = input.sticky ?? list?.sticky ?? true;

  useEffect(() => {
    item?.setAnchorKey(label);
  }, [item, label]);

  return (
    <View
      style={[
        {
          alignItems: 'center',
          backgroundColor: props.bgColor,
          height: getPx(props.height ?? 32),
          paddingLeft: 15,
          zIndex: sticky ? 1 : 0,
        },
        input.customStyle,
      ]}
      testID="up-index-anchor"
    >
      {input.children ?? (
        <Text style={{ color: props.color, fontSize: getPx(props.size ?? 14) }} testID="up-index-anchor-text">
          {label}
        </Text>
      )}
    </View>
  );
}
