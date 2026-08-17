export type UPStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

const memory = new Map<string, string>();

const memoryStorage: UPStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, value);
  },
  removeItem: (key) => {
    memory.delete(key);
  },
};

let current: UPStorage = memoryStorage;

/** Register an AsyncStorage-compatible implementation for reader persistence.
 *  React Native has no built-in storage, so callers own the provider
 *  (e.g. @react-native-async-storage/async-storage). Defaults to in-memory. */
export function setUPNovelStorage(storage: UPStorage): void {
  current = storage;
}

export function getUPNovelStorage(): UPStorage {
  return current;
}

export function resetUPNovelStorage(): void {
  current = memoryStorage;
}
