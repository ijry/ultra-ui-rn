import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPTheme } from '../../theme';

export type UPTitleProps = {
  prefix?: React.ReactNode;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPTitle({ prefix, children, customStyle }: UPTitleProps): React.JSX.Element {
  const { colors } = useUPTheme();
  return (
    <View
      style={[
        { alignItems: 'center', flexDirection: 'row' },
        customStyle,
      ]}
      testID="up-title"
    >
      {prefix ?? (
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 2,
            height: 18,
            marginRight: 10,
            width: 4,
          }}
          testID="up-title-prefix"
        />
      )}
      {children}
    </View>
  );
}
