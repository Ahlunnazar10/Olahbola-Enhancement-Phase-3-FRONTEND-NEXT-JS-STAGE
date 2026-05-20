'use client';

import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';

interface PopularArticleCardProps {
  data: {
    id: string;
    title: string;
    slug: string;
    image: string;
    featured_image?: string;
    created_diff: string;
    views: number;
  };
  index?: number;
}

export function PopularArticleCard({ data, index }: PopularArticleCardProps) {
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const imageUrl = data.image || data.featured_image;
  const fullImageUrl = imageUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${imageUrl}`
    : '/placeholder.png';

  return (
    <Link href={`/${data.slug}`} className="flex gap-6 group cursor-pointer">
      <span className={`text-5xl font-display-xl transition-colors leading-none italic ${isDark ? "text-white/10 group-hover:text-primary/40" : "text-gray-300 group-hover:text-[#0a7c6e]/40 group-hover:border-[#0a7c6e]/20"}`}>
        {String((index ?? 0) + 1).padStart(2, '0')}
      </span>
      <div>
        <span className={`text-xs font-black uppercase tracking-[0.3em] ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}>
          TRENDING
        </span>
        <h4 className={`font-bold text-md uppercase tracking-tight leading-tight mt-1 group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
          {data.title}
        </h4>
        <div className={`flex items-center gap-4 mt-3 text-xs font-bold ${isDark ? "text-outline" : "text-[#5a5a5a]"}`}>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">visibility</span>{' '}
            {data.views}
          </span>
          <span>{data.created_diff}</span>
        </div>
      </div>
    </Link>
  );
}

export function PopularArticleCardSkeleton() {
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  return (
    <div className="flex gap-6 animate-pulse">
      <span className={`text-5xl font-display-xl leading-none italic ${isDark ? "text-white/10" : "text-gray-300"}`}>
        00
      </span>
      <div className="flex-1 space-y-3">
        <div className={`h-3 w-16 rounded ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
        <div className={`h-5 w-full rounded ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
        <div className={`h-3 w-24 rounded ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
      </div>
    </div>
  );
}