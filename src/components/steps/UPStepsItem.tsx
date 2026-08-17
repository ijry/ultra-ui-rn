import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
import { useUPStepsContext } from './context';

export type UPStepsItemProps = {
  title?: string | number;
  desc?: string | number;
  iconSize?: UPDimension;
  error?: boolean;
  itemStyle?: StyleProp<ViewStyle>;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  iconNode?: React.ReactNode;
  content?: React.ReactNode;
  titleNode?: React.ReactNode;
  descNode?: React.ReactNode;
  itemIndex?: number;
};

type StepStatus = 'finish' | 'process' | 'error' | 'wait';

function statusFor(index: number, current: number, error: boolean): StepStatus {
  if (error) return 'error';
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
}

export function UPStepsItem(input: UPStepsItemProps): React.JSX.Element {
  const props = { ...useUPConfig().props.stepsItem, ...input } as UPStepsItemProps;
  const parent = useUPStepsContext();
  const index = input.itemIndex ?? 0;
  const direction = parent?.direction ?? 'row';
  const current = parent?.current ?? 0;
  const status = statusFor(index, current, Boolean(props.error));
  const active = status === 'finish' || status === 'process';
  const color = status === 'error' ? '#f56c6c' : active ? parent?.activeColor ?? '#3c9cff' : parent?.inactiveColor ?? '#969799';
  const isLast = index + 1 >= (parent?.length ?? 1);
  const iconSize = getPx(props.iconSize ?? 17);

  const icon = input.iconNode ?? (parent?.dot ? (
    <View style={{ backgroundColor: color, borderRadius: 100, height: 10, width: 10 }} />
  ) : parent?.activeIcon || parent?.inactiveIcon ? (
    <UPIcon color={color} name={active ? parent.activeIcon : parent.inactiveIcon} size={iconSize} />
  ) : (
    <View style={{ alignItems: 'center', backgroundColor: status === 'process' ? color : 'transparent', borderColor: color, borderRadius: 100, borderWidth: 1, height: 20, justifyContent: 'center', width: 20 }}>
      {status === 'finish' ? <UPIcon color={color} name="checkmark" size={12} /> : status === 'error' ? <UPIcon color="#f56c6c" name="close" size={12} /> : <Text style={{ color: status === 'process' ? '#ffffff' : color, fontSize: 11 }}>{index + 1}</Text>}
    </View>
  ));

  return (
    <View
      accessibilityState={{ selected: status === 'process' }}
      style={[{ alignItems: direction === 'row' ? 'center' : 'flex-start', flex: direction === 'row' ? 1 : undefined, flexDirection: direction === 'row' ? 'column' : 'row', paddingBottom: direction === 'column' ? 5 : 0, position: 'relative' }, input.customStyle]}
      testID={`up-steps-item-${index}-${status}`}
    >
      {!isLast ? <View style={{ backgroundColor: color, height: direction === 'row' ? 1 : 28, left: direction === 'row' ? '50%' : 10, position: 'absolute', top: direction === 'row' ? 10 : 20, width: direction === 'row' ? '100%' : 1 }} /> : null}
      <View style={[{ alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 100, height: 20, justifyContent: 'center', width: 20, zIndex: 1 }, input.itemStyle]}>{icon}</View>
      <View style={{ alignItems: direction === 'row' ? 'center' : 'flex-start', flex: 1, marginLeft: direction === 'row' ? 6 : 6, marginTop: direction === 'row' ? 6 : 0 }}>
        {input.content ?? <>
          {input.titleNode ?? <Text style={{ color: status === 'process' ? '#303133' : '#606266', fontSize: status === 'process' ? 14 : 13, lineHeight: 20 }}>{props.title}</Text>}
          {input.descNode ?? (props.desc ? <Text style={{ color: '#909399', fontSize: 12 }}>{props.desc}</Text> : null)}
        </>}
      </View>
    </View>
  );
}
