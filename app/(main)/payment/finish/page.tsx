"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

function PaymentFinishContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const [view, setView] = useState<"loading" | "error">("loading");

	useEffect(() => {
		const orderId =
			searchParams.get("order_id") ||
			searchParams.get("orderId") ||
			(typeof window !== "undefined"
				? localStorage.getItem("pending_order_id")
				: null);

		if (!orderId) {
			requestAnimationFrame(() => {
				setView("error");
			});
			return;
		}

		if (typeof window !== "undefined") {
			localStorage.setItem("pending_order_id", orderId);
		}

		const timer = setTimeout(() => {
			router.replace(`/payment/status/${orderId}`);
		}, 2000);

		return () => clearTimeout(timer);
	}, [router, searchParams]);

	return (
		<div
			className={`min-h-screen flex items-center justify-center px-4 ${
				isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"
			}`}
		>
			<div
				className={`rounded-3xl p-8 border max-w-md w-full text-center ${
					isDark
						? "bg-[#1c211e]/80 backdrop-blur-md border-white/10"
						: "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"
				}`}
			>
				{view === "error" ? (
					<>
						<p
							className={`mb-4 ${isDark ? "text-red-400" : "text-red-500"}`}
						>
							Order ID tidak ditemukan. Silakan coba lagi dari halaman
							pembayaran.
						</p>
						<button
							onClick={() => router.push("/payment")}
							className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
								isDark
									? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]"
									: "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"
							}`}
						>
							Kembali ke Halaman Pembayaran
						</button>
					</>
				) : (
					<>
						<Loader2
							className={`w-12 h-12 animate-spin mx-auto mb-4 ${
								isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]"
							}`}
						/>
						<h2
							className={`font-headline-md mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
						>
							Memproses Pembayaran
						</h2>
						<p
							className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
						>
							Mohon tunggu, sedang mengarahkan ke halaman status...
						</p>
					</>
				)}
			</div>
		</div>
	);
}

export default function PaymentFinishPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-[#0f1412]">
					<Loader2 className="w-10 h-10 animate-spin text-[#00c2b1]" />
				</div>
			}
		>
			<PaymentFinishContent />
		</Suspense>
	);
}