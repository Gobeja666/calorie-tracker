import { ComponentRef, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { toDateKey, useFood } from './FoodContext';
import { t } from './strings';

const DAYS_BACK = 30;

export default function DayPicker() {
  const { selectedDate, setSelectedDate, days } = useFood();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const now = new Date();
  const todayKey = toDateKey(now);

  // Last 30 days, oldest on the left, today on the right
  const list = Array.from({ length: DAYS_BACK + 1 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (DAYS_BACK - i));
    return { date: d, key: toDateKey(d) };
  });

  const selected = list.find((d) => d.key === selectedDate)?.date ?? now;
  const label =
    selectedDate === todayKey
      ? t.days.today
      : `${selected.getDate()} ${t.days.months[selected.getMonth()]}`;

  function hasFood(key: string) {
    const day = days[key];
    return !!day && Object.values(day).some((foods) => foods.length > 0);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {list.map(({ date, key }) => {
          const active = key === selectedDate;
          return (
            <Pressable
              key={key}
              style={[styles.day, active && styles.dayActive]}
              onPress={() => setSelectedDate(key)}
            >
              <Text style={[styles.weekday, active && styles.textActive]}>
                {t.days.weekdays[date.getDay()]}
              </Text>
              <Text style={[styles.number, active && styles.textActive]}>
                {date.getDate()}
              </Text>
              <View
                style={[
                  styles.dot,
                  hasFood(key) && { backgroundColor: active ? '#fff' : '#3b82f6' },
                ]}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  day: {
    width: 52,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  dayActive: { backgroundColor: '#3b82f6' },
  weekday: { fontSize: 12, color: '#777' },
  number: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  textActive: { color: '#fff' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 4, backgroundColor: 'transparent' },
});