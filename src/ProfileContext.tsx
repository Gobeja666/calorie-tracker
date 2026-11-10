import { createContext, useContext, useState, ReactNode } from 'react';
import { usePersistentState } from './usePersistentState';

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

  return (
    <ProfileContext.Provider value={{ profile, goal, saveProfile: setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}