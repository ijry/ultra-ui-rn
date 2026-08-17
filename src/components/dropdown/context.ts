import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type UPDropdownRegistration = {
  id: string;
  index: number;
  title: string | number;
  disabled: boolean;
  closeOnClickOverlay: boolean;
  node: ReactNode;
};

export type UPDropdownContextValue = {
  activeColor: string;
  inactiveColor: string;
  activeIndex: number | null;
  close: () => void;
  register: (entry: UPDropdownRegistration) => () => void;
};

export const UPDropdownContext = createContext<UPDropdownContextValue | null>(null);

export function useUPDropdownContext(): UPDropdownContextValue | null {
  return useContext(UPDropdownContext);
}
