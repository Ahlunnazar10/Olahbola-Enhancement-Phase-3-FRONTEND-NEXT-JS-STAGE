import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journey",
  description: "Jelajahi perjalanan Olahbola dari awal hingga sekarang. Cerita, milestone, danachievements yang telah kita raih bersama penggila bola seluruh Indonesia.",
  keywords: ["journey Olahbola", "sejarah Olahbola", "timeline Olahbola", "milestone Olahbola", "olahbola"],
  alternates: {
    canonical: "/journey",
  },
  openGraph: {
    title: "Olahbola | Journey",
    description: "Jelajahi perjalanan Olahbola dari awal hingga sekarang. Cerita, milestone, dan achievements yang telah kita raih bersama penggila bola seluruh Indonesia.",
    url: "https://olahbola.com/journey",
    type: "website",
    locale: "id_ID",
    siteName: "Olahbolacom",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Journey Olahbola" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olahbola | Journey",
    description: "Jelajahi perjalanan Olahbola dari awal hingga sekarang. Cerita, milestone, dan achievements yang telah kita raih bersama penggila bola seluruh Indonesia.",
    images: ["/og-image.png"],
  },
};