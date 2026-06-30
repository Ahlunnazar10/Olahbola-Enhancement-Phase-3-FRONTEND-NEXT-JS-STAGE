import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Olahbola | Tempatnya Penggila Bola!",
		short_name: "Olahbola",
		description:
			"Olahbola adalah platform terbaik untuk penggemar sepak bola. Dapatkan artikel terbaru, highlight, quiz sepak bola dan game seru lainnya di sini.",
		start_url: "/",
		display: "standalone",
		background_color: "#43decc",
		theme_color: "#43decc",
		orientation: "portrait-primary",
		icons: [
			{
				src: "/images/logo/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/images/logo/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		categories: ["sports", "entertainment", "media"],
	};
}
