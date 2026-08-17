import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type ImageResizeMode,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPAvatarProps = {
  src?: string;
  shape?: 'circle' | 'square';
  size?: UPDimension;
  mode?: string;
  text?: string;
  bgColor?: string;
  color?: string;
  fontSize?: UPDimension;
  icon?: string;
  /** @deprecated Mini-program avatar chooser is unavailable in React Native. */
  mpAvatar?: boolean;
  randomBgColor?: boolean;
  defaultUrl?: string;
  colorIndex?: string | number;
  name?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: (name: string) => void;
};

const randomColors = [
  '#f56c6c', '#f9ae3d', '#5ac725', '#3c9cff', '#909399',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#6366f1', '#d946ef', '#0ea5e9', '#22c55e',
  '#ef4444', '#a855f7', '#eab308', '#64748b', '#10b981',
];

function avatarResizeMode(mode: string): ImageResizeMode {
  if (mode === 'aspectFill') return 'cover';
  if (mode === 'aspectFit' || mode === 'widthFix' || mode === 'heightFix') return 'contain';
  return 'stretch';
}

function colorFromName(name: string, index: string | number): string {
  const numericIndex = Number(index);
  if (Number.isInteger(numericIndex) && numericIndex >= 0 && numericIndex < randomColors.length) {
    return randomColors[numericIndex];
  }
  return randomColors[
    [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % randomColors.length
  ];
}

export function UPAvatar(input: UPAvatarProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.avatar, ...input };
  const [source, setSource] = useState(props.src);
  const size = getPx(props.size);
  const borderRadius = props.shape === 'circle' ? 100 : 4;
  const backgroundColor = useMemo(
    () => (props.randomBgColor ? colorFromName(props.name || props.text || '', props.colorIndex) : props.bgColor),
    [props.bgColor, props.colorIndex, props.name, props.randomBgColor, props.text],
  );

  useEffect(() => {
    setSource(props.src);
  }, [props.src]);

  const style: ViewStyle = {
    alignItems: 'center',
    backgroundColor,
    borderRadius,
    height: size,
    justifyContent: 'center',
    overflow: 'hidden',
    width: size,
  };
  const content = source ? (
    <Image
      onError={() => setSource(props.defaultUrl)}
      resizeMode={avatarResizeMode(props.mode)}
      source={{ uri: source }}
      style={{ height: size, width: size }}
      testID="up-avatar-image"
    />
  ) : props.icon ? (
    <View testID="up-avatar-icon"><UPIcon color={props.color} name={props.icon} size={getPx(props.fontSize)} /></View>
  ) : (
    <Text style={{ color: props.color, fontSize: getPx(props.fontSize) }}>{props.text}</Text>
  );

  if (!input.onClick) {
    return <View style={[style, input.customStyle]} testID="up-avatar">{content}</View>;
  }
  return (
    <Pressable
      accessibilityRole="imagebutton"
      onPress={() => input.onClick?.(props.name)}
      style={[style, input.customStyle]}
      testID="up-avatar"
    >
      {content}
    </Pressable>
  );
}
