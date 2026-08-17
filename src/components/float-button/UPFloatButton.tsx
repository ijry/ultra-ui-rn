import React, { useState } from 'react';
import { Pressable, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPFloatButtonItem = {
  name: string;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  [key: string]: unknown;
};

export type UPFloatButtonProps = {
  backgroundColor?: string;
  color?: string;
  width?: UPDimension;
  height?: UPDimension;
  borderColor?: string;
  right?: UPDimension;
  top?: UPDimension;
  bottom?: UPDimension;
  isMenu?: boolean;
  list?: readonly UPFloatButtonItem[];
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  listContent?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
  onItemClick?: (item: UPFloatButtonItem & { index: number }) => void;
};

function optionalDimension(value: UPDimension | undefined): number | undefined {
  return value === undefined || value === '' ? undefined : getPx(value);
}

export function UPFloatButton(input: UPFloatButtonProps): React.JSX.Element {
  const props = { ...useUPConfig().props.floatButton, ...input } as UPFloatButtonProps;
  const [showList, setShowList] = useState(false);
  const width = getPx(props.width ?? '50px');
  const height = getPx(props.height ?? '50px');
  const items = props.list ?? [];
  const pressMain = (event: GestureResponderEvent) => {
    if (props.isMenu) setShowList((current) => !current);
    input.onClick?.(event);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        {
          bottom: optionalDimension(props.bottom),
          position: 'absolute',
          right: optionalDimension(props.right),
          top: optionalDimension(props.top),
          zIndex: 999,
        },
        input.customStyle,
      ]}
      testID="up-float-button"
    >
      {showList ? (
        input.listContent ?? (
          <View style={{ alignItems: 'center', bottom: height, position: 'absolute', width }} testID="up-float-button-list">
            {items.map((item, index) => {
              const color = item.color || props.color;
              const borderColor = item.borderColor || props.borderColor;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={`${item.name}-${index}`}
                  onPress={() => input.onItemClick?.({ ...item, index })}
                  style={{ alignItems: 'center', backgroundColor: item.backgroundColor || props.backgroundColor, borderColor, borderRadius: 100, borderWidth: borderColor ? 1 : 0, height, justifyContent: 'center', marginVertical: 5, width }}
                  testID={`up-float-button-item-${index}`}
                >
                  <UPIcon color={color} name={item.name} />
                </Pressable>
              );
            })}
          </View>
        )
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={pressMain}
        style={{ alignItems: 'center', backgroundColor: props.backgroundColor, borderColor: props.borderColor, borderRadius: 100, borderWidth: props.borderColor ? 1 : 0, height, justifyContent: 'center', width }}
        testID="up-float-button-main"
      >
        {input.children ?? <UPIcon color={props.color} customStyle={showList ? { transform: [{ rotate: '45deg' }] } : undefined} name="plus" />}
      </Pressable>
    </View>
  );
}
