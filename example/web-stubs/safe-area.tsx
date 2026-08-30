import React, { createContext, useContext } from 'react';

const InsetsContext = createContext({ top: 0, bottom: 0, left: 0, right: 0 });

export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  return <InsetsContext.Provider value={{ top: 0, bottom: 0, left: 0, right: 0 }}>{children}</InsetsContext.Provider>;
}

export function useSafeAreaInsets() {
  return useContext(InsetsContext);
}

export function useSafeAreaFrame() {
  // Use globalThis for cross-platform compatibility
  const win = typeof globalThis !== 'undefined' && (globalThis as any).window;
  return { 
    x: 0, 
    y: 0, 
    width: win ? win.innerWidth : 375, 
    height: win ? win.innerHeight : 812 
  };
}

export function SafeAreaView({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}
