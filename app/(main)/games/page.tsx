import { GamesPageContent } from "@/components/games/GamesPageContent";
import { JsonLdServer } from "@/components/seo/JsonLdServer";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Olahbola Games | Tempatnya Penggila Bola!",
	description:
		"Main game sepak bola paling seru di OlahBola! Prediksi skor World Cup, adu pengetahuan di OlahBola Quiz, dan tebak pemain legendaris di Guess Who Football Edition. Raih poin, panjat leaderboard, dan menangi hadiah.",
	keywords: [
		"games olahbola",
		"prediksi skor world cup",
		"quiz sepak bola indonesia",
		"guess who sepak bola",
		"football quiz",
		"leaderboard prediksi skor",
		"game bola online",
	],
	openGraph: {
		title: "Olahbola Games | Tempatnya Penggila Bola!",
		description:
			"Main game sepak bola paling seru di OlahBola! Prediksi skor World Cup, adu pengetahuan di OlahBola Quiz, dan tebak pemain legendaris di Guess Who Football Edition.",
		type: "website",
		url: "https://www.olahbola.com/games",
		siteName: "Olahbolacom",
		locale: "id_ID",
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola Games | Tempatnya Penggila Bola!",
		description:
			"Main game sepak bola paling seru di OlahBola! Prediksi skor, kuis, dan Guess Who versi pemain bola.",
	},
	alternates: {
		canonical: "https://www.olahbola.com/games",
	},
};

export default function GamesPage() {
	const gamesJsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Olahbola Games | Tempatnya Penggila Bola!",
		description:
			"Kumpulan game sepak bola interaktif dari OlahBola: Prediksi Skor World Cup, OlahBola Quiz, dan Guess Who Football Edition.",
		url: "https://www.olahbola.com/games",
		numberOfItems: 3,
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				item: {
					"@type": "Game",
					name: "Prediksi Skor — Football City Battle",
					description:
						"Tebak skor pertandingan World Cup, kumpulkan poin, dan bawa kotamu ke puncak klasemen.",
					url: "https://www.olahbola.com/prediksi-skor",
					genre: "Sports Prediction",
					playMode: "SinglePlayer",
					applicationCategory: "Game",
				},
			},
			{
				"@type": "ListItem",
				position: 2,
				item: {
					"@type": "Game",
					name: "OlahBola Quiz",
					description:
						"Quiz adu pengetahuan sepak bola Indonesia dan dunia dengan multi level.",
					url: "https://www.olahbola.com/quiz",
					genre: "Trivia",
					playMode: "SinglePlayer",
					applicationCategory: "Game",
				},
			},
			{
				"@type": "ListItem",
				position: 3,
				item: {
					"@type": "Game",
					name: "Guess Who Football Edition",
					description:
						"Tebak nama pemain bola dari foto terpotong lewat 4 level kesulitan dan menangi hadiah misterius.",
					url: "https://www.olahbola.com/guess-who",
					genre: "Picture Guessing",
					playMode: "SinglePlayer",
					applicationCategory: "Game",
				},
			},
		],
	};

	return (
		<>
			<JsonLdServer data={gamesJsonLd} />
			<GamesPageContent />
		</>
	);
}
