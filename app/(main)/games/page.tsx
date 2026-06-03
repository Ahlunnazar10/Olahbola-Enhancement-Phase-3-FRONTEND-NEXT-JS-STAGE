import { GamesPageContent } from "@/components/games/GamesPageContent";
import { JsonLdServer } from "@/components/seo/JsonLdServer";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Olahbola Games | Tempatnya Penggila Bola!",
	description:
		"Main game sepak bola paling seru di OlahBola! Prediksi skor World Cup dan adu pengetahuan di OlahBola Quiz. Raih poin, panjat leaderboard, dan menangi hadiah.",
	keywords: [
		"games olahbola",
		"prediksi skor world cup",
		"quiz sepak bola indonesia",
		"football quiz",
		"leaderboard prediksi skor",
		"game bola online",
	],
	openGraph: {
		title: "Olahbola Games | Tempatnya Penggila Bola!",
		description:
			"Main game sepak bola paling seru di OlahBola! Prediksi skor World Cup dan adu pengetahuan di OlahBola Quiz.",
		type: "website",
		url: "https://www.olahbola.com/games",
		siteName: "Olahbolacom",
		locale: "id_ID",
	},
	twitter: {
		card: "summary_large_image",
		title: "Olahbola Games | Tempatnya Penggila Bola!",
		description:
			"Main game sepak bola paling seru di OlahBola! Prediksi skor World Cup dan adu pengetahuan di OlahBola Quiz.",
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
			"Kumpulan game sepak bola interaktif dari OlahBola: Prediksi Skor World Cup dan OlahBola Quiz.",
		url: "https://www.olahbola.com/games",
		numberOfItems: 2,
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
		],
	};

	return (
		<>
			<JsonLdServer data={gamesJsonLd} />
			<GamesPageContent />
		</>
	);
}
