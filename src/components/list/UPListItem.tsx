import React from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPListAnchorContext } from './context';

export type UPListItemProps = {
  anchor?: string | number;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

export function UPListItem(input: UPListItemProps): React.JSX.Element {
  const props = { ...useUPConfig().props.listItem, ...input } as UPListItemProps;
  const list = useUPListAnchorContext();
  const registerLayout = (event: LayoutChangeEvent) => {
    if (props.anchor !== undefined && props.anchor !== '') {
      list?.registerAnchor(props.anchor, event.nativeEvent.layout.y);
    }
  };
  const anchor = props.anchor === undefined || props.anchor === '' ? undefined : String(props.anchor);
  return (
    <View onLayout={registerLayout} style={input.customStyle} testID={anchor ? `up-list-item-${anchor}` : 'up-list-item'}>
      {input.children}
    </View>
  );
}
