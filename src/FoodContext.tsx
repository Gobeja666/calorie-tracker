import { createContext, ReactNode, useContext, useState } from 'react';
import { usePersistentState } from './usePersistentState';

export type Food = { id: number; name: string; calories: number };
type MealsData = Record<string, Food[]>;

type FoodContextType = {
  meals: MealsData;
  total: number;
  addFood: (meal: string, name: string, calories: number) => void;
  removeFood: (meal: string, id: number) => void;
};

const FoodContext = createContext<FoodContextType | null>(null);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = usePersistentState<MealsData>('meals', {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: [],
  });

  const total = Object.values(meals)
    .flat()
    .reduce((sum, f) => sum + f.calories, 0);

  function addFood(meal: string, name: string, calories: number) {
    setMeals((prev) => ({
      ...prev,
      [meal]: [...prev[meal], { id: Date.now(), name, calories }],
    }));
  }

  function removeFood(meal: string, id: number) {
    setMeals((prev) => ({
      ...prev,
      [meal]: prev[meal].filter((f) => f.id !== id),
    }));
  }

  return (
    <FoodContext.Provider value={{ meals, total, addFood, removeFood }}>
      {children}
    </FoodContext.Provider>
  );
}

export function useFood() {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error('useFood must be used inside FoodProvider');
  return ctx;
}