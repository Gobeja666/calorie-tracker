import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { t } from './strings';

const isWeb = Platform.OS === 'web';
const HOUR = 3600000;

export type NotifSettings = {
  fastGoal: boolean;
  fastOneHour: boolean;
  meals: boolean;
  breakfast: string; // "08:00"
  lunch: string;
  dinner: string;
  weight: boolean;
  weightDay: number; // 1 = Sunday ... 7 = Saturday
  weightTime: string;
};

export const NOTIF_DEFAULTS: NotifSettings = {
  fastGoal: false,
  fastOneHour: false,
  meals: false,
  breakfast: '08:00',
  lunch: '13:00',
  dinner: '19:00',
  weight: false,
  weightDay: 2,
  weightTime: '08:00',
};

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function parseTime(s: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}

export async function ensurePermission(): Promise<boolean> {
  if (isWeb) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function hasPermission() {
  if (isWeb) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

export async function cancelAll() {
  if (isWeb) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Fasting alerts (fixed ids, so scheduling again replaces the old ones)
export async function syncFastNotifications(
  activeStart: number | null,
  goalHours: number,
  goalOn: boolean,
  hourOn: boolean
) {
  if (isWeb) return;
  await Notifications.cancelScheduledNotificationAsync('fast-goal');
  await Notifications.cancelScheduledNotificationAsync('fast-1h');
  if (activeStart === null || !(await hasPermission())) return;

  const end = activeStart + goalHours * HOUR;
  const now = Date.now();

  if (goalOn && end > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: 'fast-goal',
      content: { title: t.notifications.fastGoalTitle, body: t.notifications.fastGoalBody },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(end),
        channelId: 'default',
      },
    });
  }
  if (hourOn && end - HOUR > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: 'fast-1h',
      content: { title: t.notifications.fastHourTitle, body: t.notifications.fastHourBody },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(end - HOUR),
        channelId: 'default',
      },
    });
  }
}

// Meal and weight reminders
export async function syncReminders(s: NotifSettings) {
  if (isWeb) return;
  const ids = ['meal-Breakfast', 'meal-Lunch', 'meal-Dinner', 'weight'];
  for (const id of ids) await Notifications.cancelScheduledNotificationAsync(id);
  if (!(await hasPermission())) return;

  if (s.meals) {
    const meals: [string, string][] = [
      ['Breakfast', s.breakfast],
      ['Lunch', s.lunch],
      ['Dinner', s.dinner],
    ];
    for (const [name, time] of meals) {
      const p = parseTime(time);
      if (!p) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: `meal-${name}`,
        content: { title: t.notifications.mealTitle, body: t.notifications.mealBody[name] },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: p.hour,
          minute: p.minute,
          channelId: 'default',
        },
      });
    }
  }

  if (s.weight) {
    const p = parseTime(s.weightTime);
    if (p) {
      await Notifications.scheduleNotificationAsync({
        identifier: 'weight',
        content: { title: t.notifications.weightTitle, body: t.notifications.weightBody },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: s.weightDay,
          hour: p.hour,
          minute: p.minute,
          channelId: 'default',
        },
      });
    }
  }
}