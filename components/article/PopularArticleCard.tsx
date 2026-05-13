'use client';

import Link from 'next/link';

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
  const imageUrl = data.image || data.featured_image;
  const fullImageUrl = imageUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${imageUrl}`
    : '/placeholder.png';

  return (
    <Link href={`/${data.slug}`} className="flex gap-6 group cursor-pointer">
      <span className="text-5xl font-display-xl text-white/10 group-hover:text-primary/40 transition-colors leading-none italic">
        {String((index ?? 0) + 1).padStart(2, '0')}
      </span>
      <div>
        <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">
          TRENDING
        </span>
        <h4 className="font-bold text-md uppercase tracking-tight leading-tight mt-1 group-hover:text-primary transition-colors">
          {data.title}
        </h4>
        <div className="flex items-center gap-4 mt-3 text-xs text-outline font-bold">
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
  return (
    <div className="flex gap-6 animate-pulse">
      <span className="text-5xl font-display-xl text-white/10 leading-none italic">
        00
      </span>
      <div className="flex-1 space-y-3">
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-5 bg-white/10 rounded w-full" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
    </div>
  );
}