"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { useKolaborasiDetail } from "@/hooks/queries/useContent";

function KolaborasiDetailContent() {
	const params = useParams();
	const slug = params.slug as string;
	const { data, isLoading } = useKolaborasiDetail(slug);
	const kolaborasi = data?.data;

	if (isLoading) {
		return (
			<div className={`flex items-center justify-center min-h-80 ${"text-[#0D645F]"}`}>
				<Loader2 className="size-10 animate-spin" />
			</div>
		);
	}

	if (!kolaborasi) {
		return (
			<div className={`text-center py-20 ${"text-white/60"}`}>
				<p>Kolaborasi tidak ditemukan</p>
			</div>
		);
	}

	return (
		<>
			{/* Detail Section */}
			<section className={`py-12 px-8 min-h-screen relative transition-colors duration-300 ${"bg-[#0f1412]"}`}>
				{/* Background Effects */}
				<div className={`absolute inset-0 ${"bg-[linear-gradient(rgba(15,20,18,0.85),rgba(15,20,18,0.85)),url('/images/kolaborasi/kolaborasi-bg.webp')]"} bg-cover bg-center bg-fixed opacity-50`}></div>
				<div className="absolute top-0 right-0 w-100 h-100 z-0">
					<div className={`absolute top-0 right-0 w-full h-full rounded-full blur-[120px] ${"bg-[#0D645F]/20"}`}></div>
				</div>

				<div className="max-w-6xl mx-auto relative z-10">
					{/* Sponsor Logo */}
					<div className="text-center mb-12">
						<div
							className="inline-block p-8 rounded-3xl"
							style={{
								background: "rgba(255,255,255,0.03)",
								backdropFilter: "blur(20px)",
								border: "1px solid rgba(255,255,255,0.08)",
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
					<h2 className={`text-3xl md:text-4xl font-bold text-center mb-8 uppercase ${"text-white"}`}>
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
											background: "rgba(255,255,255,0.03)",
											border: "1px solid rgba(255,255,255,0.08)",
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
						<div className={`text-center py-12 ${"text-white/40"}`}>
							<p>Belum ada detail gambar</p>
						</div>
					)}

					{/* Back Button */}
					<div className="text-center mt-12">
						<a
							href="/kolaborasi"
							className={`inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors font-medium ${"bg-[#0D645F] hover:bg-[#0a514d]"}`}
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
	return (
		<div className={`flex items-center justify-center min-h-100 ${"text-[#0D645F]"}`}>
			<Loader2 className="size-10 animate-spin" />
		</div>
	);
}

export default function KolaborasiDetailPage() {
	return (
		<div className={`min-h-screen transition-colors duration-300 ${"bg-[#0f1412]"}`}>
			<Suspense fallback={<LoadingSkeleton />}>
				<KolaborasiDetailContent />
			</Suspense>
		</div>
	);
}
