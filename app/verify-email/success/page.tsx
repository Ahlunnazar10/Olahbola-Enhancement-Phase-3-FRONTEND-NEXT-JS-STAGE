"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useResendVerification } from "@/hooks/queries/useAuth";
import { useUIStore } from "@/stores/uiStore";

type StatusType = "idle" | "loading" | "success" | "error";

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const resendMutation = useResendVerification();
	const { theme } = useUIStore();
	const isDark = theme === "dark";

	const [status, setStatus] = useState<StatusType>("idle");
	const [email, setEmail] = useState("");
	const [countdown, setCountdown] = useState(0);
	const [stopRedirect, setStopRedirect] = useState(false);

	// Get token and status from URL
	const token = searchParams.get("token");
	const directStatus = searchParams.get("status");
	const directMessage = searchParams.get("message");

	// Primary check: if URL has status=success, show success immediately
	// This handles the case where user is redirected from backend with success status
	useEffect(() => {
		if (directStatus === "success") {
			setStatus("success");
			setCountdown(10);
			toast.success("Email berhasil diverifikasi!");
			return;
		}

		// If we have a token, try to verify it
		if (token) {
			verifyToken(token);
		} else {
			// No token and no success status - show error
			setStatus("error");
		}
	}, []);

	// Countdown timer
	useEffect(() => {
		if (countdown <= 0 || stopRedirect) return;

		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [countdown, stopRedirect]);

	// Auto redirect when countdown reaches 0
	useEffect(() => {
		if (countdown <= 0 && !stopRedirect && status === "success") {
			router.push("/login");
		}
	}, [countdown, stopRedirect, status, router]);

	const verifyToken = async (verifyToken: string) => {
		setStatus("loading");

		try {
			// Call the Next.js API route which proxies to Laravel
			const response = await fetch(`/api/auth/verify-email/${verifyToken}`);
			const data = await response.json();

			console.log("[Verify] HTTP Status:", response.status);
			console.log("[Verify] Response data:", JSON.stringify(data, null, 2));

			// Parse response to find isEmailVerified anywhere in the response
			const isEmailVerifiedInResponse =
				data.isEmailVerified === true ||
				data.data?.isEmailVerified === true ||
				data.user?.isEmailVerified === true ||
				data.data?.user?.isEmailVerified === true;

			console.log("[Verify] isEmailVerified found:", isEmailVerifiedInResponse);

			// Success conditions:
			// 1. HTTP 200-299 with status: "success"
			// 2. HTTP 200-299 with isEmailVerified: true anywhere in response
			// 3. HTTP 400+ but email is already verified (isEmailVerified is true)
			const isSuccess =
				(response.status >= 200 &&
					response.status < 300 &&
					(data.status === "success" || isEmailVerifiedInResponse)) ||
				isEmailVerifiedInResponse;

			if (isSuccess) {
				setStatus("success");
				setCountdown(10);
				toast.success("Email berhasil diverifikasi! Silakan login.");
			} else {
				// Check if email is already verified (might get 400 with this info)
				const alreadyVerified =
					data.message?.toLowerCase().includes("already") ||
					data.message?.toLowerCase().includes("sudah") ||
					data.data?.already_verified === true ||
					data.already_verified === true;

				if (alreadyVerified) {
					setStatus("success");
					setCountdown(10);
					toast.success("Email sudah terverifikasi sebelumnya!");
				} else {
					setStatus("error");
					toast.error(data.message || "Verifikasi gagal");
				}
			}
		} catch (error) {
			console.error("[Verify] Network error:", error);
			setStatus("error");
			toast.error("Terjadi kesalahan saat memverifikasi email");
		}
	};

	const handleResend = async () => {
		if (!email.trim()) {
			toast.error("Masukkan alamat email Anda");
			return;
		}

		try {
			await resendMutation.mutateAsync(email);
			toast.success(
				"Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.",
			);
		} catch {
			toast.error("Gagal mengirim ulang email verifikasi");
		}
	};

	return (
		<div
			className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#111111]" : "bg-[#f5f5f5]"}`}
		>
			{/* Background Grid Pattern */}
			<div
				className={`fixed inset-0 pointer-events-none ${isDark ? "bg-grid-pattern" : "bg-grid-pattern-light"}`}
			/>

			{/* Blobs */}
			<div
				className={`blob top-[-10%] left-[-10%] animate-pulse ${isDark ? "" : "opacity-40"}`}
			/>
			<div
				className={`blob bottom-[-20%] right-[-10%] animate-pulse ${isDark ? "" : "opacity-40"}`}
				style={{ animationDelay: "2s" }}
			/>

			{/* Main Content */}
			<main className="min-h-screen flex items-center justify-center px-4 relative z-10">
				<div className="relative">
					{/* Card glow */}
					<div
						className={`absolute -inset-1 rounded-[2.5rem] blur opacity-25 ${
							isDark
								? status === "success"
									? "bg-linear-to-r from-green-500/50 to-primary/30"
									: status === "error"
										? "bg-linear-to-r from-red-500/50 to-orange-500/30"
										: "bg-linear-to-r from-primary/50 to-[#ff8f63]/30"
								: status === "success"
									? "bg-linear-to-r from-green-500/30 to-[#0a7c6e]/20"
									: status === "error"
										? "bg-linear-to-r from-red-500/30 to-orange-500/20"
										: "bg-linear-to-r from-[#0a7c6e]/30 to-[#b3461a]/20"
						}`}
					/>
					<div
						className={`p-10 md:p-14 rounded-[2.5rem] w-full max-w-md mx-auto relative overflow-hidden text-center ${isDark ? "glass-card" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
					>
						{/* Subtle glass pattern overlay */}
						<div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

						<div className="relative z-10">
							{/* Logo */}
							<img
								src="/images/logo/olahbola-logo.png"
								alt="OlahBola Logo"
								className="w-48 mx-auto mb-6"
							/>

							<h2
								className={`font-headline-lg text-headline-lg italic mb-6 tracking-widest ${isDark ? "text-primary glitch-text" : "text-[#0a7c6e]"}`}
							>
								Verifikasi Email
							</h2>

							{/* Loading State */}
							{status === "idle" || status === "loading" ? (
								<div className="flex flex-col items-center py-6">
									<Loader2
										className={`size-12 animate-spin mb-4 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									/>
									<p className={isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}>
										Memverifikasi email Anda...
									</p>
									{token && (
										<p
											className={`text-xs mt-2 ${isDark ? "text-[#bbcac6]/50" : "text-[#5a5a5a]/50"}`}
										>
											Token: {token.substring(0, 20)}...
										</p>
									)}
								</div>
							) : null}

							{/* Success State */}
							{status === "success" && (
								<div>
									<div
										className={`mb-6 flex justify-center ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									>
										<div
											className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? "bg-primary/20" : "bg-[#0a7c6e]/20"}`}
										>
											<CheckCircle
												className={`size-12 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
											/>
										</div>
									</div>
									<p
										className={`text-lg font-semibold mb-2 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									>
										Verifikasi Berhasil!
									</p>
									<p
										className={`mb-6 ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
									>
										Email Anda telah berhasil diverifikasi.
									</p>

									{countdown > 0 && (
										<div className="mb-6">
											<p
												className={`text-sm mb-3 ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
											>
												Mengarahkan ke halaman login dalam:
											</p>
											<div className="flex justify-center items-center gap-2">
												<div
													className={`rounded-lg px-3 py-1 text-2xl font-bold min-w-12 ${isDark ? "bg-primary/20 border border-primary/40 text-primary" : "bg-[#0a7c6e]/20 border border-[#0a7c6e]/40 text-[#0a7c6e]"}`}
												>
													{countdown.toString().padStart(2, "0")}
												</div>
												<span
													className={
														isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"
													}
												>
													detik
												</span>
											</div>
										</div>
									)}

									<div className="space-y-3">
										<Link
											href="/login"
											className={`block w-full py-4 rounded-xl font-label-bold uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? "bg-primary text-black neon-glow-btn" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}
										>
											Login Sekarang
										</Link>
										<button
											onClick={() => setStopRedirect(true)}
											className={`w-full py-3 text-sm transition-colors ${isDark ? "text-[#bbcac6] hover:text-white" : "text-[#5a5a5a] hover:text-[#1a1a1a]"}`}
										>
											Batalkan Auto Redirect
										</button>
									</div>
								</div>
							)}

							{/* Error State */}
							{status === "error" && (
								<div>
									<div className="text-red-400 mb-6 flex justify-center">
										<div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
											<XCircle className="size-12 text-red-400" />
										</div>
									</div>
									<p className="text-lg font-semibold text-red-400 mb-2">
										Verifikasi Gagal
									</p>
									<p
										className={`mb-6 ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
									>
										Token tidak valid atau sudah kadaluarsa.
									</p>

									{/* Email Input for Resend */}
									<div className="mb-4 space-y-2">
										<div className="relative">
											<Mail
												className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
											/>
											<input
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="Masukkan email untuk kirim ulang"
												className={`w-full border-b-2 border-x-0 border-t-0 focus:border-primary rounded-t-xl transition-all text-sm ${isDark ? "bg-black/40 border-outline-variant text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-4 py-3`}
											/>
										</div>
									</div>

									<div className="space-y-3">
										<button
											onClick={handleResend}
											disabled={resendMutation.isPending}
											className={`w-full py-4 rounded-xl font-label-bold uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "bg-primary text-black neon-glow-btn" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}
										>
											{resendMutation.isPending ? (
												<span className="flex items-center justify-center gap-2">
													<Loader2 className="size-5 animate-spin" />
													Mengirim...
												</span>
											) : (
												"Kirim Ulang Email Verifikasi"
											)}
										</button>
										<Link
											href="/login"
											className="block w-full py-4 rounded-xl font-label-bold uppercase tracking-[0.2em] border border-white/20 text-white transition-all hover:bg-white/5"
										>
											Kembali ke Login
										</Link>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

export default function VerifyEmailSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-[#111111]">
					<Loader2 className="size-12 animate-spin text-primary" />
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
