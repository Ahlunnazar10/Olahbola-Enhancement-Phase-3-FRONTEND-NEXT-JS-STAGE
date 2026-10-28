import { NextRequest, NextResponse } from "next/server";

const SITEMAP_URL = "https://www.olahbola.com/sitemap.xml";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-ping-secret");
  if (secret !== process.env.PING_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }

  // Ping Google Sitemap — no service account needed, works for any size site.
  // Upgrade path: GSC Indexing API (requires service account + >10k indexed URLs).
  try {
    const res = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      { method: "GET", redirect: "follow", cache: "no-store" },
    );
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
