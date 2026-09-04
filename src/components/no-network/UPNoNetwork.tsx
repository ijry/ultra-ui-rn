import React, { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
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
  // Callbacks and styles live in a ref so the effect can depend on the values
  // that actually change the overlay. Listing `input` re-ran this on every
  // parent render — re-firing onConnected/onDisconnected and re-adding the
  // overlay — and looped forever if a handler set parent state.
  const latest = useRef(input);
  latest.current = input;
  // Styles do change what the overlay renders, so they stay real dependencies —
  // flattened to primitives so a fresh inline object is not mistaken for a change.
  const customStyle = StyleSheet.flatten(input.customStyle);
  const imageStyle = StyleSheet.flatten(input.imageStyle);
  const styleKey = JSON.stringify([customStyle, imageStyle]);

  useEffect(() => {
    if (connected === undefined) return undefined;
    const cb = latest.current;
    if (connected) {
      cb.onConnected?.();
      overlay.remove('up-no-network');
      return undefined;
    }
    cb.onDisconnected?.();
    overlay.add({
      id: 'up-no-network',
      node: (
        <UPOverlay
          customStyle={{ alignItems: 'center', backgroundColor: '#ffffff', justifyContent: 'center' }}
          show
          testID="up-no-network-overlay"
          zIndex={zIndex}
        >
          <View style={[{ alignItems: 'center', marginTop: -100 }, customStyle]} testID="up-no-network">
            {isImage(props.image ?? '') ? (
              <Image source={{ uri: props.image }} style={[{ height: 150, width: 150 }, imageStyle]} testID="up-no-network-image" />
            ) : (
              <UPIcon color="#909399" name={props.image || 'wifi-off'} size={150} />
            )}
            <Text style={{ color: '#909399', fontSize: 14, marginTop: 15 }}>{props.tips}</Text>
            <Pressable
              accessibilityRole="button"
              // Routed through the ref: the node is built once per overlay add,
              // so reading `input.onRetry` here would freeze the first render's
              // closure.
              onPress={() => latest.current.onRetry?.()}
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
  }, [config.color.primary, connected, overlay, props.image, props.tips, styleKey, zIndex]);

  return null;
}
