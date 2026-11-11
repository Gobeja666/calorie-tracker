import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export function usePersistentState<T>(key: string, initial: T, cloud = false) {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;

  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const [synced, setSynced] = useState(false);

  // 1. Load the local copy once
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw !== null) setValue(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [key]);

  // 2. Cloud: load on login, reset on logout
  useEffect(() => {
    if (!cloud || !loaded || authLoading) return;
    if (!userId) {
      setValue(initial);
      setSynced(false);
      return;
    }
    supabase
      .from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Cloud load failed:', error.message);
          return;
        }
        // No cloud copy yet: keep the local data and upload it below
        if (data) setValue(data.value as T);
        setSynced(true);
      });
  }, [cloud, loaded, authLoading, userId, key]);

  // 3. Save locally, and to the cloud once synced
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

    if (!cloud || !synced || !userId) return;
    const timer = setTimeout(() => {
      supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          key,
          value,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn('Cloud save failed:', error.message);
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [key, value, loaded, cloud, synced, userId]);

  return [value, setValue] as const;
}