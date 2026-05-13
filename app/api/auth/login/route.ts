import { NextRequest, NextResponse } from "next/server";
import { fetchCsrfToken, csrfFetch } from "@/lib/auth/csrf-server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		console.log("[API /auth/login] Request body:", body);

		// Get CSRF token and cookies from Laravel
		const { csrfToken, cookies } = await fetchCsrfToken();

		console.log("[API /auth/login] CSRF Token:", csrfToken ? "obtained" : "NOT obtained");
		console.log("[API /auth/login] Cookies:", cookies.substring(0, 100));

		if (!csrfToken) {
			console.error("[API /auth/login] Failed to obtain CSRF token");
			return NextResponse.json(
				{ message: "Failed to obtain CSRF token" },
				{ status: 500 }
			);
		}

		// Make login request with CSRF token and session cookies
		const response = await csrfFetch<{
			status: string;
			data: unknown;
			access_token?: string;
			message?: string;
			code?: string;
		}>("/api/v1/auth/login", body, csrfToken, undefined, cookies);

		console.log("[API /auth/login] Response status:", response.status);
		console.log("[API /auth/login] Response data:", response.data);

		// Handle error responses from Laravel
		if (response.status >= 400) {
			return NextResponse.json(
				{
					message: response.data?.message || "Login failed",
					code: response.data?.code,
				},
				{ status: response.status }
			);
		}

		// Return auth token to client
		if (response.data?.access_token) {
			return NextResponse.json(response.data, { status: 200 });
		}

		return NextResponse.json(response.data, { status: response.status });
	} catch (error) {
		console.error("[API /auth/login] Error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}