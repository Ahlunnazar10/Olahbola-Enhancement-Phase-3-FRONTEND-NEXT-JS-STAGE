import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;

	try {
		const response = await apiClient.get(`/api/v1/interview/${slug}`);

		if (response.data?.status === "success" && response.data?.data) {
			const interview = response.data.data;
			const fullImageUrl = interview.image
				? `${process.env.NEXT_PUBLIC_API_URL}/storage/${interview.image}`
				: null;

			return {
				title: interview.title || "Interview",
				description:
					interview.description ||
					`Saksikan wawancara eksklusif bersama ${interview.person_name || "pemain dan legenda sepak bola"} di Olahbola.`,
				keywords: [
					interview.title,
					interview.person_name || "interview bola",
					"olahbola",
					"wawancara eksklusif",
					"sepak bola",
				],
				alternates: {
					canonical: `/interview/${slug}`,
				},
				openGraph: {
					title: interview.title || "Interview Olahbola",
					description:
						interview.description ||
						`Saksikan wawancara eksklusif bersama ${interview.person_name || "pemain dan legenda sepak bola"} di Olahbola.`,
					url: `https://olahbola.com/interview/${slug}`,
					type: "video.other",
					locale: "id_ID",
					siteName: "Olahbolacom",
					images: fullImageUrl
						? [
								{
									url: fullImageUrl,
									width: 1200,
									height: 630,
									alt: interview.title,
								},
							]
						: [
								{
									url: "/og-image.png",
									width: 1200,
									height: 630,
									alt: interview.title || "Olahbola",
								},
							],
					...(interview.post_url && { videos: [{ url: interview.post_url }] }),
				},
				twitter: {
					card: "summary_large_image",
					title: interview.title || "Interview Olahbola",
					description:
						interview.description ||
						`Saksikan wawancara eksklusif bersama ${interview.person_name || "pemain dan legenda sepak bola"} di Olahbola.`,
					images: fullImageUrl ? [fullImageUrl] : ["/og-image.png"],
				},
			};
		}
	} catch (error) {
		console.error("[metadata interview] Error:", error);
	}

	// Fallback metadata
	return {
		title: "Interview Tidak Ditemukan",
		description:
			"Interview yang kamu cari mungkin sudah dipindahkan atau dihapus.",
		alternates: {
			canonical: `/interview/${slug}`,
		},
		openGraph: {
			title: "Interview Tidak Ditemukan | Olahbola",
			description:
				"Interview yang kamu cari mungkin sudah dipindahkan atau dihapus.",
			url: `https://olahbola.com/interview/${slug}`,
			type: "website",
			locale: "id_ID",
			siteName: "Olahbolacom",
		},
		twitter: {
			card: "summary_large_image",
			title: "Interview Tidak Ditemukan | Olahbola",
			description:
				"Interview yang kamu cari mungkin sudah dipindahkan atau dihapus.",
		},
	};
}
