"use client";

import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useMidtransConfig, useCheckAccess } from "@/hooks/queries/usePayment";
import { MidtransPaymentButton } from "@/components/payment/MidtransPaymentButton";
import { Crown, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function PaymentPage() {
	const router = useRouter();
	const { theme } = useUIStore();
	const { isAuthenticated } = useAuthStore();
	const isDark = theme === "dark";
	const { data: config, isLoading: configLoading } = useMidtransConfig();
	const { data: access } = useCheckAccess();
	const redirectHandled = useRef(false);
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => {
		if (redirectHandled.current) return;
		redirectHandled.current = true;

		const hasAuthToken =
			typeof window !== "undefined" &&
			!!window.localStorage.getItem("auth_token");
		const isLoggedIn = isAuthenticated || hasAuthToken;
		if (!isLoggedIn) {
			router.push("/login");
			return;
		}
		requestAnimationFrame(() => setAuthReady(true));
	}, [isAuthenticated, router]);

	if (!authReady) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center ${
					isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"
				}`}
			>
				<Loader2
					className={`w-10 h-10 animate-spin ${
						isDark ? "text-primary-container" : "text-[#0a7c6e]"
					}`}
				/>
			</div>
		);
	}

	if (access?.has_access) {
		return (
			<div
				className={`min-h-screen py-20 px-4 ${
					isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"
				}`}
			>
				<div className="max-w-md mx-auto">
					<div
						className={`rounded-3xl p-8 border ${
							isDark
								? "bg-surface-container/80 backdrop-blur-md border-primary-container/30"
								: "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"
						}`}
					>
						<div className="text-center">
							<CheckCircle2
								className={`w-16 h-16 mx-auto mb-4 ${
									isDark ? "text-primary-container" : "text-[#0a7c6e]"
								}`}
							/>
							<h2
								className={`font-headline-md mb-2 ${
									isDark ? "text-white" : "text-[#1a1a1a]"
								}`}
							>
								Anda Sudah Premium
							</h2>
							<p
								className={`text-sm mb-6 ${
									isDark ? "text-white/60" : "text-[#5a5a5a]"
								}`}
							>
								Terima kasih telah menjadi member Premium Olahbola. Nikmati
								semua fitur eksklusif.
							</p>
							<button
								onClick={() => router.push("/")}
								className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
									isDark
										? "bg-primary-container text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
										: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
								}`}
							>
								Kembali ke Dashboard
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen py-20 px-4 ${
				isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"
			}`}
		>
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-12">
					<div
						className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 ${
							isDark
								? "bg-primary-container/20 text-primary-container"
								: "bg-[#0a7c6e]/20 text-[#0a7c6e]"
						}`}
					>
						<Crown className="w-10 h-10" />
					</div>
					<h1
						className={`font-headline-lg uppercase italic mb-3 ${
							isDark ? "text-white" : "text-[#1a1a1a]"
						}`}
					>
						Olahbola{" "}
						<span
							className={isDark ? "text-primary-container" : "text-[#0a7c6e]"}
						>
							Premium
						</span>
					</h1>
					<p
						className={`text-lg max-w-2xl mx-auto ${
							isDark ? "text-white/60" : "text-[#5a5a5a]"
						}`}
					>
						Buka semua fitur eksklusif Olahbola dengan satu paket Premium.
						Bermain game, prediksi skor, dan kuis tanpa batas.
					</p>
				</div>

				<div className="flex justify-center">
					{configLoading ? (
						<div
							className={`rounded-3xl p-8 border ${
								isDark
									? "bg-surface-container/80 backdrop-blur-md border-white/10"
									: "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"
							}`}
						>
							<Loader2
								className={`w-10 h-10 animate-spin mx-auto ${
									isDark ? "text-primary-container" : "text-[#0a7c6e]"
								}`}
							/>
						</div>
					) : (
						<div className="max-w-md w-full">
							<div
								className={`rounded-3xl p-8 border transition-all duration-300 ${
									isDark
										? "bg-surface-container/80 backdrop-blur-md border-primary-container/30 shadow-[0_0_40px_rgba(0,194,177,0.15)]"
										: "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"
								}`}
							>
								<div className="text-center mb-8">
									<h2
										className={`font-headline-md uppercase italic mb-2 ${
											isDark ? "text-white" : "text-[#1a1a1a]"
										}`}
									>
										Olahbola Premium Membership
									</h2>
									<p
										className={`text-sm ${
											isDark ? "text-white/60" : "text-[#5a5a5a]"
										}`}
									>
										Member Premium untuk pengalaman lengkap
									</p>
								</div>

								<div className="text-center mb-8">
									<div className="flex items-baseline justify-center gap-1">
										<span
											className={`text-lg font-semibold ${
												isDark ? "text-white/60" : "text-[#5a5a5a]"
											}`}
										>
											Rp
										</span>
										<span
											className={`font-display-xl ${
												isDark ? "text-primary-container" : "text-[#0a7c6e]"
											}`}
										>
											{(config?.bundle_price_idr ?? 30000).toLocaleString(
												"id-ID",
											)}
										</span>
									</div>
									<p
										className={`text-sm mt-1 ${
											isDark ? "text-white/50" : "text-[#5a5a5a]"
										}`}
									>
										Sekali bayar, akses selamanya
									</p>
								</div>

								<div className="space-y-3 mb-8">
									{[
										"Full akses semua games & quiz",
										"Prediksi skor tanpa batasan",
										"Leaderboard khusus member",
										"Akses konten premium",
									].map((feature) => (
										<div key={feature} className="flex items-center gap-3">
											<CheckCircle2
												className={`w-5 h-5 shrink-0 ${
													isDark ? "text-primary-container" : "text-[#0a7c6e]"
												}`}
											/>
											<span
												className={`text-sm ${
													isDark ? "text-white/80" : "text-[#1a1a1a]"
												}`}
											>
												{feature}
											</span>
										</div>
									))}
								</div>

								<MidtransPaymentButton
									onSuccess={() => {
										const orderId = localStorage.getItem("pending_order_id");
										if (orderId) {
											router.push(`/payment/status/${orderId}`);
										}
									}}
									className={`w-full ${
										isDark
											? "bg-primary-container text-black shadow-[0_0_25px_rgba(64,220,202,0.4)] hover:shadow-[0_0_35px_rgba(64,220,202,0.6)]"
											: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
									}`}
								>
									Beli Sekarang
								</MidtransPaymentButton>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
