import { createContext, useContext, useState, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';

export type Food = { id: number; name: string; calories: number };
type MealsData = Record<string, Food[]>;
type DaysData = Record<string, MealsData>;

// Local date as "2026-11-10" (not UTC, so the day changes at your midnight)
export function toDateKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const emptyMeals = (): MealsData => ({
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snacks: [],
});

type FoodContextType = {
  meals: MealsData;
  total: number;
  days: DaysData;
  selectedDate: string;
  setSelectedDate: (key: string) => void;
  addFood: (meal: string, name: string, calories: number) => void;
  removeFood: (meal: string, id: number) => void;
};

const FoodContext = createContext<FoodContextType | null>(null);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = usePersistentState<DaysData>('mealsByDate', {});
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const meals = days[selectedDate] ?? emptyMeals();

  const total = Object.values(meals)
    .flat()
    .reduce((sum, f) => sum + f.calories, 0);

  function addFood(meal: string, name: string, calories: number) {
    setDays((prev) => {
      const day = prev[selectedDate] ?? emptyMeals();
      return {
        ...prev,
        [selectedDate]: {
          ...day,
          [meal]: [...day[meal], { id: Date.now(), name, calories }],
        },
      };
    });
  }

  function removeFood(meal: string, id: number) {
    setDays((prev) => {
      const day = prev[selectedDate] ?? emptyMeals();
      return {
        ...prev,
        [selectedDate]: {
          ...day,
          [meal]: day[meal].filter((f) => f.id !== id),
        },
      };
    });
  }

  return (
    <FoodContext.Provider
      value={{ meals, total, days, selectedDate, setSelectedDate, addFood, removeFood }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFood() {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error('useFood must be used inside FoodProvider');
  return ctx;
}