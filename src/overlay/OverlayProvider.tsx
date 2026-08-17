import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { PropsWithChildren, ReactNode } from 'react';

export type UPOverlayEntry = {
  id: string;
  zIndex: number;
  node: ReactNode;
};

type StoredEntry = UPOverlayEntry & {
  sequence: number;
};

export type UPOverlayApi = {
  add: (entry: UPOverlayEntry) => void;
  remove: (id: string) => void;
};

const OverlayContext = createContext<UPOverlayApi | null>(null);

export function OverlayProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const sequence = useRef(0);

  const add = useCallback((entry: UPOverlayEntry) => {
    setEntries((current) => [
      ...current.filter((item) => item.id !== entry.id),
      { ...entry, sequence: sequence.current++ },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((current) => current.filter((item) => item.id !== id));
  }, []);

  const api = useMemo<UPOverlayApi>(() => ({ add, remove }), [add, remove]);
  const orderedEntries = [...entries].sort(
    (left, right) => left.zIndex - right.zIndex || left.sequence - right.sequence,
  );

  return (
    <OverlayContext.Provider value={api}>
      {children}
      <View pointerEvents="box-none" style={styles.container}>
        {orderedEntries.map((entry) => (
          <View key={entry.id} style={{ zIndex: entry.zIndex }}>
            {entry.node}
          </View>
        ))}
      </View>
    </OverlayContext.Provider>
  );
}

export function useUPOverlay(): UPOverlayApi {
  const api = useContext(OverlayContext);
  if (!api) {
    throw new Error('useUPOverlay must be used inside UPRoot.');
  }
  return api;
}

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
