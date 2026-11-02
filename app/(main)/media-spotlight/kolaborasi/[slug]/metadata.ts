import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;

	try {
		const response = await apiClient.get(`/api/v1/kolaborasi/${slug}`);

		if (response.data?.status === "success" && response.data?.data) {
			const kolaborasi = response.data.data;
			const fullImageUrl = kolaborasi.image
				? `${process.env.NEXT_PUBLIC_API_URL}/storage/${kolaborasi.image}`
				: null;

			return {
				title: kolaborasi.title || "Kolaborasi",
				description:
					kolaborasi.excerpt ||
					`Temukan kisah kolaborasi Olahbola bersama ${kolaborasi.brand_name || "brand ternama"}. Dari kampanye digital hingga partnership eksklusif.`,
				keywords: [
					kolaborasi.title,
					kolaborasi.brand_name || "kolaborasi brand",
					"olahbola",
					"partnership Olahbola",
					"kampanye sepak bola",
				],
				alternates: {
					canonical: `/media-spotlight/kolaborasi/${slug}`,
				},
				openGraph: {
					title: kolaborasi.title || "Kolaborasi Olahbola",
					description:
						kolaborasi.excerpt ||
						`Temukan kisah kolaborasi Olahbola bersama ${kolaborasi.brand_name || "brand ternama"}. Dari kampanye digital hingga partnership eksklusif.`,
					url: `https://olahbola.com/media-spotlight/kolaborasi/${slug}`,
					type: "website",
					locale: "id_ID",
					siteName: "Olahbolacom",
					images: fullImageUrl
						? [
								{
									url: fullImageUrl,
									width: 1200,
									height: 630,
									alt: kolaborasi.title,
								},
							]
						: [
								{
									url: "/og-image.png",
									width: 1200,
									height: 630,
									alt: kolaborasi.title || "Olahbola",
								},
							],
				},
				twitter: {
					card: "summary_large_image",
					title: kolaborasi.title || "Kolaborasi Olahbola",
					description:
						kolaborasi.excerpt ||
						`Temukan kisah kolaborasi Olahbola bersama ${kolaborasi.brand_name || "brand ternama"}. Dari kampanye digital hingga partnership eksklusif.`,
					images: fullImageUrl ? [fullImageUrl] : ["/og-image.png"],
				},
			};
		}
	} catch (error) {
		console.error("[metadata kolaborasi] Error:", error);
	}

	// Fallback metadata
	return {
		title: "Kolaborasi Tidak Ditemukan",
		description:
			"Kolaborasi yang kamu cari mungkin sudah dipindahkan atau dihapus.",
		alternates: {
			canonical: `/media-spotlight/kolaborasi/${slug}`,
		},
		openGraph: {
			title: "Kolaborasi Tidak Ditemukan | Olahbola",
			description:
				"Kolaborasi yang kamu cari mungkin sudah dipindahkan atau dihapus.",
			url: `https://olahbola.com/media-spotlight/kolaborasi/${slug}`,
			type: "website",
			locale: "id_ID",
			siteName: "Olahbolacom",
		},
		twitter: {
			card: "summary_large_image",
			title: "Kolaborasi Tidak Ditemukan | Olahbola",
			description:
				"Kolaborasi yang kamu cari mungkin sudah dipindahkan atau dihapus.",
		},
	};
}
