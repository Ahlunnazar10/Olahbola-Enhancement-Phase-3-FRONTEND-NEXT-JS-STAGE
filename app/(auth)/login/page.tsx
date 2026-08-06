"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Eye,
	EyeOff,
	Loader2,
	Rocket,
	Settings,
	Mail,
	Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	useLogin,
	useGoogleLogin,
	useResendVerification,
} from "@/hooks/queries/useAuth";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import { getLastPathname } from "@/lib/last-path";

// Helper function to determine if input is email or phone
const getIdentifierType = (identifier: string): "email" | "phone" | null => {
	if (!identifier) return null;

	// If contains @, it's an email
	if (identifier.includes("@")) {
		return "email";
	}

	// If only digits (after removing non-digits), it's a phone
	if (/^\d+$/.test(identifier.replace(/\D/g, ""))) {
		return "phone";
	}

	// Default to email
	return "email";
};

// Format phone number if needed
const formatPhoneIfNeeded = (identifier: string): string => {
	const type = getIdentifierType(identifier);

	if (type === "phone") {
		// Remove all non-digit characters
		let cleaned = identifier.replace(/\D/g, "");

		// If starts with 0, convert to 62
		if (cleaned.startsWith("0")) {
			cleaned = "62" + cleaned.substring(1);
		}

		// If doesn't start with 62, add 62
		if (!cleaned.startsWith("62") && !cleaned.startsWith("8")) {
			cleaned = "62" + cleaned;
		}

		// Limit to 14 digits
		return cleaned.substring(0, 14);
	}

	return identifier;
};

export default function LoginPage() {
	const router = useRouter();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const loginMutation = useLogin();
	const googleLoginMutation = useGoogleLogin();
	const resendVerificationMutation = useResendVerification();

	const [emailOrPhone, setEmailOrPhone] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [showResendVerification, setShowResendVerification] = useState(false);
	const [isResending, setIsResending] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!emailOrPhone.trim()) {
			toast.error("Email atau nomor telepon tidak boleh kosong");
			return;
		}

		if (!password.trim()) {
			toast.error("Password tidak boleh kosong");
			return;
		}

		try {
			// Format phone number if needed
			const formattedIdentifier = formatPhoneIfNeeded(emailOrPhone);

			await loginMutation.mutateAsync({
				email_or_phone: formattedIdentifier,
				password: password,
				register_via: "email",
			} as { email_or_phone: string; password: string; register_via: "email" });

			toast.success("Login berhasil! Selamat datang di Olahbola.");
			const lastPath = getLastPathname();
			router.push(lastPath || "/");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Login gagal. Silakan coba lagi.";

			// Check for email not verified
			if (message === "EMAIL_NOT_VERIFIED") {
				setShowResendVerification(true);
				toast.error("Email belum diverifikasi. Silakan cek email Anda.");
			} else {
				toast.error(message);
			}
		}
	};

	const handleGoogleLogin = async () => {
		try {
			await googleLoginMutation.mutateAsync();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Gagal mengarahkan ke Google";
			toast.error(message);
		}
	};

	const handleResendVerification = async () => {
		const identifierType = getIdentifierType(emailOrPhone);

		if (identifierType !== "email") {
			toast.error("Fitur ini hanya untuk pengguna yang mendaftar dengan email");
			return;
		}

		setIsResending(true);
		try {
			await resendVerificationMutation.mutateAsync(emailOrPhone);
			toast.success(
				"Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.",
			);
			setShowResendVerification(false);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Gagal mengirim ulang email verifikasi";
			toast.error(message);
		} finally {
			setIsResending(false);
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
			<div
				className={`blob top-[30%] left-[40%] ${isDark ? "opacity-50" : "opacity-30"}`}
				style={{
					background: isDark
						? "radial-gradient(circle, rgba(255, 143, 99, 0.15) 0%, rgba(0, 0, 0, 0) 70%)"
						: "radial-gradient(circle, rgba(216, 83, 26, 0.12) 0%, rgba(0, 0, 0, 0) 70%)",
				}}
			/>

			{/* Main Content */}
			<main className="min-h-screen flex items-center justify-center px-4 md:px-0 relative z-10">
				{/* Theme Toggle */}
				<ThemeToggle />
				{/* Login Container */}
				<div className="w-full max-w-6xl grid md:grid-cols-2 items-center gap-16 p-4 mb-10">
					{/* Left Side: Visual Narrative */}
					<div className="hidden md:flex flex-col gap-8">
						<div className="space-y-2">
							<h1
								className={`font-display-xl text-display-xl leading-none italic uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								STAY
								<br />
								<span
									className={`${isDark ? "text-primary glitch-text" : "text-[#0a7c6e]"}`}
								>
									UNSTOPPABLE
								</span>
							</h1>
						</div>
						<p
							className={`font-body-lg max-w-md leading-relaxed ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
						>
							Terhubung dengan Olahbola, temukan konten terbaik, banyak event
							menarik dan disini tempatnya si penggila bola!
						</p>
						<div className="flex gap-6 items-center">
							<div
								className={`px-6 py-4 rounded-2xl flex items-center gap-4 border-l-4 ${isDark ? "glass-card border-l-primary" : "bg-white shadow-md border-l-[#0a7c6e]"}`}
							>
								<div className="relative">
									<div
										className={`w-3 h-3 rounded-full ${isDark ? "bg-primary animate-ping" : "bg-[#0a7c6e]"} absolute inset-0`}
									/>
									<div
										className={`w-3 h-3 rounded-full ${isDark ? "bg-primary" : "bg-[#0a7c6e]"} relative`}
									/>
								</div>
								<span
									className={`font-label-bold uppercase tracking-[0.2em] text-sm ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
								>
									12.4K Pengguna Aktif
								</span>
							</div>
						</div>
					</div>

					{/* Right Side: Login Card */}
					<div className="relative">
						{/* Additional card glow/background elements */}
						<div
							className={`absolute -inset-1 ${isDark ? "bg-linear-to-r from-primary/50 to-[#ff8f63]/30 blur opacity-25" : "bg-linear-to-r from-[#0a7c6e]/30 to-[#b3461a]/20 blur opacity-20"} rounded-[2.5rem]`}
						/>
						<div
							className={`p-6 md:p-14 rounded-[2.5rem] w-full max-w-md mx-auto relative overflow-hidden ${isDark ? "glass-card" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
						>
							{/* Subtle glass pattern overlay */}
							<div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

							<div className="text-center mb-8 relative z-10">
								<h2
									className={`font-headline-lg text-headline-lg italic mb-2 tracking-widest ${isDark ? "text-primary glitch-text" : "text-[#0a7c6e]"}`}
								>
									Login Now!
								</h2>
							</div>

							<form onSubmit={handleSubmit} className="space-y-6 relative z-10">
								{/* Email Verification Notice */}
								{showResendVerification && (
									<div
										className={`p-4 rounded-xl mb-4 ${isDark ? "bg-yellow-500/20 border border-yellow-500" : "bg-yellow-50 border border-yellow-200"}`}
									>
										<p
											className={`text-sm mb-3 ${isDark ? "text-yellow-300" : "text-yellow-700"}`}
										>
											Email Anda belum diverifikasi.
										</p>
										<div className="flex flex-col gap-2">
											<button
												type="submit"
												disabled={loginMutation.isPending}
												onClick={handleSubmit}
												className={`w-full py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isDark ? "bg-[#0d645f] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}
											>
												{loginMutation.isPending ? (
													<span className="flex items-center justify-center gap-2">
														<Loader2 className="w-4 h-4 animate-spin" />
														Memproses...
													</span>
												) : (
													"Tetap Masuk"
												)}
											</button>
											<button
												type="button"
												onClick={handleResendVerification}
												disabled={isResending}
												className={`w-full py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isDark ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-yellow-400 text-yellow-900 hover:bg-yellow-300"}`}
											>
												{isResending ? (
													<span className="flex items-center justify-center gap-2">
														<Loader2 className="w-4 h-4 animate-spin" />
														Mengirim...
													</span>
												) : (
													"Kirim Ulang Email Verifikasi"
												)}
											</button>
										</div>
									</div>
								)}

								{/* Email/Phone Input */}
								<div className="space-y-2 group">
									<label
										className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
									>
										Email atau Nomor Telepon
									</label>
									<div className="relative">
										<Mail
											className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
										/>
										<input
											type="text"
											value={emailOrPhone}
											onChange={(e) => setEmailOrPhone(e.target.value)}
											placeholder="nama@olahbola.com"
											className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-outline-variant focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-4 py-4`}
										/>
									</div>
								</div>

								{/* Password Input */}
								<div className="space-y-2 group">
									<label
										className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
									>
										Kata Sandi
									</label>
									<div className="relative">
										<Lock
											className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
										/>
										<input
											type={showPassword ? "text" : "password"}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											placeholder="••••••••"
											className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-outline-variant focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-12 py-4`}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isDark ? "text-on-surface-variant hover:text-primary" : "text-[#5a5a5a] hover:text-[#0a7c6e]"}`}
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								{/* Submit Button */}
								{!showResendVerification && (
									<button
										type="submit"
										disabled={loginMutation.isPending}
										className={cn(
											`w-full py-4 rounded-xl font-label-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] mt-4 shadow-lg`,
											isDark
												? "bg-primary text-black neon-glow-btn shadow-primary/20"
												: "bg-[#0a7c6e] text-white shadow-[#0a7c6e]/30 hover:bg-[#095a50]",
											loginMutation.isPending &&
												"opacity-70 cursor-not-allowed",
										)}
									>
										{loginMutation.isPending ? (
											<span className="flex items-center justify-center gap-2">
												<Loader2 className="w-5 h-5 animate-spin" />
												MEMPROSES...
											</span>
										) : (
											"MASUK"
										)}
									</button>
								)}

								{/* Divider */}
								{!showResendVerification && (
									<div className="relative flex items-center justify-center my-5">
										<div className="absolute inset-0 flex items-center">
											<div
												className={`w-full border-t ${isDark ? "border-white/10" : "border-gray-200"}`}
											/>
										</div>
										<span
											className={`relative px-4 text-[10px] font-label-bold tracking-[0.2em] ${isDark ? "bg-[#1a1a1a] text-on-surface-variant" : "bg-white/90 text-[#5a5a5a]"}`}
										>
											ATAU MASUK DENGAN
										</span>
									</div>
								)}

								{/* Google Login */}
								{!showResendVerification && (
									<button
										type="button"
										onClick={handleGoogleLogin}
										disabled={googleLoginMutation.isPending}
										className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-label-bold uppercase text-[10px] tracking-widest transition-all border active:scale-[0.98] disabled:opacity-50 ${isDark ? "glass-card hover:bg-white/10 border-white/10" : "bg-white hover:bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
									>
										{googleLoginMutation.isPending ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											<svg className="w-5 h-5" viewBox="0 0 24 24">
												<path
													fill="currentColor"
													d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
												/>
												<path
													fill="currentColor"
													d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
												/>
												<path
													fill="currentColor"
													d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
												/>
												<path
													fill="currentColor"
													d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
												/>
											</svg>
										)}
										AKUN GOOGLE
									</button>
								)}
							</form>

							{/* Register Link */}
							{!showResendVerification && (
								<p
									className={`text-center mt-10 text-[11px] tracking-wider uppercase ${isDark ? "text-on-surface-variant" : "text-[#5a5a5a]"}`}
								>
									BELUM PUNYA AKUN?{" "}
									<Link
										href="/register"
										className={`font-bold hover:underline ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
									>
										DAFTAR SEKARANG
									</Link>
								</p>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
