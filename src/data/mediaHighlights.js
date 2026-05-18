/**
 * Media Highlights Data
 * Tambahkan URL artikel media baru di sini
 * Format: { url, title, source, date, excerpt, image }
 */
export const mediaHighlights = [
	{
		url: "https://harian.disway.id/read/945930/esport-sepak-bola-makin-panas-football-city-battle-hadirkan-persaingan-antarkota-se-indonesia",
		title:
			"Esport Sepak Bola Makin Panas, Football City Battle Hadirkan Persaingan Antarkota Se-Indonesia",
		source: "Harian Disway",
		date: "09 Mei 2026",
		excerpt:
			"Persaingan antarkota di kalangan pencinta sepak bola Indonesia merambah dunia esport. Kompetisi NSR Street City Battle kembali gelar. Kali ini dengan format lebih luas melalui Football City Battle yang merupakan kolaborasi dari OlahBola dan HeroPlay.",
		image: "/images/sorotan-media/harian-disway.webp",
	},
	{
		url: "https://bolaskor.merahputih.com/post/read/rivalitas-antarkota-lewat-kompetisi-football-city-battle",
		title: "Rivalitas Antarkota Lewat Kompetisi Football City Battle",
		source: "Bola Skor",
		date: "10 Mei 2026",
		excerpt:
			"FCB (Football City Battle) menjadi bukti nyata bahwa rivalitas antarsuporter bisa berwujud konstruktif. Bukan lagi soal kekerasan, tapi siapa kota terbaik dalam hal pengetahuan dan loyalitas sepak bola.",
		image: "/images/sorotan-media/bolascore.webp",
	},
	{
		url: "https://m.tribunnews.com/e-sport/7827798/kompetisi-football-city-battle-resmi-digelar-fans-bola-indonesia-adu-gengsi-antar-kota",
		title:
			"Kompetisi Football City Battle Resmi Digelar, Fans Bola Indonesia Adu Gengsi Antar-Kota",
		source: "Tribunnews.com",
		date: "10 Mei 2026",
		excerpt:
			"Rivalitas antar kota kini merambah dunia sepak bola digital melalui Football City Battle, kompetisi terbaru hasil kolaborasi platform OlahBola dan platform gaming, HeroPlay yang resmi dimulai pada Mei 2026.",
		image: "/images/sorotan-media/tribun.webp",
	},
	{
		url: "https://www.akurat.co/bola/855454/football-city-battle-resmi-digelar-fans-bola-indonesia-akan-saling-adu-gengsi",
		title:
			"Football City Battle Resmi Digelar, Fans Bola Indonesia Akan Saling Adu Gengsi",
		source: "Akurat.co",
		date: "10 Mei 2026",
		excerpt:
			"Competisi Football City Battle resmi dirilis oleh Olahbola, sebuah turnamen antarkota yang mempertemukan suporter bola dari berbagai kota besar di Indonesia untuk saling adu gengsi.",
		image: "/images/sorotan-media/akurat-co.webp",
	},
	{
		url: "https://id.techinasia.com/platform-olahbola-ellevate-cari-pemain-berbakat",
		title: "Platform Olahbola Ellevate Cari Pemain Berbakat",
		source: "Tech in Asia",
		date: "12 Jan 2023",
		excerpt:
			"Olahbola Ellevate hadir sebagai platform pencarian bakat sepak bola yang menghubungkan pemain muda berbakat dengan kesempatan bermain di level yang lebih tinggi.",
	},
];

// Helper: ambil semua highlight
export function getAllHighlights() {
	return mediaHighlights;
}

// Helper: cari highlight berdasarkan source
export function getHighlightsBySource(source) {
	return mediaHighlights.filter((h) =>
		h.source.toLowerCase().includes(source.toLowerCase()),
	);
}
