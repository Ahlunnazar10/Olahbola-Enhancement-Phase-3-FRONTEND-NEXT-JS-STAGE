"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Newspaper, Loader2 } from "lucide-react";
import { useArticleSearch } from "@/hooks/queries/useArticles";
import { getImageUrl, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useUIStore } from "@/stores/uiStore";

interface SearchPanelProps {
  onClose: () => void;
}

interface SearchArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  created_diff?: string;
  category_name?: string;
  published_at?: string;
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data, isLoading } = useArticleSearch(debouncedQuery);
  const articles: SearchArticleItem[] = data?.data || [];

  const handleSelect = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/artikel/${slug}`);
    },
    [onClose, router]
  );

  const hasSearched = debouncedQuery.trim().length > 0;

  return (
    <div className="absolute top-full left-0 right-0 z-50">
      <div
        className={cn(
          "glass-card rounded-b-xl border border-t-0 p-3 md:p-4",
          isDark
            ? "bg-[#0f1412]/95 border-primary/20"
            : "bg-white/95 border-primary/20"
        )}
      >
        {/* Input form */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors",
            isDark
              ? "bg-white/5 border border-primary/15 focus-within:border-primary/40"
              : "bg-[#0f1412]/5 border border-primary/15 focus-within:border-primary/40"
          )}
        >
          <Search
            className={cn(
              "size-5 shrink-0",
              isDark ? "text-primary" : "text-primary"
            )}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel, berita, tim, atau topik..."
            className={cn(
              "flex-1 bg-transparent outline-none text-[14px] md:text-[15px] placeholder:text-[#6b7280]",
              isDark ? "text-white" : "text-[#1a1a1a]"
            )}
            aria-label="Cari artikel"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
                inputRef.current?.focus();
              }}
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer",
                isDark
                  ? "text-white/40 hover:text-white/70 hover:bg-white/10"
                  : "text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 hover:bg-black/5"
              )}
              aria-label="Bersihkan"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="mt-3">
            {isLoading ? (
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-4",
                  isDark ? "text-white/50" : "text-[#1a1a1a]/50"
                )}
              >
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-[13px]">Mencari hasil...</span>
              </div>
            ) : articles.length > 0 ? (
              <>
                <p
                  className={cn(
                    "text-[11px] uppercase tracking-widest px-3 pb-2 font-bold",
                    isDark ? "text-white/30" : "text-[#1a1a1a]/30"
                  )}
                >
                  {articles.length} hasil ditemukan
                </p>
                <ul
                  className="flex flex-col max-h-[50vh] overflow-y-auto"
                  role="listbox"
                >
                  {articles.map((article) => (
                    <li key={article.id}>
                      <button
                        onClick={() => handleSelect(article.slug)}
                        className={cn(
                          "w-full flex items-start gap-3 p-2.5 rounded-lg text-left cursor-pointer transition-colors group",
                          isDark
                            ? "hover:bg-primary/10"
                            : "hover:bg-primary/10"
                        )}
                      >
                        {/* Thumbnail */}
                        {article.image && (
                          <div className="w-16 h-12 rounded-md overflow-hidden shrink-0 bg-primary/5">
                            <Image
                              src={getImageUrl(article.image)}
                              alt=""
                              width={64}
                              height={48}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "font-semibold text-[13px] md:text-[14px] leading-snug line-clamp-2",
                              isDark
                                ? "text-white group-hover:text-primary"
                                : "text-[#1a1a1a] group-hover:text-primary"
                            )}
                          >
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {article.category_name && (
                              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                                {article.category_name}
                              </span>
                            )}
                            {(article.created_diff ||
                              article.published_at) && (
                              <span
                                className={cn(
                                  "text-[11px]",
                                  isDark
                                    ? "text-white/40"
                                    : "text-[#1a1a1a]/40"
                                )}
                              >
                                {article.created_diff ||
                                  formatRelativeTime(article.published_at!)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Newspaper
                          className={cn(
                            "size-4 shrink-0 mt-0.5 opacity-30 group-hover:opacity-70 transition-opacity",
                            isDark ? "text-white" : "text-[#1a1a1a]"
                          )}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div
                className={cn(
                  "text-center py-6 px-3",
                  isDark ? "text-white/40" : "text-[#1a1a1a]/40"
                )}
              >
                <p className="text-[14px]">
                  Tidak ada hasil untuk &ldquo;{debouncedQuery}&rdquo;
                </p>
                <p className="text-[12px] mt-1">
                  Coba kata kunci lain atau periksa ejaan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state — belum search */}
        {!hasSearched && (
          <div
            className={cn(
              "text-center py-4 px-3",
              isDark ? "text-white/30" : "text-[#1a1a1a]/30"
            )}
          >
            <p className="text-[13px]">
              Ketik untuk mulai mencari artikel, berita, atau topik.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
