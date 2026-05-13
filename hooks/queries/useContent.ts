'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

interface Interview {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string;
  post_url?: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  published_at: string;
  created_at: string;
}

interface Kolaborasi {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  link: string | null;
  status: 'active' | 'inactive';
  published_at: string;
  created_at: string;
}

interface Sapa {
  id: string;
  name: string;
  message: string;
  is_featured: boolean;
  created_at: string;
}

// Interview hooks
export function useInterviews(page = 1, perPage = 12) {
  return useQuery({
    queryKey: ['interviews', page, perPage],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.interviews, {
        params: { page, per_page: perPage },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useInterviewDetail(slug: string) {
  return useQuery({
    queryKey: ['interview', slug],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.interviewDetail(slug));
      return response.data;
    },
    enabled: !!slug,
  });
}

// Kolaborasi hooks
export function useKolaborasis(page = 1, perPage = 12) {
  return useQuery({
    queryKey: ['kolaborasis', page, perPage],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.kolaborasis, {
        params: { page, per_page: perPage },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useKolaborasiDetail(slug: string) {
  return useQuery({
    queryKey: ['kolaborasi', slug],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.kolaborasiDetail(slug));
      return response.data;
    },
    enabled: !!slug,
  });
}

// Sapa hooks
export function useSapa() {
  return useQuery({
    queryKey: ['sapa'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.sapa);
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
