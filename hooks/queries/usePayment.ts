import { useQuery, useMutation } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/payment";

export function useMidtransConfig() {
	return useQuery({
		queryKey: ["midtrans-config"],
		queryFn: () => paymentApi.getMidtransConfig(),
		staleTime: 10 * 60 * 1000,
		retry: false,
	});
}

export function useCreateSnapToken() {
	return useMutation({
		mutationFn: (bundleType: string = "world_cup_full") =>
			paymentApi.createSnapToken(bundleType),
		onSuccess: (data) => {
			if (typeof window !== "undefined") {
				localStorage.setItem("pending_order_id", data.order_id);
				localStorage.setItem("pending_amount_idr", String(data.amount_idr));
			}
		},
	});
}

export function usePaymentStatus(orderId: string) {
	return useQuery({
		queryKey: ["payment-status", orderId],
		queryFn: () => paymentApi.getPaymentStatus(orderId),
		enabled: !!orderId,
		refetchInterval: (query) => {
			const status = query.state.data?.transaction_status;
			// Stop polling for final states: settlement, deny, cancel, expire
			if (status === "settlement" || status === "deny" || status === "cancel" || status === "expire") {
				return false;
			}
			// Continue polling for pending/capture states
			return 2000;
		},
		retry: 3,
		staleTime: 10000,
	});
}

export function useCheckAccess() {
	return useQuery({
		queryKey: ["payment-access"],
		queryFn: () => paymentApi.checkAccess(),
		staleTime: 60 * 1000,
		retry: false,
	});
}
