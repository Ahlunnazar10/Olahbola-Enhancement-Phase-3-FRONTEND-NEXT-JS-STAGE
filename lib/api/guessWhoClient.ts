import axios, {
	type AxiosInstance,
	type AxiosError,
	type InternalAxiosRequestConfig,
} from "axios";

// Axios instance khusus Guess Who game.
// baseURL kosong agar path relatif `/api/guess-who/...` jadi
// http://localhost:3000/api/guess-who/... → kena proxy Next.js
// (app/api/guess-who/[...path]/route.ts) → forward ke Laravel.
// Tanpa proxy ini, request langsung ke Laravel akan kena blokir CORS
// di browser.
export const apiGuessWhoClient: AxiosInstance = axios.create({
	baseURL: "",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	timeout: 30000,
});

apiGuessWhoClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	console.log("[guessWhoClient] → request:", {
		method: config.method?.toUpperCase(),
		url: config.url,
		hasToken: !!config.headers.Authorization,
		tokenPreview: config.headers.Authorization
			? `${String(config.headers.Authorization).slice(0, 25)}...`
			: null,
		body: config.data,
	});
	return config;
});

apiGuessWhoClient.interceptors.response.use(
	(response) => {
		console.log("[guessWhoClient] ← response:", {
			status: response.status,
			url: response.config.url,
			data: response.data,
		});
		return response;
	},
	(error: AxiosError) => {
		console.error("[guessWhoClient] ✖ error:", {
			status: error.response?.status,
			url: error.config?.url,
			method: error.config?.method,
			data: error.response?.data,
			message: error.message,
		});
		return Promise.reject(error);
	},
);

export default apiGuessWhoClient;