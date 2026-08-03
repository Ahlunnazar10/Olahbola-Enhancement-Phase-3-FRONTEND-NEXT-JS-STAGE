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
				const { snap_token, snap_js_url } = snapTokenData;

				if (!window.snap) {
					await loadMidtransSnap(snap_js_url);
					// After loading, window.snap should be available
					if (!window.snap) {
						throw new Error("Snap.js failed to initialize");
					}
				}

				window.snap.pay(snap_token, {
					onSuccess: (result) => {
						setLoading(false);
						callbacks?.onSuccess?.(result);
					},
					onPending: (result) => {
						setLoading(false);
						callbacks?.onPending?.(result);
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
