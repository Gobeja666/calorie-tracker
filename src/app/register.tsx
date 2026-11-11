import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';
import { useProfile, GoalType } from '../ProfileContext';
import { t } from '../strings';

const GOAL_TYPES: GoalType[] = ['lose', 'maintain', 'gain'];

export default function RegisterScreen() {
  const router = useRouter();
  const { saveProfile } = useProfile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleRegister() {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight.replace(',', '.'));

    if (!email.includes('@') || password.length < 6 || !(a > 0 && h > 0 && w > 0)) {
      setMessage(t.register.invalidInput);
      return;
    }

    setBusy(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { age: a, height: h, weight: w, goal_type: goalType },
      },
    });

    setBusy(false);

    if (error) {
      setMessage(`${t.register.error}: ${error.message}`);
      return;
    }

    // Also fill the local profile so the daily goal works immediately
    saveProfile({ age: a, height: h, weight: w, goalType });

    if (data.session) {
      router.replace('/');
    } else {
      // Email confirmation is on in Supabase
      setMessage(t.register.checkEmail);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ gap: 12, padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t.register.title}</Text>
        <Text style={styles.subtitle}>{t.register.subtitle}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t.register.email}</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>{t.register.password}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            placeholder={t.register.passwordHint}
            value={password}
            onChangeText={setPassword}
          />
        </View>

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

        {message !== '' && <Text style={styles.message}>{message}</Text>}

        <Pressable
          style={[styles.btn, busy && { opacity: 0.5 }]}
          onPress={handleRegister}
          disabled={busy}
        >
          <Text style={styles.btnText}>{t.register.createAccount}</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/login')}>
          <Text style={styles.link}>{t.login.haveAccount}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f9' },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#666', marginBottom: 4 },
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
  message: { color: '#e5484d', textAlign: 'center' },
  btn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: '#3b82f6', textAlign: 'center', fontWeight: '600' },
});