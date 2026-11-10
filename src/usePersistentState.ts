import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  // Load saved data once when the app starts
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw !== null) setValue(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [key]);

  // Save every time the value changes (only after loading finished)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value, loaded]);

  return [value, setValue] as const;
}