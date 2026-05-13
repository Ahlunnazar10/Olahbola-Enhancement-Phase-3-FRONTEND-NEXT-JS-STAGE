'use client';

import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

export async function redirectToGoogleAuth(): Promise<void> {
  try {
    // Get CSRF token first
    await apiClient.get('/sanctum/csrf-cookie');

    // Get the redirect URL from Laravel
    const response = await apiClient.post<{ url: string }>(
      endpoints.googleRedirect,
      {},
      { withCredentials: true }
    );

    // Redirect to Google's OAuth URL
    window.location.href = response.data.url;
  } catch (error) {
    console.error('Failed to redirect to Google auth:', error);
    throw error;
  }
}

export async function handleGoogleCallback(): Promise<{ token?: string; error?: string }> {
  try {
    // The callback is handled by Laravel, which sets the cookie
    // We just need to verify and get any additional data
    const response = await apiClient.get(endpoints.googleCallback, {
      withCredentials: true,
    });

    return { token: response.data.token };
  } catch (error) {
    console.error('Google callback error:', error);
    return { error: 'Authentication failed' };
  }
}

export async function handleGoogleOneTap(
  idToken: string
): Promise<{ user?: unknown; error?: string }> {
  try {
    await apiClient.get('/sanctum/csrf-cookie');

    const response = await apiClient.post(
      endpoints.googleOneTap,
      { id_token: idToken },
      { withCredentials: true }
    );

    return { user: response.data };
  } catch (error) {
    console.error('Google One Tap error:', error);
    return { error: 'One Tap sign-in failed' };
  }
}
