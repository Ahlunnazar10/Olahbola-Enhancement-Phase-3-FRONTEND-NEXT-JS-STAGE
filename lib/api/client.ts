import axios, {
	type AxiosInstance,
	type InternalAxiosRequestConfig,
	type AxiosResponse,
	type AxiosError,
} from "axios";
import { API_BASE_URL, endpoints } from "./endpoints";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // Important for Sanctum SPA cookie auth
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	timeout: 30000,
});

// Request interceptor - add CSRF token
apiClient.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		// Add CSRF token to requests that modify data
		if (
			["post", "put", "patch", "delete"].includes(
				config.method?.toLowerCase() || "",
			)
		) {
			// Get CSRF token from cookie (Laravel stores it there)
			const csrfToken = getCsrfToken();
			if (csrfToken) {
				config.headers["X-CSRF-TOKEN"] = csrfToken;
				config.headers["XRequestedWith"] = "XMLHttpRequest";
			}
		}

		// Add auth token if available
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

		// Handle 401 Unauthorized
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			// Try to refresh CSRF token
			try {
				await refreshCsrfToken();
				// Retry the original request
				return apiClient(originalRequest);
			} catch {
				// If refresh fails, redirect to login
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
			}
		}

		// Handle 419 CSRF token mismatch
		if (error.response?.status === 419) {
			try {
				await refreshCsrfToken();
				return apiClient(originalRequest);
			} catch {
				// If refresh fails, redirect to login
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
			}
		}

		// Handle network errors
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
