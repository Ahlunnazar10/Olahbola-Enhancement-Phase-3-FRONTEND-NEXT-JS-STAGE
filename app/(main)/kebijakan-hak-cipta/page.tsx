"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { useState } from "react";

export default function KebijakanHakCiptaPage() {
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
		{ id: "section-1", label: "Kepemilikan Konten" },
		{ id: "section-2", label: "Pembatasan Penggunaan" },
		{ id: "section-3", label: "Konten Pengguna" },
		{ id: "section-4", label: "Tindakan Hukum" },
		{ id: "section-5", label: "Prosedur Takedown" },
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
							<span style={{ color: colors.primaryContainer }}>Hak Cipta</span>
						</h1>

						<p
							className="max-w-2xl mx-auto leading-relaxed"
							style={{
								fontSize: "18px",
								color: colors.textSecondary,
								lineHeight: "1.6",
							}}
						>
							Seluruh konten yang dipublikasikan di Olahbola.com dan platform
							media sosial Olahbola (&ldquo;Media Olahbola&rdquo;), termasuk
							namun tidak terbatas pada teks, grafis, logo, gambar, video, kuis,
							dan materi kampanye, merupakan milik Olahbola atau mitra konten,
							dan dilindungi oleh hukum hak cipta serta hak kekayaan intelektual
							yang berlaku.
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
											1. Kepemilikan Konten
										</h2>
									</div>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Kecuali dinyatakan lain, seluruh hak atas konten di Media
											Olahbola dimiliki oleh Olahbola.
										</li>
										<li>
											Brand partner dapat menyediakan materi iklan atau promosi;
											konten tersebut tetap menjadi hak kekayaan intelektual
											brand terkait, namun Olahbola berhak menayangkan,
											mendistribusikan, dan mengarsipkan materi tersebut sebagai
											bagian dari layanannya.
										</li>
									</ul>
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
											2. Pembatasan Penggunaan
										</h2>
									</div>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Pengguna hanya diperbolehkan mengakses dan menggunakan
											Media Olahbola untuk tujuan pribadi dan non-komersial.
										</li>
										<li>
											Konten tidak boleh disalin, diperbanyak, dipublikasikan
											ulang, diunggah, diposting, ditransmisikan, atau
											didistribusikan dengan cara apa pun tanpa persetujuan
											tertulis dari Olahbola.
										</li>
										<li>
											Penggunaan konten Olahbola tanpa izin, termasuk modifikasi
											atau eksploitasi komersial, dapat berakibat pada tindakan
											hukum.
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
											3. Konten yang Dihasilkan Pengguna
										</h2>
									</div>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Dengan mengirimkan konten (misalnya partisipasi kuis,
											komentar, atau entri kampanye), pengguna memberikan
											lisensi non-eksklusif, bebas royalti, berlaku global
											kepada Olahbola untuk menggunakan, mereproduksi, dan
											mendistribusikan konten tersebut untuk tujuan terkait
											Media Olahbola.
										</li>
										<li>
											Pengguna wajib memastikan bahwa konten yang dikirimkan
											tidak melanggar hak pihak ketiga. Olahbola tidak
											bertanggung jawab atas pelanggaran yang timbul dari konten
											pengguna.
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
											4. Tindakan Hukum
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Olahbola berhak menghapus konten yang melanggar serta
										mengambil tindakan hukum terhadap penggunaan tidak sah atas
										kekayaan intelektualnya.
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
											5. Prosedur Takedown
										</h2>
									</div>
									<p
										className="mb-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Jika Anda meyakini bahwa materi berhak cipta milik Anda
										digunakan di Media Olahbola tanpa izin, Anda dapat
										mengajukan pemberitahuan takedown kepada Olahbola. Setelah
										menerima pemberitahuan yang sah, Olahbola akan mengambil
										langkah yang wajar untuk menghapus atau menonaktifkan akses
										terhadap materi yang melanggar sesuai hukum hak cipta yang
										berlaku.
									</p>
									<p
										className="mb-4 leading-relaxed font-bold"
										style={{ color: colors.text }}
									>
										Cara Mengajukan Pemberitahuan Takedown:
									</p>
									<p
										className="mb-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Harp sertakan:
									</p>
									<ul
										className="list-disc pl-6 space-y-2 leading-relaxed mb-6"
										style={{ color: colors.textSecondary }}
									>
										<li>
											Nama lengkap, alamat, nomor telepon, dan alamat email
											Anda.
										</li>
										<li>
											Deskripsi jelas mengenai materi yang dianggap melanggar,
											termasuk lokasinya (misalnya URL).
										</li>
										<li>
											Pernyataan bahwa Anda meminta Olahbola untuk menghapus
											atau menonaktifkan akses ke materi tersebut.
										</li>
										<li>
											Pernyataan bahwa Anda, dengan itikad baik, meyakini materi
											tersebut melanggar hak cipta Anda.
										</li>
										<li>
											Pernyataan bahwa informasi yang diberikan akurat dan bahwa
											Anda adalah pemilik hak cipta atau berwenang bertindak
											atas nama pemilik.
										</li>
									</ul>

									<div
										className="p-4 rounded-lg mb-6"
										style={{
											backgroundColor: `${colors.primaryContainer}10`,
											borderLeft: `4px solid ${colors.primaryContainer}`,
										}}
									>
										<p
											className="font-bold mb-2 leading-relaxed"
											style={{ color: colors.text }}
										>
											Counter-Notice:
										</p>
										<p
											className="leading-relaxed"
											style={{ color: colors.textSecondary }}
										>
											Jika Anda meyakini bahwa materi dihapus atau dinonaktifkan
											karena kesalahan, Anda dapat mengajukan counter-notice
											kepada Olahbola dengan:
										</p>
										<ul
											className="list-disc pl-6 space-y-2 mt-3 leading-relaxed"
											style={{ color: colors.textSecondary }}
										>
											<li>
												Nama lengkap, alamat, nomor telepon, dan alamat email
												Anda.
											</li>
											<li>
												Identifikasi materi yang dihapus atau dinonaktifkan
												serta lokasi sebelumnya.
											</li>
											<li>
												Pernyataan bahwa Anda, dengan itikad baik, meyakini
												penghapusan atau penonaktifan terjadi karena kesalahan
												atau salah identifikasi.
											</li>
											<li>Pernyataan bahwa informasi yang diberikan akurat.</li>
										</ul>
									</div>

									<div
										className="p-4 rounded-lg border"
										style={{
											borderColor: colors.primaryAlpha40,
											backgroundColor: colors.primaryAlpha5,
										}}
									>
										<p
											className="font-bold mb-2 leading-relaxed"
											style={{ color: colors.text }}
										>
											Catatan Penting:
										</p>
										<p
											className="leading-relaxed"
											style={{ color: colors.textSecondary }}
										>
											Memberikan informasi palsu dalam pemberitahuan takedown
											atau counter-notice dapat menimbulkan tanggung jawab
											hukum. Olahbola berhak menangguhkan atau menghentikan akun
											yang berulang kali melanggar hak kekayaan intelektual.
										</p>
									</div>
								</div>

								{/* Call to Action */}
								<div
									className="relative rounded-2xl p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
									style={{
										background: `linear-gradient(135deg, ${colors.primaryContainer}, ${colors.primary})`,
									}}
								>
									<div className="absolute top-0 right-0 opacity-10">
										<span
											className="material-symbols-outlined text-[200px]"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											mail
										</span>
									</div>
									<div className="relative z-10">
										<h3
											className="font-bold mb-2"
											style={{
												fontSize: "24px",
												color: colors.onPrimary,
											}}
										>
											Pengajuan Takedown atau Pertanyaan?
										</h3>
										<p
											style={{
												color: isDark
													? "rgba(0, 55, 50, 0.8)"
													: "rgba(255, 255, 255, 0.8)",
											}}
										>
											Hubungi kami di{" "}
											<a
												href="mailto:admin@olahbola.com"
												className="underline font-bold"
												style={{ color: colors.onPrimary }}
											>
												admin@olahbola.com
											</a>
										</p>
									</div>
									<Link
										href="mailto:admin@olahbola.com"
										className="relative z-10 px-8 py-4 font-bold uppercase rounded-full transition-all active:scale-95"
										style={{
											backgroundColor: colors.onPrimary,
											color: colors.primaryContainer,
											fontSize: "14px",
											letterSpacing: "0.05em",
										}}
									>
										Email
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
