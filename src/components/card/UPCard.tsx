import React from 'react';
import {
  Image,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';
import { sourceSpacing } from '../shared';

export type UPCardProps = {
  full?: boolean;
  title?: string;
  titleColor?: string;
  titleSize?: UPDimension;
  subTitle?: string;
  subTitleColor?: string;
  subTitleSize?: UPDimension;
  border?: boolean;
  index?: string | number | object;
  margin?: UPDimension;
  borderRadius?: UPDimension;
  headStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  footStyle?: StyleProp<ViewStyle>;
  headBorderBottom?: boolean;
  footBorderTop?: boolean;
  thumb?: string;
  thumbWidth?: UPDimension;
  thumbCircle?: boolean;
  padding?: UPDimension;
  paddingHead?: UPDimension;
  paddingBody?: UPDimension;
  paddingFoot?: UPDimension;
  showHead?: boolean;
  showFoot?: boolean;
  /** @deprecated CSS box-shadow strings are unsupported; use customStyle elevation/shadow properties. */
  boxShadow?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  head?: React.ReactNode;
  children?: React.ReactNode;
  foot?: React.ReactNode;
};

function padding(value: UPDimension, fallback: UPDimension): ViewStyle {
  return sourceSpacing(value || fallback, 'padding') as ViewStyle;
}

export function UPCard(input: UPCardProps): React.JSX.Element {
  const props = { ...useUPConfig().props.card, ...input };
  const { colors } = useUPTheme();
  const hasHead = props.showHead && (Boolean(input.head) || Boolean(props.title) || Boolean(props.subTitle));
  const hasFoot = props.showFoot && Boolean(input.foot);
  const titleStyle: TextStyle = { color: props.titleColor, fontSize: getPx(props.titleSize), fontWeight: '500' };
  const subTitleStyle: TextStyle = { color: props.subTitleColor, fontSize: getPx(props.subTitleSize) };
  return (
    <View
      style={[
        {
          backgroundColor: '#ffffff',
          borderColor: colors.borderColor,
          borderRadius: getPx(props.borderRadius),
          borderWidth: props.border && !props.full ? 0.5 : 0,
          ...(props.full ? {} : sourceSpacing(props.margin)),
        },
        input.customStyle,
      ]}
      testID="up-card"
    >
      {hasHead ? (
        <View
          style={[
            {
              alignItems: 'center',
              borderBottomColor: colors.borderColor,
              borderBottomWidth: props.headBorderBottom ? 0.5 : 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              ...padding(props.paddingHead, props.padding),
            },
            input.headStyle,
          ]}
          testID="up-card-head"
        >
          {input.head ?? (
            <>
              <View style={{ alignItems: 'center', flexDirection: 'row', flex: 1 }}>
                {props.thumb ? (
                  <Image
                    source={{ uri: props.thumb }}
                    style={{
                      borderRadius: props.thumbCircle ? 100 : 2,
                      height: getPx(props.thumbWidth),
                      marginRight: 8,
                      width: getPx(props.thumbWidth),
                    }}
                  />
                ) : null}
                <Text style={titleStyle}>{props.title}</Text>
              </View>
              {props.subTitle ? <Text style={subTitleStyle}>{props.subTitle}</Text> : null}
            </>
          )}
        </View>
      ) : null}
      <View style={[padding(props.paddingBody, props.padding), input.bodyStyle]} testID="up-card-body">
        {input.children}
      </View>
      {hasFoot ? (
        <View
          style={[
            {
              borderTopColor: colors.borderColor,
              borderTopWidth: props.footBorderTop ? 0.5 : 0,
              ...padding(props.paddingFoot, props.padding),
            },
            input.footStyle,
          ]}
          testID="up-card-foot"
        >
          {input.foot}
        </View>
      ) : null}
    </View>
  );
}
