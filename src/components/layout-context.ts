import { createContext, useContext } from 'react';

export type UPRowContextValue = {
  gutter: number;
};

export type UPGridContextValue = {
  border: boolean;
  col: number;
  count: number;
  onItemClick?: (name: string | number) => void;
};

export const UPRowContext = createContext<UPRowContextValue>({ gutter: 0 });
export const UPGridContext = createContext<UPGridContextValue | null>(null);

export function useUPRowContext(): UPRowContextValue {
  return useContext(UPRowContext);
}

export function useUPGridContext(): UPGridContextValue | null {
  return useContext(UPGridContext);
}
