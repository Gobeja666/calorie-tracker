import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AddFoodModal from './AddFoodModal';
import { t } from './strings';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function NavButton({
  icon, activeIcon, label, active, onPress,
}: {
  icon: IconName;
  activeIcon: IconName;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const color = active ? '#3b82f6' : '#8a93a3';
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Ionicons name={active ? activeIcon : icon} size={24} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [addOpen, setAddOpen] = useState(false);
  
  if (pathname === '/register' || pathname === '/login') return null;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <NavButton
        icon="home-outline"
        activeIcon="home"
        label={t.nav.home}
        active={pathname === '/'}
        onPress={() => router.replace('/')}
      />
      <NavButton
        icon="restaurant-outline"
        activeIcon="restaurant"
        label={t.nav.meals}
        active={pathname === '/meals'}
        onPress={() => router.replace('/meals')}
      />

      <View style={styles.item}>
        <Pressable style={styles.plus} onPress={() => setAddOpen(true)}>
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      </View>

      <NavButton
        icon="barbell-outline"
        activeIcon="barbell"
        label={t.nav.workouts}
        active={pathname === '/workouts'}
        onPress={() => router.replace('/workouts')}
      />

      <NavButton
        icon="settings-outline"
        activeIcon="settings"
        label={t.nav.settings}
        active={pathname === '/settings' || pathname === '/profile'}
        onPress={() => router.replace('/settings')}
      />

      <AddFoodModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eceef2',
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  label: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  plus: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -22,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});