import { createContext, useContext } from 'react';

export type UPListAnchorContextValue = {
  registerAnchor: (anchor: string | number, y: number) => void;
};

export const UPListAnchorContext = createContext<UPListAnchorContextValue | null>(null);

export function useUPListAnchorContext(): UPListAnchorContextValue | null {
  return useContext(UPListAnchorContext);
}
