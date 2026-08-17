import { useSyncExternalStore } from 'react';
import { getUPConfig, subscribeUPConfig, type UPConfigState } from './store';

export function useUPConfig(): Readonly<UPConfigState> {
  return useSyncExternalStore(subscribeUPConfig, getUPConfig, getUPConfig);
}
