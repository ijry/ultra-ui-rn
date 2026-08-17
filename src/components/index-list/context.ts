import { createContext, useContext } from 'react';

export type UPIndexListContextValue = {
  activeKey: string | null;
  itemMargin: number;
  registerItem: (key: string, y: number) => void;
  sticky: boolean;
  unregisterItem: (key: string) => void;
};

export type UPIndexItemContextValue = {
  setAnchorKey: (key: string) => void;
};

export const UPIndexListContext = createContext<UPIndexListContextValue | null>(null);
export const UPIndexItemContext = createContext<UPIndexItemContextValue | null>(null);

export function useUPIndexListContext(): UPIndexListContextValue | null {
  return useContext(UPIndexListContext);
}

export function useUPIndexItemContext(): UPIndexItemContextValue | null {
  return useContext(UPIndexItemContext);
}
