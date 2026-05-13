'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, accessToken?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  accessToken: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      login: (user, accessToken) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          accessToken: accessToken || null,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          accessToken: null,
        });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data + access token
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);