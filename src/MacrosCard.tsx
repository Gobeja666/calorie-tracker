import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useFood } from './FoodContext';
import { t } from './strings';

const SIZE = 130;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const COLORS = { protein: '#3b82f6', carbs: '#f59e0b', fat: '#e5484d' };

function Stat({
  icon, color, label, grams, percent,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
  grams: number;
  percent: number;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} style={styles.statIcon} />
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {Math.round(grams)} {t.macros.g} · {percent}%
        </Text>
      </View>
    </View>
  );
}

export default function MacrosCard() {
  const router = useRouter();
  const { macros } = useFood();

  // Calories from each macro (protein 4, carbs 4, fat 9 kcal per gram)
  const cal = {
    protein: macros.protein * 4,
    carbs: macros.carbs * 4,
    fat: macros.fat * 9,
  };
  const calTotal = cal.protein + cal.carbs + cal.fat;
  const share = (v: number) => (calTotal > 0 ? v / calTotal : 0);

  const parts = [
    { key: 'protein', frac: share(cal.protein), color: COLORS.protein },
    { key: 'carbs', frac: share(cal.carbs), color: COLORS.carbs },
    { key: 'fat', frac: share(cal.fat), color: COLORS.fat },
  ];

  let start = 0;
  const segments = parts.map((p) => {
    const len = p.frac * CIRCUMFERENCE;
    const seg = { ...p, len, offset: -start };
    start += len;
    return seg;
  });

  const totalGrams = macros.protein + macros.carbs + macros.fat;

  return (
    <Pressable style={styles.card} onPress={() => router.push('/meals')}>
      <Text style={styles.title}>{t.macros.title}</Text>
      <Text style={styles.formula}>{t.macros.formula}</Text>

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
            {segments.map(
              (s) =>
                s.len > 0 && (
                  <Circle
                    key={s.key}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    stroke={s.color}
                    strokeWidth={STROKE}
                    fill="none"
                    strokeDasharray={`${s.len} ${CIRCUMFERENCE - s.len}`}
                    strokeDashoffset={s.offset}
                  />
                )
            )}
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.big}>{Math.round(totalGrams)}</Text>
            <Text style={styles.small}>{t.macros.g}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat
            icon="barbell"
            color={COLORS.protein}
            label={t.macros.protein}
            grams={macros.protein}
            percent={Math.round(share(cal.protein) * 100)}
          />
          <Stat
            icon="leaf"
            color={COLORS.carbs}
            label={t.macros.carbs}
            grams={macros.carbs}
            percent={Math.round(share(cal.carbs) * 100)}
          />
          <Stat
            icon="water"
            color={COLORS.fat}
            label={t.macros.fat}
            grams={macros.fat}
            percent={Math.round(share(cal.fat) * 100)}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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