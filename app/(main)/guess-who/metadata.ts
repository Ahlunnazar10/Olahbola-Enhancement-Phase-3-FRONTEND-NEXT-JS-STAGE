import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Tebak Siapa — Olahbola Games",
	description:
		"Tebak nama pemain sepak bola legendaris berdasarkan deskripsi dan hint! 5 level tantangan, petunjuk eksklusif, dan klasemen global.",
	keywords: [
		"tebak pemain bola",
		"guess who football",
		"tebak siapa olahbola",
		"game tebak pemain sepak bola",
		"football guess who",
		"leaderboard bola",
	],
	alternates: {
		canonical: "/guess-who",
	},
	openGraph: {
		title: "Tebak Siapa — Olahbola Games",
		description:
			"Tebak nama pemain sepak bola berdasarkan deskripsi dan hint! 5 level, leaderboard, hadiah.",
		url: "https://www.olahbola.com/guess-who",
		type: "website",
		locale: "id_ID",
		siteName: "Olahbolacom",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Tebak Siapa",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Tebak Siapa — Olahbola Games",
		description:
			"Tebak nama pemain sepak bola! 5 level, leaderboard, hadiah.",
		images: ["/og-image.png"],
	},
};
