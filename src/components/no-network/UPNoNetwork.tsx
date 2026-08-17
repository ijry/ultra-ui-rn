import React, { useEffect } from 'react';
import { Image, Pressable, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx } from '../../utils';
import { useUPOverlay } from '../../overlay';
import { UPIcon } from '../icon';
import { UPOverlay } from '../overlay';

export type UPNoNetworkProps = {
  tips?: string;
  zIndex?: number | string;
  image?: string;
  /** React Native adapter: provide current reachability from the application. */
  connected?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  onRetry?: () => void;
  onDisconnected?: () => void;
  onConnected?: () => void;
};

function isImage(value: string): boolean {
  return /^(https?:|file:|data:|\/)/i.test(value);
}

export function UPNoNetwork(input: UPNoNetworkProps): null {
  const config = useUPConfig();
  const props = { ...config.props.noNetwork, ...input } as UPNoNetworkProps;
  const overlay = useUPOverlay();
  const connected = input.connected;
  const zIndex = props.zIndex === '' || props.zIndex === undefined
    ? config.zIndex.noNetwork
    : getPx(props.zIndex);

  useEffect(() => {
    if (connected === undefined) return undefined;
    if (connected) {
      input.onConnected?.();
      overlay.remove('up-no-network');
      return undefined;
    }
    input.onDisconnected?.();
    overlay.add({
      id: 'up-no-network',
      node: (
        <UPOverlay
          customStyle={{ alignItems: 'center', backgroundColor: '#ffffff', justifyContent: 'center' }}
          show
          testID="up-no-network-overlay"
          zIndex={zIndex}
        >
          <View style={[{ alignItems: 'center', marginTop: -100 }, input.customStyle]} testID="up-no-network">
            {isImage(props.image ?? '') ? (
              <Image source={{ uri: props.image }} style={[{ height: 150, width: 150 }, input.imageStyle]} testID="up-no-network-image" />
            ) : (
              <UPIcon color="#909399" name={props.image || 'wifi-off'} size={150} />
            )}
            <Text style={{ color: '#909399', fontSize: 14, marginTop: 15 }}>{props.tips}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={input.onRetry}
              style={{ borderColor: config.color.primary, borderRadius: 3, borderWidth: 1, marginTop: 15, minWidth: 50, paddingHorizontal: 8, paddingVertical: 4 }}
              testID="up-no-network-retry"
            >
              <Text style={{ color: config.color.primary, fontSize: 10 }}>重试</Text>
            </Pressable>
          </View>
        </UPOverlay>
      ),
      zIndex,
    });
    return () => overlay.remove('up-no-network');
  }, [config.color.primary, connected, input, overlay, props.image, props.tips, zIndex]);

  return null;
}
