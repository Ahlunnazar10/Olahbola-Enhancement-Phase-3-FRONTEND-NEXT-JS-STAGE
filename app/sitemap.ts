import { MetadataRoute } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com";

interface SitemapItem {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
}

// Fetch data from Laravel API (server-side, no auth needed for public content)
async function fetchSitemapData(): Promise<{
  articles: Array<{ slug: string; updated_at: string }>;
  interviews: Array<{ slug: string; updated_at: string }>;
  kolaborasis: Array<{ slug: string; updated_at: string }>;
}> {
  try {
    const [articlesRes, interviewsRes, kolaborasisRes] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/api/v1/article?per_page=100`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
      fetch(`${API_BASE_URL}/api/v1/interview?per_page=100`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
      fetch(`${API_BASE_URL}/api/v1/kolaborasi?per_page=100`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }),
    ]);

    // Parse articles
    let articles: Array<{ slug: string; updated_at: string }> = [];
    if (articlesRes.status === "fulfilled" && articlesRes.value.ok) {
      try {
        const articlesData = await articlesRes.value.json();
        articles = (articlesData.data || []).map((item: any) => ({
          slug: item.slug,
          updated_at: item.updated_at || item.published_at || item.created_at || new Date().toISOString(),
        }));
      } catch (e) {
        console.error("[sitemap] Failed to parse articles:", e);
      }
    }

    // Parse interviews
    let interviews: Array<{ slug: string; updated_at: string }> = [];
    if (interviewsRes.status === "fulfilled" && interviewsRes.value.ok) {
      try {
        const interviewsData = await interviewsRes.value.json();
        interviews = (interviewsData.data || []).map((item: any) => ({
          slug: item.slug,
          updated_at: item.updated_at || item.created_at || new Date().toISOString(),
        }));
      } catch (e) {
        console.error("[sitemap] Failed to parse interviews:", e);
      }
    }

    // Parse kolaborasis
    let kolaborasis: Array<{ slug: string; updated_at: string }> = [];
    if (kolaborasisRes.status === "fulfilled" && kolaborasisRes.value.ok) {
      try {
        const kolaborasisData = await kolaborasisRes.value.json();
        kolaborasis = (kolaborasisData.data || []).map((item: any) => ({
          slug: item.slug,
          updated_at: item.updated_at || item.created_at || new Date().toISOString(),
        }));
      } catch (e) {
        console.error("[sitemap] Failed to parse kolaborasis:", e);
      }
    }

    return { articles, interviews, kolaborasis };
  } catch (error) {
    console.error("[sitemap] Error fetching data:", error);
    return { articles: [], interviews: [], kolaborasis: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.olahbola.com";
  const now = new Date();

  // Fetch dynamic data from API
  const { articles, interviews, kolaborasis } = await fetchSitemapData();

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
      url: `${baseUrl}/quiz`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sapa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kolaborasi`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/interview`,
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
  ];

  // Article detail routes
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/artikel/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Interview detail routes
  const interviewRoutes: MetadataRoute.Sitemap = interviews.map((interview) => ({
    url: `${baseUrl}/interview/${interview.slug}`,
    lastModified: new Date(interview.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Kolaborasi detail routes
  const kolaborasiRoutes: MetadataRoute.Sitemap = kolaborasis.map((kolaborasi) => ({
    url: `${baseUrl}/kolaborasi/${kolaborasi.slug}`,
    lastModified: new Date(kolaborasi.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...interviewRoutes, ...kolaborasiRoutes];
}