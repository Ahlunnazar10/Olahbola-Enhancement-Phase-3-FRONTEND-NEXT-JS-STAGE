import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Artikel",
	description:
		"Baca artikel dan berita sepak bola terbaru dari liga-liga top dunia. Update transfer, hasil pertandingan, analisis, dan konten eksklusif hanya untuk penggila bola di Olahbola.",
	keywords: [
		"artikel sepak bola",
		"berita bola",
		"transfer sepak bola",
		"hasil pertandingan",
		"analisis bola",
		"olahbola",
	],
	alternates: {
		canonical: "/artikel",
	},
	openGraph: {
		title: "Olahbola | Artikel Sepak Bola",
		description:
			"Baca artikel dan berita sepak bola terbaru dari liga-liga top dunia. Update transfer, hasil pertandingan, analisis, dan konten eksklusif hanya untuk penggila bola di Olahbola.",
		url: "https://olahbola.com/artikel",
		type: "website",
		locale: "id_ID",
		siteName: "Olahbolacom",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Artikel Olahbola",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola | Artikel Sepak Bola",
		description:
			"Baca artikel dan berita sepak bola terbaru dari liga-liga top dunia. Update transfer, hasil pertandingan, analisis, dan konten eksklusif hanya untuk penggila bola di Olahbola.",
		images: ["/og-image.png"],
	},
};
