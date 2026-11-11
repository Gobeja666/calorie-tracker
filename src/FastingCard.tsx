import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePersistentState } from './usePersistentState';
import { useNotifSettings } from './NotificationsContext';
import { syncFastNotifications } from './notifications';
import { t } from './strings';

type Fast = { start: number; end: number; goalHours: number };
type FastingData = {
  goalHours: number;
  presets?: number[]; // older saved data doesn't have this
  activeStart: number | null;
  history: Fast[];
};

const DEFAULT_PRESETS = [12, 14, 16, 18, 20];
const INITIAL: FastingData = {
  goalHours: 16,
  presets: DEFAULT_PRESETS,
  activeStart: null,
  history: [],
};
const HOUR = 3600000;

const SIZE = 130;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function FastingCard() {
  const [data, setData] = usePersistentState<FastingData>('fasting', INITIAL, true);
  const [now, setNow] = useState(Date.now());
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<string[]>([]);
  const { settings: notif } = useNotifSettings();

  const presets = data.presets ?? DEFAULT_PRESETS;
  const active = data.activeStart !== null;

  // Tick every second while a fast is running
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Keep the phone alerts in line with the running fast
  useEffect(() => {
    syncFastNotifications(
      data.activeStart,
      data.goalHours,
      notif.fastGoal,
      notif.fastOneHour
    );
  }, [data.activeStart, data.goalHours, notif.fastGoal, notif.fastOneHour]);

  const goalMs = data.goalHours * HOUR;
  const elapsed = active ? Math.max(now - data.activeStart!, 0) : 0;
  const progress = active ? Math.min(elapsed / goalMs, 1) : 0;
  const reached = active && elapsed >= goalMs;
  const completed = data.history.filter(
    (f) => f.end - f.start >= f.goalHours * HOUR
  ).length;

  function startFast() {
    setNow(Date.now());
    setData((prev) => ({ ...prev, activeStart: Date.now() }));
  }

  function endFast() {
    setData((prev) => {
      if (prev.activeStart === null) return prev;
      const fast: Fast = {
        start: prev.activeStart,
        end: Date.now(),
        goalHours: prev.goalHours,
      };
      return {
        ...prev,
        activeStart: null,
        history: [...prev.history, fast].slice(-60),
      };
    });
  }

  function setGoal(h: number) {
    setData((prev) => ({ ...prev, goalHours: h }));
  }

  function startEditing() {
    setDrafts(presets.map(String));
    setEditing(true);
  }

  function finishEditing() {
    const newPresets = presets.map((old, i) => {
      const v = parseFloat((drafts[i] ?? '').replace(',', '.'));
      return isNaN(v) || v < 1 || v > 72 ? old : Math.round(v * 10) / 10;
    });
    // If the selected chip was edited, the goal follows its new value
    const selectedIndex = presets.indexOf(data.goalHours);
    setData((prev) => ({
      ...prev,
      presets: newPresets,
      goalHours: selectedIndex >= 0 ? newPresets[selectedIndex] : prev.goalHours,
    }));
    setEditing(false);
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t.fasting.title}</Text>
        <Pressable
          style={styles.editBtn}
          onPress={editing ? finishEditing : startEditing}
        >
          <Text style={styles.editText}>{editing ? t.fasting.done : t.fasting.edit}</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>{t.fasting.subtitle}</Text>

      <View style={styles.chips}>
        {presets.map((h, i) => {
          if (editing) {
            return (
              <View key={i} style={styles.editChip}>
                <TextInput
                  style={styles.editInput}
                  keyboardType="numeric"
                  value={drafts[i] ?? ''}
                  onChangeText={(v) =>
                    setDrafts((prev) => prev.map((d, j) => (j === i ? v : d)))
                  }
                  onSubmitEditing={finishEditing}
                />
                <Text style={styles.editUnit}>{t.fasting.hoursShort}</Text>
              </View>
            );
          }
          const selected = data.goalHours === h;
          return (
            <Pressable
              key={i}
              style={[styles.chip, selected && styles.chipActive]}
              onPress={() => setGoal(h)}
            >
              <Text style={[styles.chipText, selected && { color: '#fff' }]}>
                {h}
                {t.fasting.hoursShort}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.row}>
        <View style={styles.ringWrap}>
          <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#d6e4fb"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={reached ? '#30a46c' : '#3b82f6'}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            />
          </Svg>
          <View style={styles.ringCenter}>
            {active ? (
              <>
                <Text style={styles.big}>{formatDuration(elapsed)}</Text>
                <Text style={styles.small}>
                  {t.fasting.ofGoal} {data.goalHours}
                  {t.fasting.hoursShort}
                </Text>
              </>
            ) : (
              <Text style={styles.small}>{t.fasting.notFasting}</Text>
            )}
          </View>
        </View>

        <View style={styles.info}>
          {active ? (
            <>
              <Text style={styles.infoLabel}>{t.fasting.started}</Text>
              <Text style={styles.infoValue}>{formatTime(data.activeStart!)}</Text>
              <Text style={[styles.infoLabel, { marginTop: 10 }]}>
                {reached ? t.fasting.goalReached : t.fasting.goalAt}
              </Text>
              {!reached && (
                <Text style={styles.infoValue}>
                  {formatTime(data.activeStart! + goalMs)}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.infoLabel}>{t.fasting.completed}</Text>
              <Text style={styles.infoValue}>{completed}</Text>
            </>
          )}
        </View>
      </View>

      <Pressable
        style={[styles.btn, active && styles.btnEnd]}
        onPress={active ? endFast : startFast}
      >
        <Text style={[styles.btnText, active && { color: '#e5484d' }]}>
          {active ? t.fasting.end : t.fasting.start}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef4ff', borderRadius: 16, padding: 18, marginTop: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  editBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editText: { color: '#3b82f6', fontWeight: '700' },
  subtitle: { color: '#777', fontSize: 12, marginTop: 4, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#3b82f6' },
  chipText: { fontWeight: '700', color: '#333' },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 10,
  },
  editInput: {
    width: 40,
    paddingVertical: 6,
    textAlign: 'center',
    fontWeight: '700',
    color: '#333',
  },
  editUnit: { fontWeight: '700', color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center' },
  ringWrap: { width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  big: { fontSize: 20, fontWeight: '800' },
  small: { fontSize: 12, color: '#666' },
  info: { flex: 1, marginLeft: 24 },
  infoLabel: { fontSize: 12, color: '#666' },
  infoValue: { fontSize: 20, fontWeight: '700' },
  btn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  btnEnd: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3c5c7' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});