import React from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPEmptyProps = {
  icon?: string;
  text?: string;
  textColor?: string;
  textSize?: UPDimension;
  iconColor?: string;
  iconSize?: UPDimension;
  mode?: string;
  width?: UPDimension;
  height?: UPDimension;
  show?: boolean;
  marginTop?: UPDimension;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  iconNode?: React.ReactNode;
  children?: React.ReactNode;
};

const modeIcons: Record<string, string> = {
  car: 'car',
  comment: 'chat',
  coupon: 'coupon',
  data: 'list',
  evaluate: 'star',
  favor: 'heart',
  history: 'clock',
  image: 'photo',
  message: 'email',
  network: 'wifi-off',
  news: 'file-text',
  order: 'order',
  page: 'file-text',
  search: 'search',
  video: 'video',
};

function isImage(value: string): boolean {
  return /^(https?:|file:|data:|\/)/i.test(value);
}

export function UPEmpty(input: UPEmptyProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.empty, ...input };
  if (!props.show) {
    return null;
  }
  const width = getPx(props.width);
  const height = getPx(props.height);
  const icon = props.icon || modeIcons[props.mode] || 'list';
  const iconContent = input.iconNode ?? (isImage(icon) ? (
    <Image source={{ uri: icon }} style={{ height, width }} />
  ) : (
    <UPIcon color={props.iconColor} name={icon} size={props.iconSize} />
  ));
  return (
    <View
      style={[
        { alignItems: 'center', justifyContent: 'center', marginTop: getPx(props.marginTop) },
        input.customStyle,
      ]}
      testID="up-empty"
    >
      <View style={{ alignItems: 'center', height, justifyContent: 'center', width }} testID="up-empty-icon">
        {iconContent}
      </View>
      {input.children ?? (props.text ? (
        <Text style={{ color: props.textColor, fontSize: getPx(props.textSize), marginTop: 8 }}>
          {props.text}
        </Text>
      ) : null)}
    </View>
  );
}
