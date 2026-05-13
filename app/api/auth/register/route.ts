import { NextRequest, NextResponse } from "next/server";
import { fetchCsrfToken, csrfFetch } from "@/lib/auth/csrf-server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Get CSRF token from Laravel
		const { csrfToken } = await fetchCsrfToken();

		console.log("[API /auth/register] CSRF Token:", csrfToken ? "found" : "not found");

		// Make register request with CSRF token
		const response = await csrfFetch<{
			status: string;
			data: unknown;
			access_token?: string;
			message?: string;
		}>("/api/v1/auth/register", body, csrfToken);

		console.log("[API /auth/register] Response status:", response.status);

		// Return auth token to client if present
		if (response.data.access_token) {
			return NextResponse.json(response.data, {
				status: response.status,
				headers: {
					"Set-Cookie": `auth_token=${response.data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
				}
			});
		}

		return NextResponse.json(response.data, { status: response.status });
	} catch (error) {
		console.error("[API /auth/register] Error:", error);
		return NextResponse.json(
			{ message: "Registration failed" },
			{ status: 500 }
		);
	}
}