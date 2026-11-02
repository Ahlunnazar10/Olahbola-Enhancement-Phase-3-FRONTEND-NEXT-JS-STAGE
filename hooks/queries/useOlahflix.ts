'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

export interface Video {
	id: string;
	title: string;
	image: string;
	video: string;
	status: string;
	file_size: number;
	original_size: number;
	duration: number;
	uploader_id: string;
	updated_at: string;
	created_at: string;
}

export interface VideoListResponse {
	status: string;
	message: string;
	timestamp: string;
	metadata: {
		page: number;
		per_page: number;
		total: number;
		total_pages: number;
	};
	data: Video[];
}

export function useOlahflixVideos(page = 1, perPage = 15) {
	return useQuery({
		queryKey: ['videos', page, perPage],
		queryFn: async () => {
			const response = await apiClient.get<VideoListResponse>(
				endpoints.videos,
				{ params: { page, per_page: perPage } }
			);
			return response.data;
		},
		staleTime: 5 * 60 * 1000,
	});
}
