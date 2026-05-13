"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { useKolaborasiDetail } from "@/hooks/queries/useContent";
import { useUIStore } from "@/stores/uiStore";

function KolaborasiDetailContent() {
	const params = useParams();
	const slug = params.slug as string;
	const { data, isLoading } = useKolaborasiDetail(slug);
	const kolaborasi = data?.data;
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	if (isLoading) {
		return (
			<div className={`flex items-center justify-center min-h-80 ${isDark ? "text-[#0D645F]" : "text-[#0a7c6e]"}`}>
				<Loader2 className="size-10 animate-spin" />
			</div>
		);
	}

	if (!kolaborasi) {
		return (
			<div className={`text-center py-20 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
				<p>Kolaborasi tidak ditemukan</p>
			</div>
		);
	}

	return (
		<>
			{/* Detail Section */}
			<section className={`py-12 px-8 min-h-screen relative transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
				{/* Background Effects */}
				<div className={`absolute inset-0 ${isDark ? "bg-[linear-gradient(rgba(15,20,18,0.85),rgba(15,20,18,0.85)),url('/images/kolaborasi/kolaborasi-bg.webp')]" : "bg-[linear-gradient(rgba(245,245,245,0.9),rgba(245,245,245,0.9)),url('/images/koloneborasi-bg.webp')]"} bg-cover bg-center bg-fixed opacity-50`}></div>
				<div className="absolute top-0 right-0 w-100 h-100 z-0">
					<div className={`absolute top-0 right-0 w-full h-full rounded-full blur-[120px] ${isDark ? "bg-[#0D645F]/20" : "bg-[#0D645F]/10"}`}></div>
				</div>

				<div className="max-w-6xl mx-auto relative z-10">
					{/* Sponsor Logo */}
					<div className="text-center mb-12">
						<div
							className="inline-block p-8 rounded-3xl"
							style={{
								background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
								backdropFilter: "blur(20px)",
								border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
							}}
						>
							<img
								src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${kolaborasi.sponsor_image}`}
								alt={kolaborasi.title}
								className="h-24 w-auto object-contain"
							/>
						</div>
					</div>

					{/* Title */}
					<h2 className={`text-3xl md:text-4xl font-bold text-center mb-8 uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
						{kolaborasi.title}
					</h2>

					{/* Detail Images Grid */}
					{kolaborasi.detail_images && kolaborasi.detail_images.length > 0 ? (
						<div className="flex justify-center">
							<div
								className={`grid gap-6 ${
									kolaborasi.detail_images.length === 1
										? "grid-cols-1 max-w-md mx-auto"
										: kolaborasi.detail_images.length === 2
											? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
											: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
								}`}
							>
								{kolaborasi.detail_images.map((img: any, index: number) => (
									<a
										key={index}
										href={img.url}
										target="_blank"
										rel="noopener noreferrer"
										className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
										style={{
											background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
											border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
										}}
									>
										<img
											src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${img.image}`}
											alt={`${kolaborasi.title} - ${index + 1}`}
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<ExternalLink className="size-6 text-white drop-shadow-lg" />
										</div>
									</a>
								))}
							</div>
						</div>
					) : (
						<div className={`text-center py-12 ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}>
							<p>Belum ada detail gambar</p>
						</div>
					)}

					{/* Back Button */}
					<div className="text-center mt-12">
						<a
							href="/kolaborasi"
							className={`inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors font-medium ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d]" : "bg-[#0a7c6e] hover:bg-[#095a50]"}`}
						>
							Kembali ke Kolaborasi
						</a>
					</div>
				</div>
			</section>
		</>
	);
}

function LoadingSkeleton() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	return (
		<div className={`flex items-center justify-center min-h-100 ${isDark ? "text-[#0D645F]" : "text-[#0a7c6e]"}`}>
			<Loader2 className="size-10 animate-spin" />
		</div>
	);
}

export default function KolaborasiDetailPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	return (
		<div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
			<Suspense fallback={<LoadingSkeleton />}>
				<KolaborasiDetailContent />
			</Suspense>
		</div>
	);
}
