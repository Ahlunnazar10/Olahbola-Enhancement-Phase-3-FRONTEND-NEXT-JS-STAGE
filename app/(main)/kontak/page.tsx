"use client";

import { useState } from "react";
import {
	Mail,
	MessageCircle,
	MapPin,
	Clock,
	Send,
	Loader2,
	CheckCircle2,
	Briefcase,
	HelpCircle,
	Newspaper,
	Shield,
} from "lucide-react";
import Link from "next/link";

const contactChannels = [
	{
		icon: Mail,
		title: "Email",
		value: "admin@olahbola.com",
		href: "mailto:admin@olahbola.com",
		description: "Untuk pertanyaan umum, kemitraan, dan pers",
	},
	{
		icon: MessageCircle,
		title: "WhatsApp",
		value: "+62 877 7748 7925",
		href: "https://wa.me/6287777487925",
		description: "Respon cepat pada jam kerja (Senin–Jumat 09.00–17.00 WIB)",
	},
	{
		icon: MapPin,
		title: "Alamat Kantor",
		value: "Gedung STC LT.4 Ruang 80, Jakarta, Indonesia",
		href: "https://maps.google.com/?q=STC+Senayan+Jakarta",
		description: "Kunjungan hanya dengan janji temu terlebih dahulu",
	},
];

const inquiryTypes = [
	{ icon: HelpCircle, label: "Pertanyaan Umum" },
	{ icon: Briefcase, label: "Kemitraan / Iklan" },
	{ icon: Newspaper, label: "Pers / Media" },
	{ icon: Shield, label: "Pelaporan Konten" },
];

export default function KontakPage() {
	const [form, setForm] = useState({
		name: "",
		email: "",
		type: "Pertanyaan Umum",
		message: "",
	});
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
			setStatus("error");
			return;
		}
		setStatus("loading");
		try {
			const subject = encodeURIComponent(
				`[${form.type}] Pesan dari ${form.name}`,
			);
			const body = encodeURIComponent(
				`Nama: ${form.name}\nEmail: ${form.email}\nKategori: ${form.type}\n\n${form.message}`,
			);
			window.location.href = `mailto:admin@olahbola.com?subject=${subject}&body=${body}`;
			setStatus("success");
			setForm({ name: "", email: "", type: "Pertanyaan Umum", message: "" });
		} catch {
			setStatus("error");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a1410] via-[#0f1f1a] to-[#0a1410]">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-16 md:py-24">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,222,204,0.15),transparent_60%)]" />
				<div className="container relative mx-auto max-w-5xl px-4">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#43decc] backdrop-blur-sm">
						<MessageCircle className="h-3.5 w-3.5" />
						Hubungi Kami
					</div>
					<h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl">
						Kami siap <span className="text-[#43decc]">mendengar</span> Anda
					</h1>
					<p className="max-w-2xl text-lg leading-relaxed text-white/70">
						Punya pertanyaan, masukan, atau ingin berkolaborasi? Tim Olahbola
						senantiasa terbuka untuk berkomunikasi dengan komunitas, mitra, dan
						pihak pers. Pilih channel yang paling nyaman untuk Anda.
					</p>
				</div>
			</section>

			{/* Contact Channels */}
			<section className="container mx-auto max-w-5xl px-4 pb-12">
				<div className="grid gap-4 md:grid-cols-3">
					{contactChannels.map((channel) => {
						const Icon = channel.icon;
						return (
							<a
								key={channel.title}
								href={channel.href}
								target={channel.href.startsWith("http") ? "_blank" : undefined}
								rel={
									channel.href.startsWith("http")
										? "noopener noreferrer"
										: undefined
								}
								className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md transition-all hover:border-[#43decc]/40 hover:bg-white/[0.04]"
							>
								<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#43decc]/20 to-[#43decc]/5 text-[#43decc] ring-1 ring-[#43decc]/30">
									<Icon className="h-5 w-5" />
								</div>
								<h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-white/50">
									{channel.title}
								</h3>
								<p className="mb-2 text-base font-semibold text-white transition-colors group-hover:text-[#43decc]">
									{channel.value}
								</p>
								<p className="text-sm text-white/60">{channel.description}</p>
							</a>
						);
					})}
				</div>
			</section>

			{/* Contact Form */}
			<section className="container mx-auto max-w-5xl px-4 pb-16">
				<div className="grid gap-8 md:grid-cols-5">
					{/* Form */}
					<div className="md:col-span-3">
						<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md md:p-8">
							<h2 className="mb-2 text-2xl font-bold text-white">
								Kirim Pesan
							</h2>
							<p className="mb-6 text-sm text-white/60">
								Isi formulir di bawah ini. Pesan akan dikirim ke email tim kami
								dan kami akan merespon dalam 1–2 hari kerja.
							</p>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="grid gap-5 sm:grid-cols-2">
									<div>
										<label
											htmlFor="name"
											className="mb-2 block text-sm font-medium text-white/80"
										>
											Nama Lengkap
										</label>
										<input
											id="name"
											type="text"
											required
											value={form.name}
											onChange={(e) =>
												setForm({ ...form, name: e.target.value })
											}
											placeholder="Nama Anda"
											className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-[#43decc]/50 focus:bg-white/10"
										/>
									</div>
									<div>
										<label
											htmlFor="email"
											className="mb-2 block text-sm font-medium text-white/80"
										>
											Email
										</label>
										<input
											id="email"
											type="email"
											required
											value={form.email}
											onChange={(e) =>
												setForm({ ...form, email: e.target.value })
											}
											placeholder="email@contoh.com"
											className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-[#43decc]/50 focus:bg-white/10"
										/>
									</div>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-white/80">
										Kategori Pesan
									</label>
									<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
										{inquiryTypes.map((type) => {
											const Icon = type.icon;
											const active = form.type === type.label;
											return (
												<button
													key={type.label}
													type="button"
													onClick={() => setForm({ ...form, type: type.label })}
													className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all ${
														active
															? "border-[#43decc]/50 bg-[#43decc]/10 text-[#43decc]"
															: "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
													}`}
												>
													<Icon className="h-4 w-4" />
													<span className="text-center leading-tight">
														{type.label}
													</span>
												</button>
											);
										})}
									</div>
								</div>

								<div>
									<label
										htmlFor="message"
										className="mb-2 block text-sm font-medium text-white/80"
									>
										Pesan
									</label>
									<textarea
										id="message"
										required
										rows={6}
										value={form.message}
										onChange={(e) =>
											setForm({ ...form, message: e.target.value })
										}
										placeholder="Tulis pesan Anda di sini..."
										className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-[#43decc]/50 focus:bg-white/10"
									/>
								</div>

								{status === "error" && (
									<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
										Mohon lengkapi semua kolom wajib sebelum mengirim pesan.
									</div>
								)}

								{status === "success" && (
									<div className="flex items-center gap-2 rounded-xl border border-[#43decc]/30 bg-[#43decc]/10 px-4 py-3 text-sm text-[#43decc]">
										<CheckCircle2 className="h-4 w-4 shrink-0" />
										Klien email Anda telah terbuka. Kami akan merespon dalam 1–2
										hari kerja.
									</div>
								)}

								<button
									type="submit"
									disabled={status === "loading"}
									className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#43decc] to-[#2bb8a6] px-6 py-3.5 font-semibold text-[#0a1410] transition-all hover:shadow-lg hover:shadow-[#43decc]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
								>
									{status === "loading" ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Membuka Email...
										</>
									) : (
										<>
											<Send className="h-4 w-4" />
											Kirim Pesan
										</>
									)}
								</button>

								<p className="text-xs text-white/40">
									* Dengan mengirim pesan, Anda setuju dengan{" "}
									<Link
										href="/kebijakan-privasi"
										className="text-[#43decc] hover:underline"
									>
										Kebijakan Privasi
									</Link>{" "}
									kami.
								</p>
							</form>
						</div>
					</div>

					{/* Sidebar Info */}
					<aside className="space-y-4 md:col-span-2">
						<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
							<div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#43decc]/10 text-[#43decc]">
								<Clock className="h-5 w-5" />
							</div>
							<h3 className="mb-2 font-semibold text-white">Jam Operasional</h3>
							<ul className="space-y-1.5 text-sm text-white/70">
								<li className="flex justify-between">
									<span>Senin – Jumat</span>
									<span className="font-medium text-white">
										09.00 – 17.00 WIB
									</span>
								</li>
								<li className="flex justify-between">
									<span>Sabtu</span>
									<span className="font-medium text-white">
										10.00 – 14.00 WIB
									</span>
								</li>
								<li className="flex justify-between">
									<span>Minggu / Libur</span>
									<span className="font-medium text-white/50">Tutup</span>
								</li>
							</ul>
						</div>

						<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
							<h3 className="mb-3 font-semibold text-white">
								Pertanyaan yang Sering Ditanyakan
							</h3>
							<div className="space-y-3 text-sm">
								<details className="group">
									<summary className="cursor-pointer text-white/80 hover:text-[#43decc]">
										Bagaimana cara berkontribusi artikel?
									</summary>
									<p className="mt-2 pl-4 text-white/60">
										Kami menerima kiriman artikel dari komunitas. Kirim draf ke
										email dengan subjek &quot;Submit Artikel&quot;.
									</p>
								</details>
								<details className="group">
									<summary className="cursor-pointer text-white/80 hover:text-[#43decc]">
										Apakah Olahbola menerima iklan berbayar?
									</summary>
									<p className="mt-2 pl-4 text-white/60">
										Ya. Pilih kategori &quot;Kemitraan / Iklan&quot; pada
										formulir di samping untuk informasi penempatan iklan dan
										paket kerja sama.
									</p>
								</details>
								<details className="group">
									<summary className="cursor-pointer text-white/80 hover:text-[#43decc]">
										Bagaimana cara melaporkan konten yang tidak pantas?
									</summary>
									<p className="mt-2 pl-4 text-white/60">
										Gunakan kategori &quot;Pelaporan Konten&quot; dan sertakan
										tautan URL yang dimaksud. Tim moderasi akan meninjau dalam
										24 jam.
									</p>
								</details>
								<details className="group">
									<summary className="cursor-pointer text-white/80 hover:text-[#43decc]">
										Di mana saya bisa melacak skor dan kuis?
									</summary>
									<p className="mt-2 pl-4 text-white/60">
										Kunjungi halaman{" "}
										<Link
											href="/prediksi-skor"
											className="text-[#43decc] hover:underline"
										>
											Prediksi Skor
										</Link>{" "}
										dan{" "}
										<Link
											href="/quiz"
											className="text-[#43decc] hover:underline"
										>
											Quiz
										</Link>{" "}
										untuk berpartisipasi.
									</p>
								</details>
							</div>
						</div>

						<div className="rounded-2xl border border-[#43decc]/20 bg-gradient-to-br from-[#43decc]/[0.04] to-transparent p-6 backdrop-blur-md">
							<h3 className="mb-2 font-semibold text-white">
								Untuk Mitra Bisnis
							</h3>
							<p className="text-sm leading-relaxed text-white/70">
								Olahbola membuka peluang kerja sama dengan brand, klub, dan
								komunitas sepak bola. Kami menyediakan paket iklan (native),
								artikel bersponsor, dan kolaborasi konten sesuai pedoman
								persetujuan FTC dan UU PDP.
							</p>
							<Link
								href="/tentang-kami"
								className="mt-3 inline-block text-sm font-medium text-[#43decc] hover:underline"
							>
								Pelajari Olahbola lebih lanjut →
							</Link>
						</div>
					</aside>
				</div>
			</section>

			{/* CTA Bottom */}
			<section className="container mx-auto max-w-5xl px-4 pb-16">
				<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-8 text-center backdrop-blur-md">
					<h2 className="mb-2 text-2xl font-bold text-white">
						Bergabung dengan Komunitas Olahbola
					</h2>
					<p className="mx-auto mb-6 max-w-xl text-white/60">
						Dapatkan update artikel, kuis, dan prediksi skor langsung ke inbox
						Anda. Gratis, tanpa spam, dan bisa berhenti kapan saja.
					</p>
					<div className="flex flex-wrap justify-center gap-3">
						<Link
							href="/register"
							className="inline-flex items-center gap-2 rounded-xl bg-[#43decc] px-6 py-3 font-semibold text-[#0a1410] transition-all hover:bg-[#3ac9b8]"
						>
							Daftar Akun
						</Link>
						<Link
							href="/artikel"
							className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/5"
						>
							Jelajahi Artikel
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
