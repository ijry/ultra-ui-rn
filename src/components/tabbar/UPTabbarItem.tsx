import React from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPBadge } from '../badge';
import { UPIcon } from '../icon';
import { type UPTabbarName, useUPTabbarContext } from './context';

export type UPTabbarItemProps = {
  name?: UPTabbarName | null;
  icon?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  badge?: string | number | null;
  dot?: boolean;
  text?: string;
  badgeStyle?: StyleProp<ViewStyle> | string;
  mode?: 'midButton' | string;
  /** @deprecated React Native has no CSS class runtime. */
  activeClass?: string;
  /** @deprecated React Native has no CSS class runtime. */
  inactiveClass?: string;
  midButtonBgColor?: string;
  midButtonIconColor?: string;
  midButtonIconSize?: UPDimension;
  /** @deprecated React Native cannot parse CSS shadow strings. */
  midButtonBoxShadow?: string;
  /** @deprecated React Native cannot parse CSS shadow strings. */
  midButtonInnerBoxShadow?: string;
  midButtonOffsetY?: UPDimension;
  activeIconNode?: React.ReactNode;
  inactiveIconNode?: React.ReactNode;
  textNode?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  itemIndex?: number;
  onClick?: (name: UPTabbarName) => void;
};

function itemRadius(styleType: string, itemShape: string): number {
  if (itemShape === 'round') return 999;
  if (itemShape === 'square') return 8;
  if (styleType === 'pill' || styleType === 'glow') return 24;
  if (styleType === 'card') return 12;
  if (styleType === 'convex') return 18;
  return 0;
}

function activeIconTransform(
  animationType: string,
  active: boolean,
  scale: number,
): ViewStyle['transform'] {
  if (!active) return undefined;
  if (animationType === 'lift') return [{ translateY: -4 }, { scale }];
  if (animationType === 'swing') return [{ rotate: '-10deg' }, { scale }];
  if (animationType === 'scale' || animationType === 'pulse') return [{ scale }];
  return undefined;
}

function isBadgeVisible(badge: string | number | null, dot: boolean): boolean {
  if (dot) return true;
  if (typeof badge === 'string') return badge !== '';
  return typeof badge === 'number' && badge !== 0;
}

function sourceEqual(left: UPTabbarName | null, right: UPTabbarName): boolean {
  return left == right;
}

export function UPTabbarItem(input: UPTabbarItemProps): React.JSX.Element {
  const props = { ...useUPConfig().props.tabbarItem, ...input } as UPTabbarItemProps;
  const context = useUPTabbarContext();
  const itemIndex = input.itemIndex ?? 0;
  const name = props.name === null || props.name === undefined || props.name === ''
    ? itemIndex
    : props.name;
  const active = context ? sourceEqual(context.value, name) : false;
  const activeIconNode = active ? props.activeIconNode : props.inactiveIconNode;
  const iconName = active
    ? props.activeIcon || props.icon
    : props.inactiveIcon || props.icon;
  const iconColor = props.mode === 'midButton'
    ? props.midButtonIconColor || '#3c9cff'
    : active
      ? context?.activeColor || '#1989fa'
      : context?.inactiveColor || '#7d7e80';
  const iconContent = activeIconNode ?? (iconName ? (
    <UPIcon
      color={iconColor}
      name={iconName}
      size={props.mode === 'midButton' ? props.midButtonIconSize : 22}
    />
  ) : null);
  const fallbackText = props.text ? (
    <Text
      style={{
        color: active ? context?.activeColor || '#1989fa' : context?.inactiveColor || '#7d7e80',
        fontSize: 12,
        marginTop: 2,
        opacity: !active && context?.textMode === 'active' ? 0.68 : 1,
        transform: !active && context?.textMode === 'active' ? [{ scale: 0.94 }] : undefined,
      }}
      testID={`up-tabbar-text-${itemIndex}`}
    >
      {props.text}
    </Text>
  ) : null;

  if (!context) {
    return (
      <View style={input.customStyle}>
        {input.activeIconNode ?? input.inactiveIconNode}
        {input.textNode ?? fallbackText}
      </View>
    );
  }

  const badgeVisible = isBadgeVisible(props.badge ?? null, Boolean(props.dot));
  const badgeStyle = typeof props.badgeStyle === 'object' && props.badgeStyle !== null
    ? props.badgeStyle as StyleProp<TextStyle>
    : undefined;
  const icon = (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: activeIconTransform(context.animationType, active, context.iconScale),
      }}
      testID={`up-tabbar-icon-${itemIndex}`}
    >
      {iconContent}
    </View>
  );
  const badge = badgeVisible ? (
    <View
      style={{ position: 'absolute', right: -8, top: -5 }}
      testID={`up-tabbar-badge-${itemIndex}`}
    >
      <UPBadge
        absolute
        customStyle={badgeStyle}
        isDot={Boolean(props.dot)}
        show
        value={props.dot ? 1 : props.badge ?? 0}
      />
    </View>
  ) : null;
  const iconWithBadge = (
    <View style={{ position: 'relative' }}>
      {icon}
      {badge}
    </View>
  );
  const midButton = props.mode === 'midButton' ? (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: active ? context.activeColor : '#e0f2fe',
        borderRadius: 32,
        height: 64,
        justifyContent: 'center',
        transform: [{ translateY: getPx(props.midButtonOffsetY ?? -10) }],
        width: 64,
      }}
      testID={`up-tabbar-mid-button-${itemIndex}`}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: props.midButtonBgColor || '#ffffff',
          borderRadius: 26,
          height: 52,
          justifyContent: 'center',
          width: 52,
        }}
      >
        {iconWithBadge}
      </View>
    </View>
  ) : iconWithBadge;
  const variantBackground = active
    ? context.activeBackgroundColor || (context.styleType === 'glow' ? 'rgba(125, 211, 252, 0.12)' : 'transparent')
    : context.inactiveBackgroundColor || 'transparent';
  const itemStyle: ViewStyle = {
    alignItems: 'center',
    backgroundColor: variantBackground,
    borderRadius: itemRadius(context.styleType, context.itemShape),
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: ['pill', 'glow', 'card', 'convex'].includes(context.styleType) ? 2 : 0,
    minWidth: 0,
    paddingVertical: ['pill', 'glow', 'card', 'convex'].includes(context.styleType) ? 3 : 0,
    position: 'relative',
    transform: active && (context.styleType === 'lift' || context.styleType === 'convex')
      ? [{ translateY: -3 }]
      : undefined,
  };
  const indicator = active && (context.styleType === 'underline' || context.styleType === 'dot') ? (
    <View
      style={{
        backgroundColor: context.activeColor,
        borderRadius: 99,
        bottom: 2,
        height: context.styleType === 'underline' ? 3 : 5,
        position: 'absolute',
        width: context.styleType === 'underline' ? 17 : 5,
      }}
      testID={`up-tabbar-indicator-${itemIndex}`}
    />
  ) : null;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={() => {
        context.select(name);
        input.onClick?.(name);
      }}
      style={[itemStyle, input.customStyle]}
      testID={`up-tabbar-item-${itemIndex}`}
    >
      {midButton}
      {input.textNode ?? fallbackText}
      {indicator}
    </Pressable>
  );
}
