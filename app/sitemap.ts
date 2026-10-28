import { MetadataRoute } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";

interface SitemapItem {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
}

// Fetch all pages of an API endpoint, deduped by id.
// per_page=100 + MAX_PAGES=5 → up to 500 items per type.
// ponytail: MAX_PAGES capped at 5 (500 items) — raise if a type ever exceeds it.
const PER_PAGE = 100;
const MAX_PAGES = 5;
const FETCH_TIMEOUT_MS = 15_000;

async function fetchAllPages(
  endpoint: string,
): Promise<Array<{ slug: string | null; id: string; updated_at: string }>> {
  try {
    const firstRes = await fetch(
      `${API_BASE_URL}/${endpoint}?page=1&per_page=${PER_PAGE}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    );
    if (!firstRes.ok) return [];

    const firstData = await firstRes.json();
    const totalPages = Math.min(
      firstData?.metadata?.total_pages ?? 1,
      MAX_PAGES,
    );
    const firstItems: Array<{ slug: string | null; id: string; updated_at: string }> =
      (firstData?.data || []).map((item: any) => ({
        slug: item.slug ?? null,
        id: item.id,
        updated_at: item.updated_at || item.published_at || item.created_at || new Date().toISOString(),
      }));

    if (totalPages === 1) return firstItems;

    const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const remainingResults = await Promise.allSettled(
      remainingPages.map((page) =>
        fetch(
          `${API_BASE_URL}/${endpoint}?page=${page}&per_page=${PER_PAGE}`,
          {
            headers: { Accept: "application/json" },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          },
        ).then((res) => res.json()),
      ),
    );

    const remainingItems = remainingResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .flatMap((r) => r.value?.data || []);

    const allItems = [
      ...firstItems,
      ...remainingItems.map((item: any) => ({
        slug: item.slug ?? null,
        id: item.id,
        updated_at: item.updated_at || item.published_at || item.created_at || new Date().toISOString(),
      })),
    ];

    // Dedup by id in case items shifted between pages
    const seen = new Set<string>();
    return allItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch (error) {
    console.error(`[sitemap] Error fetching ${endpoint}:`, error);
    return [];
  }
}

// Fetch data from Laravel API (server-side, no auth needed for public content)
async function fetchSitemapData(): Promise<{
  articles: Array<{ slug: string; updated_at: string }>;
  kolaborasis: Array<{ slug: string; updated_at: string }>;
}> {
  const [articles, kolaborasis] = await Promise.all([
    fetchAllPages("api/v1/article"),
    fetchAllPages("api/v1/kolaborasi"),
  ]);

  return {
    articles: articles.filter((a) => a.slug) as Array<{ slug: string; updated_at: string }>,
    kolaborasis: kolaborasis.filter((k) => k.slug) as Array<{ slug: string; updated_at: string }>,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.olahbola.com";
  const now = new Date();

  // Fetch dynamic data from API
  const { articles, kolaborasis } = await fetchSitemapData();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/artikel`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prediksi-skor`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sapa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/olahflix`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/journey`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/football/primer-league`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/football/la-liga`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/football/bundesliga`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/football/serie-a`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/football/ligue-1`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/football/uefa-champions-league`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guess-who`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/media-spotlight`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/teater-bola-asean-2026`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bundesliga-prediksi-skor-2026-2027`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/fifa-asean-cup-prediksi-skor`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kebijakan-hak-cipta`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-dan-ketentuan-penggunaan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-dan-ketentuan-football-city-battle`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-dan-ketentuan-periklanan-partnership`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-ketentuan-olahbola-games`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Article detail routes
  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((a) => a.slug)
    .map((article) => ({
      url: `${baseUrl}/artikel/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Kolaborasi detail routes
  const kolaborasiRoutes: MetadataRoute.Sitemap = kolaborasis
    .filter((k) => k.slug)
    .map((kolaborasi) => ({
      url: `${baseUrl}/media-spotlight/kolaborasi/${kolaborasi.slug}`,
      lastModified: new Date(kolaborasi.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...articleRoutes, ...kolaborasiRoutes];
}