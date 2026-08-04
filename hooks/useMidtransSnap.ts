import { useCallback, useState } from "react";
import { toast } from "sonner";
import { loadMidtransSnap } from "@/lib/midtrans";
import { paymentApi } from "@/lib/api/payment";

export interface MidtransCallbacks {
	onSuccess?: (result: { finish_redirect_url?: string }) => void;
	onPending?: (result: { finish_redirect_url?: string }) => void;
	onError?: (result: { finish_redirect_url?: string }) => void;
	onClose?: () => void;
}

export function useMidtransSnap() {
	const [loading, setLoading] = useState(false);

	const pay = useCallback(
		async (bundleType = "world_cup_full", callbacks?: MidtransCallbacks) => {
			setLoading(true);
			try {
				await paymentApi.getMidtransConfig();
				const snapTokenData = await paymentApi.createSnapToken(bundleType);
				const { snap_token, snap_js_url, order_id } = snapTokenData;

				// Store order_id in localStorage for redirect after payment
				if (typeof window !== "undefined") {
					localStorage.setItem("pending_order_id", order_id);
				}

				if (!window.snap) {
					await loadMidtransSnap(snap_js_url);
					if (!window.snap) {
						throw new Error("Snap.js failed to initialize");
					}
				}

				// Define finish URL (override Midtrans dashboard setting)
				const finishUrl = `${window.location.origin}/payment/finish`;

				window.snap.pay(snap_token, {
					onSuccess: (result) => {
						setLoading(false);
						// Redirect to our finish page with order_id in query
						window.location.href = `${finishUrl}?order_id=${order_id}`;
					},
					onPending: (result) => {
						setLoading(false);
						// Pending payment - redirect to finish page
						window.location.href = `${finishUrl}?order_id=${order_id}`;
					},
					onError: (result) => {
						setLoading(false);
						callbacks?.onError?.(result);
						toast.error("Pembayaran gagal. Silakan coba lagi.");
					},
					onClose: () => {
						setLoading(false);
						callbacks?.onClose?.();
					},
				});
			} catch (err: unknown) {
				setLoading(false);
				const message =
					err instanceof Error ? err.message : "Terjadi kesalahan";
				toast.error(message);
			}
		},
		[],
	);

	return { pay, loading };
}
