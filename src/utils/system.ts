import { Dimensions, Platform } from 'react-native';

/**
 * Current platform name (lowercase). RN equivalent of `uni.$u.os`.
 */
export function os(): string {
  return Platform.OS.toLowerCase();
}

/**
 * System information snapshot. RN equivalent of `uni.$u.sys` —
 * a best-effort mapping of the uni-app `getSystemInfoSync` shape.
 */
export function sys(): Record<string, unknown> {
  const window = Dimensions.get('window');
  const screen = Dimensions.get('screen');
  return {
    brand: Platform.constants ? (Platform.constants as { Brand?: string }).Brand ?? '' : '',
    model: (Platform.constants as { model?: string }).model ?? '',
    osName: os(),
    osVersion: Platform.Version,
    platform: os(),
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: window.width,
    windowHeight: window.height,
    statusBarHeight: (Platform.constants as { statusBarHeight?: number }).statusBarHeight ?? 0,
    safeArea: (Platform.constants as { safeAreaInsets?: Record<string, number> }).safeAreaInsets ?? {},
  };
}

/**
 * Window dimensions. RN equivalent of `uni.$u.getWindowInfo`.
 */
export function getWindowInfo(): Record<string, unknown> {
  const window = Dimensions.get('window');
  const screen = Dimensions.get('screen');
  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: window.width,
    windowHeight: window.height,
    statusBarHeight: (Platform.constants as { statusBarHeight?: number }).statusBarHeight ?? 0,
    safeArea: (Platform.constants as { safeAreaInsets?: Record<string, number> }).safeAreaInsets ?? {},
  };
}

/**
 * Device information. RN equivalent of `uni.$u.getDeviceInfo`.
 */
export function getDeviceInfo(): Record<string, unknown> {
  return {
    brand: (Platform.constants as { Brand?: string }).Brand ?? '',
    model: (Platform.constants as { model?: string }).model ?? '',
    osName: os(),
    osVersion: Platform.Version,
    platform: os(),
  };
}

export type UPNavigationStack = {
  getCurrentRoute: () => string | null;
  getCurrentPages: () => readonly unknown[];
};

let navigationStack: UPNavigationStack | null = null;

/**
 * Register a navigation-stack provider so `page()`/`pages()` can report the
 * current route. React Navigation / expo-router users can wire this from their
 * root navigator. Without a provider, `page()` returns `''` and `pages()` `[]`.
 */
export function setUPNavigationStack(provider: UPNavigationStack | null): void {
  navigationStack = provider;
}

/**
 * Current page path. RN boundary for `uni.$u.page` (uni-app `getCurrentPages`).
 */
export function page(): string {
  const current = navigationStack?.getCurrentRoute();
  return current ? `/${current.replace(/^\//, '')}` : '';
}

/**
 * Current navigation stack instances. RN boundary for `uni.$u.pages`.
 */
export function pages(): readonly unknown[] {
  return navigationStack?.getCurrentPages() ?? [];
}
