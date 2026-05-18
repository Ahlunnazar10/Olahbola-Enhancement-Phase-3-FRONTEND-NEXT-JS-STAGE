import { NextResponse } from "next/server";

const HEROPLAY_API_URL = "https://api.mainhero.id";
const HEROPLAY_GAME_ID = "69eb4ed14f862f8bae6bc7b6";

export async function GET(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const apiUrl = `${HEROPLAY_API_URL}/api/v1/games/${HEROPLAY_GAME_ID}/leaderboard?page=${page}&limit=${limit}`;

    console.log("[Leaderboard API] Fetching:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[Leaderboard API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Leaderboard API] HTTP Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Leaderboard API] Success:", data.status, "entries:", data.data?.leaderboard?.length);
    return NextResponse.json(data);
  } catch (error) {
    clearTimeout(timeoutId);

    // Check if it was an abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("[Leaderboard API] Request timed out");
      return NextResponse.json(
        {
          status: "error",
          message: "Request timeout - API server tidak merespons",
          data: null,
          error: "timeout",
        },
        { status: 504 }
      );
    }

    console.error("[Leaderboard API] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal mengambil data leaderboard. API server tidak dapat dijangkau.",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}