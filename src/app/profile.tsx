import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfile, calculateGoal, GoalType } from '../ProfileContext';
import { t } from '../strings';

const GOAL_TYPES: GoalType[] = ['lose', 'maintain', 'gain'];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();

  const [age, setAge] = useState(profile ? String(profile.age) : '');
  const [height, setHeight] = useState(profile ? String(profile.height) : '');
  const [weight, setWeight] = useState(profile ? String(profile.weight) : '');
  const [goalType, setGoalType] = useState<GoalType>(profile?.goalType ?? 'maintain');

  const a = parseFloat(age);
  const h = parseFloat(height);
  const w = parseFloat(weight);
  const valid = a > 0 && h > 0 && w > 0;

  const preview = valid
    ? calculateGoal({ age: a, height: h, weight: w, goalType })
    : null;

  function handleSave() {
    if (!valid) return;
    saveProfile({ age: a, height: h, weight: w, goalType });
    router.replace('/settings');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <View style={styles.card}>
          <Text style={styles.label}>{t.profile.age}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.profile.agePlaceholder}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>{t.profile.height}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.profile.heightPlaceholder}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />

          <Text style={styles.label}>{t.profile.weight}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.profile.weightPlaceholder}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t.profile.goal}</Text>
          <View style={styles.chips}>
            {GOAL_TYPES.map((g) => {
              const active = goalType === g;
              return (
                <Pressable
                  key={g}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setGoalType(g)}
                >
                  <Text style={[styles.chipText, active && { color: '#fff' }]}>
                    {t.profile.goalOptions[g]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.result}>
          <Text style={styles.resultLabel}>{t.profile.yourDailyGoal}</Text>
          {preview !== null ? (
            <Text style={styles.resultValue}>
              {preview} {t.meals.kcal}
            </Text>
          ) : (
            <Text style={styles.hint}>{t.profile.fillAllFields}</Text>
          )}
        </View>

        <Pressable
          style={[styles.saveBtn, !valid && { opacity: 0.4 }]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>{t.profile.save}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f9', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: '#444' },
  input: {
    backgroundColor: '#f6f7f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e6',
  },
  chipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipText: { fontWeight: '600', color: '#333' },
  result: {
    backgroundColor: '#eef4ff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  resultLabel: { color: '#666', fontSize: 13 },
  resultValue: { fontSize: 32, fontWeight: '800', marginTop: 4 },
  hint: { color: '#999', marginTop: 4, textAlign: 'center' },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});