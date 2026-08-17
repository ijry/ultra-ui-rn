import { createContext, useContext } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type UPTableContextValue = {
  align: 'left' | 'center' | 'right';
  bgColor: string;
  borderColor: string;
  color: string;
  fontSize: number;
  paddingHorizontal: number;
  paddingVertical: number;
  thStyle: StyleProp<ViewStyle | TextStyle>;
};

export const UPTableContext = createContext<UPTableContextValue | null>(null);

export function useUPTableContext(): UPTableContextValue | null {
  return useContext(UPTableContext);
}
