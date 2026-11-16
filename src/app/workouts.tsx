import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Modal, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout, WORKOUT_TYPES } from '../WorkoutContext';
import { t } from '../strings';
import DayPicker from '../DayPicker';

export default function WorkoutsScreen() {
  const { workouts, totalCalories, totalMinutes, estimateCalories, addWorkout, removeWorkout } =
    useWorkout();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('Walking');
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [kcal, setKcal] = useState('');
  const [kcalEdited, setKcalEdited] = useState(false);

  function close() {
    setOpen(false);
    setType('Walking');
    setName('');
    setMinutes('');
    setKcal('');
    setKcalEdited(false);
  }

  function refreshKcal(nextType: string, nextMinutes: string) {
    if (kcalEdited) return;
    const m = parseFloat(nextMinutes.replace(',', '.'));
    setKcal(m > 0 ? String(estimateCalories(nextType, m)) : '');
  }

  function changeType(k: string) {
    setType(k);
    refreshKcal(k, minutes);
  }

  function changeMinutes(v: string) {
    setMinutes(v);
    refreshKcal(type, v);
  }

  function handleAdd() {
    const m = parseFloat(minutes.replace(',', '.'));
    const c = parseFloat(kcal.replace(',', '.'));
    if (!(m > 0) || isNaN(c) || c < 0) return;
    addWorkout({
      type,
      name: name.trim() || t.workouts.types[type],
      minutes: m,
      calories: Math.round(c),
    });
    close();
  }

  return (
    <SafeAreaView style={styles.container}>
      <DayPicker />

      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.big}>{totalCalories}</Text>
            <Text style={styles.small}>{t.workouts.burned}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.big}>{totalMinutes}</Text>
            <Text style={styles.small}>{t.workouts.activeMinutes}</Text>
          </View>
        </View>

        <Pressable style={styles.addBtn} onPress={() => setOpen(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>{t.workouts.addWorkout}</Text>
        </Pressable>

        <View style={styles.card}>
          {workouts.length === 0 ? (
            <Text style={styles.empty}>{t.workouts.nothingLogged}</Text>
          ) : (
            workouts.map((w) => (
              <View key={w.id} style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{w.name}</Text>
                  <Text style={styles.itemSub}>
                    {w.minutes} {t.workouts.min}
                  </Text>
                </View>
                <Text style={styles.itemCal}>
                  {w.calories} {t.meals.kcal}
                </Text>
                <Pressable onPress={() => removeWorkout(w.id)} hitSlop={8}>
                  <Text style={styles.remove}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modal}>
            <ScrollView
              contentContainerStyle={{ gap: 12 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <Text style={styles.modalTitle}>{t.workouts.addWorkout}</Text>
                <Pressable onPress={close} hitSlop={12}>
                  <Ionicons name="close" size={26} color="#666" />
                </Pressable>
              </View>

              <View style={styles.chips}>
                {WORKOUT_TYPES.map((w) => {
                  const active = type === w.key;
                  return (
                    <Pressable
                      key={w.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => changeType(w.key)}
                    >
                      <Text style={[styles.chipText, active && { color: '#fff' }]}>
                        {t.workouts.types[w.key]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {type === 'Custom' && (
                <TextInput
                  style={styles.input}
                  placeholder={t.workouts.namePlaceholder}
                  value={name}
                  onChangeText={setName}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder={t.workouts.minutesPlaceholder}
                keyboardType="numeric"
                value={minutes}
                onChangeText={changeMinutes}
              />
              <TextInput
                style={styles.input}
                placeholder={t.workouts.kcalPlaceholder}
                keyboardType="numeric"
                value={kcal}
                onChangeText={(v) => {
                  setKcal(v);
                  setKcalEdited(true);
                }}
                onSubmitEditing={handleAdd}
              />
              <Text style={styles.hint}>{t.workouts.estimateHint}</Text>

              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelBtn} onPress={close}>
                  <Text style={styles.cancelText}>{t.meals.cancel}</Text>
                </Pressable>
                <Pressable style={styles.confirmBtn} onPress={handleAdd}>
                  <Text style={styles.addText}>{t.meals.add}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f9', padding: 16 },
  summary: {
    backgroundColor: '#eef4ff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  big: { fontSize: 32, fontWeight: '800' },
  small: { color: '#666', fontSize: 12, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
  },
  addText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  empty: { color: '#999' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f4',
  },
  itemName: { fontWeight: '600' },
  itemSub: { color: '#888', fontSize: 12, marginTop: 2 },
  itemCal: { color: '#666', marginHorizontal: 12 },
  remove: { color: '#e5484d', fontSize: 16 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e6',
  },
  chipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipText: { fontWeight: '600', color: '#333' },
  input: {
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  hint: { color: '#999', fontSize: 12 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#f0f0f4', alignItems: 'center',
  },
  cancelText: { fontWeight: '700', color: '#555' },
  confirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#3b82f6', alignItems: 'center',
  },
});