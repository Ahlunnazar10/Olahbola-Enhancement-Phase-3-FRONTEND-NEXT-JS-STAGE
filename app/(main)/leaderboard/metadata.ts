import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Lihat peringkat teratas para penggila bola di Olahbola. Naikkan rankingmu dengan skor tertinggi dan pamerkan achievements di leaderboard!",
  keywords: ["leaderboard Olahbola", "peringkat bola", "top score", "skor tertinggi", "penggila bola", "olahbola"],
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "Olahbola | Leaderboard",
    description: "Lihat peringkat teratas para penggila bola di Olahbola. Naikkan rankingmu dengan skor tertinggi dan pamerkan achievements di leaderboard!",
    url: "https://olahbola.com/leaderboard",
    type: "website",
    locale: "id_ID",
    siteName: "Olahbolacom",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Leaderboard Olahbola" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olahbola | Leaderboard",
    description: "Lihat peringkat teratas para penggila bola di Olahbola. Naikkan rankingmu dengan skor tertinggi dan pamerkan achievements di leaderboard!",
    images: ["/og-image.png"],
  },
};