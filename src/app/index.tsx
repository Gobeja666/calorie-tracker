import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../FoodContext';
import { useProfile } from '../ProfileContext';
import { t } from '../strings';
import WeightCard from '../WeightCard';
import DayPicker from '../DayPicker';

const EXERCISE = 0;

const SIZE = 130;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function Stat({
  icon, color, label, value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} style={styles.statIcon} />
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function TodayScreen() {
  const { total: FOOD } = useFood();
  const router = useRouter();
  const { goal: GOAL } = useProfile();

  const remaining = GOAL - FOOD + EXERCISE;
  const progress = Math.min(Math.max((FOOD - EXERCISE) / GOAL, 0), 1);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/profile')}>
              <Ionicons name="person-circle-outline" size={30} color="#3b82f6" />
            </Pressable>
          ),
        }}
      />

      <DayPicker />

      <Pressable style={styles.card} onPress={() => router.push('/meals')}>
        <Text style={styles.title}>{t.today.calories}</Text>
        <Text style={styles.formula}>{t.today.formula}</Text>

        <View style={styles.row}>
          <View style={styles.ringWrap}>
            <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="#d6e4fb"
                strokeWidth={STROKE}
                fill="none"
              />
              <Circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="#3b82f6"
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={styles.big}>{remaining}</Text>
              <Text style={styles.small}>{t.today.remaining}</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <Stat icon="flag" color="#555" label={t.today.baseGoal} value={GOAL} />
            <Stat icon="restaurant" color="#3b82f6" label={t.today.food} value={FOOD} />
            <Stat icon="flame" color="#f59e0b" label={t.today.exercise} value={EXERCISE} />
          </View>
        </View>
      </Pressable>

      <WeightCard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f9', padding: 16 },
  card: { backgroundColor: '#eef4ff', borderRadius: 16, padding: 18 },
  title: { fontSize: 20, fontWeight: '700' },
  formula: { color: '#777', fontSize: 12, marginTop: 4, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  ringWrap: { width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  big: { fontSize: 28, fontWeight: '800' },
  small: { fontSize: 12, color: '#666' },
  stats: { flex: 1, marginLeft: 24, gap: 14 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statIcon: { width: 32 },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 16, fontWeight: '700' },
});