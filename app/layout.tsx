import type { Metadata } from "next";
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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta",
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700", "800"],
	style: ["normal", "italic"],
	display: "swap",
});

const firaCode = Fira_Code({
	variable: "--font-fira-code",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
});

const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
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
	metadataBase: new URL("https://olahbola.com"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "id_ID",
		url: "https://olahbola.com",
		siteName: "Olahbolacom",
		title: "Olahbola | Tempatnya Penggila Bola!",
		description:
			"Olahbola adalah platform terbaik untuk penggemar sepak bola. Dapatkan artikel terbaru, highlight, quiz sepak bola dan game seru lainnya di sini.",
		images: [
			{
				url: "/og-image.svg",
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
		images: ["/og-image.svg"],
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
};

// GA4 Configuration Component
function GA4Script() {
	if (!GA_ID) return null;

	return (
		<>
			<script
				async
				src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', '${GA_ID}', {
							page_path: window.location.pathname,
							Send_Page_view: true,
						});
					`,
				}}
			/>
		</>
	);
}

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
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
				/>

				{/* JSON-LD Structured Data */}
				<GlobalSeoScripts />

				{/* Google Analytics (GA4) */}
				<GA4Script />

				{/* Google Tag Manager */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
					new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
					j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
					'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
					})(window,document,'script','dataLayer','GTM-FC96C4T4');`,
					}}
				/>
			</head>
			<body className="min-h-full flex flex-col">
				<Analytics />
				{/* Google Tag Manager (noscript) */}
				<noscript
					dangerouslySetInnerHTML={{
						__html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-FC96C4T4"
					height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
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
						// Default options for all toasts
						duration: 4000,
						// Success style
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
						// Error style
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
						// Loading style
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