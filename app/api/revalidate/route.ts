import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
