import { NextRequest, NextResponse } from "next/server";
import { fetchCsrfToken, csrfFetch } from "@/lib/auth/csrf-server";

const FRONTEND_CALLBACK_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
	try {
		// Get CSRF token and cookies from Laravel
		const { csrfToken, cookies } = await fetchCsrfToken();

		console.log("[API /auth/google/redirect] CSRF Token:", csrfToken ? "obtained" : "NOT obtained");

		if (!csrfToken) {
			console.error("[API /auth/google/redirect] Failed to obtain CSRF token");
			return NextResponse.json(
				{ message: "Failed to obtain CSRF token" },
				{ status: 500 }
			);
		}

		// Send redirect URL for development (localhost) vs production
		const isDev = process.env.NODE_ENV === "development" || FRONTEND_CALLBACK_URL.includes("localhost");

		// Make Google redirect request with CSRF token, session cookies, and redirect URL
		const response = await csrfFetch<{ status: string; url?: string; message?: string }>(
			"/api/v1/auth/google/redirect",
			{
				// Send the frontend callback URL so Laravel can redirect to our dev URL
				...(isDev && {
					callback_url: `${FRONTEND_CALLBACK_URL}/api/auth/google/callback`,
				}),
			},
			csrfToken,
			undefined,
			cookies,
		);

		console.log("[API /auth/google/redirect] Response:", response);

		// Handle error responses
		if (response.status >= 400) {
			return NextResponse.json(
				{ message: response.data?.message || "Failed to get Google OAuth URL" },
				{ status: response.status }
			);
		}

		return NextResponse.json(response.data, { status: response.status });
	} catch (error) {
		console.error("[API /auth/google/redirect] Error:", error);
		return NextResponse.json(
			{ message: "Failed to get Google OAuth URL" },
			{ status: 500 }
		);
	}
}