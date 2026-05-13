'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Mobile menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Sticky sidebar
  isSidebarSticky: boolean;
  setSidebarSticky: (sticky: boolean) => void;

  // Modals
  isLevelLockedModalOpen: boolean;
  lockedLevelData: { level: number; message?: string } | null;
  openLevelLockedModal: (level: number, message?: string) => void;
  closeLevelLockedModal: () => void;

  // Toast queue
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Loading states
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;

  // Translation state
  isTranslating: boolean;
  setTranslating: (translating: boolean) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Mobile menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Sticky sidebar
  isSidebarSticky: true,
  setSidebarSticky: (sticky) => set({ isSidebarSticky: sticky }),

  // Level locked modal
  isLevelLockedModalOpen: false,
  lockedLevelData: null,
  openLevelLockedModal: (level, message) =>
    set({ isLevelLockedModalOpen: true, lockedLevelData: { level, message } }),
  closeLevelLockedModal: () =>
    set({ isLevelLockedModalOpen: false, lockedLevelData: null }),

  // Toast
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substring(7) }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Page loading
  isPageLoading: false,
  setPageLoading: (loading) => set({ isPageLoading: loading }),

  // Translation
  isTranslating: false,
  setTranslating: (translating) => set({ isTranslating: translating }),
    }),
    {
      name: 'ui-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
