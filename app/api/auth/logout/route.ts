import { NextRequest, NextResponse } from "next/server";
import { fetchCsrfToken, csrfFetch } from "@/lib/auth/csrf-server";

export async function POST(request: NextRequest) {
	try {
		// Get auth token from request body or header
		const body = await request.json().catch(() => ({}));
		const authToken = body.token || request.headers.get("Authorization")?.replace("Bearer ", "");

		// Get CSRF token from Laravel
		const { csrfToken } = await fetchCsrfToken();

		console.log("[API /auth/logout] CSRF Token:", csrfToken ? "found" : "not found");
		console.log("[API /auth/logout] Auth Token:", authToken ? "provided" : "not provided");

		// Make logout request with CSRF token AND auth token
		const response = await csrfFetch<{ status: string; message: string }>(
			"/api/v1/auth/logout",
			{},
			csrfToken,
			authToken,
		);

		console.log("[API /auth/logout] Response status:", response.status);

		return NextResponse.json(response.data, { status: response.status });
	} catch (error) {
		console.error("[API /auth/logout] Error:", error);
		return NextResponse.json(
			{ message: "Logout failed" },
			{ status: 500 }
		);
	}
}