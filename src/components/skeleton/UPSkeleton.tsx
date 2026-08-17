import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';

export type UPSkeletonProps = {
  loading?: boolean;
  /** @deprecated React Native base implementation renders a static skeleton; shimmer is deferred. */
  animate?: boolean;
  rows?: number | string;
  rowsWidth?: UPDimension | UPDimension[];
  rowsHeight?: UPDimension | UPDimension[];
  title?: boolean;
  titleWidth?: UPDimension;
  titleHeight?: UPDimension;
  avatar?: boolean;
  avatarSize?: UPDimension;
  avatarShape?: 'circle' | 'square';
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
};

function valueAt(value: UPDimension | UPDimension[], index: number): UPDimension {
  return Array.isArray(value) ? value[index] ?? value[value.length - 1] : value;
}

function resolveWidth(value: UPDimension): ViewStyle['width'] {
  return String(value).includes('%')
    ? (String(value) as `${number}%`)
    : getPx(value);
}

export function UPSkeleton(input: UPSkeletonProps): React.JSX.Element | null {
  const props = { ...useUPConfig().props.skeleton, ...input };
  if (!props.loading) {
    if (typeof input.children === 'string' || typeof input.children === 'number') {
      return <Text>{input.children}</Text>;
    }
    return input.children ? <>{input.children}</> : null;
  }
  const rowCount = Math.max(0, Number(props.rows));
  const blockStyle = { backgroundColor: '#f2f3f5', borderRadius: 3 };
  return (
    <View style={[{ flexDirection: 'row' }, input.customStyle]} testID="up-skeleton">
      {props.avatar ? (
        <View
          style={{
            ...blockStyle,
            borderRadius: props.avatarShape === 'circle' ? 100 : 4,
            height: getPx(props.avatarSize),
            marginRight: 15,
            width: getPx(props.avatarSize),
          }}
          testID="up-skeleton-avatar"
        />
      ) : null}
      <View style={{ flex: 1 }}>
        {props.title ? (
          <View
            style={{ ...blockStyle, height: getPx(props.titleHeight), marginBottom: rowCount ? 15 : 0, width: resolveWidth(props.titleWidth) }}
            testID="up-skeleton-title"
          />
        ) : null}
        {Array.from({ length: rowCount }, (_, index) => (
          <View
            key={index}
            style={{
              ...blockStyle,
              height: getPx(valueAt(props.rowsHeight, index)),
              marginBottom: index === rowCount - 1 ? 0 : 10,
              width: resolveWidth(valueAt(props.rowsWidth, index)),
            }}
            testID="up-skeleton-row"
          />
        ))}
      </View>
    </View>
  );
}
