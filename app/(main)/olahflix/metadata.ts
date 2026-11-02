import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "OlahFlix — Video Center",
	description:
		"Nikmati berbagai video sepak bola favorit: highlight, hasil pertandingan, dan konten eksklusif hanya di Olahbola. Tonton langsung tanpa keluar aplikasi.",
	keywords: [
		"video sepak bola",
		"OlahFlix",
		"highlight pertandingan",
		"video bola",
		"olahbola",
	],
	alternates: {
		canonical: "/olahflix",
	},
	openGraph: {
		title: "Olahbola | OlahFlix",
		description:
			"Nikmati berbagai video sepak bola favorit: highlight, hasil pertandingan, dan konten eksklusif hanya di Olahbola.",
		url: "https://olahbola.com/olahflix",
		type: "website",
		locale: "id_ID",
		siteName: "Olahbolacom",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "OlahFlix Olahbola",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola | OlahFlix",
		description:
			"Nikmati berbagai video sepak bola favorit: highlight, hasil pertandingan, dan konten eksklusif hanya di Olahbola.",
		images: ["/og-image.png"],
	},
};
