import type { Metadata } from "next";
import Script from "next/script";
import {
	Plus_Jakarta_Sans,
	Fira_Code,
	Space_Grotesk,
	Lexend,
} from "next/font/google";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GlobalSeoScripts } from "@/components/seo/SeoScriptsServer";

const GTM_ID = "GTM-FC96C4T4";

// ------------------------------------------------------------------
// AdSense publisher ID (used for the global adsbygoogle SDK)
// Env var is preferred; fall back to the production ID so the
// script tag is never empty in any deployment.
// ------------------------------------------------------------------
const ADSENSE_CLIENT =
	process.env.NEXT_PUBLIC_ADSENSE_CLIENT ||
	"ca-pub-8005120082355722";

// ------------------------------------------------------------------
// Font loading strategy:
// - Plus Jakarta Sans 400 normal is inlined via next/font → preload
// - All other weights & secondary fonts load asynchronously via
//   a single Google Fonts CSS import, avoiding render-blocking FOUT
// ------------------------------------------------------------------
const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta",
	subsets: ["latin"],
	weight: ["400", "700"],
	style: ["normal"],
	display: "swap",
	preload: true,
});

const firaCode = Fira_Code({
	variable: "--font-fira-code",
	subsets: ["latin"],
	weight: ["400"],
	display: "swap",
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
	weight: ["400", "700"],
	display: "swap",
});

const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
	weight: ["400"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Olahbola | Tempatnya Penggila Bola!",
		template: "%s | Olahbola",
	},
	description:
		"Olahbola adalah platform terbaik untuk penggemar sepak bola. Dapatkan artikel terbaru, highlight, quiz sepak bola dan game seru lainnya di sini.",
	keywords: [
		"olahbola",
		"kuis sepak bola",
		"berita sepak bola",
		"komunitas sepak bola",
		"sepak bola indonesia",
		"quiz bola",
		"artikel sepak bola",
		"leaderboard bola",
	],
	authors: [{ name: "Olahbola" }],
	creator: "Olahbola",
	publisher: "Olahbola",
	metadataBase: new URL("https://www.olahbola.com"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "id_ID",
		url: "https://www.olahbola.com",
		siteName: "Olahbolacom",
		title: "Olahbola | Tempatnya Penggila Bola!",
		description:
			"Olahbola adalah platform terbaik untuk penggemar sepak bola. Dapatkan artikel terbaru, highlight, quiz sepak bola dan game seru lainnya di sini.",
		images: [
			{
				url: "/images/logo/olahbola-logo.png",
				width: 1200,
				height: 630,
				alt: "Olahbola - Tempatnya Penggila Bola!",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		site: "@Olahbolacom",
		creator: "@Olahbolacom",
		title: "Olahbola | Tempatnya Penggila Bola!",
		description:
			"Olahbola adalah platform terbaik untuk penggemar sepak bola. Dapatkan artikel terbaru, highlight, quiz sepak bola dan game seru lainnya di sini.",
		images: ["/images/logo/olahbola-logo.png"],
	},
	icons: {
		icon: "/favicon.png",
		apple: "/favicon.png",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="id"
			className={`${plusJakartaSans.variable} ${firaCode.variable} ${spaceGrotesk.variable} ${lexend.variable} h-full antialiased`}
		>
			<head>
				{/* DNS-prefetch for origins used lazily after initial paint */}
				<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
				<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
				<link rel="dns-prefetch" href="https://cms.olahbola.com" />
				<link rel="dns-prefetch" href="https://api.mainhero.id" />
				<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
				<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

				{/* Lazy-load all secondary fonts via async stylesheet import */}
				<link
					rel="preconnect"
					href="https://fonts.googleapis.com"
				/>
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>

				{/* AdSense SDK — load after hydration for better LCP */}
				<Script
					src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
					strategy="afterInteractive"
					crossOrigin="anonymous"
				/>
			</head>
			<body className="min-h-full flex flex-col">
				<Analytics />

				{/* GTM — lazy on page load, runs after interactive */}
				<Script
					id="gtm-script"
					strategy="lazyOnload"
					src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
				/>

				{/* Google Tag Manager (noscript) */}
				<noscript
					dangerouslySetInnerHTML={{
						__html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
					}}
				/>

				<Providers>{children}</Providers>
				<Toaster
					position="top-right"
					reverseOrder={false}
					gutter={8}
					containerClassName="relative"
					containerStyle={{
						position: "fixed",
						top: "80px",
						zIndex: 9999,
					}}
					toastOptions={{
						duration: 4000,
						success: {
							duration: 3000,
							style: {
								background: "#0D645F",
								color: "#ffffff",
								borderRadius: "12px",
								padding: "16px 24px",
								fontSize: "14px",
								fontWeight: 500,
								boxShadow: "0 4px 20px rgba(13, 100, 95, 0.4)",
							},
							iconTheme: {
								primary: "#22c55e",
								secondary: "#ffffff",
							},
						},
						error: {
							duration: 5000,
							style: {
								background: "#DC2626",
								color: "#ffffff",
								borderRadius: "12px",
								padding: "16px 24px",
								fontSize: "14px",
								fontWeight: 500,
								boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
							},
							iconTheme: {
								primary: "#ffffff",
								secondary: "#DC2626",
							},
						},
						loading: {
							duration: Infinity,
							style: {
								background: "#374151",
								color: "#ffffff",
								borderRadius: "12px",
								padding: "16px 24px",
								fontSize: "14px",
								fontWeight: 500,
							},
						},
					}}
				/>
			</body>
		</html>
	);
}
