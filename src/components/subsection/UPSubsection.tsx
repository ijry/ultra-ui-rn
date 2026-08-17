import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range, type UPDimension } from '../../utils';

export type UPSubsectionItem = string | number | { [key: string]: unknown };

export type UPSubsectionProps = {
  list?: readonly UPSubsectionItem[];
  current?: number | string;
  activeColor?: string;
  inactiveColor?: string;
  mode?: 'button' | 'subsection';
  fontSize?: UPDimension;
  bold?: boolean;
  bgColor?: string;
  keyName?: string;
  activeColorKeyName?: string;
  inactiveColorKeyName?: string;
  disabled?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onChange?: (index: number) => void;
  onUpdateCurrent?: (index: number) => void;
};

function getItemValue(item: UPSubsectionItem, key: string): string {
  if (typeof item === 'object' && item !== null) {
    return String(item[key] ?? '');
  }
  return String(item);
}

function getItemColor(item: UPSubsectionItem, key: string, fallback: string): string {
  if (typeof item === 'object' && item !== null && typeof item[key] === 'string') {
    return item[key] as string;
  }
  return fallback;
}

export function UPSubsection(input: UPSubsectionProps): React.JSX.Element {
  const props = { ...useUPConfig().props.subsection, ...input } as UPSubsectionProps;
  const list = props.list ?? [];
  const configuredCurrent = range(0, Math.max(0, list.length - 1), Number(input.current ?? props.current ?? 0));
  const [innerCurrent, setInnerCurrent] = useState(configuredCurrent);
  const sectionMode = props.mode === 'subsection';

  useEffect(() => {
    setInnerCurrent(configuredCurrent);
  }, [configuredCurrent]);

  const onPress = (index: number) => {
    if (props.disabled) {
      return;
    }
    setInnerCurrent(index);
    input.onUpdateCurrent?.(index);
    input.onChange?.(index);
  };
  const selectedBackground = props.disabled ? '#d4d4d4' : sectionMode ? props.activeColor : '#ffffff';
  const inactiveText = props.disabled ? '#c8c9cc' : props.inactiveColor;

  return (
    <View
      style={[
        {
          backgroundColor: sectionMode ? 'transparent' : props.bgColor,
          borderRadius: 4,
          flexDirection: 'row',
          height: sectionMode ? 32 : 34,
          overflow: 'hidden',
          padding: sectionMode ? 0 : 3,
        },
        input.customStyle,
      ]}
      testID="up-subsection"
    >
      {list.map((item, index) => {
        const active = innerCurrent === index;
        const activeText = getItemColor(item, props.activeColorKeyName ?? '', sectionMode ? '#ffffff' : props.activeColor ?? '#3c9cff');
        const inactive = getItemColor(item, props.inactiveColorKeyName ?? '', inactiveText ?? '#303133');
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ disabled: Boolean(props.disabled), selected: active }}
            disabled={props.disabled}
            key={`${getItemValue(item, props.keyName ?? 'name')}-${index}`}
            onPress={() => onPress(index)}
            style={{ alignItems: 'center', backgroundColor: active ? selectedBackground : 'transparent', borderColor: sectionMode ? (props.disabled ? '#d4d4d4' : props.activeColor) : 'transparent', borderLeftWidth: sectionMode && index ? 0 : sectionMode ? 1 : 0, borderRadius: index === 0 || index === list.length - 1 ? 4 : 0, borderRightWidth: sectionMode ? 1 : 0, borderTopWidth: sectionMode ? 1 : 0, borderBottomWidth: sectionMode ? 1 : 0, flex: 1, justifyContent: 'center' }}
            testID={`up-subsection-item-${index}`}
          >
            <Text
              style={{ color: active ? activeText : inactive, fontSize: getPx(props.fontSize ?? 12), fontWeight: props.bold && active && !props.disabled ? '700' : '400' }}
              testID={`up-subsection-item-${index}-text`}
            >
              {getItemValue(item, props.keyName ?? 'name')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
