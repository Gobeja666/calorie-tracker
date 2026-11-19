import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView, StyleSheet,
  Text, TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { useProfile } from './ProfileContext';
import { t } from './strings';
import { useWeight } from './WeightContext';
import { usePersistentState } from './usePersistentState';

const CHART_H = 140;
const PAD = 14;
const SAMPLE = [0.3, 0.38, 0.35, 0.5, 0.58, 0.7]; // heights of the sample dots
const DAYS_BACK = 60;

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

function bmiInfo(bmi: number) {
  if (bmi < 18.5) return { label: t.weight.bmiUnder, color: '#3b82f6' };
  if (bmi < 25) return { label: t.weight.bmiNormal, color: '#30a46c' };
  if (bmi < 30) return { label: t.weight.bmiOver, color: '#f59e0b' };
  return { label: t.weight.bmiObese, color: '#e5484d' };
}

export default function WeightCard() {
  const { entries, addWeight, removeWeight } = useWeight();
  const { profile } = useProfile();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [input, setInput] = useState('');
  const [daysAgo, setDaysAgo] = useState(0); // 0 = today
  const [width, setWidth] = useState(0);
  const [goalWeight, setGoalWeight] = usePersistentState<number | null>('goalWeight', null, true);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const latest = entries.length > 0 ? entries[entries.length - 1].weight : null;
  const current = latest ?? profile?.weight ?? null;
  const startWeight = entries.length > 0 ? entries[0].weight : profile?.weight ?? null;
  let goalProgress = 0;
  if (goalWeight !== null && current !== null && startWeight !== null) {
    const total = startWeight - goalWeight;
    goalProgress =
      Math.abs(total) < 0.05
        ? 1
        : Math.min(Math.max((startWeight - current) / total, 0), 1);
  }
  const bmi =
    profile?.height && current ? current / Math.pow(profile.height / 100, 2) : null;
  const bmiMeta = bmi !== null ? bmiInfo(bmi) : null;

  function saveGoal() {
    const g = parseFloat(goalInput.replace(',', '.'));
    if (isNaN(g) || g < 20 || g > 500) return;
    setGoalWeight(g);
    setGoalOpen(false);
  }

  const now = new Date();
  const dayOptions = Array.from({ length: DAYS_BACK + 1 }, (_, i) => ({
    daysAgo: i,
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - i),
  }));
  const selectedDate = dayOptions[daysAgo].date;
  const selectedLabel =
    daysAgo === 0
      ? t.days.today
      : `${selectedDate.getDate()} ${t.days.months[selectedDate.getMonth()]}`;

  function close() {
    setOpen(false);
    setInput('');
    setDaysAgo(0);
  }

  function handleSave() {
    const w = parseFloat(input.replace(',', '.'));
    if (isNaN(w) || w <= 0) return;
    addWeight(w, selectedDate);
    close();
  }

  // Chart points
  const values = entries.map((e) => e.weight);
  const lo = values.length > 0 ? Math.min(...values, goalWeight ?? Infinity) - 1 : 0;
  const hi = values.length > 0 ? Math.max(...values, goalWeight ?? -Infinity) + 1 : 1;
  const points = entries.map((e, i) => {
    const x =
      entries.length === 1
        ? width / 2
        : PAD + (i * (width - 2 * PAD)) / (entries.length - 1);
    const y = PAD + ((hi - e.weight) / (hi - lo)) * (CHART_H - 2 * PAD);
    return { x, y };
  });

  const samplePoints = SAMPLE.map((f, i) => ({
    x: PAD + (i * (width - 2 * PAD)) / (SAMPLE.length - 1),
    y: CHART_H * f,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>{t.weight.currentWeight}</Text>
          <Text style={styles.value}>
            {current !== null ? Math.round(current * 10) / 10 : t.weight.noWeight}{' '}
            {current !== null && <Text style={styles.unit}>{t.weight.kg}</Text>}
          </Text>
        </View>
        <View style={styles.buttons}>
          {entries.length > 0 && (
            <Pressable style={styles.editBtn} onPress={() => setEditOpen(true)}>
              <Text style={styles.editText}>{t.weight.edit}</Text>
            </Pressable>
          )}
          <Pressable style={styles.logBtn} onPress={() => setOpen(true)}>
            <Text style={styles.logText}>{t.weight.logWeight}</Text>
          </Pressable>
        </View>
      </View>

      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={CHART_H}>
            {[0.25, 0.5, 0.75].map((f) => (
              <Line
                key={f}
                x1={PAD}
                x2={width - PAD}
                y1={CHART_H * f}
                y2={CHART_H * f}
                stroke="#d6e4fb"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}

                        {goalWeight !== null && entries.length > 0 && (
              <Line
                x1={PAD}
                x2={width - PAD}
                y1={PAD + ((hi - goalWeight) / (hi - lo)) * (CHART_H - 2 * PAD)}
                y2={PAD + ((hi - goalWeight) / (hi - lo)) * (CHART_H - 2 * PAD)}
                stroke="#30a46c"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}

            {entries.length === 0 && (
              <>
                <Polyline
                  points={samplePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#c3d6f5"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {samplePoints.map((p, i) => (
                  <Circle key={i} cx={p.x} cy={p.y} r={5} fill="#c3d6f5" />
                ))}
              </>
            )}

            {points.length > 1 && (
              <Polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={5} fill="#3b82f6" />
            ))}
          </Svg>
        )}

        {entries.length === 0 ? (
          <Text style={[styles.hint, { textAlign: 'center', marginTop: 4 }]}>
            {t.weight.hint}
          </Text>
        ) : (
          <View style={styles.dates}>
            <Text style={styles.date}>{formatDate(entries[0].date)}</Text>
            {entries.length > 1 && (
              <Text style={styles.date}>
                {formatDate(entries[entries.length - 1].date)}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.goalBox}>
        <View style={styles.goalTop}>
          {bmi !== null && bmiMeta ? (
            <View style={[styles.bmiBadge, { backgroundColor: bmiMeta.color + '22' }]}>
              <Text style={[styles.bmiText, { color: bmiMeta.color }]}>
                {t.weight.bmi} {bmi.toFixed(1)} · {bmiMeta.label}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <Pressable
            style={styles.editBtn}
            onPress={() => {
              setGoalInput(goalWeight !== null ? String(goalWeight) : '');
              setGoalOpen(true);
            }}
          >
            <Text style={styles.editText}>
              {goalWeight !== null ? `${t.weight.goalWeight}: ${goalWeight} ${t.weight.kg}` : t.weight.setGoal}
            </Text>
          </Pressable>
        </View>

        {goalWeight !== null && (
          <>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${goalProgress * 100}%` }]} />
            </View>
            <Text style={styles.goalLabel}>
              {goalProgress >= 1
                ? t.weight.goalReached
                : `${Math.round(goalProgress * 100)}% ${t.weight.toGoal}`}
            </Text>
          </>
        )}
      </View>

      {/* Goal weight popup */}
      <Modal visible={goalOpen} transparent animationType="fade" onRequestClose={() => setGoalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t.weight.goalWeight}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.weight.goalPlaceholder}
              keyboardType="numeric"
              value={goalInput}
              onChangeText={setGoalInput}
              onSubmitEditing={saveGoal}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => setGoalOpen(false)}>
                <Text style={styles.cancelText}>{t.weight.cancel}</Text>
              </Pressable>
              {goalWeight !== null && (
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => {
                    setGoalWeight(null);
                    setGoalOpen(false);
                  }}
                >
                  <Text style={[styles.cancelText, { color: '#e5484d' }]}>{t.weight.clearGoal}</Text>
                </Pressable>
              )}
              <Pressable style={styles.saveBtn} onPress={saveGoal}>
                <Text style={styles.saveText}>{t.weight.save}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Log weight popup */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t.weight.logWeight}</Text>

            <Text style={styles.fieldLabel}>
              {t.weight.date}: {selectedLabel}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {dayOptions.map(({ daysAgo: n, date }) => {
                const active = n === daysAgo;
                return (
                  <Pressable
                    key={n}
                    style={[styles.day, active && styles.dayActive]}
                    onPress={() => setDaysAgo(n)}
                  >
                    <Text style={[styles.weekday, active && styles.textActive]}>
                      {t.days.weekdays[date.getDay()]}
                    </Text>
                    <Text style={[styles.dayNumber, active && styles.textActive]}>
                      {date.getDate()}
                    </Text>
                    <Text style={[styles.weekday, active && styles.textActive]}>
                      {t.days.months[date.getMonth()]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder={t.weight.weightPlaceholder}
              keyboardType="numeric"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSave}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelText}>{t.weight.cancel}</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>{t.weight.save}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit (delete) popup */}
      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t.weight.editTitle}</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {entries.length === 0 ? (
                <Text style={styles.hint}>{t.weight.noEntries}</Text>
              ) : (
                [...entries].reverse().map((e) => {
                  const d = new Date(e.date);
                  return (
                    <View key={e.id} style={styles.item}>
                      <Text style={styles.itemDate}>
                        {d.getDate()} {t.days.months[d.getMonth()]} {d.getFullYear()}
                      </Text>
                      <Text style={styles.itemWeight}>
                        {e.weight} {t.weight.kg}
                      </Text>
                      <Pressable onPress={() => removeWeight(e.id)}>
                        <Text style={styles.remove}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <Pressable style={styles.saveBtn} onPress={() => setEditOpen(false)}>
              <Text style={styles.saveText}>{t.weight.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef4ff', borderRadius: 16, padding: 18, marginTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#666', fontSize: 12 },
  value: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  unit: { fontSize: 14, fontWeight: '600', color: '#666' },
  buttons: { flexDirection: 'row', gap: 8 },
  logBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logText: { color: '#fff', fontWeight: '700' },
  editBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  editText: { color: '#3b82f6', fontWeight: '700' },
  hint: { color: '#999', marginTop: 12 },
  dates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  date: { color: '#777', fontSize: 12 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#444' },
  day: {
    width: 56,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#f6f7f9',
    alignItems: 'center',
  },
  dayActive: { backgroundColor: '#3b82f6' },
  weekday: { fontSize: 11, color: '#777' },
  dayNumber: { fontSize: 18, fontWeight: '700', marginVertical: 1 },
  textActive: { color: '#fff' },
  input: {
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  modalButtons: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#f0f0f4', alignItems: 'center',
  },
  cancelText: { fontWeight: '700', color: '#555' },
  saveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#3b82f6', alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f4',
  },
  itemDate: { flex: 1, fontWeight: '600' },
  itemWeight: { color: '#666', marginRight: 12 },
  remove: { color: '#e5484d', fontSize: 16 },
  goalBox: { marginTop: 12, gap: 8 },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  bmiBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  bmiText: { fontWeight: '700', fontSize: 12 },
  goalTrack: { height: 8, borderRadius: 4, backgroundColor: '#d6e4fb', overflow: 'hidden' },
  goalFill: { height: 8, borderRadius: 4, backgroundColor: '#30a46c' },
  goalLabel: { color: '#666', fontSize: 12 },
});