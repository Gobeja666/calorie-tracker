import { Ionicons } from '@expo/vector-icons';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const MEALS: { name: string; icon: IconName; color: string }[] = [
  { name: 'Breakfast', icon: 'cafe', color: '#f59e0b' },
  { name: 'Lunch', icon: 'restaurant', color: '#30a46c' },
  { name: 'Dinner', icon: 'moon', color: '#6366f1' },
  { name: 'Snacks', icon: 'nutrition', color: '#e5484d' },
];