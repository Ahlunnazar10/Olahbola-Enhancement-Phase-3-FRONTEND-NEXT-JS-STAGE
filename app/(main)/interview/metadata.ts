import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Interview",
	description:
		"Saksikan wawancara eksklusif bersama legenda dan bintang sepak bola Eropa. Dapatkan insight langsung dari para jagoan bola, cerita di balik layar, dan pandangan unik tentang dunia sepak bola hanya di Olahbola.",
	keywords: [
		"interview Olahbola",
		"wawancara bola",
		"wawancara eksklusif sepak bola",
		"wawancara pemain bola",
		"legenda sepak bola",
		"bintang sepak bola",
		"olahbola",
	],
	alternates: {
		canonical: "/interview",
	},
	openGraph: {
		title: "Olahbola | Interview",
		description:
			"Saksikan wawancara eksklusif bersama legenda dan bintang sepak bola Eropa. Dapatkan insight langsung dari para jagoan bola, cerita di balik layar, dan pandangan unik tentang dunia sepak bola hanya di Olahbola.",
		url: "https://olahbola.com/interview",
		type: "website",
		locale: "id_ID",
		siteName: "Olahbolacom",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Interview Olahbola",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola | Interview",
		description:
			"Saksikan wawancara eksklusif bersama legenda dan bintang sepak bola Eropa. Dapatkan insight langsung dari para jagoan bola, cerita di balik layar, dan pandangan unik tentang dunia sepak bola hanya di Olahbola.",
		images: ["/og-image.png"],
	},
};
