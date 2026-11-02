"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import { useState } from "react";
import { Megaphone } from "lucide-react";

export default function SyaratDanKetentuanPeriklananPage() {
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const [activeSection, setActiveSection] = useState<string>("section-1");

	const scrollToSection = (sectionId: string) => {
		setActiveSection(sectionId);
		const element = document.getElementById(sectionId);
		if (element) {
			const offset = 100;
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	};

	const colors = isDark
		? {
				bg: "#050505",
				bgPattern: "rgba(0, 194, 177, 0.05)",
				primary: "#43decc",
				primaryContainer: "#00c2b1",
				primaryAlpha: "rgba(0, 194, 177, 0.1)",
				primaryAlpha5: "rgba(0, 194, 177, 0.05)",
				primaryAlpha30: "rgba(0, 194, 177, 0.3)",
				primaryAlpha40: "rgba(0, 194, 177, 0.4)",
				text: "#e5e2e1",
				textSecondary: "#bbcac6",
				textMuted: "rgba(229, 226, 225, 0.5)",
				glassBg: "rgba(10, 15, 13, 0.6)",
				glassBorder: "rgba(255, 255, 255, 0.05)",
				onPrimary: "#003732",
				outline: "rgba(229, 226, 225, 0.12)",
				outlineVariant: "rgba(229, 226, 225, 0.12)",
				surfaceContainerLowest: "#0e0e0e",
			}
		: {
				bg: "#f5f5f5",
				bgPattern: "rgba(10, 124, 110, 0.04)",
				primary: "#0a7c6e",
				primaryContainer: "#0a7c6e",
				primaryAlpha: "rgba(10, 124, 110, 0.1)",
				primaryAlpha5: "rgba(10, 124, 110, 0.05)",
				primaryAlpha30: "rgba(10, 124, 110, 0.3)",
				primaryAlpha40: "rgba(10, 124, 110, 0.4)",
				text: "#1a1a1a",
				textSecondary: "rgba(26, 26, 26, 0.75)",
				textMuted: "rgba(26, 26, 26, 0.5)",
				glassBg: "rgba(255, 255, 255, 0.8)",
				glassBorder: "rgba(0, 0, 0, 0.08)",
				onPrimary: "#ffffff",
				outline: "rgba(0, 0, 0, 0.12)",
				outlineVariant: "rgba(0, 0, 0, 0.12)",
				surfaceContainerLowest: "#ffffff",
			};

	const summaryItems = [
		{ id: "section-1", label: "Layanan Partnership" },
		{ id: "section-2", label: "Persetujuan & Standar Konten" },
		{ id: "section-3", label: "Ketentuan Pembayaran" },
		{ id: "section-4", label: "Penempatan & Durasi" },
		{ id: "section-5", label: "Tanggung Jawab & Ganti Rugi" },
		{ id: "section-6", label: "Hukum yang Berlaku" },
	];

	return (
		<div
			className="min-h-screen relative transition-colors duration-300"
			style={{ backgroundColor: colors.bg }}
		>
			{/* Velocity Mesh Background */}
			<div
				className="fixed inset-0 pointer-events-none transition-colors duration-300"
				style={{
					backgroundImage: `linear-gradient(${colors.bgPattern} 1px, transparent 1px), linear-gradient(90deg, ${colors.bgPattern} 1px, transparent 1px)`,
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Atmospheric Glows */}
			<div
				className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-300"
				style={{
					backgroundColor: isDark
						? "rgba(0, 194, 177, 0.1)"
						: "rgba(10, 124, 110, 0.08)",
				}}
			/>
			<div
				className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] pointer-events-none transition-colors duration-300"
				style={{
					backgroundColor: isDark
						? "rgba(0, 194, 177, 0.05)"
						: "rgba(10, 124, 110, 0.05)",
				}}
			/>

			<main>
				{/* Hero Section */}
				<section className="relative px-6 md:px-8 lg:px-16 pt-12 pb-24 overflow-hidden">
					<div className="max-w-4xl mx-auto text-center relative z-10">
						<h1
							className="font-black italic uppercase mb-8 leading-tight"
							style={{
								fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
								color: colors.text,
								textShadow: isDark ? "0 0 15px rgba(0, 194, 177, 0.5)" : "none",
							}}
						>
							Syarat dan Ketentuan Periklanan{" "}
							<span style={{ color: colors.primaryContainer }}>
								& Partnership
							</span>
						</h1>

						<p
							className="max-w-2xl mx-auto leading-relaxed"
							style={{
								fontSize: "18px",
								color: colors.textSecondary,
								lineHeight: "1.6",
							}}
						>
							Syarat dan Ketentuan ini (&ldquo;Syarat&rdquo;) mengatur seluruh
							penempatan iklan dan partnership di Olahbola.com serta platform
							media sosial Olahbola (&ldquo;Media Olahbola&rdquo;). Dengan
							menjalin partnership dengan Olahbola, brand
							(&ldquo;Partner&rdquo;) menyatakan setuju untuk terikat pada
							Syarat ini.
						</p>
					</div>
				</section>

				{/* Content Section */}
				<section className="px-6 md:px-8 lg:px-16 pb-32">
					<div className="max-w-5xl mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							{/* Sidebar Navigation */}
							<aside className="lg:col-span-4 hidden lg:block sticky top-32 h-fit">
								<div
									className="p-6 rounded-xl"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${colors.glassBorder}`,
										borderLeft: `4px solid ${colors.primary}`,
									}}
								>
									<h3
										className="font-bold mb-4"
										style={{
											fontSize: "24px",
											color: colors.primary,
											fontFamily:
												"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											fontWeight: 600,
										}}
									>
										Ringkasan
									</h3>
									<ul className="space-y-4" style={{ fontSize: "16px" }}>
										{summaryItems.map((item) => (
											<li
												key={item.id}
												className="flex items-center gap-3 cursor-pointer transition-colors"
												style={{
													color:
														activeSection === item.id
															? colors.primary
															: colors.textSecondary,
												}}
												onClick={() => scrollToSection(item.id)}
											>
												<span
													className="w-1.5 h-1.5 rounded-full"
													style={{
														backgroundColor:
															activeSection === item.id
																? colors.primary
																: colors.primaryAlpha30,
													}}
												/>
												{item.label}
											</li>
										))}
									</ul>
								</div>
							</aside>

							{/* Main Policy Text */}
							<div className="lg:col-span-8 space-y-8">
								{/* Section 1 */}
								<div
									id="section-1"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-1"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-1"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											1. Layanan Partnership
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Olahbola menyediakan kesempatan partnership berbayar melalui
										situs web dan kanal media sosialnya. Bentuk partnership
										dapat berupa posting bersponsor, banner, konten video,
										integrasi kuis, serta format promosi lain yang disetujui
										Olahbola.
									</p>
								</div>

								{/* Section 2 */}
								<div
									id="section-2"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-2"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-2"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<h2
											className="font-bold italic leading-10"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											2. Persetujuan & Standar Konten
										</h2>
									</div>
									<p
										className="mb-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Seluruh materi partnership wajib diajukan untuk persetujuan
										terlebih dahulu. Olahbola berhak menolak atau menghapus
										konten yang:
									</p>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Mengandung pornografi, judi online, kekerasan, atau
											diskriminasi.
										</li>
										<li>
											Bersifat menyesatkan, melanggar hukum, atau melanggar hak
											pihak ketiga.
										</li>
										<li>
											Tidak sesuai dengan nilai merek dan standar komunitas
											Olahbola.
										</li>
									</ul>
								</div>

								{/* Section 3 */}
								<div
									id="section-3"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-3"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-3"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<h2
											className="font-bold italic leading-10"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											3. Ketentuan Pembayaran
										</h2>
									</div>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Biaya partnership wajib dibayarkan penuh sebelum
											penayangan, kecuali ada kesepakatan tertulis lain.
										</li>
										<li>
											Seluruh pembayaran tidak dapat dikembalikan setelah konten
											partnership ditayangkan.
										</li>
										<li>
											Partnership bertanggung jawab atas pajak yang berlaku.
										</li>
									</ul>
								</div>

								{/* Section 4 */}
								<div
									id="section-4"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-4"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-4"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<h2
											className="font-bold italic leading-10"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											4. Penempatan & Durasi
										</h2>
									</div>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Penempatan dan durasi konten partnership akan dikonfirmasi
											secara tertulis antara Olahbola dan Partnership.
										</li>
										<li>
											Olahbola tidak menjamin metrik kinerja tertentu (misalnya
											impresi, klik), kecuali disepakati dalam kontrak terpisah.
										</li>
									</ul>
								</div>

								{/* Section 5 */}
								<div
									id="section-5"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-5"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-5"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<h2
											className="font-bold italic leading-10"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											5. Tanggung Jawab & Ganti Rugi
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Partnership wajib membebaskan Olahbola dari segala klaim,
										kerugian, atau tanggung jawab yang timbul akibat materi
										partnership.
									</p>
								</div>

								{/* Section 6 */}
								<div
									id="section-6"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-6"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-6"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<h2
											className="font-bold italic leading-10"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											6. Hukum yang Berlaku
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Syarat ini diatur oleh hukum Republik Indonesia. Sengketa
										akan menjadi kewenangan eksklusif Pengadilan di Jakarta.
									</p>
								</div>

								{/* Call to Action */}
								<div
									className="relative rounded-2xl p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
									style={{
										background: `linear-gradient(135deg, ${colors.primaryContainer}, ${colors.primary})`,
									}}
								>
									<div className="absolute top-0 right-0 opacity-10">
										<Megaphone className="size-50 opacity-10" />
									</div>
									<div className="relative z-10">
										<h3
											className="font-bold mb-2"
											style={{
												fontSize: "24px",
												color: colors.onPrimary,
											}}
										>
											Tertarik Beriklan bersama Olahbola?
										</h3>
										<p
											style={{
												color: isDark
													? "rgba(0, 55, 50, 0.8)"
													: "rgba(255, 255, 255, 0.8)",
											}}
										>
											Hubungi tim partnership kami untuk informasi dan penawaran
											spesial.
										</p>
									</div>
									<Link
										href="/"
										className="relative z-10 px-8 py-4 font-bold uppercase rounded-full transition-all  active:scale-95"
										style={{
											backgroundColor: colors.onPrimary,
											color: colors.primaryContainer,
											fontSize: "14px",
											letterSpacing: "0.05em",
										}}
									>
										Contact
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
