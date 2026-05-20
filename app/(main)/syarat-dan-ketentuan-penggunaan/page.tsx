"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import { Icon } from "@/components/ui/Icon";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { useState } from "react";

export default function SyaratDanKetentuanPage() {
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
		{ id: "section-1", label: "Kepemilikan & Operasional" },
		{ id: "section-2", label: "Layanan" },
		{ id: "section-3", label: "Standar Konten" },
		{ id: "section-4", label: "Kelayakan" },
		{ id: "section-5", label: "Konten Pengguna" },
		{ id: "section-6", label: "Periklanan" },
		{ id: "section-7", label: "Pernyataan Privasi" },
		{ id: "section-8", label: "Batasan Tanggung Jawab" },
		{ id: "section-9", label: "Hukum yang Berlaku" },
		{ id: "section-10", label: "Perubahan" },
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

			{/* Theme Toggle */}
			<ThemeToggle />

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
							Syarat dan Ketentuan{" "}
							<span style={{ color: colors.primaryContainer }}>Penggunaan</span>
						</h1>

						<p
							className="max-w-2xl mx-auto leading-relaxed"
							style={{
								fontSize: "18px",
								color: colors.textSecondary,
								lineHeight: "1.6",
							}}
						>
							Selamat datang di Olahbolacom (&ldquo;Situs&rdquo;). Dengan
							mengakses atau menggunakan Situs ini, Anda menyatakan setuju untuk
							terikat pada Syarat dan Ketentuan ini serta Kebijakan Privasi
							kami. Jika Anda tidak setuju, harap segera menghentikan
							penggunaan.
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
											1. Kepemilikan & Operasional
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Situs ini beserta seluruh layanan terkait dimiliki dan
										dioperasikan oleh Olahbola Communications
										(&ldquo;Olahbola&rdquo;).
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
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											2. Layanan
										</h2>
									</div>
									<p
										className="mb-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Olahbola menyediakan:
									</p>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Akses terhadap konten, berita, dan fitur interaktif
											seputar sepeda.
										</li>
										<li>
											Partisipasi dalam kuis dan aktivitas komunitas bagi
											penggemar sepeda.
										</li>
										<li>
											Kesempatan untuk beriklan di Situs, dengan persetujuan dan
											pembayaran kepada administrator Situs.
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
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											3. Standar Konten
										</h2>
									</div>
									<p
										className="mb-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Situs ini secara tegas melarang dan tidak mengandung:
									</p>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>Materi pornografi atau eksplisit seksual.</li>
										<li>
											Aktivitas judi online atau betting dalam bentuk apapun.
										</li>
										<li>
											Konten yang mengandung kekerasan, pelecehan, atau
											diskriminasi. Seluruh materi yang dipublikasikan wajib
											sesuai dengan hukum yang berlaku dan standar komunitas.
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
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											4. Kelayakan
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Pengguna harus berusia minimal 17 tahun atau memiliki izin
										orang tua/wali untuk mengikuti kuis maupun aktivitas
										periklanan.
									</p>
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
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											5. Konten Pengguna
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Setiap konten yang diunggah (&ldquo;Konten Pengguna&rdquo;)
										harus sah, akurat, dan relevan dengan dunia olahraga. Dengan
										mengunggah, Anda memberikan lisensi non-eksklusif, global,
										bebas royalti kepada Olahbola untuk menggunakan,
										mereproduksi, dan mendistribusikan konten tersebut untuk
										tujuan yang berkaitan dengan Situs.
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
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											6. Periklanan
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Pihak yang berminat beriklan di Olahbola.com wajib
										menghubungi administrator Situs. Penempatan iklan tunduk
										pada kesepakatan, pembayaran biaya yang berlaku, serta
										kepatuhan terhadap standar konten Olahbola.
									</p>
								</div>

								{/* Section 7 */}
								<div
									id="section-7"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-7"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-7"
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
											7. Pernyataan Privasi
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Situs ini disediakan &ldquo;sebagaimana adanya&rdquo; dan
										&ldquo;sebagaimana tersedia.&rdquo; Olahbola tidak
										memberikan jaminan atas keakuratan, keandalan, atau
										kesesuaian konten.
									</p>
								</div>

								{/* Section 8 */}
								<div
									id="section-8"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-8"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-8"
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
											8. Batasan Tanggung Jawab
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Sepanjang diizinkan oleh hukum, Olahbola tidak bertanggung
										jawab atas kerugian tidak langsung, insidental, atau
										konsekuensial yang timbul dari penggunaan Situs.
									</p>
								</div>

								{/* Section 9 */}
								<div
									id="section-9"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-9"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-9"
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
											9. Hukum yang Berlaku & Yurisdiksi
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Syarat ini diatur oleh hukum Republik Indonesia. Setiap
										sengketa akan menjadi kewenangan eksklusif Pengadilan di
										Jakarta.
									</p>
								</div>

								{/* Section 10 */}
								<div
									id="section-10"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${
											activeSection === "section-10"
												? colors.primary
												: colors.glassBorder
										}`,
										boxShadow:
											activeSection === "section-10"
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
											10. Perubahan
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Olahbola berhak mengubah Syarat ini kapan saja. Penggunaan
										berkelanjutan atas Situs berarti Anda menerima Syarat yang
										telah diperbarui.
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
										<Icon name="handshake" filled />
									</div>
									<div className="relative z-10">
										<h3
											className="font-bold mb-2"
											style={{
												fontSize: "24px",
												color: colors.onPrimary,
											}}
										>
											Punya pertanyaan lebih lanjut?
										</h3>
										<p
											style={{
												color: isDark
													? "rgba(0, 55, 50, 0.8)"
													: "rgba(255, 255, 255, 0.8)",
											}}
										>
											Hubungi tim legal kami untuk klarifikasi detail.
										</p>
									</div>
									<Link
										href="/"
										className="relative z-10 px-8 py-4 font-bold uppercase rounded-full transition-all active:scale-95"
										style={{
											backgroundColor: colors.onPrimary,
											color: colors.primaryContainer,
											fontSize: "14px",
											letterSpacing: "0.05em",
										}}
									>
										Kontak Tim Kami
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
