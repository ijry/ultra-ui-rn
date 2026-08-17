import React, { useEffect, useMemo, useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { UPSwipeActionContext, type UPSwipeActionItemHandle } from './context';

export type UPSwipeActionProps = {
  autoClose?: boolean;
  opendItem?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
  children?: React.ReactNode;
  onUpdateOpendItem?: (open: boolean) => void;
};

export function UPSwipeAction(input: UPSwipeActionProps): React.JSX.Element {
  const props = { ...useUPConfig().props.swipeAction, ...input } as UPSwipeActionProps;
  const items = useRef(new Set<UPSwipeActionItemHandle>());
  const openItems = useRef(new Set<UPSwipeActionItemHandle>());
  const previousOpendItem = useRef(input.opendItem);

  const context = useMemo(() => ({
    closeAll: () => items.current.forEach((item) => item.close()),
    notifyClose: (item: UPSwipeActionItemHandle) => {
      openItems.current.delete(item);
      if (openItems.current.size === 0) input.onUpdateOpendItem?.(false);
    },
    notifyOpen: (current: UPSwipeActionItemHandle) => {
      if (props.autoClose) {
        items.current.forEach((item) => {
          if (item !== current) item.close();
        });
      }
      openItems.current.add(current);
      input.onUpdateOpendItem?.(true);
    },
    register: (item: UPSwipeActionItemHandle) => {
      items.current.add(item);
      return () => {
        items.current.delete(item);
        openItems.current.delete(item);
      };
    },
  }), [input.onUpdateOpendItem, props.autoClose]);

  useEffect(() => {
    if (input.opendItem === false && previousOpendItem.current !== false) context.closeAll();
    previousOpendItem.current = input.opendItem;
  }, [context, input.opendItem]);

  return (
    <UPSwipeActionContext.Provider value={context}>
      <View style={input.customStyle} testID="up-swipe-action">{input.children}</View>
    </UPSwipeActionContext.Provider>
  );
}
