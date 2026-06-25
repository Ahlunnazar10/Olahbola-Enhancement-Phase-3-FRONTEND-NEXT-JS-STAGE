"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { useState } from "react";
import { Shield } from "lucide-react";

export default function KebijakanPrivasiPage() {
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
		{ id: "section-1", label: "Pengumpulan Data" },
		{ id: "section-2", label: "Penggunaan Informasi" },
		{ id: "section-3", label: "Berbagi Informasi" },
		{ id: "section-4", label: "Pihak Ketiga (Google)" },
		{ id: "section-5", label: "Retensi" },
		{ id: "section-6", label: "Hak Pengguna" },
		{ id: "section-7", label: "Perlindungan Informasi" },
		{ id: "section-8", label: "Keamanan Data" },
		{ id: "section-9", label: "Perubahan Kebijakan" },
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
							Kebijakan{" "}
							<span style={{ color: colors.primaryContainer }}>Privasi</span>
						</h1>

						<p
							className="max-w-2xl mx-auto leading-relaxed"
							style={{
								fontSize: "18px",
								color: colors.textSecondary,
								lineHeight: "1.6",
							}}
						>
							Komitmen Olahbola dalam melindungi data pribadi Anda dan menjamin
							pengalaman digital yang aman dalam ekosistem olahraga modern kami.
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
										border: `1px solid ${activeSection === "section-1" ? colors.primary : colors.glassBorder}`,
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
											1. Informasi yang Kami Kumpulkan
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Olahbola (&ldquo;Olahbola&rdquo;, &ldquo;kami&rdquo;)
											menghormati privasi Anda dan berkomitmen melindungi
											informasi pribadi yang dikumpulkan melalui situs web dan
											platform media sosial kami (&ldquo;Media Olahbola&rdquo;).
											Kebijakan Privasi ini menjelaskan cara kami mengumpulkan,
											menggunakan, dan menjaga data Anda.
										</p>
										<p>Kami dapat mengumpulkan:</p>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Data pribadi yang diberikan secara sukarela (misalnya
												nama, email, informasi kontak).
											</li>
											<li>
												Data penggunaan seperti alamat IP, jenis browser, dan
												aktivitas di situs.
											</li>
											<li>
												Informasi terkait partisipasi dalam kuis, kampanye, atau
												partnership brand.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 2 */}
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
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											2. Penggunaan Informasi
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>Informasi yang dikumpulkan dapat digunakan untuk:</p>
										<ul className="list-disc pl-6 space-y-2">
											<li>Menyediakan dan meningkatkan layanan Olahbola.</li>
											<li>
												Memfasilitasi partnership brand dan penempatan iklan.
											</li>
											<li>
												Mengirimkan pembaruan, promosi, atau detail kampanye.
											</li>
											<li>Memenuhi kewajiban hukum dan regulasi.</li>
										</ul>
									</div>
								</div>

								{/* Section 3 */}
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
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											3. Berbagi Informasi
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Kami tidak menjual atau mengungkapkan informasi pribadi
											kepada pihak ketiga, kecuali:
										</p>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Jika diwajibkan oleh hukum atau otoritas regulasi.
											</li>
											<li>
												Dengan penyedia layanan terpercaya yang mendukung
												operasional Olahbola.
											</li>
											<li>
												Dengan brand partner, hanya untuk tujuan kampanye yang
												disepakati.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 4: Pihak Ketiga - Google */}
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
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											4. Pihak Ketiga (Google)
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Olahbola menggunakan layanan dari{" "}
											<span className="font-semibold">Google</span> sebagai
											penyedia pihak ketiga untuk berbagai fungsi operasional dan
											analitik, antara lain:
										</p>
										<ul className="list-disc pl-6 space-y-3">
											<li>
												<strong>Google Tag Manager (GTM)</strong> &mdash; untuk
												mengelola dan men-deploy tag pemasaran serta analitik
												pada situs web kami.
											</li>
											<li>
												<strong>Google Analytics</strong> &mdash; untuk menganalisis
												lalu lintas pengunjung, perilaku penggunaan, dan
												kinerja halaman sehingga kami dapat meningkatkan
												pengalaman pengguna.
											</li>
											<li>
												<strong>Google Fonts</strong> &mdash; untuk menampilkan
												font web yang konsisten di berbagai perangkat pengguna.
											</li>
											<li>
												<strong>Vercel Analytics</strong> &mdash; layanan analitik
												pihak ketiga yang membantu kami memantau performa dan
												kecepatan situs.
											</li>
										</ul>
										<p>
											Layanan Google tersebut dapat menempatkan{" "}
											<strong>cookie</strong> di perangkat Anda untuk tujuan
											analitik dan pempersonalisasian. Data yang dikumpulkan oleh
											layanan Google akan tunduk pada{" "}
											<a
												href="https://policies.google.com/privacy"
												target="_blank"
												rel="noopener noreferrer"
												className="underline font-medium hover:no-underline"
												style={{ color: colors.primary }}
											>
												Kebijakan Privasi Google
											</a>{" "}
											yang berlaku. Anda dapat mengelola preferensi cookie Anda
											melalui pengaturan cookie di browser atau dengan menekan
											tombol pada banner cookie kami.
										</p>
										<p>
											Kami tidak membagikan data pribadi yang dapat
											mengidentifikasi Anda secara langsung (seperti nama atau
											alamat email) kepada Google tanpa persetujuan eksplisit dari
											Anda.
										</p>
									</div>
								</div>

								{/* Section 5: Retensi */}
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
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											5. Retensi
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Informasi pribadi disimpan hanya selama diperlukan untuk
										tujuan yang dijelaskan di atas atau sebagaimana diwajibkan
										oleh hukum.
									</p>
								</div>

								{/* Section 6: Hak Pengguna */}
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
										<h2
											className="font-bold italic leading-10 text-3xl md:text-4xl"
											style={{
												color: colors.text,
												fontFamily:
													"var(--font-space-grotesk, 'Space Grotesk', sans-serif)",
											}}
										>
											6. Hak Pengguna
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Anda berhak meminta akses, koreksi, atau penghapusan
										informasi pribadi dengan menghubungi administrator Olahbola.
									</p>
								</div>

								{/* Section 7: Perlindungan Informasi */}
								<div
									id="section-7"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-7" ? colors.primary : colors.glassBorder}`,
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
											7. Perlindungan Informasi
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Kami menerapkan langkah administratif, teknis, dan fisik
										yang sesuai untuk melindungi informasi pribadi dari akses,
										penyalahgunaan, atau pengungkapan yang tidak sah. Meskipun
										tidak ada sistem yang sepenuhnya aman, Olahbola berupaya
										menjaga praktik sesuai standar industri untuk menjamin data
										Anda ditangani secara bertanggung jawab.
									</p>
								</div>

								{/* Section 8: Keamanan Data */}
								<div
									id="section-8"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-8" ? colors.primary : colors.glassBorder}`,
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
											8. Keamanan Data
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Olahbola menggunakan langkah keamanan yang wajar, termasuk
										enkripsi, pembatasan akses, dan protokol pemantauan, untuk
										melindungi data yang tersimpan dalam sistem kami. Kami
										secara berkala meninjau dan memperbarui praktik keamanan
										guna mengurangi risiko dan memastikan kepatuhan terhadap
										regulasi yang berlaku.
									</p>
								</div>

								{/* Section 9: Perubahan Kebijakan Privasi */}
								<div
									id="section-9"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-9" ? colors.primary : colors.glassBorder}`,
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
											9. Perubahan Kebijakan Privasi
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Olahbola berhak untuk mengubah Kebijakan Privasi ini kapan
										saja. Tanggal Berlaku yang tercantum di bawah menunjukkan
										terakhir kali Kebijakan ini diperbarui. Kami menganjurkan
										Anda untuk meninjau halaman ini secara berkala, karena
										perubahan dapat dilakukan terkait pengumpulan dan penggunaan
										data pribadi Anda. Penggunaan berkelanjutan atas
										Olahbola.com dan penerimaan layanan kami setelah adanya
										perubahan pada Kebijakan Privasi ini berarti Anda menyetujui
										perubahan tersebut.
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
										<Shield className="size-50 opacity-10" />
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
											Hubungi tim privasi kami untuk klarifikasi detail.
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