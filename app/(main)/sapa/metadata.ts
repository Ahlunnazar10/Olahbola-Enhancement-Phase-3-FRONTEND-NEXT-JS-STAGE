import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sapa Olahbola",
	description:
		"Hubungi tim Olahbola untuk kolaborasi, kerjasama brand, atau pertanyaan umum. Kami siap membantu Anda mencetak gol besar bersama melalui partnership sepak bola yang solid. Kirim pesan Anda sekarang!",
	keywords: [
		"kontak olahbola",
		"kolaborasi olahbola",
		"hubungi Olahbola",
		"partnership sepak bola",
		"kerja sama brand",
		"olahbola",
	],
	alternates: {
		canonical: "/sapa",
	},
	openGraph: {
		title: "Olahbola | Sapa Olahbola",
		description:
			"Hubungi tim Olahbola untuk kolaborasi, kerjasama brand, atau pertanyaan umum. Kami siap membantu Anda mencetak gol besar bersama melalui partnership sepak bola yang solid. Kirim pesan Anda sekarang!",
		url: "https://olahbola.com/sapa",
		type: "website",
		locale: "id_ID",
		siteName: "Olahbolacom",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Sapa Olahbola",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola | Sapa Olahbola",
		description:
			"Hubungi tim Olahbola untuk kolaborasi, kerjasama brand, atau pertanyaan umum. Kami siap membantu Anda mencetak gol besar bersama melalui partnership sepak bola yang solid. Kirim pesan Anda sekarang!",
		images: ["/og-image.png"],
	},
};
