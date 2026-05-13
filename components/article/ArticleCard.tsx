"use client";

import Link from "next/link";
import { Calendar, User, Eye } from "lucide-react";

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
	const imageUrl = data.image || data.featured_image;
	const fullImageUrl = imageUrl
		? `${process.env.NEXT_PUBLIC_API_URL}/storage/${imageUrl}`
		: "/placeholder.png";

	return (
		<Link
			href={`/${data.slug}`}
			className="glass-card rounded-2xl overflow-hidden group flex flex-col"
		>
			{/* Image */}
			<div className="h-48 overflow-hidden relative">
				<img
					src={fullImageUrl}
					alt={data.title}
					className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
				/>
			</div>

			{/* Content */}
			<div className="p-6 flex-1 flex flex-col justify-between">
				<div>
					{/* Meta Info */}
					<div className="flex flex-row gap-4 mb-3">
						<div className="flex flex-row items-center gap-1">
							<Calendar className="size-3 text-primary" />
							<p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
								{data.created_diff}
							</p>
						</div>
						<div className="flex flex-row items-center gap-1">
							<Eye className="size-3 text-primary" />
							<p className="text-[10px] text-on-surface-variant">
								{data.views}
							</p>
						</div>
					</div>

					<h3 className="font-bold text-lg uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
						{data.title}
					</h3>
				</div>

				<div className="flex justify-between items-center mt-4">
					<span className="text-on-surface-variant text-xs font-bold">
						{data.author_name?.split(" ")[0]}
					</span>
					<span className="material-symbols-outlined text-primary text-sm">
						arrow_forward
					</span>
				</div>
			</div>
		</Link>
	);
}

export function ArticleCardSkeleton() {
	return (
		<div className="glass-card rounded-2xl overflow-hidden animate-pulse">
			<div className="h-48 bg-surface-container-highest/30" />
			<div className="p-6 space-y-4">
				<div className="flex gap-4">
					<div className="h-3 w-16 bg-surface-container-highest/30 rounded" />
					<div className="h-3 w-12 bg-surface-container-highest/30 rounded" />
				</div>
				<div className="h-6 bg-surface-container-highest/30 rounded w-full" />
				<div className="h-6 bg-surface-container-highest/30 rounded w-3/4" />
				<div className="h-4 bg-surface-container-highest/30 rounded w-1/2" />
			</div>
		</div>
	);
}