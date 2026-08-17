import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { PropsWithChildren } from 'react';
import { UPThemeProvider, type UPThemeProviderProps } from '../theme';
import { OverlayProvider } from './OverlayProvider';
import { UPFeedbackHost } from '../feedback';

export type UPRootProps = PropsWithChildren<
  Pick<UPThemeProviderProps, 'colors' | 'mode'>
>;

export function UPRoot({
  children,
  colors,
  mode,
}: UPRootProps): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UPThemeProvider colors={colors} mode={mode}>
          <OverlayProvider>
            {children}
            <UPFeedbackHost />
          </OverlayProvider>
        </UPThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
