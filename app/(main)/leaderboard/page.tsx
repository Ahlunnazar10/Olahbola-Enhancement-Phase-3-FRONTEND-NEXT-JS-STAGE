'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Medal, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useLeaderboard, useMyRank, useLeaderboardStats } from '@/hooks/queries/useLeaderboard';
import { useAuthStore } from '@/stores/authStore';
import { getProfilePictureUrl } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

export default function LeaderboardPage() {
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'regular' | 'season' | 'image-quiz'>('regular');
  const [page, setPage] = useState(1);

  const { data: leaderboardData, isLoading } = useLeaderboard(page, 20);
  const { data: myRank } = useMyRank();
  const { data: stats } = useLeaderboardStats();

  const entries = leaderboardData?.data || [];
  const totalPages = leaderboardData?.metadata?.last_page || 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="size-6 text-yellow-500" />;
      case 2:
        return <Medal className="size-6 text-gray-400" />;
      case 3:
        return <Medal className="size-6 text-amber-600" />;
      default:
        return <span className="font-bold text-gray-500">{rank}</span>;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
      {/* Hero Banner */}
      <div
        className="h-[200px] md:h-[280px] bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/leaderboard/leaderboard-bg.webp')" }}
      >
        <div className={`absolute inset-0 ${isDark ? "bg-linear-to-t from-black/80 to-transparent" : "bg-linear-to-t from-black/60 to-transparent"}`} />
        <div className="container-custom relative z-10 h-full flex flex-col justify-end pb-8">
          <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-white" : "text-white"}`}>Leaderboard</h1>
          <p className={`text-lg mt-2 ${isDark ? "text-white/80" : "text-white/90"}`}>Papan peringkat quiz</p>
        </div>
      </div>

      {/* Stats Cards */}
      {isAuthenticated && stats && (
        <div className="container-custom py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-xl p-4 shadow-md text-center ${isDark ? "bg-[#1c211e] text-white" : "bg-white text-[#1a1a1a]"}`}>
              <p className={`text-2xl font-bold ${isDark ? "text-green" : "text-[#0a7c6e]"}`}>
                {stats.total_participants || 0}
              </p>
              <p className={`text-xs ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Total Peserta</p>
            </div>
            <div className={`rounded-xl p-4 shadow-md text-center ${isDark ? "bg-[#1c211e] text-white" : "bg-white text-[#1a1a1a]"}`}>
              <p className="text-2xl font-bold text-green-500">
                {stats.total_quizzes_taken || 0}
              </p>
              <p className={`text-xs ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Total Quiz</p>
            </div>
            <div className={`rounded-xl p-4 shadow-md text-center ${isDark ? "bg-[#1c211e] text-white" : "bg-white text-[#1a1a1a]"}`}>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.average_score || 0}%
              </p>
              <p className={`text-xs ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Rata-rata Skor</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`shadow-md sticky top-[84px] z-40 ${isDark ? "bg-[#1c211e]" : "bg-white"}`}>
        <div className="container-custom">
          <div className="flex gap-4">
            <button
              onClick={() => { setActiveTab('regular'); setPage(1); }}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'regular'
                  ? `${isDark ? "text-green border-green" : "text-[#0a7c6e] border-[#0a7c6e]"}`
                  : `${isDark ? "text-white/60 border-transparent hover:text-white" : "text-gray-500 border-transparent hover:text-gray-700"}`
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => { setActiveTab('season'); setPage(1); }}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'season'
                  ? `${isDark ? "text-green border-green" : "text-[#0a7c6e] border-[#0a7c6e]"}`
                  : `${isDark ? "text-white/60 border-transparent hover:text-white" : "text-gray-500 border-transparent hover:text-gray-700"}`
              }`}
            >
              Season
            </button>
            <button
              onClick={() => { setActiveTab('image-quiz'); setPage(1); }}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'image-quiz'
                  ? `${isDark ? "text-green border-green" : "text-[#0a7c6e] border-[#0a7c6e]"}`
                  : `${isDark ? "text-white/60 border-transparent hover:text-white" : "text-gray-500 border-transparent hover:text-gray-700"}`
              }`}
            >
              Image Quiz
            </button>
          </div>
        </div>
      </div>

      {/* My Rank Card */}
      {isAuthenticated && myRank && (
        <div className="container-custom py-6">
          <div className={`rounded-xl p-6 ${isDark ? "bg-[#0D645F] text-white" : "bg-[#0a7c6e] text-white"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={isDark ? "text-white/70 text-sm" : "text-white/80 text-sm"}>Peringkatmu</p>
                <p className="text-4xl font-bold">#{myRank.rank || '-'}</p>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={getProfilePictureUrl(user?.profilePicture)}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="text-right">
                  <p className="font-bold">{user?.name}</p>
                  <p className={isDark ? "text-white/70" : "text-white/80"}>{myRank.points || 0} points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="container-custom py-6 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className={`size-10 animate-spin ${isDark ? "text-green" : "text-[#0a7c6e]"}`} />
          </div>
        ) : entries.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
            <Trophy className={`size-12 mx-auto mb-4 ${isDark ? "text-white/30" : "text-gray-300"}`} />
            <p>Belum ada data leaderboard</p>
            <Link href="/quiz" className={`mt-2 inline-block ${isDark ? "text-green hover:underline" : "text-[#0a7c6e] hover:underline"}`}>
              Ikuti Quiz Sekarang
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {entries.slice(0, 3).map((entry: any, index: number) => (
                <div
                  key={entry.user_id}
                  className={`rounded-xl p-6 shadow-md text-center ${
                    index === 0 ? 'order-2 lg:order-2' : index === 1 ? 'order-1' : 'order-3'
                  } ${isDark ? "bg-[#1c211e]" : "bg-white"}`}
                >
                  <div className="flex justify-center mb-3">
                    {index === 0 ? (
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Trophy className="size-8 text-yellow-500" />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                        <Medal className="size-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className={`font-bold notranslate truncate ${isDark ? "text-white" : "text-gray-900"}`}>{entry.user_name}</p>
                  <p className={`text-2xl font-bold ${isDark ? "text-green" : "text-[#0a7c6e]"}`}>{entry.points}</p>
                  <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>points</p>
                </div>
              ))}
            </div>

            {/* Rest of the list */}
            <div className={`rounded-xl shadow-md overflow-hidden ${isDark ? "bg-[#1c211e]" : "bg-white"}`}>
              {entries.slice(3).map((entry: any, index: number) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    index !== entries.slice(3).length - 1 ? `${isDark ? "border-b border-white/10" : "border-b border-gray-100"}` : ''
                  }`}
                >
                  <div className="w-12 text-center">{getRankIcon(entry.rank)}</div>
                  <img
                    src={getProfilePictureUrl(entry.profile_picture)}
                    alt={entry.user_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium notranslate truncate ${isDark ? "text-white" : "text-gray-900"}`}>{entry.user_name}</p>
             {entry.city && (
                      <p className={`text-xs truncate ${isDark ? "text-white/60" : "text-gray-500"}`}>{entry.city}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isDark ? "text-green" : "text-[#0a7c6e]"}`}>{entry.points}</p>
                    <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>points</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`btn btn-sm btn-outline ${isDark ? "text-white border-white/20 hover:bg-white/10" : ""}`}
                >
                  Previous
                </button>
                <span className={`px-4 py-2 ${isDark ? "text-white" : ""}`}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`btn btn-sm btn-outline ${isDark ? "text-white border-white/20 hover:bg-white/10" : ""}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
