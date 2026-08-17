import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, range, type UPDimension } from '../../utils';
import { UPAvatar } from '../avatar';

export type UPAvatarGroupItem = string | { url?: string; [key: string]: unknown };

export type UPAvatarGroupProps = {
  urls?: readonly UPAvatarGroupItem[];
  maxCount?: UPDimension;
  shape?: 'circle' | 'square';
  mode?: string;
  showMore?: boolean;
  size?: UPDimension;
  keyName?: string;
  gap?: number;
  extraValue?: number | string;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onShowMore?: () => void;
};

function sourceFor(item: UPAvatarGroupItem, keyName: string): string {
  if (typeof item === 'string') {
    return item;
  }
  const keyed = keyName ? item[keyName] : undefined;
  return typeof keyed === 'string' ? keyed : typeof item.url === 'string' ? item.url : '';
}

export function UPAvatarGroup(input: UPAvatarGroupProps): React.JSX.Element {
  const props = { ...useUPConfig().props.avatarGroup, ...input } as UPAvatarGroupProps;
  const urls = props.urls ?? [];
  const maxCount = Math.max(0, Math.floor(getPx(props.maxCount ?? 5)));
  const visibleUrls = urls.slice(0, maxCount);
  const size = getPx(props.size ?? 40);
  const gap = range(0, 1, Number(props.gap ?? 0.5));
  const extraValue = Number(props.extraValue ?? 0);
  const hiddenCount = extraValue || Math.max(0, urls.length - visibleUrls.length);

  return (
    <View style={[{ alignItems: 'center', flexDirection: 'row' }, input.customStyle]} testID="up-avatar-group">
      {visibleUrls.map((item, index) => {
        const isMore = Boolean(props.showMore && index === visibleUrls.length - 1 && hiddenCount > 0);
        return (
          <View key={`${sourceFor(item, props.keyName ?? '')}-${index}`} style={{ marginLeft: index ? -size * gap : 0, position: 'relative' }}>
            <UPAvatar mode={props.mode} shape={props.shape} size={size} src={sourceFor(item, props.keyName ?? '')} />
            {isMore ? (
              <Pressable
                accessibilityLabel={`Show ${hiddenCount} more avatars`}
                accessibilityRole="button"
                onPress={input.onShowMore}
                style={{ alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: props.shape === 'circle' ? 100 : 4, bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 }}
                testID="up-avatar-group-more"
              >
                <Text style={{ color: '#ffffff', fontSize: size * 0.4 }}>+{hiddenCount}</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
