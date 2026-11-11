import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export type GoalType = 'lose' | 'maintain' | 'gain';
export type Profile = {
  age: number;
  height: number; // cm
  weight: number; // kg
  goalType: GoalType;
};

const DEFAULT_GOAL = 1200;

export function calculateGoal(p: Profile): number {
  // Mifflin-St Jeor formula (average of male and female), light activity
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age - 78;
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
      .select('age, height, weight, goal_type')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data && data.age && data.height && data.weight) {
          setProfile({
            age: Number(data.age),
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
        age: p.age,
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