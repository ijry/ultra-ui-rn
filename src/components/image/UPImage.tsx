import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPImageProps = {
  src?: string;
  mode?: string;
  width?: UPDimension;
  height?: UPDimension;
  shape?: 'circle' | 'square';
  radius?: UPDimension;
  /** @deprecated React Native images manage loading natively. */
  lazyLoad?: boolean;
  /** @deprecated React Native does not expose mini-program image menus. */
  showMenuByLongpress?: boolean;
  loadingIcon?: string;
  errorIcon?: string;
  showLoading?: boolean;
  showError?: boolean;
  fade?: boolean;
  /** @deprecated Mini-program-only WebP option. */
  webp?: boolean;
  duration?: UPDimension;
  bgColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  onClick?: () => void;
  onLoad?: (event: NativeSyntheticEvent<unknown>) => void;
  onError?: (event: NativeSyntheticEvent<unknown>) => void;
};

const resizeModes: Record<string, ImageResizeMode> = {
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
  return resizeModes[mode] ?? 'cover';
}

function resolveSize(value: UPDimension): ViewStyle['width'] {
  return String(value).includes('%')
    ? (String(value) as `${number}%`)
    : getPx(value);
}

export function UPImage(input: UPImageProps): React.JSX.Element {
  const config = useUPConfig();
  const props = { ...config.props.image, ...input };
  const [loading, setLoading] = useState(Boolean(props.src));
  const [error, setError] = useState(!props.src);
  const width = resolveSize(props.width);
  const height = resolveSize(props.height);
  const radius = props.shape === 'circle' ? 10000 : getPx(props.radius);

  useEffect(() => {
    setLoading(Boolean(props.src));
    setError(!props.src);
  }, [props.src]);

  const frameStyle: ViewStyle = {
    backgroundColor: loading || error ? props.bgColor : undefined,
    borderRadius: radius,
    height,
    overflow: 'hidden',
    position: 'relative',
    width,
  };
  const imageStyle: ImageStyle = {
    borderRadius: radius,
    height,
    opacity: props.fade && loading ? 0 : 1,
    width,
  };
  const placeholderStyle: ViewStyle = {
    alignItems: 'center',
    backgroundColor: props.bgColor,
    borderRadius: radius,
    height,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width,
  };
  const nativeImage = !error ? (
    <Image
      onError={(event) => {
        setError(true);
        setLoading(false);
        input.onError?.(event);
      }}
      onLoad={(event) => {
        setError(false);
        setLoading(false);
        input.onLoad?.(event);
      }}
      resizeMode={resolveResizeMode(props.mode)}
      source={{ uri: props.src }}
      style={imageStyle}
      testID="up-image-native"
    />
  ) : null;
  const content = (
    <View style={[frameStyle, input.customStyle]}>
      {nativeImage}
      {loading && props.showLoading ? (
        <View style={placeholderStyle} testID="up-image-loading">
          {input.loading ?? <UPIcon name={props.loadingIcon} />}
        </View>
      ) : null}
      {error && !loading && props.showError ? (
        <View style={placeholderStyle} testID="up-image-error">
          {input.error ?? <UPIcon name={props.errorIcon} />}
        </View>
      ) : null}
    </View>
  );

  if (!input.onClick) {
    return <View testID="up-image">{content}</View>;
  }
  return (
    <Pressable accessibilityRole="imagebutton" onPress={input.onClick} testID="up-image">
      {content}
    </Pressable>
  );
}
