import { NextRequest, NextResponse } from "next/server";
import { fetchCsrfToken, csrfFetch } from "@/lib/auth/csrf-server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Get CSRF token from Laravel
		const { csrfToken } = await fetchCsrfToken();

		console.log("[API /auth/resend-verification] CSRF Token:", csrfToken ? "found" : "not found");

		// Make resend verification request with CSRF token
		const response = await csrfFetch<{
			status: string;
			message: string;
		}>("/api/v1/auth/resend-verification-email", body, csrfToken);

		console.log("[API /auth/resend-verification] Response status:", response.status);

		return NextResponse.json(response.data, { status: response.status });
	} catch (error) {
		console.error("[API /auth/resend-verification] Error:", error);
		return NextResponse.json(
			{ message: "Failed to resend verification email" },
			{ status: 500 }
		);
	}
}