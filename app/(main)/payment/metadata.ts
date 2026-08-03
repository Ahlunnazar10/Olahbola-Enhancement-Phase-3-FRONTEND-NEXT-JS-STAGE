import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Olahbola Premium Membership | Olahbola",
	description:
		"Dapatkan akses penuh ke semua games, prediksi skor, dan kuis eksklusif dengan Olahbola Premium Membership.",
	keywords: [
		"olahbola premium",
		"membership olahbola",
		"berlangganan premium",
		"akses premium olahbola",
	],
	alternates: {
		canonical: "/payment",
	},
	openGraph: {
		title: "Olahbola Premium Membership | Olahbola",
		description:
			"Buka semua fitur eksklusif Olahbola dengan satu paket Premium.",
		url: "https://www.olahbola.com/payment",
		type: "website",
		locale: "id_ID",
		siteName: "Olahbolacom",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Olahbola Premium",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola Premium Membership | Olahbola",
		description: "Buka semua fitur eksklusif Olahbola dengan satu paket Premium.",
		images: ["/og-image.png"],
	},
	robots: {
		index: false,
		follow: false,
	},
};
