"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import { useState } from "react";
import { Target, Users, Award, Globe } from "lucide-react";

export default function TentangKamiPage() {
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
		{ id: "section-1", label: "Tentang Olahbola" },
		{ id: "section-2", label: "Visi & Misi" },
		{ id: "section-3", label: "Nilai Dasar" },
		{ id: "section-4", label: "Layanan" },
		{ id: "section-5", label: "Tim Redaksi" },
		{ id: "section-6", label: "Kontak" },
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
							Tentang{" "}
							<span style={{ color: colors.primaryContainer }}>Olahbola</span>
						</h1>

						<p
							className="max-w-2xl mx-auto leading-relaxed"
							style={{
								fontSize: "18px",
								color: colors.textSecondary,
								lineHeight: "1.6",
							}}
						>
							Portal media & komunitas sepak bola Indonesia yang menyajikan
							berita terkini, analisis mendalam, dan konten hiburan seputar
							dunia bola nasional dan internasional.
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
										Navigasi
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

							{/* Main Content */}
							<div className="lg:col-span-8 space-y-8">
								{/* Section 1: Tentang */}
								<div
									id="section-1"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-1" ? colors.primary : colors.glassBorder}`,
										boxShadow:
											activeSection === "section-1"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<Globe
											className="w-8 h-8 shrink-0"
											style={{ color: colors.primary }}
										/>
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											Tentang Olahbola
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Olahbola adalah portal media &amp; komunitas sepak bola
											Indonesia yang didirikan pada tahun 2024. Kami hadir untuk
											menyajikan informasi seputar dunia sepak bola nasional dan
											internasional dengan gaya yang informatif, menarik, dan
											mudah dipahami oleh seluruh kalangan penggemar bola.
										</p>
										<p>
											Dengan pendekatan berbasis data dan jurnalistik yang
											akurat, Olahbola menyediakan berita terkini, analisis
											taktikal mendalam, wawancara eksklusif dengan para aktor
											sepak bola, serta konten hiburan interaktif seperti quiz
											dan prediksi skor pertandingan.
										</p>
										<p>
											Kami percaya bahwa sepak bola bukan hanya tentang hasil
											akhir di papan skor — tetapi juga tentang cerita,
											strategi, emosi, dan kebersamaan yang menyatukan jutaan
											fans dari Sabang sampai Merauke. Melalui Olahbola, kami
											ingin menjadi jembatan bagi semua fans tersebut.
										</p>
									</div>
								</div>

								{/* Section 2: Visi & Misi */}
								<div
									id="section-2"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-2" ? colors.primary : colors.glassBorder}`,
										boxShadow:
											activeSection === "section-2"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<Target
											className="w-8 h-8 shrink-0"
											style={{ color: colors.primary }}
										/>
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											Visi &amp; Misi
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											<strong style={{ color: colors.text }}>Visi Kami</strong>
										</p>
										<p>
											Menjadikan Olahbola sebagai platform sepak bola terdepan
											di Indonesia — sumber informasi terpercaya, ruang diskusi
											yang inklusif, dan jembatan antara penggemar bola di
											seluruh Nusantara serta dunia.
										</p>
										<p>
											<strong style={{ color: colors.text }}>Misi Kami</strong>
										</p>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Menghasilkan konten berkualitas tinggi berbasis data dan
												analisis mendalam.
											</li>
											<li>
												Membangun komunitas yang sehat, edukatif, dan saling
												menghargai antarpenggemar bola.
											</li>
											<li>
												Memberikan akses informasi sepak bola yang akurat dan
												tepat waktu bagi seluruh masyarakat Indonesia.
											</li>
											<li>
												Menjadi mitra strategis bagi brand dan partner yang
												ingin menjangkau audiens pecinta sepak bola.
											</li>
											<li>
												Mendorong inovasi melalui fitur interaktif seperti quiz,
												prediksi skor, dan media multimedia.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 3: Nilai Dasar */}
								<div
									id="section-3"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-3" ? colors.primary : colors.glassBorder}`,
										boxShadow:
											activeSection === "section-3"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<Award
											className="w-8 h-8 shrink-0"
											style={{ color: colors.primary }}
										/>
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											Nilai Dasar
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Di balik setiap konten yang kami publikasikan, ada
											nilai-nilai inti yang menjadi fondasi kerja tim Olahbola:
										</p>
										<ul className="space-y-4">
											{[
												{
													title: "Akurasi & Kejujuran",
													desc: "Seluruh informasi yang kami sajikan diverifikasi dan disampaikan secara objektif tanpa bias. Kami mengutamakan kebenaran di atas kecepatan.",
												},
												{
													title: "Interaktif & Edukatif",
													desc: "Kami tidak hanya memberi tahu, tapi juga mengajak pembaca untuk belajar, berdiskusi, dan terlibat aktif melalui fitur interaktif.",
												},
												{
													title: "Komunitas Inclusif",
													desc: "Sepak bola untuk semua orang. Kami membangun ruang yang ramah dan nyaman bagi fans dari berbagai latar belakang klub danregion.",
												},
												{
													title: "Inovasi Berkelanjutan",
													desc: "Kami terus mengembangkan format konten, teknologi, dan pengalaman pengguna agar selalu relevan dan mendunia.",
												},
											].map((nilai) => (
												<li
													key={nilai.title}
													className="p-4 rounded-lg"
													style={{
														background: colors.primaryAlpha5,
														borderLeft: `3px solid ${colors.primary}`,
													}}
												>
													<p
														className="font-semibold mb-1"
														style={{ color: colors.text }}
													>
														{nilai.title}
													</p>
													<p style={{ fontSize: "15px" }}>{nilai.desc}</p>
												</li>
											))}
										</ul>
									</div>
								</div>

								{/* Section 4: Layanan */}
								<div
									id="section-4"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-4" ? colors.primary : colors.glassBorder}`,
										boxShadow:
											activeSection === "section-4"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<Users
											className="w-8 h-8 shrink-0"
											style={{ color: colors.primary }}
										/>
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											Layanan &amp; Produk
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>Konten dan fitur yang tersedia di Olahbola meliputi:</p>
										<ul className="list-disc pl-6 space-y-3">
											<li>
												<strong style={{ color: colors.text }}>
													Berita & Artikel
												</strong>{" "}
												— Liputan harian seputar Liga Indonesia, UEFA Champions
												League, Premier League, La Liga, Serie A, Bundesliga,
												dan kompetisi sepak bola lainnya di seluruh dunia.
											</li>
											<li>
												<strong style={{ color: colors.text }}>
													Analisis Taktikal
												</strong>{" "}
												— Deep dive strategis mengenai pola permainan, perubahan
												formasi, dan evaluasi performa pemain dan tim.
											</li>
											<li>
												<strong style={{ color: colors.text }}>
													Interview Eksklusif
												</strong>{" "}
												— Wawancara dengan pemain, pelatih, analis, dan figur
												penting dalam dunia sepak bola Indonesia dan
												mancanegara.
											</li>
											<li>
												<strong style={{ color: colors.text }}>
													Quiz & Interaktif
												</strong>{" "}
												— Fitur kuis pengetahuan sepak bola, prediksi skor, dan
												Football City Battle yang menguji pemahaman taktikal
												Anda.
											</li>
											<li>
												<strong style={{ color: colors.text }}>
													Kolaborasi Brand
												</strong>{" "}
												— Konten bersponsor dan partnership iklan dari
												brand-brand yang relevan dengan ekosistem sepak bola dan
												lifestyle.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 5: Tim Redaksi */}
								<div
									id="section-5"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-5" ? colors.primary : colors.glassBorder}`,
										boxShadow:
											activeSection === "section-5"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<Users
											className="w-8 h-8 shrink-0"
											style={{ color: colors.primary }}
										/>
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											Tim Redaksi
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Olahbola dikelola oleh tim redaksi yang terdiri dari
											jurnalis olahraga, analis taktikal, dan kreator konten
											yang memiliki passion mendalam terhadap sepak bola. Kami
											beroperasi dari Jakarta, Indonesia, dengan cakupan
											editorial yang menjangkau liga-liga utama dunia.
										</p>
										<p>
											Setiap konten melewati proses editing dan fact-checking
											untuk memastikan standar akurasi dan profesionalisme. Kami
											juga membuka peluang kolaborasi bagi penulis tamu dan
											kontributor yang memiliki perspektif unik seputar dunia
											sepak bola.
										</p>
										<p style={{ fontStyle: "italic", opacity: 0.75 }}>
											Tertarik berkontribusi? Kirimkan tulisan Anda ke{" "}
											<span style={{ color: colors.primary }}>
												{process.env.NEXT_PUBLIC_CONTACT_EMAIL}
											</span>
										</p>
									</div>
								</div>

								{/* Section 6: Kontak */}
								<div
									id="section-6"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-6" ? colors.primary : colors.glassBorder}`,
										boxShadow:
											activeSection === "section-6"
												? `0 0 20px ${colors.primaryAlpha}`
												: "none",
									}}
								>
									<div className="flex items-center gap-4 mb-6">
										<Users
											className="w-8 h-8 shrink-0"
											style={{ color: colors.primary }}
										/>
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											Kontak
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Untuk pertanyaan, kerjasama, atau sekadar ngobrol soal
											bola, kami selalu terbuka. Hubungi kami melalui:
										</p>
										<ul className="list-none pl-0 space-y-2">
											<li
												style={{
													display: "flex",
													gap: "8px",
													alignItems: "baseline",
												}}
											>
												<span style={{ color: colors.text, minWidth: "60px" }}>
													Email:
												</span>
												<span style={{ color: colors.primary }}>
													{process.env.NEXT_PUBLIC_CONTACT_EMAIL}
												</span>
											</li>
											<li
												style={{
													display: "flex",
													gap: "8px",
													alignItems: "baseline",
												}}
											>
												<span style={{ color: colors.text, minWidth: "60px" }}>
													WhatsApp:
												</span>
												<span style={{ color: colors.primary }}>
													+62 877-7748-7925
												</span>
											</li>
											<li
												style={{
													display: "flex",
													gap: "8px",
													alignItems: "baseline",
												}}
											>
												<span style={{ color: colors.text, minWidth: "60px" }}>
													Alamat:
												</span>
												<span>
													Gedung STC Lt.4 Ruang 80, Jakarta, Indonesia
												</span>
											</li>
										</ul>
									</div>
								</div>

								{/* CTA */}
								<div
									className="relative rounded-2xl p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
									style={{
										background: `linear-gradient(135deg, ${colors.primaryContainer}, ${colors.primary})`,
									}}
								>
									<div className="relative z-10">
										<h3
											className="font-bold mb-2"
											style={{
												fontSize: "24px",
												color: colors.onPrimary,
											}}
										>
											Bergabung bersama kami
										</h3>
										<p
											style={{
												color: isDark
													? "rgba(0, 55, 50, 0.8)"
													: "rgba(255, 255, 255, 0.8)",
											}}
										>
											Datang dan nikmati pengalaman membaca dan bermain seputar
											sepak bola bersama komunitas kami.
										</p>
									</div>
									<Link
										href="/sapa"
										className="relative z-10 px-8 py-4 font-bold uppercase rounded-full transition-all active:scale-95"
										style={{
											backgroundColor: colors.onPrimary,
											color: colors.primaryContainer,
											fontSize: "14px",
											letterSpacing: "0.05em",
										}}
									>
										Hubungi Kami
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
