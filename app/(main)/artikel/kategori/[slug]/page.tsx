'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ArticleCard, ArticleCardSkeleton } from '@/components/article/ArticleCard';
import { useArticleByCategory, useArticleCategories } from '@/hooks/queries/useArticles';
import { useUIStore } from '@/stores/uiStore';

export default function CategoryArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [page, setPage] = useState(1);
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const { data: articlesData, isLoading } = useArticleByCategory(slug);
  const { data: categories } = useArticleCategories();

  const currentCategory = categories?.data?.find((c: any) => c.slug === slug);

  if (!currentCategory && !isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Kategori Tidak Ditemukan</h1>
          <p className={`mb-6 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Kategori yang kamu cari tidak ada.</p>
          <Link href="/artikel" className={`inline-block px-6 py-3 rounded-lg font-medium ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}>
            Kembali ke Artikel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
      {/* Hero Banner */}
      <div
        className="h-[200px] md:h-[280px] bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/artikel/artikel-bg.webp')" }}
      >
        <div className={`absolute inset-0 ${isDark ? "bg-linear-to-t from-black/70 to-transparent" : "bg-linear-to-t from-black/50 to-transparent"}`} />
        <div className="container-custom relative z-10 h-full flex flex-col justify-end pb-8">
          <Link
            href="/artikel"
            className="absolute top-24 left-4 md:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span>Kembali</span>
          </Link>
          <h1 className="text-white text-3xl md:text-4xl font-bold">{currentCategory?.name || 'Kategori'}</h1>
          <p className="text-white/80 text-lg mt-2">
            {currentCategory?.article_count || 0} artikel
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container-custom py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : articlesData?.data?.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white/60" : "text-gray-600"}`}>Tidak ada artikel</h3>
            <p className={isDark ? "text-white/40" : "text-gray-500"}>Kategori ini belum memiliki artikel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articlesData?.data?.map((article: any, index: number) => (
              <ArticleCard key={article.id} data={article} index={index} />
            ))}
          </div>
        )}

        {/* Back to All Articles */}
        <div className="text-center mt-10">
          <Link href="/artikel" className={`inline-block px-8 py-3 rounded-lg font-medium border-2 transition-colors ${isDark ? "border-green text-green hover:bg-green hover:text-black" : "border-[#0a7c6e] text-[#0a7c6e] hover:bg-[#0a7c6e] hover:text-white"}`}>
            Lihat Semua Artikel
          </Link>
        </div>
      </div>
    </div>
  );
}
