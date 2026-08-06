import { apiClient } from "./client";
import { API_BASE_URL, endpoints } from "./endpoints";
import type {
	AccessCheckData,
	MidtransConfig,
	PaymentStatusData,
	SnapTokenResponse,
} from "@/types";

function getAuthToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("auth_token");
}

export const paymentApi = {
	async getMidtransConfig(): Promise<MidtransConfig> {
		const response = await fetch(`${API_BASE_URL}${endpoints.paymentMidtransConfig}`, {
			method: "GET",
			headers: { Accept: "application/json" },
			cache: "no-cache",
		});
		if (!response.ok) {
			throw new Error(`Failed to load Midtrans config (${response.status})`);
		}
		const json = await response.json();
		return json.data as MidtransConfig;
	},

	async createSnapToken(bundleType = "world_cup_full"): Promise<SnapTokenResponse> {
		const token = getAuthToken();
		const response = await apiClient.post<{
			success: boolean;
			snap_token: string;
			order_id: string;
			transaction_id: string | null;
			redirect_url: string;
			amount_idr: number;
			currency: string;
			client_key: string;
			snap_js_url: string;
		}>(endpoints.paymentMidtransSnapToken, { bundle_type: bundleType });
		const data = response.data;
		if (!token) {
			throw new Error("Silakan login untuk melanjutkan pembayaran");
		}
		if (!data?.snap_token) {
			throw new Error("Gagal membuat transaksi pembayaran");
		}
		return {
			snap_token: data.snap_token,
			order_id: data.order_id,
			transaction_id: data.transaction_id,
			redirect_url: data.redirect_url,
			amount_idr: data.amount_idr,
			currency: data.currency,
			client_key: data.client_key,
			snap_js_url: data.snap_js_url,
		};
	},

	async getPaymentStatus(orderId: string): Promise<PaymentStatusData> {
		// Use fetch instead of apiClient to avoid axios interceptor redirect on 401
		const token = getAuthToken();
		const response = await fetch(
			`${API_BASE_URL}${endpoints.paymentMidtransStatus(orderId)}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${token || ""}`,
				},
				cache: "no-cache",
			},
		);

		if (response.status === 401) {
			throw Object.assign(new Error("Unauthorized — silakan login ulang"), {
				response: { status: 401 },
			});
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch payment status (${response.status})`);
		}

		const json = await response.json();
		// Handle both nested (Laravel) and flat (direct Midtrans) response formats
		const data = json?.data ?? json;
		if (!data) {
			throw new Error("Gagal memuat status pembayaran");
		}
		return data as PaymentStatusData;
	},

	async checkAccess(): Promise<AccessCheckData> {
		// Use fetch instead of apiClient to avoid axios interceptor redirect on 401
		const token = getAuthToken();
		const response = await fetch(
			`${API_BASE_URL}${endpoints.paymentAccessCheck}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${token || ""}`,
				},
				cache: "no-cache",
			},
		);

		if (response.status === 401) {
			throw Object.assign(new Error("Unauthorized — silakan login ulang"), {
				response: { status: 401 },
			});
		}

		if (!response.ok) {
			throw new Error(`Failed to check access (${response.status})`);
		}

		const json = await response.json();
		if (!json?.data) {
			return {
				has_access: false,
				bundle_type: null,
				purchased_at: null,
				event_slug: "world-cup-2026",
				price_idr: 30000,
				pending_payment: {
					invoice_id: null,
					invoice_url: null,
					expires_at: null,
				},
			};
		}
		return json.data as AccessCheckData;
	},
};
