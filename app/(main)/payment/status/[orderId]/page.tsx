"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, XCircle, LogIn, RefreshCw, ArrowLeft } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { usePaymentStatus, useCheckAccess } from "@/hooks/queries/usePayment";
import { PaymentStatusCard } from "@/components/payment/PaymentStatusCard";

interface PaymentStatusPageProps {
	params: Promise<{ orderId: string }>;
}

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
	const { orderId } = use(params);
	const router = useRouter();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { data: status, isLoading, refetch, error } = usePaymentStatus(orderId);
	const { refetch: refetchAccess } = useCheckAccess();

	const isPendingCapture =
		status?.transaction_status === "pending" ||
		status?.transaction_status === "capture";

	// Auto-refetch on settlement to refresh access status
	useEffect(() => {
		if (status?.transaction_status === "settlement") {
			refetchAccess();
		}
	}, [status, refetchAccess]);

	const isUnauthorized =
		(error as { response?: { status?: number } } | null)?.response?.status ===
		401;

	// Handle error (e.g., 401 unauthorized)
	if (error && !status) {
		return (
			<div
				className={`min-h-screen py-20 px-4 ${
					isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"
				}`}
			>
				<div className="max-w-md mx-auto">
					<div className="text-center mb-8">
						<h1
							className={`font-headline-md uppercase italic mb-2 ${
								isDark ? "text-white" : "text-[#1a1a1a]"
							}`}
						>
							Status Pembayaran
						</h1>
						<p
							className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
						>
							Order ID:{" "}
							<span className="font-mono font-semibold">{orderId}</span>
						</p>
					</div>

					<div
						className={`rounded-3xl p-8 border text-center ${
							isDark
								? "bg-surface-container/80 backdrop-blur-md border-red-500/30"
								: "bg-white/90 backdrop-blur-md shadow-xl border border-red-200"
						}`}
					>
						<div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto bg-red-100 dark:bg-red-900/30">
							<XCircle className="w-8 h-8 text-red-500" />
						</div>
						<h3
							className={`font-headline-md mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
						>
							{isUnauthorized ? "Sesi Berakhir" : "Gagal Memuat Status"}
						</h3>
						<p
							className={`text-sm mb-6 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
						>
							{isUnauthorized
								? "Silakan login ulang untuk melihat status pembayaran Anda."
								: "Terjadi kesalahan saat memuat status pembayaran. Silakan coba lagi."}
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							{isUnauthorized ? (
								<Link
									href="/login"
									className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg transition-all hover:scale-[1.02] inline-flex items-center justify-center gap-2"
								>
									<LogIn className="w-4 h-4" />
									Login Sekarang
								</Link>
							) : (
								<button
									onClick={() => refetch()}
									className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg transition-all hover:scale-[1.02] inline-flex items-center justify-center gap-2"
								>
									<RefreshCw className="w-4 h-4" />
									Coba Lagi
								</button>
							)}
							<Link
								href="/payment"
								className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all hover:scale-[1.02] inline-flex items-center justify-center gap-2 ${
									isDark
										? "border-white/10 text-white/60 hover:bg-white/5"
										: "border-gray-200 text-[#5a5a5a] hover:bg-gray-50"
								}`}
							>
								<ArrowLeft className="w-4 h-4" />
								Kembali
							</Link>
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
			<div className="max-w-md mx-auto">
				<div className="text-center mb-8">
					<h1
						className={`font-headline-md uppercase italic mb-2 ${
							isDark ? "text-white" : "text-[#1a1a1a]"
						}`}
					>
						Status Pembayaran
					</h1>
					<p
						className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
					>
						Order ID: <span className="font-mono font-semibold">{orderId}</span>
					</p>
				</div>

				<PaymentStatusCard
					statusData={status ?? null}
					isLoading={isLoading || (isPendingCapture && !status)}
					isDark={isDark}
					onRetry={() => refetch()}
					onBack={() => router.push("/payment")}
				/>

				{isPendingCapture && !status && (
					<div className="text-center mt-6">
						<Loader2
							className={`w-4 h-4 animate-spin inline-block mr-2 ${
								isDark ? "text-primary-container" : "text-[#0a7c6e]"
							}`}
						/>
						<span
							className={`text-xs ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}
						>
							Memeriksa status otomatis setiap 2 detik...
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
