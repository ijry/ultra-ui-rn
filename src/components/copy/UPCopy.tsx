import React, { useRef, useState } from 'react';
import { Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { toast } from '../../feedback';
import { UPModal } from '../modal';

export type UPCopyWriteText = (content: string) => void | Promise<void>;

export type UPCopyProps = {
  content?: string | number;
  alertStyle?: string;
  notice?: string;
  children?: React.ReactNode;
  /** React Native adapter supplied by the application clipboard integration. */
  writeText?: UPCopyWriteText;
  onSuccess?: () => void;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

/** Movement and duration past which a touch is a scroll, not a tap. */
const TAP_SLOP = 12;
const TAP_MS = 600;

export function UPCopy(input: UPCopyProps): React.JSX.Element {
  const props = { ...useUPConfig().props.copy, ...input } as UPCopyProps;
  const [showModal, setShowModal] = useState(false);
  // Upstream hangs `@tap` on the wrapper and lets a nested button's tap bubble up
  // (copy.nvue:12-14). RN hands the gesture to the innermost pressable instead, so
  // a nested `UPButton` — itself a Pressable — swallowed the press and the wrapper
  // never fired. Raw touch events still reach an ancestor when a descendant is the
  // responder, so the wrapper watches those as well. `pressedIn` records whether
  // our own Pressable claimed the gesture; if it did, `onPress` handles the copy
  // and the touch path stands down, so one tap can never copy twice.
  const gesture = useRef({ at: 0, pressedIn: false, x: 0, y: 0 });

  const handlePress = async () => {
    const content = props.content;
    if (content === '' || content === null || content === undefined) {
      toast.default('暂无');
      return;
    }
    if (!input.writeText) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('UPCopy requires a writeText adapter to copy content.');
      }
      toast.default('复制失败');
      return;
    }
    try {
      await Promise.resolve(input.writeText(String(content)));
      input.onSuccess?.();
      if (props.alertStyle === 'modal') setShowModal(true);
      else toast.default(props.notice ?? '');
    } catch {
      toast.default('复制失败');
    }
  };

  const onTouchStart = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    gesture.current = { at: Date.now(), pressedIn: false, x: pageX, y: pageY };
  };

  const onTouchEnd = (event: GestureResponderEvent) => {
    const state = gesture.current;
    if (state.pressedIn) return;
    if (Date.now() - state.at > TAP_MS) return;
    const { pageX, pageY } = event.nativeEvent;
    if (Math.abs(pageX - state.x) > TAP_SLOP || Math.abs(pageY - state.y) > TAP_SLOP) return;
    void handlePress();
  };

  return (
    <>
      <View
        onTouchEnd={onTouchEnd}
        onTouchStart={onTouchStart}
        testID="up-copy-bubble"
      >
        <Pressable
          accessibilityRole="button"
          onPress={handlePress}
          onPressIn={() => {
            gesture.current.pressedIn = true;
          }}
          testID="up-copy"
        >
          {input.children ?? <Text testID="up-copy-default-label">复制</Text>}
        </Pressable>
      </View>
      <UPModal
        content={props.notice}
        onChangeShow={setShowModal}
        show={showModal}
        title="up.common.tip"
      />
    </>
  );
}
