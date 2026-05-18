'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useInterviewDetail } from '@/hooks/queries/useContent';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const { data, isLoading, error } = useInterviewDetail(slug);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
        <Loader2 className={`size-10 animate-spin ${isDark ? "text-green" : "text-[#0a7c6e]"}`} />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Interview Tidak Ditemukan</h1>
          <Link href="/interview" className={`inline-block px-6 py-3 rounded-lg font-medium ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}>
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const interview = data.data;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
      {/* Hero */}
      <div className="relative h-[300px] md:h-[450px] bg-cover bg-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL}/storage/${interview.featured_image})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <Link
          href="/interview"
          className="absolute top-24 left-4 md:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="size-5" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Content */}
      <div className="container-custom -mt-20 relative z-10">
        <div className={`rounded-xl shadow-lg p-6 md:p-10 ${isDark ? "bg-[#1c211e]" : "bg-white"}`}>
          <h1 className={`text-2xl md:text-4xl font-bold mb-4 notranslate ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
            {interview.title}
          </h1>

          <div className={`flex flex-wrap items-center gap-4 mb-6 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
            <span>{formatDate(interview.published_at || interview.created_at)}</span>
          </div>

          {/* Featured Image */}
          <div className="w-full h-[300px] md:h-[450px] mb-8 rounded-lg overflow-hidden">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${interview.featured_image}`}
              alt={interview.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div
            className={`max-w-none ${isDark ? "text-white/90 [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/80 [&_a]:text-primary [&_a]:underline [&_ul_li]:text-white/80 [&_ol_li]:text-white/80 [&_strong]:text-white [&_img]:rounded-lg" : "text-[#1a1a1a] [&_h2]:text-[#1a1a1a] [&_h3]:text-[#1a1a1a] [&_p]:text-[#5a5a5a] [&_a]:text-[#0a7c6e] [&_a]:underline [&_ul_li]:text-[#5a5a5a] [&_ol_li]:text-[#5a5a5a] [&_strong]:text-[#1a1a1a] [&_img]:rounded-lg"}`}
            dangerouslySetInnerHTML={{ __html: interview.content }}
          />

          {/* CTA */}
          {interview.post_url && (
            <div className={`mt-10 pt-8 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <a
                href={interview.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}
              >
                <ExternalLink className="size-5" />
                Lihat Interview Lengkap
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
