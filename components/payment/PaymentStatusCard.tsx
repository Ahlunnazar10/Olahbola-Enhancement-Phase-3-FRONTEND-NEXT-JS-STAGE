import Link from "next/link";
import {
	CheckCircle,
	Clock,
	XCircle,
	Loader2,
	CreditCard,
	Calendar,
	Hash,
	Receipt,
	Tag,
	FileText,
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
		description: "Terima kasih! Akses Premium Olahbola Anda telah diaktifkan.",
		color: "#16a34a",
		bgColor: "#f0fdf4",
		borderColor: "#4ade80",
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
		description: "Timeout pembayaran. Silakan ulangi proses pembelian.",
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

function formatDateTime(value: string | null | undefined): string {
	if (!value) return "-";
	try {
		const date = new Date(value);
		if (isNaN(date.getTime())) return value;
		return date.toLocaleString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return value;
	}
}

function formatCurrency(amount: string | number, currency = "IDR"): string {
	const num = typeof amount === "string" ? parseFloat(amount) : amount;
	if (isNaN(num)) return amount.toString();
	if (currency === "IDR") {
		return `Rp ${num.toLocaleString("id-ID")}`;
	}
	return `${num.toLocaleString("id-ID")} ${currency}`;
}

function PaymentDetailRow({
	icon: Icon,
	label,
	value,
	mono = false,
	isDark,
	valueClass,
}: {
	icon: typeof Hash;
	label: string;
	value: string | null | undefined;
	mono?: boolean;
	isDark: boolean;
	valueClass?: string;
}) {
	if (!value || value === "-") return null;
	return (
		<div className="flex justify-between items-start gap-3 py-2">
			<div
				className={`flex items-center gap-2 text-sm shrink-0 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
			>
				<Icon className="w-4 h-4" />
				<span>{label}</span>
			</div>
			<span
				className={`text-sm text-right break-all ${mono ? "font-mono" : "font-medium"} ${valueClass ?? (isDark ? "text-white" : "text-[#1a1a1a]")}`}
			>
				{value}
			</span>
		</div>
	);
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
						? "bg-surface-container/80 backdrop-blur-md border-white/10"
						: "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"
				}`}
			>
				<div className="flex flex-col items-center text-center py-8">
					<Loader2
						className={`w-12 h-12 animate-spin mb-4 ${
							isDark ? "text-primary-container" : "text-[#0a7c6e]"
						}`}
					/>
					<h3
						className={`font-headline-md mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
					>
						Sedang Memverifikasi
					</h3>
					<p
						className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
					>
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
			className="rounded-3xl p-6 sm:p-8 border w-full"
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
					<Icon className="w-8 h-8" style={{ color: colors.text }} />
				</div>

				<h3 className="font-headline-md mb-2" style={{ color: colors.text }}>
					{config.title}
				</h3>
				<p
					className="text-sm mb-6 max-w-sm"
					style={{ color: colors.text + "CC" }}
				>
					{config.description}
				</p>

				{/* Invoice Details - semua field */}
				<div
					className={`w-full rounded-2xl p-5 mb-6 text-left ${
						isDark ? "bg-black/30" : "bg-white/70"
					}`}
				>
					<div className="flex items-center gap-2 mb-3 pb-3 border-b border-current/10">
						<Receipt className="w-4 h-4" style={{ color: colors.text }} />
						<span
							className="text-xs font-bold uppercase tracking-wider"
							style={{ color: colors.text }}
						>
							Detail Transaksi
						</span>
					</div>

					<div className="space-y-0.5">
						<PaymentDetailRow
							icon={Hash}
							label="Order ID"
							value={statusData.order_id}
							mono
							isDark={isDark}
							valueClass={isDark ? "text-white" : "text-[#1a1a1a]"}
						/>
						<PaymentDetailRow
							icon={Hash}
							label="Transaction ID"
							value={statusData.transaction_id}
							mono
							isDark={isDark}
							valueClass={isDark ? "text-white/80" : "text-[#5a5a5a]"}
						/>
						<PaymentDetailRow
							icon={CreditCard}
							label="Jumlah"
							value={formatCurrency(
								statusData.gross_amount,
								statusData.currency,
							)}
							isDark={isDark}
							valueClass={`font-bold ${isDark ? "text-[#00c2b1]" : "text-[#16a34a]"}`}
						/>
						<PaymentDetailRow
							icon={Tag}
							label="Metode Pembayaran"
							value={
								statusData.payment_type?.replace(/_/g, " ").toUpperCase() ??
								null
							}
							isDark={isDark}
						/>
						<PaymentDetailRow
							icon={Calendar}
							label="Waktu Pembayaran"
							value={formatDateTime(
								statusData.local?.paid_at ?? statusData.settlement_time,
							)}
							isDark={isDark}
						/>
						<PaymentDetailRow
							icon={Calendar}
							label="Waktu Transaksi"
							value={formatDateTime(statusData.transaction_time)}
							isDark={isDark}
						/>
						<PaymentDetailRow
							icon={Calendar}
							label="Batas Waktu"
							value={formatDateTime(statusData.expiry_time)}
							isDark={isDark}
						/>
						{statusData.status_message && (
							<PaymentDetailRow
								icon={FileText}
								label="Status Message"
								value={statusData.status_message}
								isDark={isDark}
							/>
						)}
						{statusData.custom_field_1 && (
							<PaymentDetailRow
								icon={Tag}
								label="Bundle Type"
								value={statusData.custom_field_1}
								mono
								isDark={isDark}
							/>
						)}
						{statusData.custom_field_3 && (
							<PaymentDetailRow
								icon={Tag}
								label="Event"
								value={statusData.custom_field_3}
								mono
								isDark={isDark}
							/>
						)}
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
					{statusData.transaction_status === "settlement" && (
						<>
							<Link
								href="/"
								className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] text-center ${
									isDark
										? "bg-primary-container text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
										: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
								}`}
							>
								Kembali ke Dashboard
							</Link>
							<Link
								href="/payment"
								className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all hover:scale-[1.02] text-center ${
									isDark
										? "border-primary-container/30 text-primary-container hover:bg-primary-container/10"
										: "border-[#0a7c6e]/30 text-[#0a7c6e] hover:bg-[#0a7c6e]/10"
								}`}
							>
								Lihat Akses Premium
							</Link>
						</>
					)}
					{["pending", "capture"].includes(statusData.transaction_status) && (
						<button
							onClick={onRetry}
							className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
								isDark
									? "bg-primary-container text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
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
										? "bg-primary-container text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
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
