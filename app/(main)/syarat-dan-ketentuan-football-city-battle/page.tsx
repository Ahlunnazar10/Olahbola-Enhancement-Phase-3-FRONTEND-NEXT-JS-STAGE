"use client";

import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { useState } from "react";
import { Shield, Gift, Calendar, Trophy, Star } from "lucide-react";

export default function SyaratDanKetentuanFCBPage() {
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
		{ id: "section-1", label: "Periode Kompetisi" },
		{ id: "section-2", label: "Struktur Hadiah" },
		{ id: "section-3", label: "Syarat Kelayakan" },
		{ id: "section-4", label: "Ketentuan Upgrade" },
		{ id: "section-5", label: "Kebijakan Umum" },
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
								fontSize: "clamp(2rem, 5vw, 4rem)",
								color: colors.text,
								textShadow: isDark ? "0 0 15px rgba(0, 194, 177, 0.5)" : "none",
							}}
						>
							Syarat dan Ketentuan{" "}
							<span style={{ color: colors.primaryContainer }}>
								Football City Battle
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
							Bacalah dengan seksama seluruh syarat dan ketentuan yang berlaku
							dalam Football City Battle untuk memastikan Anda memahami hak,
							kewajiban, serta mekanisme yang berlaku selama mengikuti football
							city battle.
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

							{/* Main Content Text */}
							<div className="lg:col-span-8 space-y-8">
								{/* Section 1: Periode Kompetisi */}
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
											1. Periode Kompetisi
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Football City Battle merupakan ajang kompetisi sepak bola
											yang telah dinantikan oleh para penggemar dari berbagai
											penjuru kota. Event seru ini diselenggarakan dengan
											periode pelaksanaan yang telah ditetapkan secara resmi,
											yakni berlangsung hingga tanggal 28 Juni 2026.
										</p>
										<p>
											Jangan sampai melewatkan satu pun momen seru dari battle
											antar kota terbesar musim ini!
										</p>
									</div>
								</div>

								{/* Section 2: Struktur Hadiah */}
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
											2. Struktur Hadiah
										</h2>
									</div>
									<div
										className="space-y-6 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Kami menyediakan struktur hadiah yang beragam dan atraktif
											untuk para pemenang Football City Battle, dengan tiga
											kategori utama yang disesuaikan berdasarkan tipe langganan
											dan achievement peserta. Berikut adalah penjelasan lengkap
											mengenai masing-masing kategori hadiah:
										</p>

										{/* Hadiah Harian */}
										<div
											className="rounded-lg p-6"
											style={{
												background: colors.primaryAlpha5,
												border: `1px solid ${colors.primaryAlpha40}`,
											}}
										>
											<div className="flex items-center gap-3 mb-3">
												<h3
													className="font-bold"
													style={{
														color: colors.primary,
														fontSize: "18px",
													}}
												>
													Hadiah Harian — Saldo GOPAY sebesar Rp20.000
												</h3>
											</div>
											<p className="text-sm leading-relaxed">
												Hadiah harian berupa saldo GOPAY senilai Rp20.000 (dua
												puluh ribu rupiah) akan diberikan kepada peserta dengan
												perolehan skor tertinggi pada setiap harinya. Hadiah ini
												berlaku untuk seluruh pelanggan Olahbola dan HeroPlay
												dengan paket langganan Weekly maupun Monthly. Pemenang
												harian akan ditentukan berdasarkan total poin tertinggi
												yang dicapai dalam periode satu hari, dan informasi
												pemenang akan diumumkan pada keesokan harinya melalui
												saluran resmi Olahbola atau HeroPlay.
											</p>
										</div>

										{/* Hadiah Mingguan */}
										<div
											className="rounded-lg p-6"
											style={{
												background: colors.primaryAlpha5,
												border: `1px solid ${colors.primaryAlpha40}`,
											}}
										>
											<div className="flex items-center gap-3 mb-3">
												<h3
													className="font-bold"
													style={{
														color: colors.primary,
														fontSize: "18px",
													}}
												>
													Hadiah Mingguan — Merchandise Resmi Adidas
												</h3>
											</div>
											<p className="text-sm leading-relaxed">
												Hadiah mingguan berupa merchandise resmi Adidas selektif
												akan diberikan kepada peserta dengan peringkat tertinggi
												pada akhir setiap minggu kompetisi. Hadiah ini hanya
												terbuka dan eligible bagi para pelanggan Olahbola dan
												HeroPlay dengan paket langganan Monthly. Mekanisme
												pemilihan winner mingguan akan dilakukan berdasarkan
												total akumulasi poin selama tujuh hari periode mingguan
												yang berlangsung, dan hadiah tidak dapat diuangkan atau
												ditukar dengan bentuk penghargaan lainnya.
											</p>
										</div>

										{/* Grand Prize */}
										<div
											className="rounded-lg p-6"
											style={{
												background: colors.primaryAlpha,
												border: `1px solid ${colors.primaryAlpha40}`,
											}}
										>
											<div className="flex items-center gap-3 mb-3">
												<h3
													className="font-bold"
													style={{
														color: colors.primary,
														fontSize: "18px",
													}}
												>
													Grand Prize — Motor, Gaming Tablet, Gaming Chair, dan
													Bola Adidas 2026
												</h3>
											</div>
											<p className="text-sm leading-relaxed">
												Grand Prize merupakan kelompok hadiah utama dalam
												Football City Battle yang mencakup perangkat dan
												perlengkapan sports premium. Detail hadiah Grand Prize
												adalah sebagai berikut:
											</p>
											<ul className="mt-3 space-y-2 list-disc pl-6 text-sm">
												<li>
													<strong>1 Unit Motor</strong> — Untuk peringkat
													terbaik pertama dengan status langganan HeroPlay
													Premium Monthly aktif.
												</li>
												<li>
													<strong>2 Unit Gaming Tablet</strong> — Untuk
													peringkat kedua dan ketiga dengan status langganan
													HeroPlay Premium Monthly aktif.
												</li>
												<li>
													<strong>3 Unit Gaming Chair</strong> — Untuk peringkat
													keempat hingga keenam dengan status langganan HeroPlay
													Premium Monthly aktif.
												</li>
												<li>
													<strong>
														4 dan 5 Bola Adidas Resmi Piala Dunia 2026
													</strong>{" "}
													— Untuk peringkat ketujuh hingga kesebelas dengan
													status langganan HeroPlay Premium Monthly aktif.
												</li>
											</ul>
											<p className="mt-3 text-sm">
												Keseluruhan Grand Prize hanya disediakan dan ditujukan
												secara spesifik bagi peserta dengan langganan HeroPlay
												Premium Monthly yang aktif pada saat pengundian dan
												penentuan pemenang dilakukan. Peserta diharapkan
												memastikan status langganan mereka tetap aktif dan tidak
												dalam kondisi terblokir atau tertunggak hingga
												berakhirnya periode kompetisi.
											</p>
										</div>
									</div>
								</div>

								{/* Section 3: Syarat Kelayakan */}
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
											3. Syarat Kelayakan Grand Prize
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Untuk dapat bersaing dan berkesempatan memenangkan
											keseluruhan Grand Prize, setiap peserta wajib memenuhi
											seluruh syarat dan ketentuan kelayakan yang berlaku. Kami
											menetapkan persyaratan yang transparan dan adil demi
											menjamin kejuangan yang wajar bagi seluruh peserta yang
											berhak. Syarat kelayakan Grand Prize Football City Battle
											adalah sebagai berikut:
										</p>
										<ul className="list-disc pl-6 space-y-3">
											<li>
												<strong>
													Langganan HeroPlay Premium Bulanan Aktif
												</strong>{" "}
												— Peserta wajib memiliki dan menjaga status langganan
												HeroPlay Premium Monthly yang aktif dan tidak terblokir
												selama periode kompetisi berlangsung hingga tanggal 28
												Juni 2026. Langganan yang telah kadarluarsa atau tidak
												diperpanjang tidak akan dinyatakan eligible.
											</li>
											<li>
												<strong>Top 5 Leaderboard Kompetisi</strong> — Peserta
												harus berhasil mempertahankan atau mencapai posisi dalam
												5 besar klasemen (leaderboard) di akhir periode
												kompetisi Football City Battle. peringkat ditentukan
												berdasarkan total akumulasi poin yang diperoleh dari
												seluruh skor yang telah dikirimkan dan dinilai benar
												selama periode kompetisi.
											</li>
											<li>
												<strong>Verifikasi Identitas</strong> — Kami berhak
												melakukan verifikasi terhadap data identitas peserta
												sebelum hadiah Grand Prize diserahkan. Peserta yang
												gagal melakukan verifikasi identitas dengan benardan
												lengkap dalam batas waktu yang ditentukan akan
												kehilangan hak atas penghargaan yang berhak diterimanya.
											</li>
											<li>
												<strong>Kepatuhan terhadap Syarat dan Ketentuan</strong>{" "}
												— Seluruh peserta diharapkan untuk selalu mematuhi
												syarat dan ketentuan yang berlaku. Setiap bentuk
												pelanggaran terhadap aturan kompetisi, termasuk namun
												tidak terbatas pada tindakan manipulasi skor,
												menggunakan akun duplikat, atau penyalahgunaan sistem,
												dapat mengakibatkan diskualifikasi dari kompetisi dan
												pencabutan hak atas hadiah apa pun yang telah diperoleh.
											</li>
										</ul>
									</div>
								</div>

								{/* Section 4: Ketentuan Upgrade */}
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
											4. Ketentuan Upgrade Paket
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Olahbola dan HeroPlay menyadari bahwa tidak semua peserta
											mungkin memiliki akses terhadap kategori hadiah tertinggi
											pada awal periode kompetisi. Guna menjamin kesempatan yang
											adil bagi seluruh peserta dalam memperebutkan hadiah yang
											lebih besar, kami menyediakan mekanisme upgrade paket yang
											fleksibel dan terjangkau. Dengan melakukan upgrade paket
											langganan, peserta secara otomatis membuka akses terhadap
											kategori hadiah yang lebih tinggi sesuai dengan paket yang
											dipilih.
										</p>
										<p>
											Keunggulan utama dari mekanisme upgrade ini adalah
											dibandingkan dengan biaya langganan standar, peserta cukup
											menambah selisih harga mulai dari Rp1.500 saja untuk dapat
											menikmati paket yang lebih lengkap. Berikut adalah detail
											lengkap mengenai opsi upgrade paket yang tersedia selama
											periode Football City Battle:
										</p>
										<ul className="list-disc pl-6 space-y-3">
											<li>
												<strong>Upgrade ke Paket Weekly HeroPlay</strong> — Bagi
												peserta yang sebelumnya hanya memiliki paket free atau
												basic, upgrade ke paket Weekly HeroPlay menawarkan
												keunggulan berupa gratis 1 minggu berlangganan HeroPlay
												yang dapat dipergunakan sepenuhnya selama periode
												promosi campaign Football City Battle berlangsung.
											</li>
											<li>
												<strong>Upgrade ke Paket Monthly Olahbola</strong> —
												Bagi peserta yang sebelumnya menggunakan paket Weekly
												Olahbola atau paket free, upgrade ke paket Monthly
												Olahbola memberikanBenefit berupa gratis 1 bulan
												langganan HeroPlay yang dapat digunakan sepenuhnya untuk
												mengakses konten premium HeroPlay selama periode
												campaign.
											</li>
											<li>
												<strong>Upgrade ke Paket Monthly HeroPlay</strong> —
												Bagi peserta yang sebelumnya menggunakan paket Weekly,
												upgrade ke paket Monthly HeroPlay menawarkan free
												upgrade berupa gratis 1 bulan berlangganan HeroPlay
												Premium yang dapat digunakan sepenuhnya untuk mengakses
												seluruh konten premium HeroPlay selama periode campaign.
											</li>
											<li>
												<strong>
													Upgrade ke Paket HeroPlay Premium Monthly
												</strong>{" "}
												— Bagi peserta yang ingin berjuang untuk Grand Prize,
												upgrade ke paket HeroPlay Premium Monthly memberikan
												bonus berupa gratis 1 bulan berlangganan HeroPlay
												Premium Monthly yang berlaku selama periode promosi
												campaign Football City Battle, sehingga peserta dapat
												langsung bersaing di kategori hadiah Grand Prize tanpa
												perlu membayar selisih penuh.
											</li>
										</ul>
										<p>
											Perlu ditekankan bahwa promo gratissekaligus kesempatan
											upgrade spesial ini hanya berlaku dan dapat dimanfaatkan
											selama periode campaign Football City Battle berlangsung,
											yaitu hingga tanggal 28 Juni 2026. Setelah periode
											campaign berakhir, mekanisme upgrade dan benefit gratis
											yang berlaku akan kembali kepada ketentuan harga dan paket
											standar Olahbola dan HeroPlay yang berlaku umum.
										</p>
									</div>
								</div>

								{/* Section 5: Kebijakan Umum */}
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
											5. Kebijakan Umum Kompetisi
										</h2>
									</div>
									<div
										className="space-y-4 leading-relaxed"
										style={{ color: colors.textSecondary }}
									>
										<p>
											Kami berhak untuk mengubah, memodifikasi, atau memperbarui
											syarat dan ketentuan Football City Battle kapan saja
											apabila dianggap perlu, dengan perubahan tersebut akan
											diinformasikan terlebih dahulu melalui channel resmi
											Olahbola atau HeroPlay. Keputusan dalam seluruh aspek yang
											berkaitan dengan kompetisi, termasuk namun tidak terbatas
											pada penentuan pemenang, perhitungan poin, serta
											penyerahan hadiah, bersifat final dan mengikat seluruh
											peserta.
										</p>
										<p>
											Seluruh peserta competitions Football City Battle
											diharuskan untuk mematuhi pedoman komunitas dan kode etik
											yang berlaku di platform Olahbola atau HeroPlay. Setiap
											bentuk tindakan yang dinilai dapat merusakIntegritas
											kompetisi atau merugikan peserta lain dapat mengakibatkan
											sanksi berupa peringatan, suspensi, atau diskualifikasi
											sesuai dengan tingkat pelanggaran yang terjadi.
										</p>
										<p>
											Kami tidak bertanggung jawab atas kerugian atau kondisi
											tidak menyenangkan yang timbul akibat partisipasi peserta
											dalam kompetisi ini, termasuk namun tidak terbatas pada
											masalah teknis yang berada di luar jangkauan kami atau
											kesalahan yang dilakukan oleh peserta sendiri.
										</p>
										<p>
											Dengan continued partisipasi dalam Football City Battle,
											setiap peserta dianggap telah membaca, memahami, dan
											Setuju untuk terikat oleh seluruh syarat dan ketentuan
											yang berlaku. Apabila Anda memiliki pertanyaan lebih
											lanjut mengenai kompetisi ini, silakan menghubungi tim
											Olahbola atau HeroPlay melalui saluran resmi yang
											tersedia.
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
									<div className="relative z-10">
										<h3
											className="font-bold mb-2"
											style={{
												fontSize: "24px",
												color: colors.onPrimary,
											}}
										>
											Siap memperebutkan hadiahnya?
										</h3>
										<p
											style={{
												color: isDark
													? "rgba(0, 55, 50, 0.8)"
													: "rgba(255, 255, 255, 0.8)",
											}}
										>
											Jadikan kotamu posisi teratas di leaderboard Football City
											Battle.
										</p>
									</div>
									<a
										href="https://mainhero.id"
										target="_blank"
										rel="noopener noreferrer"
										className="relative z-10 px-10 py-4 font-bold uppercase rounded-full transition-all active:scale-95 w-full md:w-auto"
										style={{
											backgroundColor: colors.onPrimary,
											color: colors.primaryContainer,
											fontSize: "14px",
											letterSpacing: "0.05em",
										}}
									>
										Bermain!
									</a>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
