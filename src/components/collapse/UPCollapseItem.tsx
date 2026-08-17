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
import type { UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { UPLine } from '../line';
import { useUPCollapseContext, type UPCollapseName } from './context';

export type UPCollapseItemProps = {
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  value?: string;
  label?: string;
  disabled?: boolean;
  isLink?: boolean;
  clickable?: boolean;
  border?: boolean;
  align?: 'left' | 'center' | 'right';
  name?: UPCollapseName;
  icon?: string;
  /** @deprecated React Native has no exact source height transition duration. */
  duration?: UPDimension;
  showRight?: boolean;
  iconStyle?: StyleProp<TextStyle>;
  rightIconStyle?: StyleProp<TextStyle>;
  cellCustomStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  cellCustomClass?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  titleNode?: React.ReactNode;
  iconNode?: React.ReactNode;
  valueNode?: React.ReactNode;
  rightIconNode?: React.ReactNode;
  onChange?: (expanded: boolean) => void;
  itemIndex?: number;
};

export function UPCollapseItem(input: UPCollapseItemProps): React.JSX.Element {
  const props = { ...useUPConfig().props.collapseItem, ...input } as UPCollapseItemProps;
  const group = useUPCollapseContext();
  const name = props.name === undefined || props.name === '' ? input.itemIndex ?? 0 : props.name;
  const expanded = group?.selected.includes(name) ?? false;
  const clickable = Boolean(props.clickable) && !props.disabled;
  const toggle = () => {
    if (!clickable) {
      return;
    }
    group?.toggle(name);
    input.onChange?.(!expanded);
  };
  const textAlign = props.align ?? 'left';

  return (
    <View style={input.customStyle} testID={`up-collapse-item-container-${String(name)}`}>
      <Pressable
        accessibilityRole={clickable ? 'button' : undefined}
        accessibilityState={{ expanded, disabled: Boolean(props.disabled) }}
        disabled={!clickable}
        onPress={toggle}
        style={[{ opacity: props.disabled ? 0.55 : 1 }, props.cellCustomStyle]}
        testID={`up-collapse-item-${String(name)}`}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 13 }}>
          {input.iconNode ?? (props.icon ? <View style={{ marginRight: 4 }}><UPIcon customStyle={props.iconStyle} name={props.icon} size={22} /></View> : null)}
          <View style={{ flex: 1 }}>
            {input.titleNode ?? (props.title ? <Text style={[{ color: props.disabled ? '#c8c9cc' : '#303133', fontSize: 15, textAlign }, props.titleStyle]}>{props.title}</Text> : null)}
            {props.label ? <Text style={{ color: '#909399', fontSize: 12, marginTop: 5, textAlign }}>{props.label}</Text> : null}
          </View>
          {input.valueNode ?? (props.value ? <Text style={{ color: '#606266', fontSize: 14, marginLeft: 8 }}>{props.value}</Text> : null)}
          {props.isLink && props.showRight ? (
            <View style={{ marginLeft: 4 }}>
              {input.rightIconNode ?? <UPIcon customStyle={[props.rightIconStyle, { transform: [{ rotate: expanded ? '-90deg' : '90deg' }] }]} name="arrow-right" size={16} />}
            </View>
          ) : null}
        </View>
      </Pressable>
      {expanded ? <View style={{ paddingHorizontal: 15, paddingVertical: 12 }}>{input.children}</View> : null}
      {group?.border && props.border ? <UPLine /> : null}
    </View>
  );
}
