import { createContext, useContext } from 'react';

export type UPTabbarName = string | number;
export type UPTabbarStyleType =
  | 'default'
  | 'minimal'
  | 'underline'
  | 'dot'
  | 'pill'
  | 'card'
  | 'glow'
  | 'lift'
  | 'convex'
  | string;
export type UPTabbarAnimationType = 'none' | 'scale' | 'lift' | 'swing' | 'pulse' | string;

export type UPTabbarContextValue = {
  value: UPTabbarName | null;
  activeColor: string;
  inactiveColor: string;
  styleType: UPTabbarStyleType;
  animationType: UPTabbarAnimationType;
  activeBackgroundColor: string;
  inactiveBackgroundColor: string;
  itemShape: string;
  iconScale: number;
  textMode: string;
  select: (name: UPTabbarName) => void;
};

export const UPTabbarContext = createContext<UPTabbarContextValue | null>(null);

export function useUPTabbarContext(): UPTabbarContextValue | null {
  return useContext(UPTabbarContext);
}
