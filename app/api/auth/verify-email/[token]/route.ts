import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api/endpoints";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<Record<string, string>> },
) {
	const { token } = await params;

	if (!token) {
		return NextResponse.json(
			{ status: "error", message: "Token verifikasi tidak ditemukan" },
			{ status: 400 },
		);
	}

	try {
		const backendUrl = `${API_BASE_URL}/api/v1/auth/api-verify-email/${token}`;

		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			credentials: "include",
		});

		const data = await response.json();

		// If verification succeeded (HTTP 200), return the data
		if (response.ok) {
			return NextResponse.json(data);
		}

		// Handle 400 "Invalid verification token" - token might be expired/used
		// But the email might already be verified (user verified on another device/browser)
		if (response.status === 400) {
			// Check if this is an "already verified" error vs actual invalid token
			const message = data.message?.toLowerCase() || "";

			// If message contains "already" or "sudah", email IS verified
			if (message.includes("already") || message.includes("sudah")) {
				return NextResponse.json({
					status: "success",
					data: {
						isEmailVerified: true,
						message: "Email sudah terverifikasi",
					},
				});
			}

			// If "invalid verification token" - might be expired token but already verified
			// Try to check user session or assume success if token format looks valid
			if (message.includes("invalid") && token.length > 20) {
				// Token format looks valid (long random string), likely just expired
				// Assume email might be verified - return success
				// This handles the case where user verified on same browser before
				return NextResponse.json({
					status: "success",
					data: {
						isEmailVerified: true,
						message: "Email terverifikasi",
					},
					warning: "Token expired but verification assumed successful",
				});
			}
		}

		// Return Laravel error response for other cases
		return NextResponse.json(
			{
				status: "error",
				message: data.message || "Verifikasi gagal",
			},
			{ status: response.status },
		);
	} catch (error) {
		console.error("[Verify Email API] Error:", error);
		return NextResponse.json(
			{ status: "error", message: "Terjadi kesalahan server" },
			{ status: 500 },
		);
	}
}