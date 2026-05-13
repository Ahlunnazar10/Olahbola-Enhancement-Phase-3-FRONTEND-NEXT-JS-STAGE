import { NextRequest, NextResponse } from "next/server";
import { fetchCsrfToken, csrfFetch } from "@/lib/auth/csrf-server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const code = body.code;
		const error = body.error;

		// Handle Google OAuth error
		if (error) {
			console.error("[API /auth/google/callback] Google OAuth error:", error);
			return NextResponse.json(
				{ status: "error", message: "OAuth denied" },
				{ status: 400 }
			);
		}

		if (!code) {
			return NextResponse.json(
				{ status: "error", message: "No code provided" },
				{ status: 400 }
			);
		}

		console.log("[API /auth/google/callback] Received code, processing...");

		// Get CSRF token and cookies from Laravel
		const { csrfToken, cookies } = await fetchCsrfToken();

		if (!csrfToken) {
			console.error("[API /auth/google/callback] Failed to obtain CSRF token");
			return NextResponse.json(
				{ status: "error", message: "Failed to obtain CSRF token" },
				{ status: 500 }
			);
		}

		// Make callback request with CSRF token and session cookies
		const response = await csrfFetch<{
			status: string;
			token?: string;
			access_token?: string;
			user?: unknown;
			message?: string;
		}>("/api/v1/auth/google/callback", { code }, csrfToken, undefined, cookies);

		console.log("[API /auth/google/callback] Response:", response);

		// Handle error responses
		if (response.status >= 400) {
			return NextResponse.json(
				{
					status: "error",
					message: response.data?.message || "Google login failed",
				},
				{ status: response.status }
			);
		}

		// Return success with token and user data
		return NextResponse.json({
			status: "success",
			token: response.data?.token || response.data?.access_token,
			access_token: response.data?.token || response.data?.access_token,
			user: response.data?.user,
			message: "Login successful",
		});
	} catch (error) {
		console.error("[API /auth/google/callback] Error:", error);
		return NextResponse.json(
			{ status: "error", message: "Internal server error" },
			{ status: 500 }
		);
	}
}