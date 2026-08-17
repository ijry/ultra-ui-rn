import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import type { PropsWithChildren } from 'react';
import type { UPColorTokens } from '../config/colors';
import { getUPConfig, subscribeUPConfig } from '../config/store';

export type UPThemeMode = 'light' | 'dark';

export type UPThemeValue = {
  colors: UPColorTokens;
  mode: UPThemeMode;
};

const ThemeContext = createContext<UPThemeValue | null>(null);

export type UPThemeProviderProps = PropsWithChildren<{
  colors?: Partial<UPColorTokens>;
  mode?: UPThemeMode;
}>;

export function UPThemeProvider({
  children,
  colors,
  mode = 'light',
}: UPThemeProviderProps): React.JSX.Element {
  const globalConfig = useSyncExternalStore(
    subscribeUPConfig,
    getUPConfig,
    getUPConfig,
  );
  const value = useMemo<UPThemeValue>(
    () => ({ colors: { ...globalConfig.color, ...colors }, mode }),
    [colors, globalConfig.color, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useUPTheme(): UPThemeValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useUPTheme must be used inside UPThemeProvider or UPRoot.');
  }
  return value;
}
