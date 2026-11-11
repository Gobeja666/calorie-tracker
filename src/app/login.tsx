import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';
import { t } from '../strings';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) setMessage(`${t.login.error}: ${error.message}`);
    // On success, the login check sends you to the Today page
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={styles.title}>{t.login.title}</Text>
        <Text style={styles.subtitle}>{t.login.subtitle}</Text>

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
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
        </View>

        {message !== '' && <Text style={styles.message}>{message}</Text>}

        <Pressable
          style={[styles.btn, busy && { opacity: 0.5 }]}
          onPress={handleLogin}
          disabled={busy}
        >
          <Text style={styles.btnText}>{t.login.logIn}</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/register')}>
          <Text style={styles.link}>{t.login.noAccount}</Text>
        </Pressable>
      </View>
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