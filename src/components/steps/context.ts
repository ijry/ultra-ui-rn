import { createContext, useContext } from 'react';

export type UPStepsContextValue = {
  activeColor: string;
  activeIcon: string;
  current: number;
  direction: 'row' | 'column';
  dot: boolean;
  inactiveColor: string;
  inactiveIcon: string;
  length: number;
};

export const UPStepsContext = createContext<UPStepsContextValue | null>(null);

export function useUPStepsContext(): UPStepsContextValue | null {
  return useContext(UPStepsContext);
}
