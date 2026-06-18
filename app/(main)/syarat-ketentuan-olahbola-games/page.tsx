"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { useState } from "react";
import { FileText } from "lucide-react";

export default function SyaratKetentuanPage() {
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
		{ id: "section-1", label: "Partisipasi" },
		{ id: "section-2", label: "Akses Fitur" },
		{ id: "section-3", label: "Cara Bermain" },
		{ id: "section-4", label: "Main Fair & Seru" },
		{ id: "section-5", label: "Hindari Hal Ini" },
		{ id: "section-6", label: "Pemantauan Sistem" },
		{ id: "section-7", label: "Pelanggaran" },
		{ id: "section-8", label: "Peringkat & Hasil" },
		{ id: "section-9", label: "Hadiah" },
		{ id: "section-10", label: "Update Ketentuan" },
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
							className="font-black text-3xl md:text-7xl italic uppercase mb-8 leading-tight"
							style={{
								color: colors.text,
								textShadow: isDark ? "0 0 15px rgba(0, 194, 177, 0.5)" : "none",
							}}
						>
							Syarat & Ketentuan{" "}
							<span style={{ color: colors.primaryContainer }}>
								Olahbola Games
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
							Syarat & Ketentuan Kuis & Prediksi Skor Olahbola. Selamat datang
							di pengalaman seru Olahbola! Jaga keamanan akun kamu dengan baik
							dan pastikan perangkat dan koneksi yang digunakan stabil ya!
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

							{/* Main Content */}
							<div className="lg:col-span-8 space-y-8">
								{/* Intro Note */}
								<div
									className="p-8 md:p-12 rounded-xl"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${colors.glassBorder}`,
									}}
								>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Dengan ikut serta dalam kuis dan prediksi skor, kamu setuju
										untuk bermain secara adil, menyenangkan, dan mengikuti
										ketentuan berikut:
									</p>
								</div>

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
											1. Partisipasi
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Kuis dan prediksi skor tersedia untuk pengguna Olahbola
												yang sudah terdaftar.
											</li>
											<li>
												Pastikan data yang kamu gunakan benar dan aktif, agar
												tidak ada kendala ke depannya.
											</li>
											<li>
												Setiap peserta hanya diperbolehkan memiliki 1 akun.
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
											2. Akses Fitur
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Beberapa fitur dapat diakses gratis (trial), dan ke
												depan akan tersedia akses eksklusif tertentu.
											</li>
											<li>
												Akses yang sudah diaktifkan tidak dapat dibatalkan atau
												ditarik kembali.
											</li>
											<li>
												Olahbola dapat melakukan penyesuaian fitur untuk
												meningkatkan pengalaman pengguna.
											</li>
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
											3. Cara Bermain
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<ul className="list-disc pl-6 space-y-2">
											<li>Ikuti alur dan aturan yang tersedia di sistem.</li>
											<li>
												Semua hasil, skor, dan waktu tercatat otomatis oleh
												sistem Olahbola.
											</li>
											<li>
												Hasil yang tercatat di sistem menjadi acuannya—simple
												dan transparan.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 4 */}
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
											4. Main Fair & Seru
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Kami percaya permainan terbaik adalah yang jujur dan
												fair.
											</li>
											<li>
												Jadi, pastikan kamu bermain dengan cara yang wajar dan
												tanpa &ldquo;shortcut&rdquo;.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 5 */}
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
											5. Hindari Hal Ini
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Untuk menjaga permainan tetap adil, berikut hal yang tidak
											diperkenankan:
										</p>
										<ul className="list-disc pl-6 space-y-2">
											<li>Menggunakan bot, script, atau tools otomatis</li>
											<li>Mencoba memanfaatkan celah sistem</li>
											<li>Menggunakan lebih dari satu akun</li>
											<li>Bekerja sama untuk memanipulasi hasil</li>
											<li>Aktivitas tidak wajar yang terdeteksi sistem</li>
										</ul>
										<p>
											Sistem kami dirancang untuk menjaga fairness, jadi
											aktivitas yang tidak normal bisa langsung ditindak.
										</p>
									</div>
								</div>

								{/* Section 6 */}
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
											6. Pemantauan Sistem
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Aktivitas akan dianalisis untuk memastikan permainan
												tetap sehat dan adil.
											</li>
											<li>
												Data dari sistem menjadi dasar utama dalam penilaian.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 7 */}
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
											7. Jika Terjadi Pelanggaran
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Untuk menjaga kenyamanan semua pengguna, Olahbola berhak
											mengambil langkah berikut:
										</p>
										<ul className="list-disc pl-6 space-y-2">
											<li>Menghapus skor atau hasil</li>
											<li>Mengeluarkan dari leaderboard</li>
											<li>Membatalkan posisi sebagai pemenang</li>
											<li>Membatasi atau menonaktifkan akun</li>
											<li>Menghentikan akses ke fitur tertentu</li>
										</ul>
										<p>
											Semua keputusan diambil untuk menjaga ekosistem tetap fair
											& kompetitif.
										</p>
									</div>
								</div>

								{/* Section 8 */}
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
											8. Peringkat & Hasil
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Peringkat ditentukan berdasarkan data yang tercatat di
												sistem.
											</li>
											<li>
												Penyesuaian dapat dilakukan jika terdapat
												ketidaksesuaian.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 9 */}
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
											9. Hadiah & Pengambilan
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<ul className="list-disc pl-6 space-y-2">
											<li>
												Peserta dengan performa terbaik berkesempatan
												mendapatkan hadiah sesuai ketentuan yang berlaku.
											</li>
											<li>
												Setiap pemenang tidak dapat diwakilkan dalam bentuk apa
												pun.
											</li>
											<li>
												Pengambilan hadiah harus dilakukan oleh pemenang yang
												bersangkutan, sesuai dengan waktu dan tempat yang akan
												diinformasikan oleh tim Olahbola.
											</li>
											<li>
												Olahbola berhak melakukan proses verifikasi sebelum
												penyerahan hadiah.
											</li>
											<li>
												Segala kewajiban yang timbul terkait penerimaan hadiah
												menjadi tanggung jawab masing-masing penerima.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 10 */}
								<div
									id="section-10"
									className="p-8 md:p-12 rounded-xl transition-all cursor-pointer"
									style={{
										background: colors.glassBg,
										backdropFilter: "blur(40px)",
										border: `1px solid ${activeSection === "section-10" ? colors.primary : colors.glassBorder}`,
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
											10. Update Ketentuan
										</h2>
									</div>
									<p
										className="leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										Ketentuan ini dapat diperbarui sewaktu-waktu demi
										peningkatan layanan dan kualitas pengalaman pengguna.
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
										<FileText className="size-50 opacity-10" />
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
											Hubungi tim kami untuk klarifikasi detail.
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
