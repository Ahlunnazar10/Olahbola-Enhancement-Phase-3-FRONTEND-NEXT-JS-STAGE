'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, User, ProfileUpdateData, PasswordUpdateData } from '@/types';

// Get user profile
export function useProfile() {
  const { user, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(endpoints.profile);
      const userData = response.data.data;
      setUser(userData);
      return userData;
    },
    initialData: user,
    staleTime: 5 * 60 * 1000,
  });
}

// Update profile name
export function useUpdateProfileName() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiClient.put<ApiResponse<User>>(
        endpoints.profileUpdateName,
        data
      );
      return response.data.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Update profile email
export function useUpdateProfileEmail() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.put<ApiResponse<User>>(
        endpoints.profileUpdateEmail,
        data
      );
      return response.data.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Update profile city
export function useUpdateProfileCity() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { city: string }) => {
      const response = await apiClient.put<ApiResponse<User>>(
        endpoints.profileUpdateCity,
        data
      );
      return response.data.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Update profile phone
export function useUpdateProfilePhone() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { phone: string }) => {
      const response = await apiClient.put<ApiResponse<User>>(
        '/api/v1/profile/update-phone',
        data
      );
      return response.data.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Upload profile picture
export function useUploadProfilePicture() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await apiClient.post<ApiResponse<User>>(
        endpoints.profileUploadPicture,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Update password
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: PasswordUpdateData) => {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        endpoints.profileUpdatePassword,
        data
      );
      return response.data.data;
    },
  });
}

// Get quiz summary
export function useQuizSummary() {
  return useQuery({
    queryKey: ['quiz-summary'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/quiz/user-summary');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
