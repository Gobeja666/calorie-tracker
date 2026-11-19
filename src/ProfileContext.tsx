import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export type GoalType = 'lose' | 'maintain' | 'gain' | 'extreme';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type Profile = {
  age: number; // fallback for accounts without a date of birth
  dateOfBirth?: string; // "1995-02-28"
  height: number; // cm
  weight: number; // kg
  goalType: GoalType;
  sex: Sex;
  activityLevel: ActivityLevel;
  customGoal?: number; // kcal/day
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

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export function calculatePlanGoal(p: Profile): number {
  const base = 10 * p.weight + 6.25 * p.height - 5 * getAge(p);
  const offset = p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78;
  const mult = ACTIVITY_MULT[p.activityLevel ?? 'light'];
  const maintenance = (base + offset) * mult;
  if (p.goalType === 'extreme') return Math.max(1200, Math.round(maintenance * 0.6));
  const adjust = p.goalType === 'lose' ? -500 : p.goalType === 'gain' ? 500 : 0;
  return Math.max(1200, Math.round(maintenance + adjust));
}

export function calculateGoal(p: Profile): number {
  return p.customGoal && p.customGoal > 0
    ? Math.round(p.customGoal)
    : calculatePlanGoal(p);
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
      .select('age, date_of_birth, height, weight, goal_type, sex, activity_level, custom_goal')
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
            sex: data.sex as Sex,
            activityLevel: data.activity_level as ActivityLevel,
            customGoal: data.custom_goal ? Number(data.custom_goal) : undefined,
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
        custom_goal: p.customGoal ?? null,
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