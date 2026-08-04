import Link from "next/link";
import {
	CheckCircle,
	Clock,
	XCircle,
	Loader2,
	CreditCard,
	Calendar,
} from "lucide-react";
import type { MidtransTransactionStatus, PaymentStatusData } from "@/types";

interface PaymentStatusCardProps {
	statusData: PaymentStatusData | null;
	isLoading: boolean;
	onRetry?: () => void;
	onBack?: () => void;
	isDark: boolean;
}

const statusConfig: Record<
	MidtransTransactionStatus,
	{
		icon: typeof CheckCircle | typeof Clock | typeof XCircle | typeof Loader2;
		title: string;
		description: string;
		color: string;
		bgColor: string;
		borderColor: string;
	}
> = {
	settlement: {
		icon: CheckCircle,
		title: "Pembayaran Berhasil!",
		description:
			"Terima kasih! Akses Premium Olahbola Anda telah diaktifkan.",
		color: "#166534",
		bgColor: "#F0FDF4",
		borderColor: "#BBF7D0",
	},
	pending: {
		icon: Clock,
		title: "Menunggu Konfirmasi",
		description:
			"Silakan selesaikan pembayaran di aplikasi bank atau e-wallet Anda.",
		color: "#92400E",
		bgColor: "#FFFBEB",
		borderColor: "#FDE68A",
	},
	capture: {
		icon: Loader2,
		title: "Sedang Diproses",
		description: "Mohon tunggu, pembayaran sedang diverifikasi...",
		color: "#4F46E5",
		bgColor: "#EEF2FF",
		borderColor: "#C7D2FE",
	},
	deny: {
		icon: XCircle,
		title: "Pembayaran Ditolak",
		description: "Pembayaran Anda ditolak oleh pihak bank. Silakan coba lagi.",
		color: "#991B1B",
		bgColor: "#FEF2F2",
		borderColor: "#FECACA",
	},
	cancel: {
		icon: XCircle,
		title: "Pembayaran Dibatalkan",
		description:
			"Pembayaran telah dibatalkan. Silakan coba lagi jika ingin berlangganan.",
		color: "#991B1B",
		bgColor: "#FEF2F2",
		borderColor: "#FECACA",
	},
	expire: {
		icon: XCircle,
		title: "Kadaluarsa",
		description:
			"Timeout pembayaran. Silakan ulangi proses pembelian.",
		color: "#991B1B",
		bgColor: "#FEF2F2",
		borderColor: "#FECACA",
	},
};

function getLightModeColors(
	config: (typeof statusConfig)[keyof typeof statusConfig],
): {
	bg: string;
	text: string;
	border: string;
} {
	return {
		bg: config.bgColor,
		text: config.color,
		border: config.borderColor,
	};
}

function getDarkModeColors(
	config: (typeof statusConfig)[keyof typeof statusConfig],
): {
	bg: string;
	text: string;
	border: string;
} {
	return {
		bg: config.bgColor + "15",
		text: config.color,
		border: config.borderColor + "40",
	};
}

export function PaymentStatusCard({
	statusData,
	isLoading,
	onRetry,
	onBack,
	isDark,
}: PaymentStatusCardProps) {
	if (!statusData && isLoading) {
		return (
			<div
				className={`rounded-3xl p-8 border ${
					isDark
						? "bg-[#1c211e]/80 backdrop-blur-md border-white/10"
						: "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"
				}`}
			>
				<div className="flex flex-col items-center text-center py-8">
					<Loader2
						className={`w-12 h-12 animate-spin mb-4 ${
							isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]"
						}`}
					/>
					<h3
						className={`font-headline-md mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
					>
						Sedang Memverifikasi
					</h3>
					<p className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
						Memeriksa status pembayaran Anda...
					</p>
				</div>
			</div>
		);
	}

	if (!statusData) return null;

	const config = statusConfig[statusData.transaction_status];
	if (!config) return null;

	const Icon = config.icon;
	const colors = isDark
		? getDarkModeColors(config)
		: getLightModeColors(config);

	return (
		<div
			className="rounded-3xl p-8 border"
			style={{
				background: colors.bg,
				borderColor: colors.border,
			}}
		>
			<div className="flex flex-col items-center text-center">
				<div
					className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
					style={{
						background: colors.border + "30",
						border: `2px solid ${colors.border}`,
					}}
				>
					<Icon
						className="w-8 h-8"
						style={{ color: colors.text }}
					/>
				</div>

				<h3
					className="font-headline-md mb-2"
					style={{ color: colors.text }}
				>
					{config.title}
				</h3>
				<p
					className="text-sm mb-6 max-w-sm"
					style={{ color: colors.text + "CC" }}
				>
					{config.description}
				</p>

				{/* Invoice Details - show for all transaction states */}
				<div
					className={`w-full rounded-2xl p-4 mb-6 text-left space-y-3 ${
						isDark ? "bg-black/20" : "bg-white/60"
					}`}
				>
					{/* Order ID */}
					<div className="flex justify-between items-center">
						<span className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
							Order ID
						</span>
						<span
							className={`text-sm font-mono font-semibold ${
								isDark ? "text-white" : "text-[#1a1a1a]"
							}`}
						>
							{statusData.order_id}
						</span>
					</div>

					{/* Amount */}
					<div className="flex justify-between items-center">
						<span className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
							Jumlah Pembayaran
						</span>
						<span
							className={`text-sm font-semibold ${
								isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]"
							}`}
						>
							Rp {parseInt(statusData.gross_amount).toLocaleString("id-ID")}
						</span>
					</div>

					{/* Payment Method */}
					<div className="flex justify-between items-center">
						<span className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
							Metode Pembayaran
						</span>
						<div
							className={`flex items-center gap-2 text-sm font-medium ${
								isDark ? "text-white" : "text-[#1a1a1a]"
							}`}
						>
							<CreditCard className="w-4 h-4" />
							{statusData.payment_type.replace("_", " ")}
						</div>
					</div>

					{/* Settlement/Payment Time */}
					<div className="flex justify-between items-center">
						<span className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
							{statusData.settlement_time
								? "Waktu Pembayaran"
								: "Waktu Transaksi"}
						</span>
						<div
							className={`flex items-center gap-2 text-sm ${
								isDark ? "text-white" : "text-[#1a1a1a]"
							}`}
						>
							<Calendar className="w-4 h-4" />
							{statusData.local?.paid_at
								? new Date(statusData.local.paid_at).toLocaleString("id-ID", {
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
								: statusData.settlement_time
								? new Date(statusData.settlement_time).toLocaleString("id-ID", {
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
								: "-"}
						</div>
					</div>

					{/* Transaction ID */}
					{statusData.transaction_id && (
						<div className="flex justify-between items-center">
							<span className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
								Transaction ID
							</span>
							<span
								className={`text-xs font-mono ${isDark ? "text-white/50" : "text-[#5a5a5a]"}`}
							>
								{statusData.transaction_id}
							</span>
						</div>
					)}
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
					{statusData.transaction_status === "settlement" && (
						<>
							<Link
								href="/"
								className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
									isDark
										? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
										: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
								}`}
							>
								Kembali ke Dashboard
							</Link>
							<Link
								href="/payment"
								className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all hover:scale-[1.02] ${
									isDark
										? "border-[#00c2b1]/30 text-[#00c2b1] hover:bg-[#00c2b1]/10"
										: "border-[#0a7c6e]/30 text-[#0a7c6e] hover:bg-[#0a7c6e]/10"
								}`}
							>
								Lihat Akses Premium
							</Link>
						</>
					)}
					{["pending", "capture"].includes(
						statusData.transaction_status,
					) && (
						<button
							onClick={onRetry}
							className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
								isDark
									? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
									: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
							}`}
						>
							Periksa Lagi
						</button>
					)}
					{["deny", "cancel", "expire"].includes(
						statusData.transaction_status,
					) && (
						<>
							<button
								onClick={onRetry}
								className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
									isDark
										? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
										: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
								}`}
							>
								Coba Lagi
							</button>
							<button
								onClick={onBack}
								className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all hover:scale-[1.02] ${
									isDark
										? "border-white/10 text-white/60 hover:bg-white/5"
										: "border-gray-200 text-[#5a5a5a] hover:bg-gray-50"
								}`}
							>
								Kembali
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
