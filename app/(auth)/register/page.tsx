"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Eye,
	EyeOff,
	Loader2,
	Rocket,
	Settings,
	User,
	Mail,
	Phone,
	MapPin,
	Lock,
	Timer,
	Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRegister } from "@/hooks/queries/useAuth";
import { cn } from "@/lib/utils";
import { indonesianCities } from "@/data/indonesianCities";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";

export default function RegisterPage() {
	const router = useRouter();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const registerMutation = useRegister();

	const [registerVia, setRegisterVia] = useState<"email" | "phone">("email");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [city, setCity] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [filteredCities, setFilteredCities] = useState<string[]>([]);
	const [showCityDropdown, setShowCityDropdown] = useState(false);

	// Phone formatting
	const formatPhoneNumber = (value: string): string => {
		let cleaned = value.replace(/\D/g, "");
		if (cleaned.startsWith("0")) {
			cleaned = "62" + cleaned.substring(1);
		}
		return cleaned.substring(0, 14);
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value);
		setPhone(formatted);
	};

	// City autocomplete
	useEffect(() => {
		if (city.length >= 2) {
			const filtered = indonesianCities
				.filter((c) => c.toLowerCase().includes(city.toLowerCase()))
				.slice(0, 10);
			setFilteredCities(filtered);
			setShowCityDropdown(true);
		} else {
			setFilteredCities([]);
			setShowCityDropdown(false);
		}
	}, [city]);

	const selectCity = (selectedCity: string) => {
		setCity(selectedCity);
		setShowCityDropdown(false);
	};

	// Validations
	const isPasswordValid = password.length >= 6;
	const isPasswordMatch = password === confirmPassword && password.length > 0;
	const isPhoneValid = () => {
		if (registerVia === "email") return true;
		if (!phone) return true;
		return /^(08|628)\d{8,}$/.test(phone) && phone.length <= 14;
	};

	const isFormValid = () => {
		const baseValid =
			name.trim() !== "" &&
			password.length >= 6 &&
			password === confirmPassword &&
			agreeToTerms &&
			city.trim().length >= 3;

		if (registerVia === "email") {
			return baseValid && email.trim() !== "";
		} else {
			return baseValid && phone.trim() !== "" && isPhoneValid();
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (password.length < 6) {
			toast.error("Password minimal 6 karakter");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Konfirmasi password tidak sesuai");
			return;
		}

		const payload = {
			name,
			password,
			password_confirmation: confirmPassword,
			register_via: registerVia,
			city,
			...(registerVia === "email" ? { email } : { phone }),
		};

		try {
			await registerMutation.mutateAsync(payload);

			if (registerVia === "email") {
				toast.success(
					"Registrasi berhasil! Silakan cek email untuk verifikasi.",
				);
				router.push("/login");
			} else {
				toast.success("Registrasi berhasil! Akun Anda sudah aktif.");
				router.push("/profile");
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Registrasi gagal";
			toast.error(message);
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
				<div className="w-full max-w-6xl grid md:grid-cols-2 items-center gap-16 p-4 mb-10">
					{/* Left Side: Visual Narrative */}
					<div className="hidden md:flex flex-col gap-8">
						<div className="space-y-2">
							<h1
								className={`font-display-xl text-display-xl leading-none italic uppercase ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								JOIN
								<br />
								<span
									className={`${isDark ? "text-primary glitch-text" : "text-[#0a7c6e]"}`}
								>
									THE GAME
								</span>
							</h1>
						</div>
						<p
							className={`font-body-lg max-w-md leading-relaxed ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
						>
							Buat akun Olahbola dan mulai tantang dirimu dengan kuis seru,
							kumpulkan poin, dan rajanya bola di Indonesia!
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

					{/* Right Side: Register Card */}
					<div className="relative">
						{/* Card glow/background elements */}
						<div
							className={`absolute -inset-1 ${isDark ? "bg-linear-to-r from-primary/50 to-[#ff8f63]/30 blur opacity-25" : "bg-linear-to-r from-[#0a7c6e]/30 to-[#b3461a]/20 blur opacity-20"} rounded-[2.5rem]`}
						/>
						<div
							className={`p-10 md:p-14 rounded-[2.5rem] w-full max-w-md mx-auto relative overflow-hidden ${isDark ? "glass-card" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
						>
							{/* Subtle glass pattern overlay */}
							<div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

							<div className="text-center mb-8 relative z-10">
								<h2
									className={`font-headline-lg text-headline-lg italic mb-2 tracking-widest ${isDark ? "text-primary glitch-text" : "text-[#0a7c6e]"}`}
								>
									Daftar Sekarang!
								</h2>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5 relative z-10">
								{/* Register Via Toggle */}
								<div
									className={`flex gap-2 mb-2 p-1 rounded-xl ${isDark ? "glass-card" : "bg-white shadow-sm border border-gray-200"}`}
								>
									<button
										type="button"
										onClick={() => setRegisterVia("email")}
										className={cn(
											"flex-1 py-2 rounded-lg font-label-bold text-[10px] uppercase tracking-widest transition-all",
											registerVia === "email"
												? isDark
													? "bg-primary text-black neon-glow-btn"
													: "bg-[#0a7c6e] text-white"
												: isDark
													? "text-[#bbcac6] hover:text-white"
													: "text-[#5a5a5a] hover:text-[#1a1a1a]",
										)}
									>
										Via Email
									</button>
									<button
										type="button"
										onClick={() => setRegisterVia("phone")}
										className={cn(
											"flex-1 py-2 rounded-lg font-label-bold text-[10px] uppercase tracking-widest transition-all",
											registerVia === "phone"
												? isDark
													? "bg-primary text-black neon-glow-btn"
													: "bg-[#0a7c6e] text-white"
												: isDark
													? "text-[#bbcac6] hover:text-white"
													: "text-[#5a5a5a] hover:text-[#1a1a1a]",
										)}
									>
										Via Telepon
									</button>
								</div>

								{/* Name Input */}
								<div className="space-y-2 group">
									<label
										className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
									>
										Nama Lengkap
									</label>
									<div className="relative">
										<User
											className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
										/>
										<input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Nama kamu"
											className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-[#3c4a47] focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-4 py-4`}
										/>
									</div>
								</div>

								{/* Email Input */}
								{registerVia === "email" && (
									<div className="space-y-2 group">
										<label
											className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
										>
											Alamat Email
										</label>
										<div className="relative">
											<Mail
												className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
											/>
											<input
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="nama@email.com"
												className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-[#3c4a47] focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-4 py-4`}
											/>
										</div>
									</div>
								)}

								{/* Phone Input */}
								{registerVia === "phone" && (
									<div className="space-y-2 group">
										<label
											className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
										>
											Nomor Telepon
										</label>
										<div className="relative">
											<Phone
												className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
											/>
											<input
												type="tel"
												value={phone}
												onChange={handlePhoneChange}
												placeholder="08xxxxxxxxxx"
												maxLength={14}
												className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-[#3c4a47] focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-4 py-4`}
											/>
										</div>
										{phone && !isPhoneValid() && (
											<p className="text-xs text-red-400 ml-1">
												Nomor tidak valid. Gunakan format Indonesia.
											</p>
										)}
									</div>
								)}

								{/* City Autocomplete */}
								<div className="space-y-2 group">
									<label
										className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
									>
										Kota
									</label>
									<div className="relative">
										<MapPin
											className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
										/>
										<input
											type="text"
											value={city}
											onChange={(e) => setCity(e.target.value)}
											onFocus={() =>
												city.length >= 2 && setShowCityDropdown(true)
											}
											onBlur={() => {
												// Delay to allow click on suggestion
												setTimeout(() => setShowCityDropdown(false), 200);
											}}
											placeholder="Ketik nama kota..."
											className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-[#3c4a47] focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-4 py-4`}
										/>
									</div>
									{showCityDropdown && filteredCities.length > 0 && (
										<div
											className={`absolute z-50 w-full max-w-[calc(100%-2rem)] mt-1 rounded-xl overflow-y-auto max-h-52 ${isDark ? "glass-card" : "bg-white shadow-lg border border-gray-200"}`}
											onMouseDown={(e) => e.preventDefault()}
										>
											{filteredCities.map((c, i) => (
												<button
													key={i}
													type="button"
													onClick={() => selectCity(c)}
													className={`w-full text-left px-4 py-3 text-sm transition-colors border-b last:border-b-0 ${isDark ? "text-[#bbcac6] hover:bg-white/10 hover:text-white border-white/5" : "text-[#5a5a5a] hover:bg-gray-50 hover:text-[#1a1a1a] border-gray-100"}`}
												>
													{c}
												</button>
											))}
										</div>
									)}
								</div>

								{/* Password Input */}
								<div className="space-y-2 group">
									<label
										className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
									>
										Kata Sandi
									</label>
									<div className="relative">
										<Lock
											className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
										/>
										<input
											type={showPassword ? "text" : "password"}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											placeholder="••••••••"
											className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-[#3c4a47] focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-12 py-4`}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isDark ? "text-[#bbcac6] hover:text-primary" : "text-[#5a5a5a] hover:text-[#0a7c6e]"}`}
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
									{password && (
										<p
											className={cn(
												"text-[10px] ml-1",
												isPasswordValid ? "text-green-400" : "text-yellow-400",
											)}
										>
											{isPasswordValid
												? "Password memenuhi syarat"
												: `Minimal 6 karakter (${password.length}/6)`}
										</p>
									)}
								</div>

								{/* Confirm Password Input */}
								<div className="space-y-2 group">
									<label
										className={`font-label-bold text-[10px] tracking-widest uppercase ml-1 group-focus-within:text-primary transition-colors ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
									>
										Konfirmasi Password
									</label>
									<div className="relative">
										<Timer
											className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors group-focus-within:text-primary ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
										/>
										<input
											type={showConfirmPassword ? "text" : "password"}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											placeholder="••••••••"
											className={`w-full border-b-2 border-x-0 border-t-0 focus:ring-0 rounded-t-xl transition-all ${isDark ? "bg-black/40 border-[#3c4a47] focus:border-primary text-white placeholder:text-white/20" : "bg-gray-100 border-gray-300 focus:border-[#0a7c6e] text-[#1a1a1a] placeholder:text-gray-400"} pl-12 pr-12 py-4`}
										/>
										<button
											type="button"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isDark ? "text-[#bbcac6] hover:text-primary" : "text-[#5a5a5a] hover:text-[#0a7c6e]"}`}
										>
											{showConfirmPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
									{password && confirmPassword && (
										<p
											className={cn(
												"text-[10px] ml-1",
												isPasswordMatch ? "text-green-400" : "text-red-400",
											)}
										>
											{isPasswordMatch
												? "Password cocok"
												: "Password tidak cocok!"}
										</p>
									)}
								</div>

								{/* Terms Checkbox */}
								<label className="flex items-start gap-3 cursor-pointer group mt-2">
									<span
										className={cn(
											"w-5 h-5 mt-0.5 rounded flex items-center justify-center transition-all border shrink-0 cursor-pointer",
											agreeToTerms
												? "bg-primary border-primary"
												: isDark
													? "bg-transparent border-[#3c4a47] group-hover:border-[#bbcac6]"
													: "bg-transparent border-gray-300 group-hover:border-gray-500",
										)}
										onClick={() => setAgreeToTerms(!agreeToTerms)}
									>
										{agreeToTerms && (
											<Check className="text-black size-3.5" strokeWidth={3} />
										)}
									</span>
									<span
										className={`text-[10px] leading-relaxed text-start select-none ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
										onClick={() => setAgreeToTerms(!agreeToTerms)}
									>
										Dengan membuat akun, saya menyetujui{" "}
										<span
											className={isDark ? "text-primary" : "text-[#0a7c6e]"}
										>
											Kebijakan Privasi
										</span>{" "}
										dan{" "}
										<span
											className={isDark ? "text-primary" : "text-[#0a7c6e]"}
										>
											Syarat & Ketentuan
										</span>
									</span>
								</label>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={!isFormValid() || registerMutation.isPending}
									className={cn(
										`w-full py-4 rounded-xl font-label-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] mt-2 shadow-lg`,
										isDark
											? "bg-primary text-black neon-glow-btn shadow-primary/20"
											: "bg-[#0a7c6e] text-white shadow-[#0a7c6e]/30 hover:bg-[#095a50]",
										(!isFormValid() || registerMutation.isPending) &&
											"opacity-70 cursor-not-allowed",
									)}
								>
									{registerMutation.isPending ? (
										<span className="flex items-center justify-center gap-2">
											<Loader2 className="w-5 h-5 animate-spin" />
											MEMPROSES...
										</span>
									) : (
										"DAFTAR"
									)}
								</button>
							</form>

							{/* Login Link */}
							<p
								className={`text-center mt-8 text-[11px] tracking-wider uppercase ${isDark ? "text-[#bbcac6]" : "text-[#5a5a5a]"}`}
							>
								SUDAH PUNYA AKUN?{" "}
								<Link
									href="/login"
									className={`font-bold hover:underline ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
								>
									MASUK SEKARANG
								</Link>
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
