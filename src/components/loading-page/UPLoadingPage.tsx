import React from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPLoadingIcon } from '../loading-icon';

export type UPLoadingPageProps = {
  loadingText?: string | number;
  image?: string;
  loadingMode?: 'spinner' | 'circle' | 'semicircle';
  loading?: boolean;
  bgColor?: string;
  color?: string;
  fontSize?: UPDimension;
  iconSize?: UPDimension;
  loadingColor?: string;
  zIndex?: number;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPLoadingPage(input: UPLoadingPageProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.loadingPage, ...input } as UPLoadingPageProps;
  if (!props.loading) return null;
  return (
    <View style={[{ alignItems: 'center', backgroundColor: props.bgColor || '#ffffff', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0, zIndex: props.zIndex }, input.customStyle]} testID="up-loading-page">
      {props.image ? <Image source={{ uri: props.image }} style={{ height: getPx(props.iconSize ?? 28), marginBottom: 10, width: getPx(props.iconSize ?? 28) }} /> : <UPLoadingIcon color={props.loadingColor} mode={props.loadingMode} size={props.iconSize} />}
      <Text style={{ color: props.color, fontSize: getPx(props.fontSize ?? 19), marginTop: 8 }}>{props.loadingText}</Text>
    </View>
  );
}
