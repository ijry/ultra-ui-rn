import React, { Children, isValidElement, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPStepsContext } from './context';

export type UPStepsProps = {
  direction?: 'row' | 'column';
  current?: number | string;
  activeColor?: string;
  inactiveColor?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  dot?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

export function UPSteps(input: UPStepsProps): React.JSX.Element {
  const props = { ...useUPConfig().props.steps, ...input } as UPStepsProps;
  const children = Children.toArray(input.children);
  const context = useMemo(
    () => ({
      activeColor: props.activeColor ?? '#3c9cff',
      activeIcon: props.activeIcon ?? '',
      current: Number(props.current ?? 0),
      direction: props.direction ?? 'row',
      dot: Boolean(props.dot),
      inactiveColor: props.inactiveColor ?? '#969799',
      inactiveIcon: props.inactiveIcon ?? '',
      length: children.length,
    }),
    [children.length, props.activeColor, props.activeIcon, props.current, props.direction, props.dot, props.inactiveColor, props.inactiveIcon],
  );

  return (
    <UPStepsContext.Provider value={context}>
      <View style={[{ flexDirection: context.direction === 'row' ? 'row' : 'column' }, input.customStyle]} testID="up-steps">
        {children.map((child, index) =>
          isValidElement(child) ? React.cloneElement(child, { itemIndex: index } as object) : child,
        )}
      </View>
    </UPStepsContext.Provider>
  );
}
