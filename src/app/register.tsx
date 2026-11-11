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
  const [confirm, setConfirm] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleRegister() {
    const d = parseInt(day, 10);
    const mo = parseInt(month, 10);
    const y = parseInt(year, 10);
    const h = parseFloat(height);
    const w = parseFloat(weight.replace(',', '.'));

    if (!email.includes('@') || password.length < 6 || !(h > 0 && w > 0)) {
      setMessage(t.register.invalidInput);
      return;
    }
    if (password !== confirm) {
      setMessage(t.register.passwordsDontMatch);
      return;
    }

    // Check the date is real and work out the age
    const dob = new Date(y, mo - 1, d);
    const validDate =
      dob.getFullYear() === y && dob.getMonth() === mo - 1 && dob.getDate() === d;
    const today = new Date();
    let a = today.getFullYear() - y;
    if (
      today.getMonth() < mo - 1 ||
      (today.getMonth() === mo - 1 && today.getDate() < d)
    ) {
      a--;
    }
    if (!validDate || a < 10 || a > 120) {
      setMessage(t.register.invalidDate);
      return;
    }
    const dobString = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    setBusy(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { age: a, date_of_birth: dobString, height: h, weight: w, goal_type: goalType },
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

          <Text style={styles.label}>{t.register.confirmPassword}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

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