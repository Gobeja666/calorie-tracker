import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Modal, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFood, Food } from './FoodContext';
import { t } from './strings';

export default function EditFoodModal({
  meal,
  food,
  onClose,
}: {
  meal: string | null;
  food: Food | null;
  onClose: () => void;
}) {
  const { updateFood } = useFood();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Fill the fields with the food's current values each time one is opened
  useEffect(() => {
    if (!food) return;
    setName(food.name);
    setCalories(String(food.calories));
    setProtein(food.protein ? String(food.protein) : '');
    setCarbs(food.carbs ? String(food.carbs) : '');
    setFat(food.fat ? String(food.fat) : '');
  }, [food]);

  function toGrams(v: string) {
    const n = parseFloat(v.replace(',', '.'));
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function handleSave() {
    if (!food || !meal) return;
    const cal = parseFloat(calories.replace(',', '.'));
    if (!name.trim() || isNaN(cal) || cal <= 0) return;
    updateFood(meal, food.id, name.trim(), cal, {
      protein: toGrams(protein),
      carbs: toGrams(carbs),
      fat: toGrams(fat),
    });
    onClose();
  }

  return (
    <Modal visible={food !== null} transparent animationType="fade" onRequestClose={onClose}>
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
            <Text style={styles.modalTitle}>{t.meals.editFood}</Text>

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
                onSubmitEditing={handleSave}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>{t.meals.cancel}</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>{t.meals.save}</Text>
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
  saveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#3b82f6', alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
});