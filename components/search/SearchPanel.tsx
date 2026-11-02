"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	Search,
	X,
	Calendar,
	Eye,
	ArrowRight,
	Loader2,
	UserPen,
} from "lucide-react";
import { useArticleSearch } from "@/hooks/queries/useArticles";
import { getImageUrl, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
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
	author_name?: string;
	views?: number;
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
		[onClose, router],
	);

	const hasSearched = debouncedQuery.trim().length > 0;

	return (
		<div className="absolute top-full left-0 right-0 z-50">
			<div
				className={cn(
					"rounded-b-xl border px-3 md:px-8 py-6 md:py-10 shadow-xl",
					isDark
						? "bg-[#0f1412] border-primary/30 shadow-black/50"
						: "bg-white border-primary/30 shadow-black/10",
				)}
			>
				{/* Input form */}
				<div
					className={cn(
						"flex w-100 items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors",
						isDark
							? "bg-white/5 border border-primary/15 focus-within:border-primary/40"
							: "bg-[#0f1412]/5 border border-primary/15 focus-within:border-primary/40",
					)}
				>
					<Search
						className={cn(
							"size-5 shrink-0",
							isDark ? "text-primary" : "text-primary",
						)}
					/>
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Cari artikel, berita, tim, atau topik..."
						className={cn(
							"flex-1 bg-transparent outline-none text-[14px] md:text-[15px] placeholder:text-[#6b7280]",
							isDark ? "text-white" : "text-[#1a1a1a]",
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
									: "text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 hover:bg-black/5",
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
									isDark ? "text-white/50" : "text-[#1a1a1a]/50",
								)}
							>
								<Loader2 className="size-4 animate-spin text-primary" />
								<span className="text-[13px]">Mencari hasil...</span>
							</div>
						) : articles.length > 0 ? (
							<>
								<p
									className={cn(
										"text-[11px] uppercase tracking-widest px-1 pb-3 font-bold",
										isDark ? "text-white/30" : "text-[#1a1a1a]/30",
									)}
								>
									{articles.length} hasil ditemukan
								</p>
								<div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 max-h-[60vh] overflow-y-auto">
									{articles.map((article) => (
										<button
											key={article.id}
											onClick={() => handleSelect(article.slug)}
											className={cn(
												"rounded-xl overflow-hidden flex flex-col text-left cursor-pointer transition-all duration-300 group border",
												isDark
													? "glass-card hover:shadow-[0_0_20px_rgba(67,222,204,0.15)] hover:border-primary/30"
													: "bg-white shadow-md border-gray-200 hover:shadow-lg hover:border-[#0a7c6e]/30",
											)}
										>
											{/* Cover image */}
											{article.image ? (
												<div className="h-24 overflow-hidden relative">
													<img
														src={getImageUrl(article.image)}
														alt={article.title}
														width={256}
														height={128}
														loading="lazy"
														className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
													/>
												</div>
											) : (
												<div
													className={cn(
														"h-24",
														isDark ? "bg-primary/10" : "bg-gray-100",
													)}
												/>
											)}

											{/* Content */}
											<div className="p-2.5 flex-1 flex flex-col justify-between">
												<div>
													{/* Meta */}
													<div className="flex flex-row flex-wrap gap-x-2 gap-y-1 mb-1.5">
														<div className="flex flex-row items-center gap-1">
															<UserPen
																className={cn(
																	"size-3",
																	isDark ? "text-primary" : "text-[#0a7c6e]",
																)}
															/>
															<p
																className={cn(
																	"text-[10px] uppercase tracking-widest",
																	isDark
																		? "text-on-surface-variant"
																		: "text-[#5a5a5a]",
																)}
															>
																{article.author_name?.split(" ")[0]}
															</p>
														</div>
														<div className="flex flex-row items-center gap-1">
															<Calendar
																className={cn(
																	"size-3",
																	isDark ? "text-primary" : "text-[#0a7c6e]",
																)}
															/>
															<p
																className={cn(
																	"text-[10px] uppercase tracking-widest",
																	isDark
																		? "text-on-surface-variant"
																		: "text-[#5a5a5a]",
																)}
															>
																{article.created_diff ||
																	(article.published_at
																		? formatRelativeTime(article.published_at)
																		: "")}
															</p>
														</div>
														{typeof article.views === "number" && (
															<div className="flex flex-row items-center gap-1">
																<Eye
																	className={cn(
																		"size-3",
																		isDark ? "text-primary" : "text-[#0a7c6e]",
																	)}
																/>
																<p
																	className={cn(
																		"text-[10px] tracking-widest",
																		isDark
																			? "text-on-surface-variant"
																			: "text-[#5a5a5a]",
																	)}
																>
																	{article.views}
																</p>
															</div>
														)}
													</div>

													{/* Title */}
													<h3
														className={cn(
															"font-bold text-[11px] md:text-[13px] uppercase tracking-tighter leading-tight line-clamp-2 transition-colors",
															isDark
																? "text-white group-hover:text-primary"
																: "text-[#1a1a1a] group-hover:text-[#0a7c6e]",
														)}
													>
														{article.title}
													</h3>

												</div>

												{/* Footer */}
												<div className="flex justify-between items-center mt-2 text-primary font-bold text-[11px] md:text-xs">
													Selengkapnya
													<ArrowRight className="size-3.5" />
												</div>
											</div>
										</button>
									))}
								</div>
							</>
						) : (
							<div
								className={cn(
									"text-center py-6 px-3",
									isDark ? "text-white/40" : "text-[#1a1a1a]/40",
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
							"text-left py-4 px-3",
							isDark ? "text-white/30" : "text-[#1a1a1a]/30",
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
