import { createContext, useContext } from 'react';

export type UPChoiceName = string | number | boolean;
export type UPChoiceContext = {
  activeColor: string;
  borderBottom: boolean;
  disabled: boolean;
  iconColor: string;
  iconPlacement: 'left' | 'right';
  iconSize: number;
  inactiveColor: string;
  labelColor: string;
  labelDisabled: boolean;
  labelSize: number;
  placement: 'row' | 'column';
  shape: 'circle' | 'square';
  size: number;
};
export type UPCheckboxContextValue = UPChoiceContext & { value: readonly UPChoiceName[]; onChange: (value: UPChoiceName[]) => void };
export type UPRadioContextValue = UPChoiceContext & { value: UPChoiceName; onChange: (value: UPChoiceName) => void };
export const UPCheckboxContext = createContext<UPCheckboxContextValue | null>(null);
export const UPRadioContext = createContext<UPRadioContextValue | null>(null);
export const useUPCheckboxContext = (): UPCheckboxContextValue | null => useContext(UPCheckboxContext);
export const useUPRadioContext = (): UPRadioContextValue | null => useContext(UPRadioContext);
