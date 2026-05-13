'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';

interface ArticleHomeCardProps {
  data: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    image: string;
    featured_image?: string;
    author_name: string;
    views: number;
    created_diff: string;
    category?: string;
  };
  index: number;
}

export function ArticleHomeCard({ data, index }: ArticleHomeCardProps) {
  const imageUrl = data.image || data.featured_image;
  const fullImageUrl = imageUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${imageUrl}`
    : '/placeholder.png';

  return (
    <div className="flex flex-col">
      <Link href={`/${data.slug}`} className="block overflow-hidden rounded-lg">
        <img
          src={fullImageUrl}
          alt={data.title}
          className="w-full h-[300px] object-cover object-top hover:scale-110 transition-transform duration-300"
        />
      </Link>

      <Link href={`/${data.slug}`}>
        <h3 className="font-medium text-2xl mt-5 mb-2 hover:text-[#0D645F] transition-colors">
          {data.title}
        </h3>
      </Link>

      <div className="flex flex-row items-center text-[14px] text-[#837F7E]">
        <Calendar className="size-4 mr-1" />
        <span>{data.created_diff}</span>
        <span className="px-2">●</span>
        <span className="notranslate">{data.author_name}</span>
        <span className="px-2">●</span>
        <span>{data.views} Kali Dibaca</span>
      </div>
    </div>
  );
}
