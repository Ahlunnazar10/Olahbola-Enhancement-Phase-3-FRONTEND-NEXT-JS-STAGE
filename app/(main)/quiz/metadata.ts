import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Olahbola Quiz",
	description:
		"Ikuti kuis sepak bola seru di Olahbola! Uji pengetahuanmu tentang dunia sepak bola, naikkan peringkat di leaderboard, dan menangkan berbagai hadiah menarik. Tersedia Friendly Match untuk latihan dan spesial event untuk quiz berhadiah.",
	keywords: [
		"quiz sepak bola",
		"kuis bola",
		"tebak skor",
		"tebak pemain",
		"leaderboard bola",
		"hadiah sepak bola",
		"olahbola quiz",
		"olahbola",
	],
	alternates: {
		canonical: "/quiz",
	},
	openGraph: {
		title: "Olahbola | Olahbola Quiz",
		description:
			"Ikuti kuis sepak bola seru di Olahbola! Uji pengetahuanmu tentang dunia sepak bola, naikkan peringkat di leaderboard, dan menangkan berbagai hadiah menarik. Tersedia Friendly Match untuk latihan dan spesial event untuk quiz berhadiah.",
		url: "https://olahbola.com/quiz",
		type: "website",
		locale: "id_ID",
		siteName: "Olahbolacom",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Olahbola Quiz",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola | Olahbola Quiz",
		description:
			"Ikuti kuis sepak bola seru di Olahbola! Uji pengetahuanmu tentang dunia sepak bola, naikkan peringkat di leaderboard, dan menangkan berbagai hadiah menarik. Tersedia Friendly Match untuk latihan dan spesial event untuk quiz berhadiah.",
		images: ["/og-image.png"],
	},
};
