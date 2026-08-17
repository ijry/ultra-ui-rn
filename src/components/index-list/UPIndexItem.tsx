import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useUPIndexListContext, UPIndexItemContext } from './context';

export type UPIndexItemProps = {
  index?: string | number;
  children?: React.ReactNode;
  customStyle?: StyleProp<ViewStyle>;
  /** @deprecated React Native has no CSS class runtime. */
  customClass?: string;
};

export function UPIndexItem(input: UPIndexItemProps): React.JSX.Element {
  const list = useUPIndexListContext();
  const unregisterItem = list?.unregisterItem;
  const [anchorKey, setAnchorKey] = useState('');
  const explicitKey = input.index === undefined || input.index === '' ? '' : String(input.index);
  const key = explicitKey || anchorKey;
  const setAnchor = useCallback((nextKey: string) => setAnchorKey(nextKey), []);
  const itemContext = useMemo(() => ({ setAnchorKey: setAnchor }), [setAnchor]);

  useEffect(() => {
    if (!key) {
      return;
    }
    return () => unregisterItem?.(key);
  }, [key, unregisterItem]);

  const onLayout = (event: LayoutChangeEvent) => {
    if (key) {
      list?.registerItem(key, event.nativeEvent.layout.y);
    }
  };

  return (
    <UPIndexItemContext.Provider value={itemContext}>
      <View
        onLayout={onLayout}
        style={[{ marginBottom: list?.itemMargin ?? 0 }, input.customStyle]}
        testID={key ? `up-index-item-${key}` : 'up-index-item'}
      >
        {input.children}
      </View>
    </UPIndexItemContext.Provider>
  );
}
