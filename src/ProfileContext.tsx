import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export type GoalType = 'lose' | 'maintain' | 'gain';
export type Profile = {
  age: number; // fallback for accounts without a date of birth
  dateOfBirth?: string; // "1995-02-28"
  height: number; // cm
  weight: number; // kg
  goalType: GoalType;
};

const DEFAULT_GOAL = 1200;

export function ageFromDob(dob: string): number {
  const [y, m, d] = dob.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d)) {
    age--;
  }
  return age;
}

// Returns "YYYY-MM-DD" if the date is real and the age is 10-120, otherwise null
export function parseDob(day: string, month: string, year: string): string | null {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (!(d > 0 && m > 0 && y > 999)) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  const s = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const age = ageFromDob(s);
  return age >= 10 && age <= 120 ? s : null;
}

export function getAge(p: Profile): number {
  return p.dateOfBirth ? ageFromDob(p.dateOfBirth) : p.age;
}

export function calculateGoal(p: Profile): number {
  // Mifflin-St Jeor formula (average of male and female), light activity
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * getAge(p) - 78;
  const maintenance = bmr * 1.2;
  const adjust = p.goalType === 'lose' ? -500 : p.goalType === 'gain' ? 500 : 0;
  return Math.max(1200, Math.round(maintenance + adjust));
}

type ProfileContextType = {
  profile: Profile | null;
  goal: number;
  saveProfile: (p: Profile) => void;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = usePersistentState<Profile | null>('profile', null);
  const goal = profile ? calculateGoal(profile) : DEFAULT_GOAL;

  const { session, loading } = useAuth();
  const userId = session?.user.id;

  // Load the cloud profile when a user logs in; clear it when they log out
  useEffect(() => {
    if (loading) return;
    if (!userId) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('age, date_of_birth, height, weight, goal_type')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data && data.height && data.weight && (data.date_of_birth || data.age)) {
          setProfile({
            age: data.date_of_birth
              ? ageFromDob(data.date_of_birth)
              : Number(data.age),
            dateOfBirth: data.date_of_birth ?? undefined,
            height: Number(data.height),
            weight: Number(data.weight),
            goalType: data.goal_type as GoalType,
          });
        }
      });
  }, [userId, loading]);

  // Save locally, and to the cloud when logged in
  function saveProfile(p: Profile) {
    setProfile(p);
    if (!userId) return;
    supabase
      .from('profiles')
      .update({
        age: getAge(p),
        date_of_birth: p.dateOfBirth ?? null,
        height: p.height,
        weight: p.weight,
        goal_type: p.goalType,
      })
      .eq('id', userId)
      .then(({ error }) => {
        if (error) console.warn('Could not save profile to the cloud:', error.message);
      });
  }

  return (
    <ProfileContext.Provider value={{ profile, goal, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}