'use client';

import Link from 'next/link';

interface CategoryListCardProps {
  data: {
    id: string;
    name: string;
    slug: string;
    article_count: number;
  };
  index: number;
}

export function CategoryListCard({ data, index }: CategoryListCardProps) {
  return (
    <div className="flex flex-col">
      <Link
        href={`/artikel/kategori/${data.slug}`}
        className="flex flex-row justify-between gap-5"
      >
        <p className="text-[#837F7E] text-lg font-medium hover:text-[#0D645F] transition-colors">
          {data.name}
        </p>
        <div className="bg-white rounded-full flex justify-center items-center px-1.5">
          <p className="text-[#837F7E] text-sm font-bold">({data.article_count})</p>
        </div>
      </Link>
      <div className="w-full h-[1px] bg-[#DBDFE4] my-2" />
    </div>
  );
}
