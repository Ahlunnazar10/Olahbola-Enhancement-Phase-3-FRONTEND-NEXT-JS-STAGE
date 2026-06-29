import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const response = NextResponse.next();

	const path = request.nextUrl.pathname;

	// Long cache for static assets and images
	if (
		path.startsWith("/_next/static/") ||
		path.startsWith("/images/") ||
		path.match(/\.(jpg|jpeg|png|webp|avif|gif|svg|jpeg|ico)$/)
	) {
		response.headers.set(
			"Cache-Control",
			"public, max-age=31536000, immutable",
		);
	}

	// Short cache for HTML pages
	if (request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/artikel")) {
		response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate");
	}

	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	return response;
}

export const config = {
	matcher: [
		/* eslint-disable-next-line no-template-curly-in-string */
		"/((?!api|_next/static|_next/image|favicon.ico|svgs/|icons/).*)",
	],
};
