import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFood, Food } from '../FoodContext';
import { MEALS } from '../mealTypes';
import { t } from '../strings';
import DayPicker from '../DayPicker';
import EditFoodModal from '../EditFoodModal';

function MealSection({
  meal,
  onEdit,
}: {
  meal: (typeof MEALS)[number];
  onEdit: (meal: string, food: Food) => void;
}) {
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
        foods.map((f) => {
          const hasMacros = (f.protein ?? 0) + (f.carbs ?? 0) + (f.fat ?? 0) > 0;
          return (
            <View key={f.id} style={styles.item}>
              <Pressable style={styles.itemTap} onPress={() => onEdit(meal.name, f)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{f.name}</Text>
                  {hasMacros && (
                    <Text style={styles.itemMacros}>
                      {t.macros.shortProtein} {f.protein ?? 0}{t.macros.g} ·{' '}
                      {t.macros.shortCarbs} {f.carbs ?? 0}{t.macros.g} ·{' '}
                      {t.macros.shortFat} {f.fat ?? 0}{t.macros.g}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemCal}>{f.calories} {t.meals.kcal}</Text>
              </Pressable>
              <Pressable onPress={() => removeFood(meal.name, f.id)} hitSlop={8}>
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}

export default function MealsScreen() {
  const [editing, setEditing] = useState<{ meal: string; food: Food } | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <DayPicker />

      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        {MEALS.map((meal) => (
          <MealSection
            key={meal.name}
            meal={meal}
            onEdit={(m, f) => setEditing({ meal: m, food: f })}
          />
        ))}
      </ScrollView>

      <EditFoodModal
        meal={editing?.meal ?? null}
        food={editing?.food ?? null}
        onClose={() => setEditing(null)}
      />
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
  itemTap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemName: { fontWeight: '600' },
  itemMacros: { color: '#888', fontSize: 12, marginTop: 2 },
  itemCal: { color: '#666', marginHorizontal: 12 },
  remove: { color: '#e5484d', fontSize: 16 },
}); 