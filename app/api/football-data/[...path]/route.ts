import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE = "https://api.football-data.org";

// ------------------------------------------------------------------
// Server-side cache — in-memory Map, TTL per-path
// ------------------------------------------------------------------
// football-data.org Free = 10 req/menit.
// Standings  tidak berubah sering → cache 5 menit.
// Matches   skor bisa live       → cache 2 menit.
// Path lain (competitions list dll) → cache 10 menit.
// ------------------------------------------------------------------

interface CacheEntry {
	etag: string;
	body: string;
	status: number;
	expiresAt: number;
}

const CACHE: Map<string, CacheEntry> = new Map();
const TTL: Record<string, number> = {
	standings: 5 * 60 * 1000,
	matches: 2 * 60 * 1000,
	default: 10 * 60 * 1000,
};

function getTtl(path: string): number {
	if (path.includes("/standings")) return TTL.standings;
	if (path.includes("/matches")) return TTL.matches;
	return TTL.default;
}

function getCacheKey(req: NextRequest, upstreamPath: string): string {
	// query string ikut di key agar season/matchday param tidak bentrok
	const qs = req.nextUrl.search || "";
	return `${upstreamPath}${qs}`;
}

function getCached(key: string): CacheEntry | null {
	const entry = CACHE.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		CACHE.delete(key);
		return null;
	}
	return entry;
}

function setCache(key: string, entry: Omit<CacheEntry, "expiresAt">): void {
	// evict jika cache sudah terlalu besar (memasuki 500 key)
	if (CACHE.size > 500) {
		const now = Date.now();
		for (const [k, e] of CACHE) {
			if (now > e.expiresAt) CACHE.delete(k);
		}
	}
	const ttl = getTtl(key);
	CACHE.set(key, { ...entry, expiresAt: Date.now() + ttl });
}

// ------------------------------------------------------------------
// Retry with backoff untuk 429 / 403
// ------------------------------------------------------------------

function parseRetryAfter(res: Response): number {
	const val = res.headers.get("Retry-After");
	if (val) {
		// bisa seconds atau HTTP date
		const secs = parseInt(val, 10);
		if (!isNaN(secs)) return secs * 1000;
		const dateMs = new Date(val).getTime() - Date.now();
		if (!isNaN(dateMs)) return Math.max(dateMs, 1000);
	}
	// default fallback
	return 45 * 1000;
}

async function fetchWithRetry(
	url: string,
	headers: Record<string, string>,
	maxRetries = 2,
): Promise<Response> {
	let lastRes: Response | null = null;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const res = await fetch(url, {
			method: "GET",
			headers,
			cache: "no-store",
			redirect: "manual",
		});

		if (res.status >= 300 && res.status < 400) {
			const loc = res.headers.get("location") ?? "";
			const allowedHost = "api.football-data.org";
			let locOk = false;
			try {
				const u = new URL(loc, url);
				locOk = u.host === allowedHost && (u.protocol === "https:" || u.protocol === "http:");
			} catch { /* loc unparseable */ }
			if (!locOk) {
				return new NextResponse(JSON.stringify({ status: "error", message: "Redirect to untrusted host blocked" }), {
					status: 403,
					headers: { "Content-Type": "application/json" },
				});
			}
			if (attempt < maxRetries) continue;
			return res;
		}

		if (res.status === 429 || res.status === 403) {
			// rate limited — simpan response terakhir, tunggu, retry
			lastRes = res;
			if (attempt < maxRetries) {
				const waitMs = parseRetryAfter(res);
				// max wait 120s — jangan block terlalu lama
				const cappedWait = Math.min(waitMs, 120_000);
				await new Promise((r) => setTimeout(r, cappedWait));
				continue;
			}
			// habis retries — return response 429 agar client tahu
			return res;
		}

		// 304 Not Modified → reuse cache (handled below)
		if (res.status === 304) return res;

		// success atau error lain — return langsung
		return res;
	}

	// fallback
	return lastRes!;
}

// ------------------------------------------------------------------
// Proxy handler
// ------------------------------------------------------------------

async function proxy(req: NextRequest, ctx: RouteContext<"/api/football-data/[...path]">) {
	const apiKey = process.env.FOOTBALL_DATA_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ status: "error", message: "FOOTBALL_DATA_API_KEY belum diset di server" },
			{ status: 500 },
		);
	}

	const { path } = await ctx.params;
	// sanitize: buang segment path traversal / kosong — cegah SSRF/IDOR
	const segments = (path ?? [])
		.filter((s) => s !== ".." && s !== "." && s !== "")
		.map((s) => encodeURIComponent(s));
	const upstreamPath = `/v4/${segments.join("/")}`;
	const url = `${UPSTREAM_BASE}${upstreamPath}${req.nextUrl.search}`;
	const cacheKey = getCacheKey(req, upstreamPath);

	// 1. Hit cache
	const cached = getCached(cacheKey);
	if (cached) {
		const res = new NextResponse(cached.body, {
			status: cached.status,
			headers: {
				"Content-Type": "application/json",
				"ETag": cached.etag,
				"Cache-Control": "public, max-age=60, must-revalidate",
				"X-Cache": "HIT",
			},
		});
		return res;
	}

	// 2. Cache miss — fetch upstream (dengan retry)
	let ifNoneMatch = "";
	const priorEntry = CACHE.get(cacheKey); // bisa ada tapi expired
	if (priorEntry?.etag) ifNoneMatch = priorEntry.etag;

	const headers: Record<string, string> = {
		"X-Auth-Token": apiKey,
		Accept: "application/json",
	};
	if (ifNoneMatch) headers["If-None-Match"] = ifNoneMatch;

	try {
		const res = await fetchWithRetry(url, headers);
		const text = await res.text();

		if (res.status === 429 || res.status === 403) {
			// rate limit exhausted setelah retries — simpan last data jika ada, atau return 429
			if (priorEntry) {
				// serve stale cache sementara rate limit
				const res2 = new NextResponse(priorEntry.body, {
					status: priorEntry.status,
					headers: {
						"Content-Type": "application/json",
						"ETag": priorEntry.etag,
						"X-Cache": "STALE",
						"Cache-Control": "public, max-age=60",
					},
				});
				return res2;
			}
			// tidak ada data sama sekali — teruskan 429 ke client
			return new NextResponse(text, {
				status: res.status,
				headers: {
					"Content-Type": "application/json",
					"Retry-After": String(Math.ceil(parseRetryAfter(res) / 1000)),
					"Cache-Control": "no-store",
				},
			});
		}

		const etag = res.headers.get("etag") ?? "";
		setCache(cacheKey, { etag, body: text, status: res.status });

		return new NextResponse(text, {
			status: res.status,
			headers: {
				"Content-Type": "application/json",
				...(etag ? { ETag: etag } : {}),
				"Cache-Control": "public, max-age=60, must-revalidate",
				"X-Cache": "MISS",
			},
		});
	} catch (err) {
		console.error("[football-data proxy] upstream error:", err);
		// fallback: serve stale cache
		if (priorEntry) {
			return new NextResponse(priorEntry.body, {
				status: priorEntry.status,
				headers: {
					"Content-Type": "application/json",
					"ETag": priorEntry.etag,
					"X-Cache": "STALE_ON_ERROR",
					"Cache-Control": "public, max-age=60",
				},
			});
		}
		return NextResponse.json(
			{ status: "error", message: "Upstream football-data.org tidak dapat dijangkau" },
			{ status: 502 },
		);
	}
}

export async function GET(req: NextRequest, ctx: RouteContext<"/api/football-data/[...path]">) {
	return proxy(req, ctx);
}
