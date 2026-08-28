"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";
import { useSapa } from "@/hooks/queries/useContent";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";

export default function SapaPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { data: sapaData, isLoading } = useSapa();
	const [activeTab, setActiveTab] = useState<"all" | "featured">("all");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		description: "",
	});

	const allSapas = sapaData?.data || [];
	const featuredSapas = allSapas.filter((s: any) => s.is_featured);
	const displaySapas = activeTab === "featured" ? featuredSapas : allSapas;

	const createSapaMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			const response = await apiClient.post(endpoints.sapaCreate, data);
			return response.data;
		},
		onSuccess: () => {
			setFormData({ name: "", email: "", phone: "", description: "" });
			alert("Pesan Anda berhasil dikirim!");
		},
		onError: () => {
			alert("Gagal mengirim pesan. Silakan coba lagi.");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createSapaMutation.mutate(formData);
	};

	return (
		<div
			className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}
		>
			{/* Bullet Neon Effects - Center Background */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 z-0">
				<div
					className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-[150px] ${isDark ? "bg-[#0D645F]/20" : "bg-[#0a7c6e]/15"}`}
				></div>
			</div>

			{/* Bullet Neon Effects - Pojok Kanan Bawah */}
			<div className="absolute bottom-0 left-0 w-100 h-100 z-0">
				<div
					className={`absolute bottom-0 left-0 w-full h-full rounded-full blur-[120px] ${isDark ? "bg-[#d8531a]/15" : "bg-[#b3461a]/10"}`}
				></div>
			</div>

			{/* Hero Section */}
			<section className="relative z-10 px-8 py-12 md:py-20 text-center flex flex-col items-center">
				<div
					className={`inline-block mb-4 px-4 py-1 rounded-full border text-sm font-semibold uppercase tracking-widest ${isDark ? "border-[#d8531a]/40 bg-[#d8531a]/20 text-[#d8531a]" : "border-[#b3461a]/40 bg-[#b3461a]/20 text-[#b3461a]"}`}
				>
					Sapa Olahbola
				</div>
				<h1
					className={`text-2xl md:text-6xl max-w-3xl font-bold mb-4 tracking-tighter leading-none uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
				>
					<span className="block uppercase ">
						Kolaborasi Sekarang,{" "}
						<span className={isDark ? "text-green" : "text-[#0a7c6e]"}>
							Goal Besar Menanti!
						</span>
					</span>
				</h1>
				<p
					className={`max-w-2xl text-md md:text-lg ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
				>
					Ayo hubungi kami, Bersama kita susun strategi, saling umpan, dan cetak
					gol cantik lewat kolaborasi yang solid.
				</p>
			</section>

			{/* Main Content Grid */}
			<section className="relative z-10 px-8 pb-32 max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Contact Info Panel - Left */}
					<div className="lg:col-span-5 flex flex-col gap-6">
						{/* Glass Card: Quick Links */}
						<div
							className="p-8 rounded-xl relative overflow-hidden group"
							style={{
								background: isDark
									? "rgba(255,255,255,0.05)"
									: "rgba(255,255,255,0.8)",
								backdropFilter: "blur(24px)",
								border: isDark
									? "1px solid rgba(255,255,255,0.1)"
									: "1px solid rgba(0,0,0,0.1)",
							}}
						>
							<h2
								className={`text-2xl font-bold mb-8 tracking-tight uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								Informasi Kontak
							</h2>
							<div className="space-y-8">
								<div className="flex items-start gap-4">
									<div
										className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${isDark ? "border-green/20 group-hover:border-green/50" : "border-[#0a7c6e]/20 group-hover:border-[#0a7c6e]/50"}`}
										style={{
											background: isDark
												? "rgba(255,255,255,0.05)"
												: "rgba(10,124,110,0.05)",
										}}
									>
										<Mail
											className={`size-5 ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
										/>
									</div>
									<div>
										<p
											className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
										>
											Email
										</p>
										<p
											className={`text-sm md:text-md ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
										>
											{process.env.NEXT_PUBLIC_CONTACT_EMAIL}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div
										className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${isDark ? "border-green/20 group-hover:border-green/50" : "border-[#0a7c6e]/20 group-hover:border-[#0a7c6e]/50"}`}
										style={{
											background: isDark
												? "rgba(255,255,255,0.05)"
												: "rgba(10,124,110,0.05)",
										}}
									>
										<Phone
											className={`size-5 ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
										/>
									</div>
									<div>
										<p
											className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
										>
											Nomor Telpon/WA
										</p>
										<p
											className={`text-sm md:text-md ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
										>
											+6287777487925
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div
										className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${isDark ? "border-green/20 group-hover:border-green/50" : "border-[#0a7c6e]/20 group-hover:border-[#0a7c6e]/50"}`}
										style={{
											background: isDark
												? "rgba(255,255,255,0.05)"
												: "rgba(10,124,110,0.05)",
										}}
									>
										<MapPin
											className={`size-5 ${isDark ? "text-green" : "text-[#0a7c6e]"}`}
										/>
									</div>
									<div>
										<p
											className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
										>
											Lokasi kami
										</p>
										<p
											className={`text-sm md:text-md max-w-xs ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
										>
											Gedung STC Senayan Lantai 4, Ruang 80 Jl. Asia Afrika
											Pintu IX Gelora Senayan Kel.Gelora Kec.Tanah Abang Jakarta
											Pusat 10270
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Contact Form Panel - Right */}
					<div className="lg:col-span-7">
						<form
							onSubmit={handleSubmit}
							className="p-10 rounded-xl relative"
							style={{
								background: isDark
									? "rgba(255,255,255,0.05)"
									: "rgba(255,255,255,0.8)",
								backdropFilter: "blur(24px)",
								border: isDark
									? "1px solid rgba(13,100,95,0.2)"
									: "1px solid rgba(10,124,110,0.2)",
							}}
						>
							<div
								className={`absolute top-0 left-0 w-full h-1 ${isDark ? "bg-linear-to-r from-transparent via-green to-transparent" : "bg-linear-to-r from-transparent via-[#0a7c6e] to-transparent"} opacity-50`}
							></div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
								<div className="space-y-2">
									<label
										className={`text-[12px] tracking-widest uppercase ml-1 font-bold ${isDark ? "text-white/70" : "text-[#5a5a5a]"}`}
									>
										Nama Kamu
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Andi..."
										required
										className={`w-full px-4 py-3 rounded-lg outline-none transition-all placeholder:text-white/20 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
										style={{
											background: isDark
												? "rgba(255,255,255,0.05)"
												: "rgba(255,255,255,0.6)",
											border: isDark
												? "1px solid rgba(255,255,255,0.1)"
												: "1px solid rgba(0,0,0,0.1)",
										}}
									/>
								</div>
								<div className="space-y-2">
									<label
										className={`text-[12px] tracking-widest uppercase ml-1 font-bold ${isDark ? "text-white/70" : "text-[#5a5a5a]"}`}
									>
										Email Kamu
									</label>
									<input
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										placeholder="andi@gmail.com"
										required
										className={`w-full px-4 py-4 rounded-lg outline-none transition-all placeholder:text-white/20 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
										style={{
											background: isDark
												? "rgba(255,255,255,0.05)"
												: "rgba(255,255,255,0.6)",
											border: isDark
												? "1px solid rgba(255,255,255,0.1)"
												: "1px solid rgba(0,0,0,0.1)",
										}}
									/>
								</div>
							</div>

							<div className="space-y-2 mb-8">
								<label
									className={`text-[12px] tracking-widest uppercase ml-1 font-bold ${isDark ? "text-white/70" : "text-[#5a5a5a]"}`}
								>
									Nomor Telpon/WA Kamu
								</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									placeholder="+62 812 XXXX XXXX"
									required
									className={`w-full px-4 py-3 rounded-lg outline-none transition-all placeholder:text-white/20 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
									style={{
										background: isDark
											? "rgba(255,255,255,0.05)"
											: "rgba(255,255,255,0.6)",
										border: isDark
											? "1px solid rgba(255,255,255,0.1)"
											: "1px solid rgba(0,0,0,0.1)",
									}}
								/>
							</div>

							<div className="space-y-2 mb-10">
								<label
									className={`text-[12px] tracking-widest uppercase ml-1 font-bold ${isDark ? "text-white/70" : "text-[#5a5a5a]"}`}
								>
									Pesan Kamu untuk Kami
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="Ketik pesan kamu disini ya sob..."
									rows={6}
									required
									className={`w-full px-4 py-4 rounded-lg outline-none transition-all text-white placeholder:text-white/20 resize-none ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
									style={{
										background: isDark
											? "rgba(255,255,255,0.05)"
											: "rgba(255,255,255,0.6)",
										border: isDark
											? "1px solid rgba(255,255,255,0.1)"
											: "1px solid rgba(0,0,0,0.1)",
									}}
								></textarea>
							</div>

							<button
								type="submit"
								disabled={createSapaMutation.isPending}
								className={`w-full py-4 rounded-lg tracking-widest uppercase text-sm md:text-xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 ${isDark ? "bg-linear-to-r from-[#00c2b1] to-[#0D645F] text-white" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}
								style={
									isDark
										? {
												boxShadow: "0 0 30px rgba(13,100,95,0.4)",
											}
										: {}
								}
							>
								{createSapaMutation.isPending ? (
									<>
										<Loader2 className="size-5 animate-spin" />
										Sending...
									</>
								) : (
									<>Tendang Sekarang!</>
								)}
							</button>
						</form>
					</div>
				</div>
			</section>
		</div>
	);
}
