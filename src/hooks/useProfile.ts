import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';

import {
  getProfile,
  saveProfile,
  UserProfile,
} from '../services/profileService';

import {
  getUserWorkouts,
} from '../services/workoutService';

import {
  getUserCheckins,
  getStreak,
} from '../services/checkinService';

type ProfileState = {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  stats: {
    workouts: number;
    checkins: number;
    streak: number;
  };
};

export function useProfile(userId?: string) {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    saving: false,
    saved: false,
    stats: {
      workouts: 0,
      checkins: 0,
      streak: 0,
    },
  });

  /* ---------------- LOAD ---------------- */

  const load = async () => {
    if (!userId) return;

    setState((s) => ({ ...s, loading: true }));

    const [workouts, checkins, profile] = await Promise.all([
      getUserWorkouts(userId),
      getUserCheckins(userId),
      getProfile(userId),
    ]);

    setState((s) => ({
      ...s,
      profile,
      loading: false,
      stats: {
        workouts: workouts.length,
        checkins: checkins.length,
        streak: getStreak(checkins),
      },
    }));
  };

  /* ---------------- SAVE ---------------- */

  const save = async (data: UserProfile) => {
    if (!auth.currentUser) return;

    try {
      setState((s) => ({ ...s, saving: true }));

      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL || null,
      });

      await saveProfile({ ...data, userId: auth.currentUser.uid });

      setState((s) => ({
        ...s,
        profile: data,
        saving: false,
        saved: true,
      }));

      setTimeout(() => {
        setState((s) => ({ ...s, saved: false }));
      }, 2000);

    } catch (err) {
      console.error('useProfile save error:', err);
      setState((s) => ({ ...s, saving: false }));
    }
  };

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  return {
    profile: state.profile,
    loading: state.loading,
    saving: state.saving,
    saved: state.saved,
    stats: state.stats,
    save,
    reload: load,
  };
}