'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Sparkles, TrendingUp, Loader2, Flame, Zap, Star } from 'lucide-react';
import { useLeaderboard, useMyRank, useLeaderboardStats, useLeaderboardRegular, useLeaderboardSeason, useImageQuizLeaderboard } from '@/hooks/queries/useLeaderboard';
import { useAuthStore } from '@/stores/authStore';
import { getProfilePictureUrl } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

export default function LeaderboardPage() {
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'regular' | 'season' | 'image-quiz'>('regular');
  const [page, setPage] = useState(1);

  // Fetch data based on active tab
  const { data: regularData, isLoading: regularLoading } = useLeaderboardRegular(page, 20);
  const { data: seasonData, isLoading: seasonLoading } = useLeaderboardSeason(page, 20);
  const { data: imageQuizData, isLoading: imageQuizLoading } = useImageQuizLeaderboard(page, 20);
  const { data: myRank } = useMyRank();
  const { data: stats } = useLeaderboardStats();

  // Select data based on active tab
  const leaderboardData = activeTab === 'regular' ? regularData : activeTab === 'season' ? seasonData : imageQuizData;
  const isLoading = activeTab === 'regular' ? regularLoading : activeTab === 'season' ? seasonLoading : imageQuizLoading;

  const entries = leaderboardData?.data || [];
  const totalPages = leaderboardData?.metadata?.last_page || 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl animate-pulse blur-sm"></div>
            <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-2xl w-full h-full flex items-center justify-center">
              <Trophy className="size-7 text-white drop-shadow-lg" />
              <Sparkles className="size-3 text-yellow-200 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className="relative bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl w-full h-full flex items-center justify-center">
              <Medal className="size-7 text-white drop-shadow-lg" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className="relative bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl w-full h-full flex items-center justify-center">
              <Medal className="size-7 text-white drop-shadow-lg" />
            </div>
          </div>
        );
      default:
        return (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${isDark ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {rank}
          </div>
        );
    }
  };

  const getTabColor = () => {
    return isDark ? "text-[#43decc] border-[#43decc]" : "text-[#0a7c6e] border-[#0a7c6e]";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .glass-card {
          backdrop-filter: blur(20px);
          background: ${isDark ? "rgba(28, 33, 30, 0.6)" : "rgba(255, 255, 255, 0.8)"};
          border: 1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
        }

        .neon-glow {
          box-shadow: 0 0 20px ${isDark ? "rgba(67, 222, 204, 0.3)" : "rgba(10, 124, 110, 0.3)"};
        }
      `}</style>

      {/* Hero Banner */}
      <div
        className="h-[240px] md:h-[320px] bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/images/leaderboard/leaderboard-bg.webp')" }}
      >
        <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-t from-[#0f1412] via-black/60 to-transparent" : "bg-gradient-to-t from-[#f5f5f5] via-black/40 to-transparent"}`} />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-1/4 left-1/4 animate-ping" style={{ animationDelay: '0s' }}></div>
          <div className="absolute w-2 h-2 bg-[#43decc] rounded-full top-1/3 right-1/4 animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-2 h-2 bg-yellow-400 rounded-full bottom-1/3 left-1/3 animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container-custom relative z-10 h-full flex flex-col justify-end pb-10">
          <div className="animate-slide-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 glass-card">
              <Flame className={`size-4 ${isDark ? "text-[#43decc]" : "text-[#0a7c6e]"}`} />
              <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#43decc]" : "text-[#0a7c6e]"}`}>
                Live Rankings
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic text-white mb-3 drop-shadow-2xl">
              Leaderboard
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium">
              Siapa yang paling jagokatmu sekarang! ⚽
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {isAuthenticated && stats && (
        <div className="container-custom -mt-8 relative z-20 mb-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="glass-card rounded-2xl p-4 md:p-6 text-center animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${isDark ? "bg-[#43decc]/20" : "bg-[#0a7c6e]/20"}`}>
                <TrendingUp className={`size-6 ${isDark ? "text-[#43decc]" : "text-[#0a7c6e]"}`} />
              </div>
              <p className={`text-2xl md:text-3xl font-black ${isDark ? "text-[#43decc]" : "text-[#0a7c6e]"}`}>
                {stats.total_participants || 0}
              </p>
              <p className={`text-xs md:text-sm font-medium ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Peserta</p>
            </div>
            <div className="glass-card rounded-2xl p-4 md:p-6 text-center animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-green-500/20">
                <Zap className="size-6 text-green-500" />
              </div>
              <p className="text-2xl md:text-3xl font-black text-green-500">
                {stats.total_quizzes_taken || 0}
              </p>
              <p className={`text-xs md:text-sm font-medium ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Total Quiz</p>
            </div>
            <div className="glass-card rounded-2xl p-4 md:p-6 text-center anicale-in hover:scale-105 transitioform duration-300" style={{ animationDelay: '0.3s' }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-yellow-500/20">
                <Star className="size-6 text-yellow-500" />
              </div>
              <p className="text-2xl md:text-3xl font-black text-yellow-500">
                {stats.average_score || 0}%
              </p>
              <p className={`text-xs md:text-sm font-medium ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Rata-rata</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`shadow-lg sticky top-[84px] z-40 glass-card border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
        <div className="container-custom">
          <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => { setActiveTab('regular'); setPage(1); }}
              className={`px-4 md:px-6 py-4 font-bold text-sm md:text-base border-b-3 transition-all whitespace-nowrap ${
                activeTab === 'regular'
                  ? getTabColor()
              : `${isDark ? "text-white/60 border-transparent hover:text-white/80" : "text-gray-500 border-transparent hover:text-gray-700"}`
              }`}
            >
              🏆 Regular
            </button>
            <button
              onClick={() => { setActiveTab('season'); setPage(1); }}
              className={`px-4 md:px-6 py-4 font-bold text-sm md:text-base border-b-3 transition-all whitespace-nowrap ${
                activeTab === 'season'
                  ? getTabColor()
                  : `${isDark ? "text-white/60 border-transparent hover:text-white/80" : "text-gray-500 border-transparent hover:text-gray-700"}`
       }`}
            >
              ⚡ Season
            </button>
            <button
              onClick={() => { setActiveTab('image-quiz'); setPage(1); }}
              className={`px-4 md:px-6 py-4 font-bold text-sm md:text-base border-b-3 transition-all whitespace-nowrap ${
                activeTab === 'image-quiz'
                  ? getTabColor()
                  : `${isDark ? "text-white/60 border-transparent hover:text-white/80" : "text-gray-500 border-transparent hover:text-gray-700"}`
              }`}
            >
              🖼️ Image Quiz
            </button>
          </div>
        </div>
      </div>

      {/* My Rank Card */}
      {isAuthenticated && myRank && (
        <div className="container-custom py-6">
          <div className={`glass-card rounded-2xl p-6 neon-glow animate-scale-in ${isDark ? "bg-gradient-to-r from-[#0D645F] to-[#0a7c6e]" : "bg-gradient-to-r from-[#0a7c6e] to-[#43decc]"} text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={getProfilePictureUrl(user?.profilePicture)}
                    alt={user?.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-3 border-white shadow-xl object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black font-black text-xs px-2 py-1 rounded-lg shadow-lg">
                    #{myRank.rank || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Peringkatmu</p>
                  <p className="font-black text-2xl md:text-3xl mb-1">{user?.name}</p>
                  <div className="flex items-center gap-2">
                    <img src="/icons/ball.svg" alt="ball" className="w-4 h-4" />
                    <p className="font-bold text-lg">{myRank.points || 0} poin</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <Flame className="size-16 text-yellow-300 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="container-custom py-6 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className={`size-12 animate-spin mb-4 ${isDark ? "text-[#43decc]" : "text-[#0a7c6e]"}`} />
            <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Memuat data...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className={`text-center py-16 glass-card rounded-2xl ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
            <Trophy className={`size-16 mx-auto mb-4 ${isDark ? "text-white/30" : "text-gray-300"}`} />
            <p className="text-lg font-bold mb-2">Belum ada data leaderboard</p>
            <p className="text-sm mb-4">Jadilah yang pertama!</p>
            <Link href="/quiz" className={`inline-block px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${isDark ? "bg-[#43decc] text-black" : "bg-[#0a7c6e] text-white"}`}>
              Ikuti Quiz Sekarang
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
              {entries.slice(0, 3).map((entry: any, index: number) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                return (
                  <div
                    key={entry.user_id}
                    className={`glass-card rounded-2xl p-4 md:p-6 text-center animate-scale-in hover:scale-105 transition-all duration-300 ${
                      isFirst ? 'order-2 md:order-2 neon-glow' : isSecond ? 'order-1' : 'order             } ${isFirst ? (isDark ? 'bg-gradient-to-b from-yellow-500/20 to-transparent' : 'bg-gradient-to-b from-yellow-400/20 to-transparent') : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Rank Badge */}
                    <div className="flex justify-center mb-4">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* Profile Picture */}
                    <div className="relative inline-block mb-3">
                      <img
                        src={getProfilePictureUrl(entry.profile_picture)}
                        alt={entry.user_name}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-3 ${
                          isFirst ? 'border-yellow-400' : isSecond ? 'border-gray-300' : 'border-amber-600'
                        } shadow-lg`}
                      />
                      {isFirst && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black font-black text-xs px-2 py-1 rounded-lg animate-pulse">
                          👑
                        </div>
            )}
                    </div>

                    {/* Name */}
                    <p className={`font-bold text-sm md:text-base notranslate truncate mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {entry.user_name}
                    </p>

                    {/* Points */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                      isFirst ? 'bg-yellow-400/20' : isSecond ? 'bg-gray-300/20' : 'bg-amber-600/20'
                    }`}>
                      <img src="/icons/ball.svg" alt="ball" className="w-4 h-4" />
                      className={`text-xl md:text-2xl font-black ${
                        isFirst ? 'text-yellow-400' : isSecond ? (isDark ? 'text-gray-300' : 'text-gray-600') : 'text-amber-600'
                      }`}>
                        {entry.points}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? "text-white/60" : "text-gray-500"}`}>poin</p>
                  </div>
                );
              })}
            </div>

            {/* Rest of the list */}
            <div className="space-y-3">
              {entries.slice(3).map((entry: any, index: number) => (
                <div
                  key={entry.user_id}
                  className={`glass-card rounded-2xl px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4 hover:scale-[1.02] transition-all duration-300 animate-slide-in-up`}
                  style={{ animationDelay: `${(index + 3) * 0.05}s` }}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Profile Picture */}
                  <img
                    src={getProfilePictureUrl(entry.proicture)}
                    alt={entry.user_name}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover flex-shrink-0 border-2 border-white/10"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm md:text-base notranslate truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {entry.user_name}
                    </p>
                    {entry.city && (
                      <p className={`text-xs truncate ${isDark ? "text-white/60" : "text-gra500"}`}>
                 📍 {entry.city}
                      </p>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <img src="/icons/ball.svg" alt="ball" className="w-4 h-4" />
                      <p className={`font-black text-lg md:text-xl ${isDark ? "text-[#43decc]" : "text-[#0a7c6e]"}`}>
                        {entry.points}
                      </p>
                    </div>
                    <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>p
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 md:px-6 py-3 rounded-xl font-bold transition-all ${
                    page === 1
                      ? `${isDark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-300"} cursor-not-allowed`
                      : `${isDark ? "bg-[#43decc] text-black hover:bg-[#43decc]/80" : "bg-[#0a7c6e] text-white hover:bg-[#0a7c6e]/80"} hover:scale-105`
                  }`}
                >
                  ← Prev
                </button>
                <span className={`px-4 py-2 font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-4 md:px-6 py-3 rounded-xl font-bold transition-all ${
                    page === totalPages
                      ? `${isDark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-300"} cursor-not-allowed`
                      : `${isDark ? "bg-[#43decc] text-black hover:bg-[#43decc]/80" : "bg-[#0a7c6e] text-white hover:bg-[#0a7c6e]/80"} hover:scale-105`
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
