/**
 * Server-side CSRF helper for Next.js API routes
 * Use this in Next.js route handlers to properly handle CSRF with Laravel Sanctum
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";

export interface CsrfTokenResult {
	csrfToken: string;
	cookies: string;
}

/**
 * Fetch CSRF token from Laravel Sanctum and return the token + raw cookies
 */
export async function fetchCsrfToken(): Promise<CsrfTokenResult> {
	const response = await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
		method: "GET",
		credentials: "include",
	});

	const setCookieHeader = response.headers.get("set-cookie") || "";

	// Extract CSRF token from cookie
	const csrfTokenMatch = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/);
	const csrfToken = csrfTokenMatch
		? decodeURIComponent(csrfTokenMatch[1])
		: null;

	if (!csrfToken) {
		throw new Error("Failed to obtain CSRF token from Laravel");
	}

	return { csrfToken, cookies: setCookieHeader };
}

/**
 * Make an authenticated POST request to Laravel API with CSRF token and session cookies
 * @param path - API path (e.g., "/api/v1/auth/logout")
 * @param body - Request body
 * @param csrfToken - CSRF token from fetchCsrfToken
 * @param authToken - Optional Bearer token for authenticated requests
 * @param cookies - Optional session cookies from CSRF fetch
 */
export async function csrfFetch<T = unknown>(
	path: string,
	body: Record<string, unknown>,
	csrfToken: string,
	authToken?: string,
	cookies?: string,
): Promise<{ data: T; status: number }> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
		"X-XSRF-TOKEN": csrfToken,
		"X-Requested-With": "XMLHttpRequest",
	};

	// Add auth token if provided (for protected routes)
	if (authToken) {
		headers["Authorization"] = `Bearer ${authToken}`;
	}

	const fetchOptions: RequestInit = {
		method: "POST",
		headers,
		body: JSON.stringify(body),
		credentials: "include",
	};

	// Pass cookies from CSRF fetch for CORS
	if (cookies) {
		headers["Cookie"] = cookies;
	}

	try {
		const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

		let data;
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			data = await response.json();
		} else {
			data = { message: await response.text() };
		}

		return { data: data as T, status: response.status };
	} catch (error) {
		console.error(`[csrfFetch] Request failed for ${path}:`, error);
		throw error;
	}
}

/**
 * Make an authenticated GET request to Laravel API with session cookie
 */
export async function csrfGet<T = unknown>(
	path: string,
	authToken?: string,
	cookies?: string,
): Promise<{ data: T; status: number }> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};

	// Add auth token if provided
	if (authToken) {
		headers["Authorization"] = `Bearer ${authToken}`;
	}

	const fetchOptions: RequestInit = {
		method: "GET",
		headers,
		credentials: "include",
	};

	// Pass cookies for CORS
	if (cookies) {
		headers["Cookie"] = cookies;
	}

	const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

	const data = await response.json();
	return { data: data as T, status: response.status };
}