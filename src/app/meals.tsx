import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable, ScrollView,
  StyleSheet,
  Text, TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFood } from '../FoodContext';
import { t } from '../strings';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const MEALS: { name: string; icon: IconName; color: string }[] = [
  { name: 'Breakfast', icon: 'cafe', color: '#f59e0b' },
  { name: 'Lunch', icon: 'restaurant', color: '#30a46c' },
  { name: 'Dinner', icon: 'moon', color: '#6366f1' },
  { name: 'Snacks', icon: 'nutrition', color: '#e5484d' },
];

function MealSection({ meal }: { meal: (typeof MEALS)[number] }) {
  const { meals, removeFood } = useFood();
  const foods = meals[meal.name];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconCircle, { backgroundColor: meal.color + '22' }]}>
          <Ionicons name={meal.icon} size={20} color={meal.color} />
        </View>
        <Text style={styles.sectionTitle}>{t.mealNames[meal.name]}</Text>
      </View>

      {foods.length === 0 ? (
        <Text style={styles.empty}>{t.meals.nothingLogged}</Text>
      ) : (
        foods.map((f) => (
          <View key={f.id} style={styles.item}>
            <Text style={styles.itemName}>{f.name}</Text>
            <Text style={styles.itemCal}>{f.calories} {t.meals.kcal}</Text>
            <Pressable onPress={() => removeFood(meal.name, f.id)}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

export default function MealsScreen() {
  const { addFood } = useFood();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('Breakfast');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');

  function close() {
    setOpen(false);
    setName('');
    setCalories('');
  }

  function handleAdd() {
    const cal = parseFloat(calories);
    if (!name.trim() || isNaN(cal) || cal <= 0) return;
    addFood(selected, name.trim(), cal);
    close();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 100 }}>
        {MEALS.map((meal) => (
          <MealSection key={meal.name} meal={meal} />
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
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
              onSubmitEditing={handleAdd}
            />

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelText}>{t.meals.cancel}</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addText}>{t.meals.add}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f9', padding: 16 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  empty: { color: '#999', marginTop: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f4',
  },
  itemName: { flex: 1, fontWeight: '600' },
  itemCal: { color: '#666', marginRight: 12 },
  remove: { color: '#e5484d', fontSize: 16 },

  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12 },
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