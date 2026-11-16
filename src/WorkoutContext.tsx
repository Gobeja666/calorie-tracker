import { createContext, useContext, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';
import { useFood } from './FoodContext';
import { useProfile } from './ProfileContext';

export type Workout = {
  id: number;
  type: string;
  name: string;
  minutes: number;
  calories: number;
};

export const WORKOUT_TYPES: { key: string; met: number }[] = [
  { key: 'Walking', met: 3.5 },
  { key: 'Running', met: 8.0 },
  { key: 'Cycling', met: 6.0 },
  { key: 'Gym', met: 5.0 },
  { key: 'Swimming', met: 7.0 },
  { key: 'Custom', met: 5.0 },
];

type WorkoutContextType = {
  workouts: Workout[];
  totalCalories: number;
  totalMinutes: number;
  estimateCalories: (type: string, minutes: number) => number;
  addWorkout: (w: Omit<Workout, 'id'>) => void;
  removeWorkout: (id: number) => void;
};

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { selectedDate } = useFood();
  const { profile } = useProfile();
  const [byDate, setByDate] = usePersistentState<Record<string, Workout[]>>(
    'workoutsByDate',
    {},
    true
  );

  const workouts = byDate[selectedDate] ?? [];
  const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);
  const totalMinutes = workouts.reduce((s, w) => s + w.minutes, 0);

  function estimateCalories(type: string, minutes: number) {
    const met = WORKOUT_TYPES.find((x) => x.key === type)?.met ?? 5;
    const weight = profile?.weight ?? 70;
    return Math.round(((met * 3.5 * weight) / 200) * minutes);
  }

  function addWorkout(w: Omit<Workout, 'id'>) {
    setByDate((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] ?? []), { ...w, id: Date.now() }],
    }));
  }

  function removeWorkout(id: number) {
    setByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter((w) => w.id !== id),
    }));
  }

  return (
    <WorkoutContext.Provider
      value={{ workouts, totalCalories, totalMinutes, estimateCalories, addWorkout, removeWorkout }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used inside WorkoutProvider');
  return ctx;
}