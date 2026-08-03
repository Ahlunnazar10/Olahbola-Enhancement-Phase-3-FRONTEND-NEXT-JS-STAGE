"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import {
	usePaymentStatus,
	useCheckAccess,
} from "@/hooks/queries/usePayment";
import { PaymentStatusCard } from "@/components/payment/PaymentStatusCard";

interface PaymentStatusPageProps {
	params: Promise<{ orderId: string }>;
}

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
	const { orderId } = use(params);
	const router = useRouter();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { data: status, isLoading, refetch } = usePaymentStatus(orderId);
	const { refetch: refetchAccess } = useCheckAccess();

	const isPendingCapture =
		status?.transaction_status === "pending" ||
		status?.transaction_status === "capture";

	useEffect(() => {
		if (status?.transaction_status === "settlement") {
			refetchAccess();
		}
	}, [status, refetchAccess]);

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

				<PaymentStatusCard
					statusData={status ?? null}
					isLoading={isLoading || (isPendingCapture && !status)}
					isDark={isDark}
					onRetry={() => refetch()}
					onBack={() => router.push("/payment")}
				/>

				{isPendingCapture && (
					<div className="text-center mt-6">
						<Loader2
							className={`w-4 h-4 animate-spin inline-block mr-2 ${
								isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]"
							}`}
						/>
						<span
							className={`text-xs ${isDark ? "text-white/40" : "text-[#5a5a5a]"}`}
						>
							Memeriksa status otomatis setiap 2 detik
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
