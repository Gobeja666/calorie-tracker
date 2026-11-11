import { useState } from 'react';
import { View, Text, TextInput, Switch, Pressable, Platform, StyleSheet } from 'react-native';
import { useNotifSettings } from './NotificationsContext';
import { ensurePermission, parseTime, NotifSettings } from './notifications';
import { t } from './strings';

function Toggle({
  label, value, onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#3b82f6' }} />
    </View>
  );
}

function TimeRow({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const invalid = parseTime(value) === null;
  return (
    <View style={styles.row}>
      <Text style={styles.sub}>{label}</Text>
      <TextInput
        style={[styles.time, invalid && { borderColor: '#e5484d' }]}
        placeholder={t.notifications.timePlaceholder}
        value={value}
        onChangeText={onChange}
        maxLength={5}
      />
    </View>
  );
}

export default function NotificationsCard() {
  const { settings, update } = useNotifSettings();
  const [denied, setDenied] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t.notifications.title}</Text>
        <Text style={styles.sub}>{t.notifications.webOnly}</Text>
      </View>
    );
  }

  // Turning a switch on asks for permission first
  async function toggle(key: keyof NotifSettings, value: boolean) {
    if (value) {
      const ok = await ensurePermission();
      setDenied(!ok);
      if (!ok) return;
    }
    update({ [key]: value } as Partial<NotifSettings>);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.notifications.title}</Text>
      {denied && <Text style={styles.error}>{t.notifications.denied}</Text>}

      <Toggle
        label={t.notifications.fastGoal}
        value={settings.fastGoal}
        onChange={(v) => toggle('fastGoal', v)}
      />
      <Toggle
        label={t.notifications.fastOneHour}
        value={settings.fastOneHour}
        onChange={(v) => toggle('fastOneHour', v)}
      />

      <Toggle
        label={t.notifications.meals}
        value={settings.meals}
        onChange={(v) => toggle('meals', v)}
      />
      {settings.meals && (
        <View style={styles.indent}>
          <TimeRow
            label={t.mealNames.Breakfast}
            value={settings.breakfast}
            onChange={(v) => update({ breakfast: v })}
          />
          <TimeRow
            label={t.mealNames.Lunch}
            value={settings.lunch}
            onChange={(v) => update({ lunch: v })}
          />
          <TimeRow
            label={t.mealNames.Dinner}
            value={settings.dinner}
            onChange={(v) => update({ dinner: v })}
          />
        </View>
      )}

      <Toggle
        label={t.notifications.weight}
        value={settings.weight}
        onChange={(v) => toggle('weight', v)}
      />
      {settings.weight && (
        <View style={styles.indent}>
          <View style={styles.chips}>
            {t.days.weekdays.map((d, i) => {
              const active = settings.weightDay === i + 1;
              return (
                <Pressable
                  key={d}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => update({ weightDay: i + 1 })}
                >
                  <Text style={[styles.chipText, active && { color: '#fff' }]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>
          <TimeRow
            label={t.notifications.day}
            value={settings.weightTime}
            onChange={(v) => update({ weightTime: v })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 10 },
  title: { fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: '600', flexShrink: 1 },
  sub: { color: '#666' },
  indent: { gap: 8, paddingLeft: 8 },
  time: {
    width: 80,
    textAlign: 'center',
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e6',
  },
  chipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipText: { fontWeight: '600', color: '#333', fontSize: 12 },
  error: { color: '#e5484d' },
});