"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Eye } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

interface Article {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	image: string;
	featured_image?: string;
	author_name: string;
	views: number;
	created_diff: string;
}

interface ArticleCardProps {
	data: Article;
	index: number;
}

export function ArticleCard({ data, index }: ArticleCardProps) {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const imageUrl = data.image || data.featured_image;
	const fullImageUrl = imageUrl
		? `${process.env.NEXT_PUBLIC_API_URL}/storage/${imageUrl}`
		: "/placeholder.png";

	return (
		<Link
			href={`/${data.slug}`}
			className={`rounded-2xl overflow-hidden group flex flex-col transition-all duration-300 ${isDark ? "glass-card hover:shadow-[0_0_25px_rgba(67,222,204,0.15)] hover:border-primary/30" : "bg-white shadow-lg border border-gray-200 hover:shadow-xl hover:border-[#0a7c6e]/30"}`}
		>
			{/* Image */}
			<div className="h-48 overflow-hidden relative">
				<Image
					src={fullImageUrl}
					alt={data.title}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					style={{ objectFit: "cover" }}
					className="group-hover:scale-110 transition-transform duration-500"
				/>
			</div>

			{/* Content */}
			<div className="p-6 flex-1 flex flex-col justify-between">
				<div>
					{/* Meta Info */}
					<div className="flex flex-row gap-4 mb-3">
						<div className="flex flex-row items-center gap-1">
							<Calendar className={`size-3 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`} />
							<p className={`text-[10px] uppercase tracking-widest ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}>
								{data.created_diff}
							</p>
						</div>
						<div className="flex flex-row items-center gap-1">
							<Eye className={`size-3 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`} />
							<p className={isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}>
								{data.views}
							</p>
						</div>
					</div>

					<h3 className={`font-bold text-lg uppercase tracking-tighter leading-tight group-hover:${isDark ? "text-primary" : "text-[#0a7c6e]"} transition-colors ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
						{data.title}
					</h3>
				</div>

				<div className="flex justify-between items-center mt-4">
					<span className={`text-xs font-bold ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}>
						{data.author_name?.split(" ")[0]}
					</span>
					<span className={`material-symbols-outlined text-sm ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}>
						arrow_forward
					</span>
				</div>
			</div>
		</Link>
	);
}

export function ArticleCardSkeleton() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	return (
		<div className={`rounded-2xl overflow-hidden animate-pulse ${isDark ? "glass-card" : "bg-white shadow-lg border border-gray-200"}`}>
			<div className={`h-48 ${isDark ? "bg-surface-container-highest/30" : "bg-gray-200"}`} />
			<div className="p-6 space-y-4">
				<div className="flex gap-4">
					<div className={`h-3 w-16 rounded ${isDark ? "bg-surface-container-highest/30" : "bg-gray-200"}`} />
					<div className={`h-3 w-12 rounded ${isDark ? "bg-surface-container-highest/30" : "bg-gray-200"}`} />
				</div>
				<div className={`h-6 w-full rounded ${isDark ? "bg-surface-container-highest/30" : "bg-gray-200"}`} />
				<div className={`h-6 w-3/4 rounded ${isDark ? "bg-surface-container-highest/30" : "bg-gray-200"}`} />
				<div className={`h-4 w-1/2 rounded ${isDark ? "bg-surface-container-highest/30" : "bg-gray-200"}`} />
			</div>
		</div>
	);
}