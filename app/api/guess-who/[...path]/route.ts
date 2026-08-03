import { NextRequest, NextResponse } from "next/server";

const LARAVEL_BASE =
	process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const UPSTREAM_PREFIX = "/api/v1/guess-who";

export async function GET(
	req: NextRequest,
	ctx: RouteContext<"/api/guess-who/[...path]">,
) {
	return proxy(req, ctx, "GET");
}

export async function POST(
	req: NextRequest,
	ctx: RouteContext<"/api/guess-who/[...path]">,
) {
	return proxy(req, ctx, "POST");
}

async function proxy(
	req: NextRequest,
	ctx: RouteContext<"/api/guess-who/[...path]">,
	method: "GET" | "POST",
) {
	const { path } = await ctx.params;
	const segments = path ?? [];
	const upstreamPath = `${UPSTREAM_PREFIX}/${segments.join("/")}`;
	const url = `${LARAVEL_BASE}${upstreamPath}${req.nextUrl.search}`;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const auth = req.headers.get("authorization");
	if (auth) {
		headers["Authorization"] = auth;
	}

	const init: RequestInit = { method, headers };
	if (method === "POST") {
		const body = await req.text();
		if (body) init.body = body;
	}

	try {
		const res = await fetch(url, init);
		const text = await res.text();
		return new NextResponse(text, {
			status: res.status,
			headers: {
				"Content-Type":
					res.headers.get("content-type") ?? "application/json",
			},
		});
	} catch (err) {
		console.error("[guess-who proxy] upstream error:", err);
		return NextResponse.json(
			{
				status: "error",
				message: "Upstream Laravel tidak dapat dijangkau",
				data: null,
			},
			{ status: 502 },
		);
	}
}