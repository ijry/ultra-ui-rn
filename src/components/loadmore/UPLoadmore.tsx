import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPLine } from '../line';
import { UPLoadingIcon } from '../loading-icon';

export type UPLoadmoreProps = {
  status?: 'loadmore' | 'loading' | 'nomore';
  bgColor?: string;
  icon?: boolean;
  fontSize?: UPDimension;
  iconSize?: UPDimension;
  color?: string;
  loadingIcon?: 'spinner' | 'circle' | 'semicircle';
  loadmoreText?: string;
  loadingText?: string;
  nomoreText?: string;
  isDot?: boolean;
  iconColor?: string;
  marginTop?: UPDimension;
  marginBottom?: UPDimension;
  height?: UPDimension | 'auto';
  line?: boolean;
  lineColor?: string;
  dashed?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onLoadmore?: () => void;
};

export function UPLoadmore(input: UPLoadmoreProps): React.JSX.Element {
  const props = { ...useUPConfig().props.loadmore, ...input } as UPLoadmoreProps;
  const text = props.status === 'loadmore' ? props.loadmoreText : props.status === 'loading' ? props.loadingText : props.isDot ? '●' : props.nomoreText;
  return (
    <View style={[{ alignItems: 'center', backgroundColor: props.bgColor, flexDirection: 'row', height: props.height === 'auto' ? undefined : getPx(props.height ?? 'auto'), justifyContent: 'center', marginBottom: getPx(props.marginBottom ?? 10), marginTop: getPx(props.marginTop ?? 10) }, input.customStyle]}>
      {props.line ? <UPLine color={props.lineColor} dashed={props.dashed} length="140rpx" /> : null}
      <Pressable onPress={props.status === 'loadmore' ? input.onLoadmore : undefined} style={{ alignItems: 'center', flexDirection: 'row', marginHorizontal: 15 }} testID={`up-loadmore-${props.status}`}>
        {props.status === 'loading' && props.icon ? <View style={{ marginRight: 8 }}><UPLoadingIcon color={props.iconColor} mode={props.loadingIcon} size={props.iconSize} /></View> : null}
        <Text style={{ color: props.color, fontSize: props.status === 'nomore' && props.isDot ? 15 : getPx(props.fontSize ?? 14) }}>{text}</Text>
      </Pressable>
      {props.line ? <UPLine color={props.lineColor} dashed={props.dashed} length="140rpx" /> : null}
    </View>
  );
}
