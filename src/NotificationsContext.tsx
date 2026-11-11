import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';
import { useAuth } from './AuthContext';
import { NotifSettings, NOTIF_DEFAULTS, syncReminders, cancelAll } from './notifications';

type Ctx = {
  settings: NotifSettings;
  update: (patch: Partial<NotifSettings>) => void;
};

const NotifContext = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = usePersistentState<Partial<NotifSettings>>(
    'notifSettings',
    NOTIF_DEFAULTS
  );
  const settings: NotifSettings = { ...NOTIF_DEFAULTS, ...stored };

  function update(patch: Partial<NotifSettings>) {
    setStored((prev) => ({ ...NOTIF_DEFAULTS, ...prev, ...patch }));
  }

  return (
    <NotifContext.Provider value={{ settings, update }}>{children}</NotifContext.Provider>
  );
}

export function useNotifSettings() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotifSettings must be used inside NotificationsProvider');
  return ctx;
}

// Keeps the scheduled meal/weight reminders in line with the settings
export function NotificationManager() {
  const { session, loading } = useAuth();
  const { settings } = useNotifSettings();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      cancelAll();
      return;
    }
    syncReminders(settings);
  }, [loading, session?.user.id, JSON.stringify(settings)]);

  return null;
}