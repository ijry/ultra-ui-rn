import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';

export type UPCouponProps = {
  amount?: string | number;
  unit?: string;
  unitPosition?: 'left' | 'right';
  limit?: string;
  title?: string;
  desc?: string;
  time?: string;
  actionText?: string;
  shape?: 'coupon' | 'circle';
  size?: 'small' | 'medium' | 'large';
  circle?: boolean;
  disabled?: boolean;
  bgColor?: string;
  color?: string;
  type?: string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onClick?: () => void;
  /** Source `click` event alias (same timing as `onClick`). */
  onSourceClick?: () => void;
};

const sizeConfig: Record<string, { height: number; amount: number; title: number; radius: number }> = {
  small: { height: 86, amount: 30, title: 13, radius: 8 },
  medium: { height: 108, amount: 40, title: 15, radius: 10 },
  large: { height: 128, amount: 48, title: 17, radius: 12 },
};

/** Visual notches: source uses CSS mask cutouts; RN approximates with background-dot overlays. */
function Notch({ side, color, size }: { side: 'left' | 'right'; color: string; size: number }) {
  const dots = [16, 52, 88];
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side]: -size / 2,
        width: size,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 4,
      }}
    >
      {dots.map((_, index) => (
        <View
          key={index}
          style={{ backgroundColor: color, borderRadius: size / 2, height: size, width: size }}
        />
      ))}
    </View>
  );
}

export function UPCoupon(input: UPCouponProps): React.JSX.Element {
  const props = { ...useUPConfig().props.coupon, ...input } as UPCouponProps;
  const config = sizeConfig[props.size ?? 'medium'] ?? sizeConfig.medium;
  const bg = props.bgColor || (props.disabled ? '#f0f0f0' : '#ffffff');
  const mainColor = props.disabled ? '#c0c4cc' : props.color || '#303133';
  const accent = props.disabled ? '#c0c4cc' : props.type === 'primary' ? '#2979ff' : '#fa3534';
  const notch = props.shape === 'circle' || props.circle ? config.radius : config.radius;

  return (
    <Pressable
      disabled={props.disabled}
      onPress={() => {
        if (props.disabled) return;
        input.onClick?.();
        input.onSourceClick?.();
      }}
      style={[
        {
          alignItems: 'center',
          backgroundColor: bg,
          borderRadius: config.radius,
          flexDirection: 'row',
          height: config.height,
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
        },
        input.customStyle,
      ]}
      testID="up-coupon"
    >
      <Notch color={bg} side="left" size={notch} />
      <Notch color={bg} side="right" size={notch} />
      <View
        style={{
          alignItems: 'center',
          borderRightColor: '#ebedf0',
          borderRightWidth: props.disabled ? 0 : 1,
          flex: 1,
          height: '100%',
          justifyContent: 'center',
        }}
        testID="up-coupon-amount"
      >
        <View style={{ alignItems: 'baseline', flexDirection: 'row' }}>
          {props.unitPosition === 'left' && props.unit ? (
            <Text style={{ color: accent, fontSize: config.amount * 0.55, fontWeight: '600' }}>{props.unit}</Text>
          ) : null}
          <Text style={{ color: accent, fontSize: config.amount, fontWeight: '700' }}>{String(props.amount ?? '')}</Text>
          {props.unitPosition === 'right' && props.unit ? (
            <Text style={{ color: accent, fontSize: config.amount * 0.55, fontWeight: '600' }}>{props.unit}</Text>
          ) : null}
        </View>
        {props.limit ? <Text style={{ color: mainColor, fontSize: 11, marginTop: 4, opacity: 0.7 }}>{props.limit}</Text> : null}
      </View>
      <View style={{ flex: 2, height: '100%', justifyContent: 'center', paddingLeft: 14, paddingRight: 10 }}>
        <Text numberOfLines={1} style={{ color: mainColor, fontSize: config.title, fontWeight: '600' }} testID="up-coupon-title">
          {props.title}
        </Text>
        {props.desc ? (
          <Text numberOfLines={1} style={{ color: mainColor, fontSize: 12, marginTop: 4, opacity: 0.7 }}>
            {props.desc}
          </Text>
        ) : null}
        {props.time ? (
          <Text numberOfLines={1} style={{ color: mainColor, fontSize: 11, marginTop: 4, opacity: 0.6 }}>
            {props.time}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingRight: 12 }}>
        <View
          style={{
            backgroundColor: accent,
            borderRadius: 14,
            opacity: props.disabled ? 0.5 : 1,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
          testID="up-coupon-action"
        >
          <Text style={{ color: '#ffffff', fontSize: 12 }}>{props.actionText}</Text>
        </View>
      </View>
    </Pressable>
  );
}
