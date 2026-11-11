import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../AuthContext';
import { useProfile, getAge } from '../ProfileContext';
import { t } from '../strings';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { profile, goal } = useProfile();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ gap: 12, padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.settings.account}</Text>
          <Row label={t.settings.email} value={session?.user.email ?? '—'} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.settings.yourProfile}</Text>
          <Row
            label={t.profile.age}
            value={profile ? String(getAge(profile)) : t.settings.notSet}
          />
          <Row
            label={t.profile.height}
            value={profile ? `${profile.height} ${t.settings.cm}` : t.settings.notSet}
          />
          <Row
            label={t.profile.weight}
            value={profile ? `${profile.weight} ${t.weight.kg}` : t.settings.notSet}
          />
          <Row
            label={t.profile.goal}
            value={profile ? t.profile.goalOptions[profile.goalType] : t.settings.notSet}
          />
          <Row label={t.profile.yourDailyGoal} value={`${goal} ${t.meals.kcal}`} />

          <Pressable style={styles.editBtn} onPress={() => router.replace('/profile')}>
            <Text style={styles.editText}>{t.settings.editProfile}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutText}>{t.settings.logOut}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f9' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: '#666' },
  rowValue: { fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  editBtn: {
    backgroundColor: '#eef4ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  editText: { color: '#3b82f6', fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3c5c7',
  },
  logoutText: { color: '#e5484d', fontWeight: '700', fontSize: 16 },
});