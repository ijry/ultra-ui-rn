import { createContext, useContext } from 'react';

export type UPCollapseName = string | number;

export type UPCollapseContextValue = {
  accordion: boolean;
  border: boolean;
  selected: readonly UPCollapseName[];
  toggle: (name: UPCollapseName) => void;
};

export const UPCollapseContext = createContext<UPCollapseContextValue | null>(null);

export function useUPCollapseContext(): UPCollapseContextValue | null {
  return useContext(UPCollapseContext);
}
