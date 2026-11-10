import { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { useWeight } from './WeightContext';
import { useProfile } from './ProfileContext';
import { t } from './strings';

const CHART_H = 140;
const PAD = 14;
const SAMPLE = [0.3, 0.38, 0.35, 0.5, 0.58, 0.7]; // heights of the sample dots

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

export default function WeightCard() {
  const { entries, addWeight } = useWeight();
  const { profile } = useProfile();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [width, setWidth] = useState(0);

  const latest = entries.length > 0 ? entries[entries.length - 1].weight : null;
  const current = latest ?? profile?.weight ?? null;

  function close() {
    setOpen(false);
    setInput('');
  }

  function handleSave() {
    const w = parseFloat(input.replace(',', '.'));
    if (isNaN(w) || w <= 0) return;
    addWeight(w);
    close();
  }

  // Chart points
  const values = entries.map((e) => e.weight);
  const lo = values.length > 0 ? Math.min(...values) - 1 : 0;
  const hi = values.length > 0 ? Math.max(...values) + 1 : 1;
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
        <Pressable style={styles.logBtn} onPress={() => setOpen(true)}>
          <Text style={styles.logText}>{t.weight.logWeight}</Text>
        </Pressable>
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

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{t.weight.logWeight}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef4ff', borderRadius: 16, padding: 18, marginTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#666', fontSize: 12 },
  value: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  unit: { fontSize: 14, fontWeight: '600', color: '#666' },
  logBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logText: { color: '#fff', fontWeight: '700' },
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
});