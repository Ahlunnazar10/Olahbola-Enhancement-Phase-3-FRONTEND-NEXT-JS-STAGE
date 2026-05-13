import axios, {
	type AxiosInstance,
	type InternalAxiosRequestConfig,
	type AxiosResponse,
	type AxiosError,
} from "axios";
import { API_BASE_URL, endpoints } from "./endpoints";

// ============================================
// Pure Fetch-based auth API
// Sends CSRF token from cookie if available
// ============================================
function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
	return match ? match[2] : null;
}

export const authApi = {
	async post<T = unknown>(
		url: string,
		data?: Record<string, unknown>,
	): Promise<T> {
		console.log("[authApi.post] URL:", `${API_BASE_URL}${url}`);

		// Get CSRF token from cookie
		const csrfToken = getCookie("XSRF-TOKEN");
		console.log("[authApi.post] CSRF Token:", csrfToken ? "found" : "not found");

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			Accept: "application/json",
			"Origin": API_BASE_URL,
		};

		// Add CSRF token if available
		if (csrfToken) {
			headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
		}

		const response = await fetch(`${API_BASE_URL}${url}`, {
			method: "POST",
			headers,
			body: data ? JSON.stringify(data) : undefined,
			credentials: "include",
			mode: "cors",
			redirect: "follow",
			cache: "no-cache",
		});

		console.log("[authApi.post] Response status:", response.status);

		const responseData = await response.json();

		if (!response.ok) {
			console.error("[authApi.post] Error:", responseData);
			const error = new Error(
				responseData.message || `HTTP ${response.status}: Request failed`,
			) as Error & { response?: { data?: Record<string, unknown>; status?: number } };
			error.response = { data: responseData, status: response.status };
			throw error;
		}

		return responseData as T;
	},

	async get<T = unknown>(url: string): Promise<T> {
		console.log("[authApi.get] URL:", `${API_BASE_URL}${url}`);

		const response = await fetch(`${API_BASE_URL}${url}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"Origin": API_BASE_URL,
			},
			credentials: "include",
			mode: "cors",
			cache: "no-cache",
		});

		console.log("[authApi.get] Response status:", response.status);

		const responseData = await response.json();

		if (!response.ok) {
			console.error("[authApi.get] Error:", responseData);
			const error = new Error(
				responseData.message || `HTTP ${response.status}: Request failed`,
			) as Error & { response?: { data?: Record<string, unknown>; status?: number } };
			error.response = { data: responseData, status: response.status };
			throw error;
		}

		return responseData as T;
	},
};

// ============================================
// Main API client for Sanctum-protected APIs
// Used for routes that require auth:sanctum (CSRF protected)
// ============================================
const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	timeout: 30000,
});

// Request interceptor - add CSRF token
apiClient.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		if (
			["post", "put", "patch", "delete"].includes(
				config.method?.toLowerCase() || "",
			)
		) {
			const csrfToken = getCsrfToken();
			if (csrfToken) {
				config.headers["X-CSRF-TOKEN"] = csrfToken;
				config.headers["XRequestedWith"] = "XMLHttpRequest";
			}
		}

		const token = getAuthToken();
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}

		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				await refreshCsrfToken();
				return apiClient(originalRequest);
			} catch {
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
			}
		}

		if (error.response?.status === 419) {
			try {
				await refreshCsrfToken();
				return apiClient(originalRequest);
			} catch {
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
			}
		}

		if (!error.response) {
			console.error("Network error:", error.message);
		}

		return Promise.reject(error);
	},
);

// Helper functions
function getCsrfToken(): string | null {
	if (typeof document === "undefined") return null;

	const name = "csrftoken";
	const cookies = document.cookie.split(";");
	for (const cookie of cookies) {
		const [key, value] = cookie.trim().split("=");
		if (key === name) {
			return decodeURIComponent(value);
		}
	}
	return null;
}

function getAuthToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("auth_token");
}

export async function refreshCsrfToken(): Promise<void> {
	await apiClient.get(endpoints.csrf);
}

export { apiClient };
export default apiClient;