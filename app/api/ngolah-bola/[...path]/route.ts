import { NextRequest, NextResponse } from "next/server";

const LARAVEL_BASE =
	process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";
const UPSTREAM_PREFIX = "/api/v1/ngolah-bola";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ path?: string[] }> },
) {
	return proxy(req, params, "GET");
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ path?: string[] }> },
) {
	return proxy(req, params, "POST");
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ path?: string[] }> },
) {
	return proxy(req, params, "PUT");
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ path?: string[] }> },
) {
	return proxy(req, params, "DELETE");
}

async function proxy(
	req: NextRequest,
	params: Promise<{ path?: string[] }>,
	method: "GET" | "POST" | "PUT" | "DELETE",
) {
	const { path } = await params;
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
	const cookie = req.headers.get("cookie");
	if (cookie) {
		headers["Cookie"] = cookie;
	}

	const init: RequestInit = { method, headers };
	if (method === "POST" || method === "PUT") {
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
		console.error("[ngolah-bola proxy] upstream error:", err);
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
