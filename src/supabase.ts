import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// During web server rendering there is no `window`, so skip storage there
const isServer = typeof window === 'undefined';

const serverStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: isServer ? serverStorage : AsyncStorage,
      autoRefreshToken: !isServer,
      persistSession: !isServer,
      detectSessionInUrl: false,
    },
  }
);