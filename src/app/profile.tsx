import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useProfile, calculateGoal, parseDob, ageFromDob, GoalType, Sex, ActivityLevel,
} from '../ProfileContext';
import { t } from '../strings';

const GOAL_TYPES: GoalType[] = ['lose', 'maintain', 'gain'];
const SEXES: Sex[] = ['male', 'female'];
const ACTIVITIES: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active'];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();

  const dobParts = profile?.dateOfBirth?.split('-') ?? [];
  const [day, setDay] = useState(dobParts[2] ? String(parseInt(dobParts[2], 10)) : '');
  const [month, setMonth] = useState(dobParts[1] ? String(parseInt(dobParts[1], 10)) : '');
  const [year, setYear] = useState(dobParts[0] ?? '');
  const [height, setHeight] = useState(profile ? String(profile.height) : '');
  const [weight, setWeight] = useState(profile ? String(profile.weight) : '');
  const [goalType, setGoalType] = useState<GoalType>(profile?.goalType ?? 'maintain');
  const [error, setError] = useState('');
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel ?? 'light'
  );

  const dob = parseDob(day, month, year);
  const h = parseFloat(height.replace(',', '.'));
  const w = parseFloat(weight.replace(',', '.'));
  const valid = dob !== null && h > 0 && w > 0;

  const preview =
    valid && dob
      ? calculateGoal({
          age: ageFromDob(dob),
          dateOfBirth: dob,
          height: h,
          weight: w,
          goalType,
          sex,
          activityLevel,
        })
      : null;

  function handleSave() {
    if (!dob) {
      setError(t.register.invalidDate);
      return;
    }
    if (!(h > 0 && w > 0)) return;
    setError('');
    saveProfile({
      age: ageFromDob(dob),
      dateOfBirth: dob,
      height: h,
      weight: w,
      goalType,
      sex,
      activityLevel,
    });
    router.replace('/settings');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ gap: 12, padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.label}>{t.register.dateOfBirth}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1, minWidth: 0 }]}
              placeholder={t.register.day}
              keyboardType="numeric"
              maxLength={2}
              value={day}
              onChangeText={setDay}
            />
            <TextInput
              style={[styles.input, { flex: 1, minWidth: 0 }]}
              placeholder={t.register.month}
              keyboardType="numeric"
              maxLength={2}
              value={month}
              onChangeText={setMonth}
            />
            <TextInput
              style={[styles.input, { flex: 2, minWidth: 0 }]}
              placeholder={t.register.year}
              keyboardType="numeric"
              maxLength={4}
              value={year}
              onChangeText={setYear}
            />
          </View>

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

                <View style={styles.card}>
          <Text style={styles.label}>{t.profile.sex}</Text>
          <View style={styles.chips}>
            {SEXES.map((s) => {
              const active = sex === s;
              return (
                <Pressable
                  key={s}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSex(s)}
                >
                  <Text style={[styles.chipText, active && { color: '#fff' }]}>
                    {t.profile.sexOptions[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t.profile.activityLevel}</Text>
          <View style={styles.chips}>
            {ACTIVITIES.map((a) => {
              const active = activityLevel === a;
              return (
                <Pressable
                  key={a}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActivityLevel(a)}
                >
                  <Text style={[styles.chipText, active && { color: '#fff' }]}>
                    {t.profile.activityOptions[a]}
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

        {error !== '' && <Text style={styles.error}>{error}</Text>}

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
  container: { flex: 1, backgroundColor: '#f6f7f9' },
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
  error: { color: '#e5484d', textAlign: 'center' },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});