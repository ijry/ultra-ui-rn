import React from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { type UPIconName, upiconGlyphs } from '../../icons';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils/dimensions';

export type UPIconProps = {
  name?: UPIconName | string;
  color?: string;
  size?: UPDimension;
  bold?: boolean;
  index?: string | number;
  /** @deprecated React Native has no CSS hover-class runtime. */
  hoverClass?: string;
  customPrefix?: string;
  label?: string | number;
  labelPos?: 'left' | 'right' | 'top' | 'bottom';
  labelSize?: UPDimension;
  labelColor?: string;
  space?: UPDimension;
  imgMode?: string;
  width?: UPDimension;
  height?: UPDimension;
  top?: UPDimension;
  /** @deprecated React Native press propagation differs from uni-app. */
  stop?: boolean;
  customStyle?: StyleProp<TextStyle | ImageStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: (index: string | number, event: unknown) => void;
};

function resolveColor(
  color: string,
  colors: ReturnType<typeof useUPTheme>['colors'],
): string {
  return color in colors ? colors[color as keyof typeof colors] : color;
}

const directions: Record<
  NonNullable<UPIconProps['labelPos']>,
  ViewStyle['flexDirection']
> = {
  bottom: 'column',
  left: 'row-reverse',
  right: 'row',
  top: 'column-reverse',
};

const uniResizeModes: Record<string, ImageResizeMode> = {
  aspectFill: 'cover',
  aspectFit: 'contain',
  bottom: 'center',
  bottomLeft: 'center',
  bottomRight: 'center',
  center: 'center',
  cover: 'cover',
  heightFix: 'contain',
  left: 'center',
  repeat: 'repeat',
  right: 'center',
  scaleToFill: 'stretch',
  stretch: 'stretch',
  top: 'center',
  topLeft: 'center',
  topRight: 'center',
  widthFix: 'contain',
};

function resolveResizeMode(mode: string): ImageResizeMode {
  return uniResizeModes[mode] ?? 'contain';
}

export function UPIcon(input: UPIconProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.icon, ...input };
  const { colors } = useUPTheme();
  const isImage = props.name.includes('/');
  const size = getPx(props.size);
  const color = resolveColor(props.color, colors);
  const imageWidth = getPx(props.width || size);
  const imageHeight = getPx(props.height || size);
  const glyph =
    props.customPrefix === 'uicon'
      ? upiconGlyphs[props.name as UPIconName] || props.name
      : props.name;
  const spacing = getPx(props.space);
  const labelStyle: TextStyle =
    props.labelPos === 'left'
      ? { marginRight: spacing }
      : props.labelPos === 'right'
        ? { marginLeft: spacing }
        : props.labelPos === 'top'
          ? { marginBottom: spacing }
          : { marginTop: spacing };

  const content = isImage ? (
    <Image
      resizeMode={resolveResizeMode(props.imgMode)}
      source={{ uri: props.name }}
      style={[
        { height: imageHeight, width: imageWidth },
        props.customStyle as StyleProp<ImageStyle>,
      ]}
      testID="up-icon-image"
    />
  ) : (
    <Text
      style={[
        {
          color,
          fontFamily:
            props.customPrefix === 'uicon'
              ? 'uicon-iconfont'
              : props.customPrefix,
          fontSize: size,
          fontWeight: props.bold ? '700' : '400',
          lineHeight: size,
          position: 'relative',
          top: getPx(props.top),
        },
        props.customStyle as StyleProp<TextStyle>,
      ]}
      testID="up-icon-glyph"
    >
      {glyph}
    </Text>
  );

  return (
    <Pressable
      accessibilityRole={input.onClick ? 'button' : 'image'}
      disabled={!input.onClick}
      onPress={(event) => input.onClick?.(props.index, event)}
      testID="up-icon"
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: directions[props.labelPos],
        }}
      >
        {content}
        {props.label !== '' ? (
          <Text
            style={[
              {
                color: resolveColor(props.labelColor, colors),
                fontSize: getPx(props.labelSize),
                lineHeight: getPx(props.labelSize),
              },
              labelStyle,
            ]}
          >
            {props.label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
