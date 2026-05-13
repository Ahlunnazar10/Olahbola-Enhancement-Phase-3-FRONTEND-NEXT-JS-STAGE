"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type {
	ApiResponse,
	User,
	LoginCredentials,
	RegisterCredentials,
} from "@/types";

// Initialize CSRF and get initial user
export function useInitAuth() {
	const { setUser, setLoading, setError } = useAuthStore();

	return useQuery({
		queryKey: ["init-auth"],
		queryFn: async () => {
			// Get CSRF cookie first
			await apiClient.get("/sanctum/csrf-cookie");

			// Then try to get current user
			try {
				const response = await apiClient.get<ApiResponse<User>>(endpoints.user);
				return response.data.data;
			} catch {
				// User not authenticated
				return null;
			}
		},
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		throwOnError: false,
	});
}

// Login mutation
export function useLogin() {
	const { login } = useAuthStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: LoginCredentials) => {
			console.log("[useLogin] Starting login request via Next.js API route...");

			// CRITICAL: Call Next.js API route (/api/auth/login), NOT Laravel directly!
			// The Next.js route handles CSRF token exchange with Laravel
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email_or_phone: credentials.email_or_phone,
					password: credentials.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw Object.assign(new Error(data.message || "Login failed"), {
					response: { data, status: response.status },
				});
			}

			console.log("[useLogin] Response received:", data);
			return {
				user: data.data,
				accessToken: data.access_token,
			};
		},
		onSuccess: (data) => {
			console.log("[useLogin] Login successful");
			login(data.user, data.accessToken);
			// Store access token in localStorage for API client
			if (data.accessToken && typeof window !== "undefined") {
				localStorage.setItem("auth_token", data.accessToken);
			}
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (error: unknown) => {
			const err = error as {
				response?: {
					data?: { message?: string; code?: string };
					status?: number;
				};
				message?: string;
			};
			console.error("[useLogin] Error:", err);

			// Check for email not verified code
			if (err.response?.data?.code === "EMAIL_NOT_VERIFIED") {
				throw new Error("EMAIL_NOT_VERIFIED");
			}
			throw new Error(err.response?.data?.message || "Login failed");
		},
	});
}

// Register mutation
export function useRegister() {
	const { login } = useAuthStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: RegisterCredentials) => {
			console.log("[useRegister] Starting registration via Next.js API route...");

			// Use Next.js API route (/api/auth/register) which handles CSRF automatically
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(credentials),
			});

			const data = await response.json();

			if (!response.ok) {
				throw Object.assign(new Error(data.message || "Registration failed"), {
					response: { data, status: response.status },
				});
			}

			console.log("[useRegister] Response received:", data);

			// Store access token if present
			if (data.access_token && typeof window !== "undefined") {
				localStorage.setItem("auth_token", data.access_token);
			}

			return data.data;
		},
		onSuccess: (user) => {
			console.log("[useRegister] Registration successful");
			login(user);
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (error: unknown) => {
			const err = error as {
				response?: { data?: { message?: string } };
			};
			throw new Error(err.response?.data?.message || "Registration failed");
		},
	});
}

// Logout mutation
export function useLogout() {
	const { logout } = useAuthStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			console.log("[useLogout] Starting logout via Next.js API route...");

			// Get auth token from localStorage
			const authToken = typeof window !== "undefined"
				? localStorage.getItem("auth_token")
				: null;

			// Use Next.js API route (/api/auth/logout) which handles CSRF automatically
			// Send auth token in body for authenticated requests
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token: authToken }),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error("[useLogout] Error:", data);
				// Don't throw - continue with local logout even if API fails
			} else {
				console.log("[useLogout] Logout successful");
			}

			return data;
		},
		onSettled: () => {
			logout();
			queryClient.clear();
			// Clear localStorage
			if (typeof window !== "undefined") {
				localStorage.removeItem("auth-storage");
				localStorage.removeItem("auth_token");
			}
		},
	});
}

// Get current user
export function useUser() {
	const { user, setUser, isAuthenticated } = useAuthStore();

	return useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			const response = await apiClient.get<ApiResponse<User>>(endpoints.user);
			const userData = response.data.data;
			setUser(userData);
			return userData;
		},
		enabled: isAuthenticated,
		retry: false,
		staleTime: 5 * 60 * 1000,
	});
}

// Resend verification email
export function useResendVerification() {
	return useMutation({
		mutationFn: async (email: string) => {
			console.log("[useResendVerification] Sending verification email via Next.js API route...");

			// Use Next.js API route which handles CSRF automatically
			const response = await fetch("/api/auth/resend-verification", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw Object.assign(new Error(data.message || "Failed to resend verification"), {
					response: { data, status: response.status },
				});
			}

			return data;
		},
	});
}

// Login with Google - get redirect URL
export function useGoogleLogin() {
	return useMutation({
		mutationFn: async () => {
			console.log(
				"[useGoogleLogin] Getting Google OAuth URL via Next.js API route...",
			);

			// Use Next.js API route (/api/auth/google/redirect) which handles CSRF automatically
			const response = await fetch("/api/auth/google/redirect", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			const data = await response.json();

			if (!response.ok) {
				throw Object.assign(new Error(data.message || "Failed to get Google OAuth URL"), {
					response: { data, status: response.status },
				});
			}

			return data;
		},
		onSuccess: (data) => {
			if (data?.url && typeof window !== "undefined") {
				console.log("[useGoogleLogin] Redirecting to:", data.url);
				window.location.href = data.url;
			} else {
				console.error("[useGoogleLogin] No URL in response:", data);
			}
		},

		onError: (error: unknown) => {
			const err = error as { response?: { data?: { message?: string } } };
			throw new Error(
				err.response?.data?.message || "Gagal mengarahkan ke Google",
			);
		},
	});
}
