'use client';

import { apiClient, refreshCsrfToken } from '@/lib/api/client';

export async function initCsrf(): Promise<void> {
  try {
    await apiClient.get('/sanctum/csrf-cookie');
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error);
    throw error;
  }
}

export async function refreshCsrf(): Promise<void> {
  await refreshCsrfToken();
}

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
