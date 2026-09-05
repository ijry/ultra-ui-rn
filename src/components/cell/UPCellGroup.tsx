import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { UPLine } from '../line';

export type UPCellGroupProps = {
  title?: string;
  border?: boolean;
  /** Background behind the group title (source `title-bg-color`). */
  titleBgColor?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  titleNode?: React.ReactNode;
  children?: React.ReactNode;
};

export function UPCellGroup(input: UPCellGroupProps): React.JSX.Element {
  const props = { ...useUPConfig().props.cellGroup, ...input } as UPCellGroupProps;
  const { colors } = useUPTheme();
  return (
    <View style={[{ backgroundColor: '#ffffff', flex: 1 }, input.customStyle]} testID="up-cell-group">
      {props.title ? (
        <View
          style={{
            backgroundColor: props.titleBgColor || undefined,
            paddingBottom: 8,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          testID="up-cell-group-title"
        >
          {input.titleNode ?? (
            <Text style={{ color: colors.mainColor, fontSize: 15, lineHeight: 16 }}>{props.title}</Text>
          )}
        </View>
      ) : null}
      <View>
        {props.border ? <UPLine testID="up-cell-group-border" /> : null}
        {input.children}
      </View>
    </View>
  );
}
