import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Modal, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from './FoodContext';
import { MEALS } from './mealTypes';
import { t } from './strings';

export default function AddFoodModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addFood } = useFood();
  const [selected, setSelected] = useState('Breakfast');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  function close() {
    onClose();
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  }

  function toGrams(v: string) {
    const n = parseFloat(v.replace(',', '.'));
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function handleAdd() {
    const cal = parseFloat(calories.replace(',', '.'));
    if (!name.trim() || isNaN(cal) || cal <= 0) return;
    addFood(selected, name.trim(), cal, {
      protein: toGrams(protein),
      carbs: toGrams(carbs),
      fat: toGrams(fat),
    });
    close();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
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
            <Text style={styles.modalTitle}>{t.meals.addFood}</Text>

            <View style={styles.chips}>
              {MEALS.map((m) => {
                const active = selected === m.name;
                return (
                  <Pressable
                    key={m.name}
                    style={[
                      styles.chip,
                      active && { backgroundColor: m.color, borderColor: m.color },
                    ]}
                    onPress={() => setSelected(m.name)}
                  >
                    <Ionicons
                      name={m.icon}
                      size={16}
                      color={active ? '#fff' : m.color}
                    />
                    <Text style={[styles.chipText, active && { color: '#fff' }]}>
                      {t.mealNames[m.name]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              style={styles.input}
              placeholder={t.meals.foodName}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder={t.meals.caloriesPlaceholder}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />

            <View style={styles.macroRow}>
              <TextInput
                style={[styles.input, styles.macroInput]}
                placeholder={t.meals.proteinPlaceholder}
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
              />
              <TextInput
                style={[styles.input, styles.macroInput]}
                placeholder={t.meals.carbsPlaceholder}
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
              />
              <TextInput
                style={[styles.input, styles.macroInput]}
                placeholder={t.meals.fatPlaceholder}
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
                onSubmitEditing={handleAdd}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelText}>{t.meals.cancel}</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addText}>{t.meals.add}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e6',
  },
  chipText: { fontWeight: '600', color: '#333' },
  input: {
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroInput: { flex: 1, minWidth: 0, paddingHorizontal: 8 },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#f0f0f4', alignItems: 'center',
  },
  cancelText: { fontWeight: '700', color: '#555' },
  addBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#3b82f6', alignItems: 'center',
  },
  addText: { color: '#fff', fontWeight: '700' },
});