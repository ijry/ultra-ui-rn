import { createContext, useContext } from 'react';

export type UPSwipeActionItemHandle = {
  close: () => void;
};

export type UPSwipeActionContextValue = {
  closeAll: () => void;
  notifyClose: (item: UPSwipeActionItemHandle) => void;
  notifyOpen: (item: UPSwipeActionItemHandle) => void;
  register: (item: UPSwipeActionItemHandle) => () => void;
};

export const UPSwipeActionContext = createContext<UPSwipeActionContextValue | null>(null);

export function useUPSwipeActionContext(): UPSwipeActionContextValue | null {
  return useContext(UPSwipeActionContext);
}
