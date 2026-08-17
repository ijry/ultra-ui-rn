import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';

export type UPBoxProps = {
  bgColors?: [string, string, string] | string[];
  height?: UPDimension;
  borderRadius?: UPDimension;
  gap?: UPDimension;
  leftIcon?: string;
  leftTitle?: string;
  rightTopIcon?: string;
  rightTopTitle?: string;
  rightBottomIcon?: string;
  rightBottomTitle?: string;
  left?: React.ReactNode;
  rightTop?: React.ReactNode;
  rightBottom?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

type BoxPanelProps = {
  backgroundColor: string;
  borderRadius: number;
  icon: string;
  title: string;
  children?: React.ReactNode;
  testID: string;
};

function BoxPanel({ backgroundColor, borderRadius, children, icon, testID, title }: BoxPanelProps): React.JSX.Element {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor,
        borderRadius,
        flex: 1,
        justifyContent: 'center',
      }}
      testID={testID}
    >
      {children ?? (
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          {icon ? <UPIcon name={icon} size={36} /> : null}
          <Text style={{ fontSize: 16, marginLeft: 8 }}>{title}</Text>
        </View>
      )}
    </View>
  );
}

export function UPBox(input: UPBoxProps): React.JSX.Element {
  const props = { ...useUPConfig().props.box, ...input };
  const colors = props.bgColors;
  const height = getPx(props.height);
  const gap = getPx(props.gap);
  const borderRadius = getPx(props.borderRadius);
  return (
    <View
      style={[{ flexDirection: 'row', height }, input.customStyle]}
      testID="up-box"
    >
      <BoxPanel
        backgroundColor={colors[0]}
        borderRadius={borderRadius}
        icon={props.leftIcon}
        testID="up-box-left"
        title={props.leftTitle}
      >
        {input.left}
      </BoxPanel>
      <View style={{ height, width: gap }} testID="up-box-gap" />
      <View style={{ flex: 1 }}>
        <BoxPanel
          backgroundColor={colors[1]}
          borderRadius={borderRadius}
          icon={props.rightTopIcon}
          testID="up-box-right-top"
          title={props.rightTopTitle}
        >
          {input.rightTop}
        </BoxPanel>
        <View style={{ height: gap }} testID="up-box-right-gap" />
        <BoxPanel
          backgroundColor={colors[2]}
          borderRadius={borderRadius}
          icon={props.rightBottomIcon}
          testID="up-box-right-bottom"
          title={props.rightBottomTitle}
        >
          {input.rightBottom}
        </BoxPanel>
      </View>
    </View>
  );
}
