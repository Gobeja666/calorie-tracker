import { createContext, useContext, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';

export type WeightEntry = { id: number; date: string; weight: number };

type WeightContextType = {
  entries: WeightEntry[];
  addWeight: (weight: number, date: Date) => void;
  removeWeight: (id: number) => void;
};

const WeightContext = createContext<WeightContextType | null>(null);

function sameDay(a: string, b: string) {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

export function WeightProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = usePersistentState<WeightEntry[]>('weights', []);

  function addWeight(weight: number, date: Date) {
    // Store at noon so the day never shifts because of time zones
    const iso = new Date(
      date.getFullYear(), date.getMonth(), date.getDate(), 12
    ).toISOString();

    setEntries((prev) =>
      [...prev.filter((e) => !sameDay(e.date, iso)), { id: Date.now(), date: iso, weight }]
        .sort((a, b) => a.date.localeCompare(b.date))
    );
  }

  function removeWeight(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <WeightContext.Provider value={{ entries, addWeight, removeWeight }}>
      {children}
    </WeightContext.Provider>
  );
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error('useWeight must be used inside WeightProvider');
  return ctx;
}