import { createContext, ReactNode, useContext } from 'react';
import { usePersistentState } from './usePersistentState';

export type WeightEntry = { id: number; date: string; weight: number };

type WeightContextType = {
  entries: WeightEntry[];
  addWeight: (weight: number) => void;
};

const WeightContext = createContext<WeightContextType | null>(null);

export function WeightProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = usePersistentState<WeightEntry[]>('weights', []);

  function addWeight(weight: number) {
    setEntries((prev) => [
      ...prev,
      { id: Date.now(), date: new Date().toISOString(), weight },
    ]);
  }

  return (
    <WeightContext.Provider value={{ entries, addWeight }}>
      {children}
    </WeightContext.Provider>
  );
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error('useWeight must be used inside WeightProvider');
  return ctx;
}